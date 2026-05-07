/**
 * PWAInstallBanner – shows a subtle "Add to Home Screen" prompt
 * when the browser fires the beforeinstallprompt event.
 *
 * Import and drop anywhere in your layout:
 *   import PWAInstallBanner from '../components/PWAInstallBanner';
 */
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setVisible(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // SW update available
    const handleUpdate = () => setUpdateAvailable(true);
    window.addEventListener('sw-update-available', handleUpdate);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('sw-update-available', handleUpdate);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  const handleReload = () => window.location.reload();

  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-sky-600 text-white shadow-lg text-sm font-medium animate-fade-in">
        <span>🔄 New version available</span>
        <button
          onClick={handleReload}
          className="bg-white text-sky-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-sky-50 transition"
        >
          Update
        </button>
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0f1629] border border-sky-500/30 text-white shadow-2xl text-sm max-w-sm w-[calc(100%-2rem)]">
      <div className="flex items-center gap-2 flex-1">
        <img src="/icons/icon-72.png" alt="LinguaQuest" className="w-9 h-9 rounded-lg" />
        <div>
          <p className="font-semibold text-sky-300">Install LinguaQuest</p>
          <p className="text-xs text-gray-400">Use offline, get daily reminders</p>
        </div>
      </div>
      <button
        onClick={handleInstall}
        className="flex items-center gap-1 bg-sky-500 hover:bg-sky-400 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
      >
        <Download size={12} />
        Install
      </button>
      <button
        onClick={() => setVisible(false)}
        className="text-gray-500 hover:text-gray-300 transition p-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
