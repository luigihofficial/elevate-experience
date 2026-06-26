const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { sendTicketEmail } = require('../lib/sendTicketEmail');

const PLAN_LABELS = { vip1: 'VIP · 1 ticket', vip2: 'VIP Dúo · 2 tickets' };
const SITE_URL = 'https://elevate.lospoderesdelexito.com';

async function registrarYEnviar(opts) {
  try {
    await stripe.customers.create({
      name: opts.nombre || 'Asistente ELEVATE',
      email: opts.correo,
      phone: opts.telefono || '',
      address: { city: opts.ciudad || '', state: opts.estado || '' },
      metadata: {
        plan: opts.plan, rol: opts.rol, evento: 'ELEVATE Experience',
        fuente: opts.fuente || '', telefono: opts.telefono || '',
        ciudad: opts.ciudad || '', estado: opts.estado || '', pais: opts.pais || '',
        pago_de: opts.pagoDe || ''
      }
    });
  } catch (e) { /* el lead puede fallar sin frenar el correo */ }
  const url = SITE_URL + '/gracias.html?type=guest&tier=VIP&plan=' +
    encodeURIComponent(opts.planLabel) + '&name=' + encodeURIComponent(opts.nombre || '') + '&code=' + opts.code;
  return sendTicketEmail({ type: 'vip', name: opts.nombre, email: opts.correo, code: opts.code, planLabel: opts.planLabel, ticketUrl: url });
}

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
    const planLabel = PLAN_LABELS[plan] || 'VIP';
    const code1 = sid.slice(-10).toUpperCase();

    const results = {};
    if (m.att1_correo) {
      results.a1 = await registrarYEnviar({
        nombre: m.att1_nombre, correo: m.att1_correo, telefono: m.att1_telefono,
        ciudad: m.att1_ciudad, estado: m.att1_estado, pais: m.att1_pais,
        code: code1, plan: plan, rol: 'asistente1',
        planLabel: plan === 'vip2' ? 'VIP · 1.er asistente' : planLabel,
        fuente: m.fuente, pagoDe: d.email || ''
      });
    }
    if (plan === 'vip2' && m.att2_correo) {
      const code2 = ('G' + sid.slice(-9)).toUpperCase();
      results.a2 = await registrarYEnviar({
        nombre: m.att2_nombre, correo: m.att2_correo, telefono: m.att2_telefono,
        ciudad: m.att2_ciudad, estado: m.att2_estado, pais: m.att2_pais,
        code: code2, plan: plan, rol: 'asistente2', planLabel: 'VIP · Invitado',
        fuente: m.fuente, pagoDe: d.email || ''
      });
    }

    res.status(200).json({ ok: true, results: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
