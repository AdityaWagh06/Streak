import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, ExternalLink, LogOut, GitBranch, Save, Loader2, Sliders } from 'lucide-react';
import QuestModal from './QuestModal';
import { STAT_ATTRIBUTES } from '../lib/rpgEngine';

export default function SettingsView({ habits = [], user, rpgStats = {}, onSaveHabits, onLogout, isDevMode = false }) {
  const [habitList, setHabitList] = useState([...habits]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questToEdit, setQuestToEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleOpenAdd = () => {
    setQuestToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (quest) => {
    setQuestToEdit(quest);
    setIsModalOpen(true);
  };

  const handleSaveModalQuest = (questData) => {
    if (questToEdit) {
      setHabitList((prev) =>
        prev.map((h) => (h.id === questData.id ? questData : h))
      );
    } else {
      setHabitList((prev) => [...prev, questData]);
    }
  };

  const handleDeleteModalQuest = (questId) => {
    if (habitList.length <= 1) {
      alert('You must have at least one active quest.');
      return;
    }
    setHabitList((prev) => prev.filter((h) => h.id !== questId));
  };

  const handleCommitHabits = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await onSaveHabits(habitList);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save quests');
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = JSON.stringify(habitList) !== JSON.stringify(habits);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <span className="text-[11px] uppercase font-mono tracking-widest font-extrabold text-system-cyan flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>SYSTEM CONFIGURATION</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
          Settings & Quests
        </h2>
      </div>

      {/* Hunter Profile Info */}
      <div className="system-window rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.username}
                className="w-12 h-12 rounded-full border border-system-cyan/60 object-cover shadow-system-glow"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#080e1c] border border-system-cyan/50 flex items-center justify-center font-mono font-bold text-system-cyan text-sm">
                {user?.username?.slice(0, 2).toUpperCase() || 'PL'}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>{user?.name || user?.username || 'HUNTER'}</span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border font-bold ${rpgStats.badgeColor}`}>
                  {rpgStats.rank}
                </span>
              </p>
              <p className="text-xs font-mono text-slate-400">
                @{user?.username || 'player'} • Level {rpgStats.level || 1}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1e2e4e] hover:border-system-danger/50 hover:bg-system-danger/20 text-slate-400 hover:text-rose-300 text-xs font-mono transition-colors tap-bounce"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Link to GitHub Repository */}
        {user?.username && (
          <div className="pt-2 border-t border-[#1a2742]">
            <a
              href={`https://github.com/${user.username}/daily-streak-log`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-[#080e1c] border border-[#1e2e4e] hover:border-system-cyan transition-all text-xs font-mono text-system-cyan group"
            >
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-system-cyan" />
                <span>{user.username}/daily-streak-log</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-system-cyan" />
            </a>
          </div>
        )}
      </div>

      {/* Quest Editor Section */}
      <div className="system-window rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-mono">
              [QUEST MANAGEMENT MATRIX]
            </h3>
            <p className="text-xs text-slate-400">
              Add, edit, attribute-tag, or delete quests.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-system-cyan/20 text-system-cyan hover:bg-system-cyan/30 border border-system-cyan/50 text-xs font-bold font-mono transition-colors tap-bounce shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Quest</span>
          </button>
        </div>

        {/* Quest List */}
        <div className="space-y-2.5">
          {habitList.map((habit) => {
            const attr = habit.attribute || 'STR';
            const statInfo = STAT_ATTRIBUTES.find((s) => s.id === attr);

            return (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#080e1c] border border-[#1e2e4e]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{habit.emoji || '⚔️'}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white font-mono">
                        {habit.name}
                      </p>
                      <span className={`text-[9px] font-mono font-bold px-1 rounded bg-[#060a14] border border-[#1a2742] ${statInfo?.color || 'text-system-cyan'}`}>
                        +{attr}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500">id: {habit.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(habit)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-system-cyan hover:bg-[#132140] transition-colors"
                    title="Edit quest"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteModalQuest(habit.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Delete quest"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commit to GitHub Button */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleCommitHabits}
            disabled={isSaving || !hasUnsavedChanges}
            className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-mono font-extrabold flex items-center justify-center gap-2 transition-all duration-150 tap-bounce shadow-md ${
              hasUnsavedChanges
                ? 'bg-gradient-to-r from-system-cyan to-system-blue text-[#060913] hover:brightness-110 shadow-system-glow'
                : 'bg-[#080e1c] border border-[#1e2e4e] text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>COMMITTING TO GITHUB HABITS.JSON...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>
                  {hasUnsavedChanges ? 'COMMIT QUEST UPDATES TO GITHUB' : 'SYSTEM QUESTS SYNCED'}
                </span>
              </>
            )}
          </button>

          {saveSuccess && (
            <p className="text-xs text-center text-system-cyan font-mono animate-fade-in flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>[SYSTEM: Successfully committed to habits.json]</span>
            </p>
          )}

          {saveError && (
            <p className="text-xs text-center text-rose-400 font-mono animate-fade-in">
              {saveError}
            </p>
          )}
        </div>
      </div>

      {/* Quest Modal */}
      <QuestModal
        isOpen={isModalOpen}
        initialQuest={questToEdit}
        onClose={() => setIsModalOpen(false)}
        onSaveQuest={handleSaveModalQuest}
        onDeleteQuest={handleDeleteModalQuest}
      />
    </div>
  );
}
