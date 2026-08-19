import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600/90 backdrop-blur-md text-amber-50 px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-lg animate-fade-in border-b border-amber-400/30">
      <WifiOff className="w-4 h-4 flex-shrink-0 animate-pulse" />
      <span>You are offline. Commits require network access to push directly to GitHub.</span>
    </div>
  );
}
