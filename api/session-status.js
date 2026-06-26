const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_LABELS = { vip1: 'VIP · 1 ticket', vip2: 'VIP Dúo · 2 tickets' };

module.exports = async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) { res.status(400).json({ error: 'Falta session_id' }); return; }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const m = session.metadata || {};
    const plan = m.plan || '';
    const code1 = sessionId.slice(-10).toUpperCase();

    const attendees = [{
      name: m.att1_nombre || 'Asistente ELEVATE',
      code: code1,
      label: plan === 'vip2' ? 'VIP · 1.er asistente' : (PLAN_LABELS[plan] || 'VIP')
    }];
    if (plan === 'vip2') {
      attendees.push({
        name: m.att2_nombre || 'Invitado',
        code: ('G' + sessionId.slice(-9)).toUpperCase(),
        label: 'VIP · Invitado'
      });
    }

    res.status(200).json({
      status: session.status,
      payment_status: session.payment_status,
      plan: plan,
      plan_label: PLAN_LABELS[plan] || 'Entrada',
      attendees: attendees
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
