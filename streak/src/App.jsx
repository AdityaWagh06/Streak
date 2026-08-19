import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  checkAuth,
  fetchHabits,
  fetchLogs,
  submitCheckin,
  saveHabitsSettings,
  logout,
  DEMO_USER,
} from './lib/api';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import OfflineBanner from './components/OfflineBanner';
import LoginView from './components/LoginView';
import TodayView from './components/TodayView';
import HistoryView from './components/HistoryView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import { Loader2, Zap } from 'lucide-react';
import { calculateStreaks } from './lib/streaks';
import { calculatePlayerRPG, DEFAULT_SOLO_QUESTS } from './lib/rpgEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [hasOAuthConfig, setHasOAuthConfig] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // App Data
  const [habits, setHabits] = useState(DEFAULT_SOLO_QUESTS);
  const [logs, setLogs] = useState({});
  const [streaks, setStreaks] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(false);

  // 1. Check initial authentication status
  const initializeAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const authData = await checkAuth();
      setHasOAuthConfig(authData.hasOAuthConfig);

      if (authData.authenticated && authData.user) {
        setIsAuthenticated(true);
        setUser(authData.user);
      } else {
        const savedDev = localStorage.getItem('streak_dev_mode') === 'true';
        if (savedDev) {
          setIsDevMode(true);
          setIsAuthenticated(true);
          setUser(DEMO_USER);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 2. Load habits & logs once authenticated
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);

    try {
      if (isDevMode) {
        const storedHabits = JSON.parse(localStorage.getItem('streak_demo_habits') || 'null') || DEFAULT_SOLO_QUESTS;
        const storedLogs = JSON.parse(localStorage.getItem('streak_demo_logs') || '{}');
        const calculated = calculateStreaks(storedLogs, storedHabits);

        setHabits(storedHabits);
        setLogs(storedLogs);
        setStreaks(calculated);
      } else {
        const [habitsRes, logsRes] = await Promise.all([
          fetchHabits(),
          fetchLogs(),
        ]);

        const activeHabits = habitsRes.habits || DEFAULT_SOLO_QUESTS;
        const allLogs = logsRes.allLogs || logsRes.logs || {};
        const calculatedStreaks = logsRes.streaks || calculateStreaks(allLogs, activeHabits);

        setHabits(activeHabits);
        setLogs(allLogs);
        setStreaks(calculatedStreaks);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, isDevMode]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Compute RPG Level & Stats dynamically
  const rpgStats = useMemo(() => {
    return calculatePlayerRPG(logs, habits, streaks);
  }, [logs, habits, streaks]);

  // 3. Handle checkin commit
  const handleCheckinSuccess = async ({ date, habits: checkedHabits, note }) => {
    if (isDevMode) {
      const updatedLogs = {
        ...logs,
        [date]: {
          date,
          habits: checkedHabits,
          note: note.trim(),
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem('streak_demo_logs', JSON.stringify(updatedLogs));
      const freshStreaks = calculateStreaks(updatedLogs, habits);

      setLogs(updatedLogs);
      setStreaks(freshStreaks);

      return {
        success: true,
        entry: updatedLogs[date],
        streaks: freshStreaks,
        commit: {
          message: `Quest Log ${date}: ${checkedHabits.length} quests cleared • Lv. ${rpgStats.level} Hunter (Dev Mode)`,
          htmlUrl: null,
        },
      };
    }

    const result = await submitCheckin({ date, habits: checkedHabits, note });
    if (result.entry) {
      setLogs((prev) => ({
        ...prev,
        [date]: result.entry,
      }));
    }
    if (result.streaks) {
      setStreaks(result.streaks);
    }
    return result;
  };

  // 4. Save/Update Quest list
  const handleSaveHabits = async (updatedHabits) => {
    if (isDevMode) {
      localStorage.setItem('streak_demo_habits', JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
      const freshStreaks = calculateStreaks(logs, updatedHabits);
      setStreaks(freshStreaks);
      return { success: true, habits: updatedHabits };
    }

    const result = await saveHabitsSettings(updatedHabits);
    if (result.habits) {
      setHabits(result.habits);
      const freshStreaks = calculateStreaks(logs, result.habits);
      setStreaks(freshStreaks);
    }
    return result;
  };

  // Add / Edit Single Quest helper
  const handleSaveSingleQuest = async (questData) => {
    const exists = habits.some((h) => h.id === questData.id);
    let updated;
    if (exists) {
      updated = habits.map((h) => (h.id === questData.id ? questData : h));
    } else {
      updated = [...habits, questData];
    }
    await handleSaveHabits(updated);
  };

  // Delete Single Quest helper
  const handleDeleteSingleQuest = async (questId) => {
    if (habits.length <= 1) {
      alert('You must have at least one active quest.');
      return;
    }
    const updated = habits.filter((h) => h.id !== questId);
    await handleSaveHabits(updated);
  };

  // 5. Dev login trigger
  const handleDevLogin = () => {
    localStorage.setItem('streak_dev_mode', 'true');
    setIsDevMode(true);
    setIsAuthenticated(true);
    setUser(DEMO_USER);
  };

  // 6. Logout trigger
  const handleLogout = async () => {
    if (isDevMode) {
      localStorage.removeItem('streak_dev_mode');
      setIsDevMode(false);
    } else {
      await logout();
    }
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('today');
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center space-y-3 text-system-cyan font-mono">
        <Zap className="w-9 h-9 fill-system-cyan animate-system-pulse" />
        <p className="text-xs uppercase tracking-widest">[INITIALIZING SYSTEM HUD...]</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060913] text-[#e2e8f0]">
        <OfflineBanner />
        <LoginView
          onDevLogin={handleDevLogin}
          hasOAuthConfig={hasOAuthConfig}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-[#e2e8f0] flex flex-col justify-between">
      <OfflineBanner />

      {/* Solid Top Header */}
      <Navbar
        user={user}
        streak={streaks.overallCurrentStreak || 0}
        playerLevel={rpgStats.level || 1}
        hunterRank={rpgStats.rank || 'E-Rank'}
        badgeColor={rpgStats.badgeColor}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main View Container with Proper Padding to Avoid Nav/Footer Overlap */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-4 pb-28 sm:pb-32">
        {isLoadingData ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2 text-system-cyan font-mono text-xs">
            <Loader2 className="w-7 h-7 animate-spin text-system-cyan" />
            <p>[SYSTEM: SYNCING HUNTER QUEST DATA...]</p>
          </div>
        ) : (
          <>
            {activeTab === 'today' && (
              <TodayView
                habits={habits}
                logs={logs}
                streaks={streaks}
                rpgStats={rpgStats}
                onCheckinSuccess={handleCheckinSuccess}
                onSaveQuest={handleSaveSingleQuest}
                onDeleteQuest={handleDeleteSingleQuest}
                isDevMode={isDevMode}
              />
            )}
            {activeTab === 'history' && (
              <HistoryView
                logs={logs}
                habits={habits}
                user={user}
              />
            )}
            {activeTab === 'stats' && (
              <StatsView
                habits={habits}
                streaks={streaks}
                rpgStats={rpgStats}
                user={user}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView
                habits={habits}
                user={user}
                rpgStats={rpgStats}
                onSaveHabits={handleSaveHabits}
                onLogout={handleLogout}
                isDevMode={isDevMode}
              />
            )}
          </>
        )}
      </main>

      {/* Solid Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
