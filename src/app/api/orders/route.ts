import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import {
  generateOrderWhatsAppMessage,
  generateWhatsAppLink,
  cleanWhatsAppNumber,
  generateDeliveryRouteUrl,
  generateLiveLocationMapUrl,
} from '@/lib/whatsapp';
import { findFallbackVariant, getShopSettings } from '@/lib/catalog';
import { getDeliveryInfo, SHOP_LAT_DEFAULT, SHOP_LNG_DEFAULT } from '@/lib/delivery';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      address,
      notes,
      items,
      latitude,
      longitude,
      liveLocationUrl,
    } = body;

    // Validate customer info
    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }

    const cleanPhone = customerPhone?.replace(/\D/g, '') || '';
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    if (!address || !address.trim()) {
      return NextResponse.json(
        { error: 'Please enter your delivery / shop pickup address.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    // SERVER-SIDE PRICE AND STOCK VALIDATION
    const variantIds = items.map((i: any) => i.variantId);
    let dbVariants: any[] = [];
    if (isDatabaseConfigured()) {
      try {
        dbVariants = await prisma.productVariant.findMany({
          where: {
            id: { in: variantIds },
          },
          include: {
            product: true,
          },
        });
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Database query for variants failed, checking catalog defaults:', (e as any)?.message || e);
        }
      }
    }

    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    let calculatedTotal = 0;
    const verifiedOrderItems: Array<{
      variantId: string;
      productId: string;
      productName: string;
      packSize: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const item of items) {
      let dbVariant = variantMap.get(item.variantId);

      // If not in database, check fallback catalog
      if (!dbVariant) {
        const fallback = findFallbackVariant(item.variantId);
        if (fallback) {
          dbVariant = {
            id: fallback.variant.id,
            productId: fallback.product.id,
            packSize: fallback.variant.packSize,
            price: fallback.variant.price,
            stockQuantity: 999,
            isAvailable: true,
            product: {
              id: fallback.product.id,
              name: fallback.product.name,
              isActive: true,
            },
          } as any;
        }
      }

      if (!dbVariant) {
        return NextResponse.json(
          { error: `A product variant in your cart no longer exists.` },
          { status: 400 }
        );
      }

      if (!dbVariant.isAvailable || !dbVariant.product.isActive) {
        return NextResponse.json(
          { error: `"${dbVariant.product.name} (${dbVariant.packSize})" is currently unavailable.` },
          { status: 400 }
        );
      }

      const requestedQty = parseInt(item.quantity, 10);
      if (isNaN(requestedQty) || requestedQty <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for ${dbVariant.product.name}.` },
          { status: 400 }
        );
      }

      if (dbVariant.stockQuantity < requestedQty) {
        return NextResponse.json(
          {
            error: `Not enough stock for "${dbVariant.product.name} (${dbVariant.packSize})". Available: ${dbVariant.stockQuantity}, Requested: ${requestedQty}.`,
          },
          { status: 400 }
        );
      }

      // Exact server-calculated line item total from price
      const lineTotal = dbVariant.price * requestedQty;
      calculatedTotal += lineTotal;

      verifiedOrderItems.push({
        variantId: dbVariant.id,
        productId: dbVariant.productId,
        productName: dbVariant.product.name,
        packSize: dbVariant.packSize,
        quantity: requestedQty,
        unitPrice: dbVariant.price,
        totalPrice: lineTotal,
      });
    }

    // Check if order is a special function order
    const isFunctionOrder = Boolean(
      (notes && notes.toLowerCase().includes('marriage')) ||
        (notes && notes.toLowerCase().includes('function')) ||
        (notes && notes.toLowerCase().includes('event')) ||
        (notes && notes.toLowerCase().includes('party')) ||
        verifiedOrderItems.some((i) =>
          i.packSize.toLowerCase().includes('bucket') ||
          i.packSize.toLowerCase().includes('10 kg') ||
          i.packSize.toLowerCase().includes('20 kg') ||
          i.quantity >= 5
        )
    );

    // Compute shop live location from settings (or use default Gopuvanipalem coords)
    const settings = await getShopSettings();
    const shopLat: number = (settings as any)?.shopLat ?? SHOP_LAT_DEFAULT;
    const shopLng: number = (settings as any)?.shopLng ?? SHOP_LNG_DEFAULT;

    // Compute delivery charge from GPS distance
    const numLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : null;
    const numLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : null;
    const deliveryInfo =
      numLat !== null && numLng !== null
        ? getDeliveryInfo(numLat, numLng, shopLat, shopLng)
        : null;
    const deliveryCharge = deliveryInfo?.deliveryCharge ?? 0;
    const grandTotal = calculatedTotal + deliveryCharge;

    // Create Order and OrderItems in database transaction & decrement stock (with safe fallback)
    let createdOrder: any = null;
    if (isDatabaseConfigured()) {
      try {
        createdOrder = await prisma.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              customerName: customerName.trim(),
              customerPhone: cleanPhone,
              address: address.trim(),
              notes: notes?.trim() || null,
              totalAmount: grandTotal,
              deliveryCharge,
              customerLat: numLat,
              customerLng: numLng,
              shopLat,
              shopLng,
              status: 'Pending',
              isFunctionOrder,
              items: {
                create: verifiedOrderItems.map((vi) => ({
                  productId: vi.productId.startsWith('prod-') ? null : vi.productId,
                  variantId: vi.variantId.startsWith('var-') ? null : vi.variantId,
                  productName: vi.productName,
                  packSize: vi.packSize,
                  quantity: vi.quantity,
                  unitPrice: vi.unitPrice,
                  totalPrice: vi.totalPrice,
                })),
              },
            },
            include: {
              items: true,
            },
          });

          // Reduce stock for ordered variants
          for (const vi of verifiedOrderItems) {
            if (!vi.variantId.startsWith('var-')) {
              try {
                await tx.productVariant.update({
                  where: { id: vi.variantId },
                  data: {
                    stockQuantity: {
                      decrement: vi.quantity,
                    },
                  },
                });
              } catch (stockErr) {
                if (process.env.NODE_ENV !== 'production') {
                  console.warn('Stock decrement skipped for variant:', vi.variantId);
                }
              }
            }
          }

          return order;
        });
      } catch (dbErr) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Database write failed during order creation, using direct order reference:', dbErr);
        }
      }
    }

    if (!createdOrder) {
      createdOrder = {
        id: 'VM' + Math.floor(100000 + Math.random() * 900000).toString(),
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        address: address.trim(),
        notes: notes?.trim() || null,
        totalAmount: grandTotal,
        deliveryCharge,
        customerLat: numLat,
        customerLng: numLng,
        shopLat,
        shopLng,
      };
    }

    // Retrieve shop settings safely for configured WhatsApp number
    const targetWhatsAppNumber = cleanWhatsAppNumber(
      settings?.whatsappNumber || process.env.SHOP_WHATSAPP_NUMBER || '917995597719'
    );

    // Compute live location and delivery boy navigation route from Vani Milk Center
    const origin =
      request.headers.get('origin') ||
      (request.headers.get('host') ? `http://${request.headers.get('host')}` : '');
    const trackingUrl = origin ? `${origin}/track/${createdOrder.id}` : `/track/${createdOrder.id}`;

    const customerLiveMapUrl =
      liveLocationUrl || (numLat && numLng ? generateLiveLocationMapUrl(numLat, numLng) : null);
    const deliveryRouteUrl = generateDeliveryRouteUrl(createdOrder.address, numLat, numLng, shopLat, shopLng);
    const shopLiveMapUrl = `https://maps.google.com/?q=${shopLat},${shopLng}`;

    // Format WhatsApp message with live location, delivery route and delivery charge
    const deliveryChargeNote = deliveryInfo
      ? deliveryInfo.isFreeDelivery
        ? `\n🎁 *Delivery Charge:* FREE (within ${deliveryInfo.distanceKm.toFixed(1)} km of shop)`
        : `\n🚚 *Delivery Charge:* ₹${deliveryCharge} (${deliveryInfo.distanceKm.toFixed(1)} km: 10km free + ${(deliveryInfo.distanceKm - 10).toFixed(1)}km at ₹10 per 15km)`
      : '';

    const whatsAppMessage = generateOrderWhatsAppMessage({
      orderId: createdOrder.id,
      customerName: createdOrder.customerName,
      customerPhone: createdOrder.customerPhone,
      address: createdOrder.address,
      items: verifiedOrderItems,
      totalAmount: grandTotal,
      notes: deliveryChargeNote + (createdOrder.notes ? `\n📝 Notes: ${createdOrder.notes}` : ''),
      latitude: numLat,
      longitude: numLng,
      liveLocationUrl: customerLiveMapUrl,
      deliveryRouteUrl,
      trackingUrl,
    });

    const whatsAppLink = generateWhatsAppLink(targetWhatsAppNumber, whatsAppMessage);

    return NextResponse.json(
      {
        message: 'Order created successfully',
        order: createdOrder,
        whatsAppLink,
        whatsAppMessage,
        shopWhatsAppNumber: targetWhatsAppNumber,
        deliveryRouteUrl,
        liveLocationUrl: customerLiveMapUrl,
        shopLiveMapUrl,
        trackingUrl,
        deliveryCharge,
        deliveryInfo: deliveryInfo
          ? {
              distanceKm: deliveryInfo.distanceKm,
              isFreeDelivery: deliveryInfo.isFreeDelivery,
              label: deliveryInfo.label,
              breakdown: deliveryInfo.breakdown,
            }
          : null,
        subtotal: calculatedTotal,
        grandTotal,
      },
      { status: 201 }
    );
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Checkout error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to process order. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ orders: [] });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isFunctionOnly = searchParams.get('function') === 'true';
    const search = searchParams.get('search');

    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (isFunctionOnly) {
      whereClause.isFunctionOrder = true;
    }
    if (search && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { id: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.warn('Error fetching orders from DB, returning empty list:', (error as any)?.message || error);
    return NextResponse.json({ orders: [] });
  }
}
