const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { sendTicketEmail } = require('../lib/sendTicketEmail');

const PLAN_LABELS = { vip1: 'VIP · 1 ticket', vip2: 'VIP Dúo · 2 tickets' };
const SITE_URL = 'https://elevate.lospoderesdelexito.com';

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const sid = req.body && req.body.session_id;
    if (!sid) { res.status(400).json({ error: 'Falta session_id' }); return; }
    const session = await stripe.checkout.sessions.retrieve(sid);
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      res.status(400).json({ error: 'El pago no está confirmado' }); return;
    }
    const d = session.customer_details || {};
    const code = sid.slice(-10).toUpperCase();
    const planLabel = PLAN_LABELS[session.metadata && session.metadata.plan] || 'VIP';
    const ticketUrl = SITE_URL + '/gracias.html?session_id=' + encodeURIComponent(sid);
    const r = await sendTicketEmail({ type: 'vip', name: d.name, email: d.email, code, planLabel, ticketUrl });
    res.status(200).json(r);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
