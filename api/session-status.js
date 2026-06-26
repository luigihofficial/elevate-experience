const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_LABELS = { vip1: 'VIP · 1 ticket', vip2: 'VIP Dúo · 2 tickets' };

module.exports = async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) { res.status(400).json({ error: 'Falta session_id' }); return; }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const d = session.customer_details || {};
    const m = session.metadata || {};
    const plan = m.plan || '';
    const resp = {
      status: session.status,
      payment_status: session.payment_status,
      name: d.name || '',
      email: d.email || '',
      amount_total: session.amount_total,
      plan: plan,
      plan_label: PLAN_LABELS[plan] || 'Entrada',
      code: sessionId.slice(-10).toUpperCase()
    };
    if (plan === 'vip2' && m.seg_correo) {
      resp.second = {
        name: m.seg_nombre || 'Acompañante VIP',
        code: ('G' + sessionId.slice(-9)).toUpperCase()
      };
    }
    res.status(200).json(resp);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
