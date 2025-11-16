import { stripe } from '../config/stripe.js';

export const createPaymentIntent = async (
  amount: number,
  eventId: number,
  userId: number
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe usa centavos
    currency: 'usd',
    metadata: {
      eventId: eventId.toString(),
      userId: userId.toString(),
    },
  });

  return paymentIntent;
};

export const confirmPayment = async (paymentIntentId: string) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent.status === 'succeeded';
};

export const createRefund = async (paymentIntentId: string) => {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });

  return refund;
};