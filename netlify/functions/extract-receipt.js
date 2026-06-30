// Netlify Function: extract-receipt
// Receives a base64 image of a receipt, sends it to Claude, returns structured expense data.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing ANTHROPIC_API_KEY.' }) };
  }

  try {
    const { imageBase64, mediaType } = JSON.parse(event.body);
    if (!imageBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No image data provided.' }) };
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
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 },
              },
              {
                type: 'text',
                text: 'Extract the receipt details. Return only the JSON object.',
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

    return { statusCode: 200, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
