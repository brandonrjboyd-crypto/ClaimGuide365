export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { model, max_tokens, system, messages } = req.body || {};

  if (!messages) return res.status(400).json({ error: 'messages required' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: max_tokens || 1000,
        system: system || '',
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(500).json({ error: 'AI call failed' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('chat handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
