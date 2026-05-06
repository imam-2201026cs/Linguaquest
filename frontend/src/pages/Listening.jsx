import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, CheckCircle, Lock, ArrowLeft, Headphones, 
  Youtube, Music, Activity, Target, Shield, Clock, 
  Search, Volume2, Languages, Sparkles, Trophy, ChevronRight,
  RefreshCw, X, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import XPReward from '../components/XPReward';
import { useNavigate } from 'react-router-dom';

const TIER_ICONS = { 
  beginner: '🌱', elementary: '🏰', intermediate: '🔍', 
  upper_intermediate: '🌍', advanced: '🎩', expert: '💎' 
};

export default function Listening() {
  const { user, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("videos");
  const [videoLibrary, setVideoLibrary] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);

  // Passage mode state
  const [topic, setTopic] = useState("");
  const [passageLoading, setPassageLoading] = useState(false);
  const [passage, setPassage] = useState("");
  const [passageQuestions, setPassageQuestions] = useState([]);
  const [passageAnswers, setPassageAnswers] = useState({});
  const [passageResult, setPassageResult] = useState(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const res = await axios.get("/api/listening/library");
      setVideoLibrary(res.data.library);
      setCompletedCount(res.data.completedCount);
    } catch (err) {
      toast.error("Failed to sync auditory library.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleCompleteVideo = async (xp) => {
    try {
      await axios.post("/api/listening/complete", { videoId: selectedVideo.id, xpEarned: xp });
      toast.success("Mission success! XP synchronized.");
      fetchLibrary();
      fetchProfile();
      setSelectedVideo(null);
    } catch (err) {
      toast.error("Telemetry report failed.");
    }
  };

  const generatePassage = async () => {
    if (!topic.trim()) return;
    setPassageLoading(true);
    setPassage(""); setPassageQuestions([]); setPassageAnswers({}); setPassageResult(null);
    try {
      const res = await axios.post("/api/listening/generate-passage", { topic, level: user?.level || 1 });
      setPassage(res.data.passage || "");
      setPassageQuestions(res.data.questions || []);
    } catch (err) { 
      toast.error("Neural passage generation failed.");
    }
    setPassageLoading(false);
  };

  const handleSubmitPassageAnswers = async () => {
    setPassageLoading(true);
    try {
      const res = await axios.post("/api/listening/submit", { 
        questions: passageQuestions,
        answers: Object.keys(passageAnswers).map(i => ["A","B","C","D"].indexOf(passageAnswers[i])),
        topic: topic,
        mode: "passage"
      });
      setPassageResult({ ...res.data, feedback: res.data.score >= 70 ? "Comprehension verified." : "Signal noise detected. Re-analyze." });
      fetchProfile();
    } catch (err) { 
      toast.error("Analysis failed.");
    }
    setPassageLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Decrypting Audio Streams</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-10 pb-20 px-4 md:px-0">
      <style>{`
        .level-label-fix::before { display: none !important; }
        .level-label-fix::after { display: none !important; }
        .hide-redundant { display: none !important; visibility: hidden !important; }
      `}</style>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 animate-slide-up">
        <div className="text-center md:text-left">
           <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">Auditory Intelligence</span>
              <div className="h-px w-8 bg-primary-500/30" />
           </div>
           <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">Listening <span className="shimmer-text">Nexus</span></h1>
           <p className="text-slate-400 text-sm md:text-lg mt-2 font-medium">Immersive audio analysis with real-time comprehension mapping.</p>
        </div>

        <div className="flex p-1 bg-dark-900/50 rounded-xl md:rounded-2xl border border-white/5 gap-1 md:gap-1.5 backdrop-blur-xl mx-auto md:mx-0">
           {[["videos", Youtube, "Videos"], ["passages", Music, "AI Passages"]].map(([key, Icon, label]) => (
             <button 
               key={key} 
               onClick={() => setActiveTab(key)}
               className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === key ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200'}`}
             >
               <Icon size={14}/> {label}
             </button>
           ))}
        </div>
      </div>

      {/* VIDEO LIBRARY ROADMAP */}
      {activeTab === "videos" && !selectedVideo && (
        <div className="space-y-10 md:space-y-12 animate-slide-up">
          <div className="glass-card p-6 md:p-10 border-white/10 bg-dark-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
               <div className="space-y-3 md:space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-primary-500/10 px-3 md:px-4 py-1 rounded-full text-[10px] font-black text-primary-400 uppercase tracking-widest border border-primary-500/20">
                     <Activity size={12} className="animate-pulse" /> Trajectory Active
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">{completedCount} Missions Deciphered</h2>
                  <p className="text-slate-400 text-sm md:text-lg font-medium max-w-xl">Progressing through curated authentic audio missions from A1 to C2 Mastery.</p>
               </div>
               <div className="text-center md:text-right">
                  <p className="text-4xl md:text-5xl font-display font-black text-white">{Math.min(100, Math.round((completedCount/90)*100))}%</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Overall Proficiency</p>
               </div>
            </div>
          </div>

          <div className="space-y-12 md:space-y-16">
            {Object.entries(videoLibrary).map(([levelKey, levelData]) => (
              <div key={levelKey} className="relative level-row-v4">
                <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-8 sticky top-0 z-20 py-3 md:py-4 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 px-2">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-primary-500/10 border border-primary-500/20 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-glow shrink-0">
                     {TIER_ICONS[levelKey.toLowerCase()] || '🎧'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-2xl font-display font-bold text-white tracking-tight truncate">{levelData.label}</h2>
                    <div className="flex items-center gap-3 mt-1 md:mt-2">
                      <div className="flex-1 h-1 bg-dark-950 rounded-full overflow-hidden max-w-[180px] md:max-w-[240px] border border-white/5">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${levelData.progress}%` }}
                           className={`h-full ${levelData.progress === 100 ? 'bg-accent-emerald' : 'bg-primary-500'} rounded-full shadow-glow`} 
                        />
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">{levelData.progress}% Mapped</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {levelData.videos.map((video, idx) => (
                    <motion.button
                      key={video.id}
                      whileHover={video.unlocked ? { y: -5 } : {}}
                      onClick={() => video.unlocked && handleSelectVideo(video)}
                      disabled={!video.unlocked}
                      className={`relative group rounded-[24px] md:rounded-[32px] overflow-hidden border transition-all duration-500 flex flex-col text-left ${
                        video.completed 
                        ? 'bg-accent-emerald/5 border-accent-emerald/20' 
                        : video.unlocked 
                        ? 'bg-dark-900/40 border-white/5 hover:border-primary-500/50 hover:bg-white/5 shadow-2xl'
                        : 'bg-dark-950 border-white/5 opacity-40 grayscale cursor-not-allowed'
                      }`}
                    >
                      <div className="relative aspect-video bg-black overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                          alt={video.title}
                          className={`w-full h-full object-cover transition-transform duration-700 ${video.unlocked ? 'group-hover:scale-110' : 'opacity-20'}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-60" />
                        
                        {video.completed ? (
                          <div className="absolute top-3 right-3 w-7 h-7 bg-accent-emerald rounded-lg flex items-center justify-center shadow-glow z-10">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                        ) : !video.unlocked ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <Lock size={24} className="text-slate-600" />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Awaiting Decryption</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-glow">
                                <Play size={20} className="text-white ml-1" />
                             </div>
                          </div>
                        )}
                        
                        {video.unlocked && (
                           <div className="absolute bottom-3 left-3 flex gap-2">
                              <span className="bg-dark-950/80 backdrop-blur-md px-1.5 py-0.5 rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                                {video.duration}
                              </span>
                           </div>
                        )}
                      </div>

                      <div className="p-6 md:p-8 space-y-3 md:space-y-4">
                        <h4 className="text-base md:text-lg font-bold text-white tracking-tight group-hover:text-primary-400 transition-colors line-clamp-2 min-h-[48px]">
                          {video.title}
                        </h4>
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mission {idx + 1}</span>
                           <span className={`text-[9px] font-black uppercase tracking-widest ${video.completed ? 'text-accent-emerald' : 'text-primary-400'}`}>
                             {video.completed ? 'Synchronized' : 'Ready'}
                           </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI PASSAGES TAB */}
      {activeTab === "passages" && (
        <div className="max-w-4xl mx-auto space-y-10 animate-slide-up">
           {!passage ? (
             <div className="glass-card p-8 md:p-12 border-white/10 bg-dark-900/40 text-center space-y-8">
                <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto border border-primary-500/20 shadow-glow">
                   <Sparkles size={40} className="text-primary-400" />
                </div>
                <div className="max-w-md mx-auto space-y-4">
                   <h2 className="text-3xl font-display font-bold text-white tracking-tight">Neural Passage Generator</h2>
                   <p className="text-slate-400 font-medium">Input a scenario or topic to synthesize a custom auditory training mission.</p>
                </div>
                
                <div className="relative group max-w-lg mx-auto">
                   <input 
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. A job interview at a tech company..."
                      className="w-full bg-dark-950 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50 transition-all text-lg shadow-2xl"
                   />
                   <button 
                      onClick={generatePassage}
                      disabled={passageLoading || !topic.trim()}
                      className="absolute right-3 top-3 bottom-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:grayscale transition-all px-8 rounded-xl text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-glow"
                   >
                      {passageLoading ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                      {passageLoading ? 'Synthesizing...' : 'Initialize'}
                   </button>
                </div>
             </div>
           ) : (
             <div className="space-y-10 pb-20">
                <div className="glass-card p-10 border-white/10 bg-dark-900/40 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center border border-primary-500/20">
                            <Volume2 size={24} className="text-primary-400" />
                         </div>
                         <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Auditory Stream</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Topic: {topic}</p>
                         </div>
                      </div>
                      <button onClick={() => setPassage("")} className="text-slate-500 hover:text-white transition-colors">
                         <RefreshCw size={20} />
                      </button>
                   </div>

                   <div className="bg-dark-950/80 p-8 rounded-3xl border border-white/5 relative group">
                      <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed italic">
                         "{passage}"
                      </p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-3 px-4">
                      <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow" />
                      <h3 className="text-lg font-bold text-white tracking-tight uppercase tracking-widest">Comprehension Check</h3>
                   </div>
                   
                   <div className="grid gap-4">
                      {passageQuestions.map((q, qIdx) => (
                         <div key={qIdx} className="glass-card p-8 border-white/5 bg-dark-900/40 space-y-6">
                            <p className="text-lg font-bold text-white leading-tight">
                               <span className="text-primary-500 mr-3">0{qIdx + 1}.</span> {q.question}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {q.options.map((opt, oIdx) => (
                                  <button
                                     key={oIdx}
                                     onClick={() => setPassageAnswers(prev => ({ ...prev, [qIdx]: opt }))}
                                     className={`p-5 rounded-2xl border text-left transition-all duration-300 font-medium ${
                                        passageAnswers[qIdx] === opt 
                                        ? 'bg-primary-500 border-primary-500 text-white shadow-glow' 
                                        : 'bg-dark-950 border-white/5 text-slate-400 hover:border-primary-500/30'
                                     }`}
                                  >
                                     <span className="mr-3 opacity-50">{["A","B","C","D"][oIdx]}.</span> {opt}
                                  </button>
                               ))}
                            </div>
                         </div>
                      ))}
                   </div>
                   
                   <div className="flex justify-center pt-8">
                      <button 
                         onClick={handleSubmitPassageAnswers}
                         disabled={Object.keys(passageAnswers).length < passageQuestions.length || passageLoading}
                         className="btn-primary py-5 px-16 text-xs font-black uppercase tracking-widest shadow-glow flex items-center gap-4"
                      >
                         {passageLoading ? <RefreshCw size={18} className="animate-spin" /> : <Shield size={18} />}
                         Verify Comprehension
                      </button>
                   </div>
                </div>
             </div>
           )}

           {passageResult && (
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-950/90 backdrop-blur-xl"
             >
                <div className="glass-card max-w-lg w-full p-10 border-white/10 bg-dark-900 shadow-3xl text-center space-y-8">
                   <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4 ${passageResult.score >= 70 ? 'border-accent-emerald text-accent-emerald bg-accent-emerald/10' : 'border-accent-rose text-accent-rose bg-accent-rose/10'}`}>
                      {passageResult.score >= 70 ? <Trophy size={48} /> : <X size={48} />}
                   </div>
                   <div className="space-y-2">
                      <h2 className="text-4xl font-display font-black text-white">{passageResult.score}%</h2>
                      <p className="text-slate-400 font-medium">{passageResult.feedback}</p>
                   </div>
                   <button 
                      onClick={() => { setPassageResult(null); setPassage(""); }}
                      className="btn-primary w-full py-5 text-xs font-black uppercase tracking-widest"
                   >
                      Acknowledge
                   </button>
                </div>
             </motion.div>
           )}
        </div>
      )}
    </div>
  );
}
