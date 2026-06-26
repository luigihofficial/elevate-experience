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
    const m = session.metadata || {};
    const plan = m.plan || '';
    const code = sid.slice(-10).toUpperCase();
    const planLabel = PLAN_LABELS[plan] || 'VIP';
    const ticketUrl = SITE_URL + '/gracias.html?session_id=' + encodeURIComponent(sid);

    // 1) Ticket del comprador (1er asistente)
    const r1 = await sendTicketEmail({ type: 'vip', name: d.name, email: d.email, code, planLabel, ticketUrl });

    // 2) VIP Dúo: registrar y enviar ticket al 2do asistente
    let second = null;
    if (plan === 'vip2' && m.seg_correo) {
      try {
        const cust = await stripe.customers.create({
          name: m.seg_nombre || 'Acompañante VIP',
          email: m.seg_correo,
          phone: m.seg_telefono || '',
          metadata: { plan: 'vip2', rol: 'acompanante', evento: 'ELEVATE Experience', compra_de: d.email || '' }
        });
        const code2 = cust.id.slice(-10).toUpperCase();
        const url2 = SITE_URL + '/gracias.html?type=guest&tier=VIP&plan=' +
          encodeURIComponent('VIP · Acompañante') + '&name=' + encodeURIComponent(m.seg_nombre || '') + '&code=' + code2;
        const r2 = await sendTicketEmail({ type: 'vip', name: m.seg_nombre, email: m.seg_correo, code: code2, planLabel: 'VIP · Acompañante', ticketUrl: url2 });
        second = { emailed: !!r2.ok, code: code2 };
      } catch (e) { second = { emailed: false, error: e.message }; }
    }

    res.status(200).json({ ok: !!r1.ok, buyer: r1, second: second });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
