import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { saveOrder, claimStripeSession, releaseStripeSession } from '@/lib/redis';
import { esc } from '@/lib/html';
import { nanoid } from 'nanoid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

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

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true });
  }

  // ── Idempotență: Stripe retrimite evenimentul la erori/timeout ─────────────
  if (!(await claimStripeSession(session.id))) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const shipping = session.shipping_details;
  const customer = session.customer_details;
  const metadata = session.metadata || {};

  const name = shipping?.name || customer?.name || 'Client';
  const phone = customer?.phone || '';
  const email = customer?.email || '';
  const address = shipping?.address || customer?.address;
  const street = [address?.line1, address?.line2].filter(Boolean).join(', ');
  const city = address?.city || '';
  const county = address?.state || '';
  const quantity = parseInt(metadata.quantity || '1');
  const total = (session.amount_total || 0) / 100;
  const adresaLivrareText = `${street}, ${city}, ${county}`;

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
      deliveryType: 'curier',
      status: 'new',
    });
  } catch (err: any) {
    // Eliberăm sesiunea ca retry-ul Stripe să poată salva comanda.
    console.error('Redis save error:', err.message);
    await releaseStripeSession(session.id).catch(() => {});
    return NextResponse.json({ error: 'save failed' }, { status: 500 });
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
                <td style="padding:8px;border:1px solid #eee">${esc(name)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Email</td>
                <td style="padding:8px;border:1px solid #eee">${esc(email)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Telefon</td>
                <td style="padding:8px;border:1px solid #eee">${esc(phone)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Livrare</td>
                <td style="padding:8px;border:1px solid #eee">🚚 Curier la ușă</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Adresă livrare</td>
                <td style="padding:8px;border:1px solid #eee">${esc(adresaLivrareText)}</td></tr>
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

  // ── 3. Email Client — confirmare comandă ──────────────────────────────────
  if (email) {
    try {
      await resend.emails.send({
        from: 'comenzi@wownanoceramic.ro',
        to: email,
        subject: 'Confirmare comandă WOW NanoCeramic',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#C9A020">✅ Plata a fost confirmată!</h2>
            <p>Bună ${esc(name)},</p>
            <p>Îți mulțumim pentru comandă! Am primit plata și o vom procesa în cel mai scurt timp.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Produs</td>
                  <td style="padding:8px;border:1px solid #eee">WOW NanoCeramic x${quantity}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Total plătit</td>
                  <td style="padding:8px;border:1px solid #eee;color:#C9A020;font-weight:bold">${total} RON (card)</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Adresă livrare</td>
                  <td style="padding:8px;border:1px solid #eee">${esc(adresaLivrareText)}</td></tr>
            </table>
            <p>Livrare estimată: <strong>1-2 zile lucrătoare</strong></p>
            <p>Vei primi numărul AWB de tracking imediat după procesare.</p>
            <p>Pentru orice întrebări: <a href="mailto:contact@wownanoceramic.ro">contact@wownanoceramic.ro</a> sau 0771 181 151</p>
            <p style="color:#888;font-size:12px">STAR WOW S.R.L.</p>
          </div>
        `,
      });
    } catch (err: any) {
      console.error('Resend client email error:', err.message);
    }
  }

  return NextResponse.json({ received: true });
}
