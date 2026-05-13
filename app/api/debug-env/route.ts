import { NextResponse } from 'next/server';

export async function GET() {
  const user = process.env.SAMEDAY_API_USERNAME!;
  const pass = process.env.SAMEDAY_API_PASSWORD!;

  // Step 1: Auth
  const authRes = await fetch('https://api.sameday.ro/api/authenticate', {
    method: 'POST',
    headers: { 'X-AUTH-USERNAME': user, 'X-AUTH-PASSWORD': pass },
  });
  const authData = await authRes.json();
  const rawToken = authData.token;

  // Step 2: Testam servicii cu fiecare format de token
  const results: any = {};
  for (const fmt of [rawToken, `Bearer ${rawToken}`]) {
    const res = await fetch('https://api.sameday.ro/api/client/services', {
      headers: { Authorization: fmt },
    });
    const data = await res.json();
    results[fmt.substring(0, 10)] = { status: res.status, ok: !!data.data };
  }

  return NextResponse.json({ token: rawToken.substring(0, 10) + '...', results });
}