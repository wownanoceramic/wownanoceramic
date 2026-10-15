// Sursa unică de adevăr pentru prețuri — serverul nu acceptă niciodată prețul de la client.
export const BUNDLE_PRICES: Record<number, number> = { 1: 99, 2: 198, 3: 276, 4: 360 };
export const TRANSPORT_CURIER = 18.99;
export const TRANSPORT_EASYBOX = 16.99;

export function parseQuantity(raw: unknown): number | null {
  const qty = Number(raw);
  return Number.isInteger(qty) && BUNDLE_PRICES[qty] ? qty : null;
}

export function productPrice(qty: number): number {
  return BUNDLE_PRICES[qty];
}

// Transport plătit doar la ramburs, 1 bucată. Cardul și 2+ bucăți au transport gratuit.
export function transportCost(qty: number, paymentType: 'ramburs' | 'card', deliveryType: 'curier' | 'easybox'): number {
  if (paymentType === 'card' || qty > 1) return 0;
  return deliveryType === 'easybox' ? TRANSPORT_EASYBOX : TRANSPORT_CURIER;
}

export function orderTotal(qty: number, paymentType: 'ramburs' | 'card', deliveryType: 'curier' | 'easybox'): number {
  return Number((productPrice(qty) + transportCost(qty, paymentType, deliveryType)).toFixed(2));
}
