import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { parseQuantity, productPrice } from '@/lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const { quantity } = await req.json();

    const qty = parseQuantity(quantity);
    if (!qty) return NextResponse.json({ error: 'Cantitate invalidă.' }, { status: 400 });

    // Prețul se calculează exclusiv pe server; plata cu cardul are transport gratuit.
    const totalPrice = productPrice(qty);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: `WOW NanoCeramic Restore & Protect x${qty}`,
              description: 'Kit Complet WOW NanoCeramic Restore & Protect',
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['RO'] },
      phone_number_collection: { enabled: true },
      metadata: { paymentMethod: 'card', quantity: String(qty), totalPrice: String(totalPrice) },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Eroare la inițierea plății. Încearcă din nou.' }, { status: 500 });
  }
}
