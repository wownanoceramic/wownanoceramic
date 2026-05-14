import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getOrder, updateOrder } from '@/lib/redis';
import { createAWB } from '@/lib/sameday';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const pwd = req.headers.get('x-admin-password');
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId lipsă' }, { status: 400 });

    const order = await getOrder(orderId);
    if (!order) return NextResponse.json({ error: 'Comanda nu există' }, { status: 404 });
    if (order.awb) return NextResponse.json({ error: 'AWB deja generat', awb: order.awb }, { status: 400 });

    // ── Generare AWB ──────────────────────────────────────────────────────────
    const awbResult = await createAWB({
      name: order.name,
      phone: order.phone,
      email: order.email,
      street: order.deliveryType === 'easybox' ? '' : order.street,
      city: order.city,
      county: order.county,
      cashOnDelivery: order.type === 'ramburs' ? order.total : 0,
      quantity: order.quantity,
      observation: `WOW NanoCeramic x${order.quantity} - ${order.type === 'ramburs' ? 'Ramburs' : 'Card'}`,
      deliveryType: order.deliveryType,
      lockerId: order.lockerId,
    });

    const awb = awbResult.awb;

    // ── Update Redis ──────────────────────────────────────────────────────────
    await updateOrder(orderId, {
      awb,
      status: order.invoiceNumber ? 'complete' : 'awb_done',
    });

    // ── Email Client cu tracking ──────────────────────────────────────────────
    const adresaLivrareText = order.deliveryType === 'easybox'
      ? `EasyBox: ${order.lockerName || `Locker #${order.lockerId}`}`
      : `${order.street}, ${order.city}, ${order.county}`;

    await resend.emails.send({
      from: 'comenzi@wownanoceramic.ro',
      to: order.email,
      subject: `📦 Comanda ta WOW NanoCeramic este în drum spre tine! AWB: ${awb}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C9A020">📦 Comanda ta a fost expediată!</h2>
          <p>Bună ${order.name},</p>
          <p>Comanda ta a fost preluată de Sameday și este în drum spre tine.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Produs</td>
                <td style="padding:8px;border:1px solid #eee">WOW NanoCeramic x${order.quantity}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Total</td>
                <td style="padding:8px;border:1px solid #eee;color:#C9A020;font-weight:bold">${order.total} RON${order.type === 'ramburs' ? ' (ramburs)' : ' (plătit cu card)'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Livrare</td>
                <td style="padding:8px;border:1px solid #eee">${order.deliveryType === 'easybox' ? '📦 EasyBox' : '🚚 Curier la ușă'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Adresă livrare</td>
                <td style="padding:8px;border:1px solid #eee">${adresaLivrareText}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">AWB Tracking</td>
                <td style="padding:8px;border:1px solid #eee;font-weight:bold">
                  <a href="https://sameday.ro/awb-tracking?awb=${awb}" style="color:#C9A020">${awb}</a>
                </td></tr>
          </table>
          <p style="margin-top:16px">
            <a href="https://sameday.ro/awb-tracking?awb=${awb}" style="background:#C9A020;color:#000;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
              📍 Urmărește coletul
            </a>
          </p>
          <p>Livrare estimată: <strong>1-2 zile lucrătoare</strong></p>
          <p>Pentru orice întrebări: <a href="mailto:contact@wownanoceramic.ro">contact@wownanoceramic.ro</a> sau 0771 181 151</p>
          <p style="color:#888;font-size:12px">SC STAR WOW S.R.L.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, awb });
  } catch (err: any) {
    console.error('Generate AWB error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
