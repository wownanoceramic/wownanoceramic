import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { redis } from '@/lib/redis';

const MAX_FAILS = 10;
// Plafon global, indiferent de IP — oprește brute-force-ul distribuit.
const MAX_GLOBAL_FAILS = 50;
const WINDOW_SECONDS = 15 * 60;

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

// Returnează un răspuns de eroare dacă cererea nu e autorizată, altfel null.
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  // Header-e setate de Vercel (nu pot fi falsificate de client); x-forwarded-for doar ca fallback.
  const ip = req.headers.get('x-vercel-forwarded-for')
    || req.headers.get('x-real-ip')
    || req.headers.get('x-forwarded-for')?.split(',').pop()?.trim()
    || 'unknown';
  const key = `admin:fails:${ip}`;
  const globalKey = 'admin:fails:global';

  // Dacă Redis nu răspunde, nu blocăm autentificarea — doar sărim limitarea.
  const [fails, globalFails] = await Promise.all([
    redis.get(key).then(Number).catch(() => 0),
    redis.get(globalKey).then(Number).catch(() => 0),
  ]);
  if ((fails || 0) >= MAX_FAILS || (globalFails || 0) >= MAX_GLOBAL_FAILS) {
    return NextResponse.json({ error: 'Prea multe încercări. Reîncearcă în 15 minute.' }, { status: 429 });
  }

  const pwd = req.headers.get('x-admin-password') || '';
  const envPwd = process.env.ADMIN_PASSWORD || '';
  if (!envPwd || !safeEqual(pwd, envPwd)) {
    for (const k of [key, globalKey]) {
      await redis.incr(k).then(() => redis.expire(k, WINDOW_SECONDS)).catch(() => {});
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
