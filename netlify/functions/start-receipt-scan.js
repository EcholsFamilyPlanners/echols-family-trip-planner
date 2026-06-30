// Netlify Function: start-receipt-scan
// Receives a small image URL (already uploaded to Supabase Storage by the
// frontend), creates a job row, and triggers the background function with
// just the URL — keeping the payload tiny and well under Netlify's limits.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { tripId, imageUrl } = JSON.parse(event.body);
    if (!tripId || !imageUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing tripId or imageUrl.' }) };
    }

    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/receipt_scan_jobs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        household_id: '00000000-0000-0000-0000-000000000001',
        trip_id: tripId,
        status: 'processing',
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      return { statusCode: 500, body: JSON.stringify({ error: 'Could not create job', details: errText }) };
    }

    const [job] = await createRes.json();

    const siteUrl = 'https://echolstripplanner.netlify.app';
    try {
      const bgResponse = await fetch(`${siteUrl}/.netlify/functions/extract-receipt-background`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, imageUrl }),
      });
      console.log('Background trigger status:', bgResponse.status);
    } catch (triggerErr) {
      console.error('Failed to trigger background function:', triggerErr.message);
    }

    return { statusCode: 200, body: JSON.stringify({ jobId: job.id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
