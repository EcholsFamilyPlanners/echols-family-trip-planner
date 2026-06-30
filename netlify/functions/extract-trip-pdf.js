// Netlify Function: extract-trip-pdf
// Receives a base64 PDF, sends it to Claude, returns structured trip data.
// The ANTHROPIC_API_KEY lives only here on the server — never exposed to the browser.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing ANTHROPIC_API_KEY.' }) };
  }

  try {
    const { pdfBase64, fileName } = JSON.parse(event.body);
    if (!pdfBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No PDF data provided.' }) };
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
              {
                type: 'document',
                source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
              },
              {
                type: 'text',
                text: `Extract travel information from this document (filename: ${fileName || 'unknown'}). Return only the JSON object.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: 'Anthropic API error', details: errText }) };
    }

    const data = await response.json();
    const textBlock = data.content?.find(c => c.type === 'text');
    const raw = textBlock?.text || '{}';

    const cleaned = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return { statusCode: 200, body: JSON.stringify({ error: 'Could not parse AI response as JSON.', raw: cleaned }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
