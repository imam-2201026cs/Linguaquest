import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PenTool, Headphones, BookOpen, CheckSquare, Zap, Flame, Trophy,
  TrendingUp, Clock, Target, ArrowRight, Coins, Star, CheckCircle2,
  Circle, RotateCcw, MessageCircle
} from 'lucide-react';

/* ─────────────────── constants ─────────────────── */
const modules = [
  { to: '/writing',   icon: PenTool,      label: 'Writing',   desc: 'Practice essay & creative writing',   gradient: 'from-blue-600 to-cyan-500',    glow: 'shadow-blue-500/20',   stat: 'writingCompleted',   xp: '10-50 XP', radarKey: 'writing'   },
  { to: '/listening', icon: Headphones,   label: 'Listening', desc: 'Train comprehension skills',           gradient: 'from-purple-600 to-pink-500',  glow: 'shadow-purple-500/20', stat: 'listeningCompleted', xp: '8-40 XP',  radarKey: 'listening' },
  { to: '/reading',   icon: BookOpen,     label: 'Reading',   desc: 'Build vocabulary & inference',         gradient: 'from-green-600 to-emerald-500', glow: 'shadow-green-500/20',  stat: 'readingCompleted',   xp: '10-50 XP', radarKey: 'reading'   },
  { to: '/grammar',   icon: CheckSquare,  label: 'Grammar',   desc: 'Fix mistakes with AI explanations',   gradient: 'from-orange-500 to-amber-400', glow: 'shadow-orange-500/20', stat: 'grammarChecked',     xp: '5-15 XP',  radarKey: 'grammar'   },
  { to: '/conversation', icon: MessageCircle, label: 'AI Chat',  desc: 'Role-play real scenarios with AI',     gradient: 'from-violet-600 to-pink-600',  glow: 'shadow-violet-500/20', stat: 'conversationsCompleted', xp: '20-80 XP', radarKey: 'conversation' },
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
    <div className="glass-card p-6">
      <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp size={18} className="text-primary-400" /> Weekly Activity
      </h2>
      <div className="flex items-end gap-2 h-28">
        {data.map(({ label, xp, isToday }) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500 font-medium">{xp > 0 ? xp : ''}</span>
            <div className="w-full flex flex-col justify-end" style={{ height: '72px' }}>
              <div
                className={`w-full rounded-t-md transition-all duration-700 ${isToday ? 'bg-gradient-to-t from-primary-600 to-primary-400' : 'bg-white/10 hover:bg-white/20'}`}
                style={{ height: `${Math.max(4, (xp / maxXP) * 72)}px` }}
              />
            </div>
            <span className={`text-[10px] font-semibold ${isToday ? 'text-primary-400' : 'text-slate-500'}`}>{label}</span>
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
    { label: 'Listening', value: Math.min(100, (stats?.listeningCompleted || 0) * 12) },
    { label: 'Reading',   value: Math.min(100, (stats?.readingCompleted   || 0) * 12) },
    { label: 'Grammar',   value: Math.min(100, (stats?.grammarChecked     || 0) * 12) },
    { label: 'Vocab',     value: Math.min(100, (stats?.totalScore         || 0) / 10) },
  ];

  const cx = 90, cy = 90, r = 65;
  const n = skills.length;

  const angleOf = i => (Math.PI * 2 * i) / n - Math.PI / 2;

  const outerPoints = skills.map((_, i) => ({
    x: cx + r * Math.cos(angleOf(i)),
    y: cy + r * Math.sin(angleOf(i)),
  }));

  const innerPoints = skills.map((s, i) => ({
    x: cx + (r * s.value / 100) * Math.cos(angleOf(i)),
    y: cy + (r * s.value / 100) * Math.sin(angleOf(i)),
  }));

  const toPath = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  // grid rings
  const rings = [0.25, 0.5, 0.75, 1].map(f =>
    skills.map((_, i) => ({
      x: cx + r * f * Math.cos(angleOf(i)),
      y: cy + r * f * Math.sin(angleOf(i)),
    }))
  );

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
        <Target size={18} className="text-accent-purple" /> Skill Radar
      </h2>
      <div className="flex justify-center">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* grid rings */}
          {rings.map((pts, ri) => (
            <polygon key={ri} points={pts.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          ))}
          {/* spokes */}
          {outerPoints.map((p, i) => (
            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          ))}
          {/* filled area */}
          <path d={toPath(innerPoints)}
            fill="rgba(99,102,241,0.25)" stroke="rgba(99,102,241,0.8)" strokeWidth="2" />
          {/* dots */}
          {innerPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#818cf8" />
          ))}
          {/* labels */}
          {outerPoints.map((p, i) => {
            const dx = p.x - cx, dy = p.y - cy;
            const nx = p.x + dx * 0.22, ny = p.y + dy * 0.22;
            return (
              <text key={i} x={nx} y={ny + 4} textAnchor="middle"
                fontSize="9" fill="#94a3b8" fontFamily="sans-serif">
                {skills[i].label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ─────────────────── Streak Calendar ─────────────────── */
function StreakCalendar({ history }) {
  const today = new Date();
  const activeDays = new Set(history.map(a => new Date(a.completedAt).toDateString()));

  const cells = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return { dateStr: d.toDateString(), isToday: i === 29 };
  });

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
        <Flame size={18} className="text-accent-orange" /> Streak Calendar <span className="text-sm font-normal text-slate-500">(last 30 days)</span>
      </h2>
      <div className="grid grid-cols-10 gap-1.5">
        {cells.map(({ dateStr, isToday }) => {
          const active = activeDays.has(dateStr);
          return (
            <div
              key={dateStr}
              title={dateStr}
              className={`w-5 h-5 rounded-sm transition-all ${
                active
                  ? 'bg-green-500 shadow-sm shadow-green-500/40'
                  : 'bg-white/5'
              } ${isToday ? 'ring-2 ring-primary-400 ring-offset-1 ring-offset-dark-900' : ''}`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-white/5 inline-block" /> Missed</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Active</span>
      </div>
    </div>
  );
}

/* ─────────────────── Daily Quests ─────────────────── */
function DailyQuests({ stats, history }) {
  const todayStr = new Date().toDateString();
  const todayActivities = history.filter(a => new Date(a.completedAt).toDateString() === todayStr);

  const isComplete = (quest) => {
    if (quest.id === 'writing') return todayActivities.some(a => a.type === 'writing');
    if (quest.id === 'grammar') return todayActivities.some(a => a.type === 'grammar');
    if (quest.id === 'score80') return todayActivities.some(a => (a.score || 0) >= 80);
    return false;
  };

  const totalXP = DAILY_QUESTS.reduce((s, q) => s + q.xp, 0);
  const earnedXP = DAILY_QUESTS.filter(q => isComplete(q)).reduce((s, q) => s + q.xp, 0);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <Star size={18} className="text-accent-yellow" /> Daily Quests
        </h2>
        <span className="text-xs text-slate-500">Resets midnight</span>
      </div>
      {/* progress bar */}
      <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-700"
          style={{ width: `${totalXP > 0 ? (earnedXP / totalXP) * 100 : 0}%` }} />
      </div>
      <div className="space-y-3">
        {DAILY_QUESTS.map(quest => {
          const done = isComplete(quest);
          return (
            <div key={quest.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${done ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/3'}`}>
              {done
                ? <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                : <Circle size={18} className="text-slate-600 shrink-0" />}
              <span className={`flex-1 text-sm ${done ? 'text-green-300 line-through' : 'text-slate-300'}`}>
                {quest.label}
              </span>
              <span className={`text-xs font-bold ${done ? 'text-green-400' : 'text-accent-yellow'}`}>+{quest.xp} XP</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────── Continue Card ─────────────────── */
function ContinueCard({ history }) {
  const scores = {};
  history.forEach(a => {
    if (!scores[a.type] || a.score < scores[a.type].score) scores[a.type] = a;
  });
  const lowest = Object.values(scores).sort((a, b) => a.score - b.score)[0];
  if (!lowest) return null;
  const mod = modules.find(m => m.radarKey === lowest.type) || modules[0];

  return (
    <div className={`glass-card p-5 bg-gradient-to-br ${mod.gradient.replace('from-', 'from-').replace(' to-', '/10 to-')}/5 border-white/10 flex items-center gap-4`}>
      <div className={`w-12 h-12 bg-gradient-to-br ${mod.gradient} rounded-xl flex items-center justify-center shrink-0`}>
        <mod.icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">Continue where you left off</p>
        <p className="font-display font-bold text-white truncate">{lowest.topic || lowest.type}</p>
        <p className="text-xs text-slate-500 capitalize">{lowest.type} • Last score: {lowest.score}%</p>
      </div>
      <Link to={mod.to} className="btn-primary text-xs py-2 px-4 flex items-center gap-1 shrink-0 whitespace-nowrap">
        <RotateCcw size={12} /> Resume
      </Link>
    </div>
  );
}

/* ─────────────────── Smart Recommendation ─────────────────── */
function SmartRec({ stats, history }) {
  const scored = modules.map(m => ({
    ...m,
    completed: stats?.[m.stat] || 0,
  })).sort((a, b) => a.completed - b.completed);
  const rec = scored[0];

  return (
    <div className="glass-card p-5 bg-gradient-to-br from-accent-purple/10 to-primary-500/10 border-accent-purple/20 flex items-start gap-3">
      <span className="text-2xl">🤖</span>
      <div>
        <p className="text-sm text-white font-semibold mb-0.5">Smart Recommendation</p>
        <p className="text-sm text-slate-300">
          Based on your scores, we recommend practising{' '}
          <Link to={rec.to} className="font-bold text-primary-400 underline underline-offset-2">{rec.label}</Link>{' '}
          today — you've completed it the least.
        </p>
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
  const milestoneShown = useRef(false);

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

  // XP Milestone notification
  useEffect(() => {
    if (!user || milestoneShown.current) return;
    const xpForNextLevel = (user.level || 1) * (user.level || 1) * 100;
    const xpInLevel = user.xp % xpForNextLevel;
    const remaining = xpForNextLevel - xpInLevel;
    if (remaining <= 150 && remaining > 0) {
      milestoneShown.current = true;
      setTimeout(() => {
        toast(`🏆 Only ${remaining} XP away from Level ${(user.level || 1) + 1}!`, {
          duration: 5000,
          style: { background: '#1e1b4b', color: '#e0e7ff', border: '1px solid rgba(99,102,241,0.4)' },
          icon: '⚡',
        });
      }, 1500);
    }
  }, [user]);

  const xpForLevel = (level) => level * level * 100;
  const currentXP = user?.xp || 0;
  const currentLevel = user?.level || 1;
  const levelXP = xpForLevel(currentLevel);
  const prevLevelXP = xpForLevel(currentLevel - 1);
  const levelProgress = Math.min(100, ((currentXP - prevLevelXP) / (levelXP - prevLevelXP)) * 100);

  const totalActivities = user ?
    (user.stats?.writingCompleted || 0) + (user.stats?.listeningCompleted || 0) +
    (user.stats?.readingCompleted || 0) + (user.stats?.grammarChecked || 0) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Hey, {user?.username}! 👋
          </h1>
          <p className="text-slate-400 mt-1">Ready to level up your English today?</p>
        </div>
        <div className="streak-badge text-base py-2 px-3">
          <Flame size={16} />
          {user?.streak || 0} day streak
        </div>
      </div>

      {/* Level & Goal Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 bg-gradient-to-br from-primary-500/10 to-accent-purple/10 border-primary-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-display font-bold text-white">Level {currentLevel}</span>
                <span className="level-badge text-sm py-1 px-3"><Star size={12} />{currentXP} Total XP</span>
              </div>
              <p className="text-slate-400 text-sm">{Math.round(levelProgress)}% to Level {currentLevel + 1}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Coins size={16} className="text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">{user?.coins || 0}</span>
              </div>
              <p className="text-xs text-slate-500">coins</p>
            </div>
          </div>
          <div className="h-3 bg-dark-600 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-accent-purple rounded-full progress-bar"
              style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        <div className="glass-card p-6 border-accent-green/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2 mb-1">
                <Target size={20} className="text-accent-green" /> Weekly Goal
              </h2>
              <p className="text-slate-400 text-sm">
                {(() => {
                  const weekXp = history.filter(a => (new Date() - new Date(a.completedAt)) / (1000*60*60*24) <= 7).reduce((s, a) => s + (a.xpEarned || 0), 0);
                  const goal = user?.weeklyGoal || 500;
                  return `${weekXp} / ${goal} XP earned this week`;
                })()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center border border-accent-green/30">
              {(() => {
                const weekXp = history.filter(a => (new Date() - new Date(a.completedAt)) / (1000*60*60*24) <= 7).reduce((s, a) => s + (a.xpEarned || 0), 0);
                const goal = user?.weeklyGoal || 500;
                return weekXp >= goal ? <Trophy size={20} className="text-yellow-400" /> : <TrendingUp size={20} className="text-accent-green" />;
              })()}
            </div>
          </div>
          <div className="h-3 bg-dark-600 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (history.filter(a => (new Date() - new Date(a.completedAt)) / (1000*60*60*24) <= 7).reduce((s, a) => s + (a.xpEarned || 0), 0) / (user?.weeklyGoal || 500)) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Daily Challenge Banner */}
      <div 
        onClick={() => navigate('/challenge')}
        className="glass-card p-6 md:p-8 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 cursor-pointer hover:border-red-500/40 transition-all group overflow-hidden relative"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10 text-center md:text-left">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/20 group-hover:scale-110 transition-transform">
            <Target size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row items-center gap-2 mb-2 justify-center md:justify-start">
              <h2 className="text-xl md:text-2xl font-display font-bold text-white">Daily Global Challenge</h2>
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
            </div>
            <p className="text-sm text-slate-400 max-w-lg mx-auto md:mx-0">Everyone gets the exact same quiz today. Compete globally, earn <strong className="text-accent-yellow">Double XP</strong>, and climb the leaderboard!</p>
          </div>
          <div className="flex flex-row md:flex-col items-center gap-2 md:gap-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Time Left</span>
            <span className="text-lg md:text-xl font-mono font-bold text-red-400">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { icon: Zap,    label: 'Total XP',   value: currentXP,                    color: 'text-accent-yellow',  bg: 'bg-accent-yellow/10'  },
          { icon: Target, label: 'Activities', value: totalActivities,               color: 'text-primary-400',    bg: 'bg-primary-500/10'    },
          { icon: Flame,  label: 'Streak',     value: `${user?.streak || 0}d`,       color: 'text-accent-orange',  bg: 'bg-accent-orange/10'  },
          { icon: Trophy, label: 'Level',      value: currentLevel,                  color: 'text-accent-green',   bg: 'bg-accent-green/10'   },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue + Smart Rec */}
      {!loading && history.length > 0 && (
        <div className="space-y-3">
          <ContinueCard history={history} />
          <SmartRec stats={user?.stats} history={history} />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WeeklyChart history={history} />
        </div>
        <SkillRadar stats={user?.stats} />
      </div>

      {/* Quests + Streak Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyQuests stats={user?.stats} history={history} />
        <StreakCalendar history={history} />
      </div>

      {/* Practice Modules */}
      <div>
        <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-400" /> Practice Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ to, icon: Icon, label, desc, gradient, glow, stat, xp }) => (
            <Link key={to} to={to}
              className={`glass-card p-5 hover:scale-[1.03] transition-all duration-300 hover:shadow-xl ${glow} group cursor-pointer`}>
              <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-1">{label}</h3>
              <p className="text-slate-400 text-xs mb-3 leading-relaxed">{desc}</p>
              <div className="flex items-center justify-between">
                <span className="xp-badge text-xs"><Zap size={10} />{xp}</span>
                <span className="text-xs text-slate-500">{user?.stats?.[stat] || 0} done</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary-400 font-medium group-hover:gap-2 transition-all">
                Start <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
          <Clock size={20} className="text-primary-400" /> Recent Activity
        </h2>
        {loading ? (
          <div className="glass-card p-8 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <p className="text-slate-400">No activities yet. Start your first exercise!</p>
            <Link to="/writing" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm py-2 px-4">
              Begin Writing <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 6).map(activity => (
              <div key={activity._id} className="glass-card p-4 flex items-center gap-4 hover:border-white/10 transition-all">
                <div className="text-2xl">{typeIcon[activity.type] || '📝'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{activity.topic || activity.type}</p>
                  <p className="text-xs text-slate-500 capitalize">{activity.type} • {new Date(activity.completedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-white">{activity.score}%</div>
                  <div className="xp-badge text-xs"><Zap size={10} />+{activity.xpEarned}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
