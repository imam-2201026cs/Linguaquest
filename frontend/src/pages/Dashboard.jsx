import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool, Headphones, BookOpen, CheckSquare, Zap, Flame, Trophy,
  TrendingUp, Clock, Target, ArrowRight, Coins, Star, CheckCircle2,
  Circle, RotateCcw, MessageCircle, Sparkles, Activity, Calendar, LayoutGrid,
  ChevronRight
} from 'lucide-react';

/* ─────────────────── constants ─────────────────── */
const modules = [
  { to: '/writing',   icon: PenTool,      label: 'Writing Mastery',   desc: 'Essays & Creative pieces',   gradient: 'from-primary-500 to-primary-700',    glow: 'shadow-primary-500/30',   stat: 'writingCompleted',   xp: '10-50 XP', radarKey: 'writing'   },
  { to: '/listening', icon: Headphones,   label: 'Audio Fluency', desc: 'Real-world comprehension',           gradient: 'from-accent-indigo to-primary-600',  glow: 'shadow-indigo-500/30', stat: 'listeningCompleted', xp: '8-40 XP',  radarKey: 'listening' },
  { to: '/reading',   icon: BookOpen,     label: 'Smart Reading',   desc: 'Context & Inference',         gradient: 'from-accent-emerald to-primary-700', glow: 'shadow-emerald-500/30',  stat: 'readingCompleted',   xp: '10-50 XP', radarKey: 'reading'   },
  { to: '/grammar',   icon: CheckSquare,  label: 'Grammar Labs',   desc: 'Fix & Refine logic',   gradient: 'from-accent-amber to-primary-600', glow: 'shadow-amber-500/30', stat: 'grammarChecked',     xp: '5-15 XP',  radarKey: 'grammar'   },
  { to: '/verbal-test', icon: Zap,          label: 'Verbal Pro', desc: 'Rigorous 30-min sprints', gradient: 'from-primary-600 to-accent-rose', glow: 'shadow-rose-500/30', stat: 'verbalTestCompleted', xp: '150 XP', radarKey: 'verbal' },
  { to: '/conversation', icon: MessageCircle, label: 'Persona Chat',  desc: 'Immersive AI scenarios',     gradient: 'from-primary-400 to-accent-indigo',  glow: 'shadow-blue-500/30', stat: 'conversationsCompleted', xp: '20-80 XP', radarKey: 'conversation' },
];

const DAILY_QUESTS = [
  { id: 'writing', label: 'Complete 1 Writing exercise', xp: 50, statKey: 'writingCompleted' },
  { id: 'score80', label: 'Score 80%+ on any quiz',      xp: 30, statKey: '_score80' },
  { id: 'grammar', label: 'Check grammar once',          xp: 20, statKey: 'grammarChecked'  },
];

const typeIcon = { writing: '✍️', listening: '🎧', reading: '📖', grammar: '✅', conversation: '🎭' };

/* ─────────────────── Weekly Activity Chart ─────────────────── */
function WeeklyChart({ history }) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();

  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const xp = history
      .filter(a => new Date(a.completedAt).toDateString() === dateStr)
      .reduce((sum, a) => sum + (a.xpEarned || 0), 0);
    return { label: days[d.getDay()], xp, isToday: i === 6 };
  });

  const maxXP = Math.max(...data.map(d => d.xp), 1);

  return (
    <div className="glass-card p-8 border-white/5 bg-dark-900/40">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
          <Activity size={20} className="text-primary-400" /> Weekly Momentum
        </h2>
        <div className="flex items-center gap-1.5 bg-dark-950 px-3 py-1.5 rounded-full border border-white/5">
           <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Analytics</span>
        </div>
      </div>
      <div className="flex items-end gap-3 h-40">
        {data.map(({ label, xp, isToday }, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-3">
            <AnimatePresence>
              {xp > 0 && (
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-primary-400 font-black"
                >
                  {xp}
                </motion.span>
              )}
            </AnimatePresence>
            <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(6, (xp / maxXP) * 100)}px` }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                className={`w-full rounded-t-xl transition-all duration-500 relative group overflow-hidden ${isToday ? 'bg-gradient-to-t from-primary-600 to-primary-400 shadow-glow' : 'bg-white/5 hover:bg-white/10'}`}
              >
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-primary-400' : 'text-slate-600'}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── Skill Radar Chart ─────────────────── */
function SkillRadar({ stats }) {
  const skills = [
    { label: 'Writing',   value: Math.min(100, (stats?.writingCompleted   || 0) * 12) },
    { label: 'Listen', value: Math.min(100, (stats?.listeningCompleted || 0) * 12) },
    { label: 'Read',   value: Math.min(100, (stats?.readingCompleted   || 0) * 12) },
    { label: 'Grammar',   value: Math.min(100, (stats?.grammarChecked     || 0) * 12) },
    { label: 'Vocab',     value: Math.min(100, (stats?.totalScore         || 0) / 10) },
  ];

  const cx = 100, cy = 100, r = 75;
  const n = skills.length;
  const angleOf = i => (Math.PI * 2 * i) / n - Math.PI / 2;

  const innerPoints = skills.map((s, i) => ({
    x: cx + (r * s.value / 100) * Math.cos(angleOf(i)),
    y: cy + (r * s.value / 100) * Math.sin(angleOf(i)),
  }));

  const toPath = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <div className="glass-card p-8 border-white/5 bg-dark-900/40 flex flex-col items-center">
      <h2 className="text-xl font-display font-bold text-white mb-8 w-full flex items-center gap-3">
        <Target size={20} className="text-accent-rose" /> Skill Proficiency
      </h2>
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <circle cx="100" cy="100" r="25" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          
          {skills.map((_, i) => (
            <line key={i} x1="100" y1="100" x2={cx + r * Math.cos(angleOf(i))} y2={cy + r * Math.sin(angleOf(i))} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          ))}
          
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={toPath(innerPoints)}
            fill="rgba(139, 92, 246, 0.2)" 
            stroke="rgba(139, 92, 246, 0.6)" 
            strokeWidth="3" 
          />
          
          {innerPoints.map((p, i) => (
            <motion.circle 
              key={i} 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              cx={p.x} cy={p.y} r="4" 
              fill="#8b5cf6" 
              className="shadow-glow"
            />
          ))}
        </svg>
        
        {skills.map((s, i) => {
          const x = cx + (r + 20) * Math.cos(angleOf(i));
          const y = cy + (r + 15) * Math.sin(angleOf(i));
          return (
            <div key={i} style={{ position: 'absolute', left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {s.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────── Dashboard ─────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    axios.get('/api/user/history').then(r => setHistory(r.data)).catch(() => {}).finally(() => setLoading(false));
    
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const xpForNextLevel = currentLevel * currentLevel * 100;
  const xpInLevel = currentXP % xpForNextLevel;
  const levelProgress = Math.min(100, (xpInLevel / xpForNextLevel) * 100);

  const stats = [
    { icon: Zap,    label: 'Experience', value: currentXP, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { icon: Flame,  label: 'Daily Streak', value: `${user?.streak || 0}d`, color: 'text-accent-rose', bg: 'bg-accent-rose/10' },
    { icon: Trophy, label: 'Global Rank', value: '#128', color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
    { icon: Coins,  label: 'Treasury', value: user?.coins || 0, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Hero Welcome */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary-400">Control Center</span>
            <div className="h-px w-12 bg-primary-500/30" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            Welcome back, <span className="shimmer-text">{user?.username}</span>
          </h1>
          <p className="text-slate-400 text-lg mt-2 font-medium">Your next breakthrough is just one exercise away.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-6 py-4 border-white/10 bg-dark-900/60 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Current Status</p>
              <p className="text-white font-bold text-lg leading-none">Elite Scholar</p>
            </div>
            <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center border border-primary-500/20">
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
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="relative shrink-0">
             <div className="w-40 h-40 rounded-full border-[10px] border-white/5 flex flex-col items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                   <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" className="text-primary-500/20" />
                   <motion.circle 
                     initial={{ strokeDasharray: "0, 440" }}
                     animate={{ strokeDasharray: `${(levelProgress / 100) * 440}, 440` }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" 
                     className="text-primary-500 shadow-glow" strokeLinecap="round" 
                   />
                </svg>
                <span className="text-5xl font-display font-black text-white">{currentLevel}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tier</span>
             </div>
          </div>
          <div className="flex-1 space-y-8 w-full text-center md:text-left">
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-2 tracking-tight">Mission Progress</h2>
              <p className="text-slate-400 text-lg">You are <span className="text-primary-400 font-bold">{Math.round(levelProgress)}%</span> through Level {currentLevel}. Keep it up!</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                    <Icon size={14} className={color} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                  </div>
                  <p className="text-xl font-display font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 hidden lg:block">
             <Link to="/challenge" className="btn-primary flex items-center gap-3">
                Daily Mission <ArrowRight size={20} />
             </Link>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Modules */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
               <LayoutGrid size={24} className="text-primary-400" /> Training Grounds
            </h3>
            <Link to="/dashboard" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map(({ to, icon: Icon, label, desc, gradient, glow, stat, xp }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Link to={to} className="glass-card p-6 flex items-start gap-5 hover:bg-white/5 border-white/5 group relative overflow-hidden transition-all duration-500">
                  <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-bold text-white tracking-tight group-hover:text-primary-400 transition-colors">{label}</h4>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{xp}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 font-medium leading-relaxed">{desc}</p>
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
          <SkillRadar stats={user?.stats} />
          
          <div className="glass-card p-8 border-white/5 bg-dark-900/40">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
                   <Target size={20} className="text-accent-amber" /> Active Quests
                </h2>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{timeLeft}</span>
             </div>
             <div className="space-y-4">
                {DAILY_QUESTS.map(quest => (
                  <div key={quest.id} className="p-4 rounded-2xl bg-dark-950/50 border border-white/5 flex items-center gap-4 hover:border-primary-500/20 transition-all">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <Star size={18} className="text-accent-amber" />
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-bold text-white leading-tight">{quest.label}</p>
                        <p className="text-[10px] font-black uppercase text-primary-400 mt-1">+{quest.xp} XP REWARD</p>
                     </div>
                     <ChevronRight size={16} className="text-slate-600" />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <WeeklyChart history={history} />
         
         <div className="glass-card p-8 border-white/5 bg-dark-900/40">
            <h2 className="text-xl font-display font-bold text-white mb-8 flex items-center gap-3">
               <Clock size={20} className="text-primary-400" /> Recent Log
            </h2>
            <div className="space-y-4">
               {history.slice(0, 4).map(activity => (
                 <div key={activity._id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-dark-950 flex items-center justify-center text-2xl border border-white/5">
                       {typeIcon[activity.type] || '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-white truncate uppercase tracking-tight">{activity.topic || activity.type}</p>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mt-1">
                          {activity.type} • {new Date(activity.completedAt).toLocaleDateString()}
                       </p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-white leading-none">{activity.score}%</p>
                       <p className="text-[10px] font-black text-primary-400 mt-1">+{activity.xpEarned} XP</p>
                    </div>
                 </div>
               ))}
               {history.length === 0 && (
                 <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🚀</div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No records found</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
