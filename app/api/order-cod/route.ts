import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAWB } from '@/lib/sameday';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, email,
      street, city, county,
      quantity, cashOnDelivery,
      deliveryType,
      lockerId,
      lockerName,
    } = body;

    if (!name || !phone || !email || !quantity || !cashOnDelivery) {
      return NextResponse.json({ error: 'Câmpuri lipsă.' }, { status: 400 });
    }

    const adresaLivrareText = deliveryType === 'easybox'
      ? `EasyBox: ${lockerName || `Locker #${lockerId}`}`
      : `${street}, ${city}, ${county}`;

    // ── 1. AWB Sameday ────────────────────────────────────────────────────────
    let awbNumber = '';
    let awbError = '';
    try {
      const awbResult = await createAWB({
        name, phone, email,
        street: deliveryType === 'easybox' ? '' : street,
        city, county,
        cashOnDelivery: parseFloat(cashOnDelivery),
        quantity: parseInt(quantity),
        observation: `WOW NanoCeramic x${quantity} - Ramburs`,
        deliveryType: deliveryType || 'curier',
        lockerId: lockerId ? parseInt(lockerId) : undefined,
      });
      awbNumber = awbResult.awb;
    } catch (err: any) {
      console.error('Sameday AWB error:', err.message);
      awbError = err.message;
    }

    // ── 2. Email Admin ────────────────────────────────────────────────────────
    await resend.emails.send({
      from: 'comenzi@wownanoceramic.ro',
      to: 'contact@wownanoceramic.ro',
      subject: `🛒 Comandă nouă ramburs - ${name} - ${cashOnDelivery} RON${awbNumber ? ` | AWB: ${awbNumber}` : ''}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C9A020">🛒 Comandă Nouă Ramburs</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Produs</td>
                <td style="padding:8px;border:1px solid #eee">WOW NanoCeramic x${quantity}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Total</td>
                <td style="padding:8px;border:1px solid #eee;color:#C9A020;font-weight:bold">${cashOnDelivery} RON</td></tr>
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
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">AWB Sameday</td>
                <td style="padding:8px;border:1px solid #eee;font-weight:bold;color:${awbNumber ? '#2e7d32' : '#c62828'}">
                  ${awbNumber ? `✅ ${awbNumber}` : `❌ ${awbError || 'Indisponibil momentan'}`}
                </td></tr>
          </table>
          ${awbNumber ? `<p style="margin-top:16px"><a href="https://sameday.ro/track?awb=${awbNumber}" style="color:#C9A020">🔗 Tracking AWB</a></p>` : ''}
        </div>
      `,
    });

    // ── 3. Email Client ───────────────────────────────────────────────────────
    await resend.emails.send({
      from: 'comenzi@wownanoceramic.ro',
      to: email,
      subject: 'Confirmare comandă WOW NanoCeramic',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C9A020">✅ Comanda ta a fost plasată!</h2>
          <p>Bună ${name},</p>
          <p>Îți mulțumim pentru comandă! Am primit comanda ta și o vom procesa în cel mai scurt timp.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Produs</td>
                <td style="padding:8px;border:1px solid #eee">WOW NanoCeramic x${quantity}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Total de plătit</td>
                <td style="padding:8px;border:1px solid #eee;color:#C9A020;font-weight:bold">${cashOnDelivery} RON (ramburs)</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Livrare</td>
                <td style="padding:8px;border:1px solid #eee">${deliveryType === 'easybox' ? '📦 EasyBox' : '🚚 Curier la ușă'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Adresă livrare</td>
                <td style="padding:8px;border:1px solid #eee">${adresaLivrareText}</td></tr>
            ${awbNumber ? `<tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">AWB / Tracking</td>
                <td style="padding:8px;border:1px solid #eee"><a href="https://sameday.ro/track?awb=${awbNumber}" style="color:#C9A020">${awbNumber}</a></td></tr>` : ''}
          </table>
          <p>Livrare estimată: <strong>1-2 zile lucrătoare</strong></p>
          <p>Pentru orice întrebări: <a href="mailto:contact@wownanoceramic.ro">contact@wownanoceramic.ro</a> sau 0771 181 151</p>
          <p style="color:#888;font-size:12px">SC STAR WOW S.R.L.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, awb: awbNumber });
  } catch (error: any) {
    console.error('Order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
