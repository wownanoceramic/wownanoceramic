import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getAllOrders } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}

