import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Trophy, Star, Zap, Flame, Calendar, Activity as ActivityIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublicProfile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/user/public/${username}`)
      .then(res => setData(res.data))
      .catch(() => toast.error('User not found'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6">
        <Trophy size={64} className="text-slate-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">User Not Found</h1>
        <p className="text-slate-400 mb-6">This profile doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary">Return Home</Link>
      </div>
    );
  }

  const { user, recentActivities } = data;
  const stats = user.stats || {};
  const totalActivities = (stats.writingCompleted || 0) + (stats.listeningCompleted || 0) + (stats.readingCompleted || 0) + (stats.grammarChecked || 0);

  // Radar Chart Data
  const radarData = [
    { subject: 'Writing', A: stats.writingCompleted || 0, fullMark: Math.max(10, stats.writingCompleted || 0) },
    { subject: 'Listening', A: stats.listeningCompleted || 0, fullMark: Math.max(10, stats.listeningCompleted || 0) },
    { subject: 'Reading', A: stats.readingCompleted || 0, fullMark: Math.max(10, stats.readingCompleted || 0) },
    { subject: 'Grammar', A: stats.grammarChecked || 0, fullMark: Math.max(10, stats.grammarChecked || 0) },
  ];

  return (
    <div className="min-h-screen bg-dark-900 pt-10 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="glass-card p-8 bg-gradient-to-br from-primary-500/10 to-accent-purple/10 border-primary-500/20 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
          <div className={`w-32 h-32 bg-gradient-to-br ${user.avatarColor || 'from-primary-500 to-accent-purple'} rounded-3xl flex items-center justify-center text-6xl shadow-2xl shrink-0`}>
            {user.avatarEmoji || user.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-display font-bold text-white mb-2">{user.username}</h1>
            <p className="text-lg text-slate-300 italic mb-4">"{user.bio || 'English learner on LinguaQuest!'}"</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="level-badge text-sm py-1.5 px-3"><Star size={14} />Level {user.level}</span>
              <span className="xp-badge text-sm py-1.5 px-3"><Zap size={14} />{user.xp} XP</span>
              <span className="streak-badge text-sm py-1.5 px-3"><Flame size={14} />{user.streak}d Streak</span>
            </div>
            <p className="text-xs text-slate-500 mt-4 flex items-center justify-center md:justify-start gap-1">
              <Calendar size={12} /> Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skill Radar */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
              <ActivityIcon size={18} className="text-primary-400" /> Skill Breakdown
            </h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Radar name="Modules" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-slate-500 mt-2">Based on {totalActivities} total completed exercises</p>
          </div>

          {/* Achievements Snippet */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-accent-yellow" /> Unlocked Achievements
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {user.achievements?.slice(0, 6).map(a => (
                <div key={a.id} className="bg-dark-700/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <span className="text-2xl">{a.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{a.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{a.description}</p>
                  </div>
                </div>
              ))}
              {(!user.achievements || user.achievements.length === 0) && (
                <p className="text-sm text-slate-500 col-span-2">No achievements unlocked yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
