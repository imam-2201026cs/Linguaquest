import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Flame, Trophy, Target, PenTool, Headphones, BookOpen, 
  CheckSquare, Star, Coins, TrendingUp, Calendar, Edit2, 
  Share2, Link as LinkIcon, Settings, ChevronRight, LayoutGrid, 
  Sparkles, Shield, Award, MessageSquare, Globe, Info, X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const ACHIEVEMENTS = [
  { id: 'first_write', icon: '✍️', name: 'First Words', desc: 'Complete your first writing exercise', condition: (s) => s.writingCompleted >= 1 },
  { id: 'write_5', icon: '📝', name: 'Wordsmith', desc: 'Complete 5 writing exercises', condition: (s) => s.writingCompleted >= 5 },
  { id: 'write_20', icon: '🖊️', name: 'Author', desc: 'Complete 20 writing exercises', condition: (s) => s.writingCompleted >= 20 },
  { id: 'first_listen', icon: '🎧', name: 'Ears Open', desc: 'Complete your first listening exercise', condition: (s) => s.listeningCompleted >= 1 },
  { id: 'listen_10', icon: '🎵', name: 'Active Listener', desc: 'Complete 10 listening exercises', condition: (s) => s.listeningCompleted >= 10 },
  { id: 'first_read', icon: '📖', name: 'Bookworm', desc: 'Complete your first reading exercise', condition: (s) => s.readingCompleted >= 1 },
  { id: 'read_10', icon: '📚', name: 'Scholar', desc: 'Complete 10 reading exercises', condition: (s) => s.readingCompleted >= 10 },
  { id: 'first_grammar', icon: '✅', name: 'Grammar Guard', desc: 'Complete your first grammar check', condition: (s) => s.grammarChecked >= 1 },
  { id: 'grammar_10', icon: '🎯', name: 'Precision Writer', desc: 'Check grammar 10 times', condition: (s) => s.grammarChecked >= 10 },
  { id: 'level_5', icon: '⭐', name: 'Rising Star', desc: 'Reach Level 5', condition: (_, u) => u.level >= 5 },
  { id: 'level_10', icon: '🌟', name: 'Expert', desc: 'Reach Level 10', condition: (_, u) => u.level >= 10 },
  { id: 'streak_7', icon: '🔥', name: 'Week Warrior', desc: 'Maintain a 7-day streak', condition: (_, u) => u.streak >= 7 },
  { id: 'streak_30', icon: '💎', name: 'Diamond Learner', desc: 'Maintain a 30-day streak', condition: (_, u) => u.streak >= 30 },
  { id: 'xp_1000', icon: '⚡', name: 'XP Hunter', desc: 'Earn 1000 total XP', condition: (_, u) => u.xp >= 1000 },
  { id: 'all_modules', icon: '🏆', name: 'All-Rounder', desc: 'Try all 4 modules', condition: (s) => s.writingCompleted >= 1 && s.listeningCompleted >= 1 && s.readingCompleted >= 1 && s.grammarChecked >= 1 },
  { id: 'first_convo', icon: '🎭', name: 'First Conversation', desc: 'Complete your first AI conversation', condition: (s) => s.conversationsCompleted >= 1 },
  { id: 'convo_5', icon: '🗣️', name: 'Conversationalist', desc: 'Complete 5 AI conversations', condition: (s) => s.conversationsCompleted >= 5 },
  { id: 'convo_20', icon: '🎙️', name: 'Public Speaker', desc: 'Complete 20 AI conversations', condition: (s) => s.conversationsCompleted >= 20 },
  { id: 'all_5_modules', icon: '⚡', name: 'Ultimate Learner', desc: 'Try all 5 modules including AI Chat', condition: (s) => s.writingCompleted >= 1 && s.listeningCompleted >= 1 && s.readingCompleted >= 1 && s.grammarChecked >= 1 && s.conversationsCompleted >= 1 },
];

export default function Profile() {
  const { user, fetchProfile } = useAuth();
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', avatarEmoji: '', avatarColor: '', weeklyGoal: 500 });
  
  const achievementRefs = useRef({});

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username,
        bio: user.bio || 'English learner on LinguaQuest!',
        avatarEmoji: user.avatarEmoji || '👤',
        avatarColor: user.avatarColor || 'from-primary-500 to-primary-700',
        weeklyGoal: user.weeklyGoal || 500
      });
      
      setLoading(true);
      axios.get('/api/user/history')
        .then(r => {
          const activities = Array.isArray(r.data) ? r.data : [];
          setHistory(activities);
          generateChartData(activities);
        })
        .catch(err => {
          console.error('History fetch error:', err);
          setHistory([]);
          generateChartData([]);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const generateChartData = (activities = []) => {
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return { date: d.toISOString().split('T')[0], xp: 0 };
    });

    if (Array.isArray(activities)) {
      activities.forEach(a => {
        if (!a.completedAt) return;
        const dateStr = new Date(a.completedAt).toISOString().split('T')[0];
        const dayData = last30Days.find(d => d.date === dateStr);
        if (dayData) dayData.xp += (a.xpEarned || 0);
      });
    }

    const formatted = last30Days.map(d => ({
      name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      xp: d.xp
    }));
    setChartData(formatted);
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put('/api/user/profile', editForm);
      toast.success('Profile recalibrated! 🚀');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error('Recalibration failed.');
    }
  };

  const shareAchievement = (achievementId, name) => {
    const el = achievementRefs.current[achievementId];
    if (!el) return;
    html2canvas(el, { backgroundColor: '#030014' }).then(canvas => {
      const link = document.createElement('a');
      link.download = `LinguaQuest_${name}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Credential saved to local storage.');
    });
  };

  const copyPublicLink = () => {
    const url = `${window.location.origin}/user/${user.username}`;
    navigator.clipboard.writeText(url);
    toast.success('Communication link copied.');
  };

  if (!user || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <div className="absolute inset-0 blur-xl bg-primary-500/20 animate-pulse" />
        </div>
        <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Synchronizing Neural Profile</p>
      </div>
    );
  }

  const stats = user.stats || {};
  const totalActivities = (stats.writingCompleted || 0) + (stats.listeningCompleted || 0) + (stats.readingCompleted || 0) + (stats.grammarChecked || 0) + (stats.conversationsCompleted || 0);
  const unlockedAchievements = ACHIEVEMENTS.filter(a => {
    try {
      return a.condition(stats, user);
    } catch(e) {
      return false;
    }
  });

  const radarData = [
    { subject: 'Write', A: stats.writingCompleted || 0 },
    { subject: 'Listen', A: stats.listeningCompleted || 0 },
    { subject: 'Read', A: stats.readingCompleted || 0 },
    { subject: 'Logic', A: stats.grammarChecked || 0 },
    { subject: 'Chat', A: stats.conversationsCompleted || 0 },
  ];

  const COLORS = ['from-primary-500 to-primary-700', 'from-accent-indigo to-primary-600', 'from-accent-emerald to-primary-700', 'from-accent-amber to-primary-600', 'from-accent-rose to-primary-600'];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-1 border-white/5 bg-gradient-to-br from-primary-500/10 to-transparent relative overflow-hidden"
      >
        <div className="p-10 md:p-12 flex flex-col md:flex-row items-center gap-10">
           <div className="relative group">
              <div className={`w-32 h-32 bg-gradient-to-br ${user.avatarColor || 'from-primary-500 to-primary-700'} rounded-[40px] flex items-center justify-center text-5xl shadow-glow relative z-10 group-hover:rotate-6 transition-transform duration-500`}>
                {user.avatarEmoji || user.username[0].toUpperCase()}
              </div>
              <div className="absolute inset-0 bg-primary-500/20 rounded-[40px] blur-2xl group-hover:blur-3xl transition-all" />
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-dark-900 border border-white/10 rounded-xl flex items-center justify-center text-primary-400 hover:text-white transition-colors z-20 shadow-xl"
              >
                <Settings size={18} />
              </button>
           </div>

           <div className="flex-1 text-center md:text-left space-y-6">
              <div>
                 <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">Verified Scholar</span>
                    <div className="h-px w-8 bg-primary-500/30" />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">{user.username}</h1>
                 <p className="text-slate-400 text-lg mt-2 font-medium italic">"{user.bio || 'Architect of own excellence.'}"</p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                 <div className="glass-card px-4 py-2 flex items-center gap-2 border-white/10 bg-dark-950/50">
                    <Star size={14} className="text-accent-amber" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">Level {user.level}</span>
                 </div>
                 <div className="glass-card px-4 py-2 flex items-center gap-2 border-white/10 bg-dark-950/50">
                    <Zap size={14} className="text-primary-400" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">{user.xp} Total XP</span>
                 </div>
                 <div className="glass-card px-4 py-2 flex items-center gap-2 border-white/10 bg-dark-950/50">
                    <Flame size={14} className="text-accent-rose" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">{user.streak} Day Streak</span>
                 </div>
              </div>
           </div>

           <div className="shrink-0 flex flex-col gap-3">
              <button onClick={copyPublicLink} className="btn-primary py-3 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                 <LinkIcon size={14}/> Communication ID
              </button>
              <button className="btn-ghost py-3 px-6 text-[10px] font-black uppercase tracking-widest border-white/5 text-slate-500">
                 Neural Export
              </button>
           </div>
        </div>
      </motion.div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left: Summary & Radar */}
         <div className="lg:col-span-1 space-y-8">
            <div className="grid grid-cols-2 gap-4">
               {[
                 { icon: LayoutGrid, label: 'Objectives', value: totalActivities, color: 'text-primary-400', bg: 'bg-primary-500/10' },
                 { icon: Coins, label: 'Treasury', value: user.coins, color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
                 { icon: BookOpen, label: 'Reading', value: stats.readingCompleted || 0, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
                 { icon: MessageSquare, label: 'Conversations', value: stats.conversationsCompleted || 0, color: 'text-accent-indigo', bg: 'bg-accent-indigo/10' },
               ].map((s, i) => (
                 <div key={i} className="glass-card p-6 border-white/5 bg-dark-900/40 text-center space-y-2">
                    <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                       <s.icon size={18} className={s.color} />
                    </div>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                 </div>
               ))}
            </div>

            <div className="glass-card p-8 border-white/5 bg-dark-900/40">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Activity size={14} className="text-primary-400" /> Capability Scan
               </h3>
               <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                      <Radar name="Skills" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Right: Growth Chart */}
         <div className="lg:col-span-2 glass-card p-10 border-white/5 bg-dark-900/40 flex flex-col">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                  <TrendingUp className="text-accent-emerald" size={20}/> Growth Trajectory
               </h3>
               <div className="flex items-center gap-2 bg-dark-950 px-4 py-2 rounded-full border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-glow" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target: {user.weeklyGoal || 500} XP / WEEK</span>
               </div>
            </div>
            <div className="flex-1 min-h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                   <XAxis dataKey="name" stroke="#475569" fontSize={10} tickMargin={15} axisLine={false} tickLine={false} />
                   <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => v > 0 ? v : ''} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                     itemStyle={{ color: '#8b5cf6', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}
                   />
                   <Line 
                     type="monotone" 
                     dataKey="xp" 
                     name="XP Earned" 
                     stroke="#8b5cf6" 
                     strokeWidth={4} 
                     dot={false} 
                     activeDot={{ r: 6, fill: '#8b5cf6', strokeWidth: 0, shadowBlur: 10, shadowColor: '#8b5cf6' }} 
                   />
                 </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Credentials Area */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-1">
           <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
              <Award size={24} className="text-accent-amber" /> Neural Credentials
           </h2>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{unlockedAchievements.length} Unlocked</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {ACHIEVEMENTS.map(a => {
             const unlocked = unlockedAchievements.some(u => u.id === a.id);
             return (
               <motion.div 
                 key={a.id}
                 whileHover={unlocked ? { y: -5 } : {}}
                 className="relative group"
               >
                  <div 
                    ref={el => achievementRefs.current[a.id] = el}
                    className={`glass-card p-8 border-white/5 text-center flex flex-col items-center h-full transition-all duration-500 ${unlocked ? 'bg-dark-900/40 hover:bg-white/5 border-accent-amber/20' : 'opacity-30 grayscale blur-[1px]'}`}
                  >
                     <div className={`w-16 h-16 bg-dark-950 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-white/5 shadow-inner transition-transform duration-500 ${unlocked ? 'group-hover:rotate-6 group-hover:scale-110' : ''}`}>
                        {a.icon}
                     </div>
                     <p className={`font-bold tracking-tight mb-1 ${unlocked ? 'text-white' : 'text-slate-500'}`}>{a.name}</p>
                     <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{a.desc}</p>
                     
                     {unlocked && (
                        <div className="mt-6 pt-4 border-t border-white/5 w-full flex justify-center">
                           <div className="flex items-center gap-1.5 bg-accent-amber/10 px-3 py-1 rounded-full border border-accent-amber/20">
                              <Shield size={10} className="text-accent-amber" />
                              <span className="text-[8px] font-black text-accent-amber uppercase tracking-widest">Authenticated</span>
                           </div>
                        </div>
                     )}
                  </div>
                  {unlocked && (
                     <button 
                       onClick={() => shareAchievement(a.id, a.name)}
                       className="absolute top-4 right-4 p-2 bg-dark-900 border border-white/10 rounded-xl text-slate-500 hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                     >
                       <Share2 size={16} />
                     </button>
                  )}
               </motion.div>
             );
           })}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="glass-card p-1 max-w-md w-full relative overflow-hidden"
            >
               <div className="p-10 bg-dark-900">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-2xl font-display font-bold text-white tracking-tight">Recalibrate Identity</h3>
                     <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                        <X size={20}/>
                     </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity Tag</label>
                       <input type="text" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="input-field" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Status Message</label>
                       <input type="text" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="input-field" placeholder="Targeting C2 Mastery..." maxLength={60} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Avatar Hex</label>
                        <input type="text" value={editForm.avatarEmoji} onChange={e => setEditForm({...editForm, avatarEmoji: e.target.value})} className="input-field text-center text-xl" maxLength={2} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">XP Protocol</label>
                        <input type="number" value={editForm.weeklyGoal} onChange={e => setEditForm({...editForm, weeklyGoal: parseInt(e.target.value) || 0})} className="input-field" step="100" min="100" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Spectral Theme</label>
                      <div className="flex gap-3">
                        {COLORS.map(c => (
                          <button 
                            key={c} 
                            onClick={() => setEditForm({...editForm, avatarColor: c})} 
                            className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${c} ${editForm.avatarColor === c ? 'ring-2 ring-primary-500 ring-offset-4 ring-offset-dark-900 scale-110 shadow-glow' : 'opacity-40 hover:opacity-100'} transition-all`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-12">
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">Abort</button>
                    <button onClick={handleSaveProfile} className="flex-1 btn-primary py-4 text-[10px] font-black uppercase tracking-widest shadow-glow">Commit Changes</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
