// Premium Listening Nexus Overhaul - Auditory Intelligence Edition
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, CheckCircle, Lock, ArrowLeft, Headphones, 
  Youtube, Music, Activity, Target, Shield, Clock, 
  Search, Volume2, Languages, Sparkles, Trophy, ChevronRight,
  RefreshCw, X, Zap, Cpu, Terminal, BarChart2, ShieldCheck, ZapOff
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
      toast.error("Lexical uplink failed.");
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
    <div className="flex flex-col items-center justify-center h-[75vh] gap-12">
      <div className="relative">
        <div className="w-32 h-32 border-[8px] border-white/5 rounded-full" />
        <div className="w-32 h-32 border-[8px] border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        <Headphones size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-500 animate-pulse" />
      </div>
      <div className="text-center space-y-4">
         <p className="text-3xl font-display font-black text-white tracking-tighter uppercase">Decrypting Audio Streams</p>
         <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">Neural engine mapping auditory frequencies...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-slide-up pb-32 px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        <div className="max-w-2xl">
           <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Auditory Intelligence Matrix</span>
              <div className="h-px w-12 bg-primary-500/30" />
           </div>
           <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none mb-4">
             Listening <span className="shimmer-text">Nexus</span>
           </h1>
           <p className="text-slate-400 text-lg font-medium leading-relaxed">
             High-fidelity audio analysis with real-time neural comprehension mapping.
           </p>
        </div>

        <div className="flex p-2 bg-dark-950/60 rounded-[2.5rem] border border-white/5 gap-2 backdrop-blur-3xl shadow-premium">
           {[["videos", Youtube, "Videos"], ["passages", Music, "AI Passages"]].map(([key, Icon, label]) => (
             <button 
               key={key} 
               onClick={() => setActiveTab(key)}
               className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${activeTab === key ? 'bg-primary-500 text-white shadow-glow scale-105' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
             >
               <Icon size={18}/> {label}
             </button>
           ))}
        </div>
      </div>

      {/* VIDEO LIBRARY ROADMAP */}
      {activeTab === "videos" && !selectedVideo && (
        <div className="space-y-16 animate-slide-up">
          <div className="glass-card p-12 border-white/5 bg-dark-900/40 relative overflow-hidden group shadow-premium">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000 blur-3xl" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
               <div className="space-y-6 text-center lg:text-left max-w-2xl">
                  <div className="inline-flex items-center gap-3 bg-primary-500/10 px-6 py-2 rounded-full text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] border border-primary-500/20 shadow-glow-sm">
                     <Activity size={16} className="animate-pulse" /> Decryption Active
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter uppercase">{completedCount} Missions Deciphered</h2>
                  <p className="text-slate-400 text-xl font-medium leading-relaxed">Progressing through curated authentic audio missions from A1 to C2 Mastery.</p>
               </div>
               <div className="text-center lg:text-right bg-dark-950/60 p-10 rounded-[3rem] border border-white/5 shadow-inner min-w-[240px]">
                  <p className="text-6xl md:text-7xl font-display font-black text-white tracking-tighter">{Math.min(100, Math.round((completedCount/90)*100))}%</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4">Sync Proficiency</p>
               </div>
            </div>
          </div>

          <div className="space-y-24">
            {Object.entries(videoLibrary).map(([levelKey, levelData]) => (
              <div key={levelKey} className="relative">
                <div className="flex items-center gap-6 mb-12 sticky top-0 z-20 py-6 bg-dark-950/60 backdrop-blur-2xl border-b border-white/5">
                  <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/20 rounded-[2rem] flex items-center justify-center text-3xl shadow-glow-sm shrink-0 group">
                     <span className="group-hover:scale-125 transition-transform duration-500">{TIER_ICONS[levelKey.toLowerCase()] || '🎧'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase tracking-[0.1em] truncate">{levelData.label}</h2>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex-1 h-2 bg-dark-950 rounded-full overflow-hidden max-w-[300px] p-0.5 border border-white/5">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${levelData.progress}%` }}
                           className={`h-full ${levelData.progress === 100 ? 'bg-accent-emerald shadow-glow-emerald' : 'bg-primary-500 shadow-glow'} rounded-full`} 
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] shrink-0">{levelData.progress}% MAPPED</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {levelData.videos.map((video, idx) => (
                    <motion.button
                      key={video.id}
                      whileHover={video.unlocked ? { y: -10, scale: 1.02 } : {}}
                      onClick={() => video.unlocked && handleSelectVideo(video)}
                      disabled={!video.unlocked}
                      className={`relative group rounded-[3rem] overflow-hidden border transition-all duration-700 flex flex-col text-left shadow-premium ${
                        video.completed 
                        ? 'bg-accent-emerald/5 border-accent-emerald/20' 
                        : video.unlocked 
                        ? 'bg-dark-900/40 border-white/5 hover:border-primary-500/50 hover:bg-white/5'
                        : 'bg-dark-950/40 border-white/5 opacity-40 grayscale cursor-not-allowed'
                      }`}
                    >
                      <div className="relative aspect-video bg-black overflow-hidden group">
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                          alt={video.title}
                          className={`w-full h-full object-cover transition-transform duration-1000 ${video.unlocked ? 'group-hover:scale-110 group-hover:rotate-1' : 'opacity-20'}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent opacity-80" />
                        
                        {video.completed ? (
                          <div className="absolute top-4 right-4 w-10 h-10 bg-accent-emerald rounded-2xl flex items-center justify-center shadow-glow z-10 border border-white/10">
                            <CheckCircle size={20} className="text-white" />
                          </div>
                        ) : !video.unlocked ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-dark-950/60 backdrop-blur-sm">
                            <Lock size={32} className="text-slate-600" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Encrypted</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                             <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-glow border-4 border-white/20">
                                <Play size={28} className="text-white ml-1.5" />
                             </div>
                          </div>
                        )}
                        
                        {video.unlocked && (
                           <div className="absolute bottom-4 left-4 flex gap-3">
                              <span className="bg-dark-950/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/10 shadow-inner">
                                {video.duration}
                              </span>
                           </div>
                        )}
                      </div>

                      <div className="p-8 md:p-10 space-y-6">
                        <h4 className="text-xl md:text-2xl font-display font-black text-white tracking-tighter group-hover:text-primary-400 transition-colors line-clamp-2 min-h-[64px] uppercase">
                          {video.title}
                        </h4>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Sequence 0{idx + 1}</span>
                           <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${video.completed ? 'text-accent-emerald' : 'text-primary-400 animate-pulse'}`}>
                             {video.completed ? 'Synchronized' : 'Analyze Signal'}
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
        <div className="max-w-5xl mx-auto space-y-16 animate-slide-up">
           {!passage ? (
             <div className="glass-card p-16 md:p-24 border-white/5 bg-dark-900/40 text-center space-y-12 shadow-premium relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                <div className="w-24 h-24 bg-primary-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-primary-500/20 shadow-glow relative z-10">
                   <Sparkles size={48} className="text-primary-400 animate-pulse" />
                </div>
                <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                   <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter uppercase">Neural Passage Core</h2>
                   <p className="text-slate-400 text-xl font-medium leading-relaxed">Input a scenario or topic to synthesize a high-fidelity auditory training environment.</p>
                </div>
                
                <div className="relative group max-w-2xl mx-auto z-10">
                   <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-emerald rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                   <input 
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. A corporate strategy briefing in London..."
                      className="relative w-full bg-dark-950 border border-white/10 rounded-[2.2rem] px-10 py-7 text-white placeholder:text-slate-700 focus:outline-none focus:border-primary-500/50 transition-all text-xl shadow-inner font-medium"
                   />
                   <button 
                      onClick={generatePassage}
                      disabled={passageLoading || !topic.trim()}
                      className="absolute right-3 top-3 bottom-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:grayscale transition-all px-12 rounded-[1.8rem] text-white font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-4 shadow-glow hover:scale-[1.02]"
                   >
                      {passageLoading ? <RefreshCw size={20} className="animate-spin" /> : <Zap size={20} />}
                      {passageLoading ? 'Synthesizing...' : 'Execute'}
                   </button>
                </div>
             </div>
           ) : (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 pb-32">
                <div className="glass-card p-12 border-white/5 bg-dark-900/40 space-y-10 shadow-premium relative">
                   <div className="flex items-center justify-between border-b border-white/5 pb-8">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-primary-500/10 rounded-[2rem] flex items-center justify-center border border-primary-500/20 shadow-glow-sm">
                            <Volume2 size={32} className="text-primary-400" />
                         </div>
                         <div>
                            <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase">Auditory Datastream</h3>
                            <div className="flex items-center gap-3 mt-1">
                               <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow animate-pulse" />
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Signal: {topic}</span>
                            </div>
                         </div>
                      </div>
                      <button onClick={() => setPassage("")} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all border border-white/5 hover:bg-white/10">
                         <RefreshCw size={24} />
                      </button>
                   </div>

                   <div className="bg-dark-950/80 p-12 rounded-[3rem] border border-white/5 relative group shadow-inner">
                      <p className="text-2xl md:text-3xl text-slate-300 font-medium leading-[1.8] italic text-center max-w-4xl mx-auto">
                         "{passage}"
                      </p>
                   </div>
                </div>

                <div className="space-y-10">
                   <div className="flex items-center gap-6 px-4">
                      <div className="w-3 h-3 rounded-full bg-primary-500 shadow-glow" />
                      <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase tracking-[0.2em]">Neural Comprehension Scan</h3>
                      <div className="h-px flex-1 bg-white/5" />
                   </div>
                   
                   <div className="grid gap-8">
                      {passageQuestions.map((q, qIdx) => (
                         <motion.div 
                            key={qIdx} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: qIdx * 0.1 }}
                            className="glass-card p-12 border-white/5 bg-dark-900/40 space-y-10 shadow-premium"
                         >
                            <div className="space-y-4">
                               <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">Question Module 0{qIdx + 1}</p>
                               <p className="text-2xl md:text-3xl font-display font-black text-white tracking-tight leading-tight">
                                  {q.question}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {q.options.map((opt, oIdx) => (
                                  <button
                                     key={oIdx}
                                     onClick={() => setPassageAnswers(prev => ({ ...prev, [qIdx]: opt }))}
                                     className={`p-8 rounded-[2.5rem] border text-left transition-all duration-500 font-bold text-lg flex items-center gap-6 group/opt ${
                                        passageAnswers[qIdx] === opt 
                                        ? 'bg-primary-500 border-primary-500 text-white shadow-glow scale-[1.02]' 
                                        : 'bg-dark-950 border-white/5 text-slate-500 hover:border-primary-500/40 hover:bg-white/5'
                                     }`}
                                  >
                                     <div className={`w-12 h-12 rounded-2xl border border-current flex items-center justify-center text-sm font-black shrink-0 transition-all ${passageAnswers[qIdx] === opt ? 'bg-white/10' : 'group-hover/opt:bg-primary-500/10'}`}>
                                        {["A","B","C","D"][oIdx]}
                                     </div>
                                     <span className="flex-1 tracking-tight">{opt}</span>
                                  </button>
                               ))}
                            </div>
                         </motion.div>
                      ))}
                   </div>
                   
                   <div className="flex justify-center pt-12 pb-20">
                      <button 
                         onClick={handleSubmitPassageAnswers}
                         disabled={Object.keys(passageAnswers).length < passageQuestions.length || passageLoading}
                         className="btn-primary py-8 px-24 text-[10px] font-black uppercase tracking-[0.5em] shadow-glow flex items-center gap-6 hover:scale-105 transition-transform"
                      >
                         {passageLoading ? <RefreshCw size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                         Verify Comprehension Rate
                      </button>
                   </div>
                </div>
             </motion.div>
           )}

           <AnimatePresence>
              {passageResult && (
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-dark-950/95 backdrop-blur-3xl"
                >
                   <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="glass-card max-w-xl w-full p-16 border-white/10 bg-dark-900 shadow-3xl text-center space-y-12"
                   >
                      <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto border-4 shadow-glow-sm ${passageResult.score >= 70 ? 'border-accent-emerald text-accent-emerald bg-accent-emerald/10 shadow-accent-emerald/20' : 'border-accent-rose text-accent-rose bg-accent-rose/10 shadow-accent-rose/20'}`}>
                         {passageResult.score >= 70 ? <Trophy size={64} className="animate-bounce-slow" /> : <ZapOff size={64} />}
                      </div>
                      <div className="space-y-4">
                         <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Analysis Completed</div>
                         <h2 className="text-7xl font-display font-black text-white tracking-tighter">{passageResult.score}%</h2>
                         <p className="text-slate-400 text-xl font-medium">{passageResult.feedback}</p>
                      </div>
                      <button 
                         onClick={() => { setPassageResult(null); setPassage(""); }}
                         className="btn-primary w-full py-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-glow"
                      >
                         Acknowledge Mission Report
                      </button>
                   </motion.div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      )}
    </div>
  );
}
