// Envía el correo con el ticket + QR usando Resend (API HTTP, sin dependencias).
async function sendTicketEmail({ type, name, email, code, planLabel, ticketUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'Falta RESEND_API_KEY' };
  if (!email) return { ok: false, error: 'Falta email' };

  const from = process.env.EMAIL_FROM || 'ELEVATE Experience <eventos@lospoderesdelexito.com>';
  const replyTo = process.env.EMAIL_REPLY_TO || 'admin@lospoderesdelexito.com';
  const safeName = (name || 'Asistente').replace(/[<>]/g, '');
  const qrData = encodeURIComponent('ELEVATE|' + code + '|' + safeName);
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=' + qrData;
  const isVip = type === 'vip';
  const tipo = isVip ? 'compra' : 'registro';

  const html = `
  <div style="background:#F6F1E7;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1C3A5E">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7ddc9;border-radius:14px;overflow:hidden">
      <div style="background:#1C3A5E;padding:22px 26px">
        <div style="color:#C9A24B;font-size:11px;letter-spacing:3px;font-weight:bold">5 AUTORES &middot; 1 ESCENARIO</div>
        <div style="font-size:26px;font-weight:bold;color:#F6F1E7;margin-top:5px">ELEVATE <span style="color:#C9A24B">Experience</span></div>
      </div>
      <div style="padding:26px">
        <p style="font-size:16px;margin:0 0 6px">Hola <b>${safeName}</b>, &iexcl;tu lugar est&aacute; confirmado! &#127881;</p>
        <p style="margin:0 0 18px;color:#6B7585">Entrada: <b style="color:#1C3A5E">${planLabel}</b></p>
        <div style="text-align:center;margin:10px 0 6px">
          <img src="${qrUrl}" alt="Codigo QR de tu ticket" width="180" height="180" style="border:8px solid #ffffff;border-radius:10px;background:#fff">
          <div style="font-size:12px;color:#6B7585;letter-spacing:2px;margin-top:6px">C&Oacute;DIGO: <b style="color:#1C3A5E">${code}</b></div>
        </div>
        <div style="text-align:center;margin:22px 0">
          <a href="${ticketUrl}" style="background:#C9A24B;color:#1C3A5E;text-decoration:none;font-weight:bold;padding:14px 30px;border-radius:999px;display:inline-block">Ver y descargar mi ticket</a>
        </div>
        <table style="width:100%;font-size:14px;color:#1C3A5E;border-top:1px solid #eee;padding-top:12px">
          <tr><td style="padding:4px 0"><b>S&aacute;bado 11 de julio de 2026</b> &middot; 10:00 a.m. a 2:00 p.m.</td></tr>
          <tr><td style="padding:4px 0">Embassy Suites by Hilton &mdash; Miami International Airport</td></tr>
          <tr><td style="padding:4px 0;color:#6B7585">3974 NW S River Dr, Miami, FL 33142</td></tr>
        </table>
        <p style="font-size:13px;color:#6B7585;margin-top:18px">Presenta este QR en la entrada el d&iacute;a del evento. Gu&aacute;rdalo o desc&aacute;rgalo desde el bot&oacute;n de arriba.</p>
        <p style="font-size:12px;color:#9aa3ad;margin-top:18px">ELEVATE Experience &middot; Expande tu mente, activa tu poder &middot; admin@lospoderesdelexito.com</p>
      </div>
    </div>
  </div>`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: from,
        to: [email],
        reply_to: replyTo,
        subject: 'Tu ticket para ELEVATE Experience',
        html: html
      })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) return { ok: false, error: (data && data.message) || ('HTTP ' + resp.status) };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = { sendTicketEmail };
