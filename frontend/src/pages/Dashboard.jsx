// Premium Dashboard Overhaul - Cinematic "Control Center" Edition
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Trophy, Coins, Target, Sparkles, Flame,
  LayoutGrid, ArrowRight, ChevronRight, Clock,
  Star, PenTool, Headphones, BookOpen, CheckSquare, MessageSquare,
  Activity, Shield, Award, Calendar, BarChart3, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MasterRadar from '../components/MasterRadar';
import ActivityChart from '../components/ActivityChart';

const DAILY_QUESTS = [
  { id: 1, label: 'Master 5 Grammar Errors', xp: 250, progress: 3, total: 5, icon: Shield },
  { id: 2, label: 'Engage in 2 Conversations', xp: 400, progress: 1, total: 2, icon: MessageSquare },
  { id: 3, label: 'Earn 1000 XP', xp: 500, progress: 450, total: 1000, icon: Zap },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  const calculateTimeLeft = () => {
    const now = new Date();
    const reset = new Date();
    reset.setHours(24, 0, 0, 0);
    const diff = reset - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    setTimeLeft(`${h}H ${m}M UNTIL RESET`);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/user/history');
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('History fetch error:', err);
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    
    fetchHistory();
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [user]);

  const modules = [
    { to: '/writing', icon: PenTool, label: 'Writing Lab', desc: 'Craft high-fidelity linguistic compositions.', gradient: 'from-primary-500 to-primary-700', xp: '100 XP/Min', progress: 45 },
    { to: '/listening', icon: Headphones, label: 'Audio Sync', desc: 'Decode complex audio transmissions.', gradient: 'from-accent-indigo to-primary-600', xp: '120 XP/Min', progress: 30 },
    { to: '/reading', icon: BookOpen, label: 'Data Streams', desc: 'Navigate the vast data-streams of text.', gradient: 'from-accent-emerald to-primary-700', xp: '80 XP/Min', progress: 65 },
    { to: '/grammar', icon: CheckSquare, label: 'Logic Kernel', desc: 'Debug your grammatical architecture.', gradient: 'from-accent-amber to-primary-600', xp: '150 XP/Min', progress: 20 },
    { to: '/conversation', icon: MessageSquare, label: 'Chat Protocol', desc: 'Simulate high-stakes vocal interaction.', gradient: 'from-accent-rose to-primary-600', xp: '200 XP/Min', progress: 10 },
    { to: '/verbal-test', icon: Sparkles, label: 'Verbal Arena', desc: 'Competitive linguistic combat scenarios.', gradient: 'from-primary-400 to-accent-indigo', xp: '300 XP/Min', progress: 5 },
  ];

  const typeIcon = {
    writing: <PenTool size={18} />,
    listening: <Headphones size={18} />,
    reading: <BookOpen size={18} />,
    grammar: <CheckSquare size={18} />,
    conversation: <MessageSquare size={18} />,
    'verbal-test': <Sparkles size={18} />
  };

  const currentLevel = Number(user?.level) || 1;
  const xpForNextLevel = currentLevel * currentLevel * 100;
  const xpProgress = user ? Math.min(100, (user.xp % xpForNextLevel) / xpForNextLevel * 100) : 45;

  const stats = [
    { icon: Flame,  label: 'Daily Streak', value: `${user?.streak || 0}D`, color: 'text-accent-rose', trend: '+12% vs LY' },
    { icon: Trophy, label: 'Global Rank', value: '#128', color: 'text-accent-amber', trend: 'TOP 5%' },
    { icon: Coins,  label: 'Treasury', value: (user?.coins || 0).toLocaleString(), color: 'text-accent-emerald', trend: '+450' },
  ];

  return (
    <div className="space-y-12 pb-24">
      {/* Cinematic Hero Section */}
      <section className="relative group">
         <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-accent-purple/10 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
         
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Tactical Overview</span>
                  <div className="h-px w-10 bg-primary-500/30" />
               </div>
               <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
                  Welcome, <span className="shimmer-text">{user?.username}</span>
               </h1>
               <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                  Initiate your next linguistic operation. Synchronization is at <span className="text-primary-400 font-bold">OPTIMAL</span> levels.
               </p>
            </div>

            <div className="glass-card p-6 md:p-8 bg-dark-950/40 border-white/5 flex items-center gap-8 shadow-glow">
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Neural Status</p>
                  <p className="text-white font-black text-2xl tracking-tight">Active Scholar</p>
               </div>
               <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center border border-primary-500/20 shadow-inner">
                  <Sparkles size={32} className="text-primary-400 animate-pulse" />
               </div>
            </div>
         </div>
      </section>

      {/* Advanced Progress Architecture */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 glass-card p-1 bg-gradient-to-br from-primary-500/20 to-transparent border-white/5 overflow-hidden">
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
               <div className="relative shrink-0 group">
                  <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[12px] border-white/5 flex flex-col items-center justify-center relative bg-dark-950/40 backdrop-blur-xl shadow-inner">
                      <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.08]" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-white/5" />
                        <motion.circle 
                          initial={{ strokeDasharray: "0, 440" }}
                          animate={{ strokeDasharray: `${(xpProgress / 100) * 440}, 440` }}
                          transition={{ duration: 2, ease: "circOut" }}
                          cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" 
                          className="text-primary-500" strokeLinecap="round" 
                        />
                      </svg>
                      <span className="text-5xl md:text-6xl font-display font-black text-white group-hover:scale-110 transition-transform">{currentLevel}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mt-1">Tier</span>
                  </div>
               </div>

               <div className="flex-1 space-y-10 w-full">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                     <div>
                        <h3 className="text-2xl font-display font-black text-white tracking-tight mb-2">Synchronization Metrics</h3>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed">
                          You are <span className="text-primary-400 font-black">{Math.round(xpProgress)}%</span> through the current tier.
                        </p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">XP Remaining</p>
                        <p className="text-xl font-display font-black text-white">{(xpForNextLevel - (user?.xp % xpForNextLevel || 0)).toLocaleString()}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                     {stats.map(({ icon: Icon, label, value, color, trend }) => (
                       <div key={label} className="space-y-3">
                         <div className="flex items-center gap-2">
                           <Icon size={14} className={color} />
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                         </div>
                         <div>
                            <p className="text-2xl font-display font-black text-white">{value}</p>
                            <p className={`text-[8px] font-black ${color} opacity-60 uppercase mt-1`}>{trend}</p>
                         </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-8 border-white/5 bg-dark-900/40 relative overflow-hidden group h-full flex flex-col justify-between">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-amber/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                     <h2 className="text-xl font-display font-black text-white flex items-center gap-3">
                        <Target size={22} className="text-accent-amber" /> Active Ops
                     </h2>
                     <div className="px-3 py-1 bg-accent-amber/10 border border-accent-amber/20 rounded-full">
                        <span className="text-[8px] font-black text-accent-amber uppercase tracking-widest">{timeLeft}</span>
                     </div>
                  </div>
                  <div className="space-y-4">
                     {DAILY_QUESTS.map(quest => (
                       <div key={quest.id} className="p-5 rounded-2xl bg-dark-950/50 border border-white/5 flex items-center gap-5 hover:border-accent-amber/30 transition-all group/quest">
                          <div className="w-12 h-12 rounded-xl bg-accent-amber/5 border border-accent-amber/10 flex items-center justify-center shrink-0 group-hover/quest:bg-accent-amber/10 transition-colors">
                             <quest.icon size={22} className="text-accent-amber" />
                          </div>
                          <div className="flex-1">
                             <p className="text-sm font-black text-white tracking-tight">{quest.label}</p>
                             <div className="flex items-center gap-4 mt-2">
                                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-accent-amber shadow-glow" style={{ width: `${(quest.progress/quest.total)*100}%` }} />
                                </div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">+{quest.xp} XP</span>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               <Link to="/challenge" className="btn-primary w-full mt-10 flex items-center justify-center gap-3">
                  Initiate Operations <ArrowRight size={18} />
               </Link>
            </div>
         </div>
      </section>

      {/* Training Grounds Grid */}
      <section className="space-y-10">
         <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                  <LayoutGrid size={20} className="text-primary-400" />
               </div>
               <h3 className="text-2xl font-display font-black text-white tracking-tight">Tactical Training Grounds</h3>
            </div>
            <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
               Show Full Network <ChevronRight size={14} />
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(({ to, icon: Icon, label, desc, gradient, xp, progress }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={to} className="glass-card p-8 flex flex-col h-full hover:bg-dark-900/60 border-white/5 group relative overflow-hidden transition-all duration-500">
                  <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mb-8`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-display font-black text-white tracking-tight group-hover:text-primary-400 transition-colors">{label}</h4>
                      <div className="px-2 py-1 bg-white/5 rounded-lg">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{xp}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
                    
                    <div className="pt-4 space-y-2">
                       <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-600">
                          <span>Mastery Level</span>
                          <span>{progress}%</span>
                       </div>
                       <div className="h-1.5 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div className={`h-full bg-gradient-to-r ${gradient} rounded-full opacity-60`} style={{ width: `${progress}%` }} />
                       </div>
                    </div>
                  </div>
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-500">
                     <ChevronRight size={24} className="text-primary-400" />
                  </div>
                </Link>
              </motion.div>
            ))}
         </div>
      </section>

      {/* Intelligence & Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-4">
            <MasterRadar stats={user?.stats} />
         </div>
         
         <div className="lg:col-span-8 glass-card p-8 border-white/5 bg-dark-900/40">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-indigo/10 flex items-center justify-center border border-accent-indigo/20">
                     <BarChart3 size={20} className="text-accent-indigo" />
                  </div>
                  <h2 className="text-xl font-display font-black text-white">Synchronization History</h2>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-accent-indigo/10 rounded-full">
                  <TrendingUp size={12} className="text-accent-indigo" />
                  <span className="text-[9px] font-black text-accent-indigo uppercase tracking-widest">Growth detected</span>
               </div>
            </div>
            <div className="h-[300px]">
               <ActivityChart history={history} />
            </div>
         </div>
      </section>

      {/* Footer Log */}
      <section className="glass-card p-10 border-white/5 bg-dark-950/40">
         <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                  <Clock size={20} className="text-primary-400" />
               </div>
               <h2 className="text-xl font-display font-black text-white">Recent Neural Logs</h2>
            </div>
            <button className="btn-ghost">View Full Log</button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
               {Array.isArray(history) && history.slice(0, 6).map((activity, idx) => (
                 <motion.div 
                   key={activity?._id || idx} 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="flex items-center gap-5 p-6 rounded-[2rem] bg-dark-900/40 border border-white/5 hover:border-primary-500/20 transition-all group"
                 >
                    <div className="w-14 h-14 rounded-2xl bg-dark-950 flex items-center justify-center text-primary-400 border border-white/5 shadow-inner group-hover:bg-primary-500/10 transition-colors shrink-0">
                       {typeIcon[activity?.type] || <Activity size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-base font-black text-white truncate uppercase tracking-tight">{activity?.topic || activity?.type || 'Activity'}</p>
                       <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{activity?.type || 'Misc'}</span>
                          <div className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{activity?.completedAt ? new Date(activity.completedAt).toLocaleDateString() : 'Recent'}</span>
                       </div>
                    </div>
                    <div className="text-right shrink-0">
                       <p className="text-2xl font-display font-black text-white">{activity?.score ?? 0}%</p>
                       <p className="text-[9px] font-black text-primary-400 mt-1 uppercase">+{activity?.xpEarned ?? 0} XP</p>
                    </div>
                 </motion.div>
               ))}
            </AnimatePresence>
            {!loadingHistory && history.length === 0 && (
              <div className="col-span-full py-20 text-center">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🚀</div>
                 <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-sm">No synchronized records found</p>
              </div>
            )}
         </div>
      </section>
    </div>
  );
}
