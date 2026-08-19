import { getSession } from './_lib/auth.js';
import { getOctokit, getRepoFile, TARGET_REPO, DEFAULT_HABITS } from './_lib/github.js';
import { calculateStreaks, formatDate, shiftDate } from './_lib/streaks.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in with GitHub.' });
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const reqMonth = req.query?.month || urlObj.searchParams.get('month');
  const fetchAll = req.query?.all || urlObj.searchParams.get('all');

  const now = new Date();
  const currentMonth = formatDate(now).substring(0, 7); // 'YYYY-MM'
  const targetMonth = reqMonth || currentMonth;

  try {
    const octokit = getOctokit(session.accessToken);

    // Fetch habits
    let habits = DEFAULT_HABITS;
    try {
      const habitsFile = await getRepoFile(octokit, session.username, TARGET_REPO, 'habits.json');
      if (habitsFile.exists) {
        habits = JSON.parse(habitsFile.content);
      }
    } catch (e) {
      console.warn('Could not load habits.json, using defaults');
    }

    // Determine months to fetch for complete streak / heatmap computation
    const monthsToFetch = new Set([targetMonth]);
    
    // Always include current month and previous 2 months so 12-week heatmap and cross-month streaks are smooth
    monthsToFetch.add(currentMonth);
    
    const prev1 = shiftDate(`${currentMonth}-01`, -15).substring(0, 7);
    const prev2 = shiftDate(`${prev1}-01`, -15).substring(0, 7);
    monthsToFetch.add(prev1);
    monthsToFetch.add(prev2);

    // If query requested all or specific range
    const allLogs = {};

    await Promise.all(
      Array.from(monthsToFetch).map(async (m) => {
        try {
          const logFile = await getRepoFile(octokit, session.username, TARGET_REPO, `data/${m}.json`);
          if (logFile.exists) {
            const parsed = JSON.parse(logFile.content);
            Object.assign(allLogs, parsed);
          }
        } catch (e) {
          // File does not exist yet for this month, which is expected
        }
      })
    );

    const streaks = calculateStreaks(allLogs, habits);

    // Target month data specifically
    const targetMonthLogs = {};
    for (const [dateKey, entry] of Object.entries(allLogs)) {
      if (dateKey.startsWith(targetMonth)) {
        targetMonthLogs[dateKey] = entry;
      }
    }

    return res.status(200).json({
      month: targetMonth,
      logs: targetMonthLogs,
      allLogs,
      streaks,
      habits,
    });
  } catch (err) {
    console.error('Error in /api/log:', err);
    return res.status(500).json({ error: 'Failed to fetch habit log from GitHub.' });
  }
}
