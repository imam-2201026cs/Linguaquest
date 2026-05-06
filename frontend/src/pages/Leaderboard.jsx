import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Zap, Flame, Crown, Medal, Star, TrendingUp, TrendingDown, 
  Swords, Minus, Calendar, LayoutGrid, Globe, Shield, Activity, 
  Target, Sparkles, Award, ArrowLeft, ChevronRight, Info, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PERIODS = [
  { id: 'all', label: 'Eternity' },
  { id: 'week', label: 'Current Week' },
  { id: 'month', label: 'Current Cycle' }
];

const MODULES = [
  { id: 'all', label: 'Global Apex' },
  { id: 'writing', label: 'Linguistic' },
  { id: 'listening', label: 'Auditory' },
  { id: 'reading', label: 'Lexical' },
  { id: 'grammar', label: 'Syntactic' }
];

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [module, setModule] = useState('all');
  const [challenging, setChallenging] = useState(null);
  
  const { user } = useAuth();
  const myRowRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, module]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: res } = await axios.get(`/api/leaderboard?period=${period}&module=${module}`);
      setData(res);
      
      setTimeout(() => {
        if (myRowRef.current) {
          const rect = myRowRef.current.getBoundingClientRect();
          if (rect.top > window.innerHeight) {
            myRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 800);
    } catch {
      toast.error('Failed to sync global rankings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = async (opponent) => {
    if (challenging) return;
    setChallenging(opponent.userId);
    try {
      await axios.post(`/api/leaderboard/challenge/${opponent.userId}`);
      toast.success(`Combat protocol initiated with ${opponent.username}! ⚔️`);
    } catch {
      toast.error('Challenge transmission failed.');
    } finally {
      setChallenging(null);
    }
  };

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown size={22} className="text-accent-amber animate-bounce shadow-glow" />;
    if (rank === 2) return <Medal size={20} className="text-slate-400 shadow-glow" />;
    if (rank === 3) return <Medal size={20} className="text-amber-800 shadow-glow" />;
    return <span className="text-xs font-black text-slate-600 tracking-widest">#{rank}</span>;
  };

  const RankChangeIcon = ({ change }) => {
    if (change > 0) return <span className="flex items-center text-[10px] font-black text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded-full"><TrendingUp size={10} className="mr-1" />{change}</span>;
    if (change < 0) return <span className="flex items-center text-[10px] font-black text-accent-rose bg-accent-rose/10 px-2 py-0.5 rounded-full"><TrendingDown size={10} className="mr-1" />{Math.abs(change)}</span>;
    return <span className="flex items-center text-[10px] font-black text-slate-700 bg-white/5 px-2 py-0.5 rounded-full"><Minus size={10} /></span>;
  };

  const myRank = data.find(u => u.isCurrentUser);
  const hallOfFame = data.filter(u => u.level >= 10);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-amber">Global Hierarchy</span>
              <div className="h-px w-8 bg-accent-amber/30" />
           </div>
           <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Leaderboard <span className="shimmer-text">Nexus</span></h1>
           <p className="text-slate-400 text-lg mt-2 font-medium">Synchronized performance metrics of the world's elite linguists.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8 border-white/5 bg-dark-900/40 space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] text-slate-500 mb-2 font-black uppercase tracking-[0.2em] flex items-center gap-2"><Calendar size={12} className="text-primary-400" /> TEMPORAL CYCLE</p>
              <div className="flex flex-col gap-2">
                {PERIODS.map(p => (
                  <button key={p.id} onClick={() => setPeriod(p.id)}
                    className={`text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${period === p.id ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200 bg-dark-950/50'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] text-slate-500 mb-2 font-black uppercase tracking-[0.2em] flex items-center gap-2"><LayoutGrid size={12} className="text-primary-400" /> FUNCTIONAL DOMAIN</p>
              <div className="flex flex-col gap-2">
                {MODULES.map(m => (
                  <button key={m.id} onClick={() => setModule(m.id)}
                    className={`text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${module === m.id ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200 bg-dark-950/50'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-8 border-accent-amber/20 bg-accent-amber/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <Shield size={60} />
             </div>
             <div className="relative z-10 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <Target size={14} className="text-accent-amber" /> Combat Protocol
                </h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                   Initiate high-fidelity linguistic combat with any user to accelerate XP synchronization.
                </p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {/* Hall of Fame - Top 3 Visual */}
          {!loading && data.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[1, 0, 2].map(idx => {
                  const u = data[idx];
                  if (!u) return null;
                  const colors = idx === 0 ? 'border-accent-amber from-accent-amber/20' : idx === 1 ? 'border-slate-400 from-slate-400/20' : 'border-amber-800 from-amber-800/20';
                  const shadow = idx === 0 ? 'shadow-[0_0_30px_rgba(245,158,11,0.15)]' : '';
                  
                  return (
                    <motion.div 
                      key={u.username}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`glass-card p-8 border-2 ${colors} bg-gradient-to-t to-transparent flex flex-col items-center text-center relative overflow-hidden group ${shadow}`}
                    >
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                          {idx === 0 ? <Crown size={40} /> : <Medal size={40} />}
                       </div>
                       <div className={`w-20 h-20 rounded-[24px] bg-dark-950 flex items-center justify-center text-3xl font-black text-white mb-6 border-2 ${colors} shadow-inner group-hover:scale-110 transition-transform`}>
                          {u.username[0]?.toUpperCase()}
                       </div>
                       <h3 className="text-xl font-display font-bold text-white tracking-tight mb-1 truncate w-full">{u.country} {u.username}</h3>
                       <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-4">Level {u.level} Architect</p>
                       <div className="bg-dark-950 border border-white/5 px-6 py-2 rounded-full flex items-center gap-3">
                          <Zap size={14} className="text-primary-400 shadow-glow" />
                          <span className="text-sm font-black text-white">{u.xp} XP</span>
                       </div>
                    </motion.div>
                  );
               })}
            </div>
          )}

          {/* User Rank Highlight */}
          {myRank && (
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="glass-card p-6 border-primary-500/30 bg-gradient-to-r from-primary-500/10 to-transparent relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-30"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Activity size={80} />
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="flex flex-col items-center gap-2 shrink-0">
                   <div className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">Global Position</div>
                   <div className="w-14 h-14 bg-dark-950 rounded-2xl flex items-center justify-center text-2xl font-black text-white border border-primary-500/20 shadow-glow-sm">
                      #{myRank.rank}
                   </div>
                   <RankChangeIcon change={myRank.rankChange} />
                </div>
                <div className="flex-1 text-center md:text-left">
                   <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                      <span className="text-2xl font-black text-white">{myRank.country} {myRank.username}</span>
                      <span className="text-[9px] font-black text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Architect (You)</span>
                   </div>
                   <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                      <div className="flex items-center gap-2">
                         <Star size={14} className="text-accent-amber" />
                         <span className="text-xs font-black text-slate-400 uppercase tracking-widest">LVL {myRank.level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Award size={14} className="text-primary-400" />
                         <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{myRank.totalActivities} Operations</span>
                      </div>
                      {myRank.streak > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-accent-amber/10 rounded-lg border border-accent-amber/20">
                           <Flame size={14} className="text-accent-amber shadow-glow" />
                           <span className="text-xs font-black text-accent-amber uppercase tracking-widest">{myRank.streak} Day Cycle</span>
                        </div>
                      )}
                   </div>
                </div>
                <div className="shrink-0 text-center">
                   <div className="text-3xl font-display font-black text-white mb-1 flex items-center gap-3">
                      <Zap size={24} className="text-primary-400 shadow-glow" /> {myRank.xp}
                   </div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Synchronization Level</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Full Hierarchy List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-6 mb-4">
               <h3 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                  <Globe size={20} className="text-primary-400" /> Global Hierarchy
               </h3>
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{data.length} Nodes Synchronized</div>
            </div>

            {loading ? (
              <div className="glass-card p-20 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-white/5 rounded-full" />
                  <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Syncing Rank Indices...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {data.map(userRow => {
                  const isMe = userRow.isCurrentUser;
                  return (
                    <motion.div
                      key={userRow.username}
                      ref={isMe ? myRowRef : null}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`glass-card p-6 flex items-center gap-6 transition-all group border-white/5 ${isMe ? 'bg-primary-500/5 border-primary-500/20 ring-1 ring-primary-500/30' : 'hover:border-white/10 hover:bg-white/5'}`}
                    >
                      <div className="w-12 flex flex-col items-center gap-1 shrink-0">
                        {rankIcon(userRow.rank)}
                        <RankChangeIcon change={userRow.rankChange} />
                      </div>

                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0 border border-white/5 shadow-inner transition-transform group-hover:scale-110 ${userRow.rank === 1 ? 'bg-gradient-to-br from-accent-amber to-orange-600' : userRow.rank === 2 ? 'bg-slate-500' : userRow.rank === 3 ? 'bg-amber-800' : 'bg-dark-950'}`}>
                        {userRow.username[0]?.toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-white text-base truncate">{userRow.country} {userRow.username}</span>
                          {isMe && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-glow animate-pulse" />}
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-dark-950 px-2 py-0.5 rounded border border-white/5">Architect {userRow.level}</span>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{userRow.totalActivities} Operations</span>
                          {userRow.streak > 0 && (
                            <div className="flex items-center gap-1 text-accent-amber">
                               <Flame size={12} className="shadow-glow" />
                               <span className="text-[10px] font-black uppercase tracking-widest">{userRow.streak}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                         {!isMe && (
                           <button onClick={() => handleChallenge(userRow)} disabled={challenging === userRow.userId}
                             className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-dark-950 border border-accent-rose/20 text-accent-rose hover:bg-accent-rose hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-glow-sm"
                           >
                             {challenging === userRow.userId ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Swords size={18} />}
                           </button>
                         )}
                         <div className="text-right flex flex-col items-end gap-1">
                            <div className="text-lg font-black text-white flex items-center gap-2">
                               <Zap size={16} className="text-primary-400 shadow-glow" /> {userRow.xp}
                            </div>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Synchronization</p>
                         </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {data.length === 0 && !loading && (
        <div className="glass-card p-20 text-center flex flex-col items-center space-y-6">
          <Trophy size={64} className="text-slate-800" />
          <div className="space-y-2">
             <h3 className="text-2xl font-display font-bold text-white tracking-tight">Hierarchy Empty</h3>
             <p className="text-slate-500 font-medium">Be the first to synchronize in this temporal cycle.</p>
          </div>
        </div>
      )}
    </div>
  );
}
