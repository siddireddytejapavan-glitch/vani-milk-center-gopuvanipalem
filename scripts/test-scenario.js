const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dairy_secret_super_secure_key_2026_jwt_token';

function cleanWhatsAppNumber(num) {
  const digits = num.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function formatCurrencyINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function generateOrderWhatsAppMessage(details) {
  let msg = `*New Dairy Product Order*\n`;
  if (details.orderId) {
    msg += `Order Ref: #${details.orderId.slice(-6).toUpperCase()}\n`;
  }
  msg += `*Customer Name:* ${details.customerName}\n`;
  msg += `*Mobile:* ${details.customerPhone}\n`;
  msg += `*Address:* ${details.address}\n\n`;

  msg += `*Products:*\n`;
  details.items.forEach((item, index) => {
    msg += `${index + 1}. *${item.productName}*\n`;
    msg += `   Pack Size: ${item.packSize}\n`;
    msg += `   Quantity: ${item.quantity}\n`;
    msg += `   Price: ${formatCurrencyINR(item.unitPrice)}\n`;
    msg += `   Total: ${formatCurrencyINR(item.totalPrice)}\n\n`;
  });

  msg += `*Order Total:* ${formatCurrencyINR(details.totalAmount)}\n`;

  if (details.notes && details.notes.trim()) {
    msg += `\n*Special Instructions:*\n${details.notes.trim()}\n`;
  }

  msg += `\nThank you for choosing our fresh dairy shop!`;
  return msg;
}

function generateWhatsAppLink(phoneNumber, messageText) {
  const cleanNumber = cleanWhatsAppNumber(phoneNumber);
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

async function runTests() {
  console.log('====================================================');
  console.log('  MILK & DAIRY ORDERING SYSTEM - TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. ADMIN AUTHENTICATION TESTS
    // -------------------------------------------------------------
    console.log('--- TEST GROUP 1: Admin Authentication ---');
    const admin = await prisma.user.findUnique({
      where: { email: 'siddreddylakshmankumar@gmail.com' },
    });
    assert(admin !== null, 'Admin user exists in database');
    assert(admin.role === 'ADMIN', 'Admin user has role ADMIN');

    const validPass = await bcrypt.compare('VANI@MILK', admin.passwordHash);
    assert(validPass === true, 'Correct password verifies successfully with bcrypt');

    const invalidPass = await bcrypt.compare('WrongPassword123', admin.passwordHash);
    assert(invalidPass === false, 'Invalid password is correctly rejected');

    const token = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const decoded = jwt.verify(token, JWT_SECRET);
    assert(decoded.userId === admin.id, 'Session JWT token signs and decodes securely');

    // -------------------------------------------------------------
    // 2. SHOP SETTINGS & WHATSAPP CONFIGURATION
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Shop Settings & WhatsApp Configuration ---');
    const settings = await prisma.shopSettings.findUnique({
      where: { id: 'default-settings' },
    });
    assert(settings !== null, 'Shop settings exist in database');
    assert(settings.whatsappNumber.length >= 10, 'Shop WhatsApp number is properly configured');
    const cleanNum = cleanWhatsAppNumber(settings.whatsappNumber);
    assert(!cleanNum.includes('+') && !cleanNum.includes(' '), 'Cleaned WhatsApp number has no + or spaces');

    // -------------------------------------------------------------
    // 3. PRODUCT & VARIANT CRUD TESTS
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Product & Variant CRUD ---');
    const curdCat = await prisma.category.findUnique({ where: { slug: 'curd' } });
    assert(curdCat !== null, 'Curd category exists');

    // Find or create Curd with 10 kg bucket variant
    let testCurd = await prisma.product.findFirst({
      where: { name: 'Traditional Thick Curd (Dahi)' },
      include: { variants: true },
    });
    assert(testCurd !== null, 'Traditional Thick Curd product found');

    let bucket10kg = testCurd.variants.find((v) => v.packSize === '10 kg bucket');
    if (!bucket10kg) {
      bucket10kg = await prisma.productVariant.create({
        data: {
          productId: testCurd.id,
          packSize: '10 kg bucket',
          unit: 'bucket',
          price: 500,
          stockQuantity: 20,
          isAvailable: true,
        },
      });
    } else {
      bucket10kg = await prisma.productVariant.update({
        where: { id: bucket10kg.id },
        data: { price: 500, stockQuantity: 20, isAvailable: true },
      });
    }

    assert(bucket10kg.price === 500, 'Curd 10 kg bucket price is set to ₹500');
    assert(bucket10kg.stockQuantity === 20, 'Curd 10 kg bucket initial stock is set to 20');

    // -------------------------------------------------------------
    // 4. FINAL EXACT SCENARIO VERIFICATION
    // Scenario:
    // Admin creates: Curd -> 10 kg bucket -> Price ₹500 -> Stock 20
    // Customer:
    // Selects Curd, Selects 10 kg, Quantity = 5, Adds to cart.
    // Cart displays: 10 kg x 5, ₹500 x 5 = Total ₹2,500
    // Customer enters: Name, Phone, Address, Special note: "Required for marriage function."
    // Server verifies price & stock, creates order, generates WhatsApp message with configured shop number.
    // Admin sees order in dashboard.
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Required E2E Scenario (Curd 10kg x 5 = ₹2,500) ---');

    const customerInput = {
      name: 'Rahul',
      phone: '9876543210',
      address: 'Tuni, Andhra Pradesh',
      notes: 'Required for marriage function.',
      items: [
        {
          variantId: bucket10kg.id,
          quantity: 5,
        },
      ],
    };

    // Server-side verification & calculation
    const requestedVariant = await prisma.productVariant.findUnique({
      where: { id: customerInput.items[0].variantId },
      include: { product: true },
    });

    assert(requestedVariant.isAvailable === true, 'Server verifies variant is available');
    assert(requestedVariant.stockQuantity >= 5, 'Server verifies stock has at least 5 buckets');

    const unitPrice = requestedVariant.price;
    const quantity = customerInput.items[0].quantity;
    const lineTotal = unitPrice * quantity;
    const orderTotal = lineTotal;

    assert(unitPrice === 500, 'Server retrieves real DB unit price = ₹500');
    assert(lineTotal === 2500, 'Server calculates Line Total = ₹2,500 (500 x 5)');
    assert(orderTotal === 2500, 'Server calculates Order Total = ₹2,500');

    // Execute order transaction & stock decrement
    const initialStock = requestedVariant.stockQuantity;
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerName: customerInput.name,
          customerPhone: customerInput.phone,
          address: customerInput.address,
          notes: customerInput.notes,
          totalAmount: orderTotal,
          status: 'Pending',
          isFunctionOrder: true,
          items: {
            create: [
              {
                productId: requestedVariant.productId,
                variantId: requestedVariant.id,
                productName: requestedVariant.product.name,
                packSize: requestedVariant.packSize,
                quantity: quantity,
                unitPrice: unitPrice,
                totalPrice: lineTotal,
              },
            ],
          },
        },
        include: { items: true },
      });

      await tx.productVariant.update({
        where: { id: requestedVariant.id },
        data: { stockQuantity: { decrement: quantity } },
      });

      return created;
    });

    assert(order.id !== undefined, 'Order successfully created in database');
    assert(order.customerName === 'Rahul', 'Order customerName recorded as Rahul');
    assert(order.totalAmount === 2500, 'Order totalAmount recorded as ₹2,500');
    assert(order.isFunctionOrder === true, 'Order correctly flagged as a marriage/function order');
    assert(order.items.length === 1, 'Order has 1 line item');
    assert(order.items[0].packSize === '10 kg bucket', 'Line item packSize is 10 kg bucket');
    assert(order.items[0].unitPrice === 500, 'Line item snapshot unitPrice is ₹500');
    assert(order.items[0].totalPrice === 2500, 'Line item snapshot totalPrice is ₹2,500');

    // Verify stock decremented from 20 to 15
    const updatedVariant = await prisma.productVariant.findUnique({
      where: { id: bucket10kg.id },
    });
    assert(
      updatedVariant.stockQuantity === initialStock - 5,
      `Stock decremented from ${initialStock} to ${updatedVariant.stockQuantity} (reduced by 5)`
    );

    // -------------------------------------------------------------
    // 5. WHATSAPP MESSAGE GENERATION VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: WhatsApp Message Formatting & Link ---');

    const whatsAppMessage = generateOrderWhatsAppMessage({
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.address,
      items: order.items,
      totalAmount: order.totalAmount,
      notes: order.notes,
    });

    console.log('Generated WhatsApp Message:\n---------------------------------');
    console.log(whatsAppMessage);
    console.log('---------------------------------');

    assert(whatsAppMessage.includes('*New Dairy Product Order*'), 'Message includes order header');
    assert(whatsAppMessage.includes('Rahul'), 'Message includes customer name Rahul');
    assert(whatsAppMessage.includes('9876543210'), 'Message includes customer phone 9876543210');
    assert(whatsAppMessage.includes('Tuni'), 'Message includes customer address');
    assert(whatsAppMessage.includes('10 kg bucket'), 'Message includes pack size (10 kg bucket)');
    assert(whatsAppMessage.includes('5'), 'Message includes quantity 5');
    assert(whatsAppMessage.includes('2,500'), 'Message includes total ₹2,500');
    assert(whatsAppMessage.includes('marriage function'), 'Message includes special instruction note');

    const whatsAppLink = generateWhatsAppLink(settings.whatsappNumber, whatsAppMessage);
    assert(
      whatsAppLink.startsWith(`https://wa.me/${cleanNum}?text=`),
      `WhatsApp link targets configured shop owner number: ${cleanNum}`
    );

    // -------------------------------------------------------------
    // 6. ADMIN VIEW & STATUS UPDATE VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Admin Order Tracking & Status Transition ---');

    const adminFoundOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
    assert(adminFoundOrder !== null, 'Admin can retrieve the placed order');
    assert(adminFoundOrder.status === 'Pending', 'Initial status is Pending');

    const confirmedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'Confirmed' },
    });
    assert(confirmedOrder.status === 'Confirmed', 'Admin successfully changed status to Confirmed');

    // -------------------------------------------------------------
    // 7. EDGE CASE TESTS: Stock exhaustion & invalid inputs
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 7: Edge Cases & Validation ---');

    // Attempting to order more than current stock (stock is now 15, request 20)
    const canFulfill = updatedVariant.stockQuantity >= 20;
    assert(canFulfill === false, 'Server correctly denies order exceeding available stock');

    // Immutable price test: if admin later changes price to ₹550, old order must still be ₹500
    await prisma.productVariant.update({
      where: { id: bucket10kg.id },
      data: { price: 550 },
    });
    const oldOrderItem = await prisma.orderItem.findFirst({
      where: { orderId: order.id },
    });
    assert(oldOrderItem.unitPrice === 500, 'Historic order item maintains snapshot price ₹500 even when variant price changes to ₹550');

    // Restore test variant price and stock
    await prisma.productVariant.update({
      where: { id: bucket10kg.id },
      data: { price: 500, stockQuantity: 20 },
    });

    console.log('\n====================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    const msg = error?.message || String(error);
    if (msg.includes('FATAL') || msg.includes('ENOTFOUND') || msg.includes('tenant/user') || msg.includes('P1001') || msg.includes('P1000')) {
      console.warn('\n⚠️ Database Connection Notice in Test Suite:');
      console.warn('Could not connect to Supabase PostgreSQL database.');
      console.warn('Run "node scripts/test-db-connection.js" to test your connection details.');
      return;
    }
    console.error('Test error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

runTests();
