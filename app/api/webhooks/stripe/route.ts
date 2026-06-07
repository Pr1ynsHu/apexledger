import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { log } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia" as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new NextResponse('No signature provided', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    log.error('Webhook signature verification failed.', error);
    await log.flush();
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  let updateStatus: string | null = null;
  const stripeObject = event.data.object as any;
  const payoutId = stripeObject.id;

  switch (event.type) {
    case 'payout.paid':
    case 'payment_intent.succeeded':
      updateStatus = 'settled';
      break;
    case 'payout.failed':
    case 'payout.canceled':
    case 'payment_intent.payment_failed':
    case 'payment_intent.canceled':
      updateStatus = 'failed';
      break;
    default:
      log.info(`Unhandled event type: ${event.type}`);
  }

  if (updateStatus && payoutId) {
    // Call the SECURITY DEFINER RPC to bypass Row Level Security 
    // since this webhook route operates as the anonymous client
    const { error } = await supabase.rpc('update_transfer_status_by_network_id', {
      network_id: payoutId,
      new_status: updateStatus
    });

    if (error) {
      log.error(`Failed to sync webhook status for ${payoutId}`, error);
    } else {
      log.info(`Stripe webhook successfully synced transaction ${payoutId} to ${updateStatus}`);
    }
    
    await log.flush();
  }

  return Response.json({ received: true }, { status: 200 });
}
