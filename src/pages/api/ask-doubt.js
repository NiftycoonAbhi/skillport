export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { query } = req.body;
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful tutor. Provide clear, step-by-step solutions to student doubts. Also suggest 2–3 relevant study resources if possible.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
      }),
    });

    const data = await response.json();

    const answer = data.choices?.[0]?.message?.content || 'No answer generated.';
    res.status(200).json({ answer });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
