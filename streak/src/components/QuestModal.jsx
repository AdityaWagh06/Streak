import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, Sparkles, Shield } from 'lucide-react';
import { STAT_ATTRIBUTES } from '../lib/rpgEngine';

const QUICK_EMOJIS = ['🏋️', '🧠', '📖', '💧', '⚔️', '⚡', '🛡️', '👑', '🧘', '🎯', '💻', '✍️', '🏃', '🍎', '💤'];

export default function QuestModal({ isOpen, onClose, onSaveQuest, onDeleteQuest, initialQuest = null }) {
  const isEditing = Boolean(initialQuest);

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('⚔️');
  const [attribute, setAttribute] = useState('STR');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialQuest) {
      setName(initialQuest.name || '');
      setEmoji(initialQuest.emoji || '⚔️');
      setAttribute(initialQuest.attribute || 'STR');
    } else {
      setName('');
      setEmoji('⚔️');
      setAttribute('STR');
    }
    setError('');
  }, [initialQuest, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a quest name.');
      return;
    }

    const id = initialQuest?.id || name.toLowerCase().replace(/[^a-z0-9]/g, '') || `quest-${Date.now()}`;
    
    onSaveQuest({
      id,
      name: name.trim(),
      emoji: emoji.trim() || '⚔️',
      attribute,
    });

    onClose();
  };

  const handleDelete = () => {
    if (!initialQuest) return;
    if (window.confirm(`Are you sure you want to delete the quest "${initialQuest.name}"?`)) {
      onDeleteQuest(initialQuest.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md system-window rounded-2xl overflow-hidden border border-system-cyan/50 shadow-system-glow-lg animate-scale-up">
        {/* Header */}
        <div className="system-window-header px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-system-cyan" />
            <h3 className="text-sm font-bold font-mono text-system-textWhite uppercase tracking-wider">
              {isEditing ? '[SYSTEM: EDIT QUEST]' : '[SYSTEM: REGISTER NEW QUEST]'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-system-textMuted hover:text-system-cyan transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-sans text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-system-danger/20 border border-system-danger/40 text-system-danger text-xs">
              {error}
            </div>
          )}

          {/* Quest Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-system-cyan font-bold tracking-wider">
              Quest Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 100 Push-ups [Daily Strength]"
              className="w-full bg-system-dark/90 border border-system-border rounded-xl px-3.5 py-2.5 text-sm text-system-textWhite placeholder:text-system-textMuted focus:outline-none focus:border-system-cyan focus:ring-1 focus:ring-system-cyan"
              autoFocus
            />
          </div>

          {/* Emoji Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-system-cyan font-bold tracking-wider">
              Quest Icon / Emoji
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className="w-12 text-center bg-system-dark border border-system-border rounded-xl p-2 text-xl focus:outline-none focus:border-system-cyan"
              />
              <div className="flex flex-wrap gap-1 flex-1">
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                      emoji === em
                        ? 'bg-system-cyan/20 border border-system-cyan scale-110'
                        : 'bg-system-surface hover:bg-system-surfaceHover border border-system-borderSubtle'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stat Attribute Boost */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-system-cyan font-bold tracking-wider">
              Stat Attribute Granted
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {STAT_ATTRIBUTES.map((stat) => {
                const isSelected = attribute === stat.id;
                return (
                  <button
                    key={stat.id}
                    type="button"
                    onClick={() => setAttribute(stat.id)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-system-cyan/20 border-system-cyan text-system-cyan shadow-sm shadow-system-cyan/30 ring-1 ring-system-cyan'
                        : 'bg-system-dark/70 border-system-border text-system-textMuted hover:border-system-borderGlow/40'
                    }`}
                  >
                    <span className="text-base">{stat.icon}</span>
                    <span className="text-[10px] font-mono font-bold">+{stat.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-system-borderSubtle">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-system-danger/10 text-system-danger hover:bg-system-danger/20 border border-system-danger/30 text-xs font-bold transition-colors tap-bounce"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Quest</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-system-border text-system-textMuted hover:text-system-textWhite text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-system-cyan to-system-blue text-system-void font-extrabold text-xs flex items-center gap-1.5 shadow-system-glow hover:brightness-110 transition-all tap-bounce"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isEditing ? 'Save Changes' : 'Create Quest'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
