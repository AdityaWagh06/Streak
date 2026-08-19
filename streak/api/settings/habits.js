import { getSession } from '../_lib/auth.js';
import { getOctokit, getRepoFile, commitRepoFile, TARGET_REPO, DEFAULT_HABITS } from '../_lib/github.js';

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in with GitHub.' });
  }

  const octokit = getOctokit(session.accessToken);

  if (req.method === 'GET') {
    try {
      const file = await getRepoFile(octokit, session.username, TARGET_REPO, 'habits.json');
      if (!file.exists) {
        return res.status(200).json({ habits: DEFAULT_HABITS });
      }
      const habits = JSON.parse(file.content);
      return res.status(200).json({ habits });
    } catch (err) {
      console.error('Error fetching habits:', err);
      return res.status(500).json({ error: 'Failed to fetch habits' });
    }
  }

  if (req.method === 'PUT') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const habitsArray = Array.isArray(body) ? body : body?.habits;

    if (!Array.isArray(habitsArray) || habitsArray.length === 0) {
      return res.status(400).json({ error: 'Habits must be a non-empty array.' });
    }

    // Sanitize & validate
    const validatedHabits = habitsArray.map((h, i) => {
      const name = (h.name || '').trim();
      const emoji = (h.emoji || '🎯').trim();
      const id = (h.id || name.toLowerCase().replace(/[^a-z0-9]/g, '') || `habit-${i + 1}`).trim();
      return { id, name, emoji };
    });

    try {
      const existingFile = await getRepoFile(octokit, session.username, TARGET_REPO, 'habits.json');
      const sha = existingFile.exists ? existingFile.sha : null;
      const formattedJson = JSON.stringify(validatedHabits, null, 2) + '\n';

      await commitRepoFile(
        octokit,
        session.username,
        TARGET_REPO,
        'habits.json',
        'Update habit list',
        formattedJson,
        sha
      );

      return res.status(200).json({
        success: true,
        habits: validatedHabits,
      });
    } catch (err) {
      console.error('Error updating habits:', err);
      return res.status(500).json({ error: `Failed to update habits on GitHub: ${err.message}` });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
