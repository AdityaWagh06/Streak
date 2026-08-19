import React from 'react';
import { Sword, Calendar, UserCheck, Settings } from 'lucide-react';

const TABS = [
  { id: 'today', label: 'Quests', icon: Sword },
  { id: 'history', label: 'History', icon: Calendar },
  { id: 'stats', label: 'Status', icon: UserCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 system-nav-solid border-t border-[#1a2742] px-3 py-2 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-150 tap-bounce ${
                isActive
                  ? 'text-system-cyan bg-[#0f1f38] border border-system-cyan/50 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1930] font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] font-mono tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
