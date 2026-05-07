import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Zap, Flame, Trophy, Target, PenTool, Headphones, BookOpen, CheckSquare, Star, Coins, TrendingUp, Calendar, Edit2, Share2, Link as LinkIcon, Settings } from 'lucide-react';
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

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="glass-card p-4 flex items-center gap-3">
    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon size={18} className={color} />
    </div>
    <div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

export default function Profile() {
  const { user, fetchProfile } = useAuth();
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', avatarEmoji: '', avatarColor: '', weeklyGoal: 500 });
  
  // Refs for exports
  const achievementRefs = useRef({});

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username,
        bio: user.bio || 'English learner on LinguaQuest!',
        avatarEmoji: user.avatarEmoji || '👤',
        avatarColor: user.avatarColor || 'from-primary-500 to-accent-purple',
        weeklyGoal: user.weeklyGoal || 500
      });
      axios.get('/api/user/history').then(r => {
        setHistory(r.data);
        generateChartData(r.data);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user]);

  const generateChartData = (activities) => {
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return { date: d.toISOString().split('T')[0], xp: 0 };
    });

    activities.forEach(a => {
      const dateStr = new Date(a.completedAt).toISOString().split('T')[0];
      const dayData = last30Days.find(d => d.date === dateStr);
      if (dayData) dayData.xp += a.xpEarned;
    });

    // Format dates for display
    const formatted = last30Days.map(d => ({
      name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      xp: d.xp
    }));
    setChartData(formatted);
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put('/api/user/profile', editForm);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const shareAchievement = (achievementId, name) => {
    const el = achievementRefs.current[achievementId];
    if (!el) return;
    
    html2canvas(el, { backgroundColor: '#1e293b' }).then(canvas => {
      const link = document.createElement('a');
      link.download = `LinguaQuest_${name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Achievement saved as image!');
    });
  };

  const copyPublicLink = () => {
    const url = `${window.location.origin}/user/${user.username}`;
    navigator.clipboard.writeText(url);
    toast.success('Public link copied to clipboard!');
  };

  if (!user) return null;

  const stats = user.stats || {};
  const totalActivities = (stats.writingCompleted || 0) + (stats.listeningCompleted || 0) + (stats.readingCompleted || 0) + (stats.grammarChecked || 0) + (stats.conversationsCompleted || 0);
  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.condition(stats, user));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.condition(stats, user));

  const radarData = [
    { subject: 'Writing', A: stats.writingCompleted || 0, fullMark: Math.max(10, stats.writingCompleted || 0) },
    { subject: 'Listening', A: stats.listeningCompleted || 0, fullMark: Math.max(10, stats.listeningCompleted || 0) },
    { subject: 'Reading', A: stats.readingCompleted || 0, fullMark: Math.max(10, stats.readingCompleted || 0) },
    { subject: 'Grammar', A: stats.grammarChecked || 0, fullMark: Math.max(10, stats.grammarChecked || 0) },
  ];

  const COLORS = ['from-primary-500 to-accent-purple', 'from-blue-500 to-cyan-400', 'from-green-500 to-emerald-400', 'from-yellow-400 to-orange-500', 'from-pink-500 to-rose-400'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up pb-20">

      {/* Profile Header */}
      <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-primary-500/10 to-accent-purple/10 border-primary-500/20 relative overflow-hidden">
        <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-dark-700/50 p-2 rounded-lg transition-colors border border-white/5">
          <Settings size={18} />
        </button>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
          <div className={`w-28 h-28 bg-gradient-to-br ${user.avatarColor || 'from-primary-500 to-accent-purple'} rounded-3xl flex items-center justify-center text-5xl font-bold shadow-xl shrink-0`}>
            {user.avatarEmoji || user.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-white mb-1">{user.username}</h1>
            <p className="text-slate-300 italic mb-4">"{user.bio || 'English learner on LinguaQuest!'}"</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              <span className="level-badge text-sm py-1.5 px-3"><Star size={14} />Level {user.level}</span>
              <span className="xp-badge text-sm py-1.5 px-3"><Zap size={14} />{user.xp} XP</span>
              <span className="streak-badge text-sm py-1.5 px-3"><Flame size={14} />{user.streak}d Streak</span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <button onClick={copyPublicLink} className="text-xs bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                <LinkIcon size={14} /> Copy Public Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Stats & Radar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Target} label="Total Activities" value={totalActivities} color="text-primary-400" bg="bg-primary-500/10" />
            <StatCard icon={Zap} label="Total XP" value={user.xp} color="text-accent-yellow" bg="bg-accent-yellow/10" />
            <StatCard icon={BookOpen} label="Reading" value={stats.readingCompleted || 0} color="text-green-400" bg="bg-green-500/10" />
            <StatCard icon={PenTool} label="Writing" value={stats.writingCompleted || 0} color="text-blue-400" bg="bg-blue-500/10" />
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Skill Radar</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Modules" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Progress Chart */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><TrendingUp className="text-green-400" size={20}/> 30-Day XP Growth</h3>
            <div className="text-xs bg-dark-700 border border-white/5 px-3 py-1 rounded-full text-slate-400">
              Goal: <span className="text-white font-bold">{user.weeklyGoal || 500} XP / week</span>
            </div>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickMargin={10} minTickGap={20} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => val > 0 ? val : ''} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="xp" name="XP Earned" stroke="#818cf8" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-accent-yellow" /> Achievements
        </h2>

        {unlockedAchievements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {unlockedAchievements.map(a => (
              <div key={a.id} className="relative group">
                {/* Ref container for html2canvas to capture just the card without the share button */}
                <div ref={el => achievementRefs.current[a.id] = el} className="glass-card p-4 border-accent-yellow/20 bg-accent-yellow/5 flex flex-col items-center text-center h-full">
                  <span className="text-4xl mb-3">{a.icon}</span>
                  <p className="font-bold text-white mb-1">{a.name}</p>
                  <p className="text-xs text-slate-400">{a.desc}</p>
                </div>
                {/* Share Button Overlay */}
                <button 
                  onClick={() => shareAchievement(a.id, a.name)}
                  className="absolute top-2 right-2 p-2 bg-dark-800/80 hover:bg-primary-500 text-slate-300 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                  title="Save as Image"
                >
                  <Share2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {lockedAchievements.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Locked ({lockedAchievements.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {lockedAchievements.map(a => (
                <div key={a.id} className="glass-card p-3 opacity-40 flex flex-col items-center text-center">
                  <span className="text-2xl grayscale mb-2">{a.icon}</span>
                  <p className="font-semibold text-slate-400 text-xs">{a.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-4">Edit Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Username</label>
                <input type="text" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Bio</label>
                <input type="text" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="input-field" placeholder="Tell us about your goals..." maxLength={60} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Avatar Emoji</label>
                  <input type="text" value={editForm.avatarEmoji} onChange={e => setEditForm({...editForm, avatarEmoji: e.target.value})} className="input-field text-center text-xl" maxLength={2} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Weekly XP Goal</label>
                  <input type="number" value={editForm.weeklyGoal} onChange={e => setEditForm({...editForm, weeklyGoal: parseInt(e.target.value) || 0})} className="input-field" step="100" min="100" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Avatar Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setEditForm({...editForm, avatarColor: c})} className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} ${editForm.avatarColor === c ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'} transition-all`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSaveProfile} className="flex-1 btn-primary py-2">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
