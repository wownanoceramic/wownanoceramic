import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAWB } from '@/lib/sameday';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

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

    // Extragem datele complete ale sesiunii cu shipping
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

    // ─── Generare AWB Sameday ───────────────────────────────────────────────
    try {
      const awbResult = await createAWB({
        name,
        phone,
        email,
        street,
        city,
        county,
        cashOnDelivery: 0, // Plată cu card — fără ramburs
        quantity,
        observation: `WOW NanoCeramic x${quantity} - Card`,
        deliveryType,
        lockerId,
      });

      console.log(`✅ AWB generat pentru comanda ${session.id}: ${awbResult.awb}`);
    } catch (err: any) {
      // Nu oprim procesarea dacă AWB eșuează — logăm eroarea
      console.error(`❌ Sameday AWB error pentru ${session.id}:`, err.message);
    }
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: { bodyParser: false },
};
