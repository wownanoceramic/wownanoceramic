import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getOrder } from '@/lib/redis';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const pwd = req.nextUrl.searchParams.get('pwd');
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId lipsă' }, { status: 400 });

    const order = await getOrder(orderId);
    if (!order) return NextResponse.json({ error: 'Comanda nu există' }, { status: 404 });
    if (!order.awb) return NextResponse.json({ error: 'AWB nu a fost generat încă' }, { status: 400 });

    const adresaLivrareText = order.deliveryType === 'easybox'
      ? `EasyBox: ${order.lockerName || `Locker #${order.lockerId}`}`
      : `${order.street}, ${order.city}, ${order.county}`;

    await resend.emails.send({
      from: 'comenzi@wownanoceramic.ro',
      to: order.email,
      subject: `📦 Coletul tău WOW NanoCeramic este în drum spre tine! AWB: ${order.awb}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C9A020">📦 Coletul tău a fost expediat!</h2>
          <p>Bună ${order.name},</p>
          <p>Îți retrimitem detaliile de livrare pentru comanda ta.</p>
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
                  <a href="https://sameday.ro/awb-tracking?awb=${order.awb}" style="color:#C9A020">${order.awb}</a>
                </td></tr>
          </table>
          <p style="margin-top:16px">
            <a href="https://sameday.ro/awb-tracking?awb=${order.awb}" style="background:#C9A020;color:#000;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
              📍 Urmărește coletul
            </a>
          </p>
          <p>Livrare estimată: <strong>1-2 zile lucrătoare</strong></p>
          <p>Pentru orice întrebări: <a href="mailto:contact@wownanoceramic.ro">contact@wownanoceramic.ro</a> sau 0771 181 151</p>
          <p style="color:#888;font-size:12px">SC STAR WOW S.R.L.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Resend tracking error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
