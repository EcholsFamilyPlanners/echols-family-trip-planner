// Netlify Function: send-to-frame
// Emails a photo to one or more Skylight frame email addresses via Resend.
// The RESEND_API_KEY lives only here on the server.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing RESEND_API_KEY.' }) };
  }

  try {
    const { frameEmails, photoUrl, caption, tripTitle } = JSON.parse(event.body);
    if (!frameEmails?.length || !photoUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing frameEmails or photoUrl.' }) };
    }

    const results = [];
    for (const toEmail of frameEmails) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Travel OS <onboarding@resend.dev>',
          to: [toEmail],
          subject: tripTitle ? `Photo from ${tripTitle}` : 'New travel photo',
          html: `
            <div style="font-family: sans-serif; max-width: 500px;">
              ${caption ? `<p style="font-size:16px;">${caption}</p>` : ''}
              <img src="${photoUrl}" style="width:100%; border-radius:8px;" />
              ${tripTitle ? `<p style="color:#888; font-size:13px; margin-top:8px;">From ${tripTitle} — sent via Travel OS</p>` : ''}
            </div>
          `,
        }),
      });

      const data = await res.json();
      results.push({ email: toEmail, success: res.ok, data });
    }

    return { statusCode: 200, body: JSON.stringify({ results }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
