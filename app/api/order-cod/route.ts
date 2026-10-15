import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { saveOrder } from '@/lib/redis';
import { nanoid } from 'nanoid';
import { esc } from '@/lib/html';
import { parseQuantity, orderTotal } from '@/lib/pricing';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      street, city, county,
      quantity,
      lockerId,
      lockerName,
    } = body;
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const deliveryType: 'curier' | 'easybox' = body.deliveryType === 'easybox' ? 'easybox' : 'curier';

    const qty = parseQuantity(quantity);
    if (!name || !phone || !qty) {
      return NextResponse.json({ error: 'Câmpuri lipsă.' }, { status: 400 });
    }
    if (!/^(\+40|0040|40|0)[237]\d{8}$/.test(phone.replace(/[\s.-]/g, ''))) {
      return NextResponse.json({ error: 'Număr de telefon invalid. Exemplu: 07xx xxx xxx' }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresă de email invalidă.' }, { status: 400 });
    }
    if (deliveryType === 'curier' && (!street || !city || !county)) {
      return NextResponse.json({ error: 'Completează adresa completă.' }, { status: 400 });
    }
    if (deliveryType === 'easybox' && !lockerId) {
      return NextResponse.json({ error: 'Selectează un punct EasyBox.' }, { status: 400 });
    }

    // Totalul se calculează pe server — nu folosim suma trimisă de browser.
    const cashOnDelivery = orderTotal(qty, 'ramburs', deliveryType);

    const adresaLivrareText = deliveryType === 'easybox'
      ? `EasyBox: ${lockerName || `Locker #${lockerId}`}`
      : `${street}, ${city}, ${county}`;

    // ── 1. Salvare comandă în Redis ───────────────────────────────────────────
    const orderId = nanoid(10);
    await saveOrder({
      id: orderId,
      type: 'ramburs',
      createdAt: new Date().toISOString(),
      name,
      phone,
      email,
      street: street || '',
      city: city || '',
      county: county || '',
      quantity: qty,
      total: cashOnDelivery,
      deliveryType,
      lockerId: lockerId ? parseInt(lockerId) : undefined,
      lockerName: lockerName || '',
      status: 'new',
    });

    // ── 2. Email Admin ────────────────────────────────────────────────────────
    await resend.emails.send({
      from: 'comenzi@wownanoceramic.ro',
      to: 'contact@wownanoceramic.ro',
      subject: `🛒 Comandă nouă RAMBURS - ${name} - ${cashOnDelivery} RON`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C9A020">🛒 Comandă Nouă Ramburs</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">ID Comandă</td>
                <td style="padding:8px;border:1px solid #eee;font-family:monospace">${orderId}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Produs</td>
                <td style="padding:8px;border:1px solid #eee">WOW NanoCeramic x${qty}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Total</td>
                <td style="padding:8px;border:1px solid #eee;color:#C9A020;font-weight:bold">${cashOnDelivery} RON</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Nume</td>
                <td style="padding:8px;border:1px solid #eee">${esc(name)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Email</td>
                <td style="padding:8px;border:1px solid #eee">${esc(email)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Telefon</td>
                <td style="padding:8px;border:1px solid #eee">${esc(phone)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Livrare</td>
                <td style="padding:8px;border:1px solid #eee">${deliveryType === 'easybox' ? '📦 EasyBox' : '🚚 Curier la ușă'}</td></tr>
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

    // ── 3. Email Client — confirmare plasare comandă (doar dacă a fost completat email) ──
    if (email) {
      await resend.emails.send({
      from: 'comenzi@wownanoceramic.ro',
      to: email,
      subject: 'Confirmare comandă WOW NanoCeramic',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C9A020">✅ Comanda ta a fost plasată!</h2>
          <p>Bună ${esc(name)},</p>
          <p>Îți mulțumim pentru comandă! Am primit comanda ta și o vom procesa în cel mai scurt timp.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Produs</td>
                <td style="padding:8px;border:1px solid #eee">WOW NanoCeramic x${qty}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Total de plătit</td>
                <td style="padding:8px;border:1px solid #eee;color:#C9A020;font-weight:bold">${cashOnDelivery} RON (ramburs)</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Livrare</td>
                <td style="padding:8px;border:1px solid #eee">${deliveryType === 'easybox' ? '📦 EasyBox' : '🚚 Curier la ușă'}</td></tr>
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
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Eroare la plasarea comenzii. Sună-ne la 0771 181 151.' }, { status: 500 });
  }
}
