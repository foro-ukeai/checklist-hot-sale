module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  const data = req.body && req.body.data;
  if (!data) return res.status(400).json({ error: 'No data provided' });

  const API_URL = 'https://api.github.com/repos/foro-ukeai/checklist-hot-sale/contents/data.json';
  const HEADERS = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'checklist-hot-sale-app',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  // Get current SHA (needed for updates)
  let sha;
  try {
    const getRes = await fetch(API_URL, { headers: HEADERS });
    if (getRes.ok) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
    }
  } catch (e) {
    // File may not exist yet, that's OK
  }

  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const body = {
    message: 'sync: update app data',
    content,
    ...(sha ? { sha } : {})
  };

  try {
    const putRes = await fetch(API_URL, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(body)
    });

    if (!putRes.ok) {
      const e = await putRes.json().catch(() => ({}));
      return res.status(putRes.status).json({ error: e.message || 'GitHub API error' });
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
