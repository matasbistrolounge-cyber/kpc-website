const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, orderId } = req.body;
  
  stripe.paymentLinks.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Order ${orderId}` },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    after_completion: {
      type: 'redirect',
      redirect: { url: `https://kpcurbankoreanfood.com/order-confirmation?order=${orderId}` }
    }
  }).then(paymentLink => {
    res.json({ success: true, url: paymentLink.url });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
};
