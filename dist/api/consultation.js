export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const contact = typeof request.body?.contact === 'string' ? request.body.contact.trim() : '';
  const source = typeof request.body?.source === 'string' ? request.body.source.slice(0, 240) : null;
  if (contact.length < 3 || contact.length > 160) return response.status(400).json({ error: 'Invalid contact' });

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return response.status(503).json({ error: 'Form backend is not configured' });

  try {
    const insert = await fetch(`${url.replace(/\/$/, '')}/rest/v1/consultation_requests`, {
      method: 'POST',
      headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}`, 'content-type': 'application/json', prefer: 'return=minimal' },
      body: JSON.stringify({ contact, source })
    });
    if (!insert.ok) return response.status(502).json({ error: 'Could not save request' });
    return response.status(201).json({ ok: true });
  } catch {
    return response.status(502).json({ error: 'Could not save request' });
  }
}
