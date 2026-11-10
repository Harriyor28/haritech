import React, { useEffect, useState } from 'react';
import { Share2, Download, X } from 'lucide-react';

/**
 * Install the Haritech web app on a phone.
 * - Android/desktop Chrome fires `beforeinstallprompt`; we keep the native
 *   install flow (no Play Store, no banner spam).
 * - iOS has no install API, so an iPhone sees a short one-time tip
 *   explaining Share → Add to Home Screen.
 * - Dismissal is remembered per device; the prompt never nags twice.
 */
const DISMISS_KEY = 'haritech-pwa-install-dismissed';

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // iOS Safari sets navigator.standalone when launched from the home screen
  (window.navigator as unknown as { standalone?: boolean }).standalone === true;

const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !/crios|fxios/i.test(window.navigator.userAgent);

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PwaInstallPrompt: React.FC = () => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosTipOpen, setIosTipOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // The owner console has no need for an install nudge.
    if (window.location.pathname.startsWith('/admin')) {
      setHidden(true);
      return;
    }
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      /* storage unavailable: just let the prompt show */
    }
    if (dismissed || isStandalone()) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (isIos()) return; // iOS never fires this; the tip covers it
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstallEvent(null);
      setIosTipOpen(false);
      try {
        window.localStorage.setItem(DISMISS_KEY, '1');
      } catch {}
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // iOS: show the Add-to-Home-Screen tip once, a few seconds into the visit.
    let timer: number | undefined;
    if (isIos()) {
      timer = window.setTimeout(() => setIosTipOpen(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
  };

  if (hidden) return null;

  if (installEvent) {
    const install = async () => {
      const event = installEvent;
      if (!event) return;
      setInstallEvent(null);
      await event.prompt();
      const { outcome } = await event.userChoice;
      if (outcome !== 'accepted') return;
      try {
        window.localStorage.setItem(DISMISS_KEY, '1');
      } catch {}
    };

    return (
      <div className="fixed bottom-20 right-4 z-[70] max-w-[88vw] sm:bottom-6" role="dialog" aria-label="Install Haritech app">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b1224]/95 p-3 pr-2 shadow-2xl backdrop-blur">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-gradient-to-br from-cyan-400/25 to-violet-500/25 text-sm font-black text-cyan-200">
            H
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white">Install the Haritech app</p>
            <p className="text-[10px] text-slate-400">Open like a real app, even offline.</p>
          </div>
          <button
            onClick={install}
            className="ml-1 flex items-center gap-1 rounded-lg bg-cyan-500 px-3 py-2 text-[11px] font-black text-slate-950 transition hover:bg-cyan-400"
          >
            <Download className="h-3 w-3" />
            Install
          </button>
          <button
            onClick={dismiss}
            aria-label="Don't show again"
            className="rounded-lg p-2 text-slate-500 transition hover:text-slate-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (iosTipOpen) {
    return (
      <div className="fixed bottom-20 right-4 z-[70] max-w-[86vw] sm:bottom-6" role="dialog" aria-label="Add Haritech to your home screen">
        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0b1224]/95 p-3 pr-2 shadow-2xl backdrop-blur">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-gradient-to-br from-cyan-400/25 to-violet-500/25 text-sm font-black text-cyan-200">
            H
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">Add Haritech to your Home Screen</p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] leading-relaxed text-slate-400">
              <Share2 className="h-3 w-3 shrink-0" />
              Tap Share, then “Add to Home Screen”.
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Don't show again"
            className="rounded-lg p-2 text-slate-500 transition hover:text-slate-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PwaInstallPrompt;
