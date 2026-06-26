const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const b = req.body || {};
    if (!b.name || !b.email) { res.status(400).json({ error: 'Falta nombre o correo' }); return; }
    const customer = await stripe.customers.create({
      name: b.name,
      email: b.email,
      phone: b.phone || '',
      metadata: {
        plan: 'general',
        evento: 'ELEVATE Experience',
        fuente: b.fuente || ''
      }
    });
    res.status(200).json({ ok: true, code: customer.id.slice(-10).toUpperCase() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
