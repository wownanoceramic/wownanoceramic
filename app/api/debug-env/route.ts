import { NextResponse } from 'next/server';

export async function GET() {
  const user = process.env.SAMEDAY_API_USERNAME!;
  const pass = process.env.SAMEDAY_API_PASSWORD!;

  const authRes = await fetch('https://api.sameday.ro/api/authenticate', {
    method: 'POST',
    headers: { 'X-AUTH-USERNAME': user, 'X-AUTH-PASSWORD': pass },
  });
  const { token } = await authRes.json();

  const [servicesRes, pickupRes] = await Promise.all([
    fetch('https://api.sameday.ro/api/client/services', {
      headers: { 'X-AUTH-TOKEN': token },
    }),
    fetch('https://api.sameday.ro/api/client/pickup-points', {
      headers: { 'X-AUTH-TOKEN': token },
    }),
  ]);

  const services = await servicesRes.json();
  const pickups = await pickupRes.json();

  return NextResponse.json({ services: services.data, pickups: pickups.data });
}