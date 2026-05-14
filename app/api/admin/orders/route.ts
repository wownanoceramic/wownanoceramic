import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const pwd = req.headers.get('x-admin-password');
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}

