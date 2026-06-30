// Netlify Function: unsplash-photo
// Looks up a real photo for a destination search term via the Unsplash API.
// The UNSPLASH_ACCESS_KEY lives only here on the server.

exports.handler = async function (event) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing UNSPLASH_ACCESS_KEY.' }) };
  }

  const query = event.queryStringParameters?.q;
  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing query parameter q.' }) };
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Client-ID ${accessKey}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: res.status, body: JSON.stringify({ error: 'Unsplash API error', details: errText }) };
    }

    const data = await res.json();
    const photo = data.results?.[0];

    if (!photo) {
      return { statusCode: 200, body: JSON.stringify({ url: null }) };
    }

    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'public, max-age=2592000' }, // cache 30 days
      body: JSON.stringify({
        url: photo.urls?.regular || photo.urls?.full,
        thumbUrl: photo.urls?.small,
        credit: photo.user?.name || '',
        creditUrl: photo.user?.links?.html || '',
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
