import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});
export async function POST(req: NextRequest) {
  try {
    const { quantity = 1, paymentMethod = 'card' } = await req.json();

    const unitAmount = 9900; // 99 RON în bani (cenți)
    const codFee = paymentMethod === 'cod' ? 1000 : 0; // 10 RON ramburs

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: 'WOW NanoCeramic Restore & Protect',
              description: 'Formula Pro 100ml',
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
        ...(codFee > 0 ? [{
          price_data: {
            currency: 'ron',
            product_data: { name: 'Taxă ramburs' },
            unit_amount: codFee,
          },
          quantity: 1,
        }] : []),
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      metadata: { paymentMethod, quantity: String(quantity) },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}