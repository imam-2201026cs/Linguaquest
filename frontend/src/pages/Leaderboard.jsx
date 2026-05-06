import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Star, Target, TrendingUp, TrendingDown, 
  Minus, Shield, Award, Calendar, LayoutGrid, Search,
  ChevronRight, Sparkles, Activity, Globe, Zap,
  Menu, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PERIODS = [
  { id: 'daily', label: 'Cycle: 24H' },
  { id: 'weekly', label: 'Cycle: 7D' },
  { id: 'allTime', label: 'Eternal' }
];

const MODULES = [
  { id: 'all', label: 'Unified Domain' },
  { id: 'writing', label: 'Writing' },
  { id: 'listening', label: 'Listening' },
  { id: 'reading', label: 'Reading' },
  { id: 'verbal', label: 'Verbal' },
  { id: 'challenge', label: 'Daily Ops' }
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');
  const [module, setModule] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [period, module]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/user/leaderboard?period=${period}&module=${module}`);
      setData(res.data);
    } catch (err) {
      console.error('Leaderboard sync failed');
    } finally {
      setLoading(false);
    }
  };

  const RankChangeIcon = ({ change }) => {
    if (change > 0) return <span className="flex items-center text-[9px] font-black text-accent-emerald bg-accent-emerald/10 px-1.5 py-0.5 rounded-full"><TrendingUp size={8} className="mr-1" />{change}</span>;
    if (change < 0) return <span className="flex items-center text-[9px] font-black text-accent-rose bg-accent-rose/10 px-1.5 py-0.5 rounded-full"><TrendingDown size={8} className="mr-1" />{Math.abs(change)}</span>;
    return <span className="flex items-center text-[9px] font-black text-slate-700 bg-white/5 px-1.5 py-0.5 rounded-full"><Minus size={8} /></span>;
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-20 animate-slide-up px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div className="text-center md:text-left">
           <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-amber">Global Hierarchy</span>
              <div className="h-px w-8 bg-accent-amber/30" />
           </div>
           <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">Leaderboard <span className="shimmer-text">Nexus</span></h1>
           <p className="text-slate-400 text-sm md:text-lg mt-2 font-medium">Synchronized performance metrics of the world's elite linguists.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar - Now a horizontal bar on mobile */}
        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          <div className="glass-card p-6 md:p-8 border-white/5 bg-dark-900/40 space-y-6">
            <div className="space-y-3">
              <p className="text-[9px] md:text-[10px] text-slate-500 mb-2 font-black uppercase tracking-[0.2em] flex items-center gap-2 justify-center md:justify-start">
                <Calendar size={12} className="text-primary-400" /> TEMPORAL CYCLE
              </p>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                {PERIODS.map(p => (
                  <button key={p.id} onClick={() => setPeriod(p.id)}
                    className={`whitespace-nowrap px-4 md:px-5 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 flex-1 lg:flex-none text-center lg:text-left ${period === p.id ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200 bg-dark-950/50'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[9px] md:text-[10px] text-slate-500 mb-2 font-black uppercase tracking-[0.2em] flex items-center gap-2 justify-center md:justify-start">
                <LayoutGrid size={12} className="text-primary-400" /> FUNCTIONAL DOMAIN
              </p>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                {MODULES.map(m => (
                  <button key={m.id} onClick={() => setModule(m.id)}
                    className={`whitespace-nowrap px-4 md:px-5 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 flex-1 lg:flex-none text-center lg:text-left ${module === m.id ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200 bg-dark-950/50'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {!loading && data.length > 0 && (
            <div className="glass-card overflow-hidden border-white/5 bg-dark-900/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-dark-950/30">
                      <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Rank</th>
                      <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Operative</th>
                      <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Tier</th>
                      <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Synchronization (XP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.map((u, idx) => (
                      <tr key={u.id} className={`group transition-all ${u.id === user?.id ? 'bg-primary-500/5' : 'hover:bg-white/5'}`}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <span className={`text-xl font-display font-black ${idx === 0 ? 'text-accent-amber' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-accent-rose' : 'text-slate-600'}`}>
                               #{idx + 1}
                             </span>
                             <RankChangeIcon change={u.rankChange || 0} />
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-dark-950 border border-white/5 flex items-center justify-center text-lg shadow-inner overflow-hidden">
                               <img src={u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.username}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <p className={`font-bold tracking-tight text-sm ${u.id === user?.id ? 'text-primary-400' : 'text-white'}`}>{u.username}</p>
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{u.title || 'Apprentice'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                           <div className="flex items-center gap-2">
                              <Shield size={12} className="text-primary-400" />
                              <span className="text-[10px] font-black text-white">LVL {u.level}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <p className="text-lg font-display font-black text-white">{u.xp?.toLocaleString()}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Querying Global Hierarchy</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
