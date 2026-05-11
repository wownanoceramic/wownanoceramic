import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAWB } from '@/lib/sameday';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nume, prenume, email, telefon, adresa, localitate, judet, tara,
      numeSocietate, codFiscal, altaAdresa,
      sNume, sPrenume, sAdresa, sLocalitate, sJudet, sTara,
      quantity, price,
      deliveryType,   // 'curier' | 'easybox'
      lockerId,       // number | undefined (doar EasyBox)
      lockerName,     // string | undefined (nume locker pentru email)
    } = body;

    const numeComplet = `${nume} ${prenume}`;

    // Adresa de livrare (pentru curier)
    const livrareNume = altaAdresa ? `${sNume} ${sPrenume}` : numeComplet;
    const livrareAdresa = altaAdresa ? sAdresa : adresa;
    const livrareLocalitate = altaAdresa ? sLocalitate : localitate;
    const livrareJudet = altaAdresa ? sJudet : judet;
    const livrareTara = altaAdresa ? sTara : tara;

    const adresaLivrareText = deliveryType === 'easybox'
      ? `EasyBox: ${lockerName || `Locker #${lockerId}`}`
      : `${livrareAdresa}, ${livrareLocalitate}, ${livrareJudet}, ${livrareTara}`;

    // ─── Generare AWB Sameday ─────────────────────────────────────────────────
    let awbNumber = '';
    let awbError = '';

    try {
      const awbResult = await createAWB({
        name: livrareNume,
        phone: telefon,
        email,
        street: deliveryType === 'easybox' ? '' : livrareAdresa,
        city: livrareLocalitate,
        county: livrareJudet,
        cashOnDelivery: parseFloat(price),
        quantity: parseInt(quantity),
        observation: `WOW NanoCeramic x${quantity} - Ramburs`,
        deliveryType: deliveryType || 'curier',
        lockerId: lockerId ? parseInt(lockerId) : undefined,
      });
      awbNumber = awbResult.awb;
    } catch (err: any) {
      console.error('Sameday AWB error (ramburs):', err.message);
      awbError = err.message;
      // Nu oprim comanda dacă AWB-ul eșuează — trimitem emailul oricum
    }

    // ─── Email către admin ────────────────────────────────────────────────────
    await resend.emails.send({
      from: 'comenzi@wownanoceramic.ro',
      to: 'contact@wownanoceramic.ro',
      subject: `🛒 Comandă nouă ramburs - ${numeComplet} - ${price} RON${awbNumber ? ` | AWB: ${awbNumber}` : ''}`,
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
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Livrare</td>
                <td style="padding:8px;border:1px solid #eee">${deliveryType === 'easybox' ? '📦 EasyBox' : '🚚 Curier la ușă'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Adresă livrare</td>
                <td style="padding:8px;border:1px solid #eee">${adresaLivrareText}</td></tr>
            ${numeSocietate ? `<tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Societate</td>
                <td style="padding:8px;border:1px solid #eee">${numeSocietate} ${codFiscal ? `(${codFiscal})` : ''}</td></tr>` : ''}
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">AWB Sameday</td>
                <td style="padding:8px;border:1px solid #eee;font-weight:bold;color:${awbNumber ? '#2e7d32' : '#c62828'}">
                  ${awbNumber ? `✅ ${awbNumber}` : `❌ Eroare: ${awbError}`}
                </td></tr>
          </table>
          ${awbNumber ? `<p style="margin-top:16px"><a href="https://sameday.ro/track?awb=${awbNumber}" style="color:#C9A020">🔗 Tracking AWB</a></p>` : ''}
        </div>
      `,
    });

    // ─── Email confirmare client ───────────────────────────────────────────────
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
