import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { quantity, name, phone, address } = await req.json();
    
    // Aici vom adăuga Sameday + Oblio mai târziu
    console.log('Comanda ramburs:', { quantity, name, phone, address });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}