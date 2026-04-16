export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { clientName, clientEmail, lossType, insurer, address, firmName, firmEmail } = req.body || {};

  if (!firmEmail) return res.status(400).json({ error: 'firmEmail required' });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F7F5F0; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
    .header  { background: #0F2044; padding: 24px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; font-family: Georgia, serif; }
    .header p  { color: #C8D8F0; margin: 6px 0 0; font-size: 13px; }
    .body    { padding: 28px 32px; }
    .body p  { color: #475569; font-size: 14px; line-height: 1.65; margin: 0 0 14px; }
    .detail  { background: #F8F7F4; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #E2E8F0; font-size: 13px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-row .label { color: #64748B; }
    .detail-row .value { color: #1E293B; font-weight: 600; }
    .cta     { display: inline-block; background: #D97706; color: #fff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; margin: 8px 0 16px; }
    .footer  { background: #F8F7F4; padding: 16px 32px; border-top: 1px solid #E2E8F0; }
    .footer p { color: #94A3B8; font-size: 11.5px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>New Client — ${firmName || 'Your Firm'}</h1>
      <p>ClaimGuide 365 · Professional Portal</p>
    </div>
    <div class="body">
      <p>A new client has created a claim portal through your firm link.</p>
      <div class="detail">
        <div class="detail-row"><span class="label">Client Name</span><span class="value">${clientName || '—'}</span></div>
        <div class="detail-row"><span class="label">Email</span><span class="value">${clientEmail || '—'}</span></div>
        <div class="detail-row"><span class="label">Loss Type</span><span class="value">${lossType || '—'}</span></div>
        <div class="detail-row"><span class="label">Insurer</span><span class="value">${insurer || '—'}</span></div>
        <div class="detail-row"><span class="label">Address / Vehicle</span><span class="value">${address || '—'}</span></div>
      </div>
      <p>Log in to your professional portal to view their full file, documents, and communicate with them directly.</p>
      <a href="${process.env.APP_URL || 'https://claim-guide365.vercel.app'}" class="cta">View Client File →</a>
    </div>
    <div class="footer">
      <p>ClaimGuide 365 · You received this because you have a professional account linked to ${firmName || 'your firm'}.</p>
    </div>
  </div>
</body>
</html>`.trim();

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'ClaimGuide 365 <onboarding@resend.dev>',
        to:      firmEmail,
        subject: `New client: ${clientName || 'New signup'} — ${lossType || 'Insurance Claim'}`,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Email send failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('notify-new-client error:', err);
    return res.status(500).json({ error: err.message });
  }
}