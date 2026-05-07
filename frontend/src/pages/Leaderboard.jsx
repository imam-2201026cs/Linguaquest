import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Star, Target, TrendingUp, TrendingDown, 
  Minus, Shield, Award, Calendar, LayoutGrid, Search,
  ChevronRight, Sparkles, Activity, Globe, Zap,
  Menu, Filter, Flame, Medal, Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PERIODS = [
  { id: 'daily', label: 'Cycle: 24H' },
  { id: 'weekly', label: 'Cycle: 7D' },
  { id: 'all', label: 'Eternal' }
];

const MODULES = [
  { id: 'all', label: 'Unified Domain' },
  { id: 'writing', label: 'Writing Lab' },
  { id: 'listening', label: 'Audio Sync' },
  { id: 'reading', label: 'Data Streams' },
  { id: 'grammar', label: 'Logic Kernel' },
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
    if (change > 0) return <span className="flex items-center text-[9px] font-black text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded-md border border-accent-emerald/20"><TrendingUp size={10} className="mr-1" />{change}</span>;
    if (change < 0) return <span className="flex items-center text-[9px] font-black text-accent-rose bg-accent-rose/10 px-2 py-0.5 rounded-md border border-accent-rose/20"><TrendingDown size={10} className="mr-1" />{Math.abs(change)}</span>;
    return <span className="flex items-center text-[9px] font-black text-slate-700 bg-white/5 px-2 py-0.5 rounded-md border border-white/5"><Minus size={10} /></span>;
  };

  return (
    <div className="space-y-12 pb-24 animate-slide-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="max-w-2xl">
           <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Elite Linguistic Hierarchy</span>
              <div className="h-px w-12 bg-primary-500/30" />
           </div>
           <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none mb-4">
             Global <span className="shimmer-text">Nexus</span>
           </h1>
           <p className="text-slate-400 text-lg font-medium leading-relaxed">
             Synchronized performance metrics of the world's elite operatives. Compete to dominate the hierarchy.
           </p>
        </div>

        {/* Podium Preview for Top 3 (on Desktop) */}
        {!loading && data.length >= 3 && (
          <div className="hidden lg:flex items-end gap-4 pb-2">
             <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-white/5 flex items-center justify-center shadow-inner relative group">
                   <Medal size={24} className="text-slate-300" />
                   <img src={data[1].avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${data[1].username}`} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-40 group-hover:opacity-80 transition-opacity" />
                </div>
                <div className="h-16 w-12 bg-slate-400/20 rounded-t-xl border-x border-t border-white/10 flex items-center justify-center font-black text-slate-400">2</div>
             </div>
             <div className="flex flex-col items-center gap-3">
                <Crown size={28} className="text-accent-amber animate-bounce" />
                <div className="w-18 h-18 rounded-3xl bg-dark-900 border border-accent-amber/20 flex items-center justify-center shadow-glow relative group">
                   <Trophy size={32} className="text-accent-amber" />
                   <img src={data[0].avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${data[0].username}`} className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-40 group-hover:opacity-80 transition-opacity" />
                </div>
                <div className="h-24 w-14 bg-accent-amber/20 rounded-t-2xl border-x border-t border-accent-amber/30 flex items-center justify-center font-black text-accent-amber text-xl">1</div>
             </div>
             <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-white/5 flex items-center justify-center shadow-inner relative group">
                   <Medal size={24} className="text-accent-rose" />
                   <img src={data[2].avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${data[2].username}`} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-40 group-hover:opacity-80 transition-opacity" />
                </div>
                <div className="h-12 w-12 bg-accent-rose/20 rounded-t-xl border-x border-t border-white/10 flex items-center justify-center font-black text-accent-rose">3</div>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Advanced Filters */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8 border-white/5 bg-dark-950/40 space-y-10">
            <div className="space-y-5">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em] flex items-center gap-3">
                <Calendar size={14} className="text-primary-400" /> TEMPORAL CYCLE
              </p>
              <div className="grid grid-cols-1 gap-2">
                {PERIODS.map(p => (
                  <button key={p.id} onClick={() => setPeriod(p.id)}
                    className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl transition-all duration-500 text-left relative overflow-hidden group ${period === p.id ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/5'}`}>
                    <span className="relative z-10">{p.label}</span>
                    {period === p.id && <motion.div layoutId="period-bg" className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em] flex items-center gap-3">
                <LayoutGrid size={14} className="text-primary-400" /> FUNCTIONAL DOMAIN
              </p>
              <div className="grid grid-cols-1 gap-2">
                {MODULES.map(m => (
                  <button key={m.id} onClick={() => setModule(m.id)}
                    className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl transition-all duration-500 text-left relative overflow-hidden group ${module === m.id ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/5'}`}>
                    <span className="relative z-10">{m.label}</span>
                    {module === m.id && <motion.div layoutId="module-bg" className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-8 border-white/5 bg-primary-500/5">
             <div className="flex items-center gap-3 mb-4">
                <Sparkles size={18} className="text-primary-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-400">Rank Protocol</p>
             </div>
             <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
               Ranks are updated every hour based on total XP synchronization. Top 3 gain unique metallic profile badges.
             </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 space-y-6"
              >
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-white/5 rounded-full" />
                   <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                   <Search size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-400 animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Querying Global Hierarchy...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="table"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden border-white/5 bg-dark-900/20"
              >
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-dark-950/40 border-b border-white/5">
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Hierarchy</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operative</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Neural Tier</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Synchronization (XP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.map((u, idx) => {
                        const isMe = u.id === user?._id || u.userId === user?._id;
                        return (
                          <motion.tr 
                            key={u.id || u.userId || idx} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`group transition-all duration-500 ${isMe ? 'bg-primary-500/10' : 'hover:bg-white/5'}`}
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-5">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-lg ${idx === 0 ? 'bg-accent-amber text-dark-950 shadow-glow' : idx === 1 ? 'bg-slate-300 text-dark-950' : idx === 2 ? 'bg-accent-rose text-white' : 'bg-dark-950 text-slate-500 border border-white/5'}`}>
                                   {idx + 1}
                                 </div>
                                 <RankChangeIcon change={u.rankChange || 0} />
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-dark-950 border border-white/5 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                   <img src={u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.username}`} alt="" className="w-full h-full object-cover" />
                                   {isMe && <div className="absolute inset-0 bg-primary-500/20 backdrop-blur-[2px]" />}
                                </div>
                                <div>
                                   <div className="flex items-center gap-2">
                                      <p className={`font-black tracking-tight text-base ${isMe ? 'text-primary-400' : 'text-white'}`}>{u.username}</p>
                                      {idx < 3 && <Crown size={12} className={idx === 0 ? 'text-accent-amber' : idx === 1 ? 'text-slate-400' : 'text-accent-rose'} />}
                                   </div>
                                   <div className="flex items-center gap-2 mt-0.5">
                                      <Globe size={10} className="text-slate-600" />
                                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{u.country || 'Neutral Zone'}</p>
                                   </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 hidden md:table-cell">
                               <div className="flex items-center gap-3">
                                  <Shield size={14} className="text-primary-500/50" />
                                  <div>
                                     <p className="text-xs font-black text-white uppercase tracking-wider">Level {u.level || 1}</p>
                                     <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">{u.title || 'Apprentice'}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex flex-col items-end">
                                  <p className="text-2xl font-display font-black text-white group-hover:text-primary-400 transition-colors">{u.xp?.toLocaleString()}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                     <Zap size={10} className="text-primary-500" />
                                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Sync</span>
                                  </div>
                               </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current User Floating Status (if not in top 100) */}
          {!loading && user && !data.some(u => u.userId === user._id) && (
             <motion.div 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="glass-card p-6 bg-primary-500/10 border-primary-500/30 flex items-center justify-between sticky bottom-10 z-20"
             >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-black">
                      ??
                   </div>
                   <div>
                      <p className="font-black text-white">Your Hierarchy Status</p>
                      <p className="text-[10px] text-primary-400 font-black uppercase tracking-widest">Synchronization Required</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-display font-black text-white">{user.xp?.toLocaleString()} XP</p>
                   <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Level {user.level}</p>
                </div>
             </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
