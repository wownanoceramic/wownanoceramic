import { NextResponse } from 'next/server';

export async function GET() {
  const user = process.env.SAMEDAY_API_USERNAME!;
  const pass = process.env.SAMEDAY_API_PASSWORD!;

  const authRes = await fetch('https://api.sameday.ro/api/authenticate', {
    method: 'POST',
    headers: { 'X-AUTH-USERNAME': user, 'X-AUTH-PASSWORD': pass },
  });
  const authData = await authRes.json();
  const token = authData.token;

  const results: any = {};

  // Testam X-AUTH-TOKEN
  for (const [key, val] of [
    ['Authorization', token],
    ['Authorization', `Bearer ${token}`],
    ['X-AUTH-TOKEN', token],
    ['X-AUTH-TOKEN', `Bearer ${token}`],
  ] as [string, string][]) {
    const res = await fetch('https://api.sameday.ro/api/client/services', {
      headers: { [key]: val },
    });
    const data = await res.json();
    results[`${key}: ${val.substring(0, 8)}...`] = { status: res.status, ok: !!data.data };
  }

  return NextResponse.json({ results });
}