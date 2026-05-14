import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { saveOrder } from '@/lib/redis';
import { nanoid } from 'nanoid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'shipping_details'],
    });

    const shipping = fullSession.shipping_details;
    const customer = fullSession.customer_details;
    const metadata = fullSession.metadata || {};

    const name = shipping?.name || customer?.name || 'Client';
    const phone = customer?.phone || metadata.telefon || '';
    const email = customer?.email || '';
    const address = shipping?.address;
    const street = address?.line1 || '';
    const city = address?.city || '';
    const county = address?.state || metadata.judet || '';
    const quantity = parseInt(metadata.quantity || '1');
    const deliveryType = (metadata.deliveryType as 'curier' | 'easybox') || 'curier';
    const lockerId = metadata.lockerId ? parseInt(metadata.lockerId) : undefined;
    const lockerName = metadata.lockerName || '';
    const total = (fullSession.amount_total || 0) / 100;

    const adresaLivrareText = deliveryType === 'easybox'
      ? `EasyBox: ${lockerName || `Locker #${lockerId}`}`
      : `${street}, ${city}, ${county}`;

    // ── 1. Salvare comandă în Redis ───────────────────────────────────────────
    const orderId = nanoid(10);
    try {
      await saveOrder({
        id: orderId,
        type: 'card',
        createdAt: new Date().toISOString(),
        name, phone, email,
        street, city, county,
        quantity,
        total,
        deliveryType,
        lockerId,
        lockerName,
        status: 'new',
      });
    } catch (err: any) {
      console.error('Redis save error:', err.message);
    }

    // ── 2. Email Admin ────────────────────────────────────────────────────────
    try {
      await resend.emails.send({
        from: 'comenzi@wownanoceramic.ro',
        to: 'contact@wownanoceramic.ro',
        subject: `💳 Comandă nouă CARD - ${name} - ${total} RON`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#C9A020">💳 Comandă Nouă Card</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">ID Comandă</td>
                  <td style="padding:8px;border:1px solid #eee;font-family:monospace">${orderId}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Produs</td>
                  <td style="padding:8px;border:1px solid #eee">WOW NanoCeramic x${quantity}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Total</td>
                  <td style="padding:8px;border:1px solid #eee;color:#C9A020;font-weight:bold">${total} RON ✅ Plătit</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Nume</td>
                  <td style="padding:8px;border:1px solid #eee">${name}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Email</td>
                  <td style="padding:8px;border:1px solid #eee">${email}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Telefon</td>
                  <td style="padding:8px;border:1px solid #eee">${phone}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Livrare</td>
                  <td style="padding:8px;border:1px solid #eee">${deliveryType === 'easybox' ? '📦 EasyBox' : '🚚 Curier la ușă'}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Adresă livrare</td>
                  <td style="padding:8px;border:1px solid #eee">${adresaLivrareText}</td></tr>
            </table>
            <p style="margin-top:16px">
              <a href="https://www.wownanoceramic.ro/admin" style="background:#C9A020;color:#000;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
                → Deschide Panoul Admin
              </a>
            </p>
          </div>
        `,
      });
    } catch (err: any) {
      console.error('Resend email error:', err.message);
    }
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: { bodyParser: false },
};
