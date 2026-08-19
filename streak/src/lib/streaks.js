/**
 * Helper to get YYYY-MM-DD string for a Date
 */
export function formatDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date shifted by N days
 */
export function shiftDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/**
 * Calculate comprehensive streak statistics given log entries and active habits.
 *
 * @param {Object} allLogs - Object mapping 'YYYY-MM-DD' -> { habits: string[], note?: string }
 * @param {Array} habits - List of { id, name, emoji }
 * @param {string} referenceDateStr - 'YYYY-MM-DD', defaults to today
 */
export function calculateStreaks(allLogs = {}, habits = [], referenceDateStr = null) {
  const today = referenceDateStr || formatDate(new Date());
  const yesterday = shiftDate(today, -1);

  // 1. Overall Current Streak
  let overallCurrent = 0;
  let cursor = null;

  const todayHasActivity = Array.isArray(allLogs[today]?.habits) && allLogs[today].habits.length > 0;
  const yesterdayHasActivity = Array.isArray(allLogs[yesterday]?.habits) && allLogs[yesterday].habits.length > 0;

  if (todayHasActivity) {
    cursor = today;
  } else if (yesterdayHasActivity) {
    cursor = yesterday;
  }

  if (cursor) {
    while (cursor) {
      const entry = allLogs[cursor];
      if (entry && Array.isArray(entry.habits) && entry.habits.length > 0) {
        overallCurrent++;
        cursor = shiftDate(cursor, -1);
      } else {
        break;
      }
    }
  }

  // 2. Overall Longest Streak
  const allDates = Object.keys(allLogs).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  
  let overallLongest = 0;
  let tempOverall = 0;
  let prevDate = null;

  for (const d of allDates) {
    const entry = allLogs[d];
    const hasHabits = entry && Array.isArray(entry.habits) && entry.habits.length > 0;
    
    if (hasHabits) {
      if (prevDate && shiftDate(prevDate, 1) === d) {
        tempOverall++;
      } else {
        tempOverall = 1;
      }
      prevDate = d;
      if (tempOverall > overallLongest) {
        overallLongest = tempOverall;
      }
    } else {
      tempOverall = 0;
      prevDate = null;
    }
  }

  overallLongest = Math.max(overallLongest, overallCurrent);

  // 3. Per-Habit Streaks & Month Stats
  const currentMonthPrefix = today.substring(0, 7); // 'YYYY-MM'
  const dayOfMonth = parseInt(today.substring(8, 10), 10);

  const habitStats = {};

  for (const habit of habits) {
    const hid = habit.id;

    // Current streak for this habit
    let habitCurrent = 0;
    let hCursor = null;

    const doneToday = allLogs[today]?.habits?.includes(hid);
    const doneYesterday = allLogs[yesterday]?.habits?.includes(hid);

    if (doneToday) {
      hCursor = today;
    } else if (doneYesterday) {
      hCursor = yesterday;
    }

    if (hCursor) {
      while (hCursor) {
        if (allLogs[hCursor]?.habits?.includes(hid)) {
          habitCurrent++;
          hCursor = shiftDate(hCursor, -1);
        } else {
          break;
        }
      }
    }

    // Longest streak for this habit
    let habitLongest = 0;
    let tempHabit = 0;
    let prevHabitDate = null;

    for (const d of allDates) {
      if (allLogs[d]?.habits?.includes(hid)) {
        if (prevHabitDate && shiftDate(prevHabitDate, 1) === d) {
          tempHabit++;
        } else {
          tempHabit = 1;
        }
        prevHabitDate = d;
        if (tempHabit > habitLongest) {
          habitLongest = tempHabit;
        }
      } else {
        tempHabit = 0;
        prevHabitDate = null;
      }
    }

    habitLongest = Math.max(habitLongest, habitCurrent);

    // This month completion rate
    let thisMonthCount = 0;
    let totalAllTimeCount = 0;

    for (const d of allDates) {
      if (allLogs[d]?.habits?.includes(hid)) {
        totalAllTimeCount++;
        if (d.startsWith(currentMonthPrefix)) {
          thisMonthCount++;
        }
      }
    }

    const completionRate = dayOfMonth > 0 ? Math.round((thisMonthCount / dayOfMonth) * 100) : 0;

    habitStats[hid] = {
      id: hid,
      name: habit.name,
      emoji: habit.emoji,
      currentStreak: habitCurrent,
      longestStreak: habitLongest,
      thisMonthCount,
      totalCompletions: totalAllTimeCount,
      completionRate: Math.min(100, completionRate),
      completedToday: Boolean(doneToday),
    };
  }

  return {
    today,
    overallCurrentStreak: overallCurrent,
    overallLongestStreak: overallLongest,
    todayCompletedCount: allLogs[today]?.habits?.length || 0,
    totalTrackedDays: allDates.filter(d => allLogs[d]?.habits?.length > 0).length,
    habitStats,
  };
}
