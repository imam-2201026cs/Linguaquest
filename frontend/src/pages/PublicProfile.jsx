import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Star, Zap, Flame, Calendar, Activity as ActivityIcon, 
  ArrowLeft, Globe, Shield, Target, Award, Sparkles, Map, Info,
  Search, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublicProfile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/user/public/${username}`)
      .then(res => setData(res.data))
      .catch(() => toast.error('Neural profile not found.'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-[6px] border-white/5 rounded-full" />
          <div className="w-24 h-24 border-[6px] border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          <Search size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-500 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
           <p className="text-2xl font-display font-bold text-white tracking-tight">Syncing Neural Identity</p>
           <p className="text-slate-500 font-medium">Retrieving global performance indices...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-slide-up">
        <div className="w-24 h-24 bg-dark-900 rounded-[32px] flex items-center justify-center border border-white/5 shadow-inner">
           <Search size={48} className="text-slate-700" />
        </div>
        <div className="space-y-3">
           <h1 className="text-4xl font-display font-bold text-white tracking-tight">Identity Terminated</h1>
           <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto">This neural profile doesn't exist in the current sector or has been decommissioned.</p>
        </div>
        <Link to="/" className="btn-primary py-4 px-10 text-[10px] font-black uppercase tracking-widest shadow-glow">Return to Dashboard</Link>
      </div>
    );
  }

  const { user, recentActivities } = data;
  const stats = user.stats || {};
  const totalActivities = (stats.writingCompleted || 0) + (stats.listeningCompleted || 0) + (stats.readingCompleted || 0) + (stats.grammarChecked || 0);

  const radarData = [
    { subject: 'Writing', A: stats.writingCompleted || 0, fullMark: Math.max(10, stats.writingCompleted || 0) },
    { subject: 'Listening', A: stats.listeningCompleted || 0, fullMark: Math.max(10, stats.listeningCompleted || 0) },
    { subject: 'Reading', A: stats.readingCompleted || 0, fullMark: Math.max(10, stats.readingCompleted || 0) },
    { subject: 'Grammar', A: stats.grammarChecked || 0, fullMark: Math.max(10, stats.grammarChecked || 0) },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-10 pb-20 px-4 md:px-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <div className="flex items-center justify-between">
           <Link to="/" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors border border-white/5">
              <ArrowLeft size={20} />
           </Link>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Public Neural Record</span>
           </div>
        </div>

        {/* Neural Identity Header */}
        <div className="glass-card p-12 bg-gradient-to-br from-primary-500/10 to-transparent border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="relative group">
                 <div className="absolute -inset-4 bg-primary-500/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 <div className={`w-40 h-40 bg-gradient-to-br ${user.avatarColor || 'from-primary-500 to-accent-purple'} rounded-[40px] flex items-center justify-center text-7xl shadow-2xl relative z-10 border-4 border-white/10`}>
                    {user.avatarEmoji || user.username[0].toUpperCase()}
                 </div>
                 <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-dark-900 rounded-2xl border-2 border-primary-500 flex items-center justify-center shadow-glow z-20">
                    <Zap size={20} className="text-primary-400" />
                 </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-6">
                 <div>
                    <h1 className="text-5xl font-display font-bold text-white tracking-tight mb-2">{user.username}</h1>
                    <p className="text-xl text-slate-400 italic font-medium leading-relaxed">"{user.bio || 'Architecting a superior linguistic framework.'}"</p>
                 </div>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="bg-dark-950 border border-white/5 px-6 py-2.5 rounded-2xl flex items-center gap-3">
                       <Star size={16} className="text-accent-amber shadow-glow" />
                       <span className="text-sm font-black text-white uppercase tracking-widest">LVL {user.level}</span>
                    </div>
                    <div className="bg-dark-950 border border-white/5 px-6 py-2.5 rounded-2xl flex items-center gap-3">
                       <Zap size={16} className="text-primary-400 shadow-glow" />
                       <span className="text-sm font-black text-white uppercase tracking-widest">{user.xp} XP</span>
                    </div>
                    <div className="bg-dark-950 border border-white/5 px-6 py-2.5 rounded-2xl flex items-center gap-3">
                       <Flame size={16} className="text-accent-rose shadow-glow" />
                       <span className="text-sm font-black text-white uppercase tracking-widest">{user.streak}D CYCLE</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                    <div className="flex items-center gap-2">
                       <Calendar size={14} className="text-slate-600" />
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Globe size={14} className="text-slate-600" />
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{user.country || 'Global Sector'}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Skill Radar */}
          <div className="glass-card p-10 border-white/5 bg-dark-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <ActivityIcon size={80} />
            </div>
            <h2 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <ActivityIcon size={16} /> Neural Skill Matrix
            </h2>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} />
                  <Radar 
                    name="Skills" 
                    dataKey="A" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.2} 
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Aggregate Operations</p>
               <p className="text-xl font-black text-white">{totalActivities}</p>
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-card p-10 border-white/5 bg-dark-900/40">
            <h2 className="text-[10px] font-black text-accent-amber uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Trophy size={16} /> Authenticated Credentials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.achievements?.slice(0, 8).map((a, idx) => (
                <motion.div 
                   key={a.id} 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="bg-dark-950 p-4 rounded-2xl border border-white/5 flex items-center gap-4 group hover:border-accent-amber/30 transition-all"
                >
                  <div className="w-10 h-10 bg-dark-900 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
                    {a.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{a.name}</p>
                    <p className="text-[9px] text-slate-500 truncate font-bold uppercase tracking-widest">Protocol Verified</p>
                  </div>
                </motion.div>
              ))}
              {(!user.achievements || user.achievements.length === 0) && (
                <div className="col-span-2 py-10 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                   <Shield size={40} className="text-slate-700" />
                   <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No Credentials Deciphered</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Strategic Call to Action */}
        <div className="glass-card p-10 border-white/5 bg-dark-900/40 text-center space-y-6">
           <h3 className="text-2xl font-display font-bold text-white tracking-tight">Challenge this Neural Identity?</h3>
           <p className="text-slate-500 font-medium max-w-lg mx-auto">Initiate a high-fidelity linguistic sprint to compare your auditory and lexical processing speeds.</p>
           <div className="flex gap-4 justify-center">
              <button className="btn-primary py-4 px-12 text-[10px] font-black uppercase tracking-widest shadow-glow flex items-center gap-3">
                 <Swords size={16} /> Initiate Combat
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
