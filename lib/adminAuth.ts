import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { redis } from '@/lib/redis';

const MAX_FAILS = 10;
const WINDOW_SECONDS = 15 * 60;

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

// Returnează un răspuns de eroare dacă cererea nu e autorizată, altfel null.
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const key = `admin:fails:${ip}`;

  // Dacă Redis nu răspunde, nu blocăm autentificarea — doar sărim limitarea.
  const fails = Number((await redis.get(key).catch(() => 0)) || 0);
  if (fails >= MAX_FAILS) {
    return NextResponse.json({ error: 'Prea multe încercări. Reîncearcă în 15 minute.' }, { status: 429 });
  }

  const pwd = req.headers.get('x-admin-password') || '';
  const envPwd = process.env.ADMIN_PASSWORD || '';
  if (!envPwd || !safeEqual(pwd, envPwd)) {
    await redis.incr(key).then(() => redis.expire(key, WINDOW_SECONDS)).catch(() => {});
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
