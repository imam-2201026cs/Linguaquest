import { useState, useEffect } from 'react';
// Trigger fresh Vercel build v2
import { motion } from 'framer-motion';
import { 
  Zap, Trophy, Coins, Target, Sparkles, Flame,
  LayoutGrid, ArrowRight, ChevronRight, Clock,
  Star, PenTool, Headphones, BookOpen, CheckSquare, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MasterRadar from '../components/MasterRadar';
import ActivityChart from '../components/ActivityChart';

const DAILY_QUESTS = [
  { id: 1, label: 'Master 5 Grammar Errors', xp: 250, progress: 3, total: 5 },
  { id: 2, label: 'Engage in 2 Conversations', xp: 400, progress: 1, total: 2 },
  { id: 3, label: 'Earn 1000 XP', xp: 500, progress: 450, total: 1000 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/user/history');
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('History fetch error');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
    
    const timer = setInterval(() => {
      const now = new Date();
      const reset = new Date();
      reset.setHours(24, 0, 0, 0);
      const diff = reset - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`RESETS IN ${h}H ${m}M`);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const modules = [
    { to: '/writing', icon: PenTool, label: 'Writing Lab', desc: 'Craft high-fidelity linguistic compositions.', gradient: 'from-primary-500 to-primary-700', xp: '100 XP/Min' },
    { to: '/listening', icon: Headphones, label: 'Listening Sync', desc: 'Decode complex audio transmissions.', gradient: 'from-accent-indigo to-primary-600', xp: '120 XP/Min' },
    { to: '/reading', icon: BookOpen, label: 'Reading Matrix', desc: 'Navigate the vast data-streams of text.', gradient: 'from-accent-emerald to-primary-700', xp: '80 XP/Min' },
    { to: '/grammar', icon: CheckSquare, label: 'Logic Kernel', desc: 'Debug your grammatical architecture.', gradient: 'from-accent-amber to-primary-600', xp: '150 XP/Min' },
    { to: '/conversation', icon: MessageSquare, label: 'Chat Protocol', desc: 'Simulate high-stakes vocal interaction.', gradient: 'from-accent-rose to-primary-600', xp: '200 XP/Min' },
    { to: '/verbal-test', icon: Sparkles, label: 'Verbal Arena', desc: 'Competitive linguistic combat scenarios.', gradient: 'from-primary-400 to-accent-indigo', xp: '300 XP/Min' },
  ];

  const typeIcon = {
    writing: '✍️',
    listening: '🎧',
    reading: '📖',
    grammar: '⚙️',
    conversation: '🗣️',
    'verbal-test': '⚡'
  };

  const currentLevel = user?.level || 1;
  const levelProgress = user?.xp ? (user.xp % 1000) / 10 : 45;

  const stats = [
    { icon: Flame,  label: 'Daily Streak', value: `${user?.streak || 0}d`, color: 'text-accent-rose', bg: 'bg-accent-rose/10' },
    { icon: Trophy, label: 'Global Rank', value: '#128', color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
    { icon: Coins,  label: 'Treasury', value: user?.coins || 0, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
  ];

  return (
    <div className="space-y-8 md:space-y-10 px-4 md:px-0">
      {/* Hero Welcome */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="text-center md:text-left">
          <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary-400">Control Center</span>
            <div className="h-px w-12 bg-primary-500/30" />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
            Welcome back, <span className="shimmer-text">{user?.username}</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg mt-2 font-medium">Your next breakthrough is just one exercise away.</p>
        </div>
        <div className="flex gap-4 justify-center md:justify-end">
          <div className="glass-card px-5 py-3 md:px-6 md:py-4 border-white/10 bg-dark-900/60 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</p>
              <p className="text-white font-bold text-base md:text-lg leading-none">Elite Scholar</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-primary-500/20">
              <Sparkles size={20} className="text-primary-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Level Progress Large */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-1 bg-gradient-to-br from-primary-500/10 to-transparent border-white/5"
      >
        <div className="p-6 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-10">
          <div className="relative shrink-0">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[8px] md:border-[10px] border-white/5 flex flex-col items-center justify-center relative">
                 <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" className="text-primary-500/20" />
                    <motion.circle 
                      initial={{ strokeDasharray: "0, 440" }}
                      animate={{ strokeDasharray: `${(levelProgress / 100) * 440}, 440` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" 
                      className="text-primary-500 shadow-glow" strokeLinecap="round" 
                    />
                 </svg>
                <span className="text-4xl md:text-5xl font-display font-black text-white">{currentLevel}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tier</span>
             </div>
          </div>
          <div className="flex-1 space-y-6 md:space-y-8 w-full text-center md:text-left">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-2 tracking-tight">Mission Progress</h2>
              <p className="text-slate-400 text-sm md:text-lg">You are <span className="text-primary-400 font-bold">{Math.round(levelProgress)}%</span> through Level {currentLevel}. Keep it up!</p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {stats.map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                    <Icon size={14} className={color} />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                  </div>
                  <p className="text-base md:text-xl font-display font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto">
             <Link to="/challenge" className="btn-primary py-4 px-8 w-full flex items-center justify-center gap-3">
                Daily Mission <ArrowRight size={20} />
             </Link>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Modules */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
               <LayoutGrid size={24} className="text-primary-400" /> Training Grounds
            </h3>
            <Link to="/dashboard" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {modules.map(({ to, icon: Icon, label, desc, gradient, xp }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Link to={to} className="glass-card p-5 md:p-6 flex items-start gap-4 md:gap-5 hover:bg-white/5 border-white/5 group relative overflow-hidden transition-all duration-500">
                  <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${gradient} rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-base md:text-lg font-bold text-white tracking-tight group-hover:text-primary-400 transition-colors truncate">{label}</h4>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">{xp}</span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 mb-3 md:mb-4 font-medium leading-relaxed line-clamp-2 md:line-clamp-none">{desc}</p>
                    <div className="h-1.5 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                       <div className="h-full bg-white/10 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column - Analytics & Quests */}
        <div className="space-y-8">
          <MasterRadar stats={user?.stats} />
          
          <div className="glass-card p-6 md:p-8 border-white/5 bg-dark-900/40">
             <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-3">
                   <Target size={20} className="text-accent-amber" /> Active Quests
                </h2>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{timeLeft}</span>
             </div>
             <div className="space-y-4">
                {DAILY_QUESTS.map(quest => (
                  <div key={quest.id} className="p-4 rounded-xl md:rounded-2xl bg-dark-950/50 border border-white/5 flex items-center gap-4 hover:border-primary-500/20 transition-all">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <Star size={18} className="text-accent-amber" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white leading-tight truncate">{quest.label}</p>
                        <p className="text-[10px] font-black uppercase text-primary-400 mt-1">+{quest.xp} XP REWARD</p>
                     </div>
                     <ChevronRight size={16} className="text-slate-600 shrink-0" />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <ActivityChart history={history} />
         
         <div className="glass-card p-6 md:p-8 border-white/5 bg-dark-900/40">
            <h2 className="text-lg md:text-xl font-display font-bold text-white mb-6 md:mb-8 flex items-center gap-3">
               <Clock size={20} className="text-primary-400" /> Recent Log
            </h2>
            <div className="space-y-4">
               {history.slice(0, 4).map(activity => (
                 <div key={activity._id} className="flex items-center gap-4 p-4 rounded-xl md:rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-dark-950 flex items-center justify-center text-xl md:text-2xl border border-white/5 shrink-0">
                       {typeIcon[activity.type] || '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-white truncate uppercase tracking-tight">{activity.topic || activity.type}</p>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mt-1 truncate">
                          {activity.type} • {new Date(activity.completedAt).toLocaleDateString()}
                       </p>
                    </div>
                    <div className="text-right shrink-0">
                       <p className="text-base md:text-lg font-black text-white leading-none">{activity.score}%</p>
                       <p className="text-[10px] font-black text-primary-400 mt-1">+{activity.xpEarned} XP</p>
                    </div>
                 </div>
               ))}
               {history.length === 0 && (
                 <div className="py-10 md:py-12 text-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl md:text-3xl">🚀</div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">No records found</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
