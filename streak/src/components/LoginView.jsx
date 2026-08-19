import React, { useState, useEffect } from 'react';
import { GitCommit, Github, Sparkles, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Play, Zap, Sword } from 'lucide-react';

export default function LoginView({ onDevLogin, hasOAuthConfig }) {
  const [errorMsg, setErrorMsg] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    const attemptedUser = params.get('attempted_user');

    if (authError) {
      if (authError === 'missing_github_client_id' || authError === 'missing_server_credentials') {
        setErrorMsg('GitHub OAuth credentials are not configured in your .env.local yet. See setup guide below.');
        setShowGuide(true);
      } else if (authError === 'unauthorized_user') {
        setErrorMsg(`Access restricted: @${attemptedUser || 'user'} is not authorized by ALLOWED_GITHUB_USERNAME.`);
      } else if (authError === 'csrf_state_mismatch') {
        setErrorMsg('Security check failed: OAuth CSRF state mismatch. Please try again.');
      } else {
        setErrorMsg(`Authentication issue: ${authError}`);
      }
    }
  }, []);

  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-lg mx-auto px-5 py-8 sm:py-12">
      {/* Top Section */}
      <div className="space-y-8">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-system-surface border border-system-cyan text-system-cyan shadow-system-glow-lg animate-scale-up">
            <Zap className="w-9 h-9 fill-system-cyan stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-system-cyan uppercase bg-system-cyan/10 px-2 py-0.5 rounded border border-system-cyan/30">
              [SYSTEM AWAKENING]
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-system-textWhite font-mono mt-1">
              SOLO LEVELING
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-system-textMuted max-w-sm mx-auto font-sans leading-relaxed">
            Only you can see this window. Complete daily quests, level up your Hunter Rank, and commit real progress directly to GitHub.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-system-danger/15 border border-system-danger/40 text-system-danger px-4 py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 shadow-md font-mono">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">[SYSTEM ERROR]</p>
              <p className="opacity-90">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Solo Leveling Value Pillars */}
        <div className="system-window corner-hud rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-system-cyan/15 text-system-cyan flex items-center justify-center flex-shrink-0 mt-0.5 border border-system-cyan/30">
              <Zap className="w-4 h-4 fill-system-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-system-textWhite font-mono">Level Up & Hunter Ranks</h3>
              <p className="text-xs text-system-textMuted mt-0.5">
                Earn EXP (+50 XP per quest), climb from E-Rank to Shadow Monarch, and build STR, INT, AGI, and VIT stats.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/30">
              <Sword className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-system-textWhite font-mono">Full Quest Management</h3>
              <p className="text-xs text-system-textMuted mt-0.5">
                Add, edit, delete, and categorize your quests directly from your phone with instant syncing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-500/30">
              <GitCommit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-system-textWhite font-mono">Real GitHub Commits</h3>
              <p className="text-xs text-system-textMuted mt-0.5">
                Every quest check-in is saved as a genuine commit to your <code className="text-system-cyan font-mono">daily-streak-log</code> repository.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleGitHubLogin}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-system-cyan via-system-blue to-system-cyanGlow hover:brightness-110 text-system-void font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-system-glow-lg transition-all duration-200 tap-bounce border border-system-cyan font-mono tracking-wide"
          >
            <Github className="w-5 h-5 fill-system-void" />
            <span>AWAKEN WITH GITHUB</span>
          </button>

          {/* Dev Demo Mode Action */}
          <button
            onClick={onDevLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-system-surface hover:bg-system-surfaceHover text-system-textMuted hover:text-system-cyan font-mono text-xs flex items-center justify-center gap-2 border border-system-border transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-system-cyan" />
            <span>[ENTER SYSTEM IN DEV PREVIEW MODE]</span>
          </button>
        </div>

        {/* Setup Guide Collapsible */}
        <div className="system-window rounded-xl overflow-hidden border border-system-border">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-mono font-bold text-system-textMuted hover:text-system-cyan transition-colors"
          >
            <span>[SETUP GUIDE: GITHUB OAUTH APP CONFIGURATION]</span>
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showGuide && (
            <div className="p-4 pt-2 text-xs text-system-textMuted space-y-2 border-t border-system-borderSubtle bg-system-dark/80 font-sans">
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-system-textLight">
                <li>Visit <strong className="text-system-cyan">github.com/settings/developers</strong> → <em>New OAuth App</em></li>
                <li>Set <strong>Homepage URL</strong> to <code className="bg-system-surface px-1 py-0.5 rounded font-mono text-system-cyan">http://localhost:5173</code></li>
                <li>Set <strong>Authorization callback URL</strong> to <code className="bg-system-surface px-1 py-0.5 rounded font-mono text-system-cyan">http://localhost:5173/api/auth/callback</code></li>
                <li>Copy <strong>Client ID</strong> & <strong>Client Secret</strong> into <code className="bg-system-surface px-1 py-0.5 rounded font-mono text-system-cyan">.env.local</code></li>
                <li>Requested scope is <code className="text-system-cyan font-mono">public_repo</code> only.</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center pt-8 text-[11px] text-system-textMuted font-mono">
        SYSTEM AWAKENED · AES-256-GCM ENCRYPTED HUNTER SESSION
      </footer>
    </div>
  );
}
