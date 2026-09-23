export interface OrderItemFormat {
  productName: string;
  packSize: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const SHOP_ORIGIN_ADDRESS = '659J+CX2 Vani milk, Gopuvanipalem, Andhra Pradesh 521002';
export const SHOP_ORIGIN_QUERY = '659J%2BCX2+Vani+milk%2C+Gopuvanipalem%2C+Andhra+Pradesh+521002';

export interface OrderWhatsAppDetails {
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItemFormat[];
  totalAmount: number;
  notes?: string | null;
  orderId?: string;
  latitude?: number | null;
  longitude?: number | null;
  liveLocationUrl?: string | null;
  deliveryRouteUrl?: string | null;
}

export function cleanWhatsAppNumber(num: string): string {
  // Strip all non-numeric characters
  const digits = num.replace(/\D/g, '');
  // If user enters 10 digits e.g. 9876543210 in India, prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateLiveLocationMapUrl(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export function generateDeliveryRouteUrl(
  destinationAddress: string,
  lat?: number | null,
  lng?: number | null
): string {
  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
    return `https://www.google.com/maps/dir/?api=1&origin=${SHOP_ORIGIN_QUERY}&destination=${lat},${lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&origin=${SHOP_ORIGIN_QUERY}&destination=${encodeURIComponent(
    destinationAddress || 'Gopuvanipalem'
  )}`;
}

export function generateDeliveryBoyDispatchMessage(details: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  totalAmount: number;
  items: OrderItemFormat[];
  deliveryRouteUrl: string;
  liveLocationUrl?: string | null;
  notes?: string | null;
  deliveryPortalUrl?: string;
}): string {
  let msg = `🛵 *DELIVERY DISPATCH — VANI MILK CENTER*\n`;
  msg += `Order Ref: #${details.orderId.slice(-6).toUpperCase()}\n`;
  msg += `---------------------------------\n`;
  msg += `👤 *Customer:* ${details.customerName}\n`;
  msg += `📞 *Mobile:* ${details.customerPhone}\n`;
  msg += `🏠 *Delivery Address:* ${details.address}\n\n`;

  if (details.liveLocationUrl) {
    msg += `📍 *Customer Live GPS Pin:* ${details.liveLocationUrl}\n\n`;
  }

  msg += `🗺️ *Turn-by-turn Navigation Route:*\n${details.deliveryRouteUrl}\n\n`;

  msg += `📦 *Items to Deliver:*\n`;
  details.items.forEach((item, i) => {
    msg += `${i + 1}. ${item.productName} (${item.packSize}) x ${item.quantity}\n`;
  });

  msg += `\n💰 *Collect Amount:* ${formatCurrencyINR(details.totalAmount)}\n`;

  if (details.notes && details.notes.trim()) {
    msg += `📝 *Notes:* ${details.notes.trim()}\n`;
  }

  if (details.deliveryPortalUrl) {
    msg += `\n✅ *Confirm Delivery in Platform:*\n${details.deliveryPortalUrl}\n`;
  }

  msg += `\n*Start delivery navigation from Vani Milk Center, Gopuvanipalem!*`;
  return msg;
}

export function generateDeliveryCompletionMessage(details: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  totalAmount: number;
  deliveredAt?: string;
  deliveryNotes?: string;
  deliveryPersonName?: string;
}): string {
  let msg = `✅ *ORDER DELIVERED — VANI MILK CENTER*\n`;
  msg += `---------------------------------\n`;
  msg += `Order Ref: #${details.orderId.slice(-6).toUpperCase()}\n`;
  msg += `👤 *Customer:* ${details.customerName}\n`;
  msg += `📞 *Phone:* ${details.customerPhone}\n`;
  msg += `🏠 *Address:* ${details.address}\n`;
  msg += `💰 *Amount Collected:* ${formatCurrencyINR(details.totalAmount)}\n`;
  msg += `📦 *Status:* Delivered Successfully 🎉\n`;
  msg += `⏰ *Delivered At:* ${details.deliveredAt || new Date().toLocaleString('en-IN')}\n`;
  if (details.deliveryPersonName) {
    msg += `🛵 *Delivered By:* ${details.deliveryPersonName}\n`;
  }
  if (details.deliveryNotes && details.deliveryNotes.trim()) {
    msg += `📝 *Delivery Note:* ${details.deliveryNotes.trim()}\n`;
  }
  msg += `\n*Order status updated to Delivered in platform.*`;
  return msg;
}

export function generateOrderWhatsAppMessage(details: OrderWhatsAppDetails): string {
  let msg = `*New Dairy Product Order*\n`;
  if (details.orderId) {
    msg += `Order Ref: #${details.orderId.slice(-6).toUpperCase()}\n`;
  }
  msg += `*Customer Name:* ${details.customerName}\n`;
  msg += `*Mobile:* ${details.customerPhone}\n`;
  msg += `*Address:* ${details.address}\n\n`;

  // Include customer live GPS location if captured
  const liveLocation =
    details.liveLocationUrl ||
    (typeof details.latitude === 'number' && typeof details.longitude === 'number'
      ? generateLiveLocationMapUrl(details.latitude, details.longitude)
      : null);

  if (liveLocation) {
    msg += `📍 *Customer Live GPS Pin:* ${liveLocation}\n`;
  }

  // Include delivery boy navigation route from Vani Milk Center (Gopuvanipalem)
  const routeUrl =
    details.deliveryRouteUrl ||
    generateDeliveryRouteUrl(details.address, details.latitude, details.longitude);
  msg += `🛵 *Delivery Boy Navigation Route:*\n${routeUrl}\n\n`;

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

export function generateWhatsAppLink(
  phoneNumber: string,
  messageText: string
): string {
  const cleanNumber = cleanWhatsAppNumber(phoneNumber);
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

export function generateEnquiryWhatsAppLink(phoneNumber: string): string {
  const cleanNumber = cleanWhatsAppNumber(phoneNumber);
  const message = 'Hello, I would like to enquire about your dairy products.';
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
