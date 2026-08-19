import { getSession } from './_lib/auth.js';
import { getOctokit, getRepoFile, commitRepoFile, TARGET_REPO, DEFAULT_HABITS } from './_lib/github.js';
import { calculateStreaks, formatDate, shiftDate } from './_lib/streaks.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in with GitHub.' });
  }

  // Parse body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { date, habits = [], note = '' } = body || {};

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Missing or invalid "date" parameter (expected YYYY-MM-DD).' });
  }

  if (!Array.isArray(habits)) {
    return res.status(400).json({ error: '"habits" must be an array of habit IDs.' });
  }

  // Grace window validation:
  const now = new Date();
  const todayStr = formatDate(now);
  const yesterdayStr = shiftDate(todayStr, -1);
  const currentHour = now.getHours();

  const isToday = date === todayStr;
  const isYesterdayInGraceWindow = date === yesterdayStr && currentHour < 4;

  if (!isToday && !isYesterdayInGraceWindow) {
    return res.status(400).json({
      error: `Date ${date} is outside the honest check-in window. Commits must be made on the active day (or yesterday before 4:00 AM grace cutoff).`,
    });
  }

  const monthStr = date.substring(0, 7); // 'YYYY-MM'
  const filePath = `data/${monthStr}.json`;

  try {
    const octokit = getOctokit(session.accessToken);

    // 1. Fetch active habits for nice commit message
    let activeHabits = DEFAULT_HABITS;
    try {
      const habitsFile = await getRepoFile(octokit, session.username, TARGET_REPO, 'habits.json');
      if (habitsFile.exists) {
        activeHabits = JSON.parse(habitsFile.content);
      }
    } catch (e) {
      console.warn('Could not load habits.json');
    }

    // 2. Fetch current month's data file
    const currentFile = await getRepoFile(octokit, session.username, TARGET_REPO, filePath);
    let monthData = {};
    let sha = null;

    if (currentFile.exists) {
      try {
        monthData = JSON.parse(currentFile.content);
        sha = currentFile.sha;
      } catch (e) {
        console.error('Failed to parse existing month data JSON:', e);
        monthData = {};
      }
    }

    // 3. Upsert entry
    const entry = {
      date,
      habits,
      note: (note || '').trim(),
      updatedAt: new Date().toISOString(),
    };

    monthData[date] = entry;

    // 4. Construct Solo Leveling flavored commit message
    const habitMap = new Map(activeHabits.map((h) => [h.id, h.name]));
    const completedNames = habits.map((hid) => habitMap.get(hid) || hid);
    
    let commitSummary = '';
    if (completedNames.length > 0) {
      commitSummary = completedNames.join(', ');
    } else {
      commitSummary = 'Rest Day / 0 Quests';
    }

    const commitMessage = `Quest Log ${date}: ${commitSummary} (${habits.length}/${activeHabits.length} Cleared)`;

    // 5. Commit formatted JSON (2-space indentation)
    const jsonString = JSON.stringify(monthData, Object.keys(monthData).sort(), 2) + '\n';

    const commitResult = await commitRepoFile(
      octokit,
      session.username,
      TARGET_REPO,
      filePath,
      commitMessage,
      jsonString,
      sha
    );

    // 6. Fetch previous month if available to compute full streaks
    const prevMonthStr = shiftDate(`${monthStr}-01`, -15).substring(0, 7);
    const prevFile = await getRepoFile(octokit, session.username, TARGET_REPO, `data/${prevMonthStr}.json`);
    const allLogs = {};
    if (prevFile.exists) {
      try {
        Object.assign(allLogs, JSON.parse(prevFile.content));
      } catch (e) {}
    }
    Object.assign(allLogs, monthData);

    const streaks = calculateStreaks(allLogs, activeHabits);

    return res.status(200).json({
      success: true,
      entry,
      streaks,
      commit: {
        sha: commitResult.commit?.sha,
        message: commitMessage,
        htmlUrl: `https://github.com/${session.username}/${TARGET_REPO}/commits/main`,
      },
    });

  } catch (err) {
    console.error('Checkin error:', err);
    return res.status(500).json({
      error: `Failed to commit check-in to GitHub: ${err.message || 'Unknown error'}`,
    });
  }
}
