import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nume, prenume, email, telefon, adresa, localitate, judet, tara,
            numeSocietate, codFiscal, altaAdresa, sNume, sPrenume, sAdresa,
            sLocalitate, sJudet, sTara, quantity, price } = body;

    const numeComplet = `${nume} ${prenume}`;
    const adresaLivrare = altaAdresa
      ? `${sNume} ${sPrenume}, ${sAdresa}, ${sLocalitate}, ${sJudet}, ${sTara}`
      : `${adresa}, ${localitate}, ${judet}, ${tara}`;

    // Email catre tine
    await resend.emails.send({
      from: 'comenzi@wownanoceramic.ro',
      to: 'contact@wownanoceramic.ro',
      subject: `🛒 Comandă nouă ramburs - ${numeComplet} - ${price} RON`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C9A020">🛒 Comandă Nouă Ramburs</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Produs</td>
                <td style="padding:8px;border:1px solid #eee">WOW NanoCeramic x${quantity}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Total</td>
                <td style="padding:8px;border:1px solid #eee;color:#C9A020;font-weight:bold">${price} RON</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Nume</td>
                <td style="padding:8px;border:1px solid #eee">${numeComplet}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Email</td>
                <td style="padding:8px;border:1px solid #eee">${email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Telefon</td>
                <td style="padding:8px;border:1px solid #eee">${telefon}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Adresă livrare</td>
                <td style="padding:8px;border:1px solid #eee">${adresaLivrare}</td></tr>
            ${numeSocietate ? `<tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Societate</td>
                <td style="padding:8px;border:1px solid #eee">${numeSocietate} ${codFiscal ? `(${codFiscal})` : ''}</td></tr>` : ''}
          </table>
        </div>
      `
    });

    // Email confirmare catre client
    await resend.emails.send({
      from: 'comenzi@wownanoceramic.ro',
      to: email,
      subject: 'Confirmare comandă WOW NanoCeramic',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C9A020">✅ Comanda ta a fost plasată!</h2>
          <p>Bună ${nume},</p>
          <p>Îți mulțumim pentru comandă! Am primit comanda ta și o vom procesa în cel mai scurt timp.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Produs</td>
                <td style="padding:8px;border:1px solid #eee">WOW NanoCeramic x${quantity}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Total de plătit</td>
                <td style="padding:8px;border:1px solid #eee;color:#C9A020;font-weight:bold">${price} RON (ramburs)</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Adresă livrare</td>
                <td style="padding:8px;border:1px solid #eee">${adresaLivrare}</td></tr>
          </table>
          <p>Livrare estimată: <strong>1-2 zile lucrătoare</strong></p>
          <p>Pentru orice întrebări: <a href="mailto:contact@wownanoceramic.ro">contact@wownanoceramic.ro</a> sau 0771 181 151</p>
          <p style="color:#888;font-size:12px">SC STAR WOW S.R.L.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}