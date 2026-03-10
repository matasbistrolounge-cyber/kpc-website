const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, customerEmail, customerName, orderId } = req.body;

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.selectedOptions?.map(opt => opt.name).join(', ') || '',
        },
        unit_amount: Math.round((item.price + (item.selectedOptions?.reduce((sum, opt) => sum + opt.price, 0) || 0)) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `https://kpcurbankoreanfood.com/order-confirmation?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://kpcurbankoreanfood.com/?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        orderId: orderId,
        customerName: customerName,
      },
    });

    res.json({ success: true, url: session.url });

  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
};
