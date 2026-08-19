export const STAT_ATTRIBUTES = [
  { id: 'STR', name: 'Strength', icon: '🏋️', color: 'text-rose-400', desc: 'Physical conditioning & workouts' },
  { id: 'INT', name: 'Intelligence', icon: '🧠', color: 'text-cyan-400', desc: 'Coding, algorithms & deep reading' },
  { id: 'AGI', name: 'Agility', icon: '⚡', color: 'text-amber-400', desc: 'Speed, reflex & rapid execution' },
  { id: 'VIT', name: 'Vitality', icon: '💧', color: 'text-emerald-400', desc: 'Hydration, recovery & sleep' },
  { id: 'DISC', name: 'Discipline', icon: '🛡️', color: 'text-purple-400', desc: 'Streak consistency & willpower' },
];

export const HUNTER_RANKS = [
  { minLevel: 1, maxLevel: 4, rank: 'E-Rank', title: 'The Weakest Hunter', badgeColor: 'bg-slate-800 text-slate-300 border-slate-600', glow: 'border-slate-500' },
  { minLevel: 5, maxLevel: 9, rank: 'D-Rank', title: 'D-Rank Striker', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-600', glow: 'border-emerald-500' },
  { minLevel: 10, maxLevel: 19, rank: 'C-Rank', title: 'C-Rank Vanguard', badgeColor: 'bg-sky-950 text-sky-300 border-sky-600', glow: 'border-sky-500' },
  { minLevel: 20, maxLevel: 34, rank: 'B-Rank', title: 'B-Rank Assassin', badgeColor: 'bg-purple-950 text-purple-300 border-purple-600', glow: 'border-purple-500' },
  { minLevel: 35, maxLevel: 49, rank: 'A-Rank', title: 'A-Rank Archmage', badgeColor: 'bg-amber-950 text-amber-300 border-amber-500', glow: 'border-amber-400' },
  { minLevel: 50, maxLevel: 99, rank: 'S-Rank', title: 'S-Rank National Hunter', badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-400', glow: 'border-cyan-400 shadow-system-glow' },
  { minLevel: 100, maxLevel: 9999, rank: 'Monarch', title: '👑 Shadow Monarch', badgeColor: 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-400', glow: 'border-fuchsia-400 shadow-system-purple' },
];

export const DEFAULT_SOLO_QUESTS = [
  { id: 'workout', name: 'Physical Conditioning [Push-ups & Gym]', emoji: '🏋️', attribute: 'STR' },
  { id: 'coding', name: 'Arcane Algorithms [LeetCode / DSA]', emoji: '🧠', attribute: 'INT' },
  { id: 'reading', name: 'Grimoire Study [Deep Reading]', emoji: '📖', attribute: 'INT' },
  { id: 'hydration', name: 'Mana Recovery [Hydration & Sleep]', emoji: '💧', attribute: 'VIT' },
  { id: 'building', name: 'Artifact Crafting [Shipped Something]', emoji: '⚔️', attribute: 'AGI' }
];

export const RAID_ACHIEVEMENTS = [
  {
    id: 'first_quest',
    name: "Kasaka's Fang",
    desc: 'Completed your first daily quest.',
    icon: '🗡️',
    minTrackedDays: 1,
    minStreak: 1,
  },
  {
    id: 'red_gate',
    name: 'Red Gate Survivor',
    desc: 'Achieved a 7-day uninterrupted streak.',
    icon: '⛩️',
    minStreak: 7,
  },
  {
    id: 'demon_castle',
    name: 'Demon Castle Conqueror',
    desc: 'Reached 30-day streak milestone.',
    icon: '🏰',
    minStreak: 30,
  },
  {
    id: 'igris_shadow',
    name: 'Igris Knight Commander',
    desc: 'Completed 50 days of rigorous quests.',
    minTrackedDays: 50,
    icon: '🛡️',
  },
  {
    id: 'shadow_monarch',
    name: 'ARISE: Shadow Sovereign',
    desc: 'Reached 100 days of quest discipline.',
    minTrackedDays: 100,
    icon: '👑',
  }
];

/**
 * Computes player EXP, Level, Rank, and Attribute Points
 */
export function calculatePlayerRPG(allLogs = {}, habits = [], streaks = {}) {
  const habitMap = new Map(habits.map((h) => [h.id, h]));

  let totalExp = 0;
  let totalQuestCompletions = 0;

  const attributes = {
    STR: 10,
    INT: 10,
    AGI: 10,
    VIT: 10,
    DISC: 10,
  };

  // Base points from overall streaks
  const currentStreak = streaks.overallCurrentStreak || 0;
  const longestStreak = streaks.overallLongestStreak || 0;
  attributes.DISC += Math.floor(longestStreak * 2);

  // Process all logs
  for (const [date, entry] of Object.entries(allLogs)) {
    if (entry && Array.isArray(entry.habits) && entry.habits.length > 0) {
      entry.habits.forEach((hid) => {
        totalQuestCompletions++;
        totalExp += 50; // 50 EXP per quest

        const habit = habitMap.get(hid);
        const attr = habit?.attribute || 'DISC';
        if (attributes[attr] !== undefined) {
          attributes[attr] += 1;
        }
      });
    }
  }

  // Bonus EXP from active streak multiplier
  const streakBonusExp = currentStreak * 25;
  totalExp += streakBonusExp;

  // Level Progression Formula
  // Lv 1: 0 - 100 XP
  // Lv 2: 100 - 250 XP
  // Lv 3: 250 - 450 XP ...
  let level = 1;
  let expRemaining = totalExp;
  let expRequiredForNext = 100;

  while (expRemaining >= expRequiredForNext) {
    expRemaining -= expRequiredForNext;
    level++;
    expRequiredForNext = level * 100;
  }

  const currentLevelExp = expRemaining;
  const nextLevelExpTarget = expRequiredForNext;
  const expPercent = Math.min(100, Math.round((currentLevelExp / nextLevelExpTarget) * 100));

  // Determine Rank
  const rankInfo = HUNTER_RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel) || HUNTER_RANKS[HUNTER_RANKS.length - 1];

  // Achievements
  const totalDays = streaks.totalTrackedDays || 0;
  const unlockedAchievements = RAID_ACHIEVEMENTS.map((ach) => {
    let unlocked = false;
    if (ach.minStreak && longestStreak >= ach.minStreak) unlocked = true;
    if (ach.minTrackedDays && totalDays >= ach.minTrackedDays) unlocked = true;
    return { ...ach, unlocked };
  });

  return {
    level,
    totalExp,
    currentLevelExp,
    nextLevelExpTarget,
    expPercent,
    rank: rankInfo.rank,
    title: rankInfo.title,
    badgeColor: rankInfo.badgeColor,
    glow: rankInfo.glow,
    totalQuestCompletions,
    attributes,
    achievements: unlockedAchievements,
  };
}
