const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  vip1: { name: 'Entrada VIP · 1 ticket — ELEVATE Experience', amount: 3997 },
  vip2: { name: 'Entrada VIP Dúo · 2 tickets — ELEVATE Experience', amount: 6997 }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const body = req.body || {};
    const plan = body.plan || '';
    const selected = PLANS[plan];
    if (!selected) { res.status(400).json({ error: 'Plan invalido' }); return; }
    const origin = req.headers.origin || ('https://' + req.headers.host);
    const a1 = body.asistente1 || {};
    const a2 = body.asistente2 || {};

    const metadata = {
      plan: plan,
      fuente: (body.fuente || '').slice(0, 100),
      att1_nombre: (a1.nombre || '').slice(0, 200),
      att1_correo: (a1.correo || '').slice(0, 200),
      att1_telefono: (a1.telefono || '').slice(0, 50)
    };
    if (plan === 'vip2') {
      metadata.att2_nombre = (a2.nombre || '').slice(0, 200);
      metadata.att2_correo = (a2.correo || '').slice(0, 200);
      metadata.att2_telefono = (a2.telefono || '').slice(0, 50);
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
      metadata: metadata,
      billing_address_collection: 'required',
      return_url: origin + '/gracias.html?session_id={CHECKOUT_SESSION_ID}'
    });

    res.status(200).json({ clientSecret: session.client_secret });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
