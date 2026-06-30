// Netlify Background Function: extract-receipt-background
// Does the slow AI work and writes the result into Supabase.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseRequest(path, options = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers || {}),
    },
  });
}

exports.handler = async function (event) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let jobId;

  try {
    const body = JSON.parse(event.body);
    jobId = body.jobId;
    const { imageBase64, mediaType } = body;

    if (!apiKey || !jobId || !imageBase64) {
      return { statusCode: 200, body: '' };
    }

    const systemPrompt = `You are a receipt scanner. You will be given a photo of a receipt. Extract the details and return ONLY valid JSON in this exact shape, with no markdown formatting, no code fences, and no extra commentary:

{
  "merchant": "",
  "date": "",
  "total": null,
  "category": "",
  "items": [{"name": "", "price": null}],
  "notes": ""
}

Rules:
- "date" should be in YYYY-MM-DD format if found, otherwise empty string.
- "category" should be your best guess from: Flights, Hotel, Food & Dining, Activities, Car & Transport, Shopping, Other.
- "total" should be the final total amount as a number, no currency symbol.
- If the receipt is unclear or unreadable, do your best and note uncertainty in "notes".
- Return raw JSON only — no backticks, no "json" label, nothing else.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
              { type: 'text', text: 'Extract the receipt details. Return only the JSON object.' },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      await supabaseRequest(`receipt_scan_jobs?id=eq.${jobId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'error', error_message: `Anthropic API error: ${errText.slice(0,500)}`, updated_at: new Date().toISOString() }),
      });
      return { statusCode: 200, body: '' };
    }

    const data = await response.json();
    const textBlock = data.content?.find(c => c.type === 'text');
    const raw = textBlock?.text || '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      await supabaseRequest(`receipt_scan_jobs?id=eq.${jobId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'error', error_message: 'Could not parse AI response as JSON.', updated_at: new Date().toISOString() }),
      });
      return { statusCode: 200, body: '' };
    }

    await supabaseRequest(`receipt_scan_jobs?id=eq.${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'complete', result: parsed, updated_at: new Date().toISOString() }),
    });

    return { statusCode: 200, body: '' };
  } catch (err) {
    if (jobId) {
      try {
        await supabaseRequest(`receipt_scan_jobs?id=eq.${jobId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'error', error_message: err.message, updated_at: new Date().toISOString() }),
        });
      } catch (e2) {}
    }
    return { statusCode: 200, body: '' };
  }
};
