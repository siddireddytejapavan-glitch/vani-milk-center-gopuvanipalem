/**
 * Delivery Charge Utility — Vani Milk Center, Gopuvanipalem
 *
 * Rules:
 *  - Within 10 km of the shop → FREE delivery (₹0)
 *  - Longer than 10 km → ₹10 per 15 km slab (or part thereof) beyond the 10 km free zone
 *    Examples:
 *      0 - 10.0 km:    ₹0 (FREE)
 *      10.1 - 25.0 km: ₹10 (1st 15 km slab)
 *      25.1 - 40.0 km: ₹20 (2nd 15 km slab)
 *      40.1 - 55.0 km: ₹30 (3rd 15 km slab)
 */

export const SHOP_LAT_DEFAULT = 16.4307; // Gopuvanipalem latitude
export const SHOP_LNG_DEFAULT = 81.1167; // Gopuvanipalem longitude
export const FREE_DELIVERY_KM = 10;       // km radius of free delivery
export const CHARGE_SLAB_KM = 15;         // 15 km per delivery slab beyond 10 km
export const RATE_PER_SLAB = 10;          // ₹10 per 15 km slab beyond 10 km
export const RATE_PER_KM = 10;            // Exported for backward-compatibility

/**
 * Haversine formula — great-circle distance between two GPS points (in km).
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate delivery charge based on distance.
 *  - <= 10 km: Free (₹0)
 *  - > 10 km: ₹10 per 15 km (or portion of 15 km) beyond 10 km
 * @param distanceKm - distance in km between shop and customer
 * @returns delivery charge in ₹
 */
export function calculateDeliveryCharge(distanceKm: number): number {
  if (distanceKm <= FREE_DELIVERY_KM) {
    return 0; // FREE within 10 km
  }
  // Beyond 10 km: ₹10 per 15 km slab (or part thereof)
  const extraKm = distanceKm - FREE_DELIVERY_KM;
  const slabs = Math.ceil(extraKm / CHARGE_SLAB_KM);
  return Math.max(1, slabs) * RATE_PER_SLAB;
}

/**
 * Full delivery info given customer GPS coordinates and shop GPS coordinates.
 */
export function getDeliveryInfo(
  customerLat: number,
  customerLng: number,
  shopLat: number = SHOP_LAT_DEFAULT,
  shopLng: number = SHOP_LNG_DEFAULT
): {
  distanceKm: number;
  deliveryCharge: number;
  isFreeDelivery: boolean;
  label: string;
  breakdown: string;
} {
  const distanceKm = haversineDistanceKm(shopLat, shopLng, customerLat, customerLng);
  const deliveryCharge = calculateDeliveryCharge(distanceKm);
  const isFreeDelivery = deliveryCharge === 0;

  let label: string;
  let breakdown: string;
  if (isFreeDelivery) {
    label = `Free Delivery (${distanceKm.toFixed(1)} km from shop)`;
    breakdown = `Within 10 km of shop — Free Delivery`;
  } else {
    const extraKm = (distanceKm - FREE_DELIVERY_KM).toFixed(1);
    const slabs = Math.ceil((distanceKm - FREE_DELIVERY_KM) / CHARGE_SLAB_KM);
    label = `₹${deliveryCharge} (${distanceKm.toFixed(1)} km: 10km free + ${extraKm}km at ₹10/15km)`;
    breakdown = `10 km free + ${extraKm} km extra (${slabs} × ₹10 per 15 km)`;
  }

  return { distanceKm, deliveryCharge, isFreeDelivery, label, breakdown };
}
