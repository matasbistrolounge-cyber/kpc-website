// Stripe Payment Link API - Serverless Function
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { amount, description, orderId, customerEmail, customerName } = req.body;

    // Validate required fields
    if (!amount || !orderId) {
      res.status(400).json({ error: 'Missing required fields: amount and orderId' });
      return;
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create a Payment Link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `KPC Order #${orderId}`,
              description: description || 'KPC Urban Korean Food Order',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `https://kpcurbankoreanfood.com/order-confirmation?order=${orderId}&status=success`,
        },
      },
      metadata: {
        orderId: orderId,
        customerEmail: customerEmail || '',
        customerName: customerName || '',
      },
    });

    res.status(200).json({
      success: true,
      url: paymentLink.url,
      orderId: orderId,
    });

  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({
      error: 'Failed to create payment link',
      message: error.message,
    });
  }
}
