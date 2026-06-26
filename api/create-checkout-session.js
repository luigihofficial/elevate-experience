const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  vip1: { name: 'Entrada VIP · 1 ticket — ELEVATE Experience', amount: 3997 },
  vip2: { name: 'Entrada VIP Dúo · 2 tickets — ELEVATE Experience', amount: 6997 }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const plan = (req.body && req.body.plan) || '';
    const selected = PLANS[plan];
    if (!selected) { res.status(400).json({ error: 'Plan invalido' }); return; }
    const origin = req.headers.origin || ('https://' + req.headers.host);

    const customFields = [{
      key: 'fuente',
      label: { type: 'custom', custom: '¿Como supiste del evento?' },
      type: 'dropdown',
      dropdown: { options: [
        { label: 'Instagram', value: 'instagram' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'Por uno de los autores', value: 'autor' },
        { label: 'Recomendacion de un amigo', value: 'amigo' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Correo electronico', value: 'correo' },
        { label: 'Otro', value: 'otro' }
      ] }
    }];

    // VIP Dúo: pedir datos de la 2da persona para capturar ese lead
    if (plan === 'vip2') {
      customFields.push({
        key: 'segundonombre',
        label: { type: 'custom', custom: 'Nombre del 2do asistente' },
        type: 'text',
        optional: false
      });
      customFields.push({
        key: 'segundocorreo',
        label: { type: 'custom', custom: 'Correo del 2do asistente' },
        type: 'text',
        optional: false
      });
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: selected.name },
          unit_amount: selected.amount
        },
        quantity: 1
      }],
      metadata: { plan: plan },
      phone_number_collection: { enabled: true },
      billing_address_collection: 'required',
      custom_fields: customFields,
      return_url: origin + '/gracias.html?session_id={CHECKOUT_SESSION_ID}'
    });

    res.status(200).json({ clientSecret: session.client_secret });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
