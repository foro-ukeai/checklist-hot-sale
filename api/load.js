module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  const API_URL = 'https://api.github.com/repos/foro-ukeai/checklist-hot-sale/contents/data.json';
  const HEADERS = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'checklist-hot-sale-app',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  try {
    const getRes = await fetch(API_URL, { headers: HEADERS });
    if (!getRes.ok) return res.status(getRes.status).json({ error: 'GitHub API error' });
    const fileInfo = await getRes.json();
    const content = Buffer.from(fileInfo.content, 'base64').toString('utf8');
    const data = JSON.parse(content);
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
