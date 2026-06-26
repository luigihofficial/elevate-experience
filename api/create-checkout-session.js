const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  vip1: { name: 'Entrada VIP · 1 ticket — ELEVATE Experience', amount: 3997 },
  vip2: { name: 'Entrada VIP Dúo · 2 tickets — ELEVATE Experience', amount: 6997 }
};

function take(v, n) { return (v || '').slice(0, n); }

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
      fuente: take(body.fuente, 100),
      att1_nombre: take(a1.nombre, 200),
      att1_correo: take(a1.correo, 200),
      att1_telefono: take(a1.telefono, 50),
      att1_ciudad: take(a1.ciudad, 100),
      att1_estado: take(a1.estado, 100),
      att1_pais: take(a1.pais, 80)
    };
    if (plan === 'vip2') {
      metadata.att2_nombre = take(a2.nombre, 200);
      metadata.att2_correo = take(a2.correo, 200);
      metadata.att2_telefono = take(a2.telefono, 50);
      metadata.att2_ciudad = take(a2.ciudad, 100);
      metadata.att2_estado = take(a2.estado, 100);
      metadata.att2_pais = take(a2.pais, 80);
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: [{
        price_data: { currency: 'usd', product_data: { name: selected.name }, unit_amount: selected.amount },
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
