import React, { useState } from 'react';
import { Calendar, GitCommit, Sparkles, Check, FileText, Zap } from 'lucide-react';
import { getWeeksForHeatmap, formatDisplayDate, formatDate, isDateToday } from '../lib/dateUtils';
import { STAT_ATTRIBUTES } from '../lib/rpgEngine';

export default function HistoryView({ logs = {}, habits = [], user }) {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const weeks = getWeeksForHeatmap(14);

  const habitMap = new Map(habits.map((h) => [h.id, h]));

  const getDayIntensity = (dateStr) => {
    const entry = logs[dateStr];
    if (!entry || !Array.isArray(entry.habits) || entry.habits.length === 0) {
      return 0;
    }
    const count = entry.habits.length;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
  };

  const selectedEntry = logs[selectedDate];
  const selectedCompletedHabits = (selectedEntry?.habits || []).map((hid) =>
    habitMap.get(hid) || { id: hid, name: hid, emoji: '⚔️', attribute: 'DISC' }
  );

  const monthHeaders = [];
  let lastMonth = -1;
  weeks.forEach((week, idx) => {
    const firstDay = week[0];
    if (firstDay && firstDay.month !== lastMonth) {
      monthHeaders.push({ name: firstDay.monthName, colIndex: idx });
      lastMonth = firstDay.month !== undefined ? firstDay.month : -1;
    }
  });

  const earnedExpOnSelectedDay = selectedCompletedHabits.length * 50;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <span className="text-[11px] uppercase font-mono tracking-widest font-extrabold text-system-cyan flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 fill-system-cyan" />
          <span>DUNGEON LOGS</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
          Raid Activity & Mana Grid
        </h2>
      </div>

      {/* Solid Mana Heatmap Window */}
      <div className="system-window rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Scrollable Heatmap */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="min-w-[420px]">
            {/* Month Labels */}
            <div className="flex text-[11px] font-mono text-system-cyan mb-1.5 pl-6 font-bold">
              {weeks.map((week, idx) => {
                const header = monthHeaders.find((h) => h.colIndex === idx);
                return (
                  <div key={idx} className="w-5 text-left">
                    {header ? header.name : ''}
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex gap-1.5">
              {/* Day Labels */}
              <div className="flex flex-col justify-between text-[9px] font-mono text-slate-500 pr-1 py-0.5 select-none">
                <span></span>
                <span>Mon</span>
                <span></span>
                <span>Wed</span>
                <span></span>
                <span>Fri</span>
                <span></span>
              </div>

              {/* 14 Week Columns */}
              <div className="flex gap-1">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1">
                    {week.map((day) => {
                      const level = getDayIntensity(day.dateStr);
                      const isSelected = day.dateStr === selectedDate;
                      const isFuture = day.isFuture;

                      return (
                        <button
                          key={day.dateStr}
                          disabled={isFuture}
                          onClick={() => setSelectedDate(day.dateStr)}
                          title={`${day.dateStr}: ${logs[day.dateStr]?.habits?.length || 0} quests cleared (+${(logs[day.dateStr]?.habits?.length || 0) * 50} EXP)`}
                          className={`w-4 h-4 rounded-sm transition-all duration-150 relative ${
                            isFuture
                              ? 'bg-transparent border border-slate-800/30 cursor-default opacity-20'
                              : level === 0
                              ? 'level-0 hover:border-system-cyan/50'
                              : level === 1
                              ? 'level-1 hover:brightness-125'
                              : level === 2
                              ? 'level-2 hover:brightness-125'
                              : level === 3
                              ? 'level-3 hover:brightness-125'
                              : 'level-4 hover:brightness-135'
                          } ${
                            isSelected
                              ? 'ring-2 ring-system-cyan ring-offset-1 ring-offset-[#060913] scale-110 z-10 shadow-system-glow'
                              : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Mana Legend */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#1a2742] text-[11px] font-mono text-slate-400">
              <span>Tap a dungeon date to inspect</span>
              <div className="flex items-center gap-1.5">
                <span>Void</span>
                <div className="w-3 h-3 rounded-xs level-0" />
                <div className="w-3 h-3 rounded-xs level-1" />
                <div className="w-3 h-3 rounded-xs level-2" />
                <div className="w-3 h-3 rounded-xs level-3" />
                <div className="w-3 h-3 rounded-xs level-4" />
                <span className="text-system-cyan font-bold">Max Mana</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Inspector */}
      <div className="system-window rounded-2xl p-5 shadow-lg space-y-4 animate-fade-in">
        <div className="flex items-center justify-between border-b border-[#1a2742] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-system-cyan" />
            <h3 className="text-sm font-bold text-white font-mono">
              {formatDisplayDate(selectedDate)}
            </h3>
          </div>
          {isDateToday(selectedDate) && (
            <span className="text-[10px] uppercase font-mono font-extrabold bg-system-cyan/20 text-system-cyan px-2 py-0.5 rounded border border-system-cyan/40">
              Active Today
            </span>
          )}
        </div>

        {selectedEntry && selectedCompletedHabits.length > 0 ? (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-system-cyan font-bold">
                Cleared {selectedCompletedHabits.length} of {habits.length} Quests
              </p>
              <span className="text-xs font-mono font-extrabold text-system-cyan bg-[#081226] px-2.5 py-1 rounded border border-system-cyan/30">
                +{earnedExpOnSelectedDay} EXP
              </span>
            </div>

            {/* Completed Quests Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedCompletedHabits.map((habit) => {
                const statInfo = STAT_ATTRIBUTES.find((s) => s.id === habit.attribute);

                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between bg-[#080e1c] border border-[#1e2e4e] p-2.5 rounded-xl text-xs text-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{habit.emoji || '⚔️'}</span>
                      <span className="font-semibold">{habit.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${statInfo?.color || 'text-system-cyan'}`}>
                      +{habit.attribute || 'STR'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Note if present */}
            {selectedEntry.note && (
              <div className="bg-[#080e1c] border border-[#1e2e4e] rounded-xl p-3 text-xs text-white space-y-1">
                <div className="flex items-center gap-1.5 text-system-cyan font-mono text-[10px] uppercase font-bold">
                  <FileText className="w-3 h-3" />
                  <span>Combat Note</span>
                </div>
                <p className="italic leading-relaxed text-slate-300 font-sans">
                  "{selectedEntry.note}"
                </p>
              </div>
            )}

            {/* Direct GitHub commit link */}
            {user?.username && (
              <div className="pt-1">
                <a
                  href={`https://github.com/${user.username}/daily-streak-log/commits/main`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-system-cyan hover:underline flex items-center gap-1.5 font-mono font-bold"
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>Inspect git commit log on GitHub</span>
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center space-y-1.5">
            <p className="text-xs font-mono text-slate-500">
              [NO DUNGEON ACTIVITY RECORDED FOR THIS DATE]
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
