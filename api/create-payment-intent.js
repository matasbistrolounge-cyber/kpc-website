const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { amount, currency = 'usd' } = req.body;
      
      if (!amount || amount < 50) {
        return res.status(400).json({ 
          error: 'Amount must be at least 50 cents' 
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.status(200).json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
