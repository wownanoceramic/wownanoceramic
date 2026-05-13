import { NextResponse } from 'next/server';

export async function GET() {
  const user = process.env.SAMEDAY_API_USERNAME || 'LIPSESTE';
  const pass = process.env.SAMEDAY_API_PASSWORD || 'LIPSESTE';
  return NextResponse.json({
    user,
    passLength: pass.length,
    passLast3: pass.slice(-3),
  });
}