import { getSession } from './_lib/auth.js';
import { getOctokit, getRepoFile, TARGET_REPO, DEFAULT_HABITS } from './_lib/github.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in with GitHub.' });
  }

  try {
    const octokit = getOctokit(session.accessToken);
    const file = await getRepoFile(octokit, session.username, TARGET_REPO, 'habits.json');

    if (!file.exists) {
      return res.status(200).json({ habits: DEFAULT_HABITS });
    }

    const habits = JSON.parse(file.content);
    return res.status(200).json({ habits });
  } catch (err) {
    console.error('Error loading habits:', err);
    return res.status(500).json({ error: 'Failed to load habits from GitHub repository.' });
  }
}
