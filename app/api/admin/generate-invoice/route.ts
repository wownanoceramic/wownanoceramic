import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getOrder, updateOrder } from '@/lib/redis';
import { createInvoice } from '@/lib/oblio';

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
    if (order.invoiceNumber) return NextResponse.json({ error: 'Factură deja emisă', invoice: order.invoiceNumber }, { status: 400 });

    // ── Emitere factură Oblio ─────────────────────────────────────────────────
    const unitPrice = Number((order.total / order.quantity).toFixed(2));
    const invoice = await createInvoice({
      name: order.name,
      email: order.email,
      phone: order.phone,
      address: order.street || order.city,
      city: order.city,
      county: order.county,
      quantity: order.quantity,
      unitPrice,
      totalAmount: order.total,
    });

    // ── Update Redis ──────────────────────────────────────────────────────────
    await updateOrder(orderId, {
      invoiceSeries: invoice.seriesName,
      invoiceNumber: invoice.number,
      invoiceLink: invoice.link,
      status: order.awb ? 'complete' : 'invoice_done',
    });

    // ── Email Client cu factura ───────────────────────────────────────────────
    await resend.emails.send({
      from: 'comenzi@wownanoceramic.ro',
      to: order.email,
      subject: `🧾 Factura ta WOW NanoCeramic - ${invoice.seriesName} ${invoice.number}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C9A020">🧾 Factura ta fiscală</h2>
          <p>Bună ${order.name},</p>
          <p>Îți trimitem factura fiscală pentru comanda ta.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Produs</td>
                <td style="padding:8px;border:1px solid #eee">WOW NanoCeramic x${order.quantity}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Total</td>
                <td style="padding:8px;border:1px solid #eee;color:#C9A020;font-weight:bold">${order.total} RON</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Factură</td>
                <td style="padding:8px;border:1px solid #eee;font-weight:bold">${invoice.seriesName} ${invoice.number}</td></tr>
          </table>
          ${invoice.link ? `
          <p style="margin-top:16px">
            <a href="${invoice.link}" style="background:#C9A020;color:#000;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
              📄 Descarcă Factura
            </a>
          </p>` : ''}
          <p>Pentru orice întrebări: <a href="mailto:contact@wownanoceramic.ro">contact@wownanoceramic.ro</a> sau 0771 181 151</p>
          <p style="color:#888;font-size:12px">SC STAR WOW S.R.L.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, invoice: `${invoice.seriesName} ${invoice.number}` });
  } catch (err: any) {
    console.error('Generate Invoice error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
