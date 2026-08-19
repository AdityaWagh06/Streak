import React, { useState, useEffect } from 'react';
import { Github, Zap, Sword, Shield, AlertCircle } from 'lucide-react';

export default function LoginView() {
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    const attemptedUser = params.get('attempted_user');

    if (authError) {
      if (authError === 'missing_github_client_id' || authError === 'missing_server_credentials') {
        setErrorMsg('GitHub OAuth credentials are missing in .env.local.');
      } else if (authError === 'unauthorized_user') {
        setErrorMsg(`User @${attemptedUser || 'you'} is not authorized.`);
      } else if (authError === 'csrf_state_mismatch') {
        setErrorMsg('Security check timed out. Please tap Sign In again.');
      } else {
        setErrorMsg(`Authentication issue: ${authError}`);
      }
    }
  }, []);

  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-sm mx-auto px-5 py-8">
      <div className="system-window rounded-3xl p-6 sm:p-7 space-y-6 text-center shadow-2xl border border-system-cyan/40">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0a1224] border border-system-cyan text-system-cyan shadow-system-glow">
          <Zap className="w-8 h-8 fill-system-cyan stroke-[2.5]" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            STREAK
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Solo Leveling Habit Tracker
          </p>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 text-left font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Simple 3 Value Points */}
        <div className="space-y-2.5 text-left text-xs text-slate-300 py-1 font-sans">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#080e1c] border border-[#1a2742]">
            <Sword className="w-4 h-4 text-system-cyan flex-shrink-0" />
            <span><strong>Daily Quests:</strong> Complete habits to gain EXP</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#080e1c] border border-[#1a2742]">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
            <span><strong>Level Up:</strong> Rank up from E-Rank to S-Rank</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#080e1c] border border-[#1a2742]">
            <Github className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <span><strong>Git Commits:</strong> Saved directly to your GitHub repo</span>
          </div>
        </div>

        {/* Sign in with GitHub Button */}
        <div className="pt-2">
          <button
            onClick={handleGitHubLogin}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-system-blue via-system-cyan to-system-cyanGlow hover:brightness-110 text-[#060913] font-black text-sm flex items-center justify-center gap-2.5 shadow-system-glow transition-all duration-150 tap-bounce border border-system-cyan font-mono"
          >
            <Github className="w-4 h-4 fill-[#060913]" />
            <span>SIGN IN WITH GITHUB</span>
          </button>
        </div>
      </div>
    </div>
  );
}
