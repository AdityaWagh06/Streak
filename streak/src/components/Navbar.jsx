import React from 'react';
import { Flame, Zap } from 'lucide-react';

export default function Navbar({ user, streak = 0, playerLevel = 1, hunterRank = 'E-Rank', badgeColor = '', onOpenSettings }) {
  const username = user?.username;
  const avatarUrl = user?.avatarUrl;

  return (
    <header className="sticky top-0 z-50 w-full system-nav-solid border-b border-[#1a2742] px-4 py-3 sm:px-6 shadow-lg">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Brand / System HUD */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0f1930] border border-system-cyan/60 flex items-center justify-center text-system-cyan shadow-system-glow flex-shrink-0">
            <Zap className="w-4 h-4 fill-system-cyan stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black tracking-wider text-system-cyan font-mono">
                SYSTEM
              </h1>
              {/* Hunter Rank Badge */}
              <span className={`text-[10px] uppercase font-mono font-extrabold px-1.5 py-0.2 rounded border shadow-sm ${badgeColor || 'bg-slate-800 text-slate-300 border-slate-600'}`}>
                {hunterRank}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 leading-none">
              Player Level <strong className="text-white font-bold">Lv. {playerLevel}</strong>
            </p>
          </div>
        </div>

        {/* Right Info: Streak & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Active Streak Badge */}
          <div className="flex items-center gap-1.5 bg-[#0f1930] border border-[#1e2e4e] px-2.5 py-1 rounded-full text-xs font-semibold">
            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span className={streak > 0 ? 'text-amber-300 font-mono font-bold' : 'text-slate-500 font-mono'}>
              {streak}d
            </span>
          </div>

          {/* User Avatar */}
          {username && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-system-cyan transition-all tap-bounce focus:outline-none"
              title={`Logged in as @${username}`}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-7 h-7 rounded-full border border-system-cyan/50 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#0f1930] border border-[#1e2e4e] flex items-center justify-center text-xs font-bold text-system-cyan font-mono">
                  {username.slice(0, 2).toUpperCase()}
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
