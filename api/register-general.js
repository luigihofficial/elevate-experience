const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { sendTicketEmail } = require('../lib/sendTicketEmail');

const SITE_URL = 'https://elevate.lospoderesdelexito.com';

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const b = req.body || {};
    if (!b.name || !b.email) { res.status(400).json({ error: 'Falta nombre o correo' }); return; }
    const customer = await stripe.customers.create({
      name: b.name,
      email: b.email,
      phone: b.phone || '',
      address: { city: b.ciudad || '', state: b.estado || '' },
      metadata: {
        plan: 'general',
        evento: 'ELEVATE Experience',
        fuente: b.fuente || '',
        telefono: b.phone || '',
        ciudad: b.ciudad || '',
        estado: b.estado || '',
        pais: b.pais || ''
      }
    });
    const code = customer.id.slice(-10).toUpperCase();

    let emailed = false;
    try {
      const ticketUrl = SITE_URL + '/gracias.html?type=general&name=' +
        encodeURIComponent(b.name) + '&code=' + encodeURIComponent(code);
      const r = await sendTicketEmail({
        type: 'general', name: b.name, email: b.email, code,
        planLabel: 'Entrada general', ticketUrl
      });
      emailed = !!r.ok;
    } catch (e) { emailed = false; }

    res.status(200).json({ ok: true, code: code, emailed: emailed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
