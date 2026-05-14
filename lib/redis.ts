import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface Order {
  id: string;
  type: 'ramburs' | 'card';
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  county: string;
  quantity: number;
  total: number;
  deliveryType: 'curier' | 'easybox';
  lockerId?: number;
  lockerName?: string;
  awb?: string;
  invoiceSeries?: string;
  invoiceNumber?: string;
  invoiceLink?: string;
  status: 'new' | 'awb_done' | 'invoice_done' | 'complete';
}

export async function saveOrder(order: Order) {
  await redis.set(`order:${order.id}`, JSON.stringify(order));
  await redis.lpush('orders', order.id);
}

export async function getOrder(id: string): Promise<Order | null> {
  const raw = await redis.get(`order:${id}`);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw as Order;
}

export async function updateOrder(id: string, fields: Partial<Order>) {
  const order = await getOrder(id);
  if (!order) throw new Error('Order not found');
  const updated = { ...order, ...fields };
  await redis.set(`order:${id}`, JSON.stringify(updated));
  return updated;
}

export async function getAllOrders(): Promise<Order[]> {
  const ids = await redis.lrange('orders', 0, 99);
  if (!ids || ids.length === 0) return [];
  const orders = await Promise.all(ids.map(id => getOrder(id as string)));
  return orders.filter(Boolean) as Order[];
}
