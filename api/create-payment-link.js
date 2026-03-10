const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { amount, orderId } = req.body;
    const amountInCents = Math.round(amount * 100);

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `KPC Order #${orderId}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `https://kpcurbankoreanfood.com/order-confirmation?order=${orderId}`,
        },
      },
    });

    res.status(200).json({ success: true, url: paymentLink.url });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
