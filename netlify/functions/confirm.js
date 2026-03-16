exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  let data;
  try { data = JSON.parse(event.body); } catch(e) {
    const p = new URLSearchParams(event.body);
    data = Object.fromEntries(p.entries());
  }

  const { name, email, checkin, checkout, guests, message } = data;
  if (!email) return { statusCode: 400, body: 'No email' };

  const body = {
    personalizations: [{ to: [{ email, name: name || 'there' }] }],
    from: { email: 'soulturnaround@icloud.com', name: 'Windham Retreat' },
    reply_to: { email: 'soulturnaround@icloud.com' },
    subject: 'Booking Request Received — Windham Retreat VT',
    content: [{
      type: 'text/html',
      value: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a0a2e;color:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#6b21a8,#1d4ed8);padding:24px 32px;">
            <h1 style="margin:0;font-size:1.4rem;">🏡 Windham Retreat</h1>
            <p style="margin:4px 0 0;opacity:0.85;font-size:0.9rem;">Vermont Artistic Retreat · Windham, VT</p>
          </div>
          <div style="padding:32px;">
            <h2 style="margin-top:0;">Request Received! 🎉</h2>
            <p>Hi ${name || 'there'},</p>
            <p>Thanks for your interest in Windham Retreat! We received your booking inquiry and will get back to you <strong>within 24 hours</strong> to confirm availability and details.</p>
            <div style="background:#2a1a4a;border:1px solid #3a2a5a;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;font-size:0.85rem;color:#aaa;">YOUR REQUEST</p>
              ${checkin ? `<p style="margin:4px 0;"><strong>Check-in:</strong> ${checkin}</p>` : ''}
              ${checkout ? `<p style="margin:4px 0;"><strong>Check-out:</strong> ${checkout}</p>` : ''}
              ${guests ? `<p style="margin:4px 0;"><strong>Guests:</strong> ${guests}</p>` : ''}
              ${message ? `<p style="margin:4px 0;"><strong>Message:</strong> ${message}</p>` : ''}
            </div>
            <p>We look forward to hosting you in Vermont! Feel free to reply to this email with any questions.</p>
            <p style="margin-top:32px;color:#aaa;font-size:0.85rem;">— George, Windham Retreat<br>windhamretreat.com</p>
          </div>
        </div>`
    }]
  };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  return { statusCode: res.ok ? 200 : 500, body: res.ok ? 'OK' : 'Error' };
};
