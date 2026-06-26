// Devuelve la clave PUBLICABLE de Stripe al frontend (es pública y segura).
module.exports = (req, res) => {
  res.status(200).json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' });
};
