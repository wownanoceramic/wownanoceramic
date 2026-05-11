import { NextRequest, NextResponse } from 'next/server';
import { getEasyboxLockers } from '@/lib/sameday';

export async function GET(req: NextRequest) {
  const county = req.nextUrl.searchParams.get('county');
  if (!county) return NextResponse.json({ error: 'county required' }, { status: 400 });

  try {
    const lockers = await getEasyboxLockers(county);
    return NextResponse.json({ lockers });
  } catch (error: any) {
    console.error('Lockers error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
