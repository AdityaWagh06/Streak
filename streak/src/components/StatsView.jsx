import React from 'react';
import { Flame, Trophy, Award, Sparkles, Zap, Shield } from 'lucide-react';
import { STAT_ATTRIBUTES } from '../lib/rpgEngine';

export default function StatsView({ habits = [], streaks = {}, rpgStats = {}, user }) {
  const overallCurrent = streaks.overallCurrentStreak || 0;
  const overallLongest = streaks.overallLongestStreak || 0;
  const habitStats = streaks.habitStats || {};

  const attributes = rpgStats.attributes || { STR: 10, INT: 10, AGI: 10, VIT: 10, DISC: 10 };
  const achievements = rpgStats.achievements || [];

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <span className="text-[11px] uppercase font-mono tracking-widest font-extrabold text-system-cyan flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PLAYER PROFILE</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
          System Status Window
        </h2>
      </div>

      {/* Main Holographic Player Sheet */}
      <div className="system-window rounded-2xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="system-window-header p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-system-cyan uppercase">
                HUNTER STATUS
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white font-mono flex items-center gap-2">
                <span>{user?.name || user?.username || 'PLAYER'}</span>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border font-extrabold ${rpgStats.badgeColor}`}>
                  {rpgStats.rank}
                </span>
              </h3>
              <p className="text-xs font-mono text-system-cyanGlow mt-0.5">
                Title: <strong className="text-white">{rpgStats.title}</strong>
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block p-2.5 rounded-xl bg-[#080e1c] border border-system-cyan/50 text-center shadow-inner">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Level</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-system-cyan">
                  {rpgStats.level || 1}
                </span>
              </div>
            </div>
          </div>

          {/* EXP Gauge */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">EXP Gauge</span>
              <span className="text-system-cyan font-bold">
                {rpgStats.currentLevelExp || 0} / {rpgStats.nextLevelExpTarget || 100} EXP ({rpgStats.expPercent || 0}%)
              </span>
            </div>
            <div className="w-full bg-[#060a14] rounded-full h-2.5 overflow-hidden border border-[#1a2942]">
              <div
                className="bg-gradient-to-r from-system-blue via-system-cyan to-system-cyanGlow h-full rounded-full transition-all duration-500 shadow-system-glow"
                style={{ width: `${rpgStats.expPercent || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top 3 Core Combat Metrics */}
        <div className="grid grid-cols-3 divide-x divide-[#1a2742] border-t border-[#1a2742] bg-[#091020] py-3 text-center">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Streak</span>
            <span className="text-base sm:text-lg font-black font-mono text-amber-300">
              {overallCurrent}d 🔥
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Best Streak</span>
            <span className="text-base sm:text-lg font-black font-mono text-system-purpleGlow">
              {overallLongest}d ⚡
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total EXP</span>
            <span className="text-base sm:text-lg font-black font-mono text-system-cyan">
              {rpgStats.totalExp || 0} XP
            </span>
          </div>
        </div>

        {/* Attribute Distribution Matrix */}
        <div className="p-5 space-y-3 bg-[#080d1a] border-t border-[#1a2742]">
          <span className="text-[11px] font-mono uppercase text-system-cyan font-bold tracking-wider block">
            [RPG ATTRIBUTE MATRIX]
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STAT_ATTRIBUTES.map((stat) => {
              const val = attributes[stat.id] || 10;
              const barPercent = Math.min(100, Math.round((val / 100) * 100));

              return (
                <div key={stat.id} className="bg-[#0e1629] border border-[#1e2e4e] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{stat.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-white font-mono block leading-none">
                          {stat.name} ({stat.id})
                        </span>
                        <span className="text-[10px] text-slate-400 leading-none">
                          {stat.desc}
                        </span>
                      </div>
                    </div>
                    <span className={`text-sm font-black font-mono ${stat.color}`}>
                      {val}
                    </span>
                  </div>

                  <div className="w-full bg-[#060a14] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-system-blue to-system-cyan h-full rounded-full transition-all duration-500"
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quest Mastery Breakdown */}
      <div className="space-y-3">
        <span className="text-[11px] font-mono uppercase text-system-cyan font-bold tracking-wider block">
          [DAILY QUEST MASTERY & CONSISTENCY]
        </span>

        <div className="space-y-2.5">
          {habits.map((habit) => {
            const stat = habitStats[habit.id] || {
              currentStreak: 0,
              longestStreak: 0,
              thisMonthCount: 0,
              completionRate: 0,
              totalCompletions: 0,
            };

            return (
              <div
                key={habit.id}
                className="system-window rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{habit.emoji || '⚔️'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">
                        {habit.name}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400">
                        {stat.totalCompletions} all-time clears (+{stat.totalCompletions * 50} EXP)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <div className="bg-[#080e1c] px-2 py-0.5 rounded border border-[#1e2e4e] text-center">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {stat.currentStreak}d
                      </span>
                      <p className="text-[8px] font-mono text-slate-500 uppercase">streak</p>
                    </div>
                    <div className="bg-[#080e1c] px-2 py-0.5 rounded border border-[#1e2e4e] text-center">
                      <span className="text-xs font-mono font-bold text-system-cyan">
                        {stat.completionRate}%
                      </span>
                      <p className="text-[8px] font-mono text-slate-500 uppercase">rate</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Solo Leveling Raid Boss Achievements */}
      <div className="space-y-3">
        <span className="text-[11px] font-mono uppercase text-system-cyan font-bold tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          <span>[SOLO RAID MILESTONES]</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                ach.unlocked
                  ? 'system-window border-system-cyan/60 shadow-system-glow'
                  : 'bg-[#0a0f1d] border-[#162238] opacity-40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ach.icon}</span>
                <div>
                  <h5 className="text-xs font-bold font-mono text-white">
                    {ach.name}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {ach.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
