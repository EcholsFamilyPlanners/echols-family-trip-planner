// Netlify Background Function: extract-trip-pdf-background
// Background functions can run up to 15 minutes and don't return a response to the caller.
// This function does the slow AI work and writes the result into Supabase,
// which the frontend polls for completion.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers || {}),
    },
  });
  return res;
}

exports.handler = async function (event) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let jobId;

  try {
    const body = JSON.parse(event.body);
    jobId = body.jobId;
    const { pdfBase64, fileName } = body;

    if (!apiKey || !jobId || !pdfBase64) {
      return { statusCode: 200, body: '' }; // background functions always return empty quickly
    }

    const systemPrompt = `You are a travel document parser. You will be given a PDF (an article, itinerary, brochure, or blog post about a trip). Extract any travel-relevant information you find and return ONLY valid JSON in this exact shape, with no markdown formatting, no code fences, and no extra commentary:

{
  "hotels": [{"name": "", "neighborhood": "", "price_per_night": null, "notes": ""}],
  "restaurants": [{"name": "", "cuisine": "", "notes": ""}],
  "itinerary_days": [{"day": 1, "summary": ""}],
  "budget_items": [{"category": "", "label": "", "estimated": null}],
  "general_notes": "",
  "destination_guess": ""
}

Rules:
- Only include items you actually find in the document. Empty arrays are fine if nothing relevant is found.
- Do not invent prices or details that aren't in the document.
- Keep "general_notes" to a short paragraph summarizing useful tips, timing advice, or context.
- "destination_guess" should be your best guess at which trip/destination this document is about, in a few words.
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
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
              { type: 'text', text: `Extract travel information from this document (filename: ${fileName || 'unknown'}). Return only the JSON object.` },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      await supabaseRequest(`pdf_import_jobs?id=eq.${jobId}`, {
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
      await supabaseRequest(`pdf_import_jobs?id=eq.${jobId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'error', error_message: 'Could not parse AI response as JSON.', updated_at: new Date().toISOString() }),
      });
      return { statusCode: 200, body: '' };
    }

    await supabaseRequest(`pdf_import_jobs?id=eq.${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'complete', result: parsed, updated_at: new Date().toISOString() }),
    });

    return { statusCode: 200, body: '' };
  } catch (err) {
    if (jobId) {
      try {
        await supabaseRequest(`pdf_import_jobs?id=eq.${jobId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'error', error_message: err.message, updated_at: new Date().toISOString() }),
        });
      } catch (e2) { /* swallow */ }
    }
    return { statusCode: 200, body: '' };
  }
};
