import { useEffect, useState } from 'react';
import { Zap, Coins, Star, X } from 'lucide-react';

export default function XPReward({ xp, coins, score, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const scoreColor = score >= 80 ? 'text-accent-green' : score >= 60 ? 'text-accent-yellow' : 'text-accent-red';
  const scoreLabel = score >= 90 ? '🏆 Excellent!' : score >= 75 ? '⭐ Great Job!' : score >= 60 ? '👍 Good Work!' : '💪 Keep Going!';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setVisible(false); setTimeout(onClose, 300); }} />
      
      <div className="relative glass-card p-8 max-w-sm w-full text-center animate-bounce-in">
        {/* Confetti particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: '20%',
              width: '8px',
              height: '8px',
              borderRadius: i % 2 === 0 ? '50%' : '2px',
              background: ['#fbbf24','#22c55e','#0ea5e9','#a855f7','#f97316','#ef4444','#38bdf8','#84cc16'][i],
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${1.2 + i * 0.1}s`
            }}
          />
        ))}

        <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X size={18} />
        </button>

        <div className="text-5xl mb-3">{score >= 90 ? '🏆' : score >= 75 ? '⭐' : score >= 60 ? '👏' : '💪'}</div>
        
        <h2 className="text-2xl font-display font-bold text-white mb-1">{scoreLabel}</h2>
        <p className={`text-4xl font-display font-bold ${scoreColor} mb-6`}>{score}%</p>

        <div className="flex justify-center gap-4">
          <div className="flex flex-col items-center gap-1 bg-accent-yellow/10 border border-accent-yellow/20 rounded-xl px-6 py-3">
            <div className="flex items-center gap-1 text-accent-yellow">
              <Zap size={18} />
              <span className="text-2xl font-bold">+{xp}</span>
            </div>
            <span className="text-xs text-slate-400">XP Earned</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-6 py-3">
            <div className="flex items-center gap-1 text-yellow-400">
              <Coins size={18} />
              <span className="text-2xl font-bold">+{coins}</span>
            </div>
            <span className="text-xs text-slate-400">Coins</span>
          </div>
        </div>

        <div className="mt-4 h-1.5 bg-dark-600 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-accent-purple rounded-full progress-bar"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}
