import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Youtube, Music, BookOpen, Clock, Target, 
  ChevronRight, Lock, CheckCircle, Trophy, BarChart2,
  RefreshCw, Sparkles, Activity, Shield, ArrowLeft,
  Search, Zap, Volume2, Globe, Heart, Briefcase, Info, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import XPReward from '../components/XPReward';

export default function Listening() {
  const [activeTab, setActiveTab]           = useState("videos");
  const [selectedVideo, setSelectedVideo]   = useState(null);
  const [questions, setQuestions]           = useState([]);
  const [answers, setAnswers]               = useState({});
  const [result, setResult]                 = useState(null);
  const [loading, setLoading]               = useState(false);
  const [vocabulary, setVocabulary]         = useState([]);
  const [videoLibrary, setVideoLibrary]     = useState({});
  const [completedCount, setCompletedCount] = useState(0);

  // AI Passage mode
  const [topic, setTopic]                         = useState("");
  const [passage, setPassage]                     = useState("");
  const [passageQuestions, setPassageQuestions]   = useState([]);
  const [passageAnswers, setPassageAnswers]       = useState({});
  const [passageResult, setPassageResult]         = useState(null);
  const [passageLoading, setPassageLoading]       = useState(false);

  const { fetchProfile, user } = useAuth();

  const fetchLibrary = async () => {
    try {
      const res = await axios.get("/api/listening/videos");
      setVideoLibrary(res.data.library || {});
      setCompletedCount(res.data.completedCount || 0);
    } catch (err) { 
      toast.error("Could not load video library");
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setVocabulary([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateQuestions = async () => {
    if (!selectedVideo) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/listening/video-questions", {
        title: selectedVideo.title, 
        topic: selectedVideo.topic, 
        videoId: selectedVideo.id,
        description: selectedVideo.topic,
        level: user?.level || 1
      });
      setQuestions(res.data.questions || []);
      setVocabulary(res.data.vocabulary || []);
    } catch (err) { 
      toast.error("Failed to generate questions.");
    }
    setLoading(false);
  };

  const handleSubmitAnswers = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/listening/submit", { 
        questions, 
        answers: Object.keys(answers).map(i => ["A","B","C","D"].indexOf(answers[i])),
        topic: selectedVideo.title,
        videoId: selectedVideo.id,
        mode: "video"
      });
      setResult({ ...res.data, feedback: res.data.score >= 70 ? "Protocol Deciphered! Lesson mastered." : "Analysis incomplete. Re-initiate mission." });
      if (res.data.score >= 70) {
        toast.success("Mission Success!", { icon: "🔥" });
        fetchLibrary(); 
        fetchProfile();
      }
    } catch (err) { 
      toast.error("Submission failed.");
    }
    setLoading(false);
  };

  const handleGeneratePassage = async () => {
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

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-slide-up">
        <div>
           <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">Auditory Intelligence</span>
              <div className="h-px w-8 bg-primary-500/30" />
           </div>
           <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Listening <span className="shimmer-text">Nexus</span></h1>
           <p className="text-slate-400 text-lg mt-2 font-medium">Immersive audio analysis with real-time comprehension mapping.</p>
        </div>

        <div className="flex p-1 bg-dark-900/50 rounded-2xl border border-white/5 gap-1.5 backdrop-blur-xl">
           {[["videos", Youtube, "Video Library"], ["passages", Music, "AI Passages"]].map(([key, Icon, label]) => (
             <button 
               key={key} 
               onClick={() => setActiveTab(key)}
               className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === key ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200'}`}
             >
               <Icon size={14}/> {label}
             </button>
           ))}
        </div>
      </div>

      {/* VIDEO LIBRARY ROADMAP */}
      {activeTab === "videos" && !selectedVideo && (
        <div className="space-y-12 animate-slide-up">
          <div className="glass-card p-10 border-white/10 bg-dark-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-primary-500/10 px-4 py-1.5 rounded-full text-[10px] font-black text-primary-400 uppercase tracking-widest border border-primary-500/20">
                     <Activity size={12} className="animate-pulse" /> Trajectory Active
                  </div>
                  <h2 className="text-3xl font-display font-bold text-white tracking-tight">{completedCount} Missions Deciphered</h2>
                  <p className="text-slate-400 text-lg font-medium max-w-xl">Progressing through curated authentic audio missions from A1 to C2 Mastery.</p>
               </div>
               <div className="text-center md:text-right">
                  <p className="text-5xl font-display font-black text-white">{Math.min(100, Math.round((completedCount/90)*100))}%</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Overall Proficiency</p>
               </div>
            </div>
          </div>

          <div className="space-y-16">
            {Object.entries(videoLibrary).map(([levelKey, levelData]) => (
              <div key={levelKey} className="relative">
                <div className="flex items-center gap-5 mb-8 sticky top-0 z-20 py-4 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
                  <div className="w-14 h-14 bg-dark-950 border border-white/10 rounded-2xl flex items-center justify-center text-xl font-black text-primary-400 shadow-inner">
                     {levelKey.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-display font-bold text-white tracking-tight">{levelData.label}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-1.5 bg-dark-950 rounded-full overflow-hidden max-w-[240px] p-0.5 border border-white/5">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${levelData.progress}%` }}
                           className={`h-full ${levelData.progress === 100 ? 'bg-accent-emerald' : 'bg-primary-500'} rounded-full shadow-glow`} 
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{levelData.progress}% Mapped</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {levelData.videos.map((video, idx) => (
                    <motion.button
                      key={video.id}
                      whileHover={video.unlocked ? { y: -5 } : {}}
                      onClick={() => video.unlocked && handleSelectVideo(video)}
                      disabled={!video.unlocked}
                      className={`relative group rounded-[32px] overflow-hidden border transition-all duration-500 flex flex-col text-left ${
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
                          <div className="absolute top-4 right-4 w-8 h-8 bg-accent-emerald rounded-xl flex items-center justify-center shadow-glow z-10">
                            <CheckCircle size={16} className="text-white" />
                          </div>
                        ) : !video.unlocked ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <Lock size={28} className="text-slate-600" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Awaiting Decryption</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center shadow-glow">
                                <Play size={24} className="text-white ml-1" />
                             </div>
                          </div>
                        )}
                        
                        {video.unlocked && (
                           <div className="absolute bottom-4 left-4 flex gap-2">
                              <span className="bg-dark-950/80 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                                {video.duration}
                              </span>
                              <span className="bg-primary-500/80 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
                                Mission {idx + 1}
                              </span>
                           </div>
                        )}
                      </div>

                      <div className="p-8 space-y-4">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest">{video.topic}</p>
                           <h4 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-primary-400 transition-colors">
                             {video.title}
                           </h4>
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

      {/* VIDEO PLAYER VIEW */}
      {activeTab === "videos" && selectedVideo && (
        <div className="space-y-8 animate-slide-up">
          <div className="flex items-center justify-between">
             <button
               onClick={() => { setSelectedVideo(null); setQuestions([]); setAnswers({}); setResult(null); }}
               className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors border border-white/5"
             >
               <ArrowLeft size={20} />
             </button>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-rose animate-pulse shadow-glow" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Mission Stream</span>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-1 border-white/10 bg-dark-900 shadow-2xl relative overflow-hidden aspect-video">
                   <iframe
                     src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0&autoplay=1`}
                     title={selectedVideo.title}
                     className="w-full h-full"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                   />
                </div>

                <div className="space-y-4">
                   <h2 className="text-3xl font-display font-bold text-white tracking-tight">{selectedVideo.title}</h2>
                   <div className="flex flex-wrap gap-4">
                      <div className="glass-card px-4 py-2 flex items-center gap-2 border-white/5 bg-dark-950/50">
                         <Globe size={14} className="text-primary-400" />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedVideo.topic}</span>
                      </div>
                      <div className="glass-card px-4 py-2 flex items-center gap-2 border-white/5 bg-dark-950/50">
                         <Clock size={14} className="text-slate-500" />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedVideo.duration} Mission</span>
                      </div>
                   </div>
                </div>

                {questions.length === 0 ? (
                  <button 
                    onClick={handleGenerateQuestions} 
                    disabled={loading}
                    className="btn-primary w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-glow flex items-center justify-center gap-3"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Activity size={18}/> Initiate Comprehension Mapping</>}
                  </button>
                ) : (
                  <div className="space-y-6">
                     <div className="flex items-center gap-3 px-1">
                        <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow" />
                        <h3 className="text-xl font-display font-bold text-white tracking-tight">Active Assessment</h3>
                     </div>
                     <div className="grid grid-cols-1 gap-6">
                        {questions.map((q, i) => (
                           <div key={i} className="glass-card p-8 border-white/5 bg-dark-900/40 space-y-6">
                              <h4 className="text-lg font-bold text-white leading-relaxed tracking-tight">{i + 1}. {q.question}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {q.options.map((opt, j) => {
                                    const letter = ["A","B","C","D"][j];
                                    const isSelected = answers[i] === letter;
                                    const isCorrect  = result && j === q.correct;
                                    const isWrong    = result && isSelected && j !== q.correct;
                                    
                                    return (
                                       <button 
                                          key={j}
                                          onClick={() => !result && setAnswers(p => ({ ...p, [i]: letter }))}
                                          className={`text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                                             isCorrect ? 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald shadow-glow' :
                                             isWrong ? 'border-accent-rose bg-accent-rose/10 text-accent-rose shadow-glow' :
                                             isSelected ? 'border-primary-500 bg-primary-500/10 text-primary-400 shadow-glow' :
                                             'border-white/5 bg-dark-950 text-slate-500 hover:border-white/10 hover:bg-white/5'
                                          }`}
                                       >
                                          <div className={`w-8 h-8 rounded-xl border border-current flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? 'bg-white/10' : ''}`}>
                                             {letter}
                                          </div>
                                          <span className="flex-1 font-bold tracking-tight text-sm">{opt}</span>
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>
                        ))}
                     </div>
                     {!result && (
                        <button 
                           onClick={handleSubmitAnswers}
                           disabled={loading || Object.keys(answers).length < questions.length}
                           className="btn-primary w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-glow"
                        >
                           {loading ? "Analyzing..." : "Submit Analysis"}
                        </button>
                     )}

                     {result && (
                        <div className="glass-card p-10 border-white/5 bg-dark-900/40 text-center flex flex-col items-center space-y-8 animate-slide-up">
                           <div className="w-20 h-20 bg-dark-950 rounded-[24px] flex items-center justify-center border border-white/5 shadow-inner">
                              <Trophy size={40} className="text-primary-400 shadow-glow" />
                           </div>
                           <div className="space-y-2">
                              <h3 className="text-3xl font-display font-bold text-white tracking-tight">Mission {result.score >= 70 ? 'Accomplished' : 'Compromised'}</h3>
                              <p className="text-slate-400 text-lg font-medium italic">"{result.feedback}"</p>
                           </div>
                           <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                              <div className="bg-dark-950 border border-white/5 rounded-2xl p-6">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Score</p>
                                 <p className="text-3xl font-black text-white">{Math.round((result.score/result.total)*100)}%</p>
                              </div>
                              <div className="bg-dark-950 border border-white/5 rounded-2xl p-6">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rewards</p>
                                 <p className="text-3xl font-black text-primary-400">+{result.xpEarned} XP</p>
                              </div>
                           </div>
                           <div className="flex gap-4 w-full max-w-md pt-4">
                              <button onClick={() => { setQuestions([]); setAnswers({}); setResult(null); setVocabulary([]); }} className="btn-primary flex-1 py-4 text-[10px] font-black uppercase tracking-widest shadow-glow">Re-Initiate</button>
                              <button onClick={() => { setSelectedVideo(null); setQuestions([]); setAnswers({}); setResult(null); }} className="btn-ghost flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-white/5">Exit Stream</button>
                           </div>
                        </div>
                     )}
                  </div>
                )}
             </div>

             <div className="space-y-8">
                {vocabulary.length > 0 && (
                  <div className="glass-card p-8 border-white/5 bg-dark-900/40">
                    <h3 className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                       <BookOpen size={14} className="text-primary-400" /> Neural Glossary
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {vocabulary.map((v, i) => (
                        <div key={i} className="space-y-1.5 p-4 rounded-2xl bg-dark-950/50 border border-white/5 group hover:border-primary-500/30 transition-colors">
                          <p className="text-sm font-black text-white group-hover:text-primary-400 transition-colors">{typeof v === 'string' ? v : v.word}</p>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{typeof v === 'string' ? '' : v.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="glass-card p-8 border-white/5 bg-dark-900/40">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Shield size={14} className="text-primary-400" /> Operational Goals
                   </h3>
                   <ul className="space-y-4">
                      <li className="text-xs text-slate-400 font-medium flex items-start gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-1.5 shadow-glow" />
                         <span>Achieve 70% accuracy to unlock next protocol.</span>
                      </li>
                      <li className="text-xs text-slate-400 font-medium flex items-start gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-1.5 shadow-glow" />
                         <span>Analyze authentic linguistic patterns.</span>
                      </li>
                   </ul>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* AI PASSAGES VIEW */}
      {activeTab === "passages" && (
        <div className="max-w-3xl mx-auto space-y-10 animate-slide-up">
          <div className="glass-card p-10 border-white/5 bg-dark-900/40 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
             <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                   <h2 className="text-2xl font-display font-bold text-white tracking-tight">Neural Passage Synthesis</h2>
                   <p className="text-slate-400 text-sm font-medium">Generate targeted auditory missions across any domain.</p>
                </div>
                <div className="flex gap-4">
                  <input
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleGeneratePassage()}
                    placeholder="Enter mission domain (e.g. Quantum Physics, Culinary Arts...)"
                    className="input-field py-4 px-6 bg-dark-950 border-white/10"
                  />
                  <button 
                    onClick={handleGeneratePassage} 
                    disabled={passageLoading || !topic.trim()}
                    className="btn-primary px-10 text-[10px] font-black uppercase tracking-widest shadow-glow"
                  >
                    {passageLoading ? "Synthesizing..." : "Initiate"}
                  </button>
                </div>
             </div>
          </div>

          {passage && (
            <div className="space-y-10 animate-slide-up">
              <div className="glass-card p-10 border-primary-500/20 bg-primary-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Volume2 size={80} />
                </div>
                <div className="flex items-center gap-3 text-primary-400 font-black text-[10px] uppercase tracking-widest mb-6">
                  <Music size={16} className="animate-pulse" />
                  <span>Synthesized Protocol</span>
                </div>
                <p className="text-xl md:text-2xl font-display font-medium text-white leading-relaxed italic">
                  "{passage}"
                </p>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center gap-3 px-1">
                    <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow" />
                    <h3 className="text-xl font-display font-bold text-white tracking-tight">Assessment Objectives</h3>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    {passageQuestions.map((q, i) => (
                      <div key={i} className="glass-card p-8 border-white/5 bg-dark-900/40 space-y-6">
                        <h4 className="text-lg font-bold text-white leading-relaxed tracking-tight">{i + 1}. {q.question}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, j) => {
                            const letter = ["A","B","C","D"][j];
                            const isSelected = passageAnswers[i] === letter;
                            const isCorrect  = passageResult && j === q.correct;
                            const isWrong    = passageResult && isSelected && j !== q.correct;
                            return (
                              <button 
                                 key={j}
                                 onClick={() => !passageResult && setPassageAnswers(p => ({ ...p, [i]: letter }))}
                                 className={`text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                                    isCorrect ? 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald shadow-glow' :
                                    isWrong ? 'border-accent-rose bg-accent-rose/10 text-accent-rose shadow-glow' :
                                    isSelected ? 'border-primary-500 bg-primary-500/10 text-primary-400 shadow-glow' :
                                    'border-white/5 bg-dark-950 text-slate-500 hover:border-white/10 hover:bg-white/5'
                                 }`}
                              >
                                <div className={`w-8 h-8 rounded-xl border border-current flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? 'bg-white/10' : ''}`}>
                                   {letter}
                                </div>
                                <span className="flex-1 font-bold tracking-tight text-sm">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                 </div>

                 {passageQuestions.length > 0 && !passageResult && (
                   <button 
                      onClick={handleSubmitPassageAnswers}
                      disabled={passageLoading || Object.keys(passageAnswers).length < passageQuestions.length}
                      className="btn-primary w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-glow"
                    >
                      {passageLoading ? "Analyzing..." : "Confirm Comprehension"}
                    </button>
                 )}

                 {passageResult && (
                   <div className="glass-card p-12 border-white/5 bg-dark-900/40 text-center flex flex-col items-center space-y-8 animate-slide-up">
                     <div className="w-20 h-20 bg-dark-950 rounded-[24px] flex items-center justify-center border border-white/5 shadow-inner">
                        <Award size={40} className="text-primary-400 shadow-glow" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-4xl font-display font-black text-white tracking-tight">{passageResult.score}/{passageResult.total} Verified</h3>
                        <p className="text-slate-400 text-lg font-medium italic">"{passageResult.feedback}"</p>
                     </div>
                     <div className="flex gap-4 bg-dark-950 border border-white/5 px-6 py-3 rounded-full">
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Rewards Mapped: +{passageResult.xpEarned} XP</span>
                     </div>
                     <button
                       onClick={() => { setPassage(""); setPassageQuestions([]); setPassageAnswers({}); setPassageResult(null); setTopic(""); }}
                       className="btn-primary py-4 px-12 text-[10px] font-black uppercase tracking-widest shadow-glow"
                     >
                       Synthesize New Domain
                     </button>
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
