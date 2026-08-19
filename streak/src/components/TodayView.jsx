import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Check, Flame, GitCommit, Loader2, Sparkles, Clock, AlertCircle, ExternalLink, Plus, Edit2, Zap } from 'lucide-react';
import { formatDate, formatDisplayDate, shiftDate, isInGracePeriod } from '../lib/dateUtils';
import { STAT_ATTRIBUTES } from '../lib/rpgEngine';
import QuestModal from './QuestModal';

export default function TodayView({
  habits = [],
  logs = {},
  streaks = {},
  rpgStats = {},
  onCheckinSuccess,
  onSaveQuest,
  onDeleteQuest,
  isDevMode = false,
}) {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [lastCommitInfo, setLastCommitInfo] = useState(null);

  // Quest Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questToEdit, setQuestToEdit] = useState(null);

  const isGracePeriod = isInGracePeriod();
  const todayStr = formatDate(new Date());
  const yesterdayStr = shiftDate(todayStr, -1);

  useEffect(() => {
    const existingEntry = logs[selectedDate];
    if (existingEntry) {
      setSelectedHabits(existingEntry.habits || []);
      setNote(existingEntry.note || '');
    } else {
      setSelectedHabits([]);
      setNote('');
    }
    setSubmitError(null);
    setLastCommitInfo(null);
  }, [selectedDate, logs]);

  const toggleHabit = (id) => {
    setSelectedHabits((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleOpenAddModal = () => {
    setQuestToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e, habit) => {
    e.stopPropagation();
    setQuestToEdit(habit);
    setIsModalOpen(true);
  };

  const handleCommit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await onCheckinSuccess({
        date: selectedDate,
        habits: selectedHabits,
        note,
      });

      if (res?.commit) {
        setLastCommitInfo(res.commit);
      }

      if (selectedHabits.length > 0) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#38bdf8', '#0070f3', '#c084fc', '#fbbf24'],
        });
      }
    } catch (err) {
      setSubmitError(err.message || 'Check-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlreadyCommitted = Boolean(logs[selectedDate]?.updatedAt || logs[selectedDate]?.completedAt);
  const completionCount = selectedHabits.length;
  const totalHabits = habits.length || 1;
  const earnedExpToday = completionCount * 50;

  return (
    <div className="space-y-5">
      {/* Date Header & Grace Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest font-extrabold text-system-cyan flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {selectedDate === todayStr ? '[DAILY QUEST: ACTIVE]' : '[PENALTY GRACE PERIOD]'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
            {formatDisplayDate(selectedDate)}
          </h2>
        </div>

        {/* Grace Period Switcher */}
        {isGracePeriod && (
          <div className="flex items-center bg-[#0d1527] border border-[#1e2e4e] rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedDate === todayStr
                  ? 'bg-system-cyan/20 text-system-cyan font-bold border border-system-cyan/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(yesterdayStr)}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                selectedDate === yesterdayStr
                  ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Yesterday</span>
            </button>
          </div>
        )}
      </div>

      {/* Holographic System Notification Banner */}
      <div className="system-window rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-system-cyan/20 text-system-cyan border border-system-cyan/40">
                DAILY QUEST
              </span>
              <span className="text-xs font-mono text-slate-400">
                Survival of the Weak
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight font-mono">
              [Prepare to Become Strong]
            </h3>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-xs font-mono font-extrabold text-system-cyan bg-[#081226] px-3 py-1.5 rounded-lg border border-system-cyan/40">
              +{earnedExpToday} EXP
            </span>
          </div>
        </div>

        {/* Level EXP Gauge */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-semibold">
              Level {rpgStats.level || 1} Progress
            </span>
            <span className="text-system-cyan font-bold">
              {rpgStats.currentLevelExp || 0} / {rpgStats.nextLevelExpTarget || 100} EXP ({rpgStats.expPercent || 0}%)
            </span>
          </div>
          <div className="w-full bg-[#060a14] rounded-full h-3 overflow-hidden border border-[#1a2942]">
            <div
              className="bg-gradient-to-r from-system-blue via-system-cyan to-system-cyanGlow h-full rounded-full transition-all duration-500 shadow-system-glow"
              style={{ width: `${rpgStats.expPercent || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quests Checklist Header & Add Action */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-system-cyan flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-system-cyan" />
            <span>Assigned Daily Quests ({completionCount}/{totalHabits})</span>
          </label>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-system-cyan/20 text-system-cyan hover:bg-system-cyan/30 border border-system-cyan/50 text-xs font-bold font-mono transition-all tap-bounce shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Quest</span>
          </button>
        </div>

        {/* Quests Grid */}
        <div className="space-y-2.5">
          {habits.map((habit) => {
            const isChecked = selectedHabits.includes(habit.id);
            const attr = habit.attribute || 'STR';
            const statInfo = STAT_ATTRIBUTES.find((s) => s.id === attr);

            return (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`relative flex items-center justify-between p-4 rounded-2xl border text-left cursor-pointer transition-all duration-150 tap-bounce ${
                  isChecked
                    ? 'system-card-active'
                    : 'system-card'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl flex-shrink-0">{habit.emoji || '⚔️'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold tracking-tight ${isChecked ? 'text-system-cyan' : 'text-white'}`}>
                        {habit.name}
                      </p>
                      <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-[#080e1c] border border-[#1e2e4e] ${statInfo?.color || 'text-system-cyan'}`}>
                        +{attr}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{streaks.habitStats?.[habit.id]?.currentStreak || 0}d streak</span>
                      <span>•</span>
                      <span className="text-system-cyan font-semibold">+50 EXP</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Edit Quest Button */}
                  <button
                    onClick={(e) => handleOpenEditModal(e, habit)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-system-cyan hover:bg-[#132140] transition-colors"
                    title="Edit quest"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Checkmark indicator */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-system-cyan text-[#060913] shadow-system-glow font-bold'
                        : 'border-2 border-[#1e2e4e] bg-[#060a14] text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3.5]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quest Notes / Combat Log */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-system-cyan flex items-center justify-between">
          <span>Hunter Quest Log (Optional)</span>
          <span className="text-[10px] text-slate-400 lowercase font-normal">saved to JSON file</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Cleared 2 Medium DP algorithm dungeons, 100 pushups completed..."
          rows={2}
          className="w-full bg-[#0d1527] border border-[#1e2e4e] rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-system-cyan focus:ring-1 focus:ring-system-cyan font-sans transition-all"
        />
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="bg-system-danger/20 border border-system-danger/50 text-rose-300 p-3.5 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Commit / Quest Completion Action */}
      <div className="pt-2 space-y-3">
        <button
          onClick={handleCommit}
          disabled={isSubmitting}
          className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-system-blue via-system-cyan to-system-cyanGlow hover:brightness-110 text-[#060913] font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-system-glow transition-all duration-150 tap-bounce disabled:opacity-50 disabled:cursor-not-allowed border border-system-cyan"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-mono">[COMMITTING TO GITHUB...]</span>
            </>
          ) : (
            <>
              <GitCommit className="w-5 h-5 stroke-[2.5]" />
              <span className="font-mono tracking-wide">
                {isAlreadyCommitted ? 'UPDATE QUEST COMMIT' : 'CLAIM EXP & COMMIT TO GITHUB'}
              </span>
            </>
          )}
        </button>

        {/* Commit Feedback Info */}
        {lastCommitInfo && (
          <div className="bg-[#0d1527] border border-system-cyan/50 rounded-xl p-3 text-xs text-system-cyan flex items-center justify-between animate-fade-in font-mono">
            <div className="flex items-center gap-2 overflow-hidden">
              <Check className="w-4 h-4 text-system-cyan flex-shrink-0" />
              <span className="truncate">{lastCommitInfo.message}</span>
            </div>
            {lastCommitInfo.htmlUrl && (
              <a
                href={lastCommitInfo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-system-cyan hover:underline flex-shrink-0 ml-2 font-sans font-bold"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Quest Modal for Adding & Editing */}
      <QuestModal
        isOpen={isModalOpen}
        initialQuest={questToEdit}
        onClose={() => setIsModalOpen(false)}
        onSaveQuest={onSaveQuest}
        onDeleteQuest={onDeleteQuest}
      />
    </div>
  );
}
