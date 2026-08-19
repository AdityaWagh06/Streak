// API client with seamless error handling and dev preview fallback

export const DEMO_USER = {
  username: 'streak-builder',
  name: 'Dev Explorer',
  avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
};

export const INITIAL_DEFAULT_HABITS = [
  { id: 'leetcode', name: 'LeetCode / DSA', emoji: '🧩' },
  { id: 'gym', name: 'Gym / Workout', emoji: '🏋️' },
  { id: 'reading', name: 'Deep Reading', emoji: '📖' },
  { id: 'buildlog', name: 'Shipped Something', emoji: '🛠️' },
];

export async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) throw new Error('Auth check failed');
    return await res.json();
  } catch (err) {
    console.error('API checkAuth error:', err);
    return { authenticated: false, user: null, hasOAuthConfig: false };
  }
}

export async function fetchHabits() {
  const res = await fetch('/api/habits', { credentials: 'include' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to load habits');
  }
  return await res.json();
}

export async function fetchLogs(month = null) {
  const query = month ? `?month=${encodeURIComponent(month)}` : '';
  const res = await fetch(`/api/log${query}`, { credentials: 'include' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to load habit logs');
  }
  return await res.json();
}

export async function submitCheckin({ date, habits, note }) {
  const res = await fetch('/api/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ date, habits, note }),
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Check-in failed');
  }
  return data;
}

export async function saveHabitsSettings(habits) {
  const res = await fetch('/api/settings/habits', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ habits }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update habits');
  }
  return data;
}

export async function logout() {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
}
