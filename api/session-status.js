const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_LABELS = {
  vip1: 'VIP · 1 ticket',
  vip2: 'VIP Dúo · 2 tickets'
};

module.exports = async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) { res.status(400).json({ error: 'Falta session_id' }); return; }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const d = session.customer_details || {};
    res.status(200).json({
      status: session.status,
      payment_status: session.payment_status,
      name: d.name || '',
      email: d.email || '',
      amount_total: session.amount_total,
      plan: (session.metadata && session.metadata.plan) || '',
      plan_label: PLAN_LABELS[(session.metadata && session.metadata.plan)] || 'Entrada',
      code: sessionId.slice(-10).toUpperCase()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
