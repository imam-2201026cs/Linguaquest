// Premium Writing Lab Overhaul - Cinematic "Nexus" Edition
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool, Send, RotateCcw, Zap, BookOpen, Timer,
  ChevronRight, Lock, CheckCircle, Trophy, BarChart2,
  RefreshCw, Wand2, FileText, Maximize2, Minimize2, Sparkles,
  Award, Target, Activity, Shield, Info, ArrowLeft, MoreHorizontal,
  ChevronDown, ChevronUp, Lightbulb, MessageSquare, Terminal, Cpu
} from 'lucide-react';
import XPReward from '../components/XPReward';
import { useAuth } from '../context/AuthContext';

const TIER_ICONS = { 
  a1: '🌱', a2: '🏰', b1: '🔍', 
  b2: '🌍', c1: '🎩', c2: '💎' 
};

const ScoreBar = ({ label, value, color = 'bg-primary-500' }) => (
  <div className="mb-6">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-2.5">
      <span className="text-slate-500">{label}</span>
      <span className={`font-black ${value >= 80 ? 'text-accent-emerald' : value >= 60 ? 'text-accent-amber' : 'text-accent-rose'}`}>{value}%</span>
    </div>
    <div className="h-2 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-white/5">
      <motion.div 
         initial={{ width: 0 }}
         animate={{ width: `${value}%` }}
         transition={{ duration: 1.5, ease: "circOut" }}
         className={`h-full ${color} rounded-full shadow-glow`} 
      />
    </div>
  </div>
);

function WritingRoadmap({ library, onSelectLesson, completedCount }) {
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  
  return (
    <div className="max-w-7xl mx-auto animate-slide-up pb-32 space-y-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="max-w-2xl">
           <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Advanced Composition Matrix</span>
              <div className="h-px w-12 bg-primary-500/30" />
           </div>
           <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none mb-4">
             Writing <span className="shimmer-text">Nexus</span>
           </h1>
           <p className="text-slate-400 text-lg font-medium leading-relaxed">
             90 Tactical missions mapped from Foundations to Master-tier linguistic synthesis.
           </p>
        </div>
        <div className="glass-card px-10 py-6 flex items-center gap-8 border-white/5 bg-dark-950/40 relative overflow-hidden group shadow-glow">
           <div className="absolute inset-0 bg-primary-500/5 group-hover:bg-primary-500/10 transition-colors" />
           <div className="relative z-10 text-right">
             <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-2">Global Mastery</p>
             <p className="text-4xl font-display font-black text-white">{completedCount}<span className="text-primary-500/30 text-2xl mx-1">/</span>90</p>
           </div>
           <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center border border-primary-500/20 shadow-inner relative z-10">
              <Trophy size={32} className="text-primary-400 animate-pulse" />
           </div>
        </div>
      </div>

      {/* Grid of Tiers */}
      <div className="space-y-24">
        {levels.map((lvl) => {
          const section = library[lvl];
          if (!section) return null;
          
          return (
            <div key={lvl} className="relative">
              <div className="flex items-center gap-6 mb-12 sticky top-0 z-20 py-6 bg-dark-950/60 backdrop-blur-2xl border-b border-white/5">
                <div className="w-16 h-16 bg-dark-950 border border-white/10 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner shrink-0 group">
                   <span className="group-hover:scale-125 transition-transform duration-500">{TIER_ICONS[lvl] || '✍️'}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase tracking-[0.1em]">{section.label.replace(/^[A-C][1-2]\s*/, '')}</h2>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1 h-2 bg-dark-950 rounded-full overflow-hidden max-w-[300px] p-0.5 border border-white/5">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${section.progress}%` }}
                         className="h-full bg-primary-500 rounded-full shadow-glow" 
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{section.progress}% SYNCHRONIZED</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {section.lessons.map((lesson, index) => {
                  const isLocked = !lesson.isUnlocked;
                  const isCompleted = lesson.isCompleted;
                  
                  return (
                    <motion.button
                      key={lesson.id}
                      whileHover={!isLocked ? { y: -8, scale: 1.02 } : {}}
                      disabled={isLocked}
                      onClick={() => !isLocked && onSelectLesson(lesson)}
                      className={`relative group p-8 rounded-[2.5rem] border transition-all duration-700 flex flex-col items-center text-center ${
                        isCompleted 
                        ? 'bg-accent-emerald/5 border-accent-emerald/20 shadow-glow-sm' 
                        : isLocked 
                        ? 'bg-dark-950/40 border-white/5 opacity-40 grayscale cursor-not-allowed'
                        : 'bg-dark-900/40 border-white/5 hover:border-primary-500/50 hover:bg-white/5 shadow-premium cursor-pointer'
                      }`}
                    >
                      <div className="absolute -top-1 -right-1 z-10">
                        {isCompleted ? (
                          <div className="w-10 h-10 bg-accent-emerald rounded-2xl flex items-center justify-center shadow-glow border border-white/10">
                            <CheckCircle size={18} className="text-white" />
                          </div>
                        ) : isLocked ? (
                          <div className="w-10 h-10 bg-dark-900 border border-white/5 rounded-2xl flex items-center justify-center">
                            <Lock size={16} className="text-slate-600" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center animate-pulse shadow-glow border border-white/10">
                            <Zap size={18} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="w-20 h-20 bg-dark-950 rounded-3xl flex items-center justify-center text-4xl mb-6 border border-white/5 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                        {lesson.emoji}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-60">
                          OBJ {index + 1}
                        </div>
                        <h3 className="text-sm font-black text-white leading-tight tracking-tight line-clamp-2 min-h-[40px] group-hover:text-primary-400 transition-colors uppercase">
                          {lesson.title}
                        </h3>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WritingEditor({ lesson, prompt, onSubmit, onBack }) {
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [improveResult, setImproveResult] = useState(null);
  const [startTime] = useState(Date.now());
  const [selectedSentence, setSelectedSentence] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [museLoading, setMuseLoading] = useState(false);
  const [museSuggestions, setMuseSuggestions] = useState(null);
  const [milestones, setMilestones] = useState(new Set());
  const [mission, setMission] = useState(null);
  const [isMissionComplete, setIsMissionComplete] = useState(false);

  useEffect(() => {
    axios.get('/api/writing/daily-mission').then(res => setMission(res.data));
  }, []);

  useEffect(() => {
    const currentWordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(currentWordCount);

    if (mission && text.toLowerCase().includes(mission.word.toLowerCase())) {
      if (!isMissionComplete) {
        setIsMissionComplete(true);
        toast.success(`Neural Objective Verified: "${mission.word}"`, { icon: '🎯' });
      }
    } else {
      setIsMissionComplete(false);
    }

    const checkMilestone = (count, emoji, msg) => {
      if (currentWordCount >= count && !milestones.has(count)) {
        toast.success(`${emoji} ${count} words! ${msg}`);
        setMilestones(prev => new Set([...prev, count]));
      }
    };
    if (currentWordCount >= 50) checkMilestone(50, '🌱', 'Initial Synchronization');
    if (currentWordCount >= 100) checkMilestone(100, '🌿', 'Structural Integrity');
    if (currentWordCount >= 200) checkMilestone(200, '🌳', 'Linguistic Mastery');
  }, [text]);

  const handleSubmit = async () => {
    if (!text.trim()) return toast.error('Initiate communication first!');
    if (wordCount < (prompt.minWords || 30)) return toast.error(`Mission requires at least ${prompt.minWords || 30} words.`);
    setLoading(true);
    try {
      const { data } = await axios.post('/api/writing/submit', { 
        text, 
        lessonId: lesson.id, 
        mode: lesson.modeId, 
        promptData: prompt, 
        timeSpent: Math.floor((Date.now() - startTime) / 1000), 
        wordCount 
      });
      onSubmit(data);
    } catch (err) { toast.error('Telemetry uplink failed.'); }
    finally { setLoading(false); }
  };

  const handleImprove = async () => {
    const sel = window.getSelection()?.toString().trim() || selectedSentence;
    if (!sel || sel.length < 5) return toast.error('Identify a linguistic segment for recalibration.');
    setImproving(true);
    try {
      const { data } = await axios.post('/api/writing/improve', { sentence: sel });
      setImproveResult(data);
    } catch { toast.error('Neural improvement failed.'); }
    finally { setImproving(false); }
  };

  const applyImprovement = () => {
    if (!improveResult) return;
    const sel = window.getSelection()?.toString().trim() || selectedSentence;
    if (sel) setText(prev => prev.replace(sel, improveResult.improved));
    setImproveResult(null);
    toast.success('Segment recalibrated.');
  };

  const handleSuggestIdea = async () => {
    setMuseLoading(true);
    try {
      const { data } = await axios.post('/api/writing/suggest-idea', {
        text,
        prompt: prompt.starter || prompt.headline || prompt.topic || prompt.task,
        mode: lesson.modeId
      });
      setMuseSuggestions(data);
    } catch { toast.error('Muse uplink lost.'); }
    finally { setMuseLoading(false); }
  };

  const applySuggestion = (s) => {
    setText(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + s);
    setMuseSuggestions(null);
    toast.success('Vector integrated.');
  };

  const pct = Math.min(100, (wordCount / (prompt.minWords || 100)) * 100);
  const barColor = pct >= 100 ? 'bg-accent-emerald' : pct >= 60 ? 'bg-accent-amber' : 'bg-primary-500';
  const connectors = ['Furthermore,', 'In contrast,', 'Consequently,', 'Nevertheless,', 'Significantly,', 'Paradoxically,', 'Moreover,', 'Specifically,'];

  return (
    <div className="max-w-7xl mx-auto animate-slide-up space-y-10">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all border border-white/5 hover:bg-white/10">
             <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-5">
             <div className="text-4xl group-hover:scale-110 transition-transform">{lesson.emoji}</div>
             <div>
                <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">{lesson.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow animate-pulse" />
                   <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Neural Uplink Active</span>
                </div>
             </div>
          </div>
        </div>
        <button 
           onClick={() => setFocusMode(!focusMode)} 
           className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all ${focusMode ? 'bg-primary-500 text-white shadow-glow' : 'bg-dark-900 border border-white/5 text-slate-500 hover:text-white hover:bg-white/5'}`}
        >
          {focusMode ? <><Minimize2 size={16} /> Exit Deep Focus</> : <><Maximize2 size={16} /> Enter Deep Focus</>}
        </button>
      </div>

      <div className={`grid grid-cols-1 ${focusMode ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-10 transition-all duration-700 pb-32`}>
        <div className={focusMode ? 'max-w-4xl mx-auto w-full space-y-10' : 'lg:col-span-8 space-y-8'}>
          {mission && (
            <div className={`glass-card p-6 border-white/5 transition-all duration-700 flex items-center justify-between relative overflow-hidden ${isMissionComplete ? 'bg-accent-emerald/5 border-accent-emerald/20' : 'bg-primary-500/5 border-primary-500/20'}`}>
              <div className="flex items-center gap-5 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isMissionComplete ? 'bg-accent-emerald text-white' : 'bg-primary-500 text-white shadow-glow'}`}>
                  <Target size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Vector Objective</p>
                  <p className="text-lg font-black text-white">Include Keyword: <span className="text-primary-400 underline decoration-2 underline-offset-8">{mission.word}</span></p>
                </div>
              </div>
              {isMissionComplete && <div className="bg-accent-emerald/10 px-5 py-2.5 rounded-2xl text-accent-emerald text-[10px] font-black uppercase tracking-[0.3em] border border-accent-emerald/20">Verified ✓</div>}
            </div>
          )}

          <div className="glass-card p-12 border-white/5 bg-dark-950/40 relative overflow-hidden group shadow-premium">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10 space-y-8">
               <div>
                  <div className="flex items-center gap-3 mb-4">
                     <span className="text-[10px] text-primary-400 font-black uppercase tracking-[0.4em]">Mission Parameters</span>
                     <div className="h-px w-8 bg-primary-500/30" />
                  </div>
                  <h3 className="text-3xl font-display font-black text-white tracking-tighter leading-none">{prompt.task}</h3>
               </div>
               {prompt.starter && <p className="text-slate-400 italic text-xl leading-relaxed font-medium bg-white/5 p-6 rounded-2xl border-l-4 border-primary-500">"{prompt.starter}"</p>}
               {prompt.imageUrl && <img src={prompt.imageUrl} className="w-full aspect-video object-cover rounded-[3rem] border border-white/10 shadow-premium" alt="Mission Context" />}
               <div className="flex items-center gap-10 pt-4">
                 <div className="flex items-center gap-3">
                    <FileText size={18} className="text-primary-400" />
                    <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Target: {prompt.minWords}+ Words</span>
                 </div>
                 {prompt.timeSeconds > 0 && (
                   <div className="flex items-center gap-3">
                      <Timer size={18} className="text-accent-amber" />
                      <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Timed Operation</span>
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="glass-card p-1.5 border-white/5 bg-dark-900 shadow-premium relative group">
             <div className="absolute top-0 left-0 right-0 h-2 z-10 bg-dark-950/80 backdrop-blur-xl rounded-t-[2.4rem] overflow-hidden">
                <motion.div 
                   animate={{ width: `${pct}%` }}
                   transition={{ type: 'spring', stiffness: 50 }}
                   className={`h-full ${barColor} shadow-glow`} 
                />
             </div>
             <textarea 
               value={text} 
               onChange={e => setText(e.target.value)}
               placeholder="Initiate composition transmission..."
               className="w-full bg-transparent border-none focus:ring-0 min-h-[550px] p-12 font-medium text-xl leading-relaxed text-slate-200 placeholder-slate-800 resize-none"
             />
             <div className="flex justify-between items-center p-8 bg-dark-950/60 border-t border-white/5 rounded-b-[2.4rem]">
                <div className="flex gap-10">
                   <div className="text-center">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1.5">WORD COUNT</p>
                      <p className="text-2xl font-display font-black text-white">{wordCount}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1.5">QUOTA</p>
                      <p className="text-2xl font-display font-black text-white">{pct.toFixed(0)}%</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={handleImprove} disabled={improving || !text.trim()} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all border border-white/5 hover:bg-white/10 group/btn">
                      <Wand2 size={24} className="group-hover/btn:scale-110 transition-transform" />
                   </button>
                   <button onClick={handleSuggestIdea} disabled={museLoading || !text.trim()} className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 hover:text-white transition-all border border-primary-500/20 hover:bg-primary-500/20">
                      <Sparkles size={24} className="animate-pulse" />
                   </button>
                   <button 
                      onClick={handleSubmit} 
                      disabled={loading || wordCount < (prompt.minWords || 30)} 
                      className="btn-primary py-4 px-12 text-[10px] font-black uppercase tracking-[0.4em] shadow-glow flex items-center gap-4 hover:scale-105 transition-transform"
                   >
                      {loading ? "Uplinking..." : <><Send size={18} /> Commit Transmission</>}
                   </button>
                </div>
             </div>
          </div>

          <AnimatePresence>
            {improveResult && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="glass-card p-10 border-accent-emerald/30 bg-accent-emerald/5 relative overflow-hidden shadow-glow-sm"
               >
                 <div className="flex items-center gap-4 text-accent-emerald font-black text-[10px] uppercase tracking-[0.4em] mb-6">
                   <Cpu size={18} />
                   <span>Neural Recalibration Result</span>
                 </div>
                 <p className="text-white text-2xl font-medium mb-6 italic leading-relaxed">"{improveResult.improved}"</p>
                 <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed bg-dark-950/40 p-6 rounded-2xl">{improveResult.explanation}</p>
                 <div className="flex gap-6">
                   <button onClick={applyImprovement} className="btn-primary py-4 px-8 text-[10px] font-black uppercase tracking-[0.3em] shadow-glow">Integrate Segment</button>
                   <button onClick={() => setImproveResult(null)} className="btn-ghost py-4 px-8 text-[10px] font-black uppercase tracking-[0.3em] border-white/5">Discard Vector</button>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!focusMode && (
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-10 border-white/5 bg-dark-900/40">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                  <Terminal size={14} className="text-primary-400" /> Linguistic Connectors
               </h3>
               <div className="grid grid-cols-2 gap-3">
                 {connectors.map(p => (
                   <button 
                      key={p} 
                      onClick={() => setText(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + p + ' ')} 
                      className="text-[9px] font-black uppercase tracking-widest bg-dark-950 hover:bg-primary-500/20 px-4 py-3 rounded-2xl text-slate-500 hover:text-white border border-white/5 hover:border-primary-500/30 transition-all text-center"
                   >
                      {p}
                   </button>
                 ))}
               </div>
            </div>

            <div className="glass-card p-10 border-white/5 bg-dark-900/40">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                  <Activity size={14} className="text-primary-400" /> Operation Metrics
               </h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-center px-2">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">STRUCTURES</span>
                     <span className="text-xl font-display font-black text-white">{text.split(/[.!?]+/).filter(s => s.trim()).length}</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center px-2">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">DATA POINTS</span>
                     <span className="text-xl font-display font-black text-white">{text.length}</span>
                  </div>
               </div>
            </div>

            <div className="glass-card p-10 border-white/5 bg-primary-500/5">
               <h3 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                  <Lightbulb size={14} className="text-primary-400" /> Neural Guidance
               </h3>
               <p className="text-sm text-slate-400 font-medium leading-relaxed">
                 Priority: Syntactic Variance. Deploy complex subordinate clauses to optimize your coherence score.
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackReport({ result, onRedo, onBack }) {
  const { evaluation, xpEarned, coinsEarned } = result;
  const [showModel, setShowModel] = useState(false);
  const [showCorrected, setShowCorrected] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-slide-up pb-32">
      <div className="glass-card p-12 bg-gradient-to-br from-primary-500/10 to-transparent border-white/5 relative overflow-hidden shadow-premium">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
             <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-3 h-3 rounded-full bg-primary-500 shadow-glow" />
                <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">Post-Mission Intelligence Report</span>
             </div>
             <h2 className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter leading-none uppercase">Analysis <span className="shimmer-text">Complete</span></h2>
             <p className="text-slate-400 text-xl font-medium leading-relaxed italic max-w-2xl">"{evaluation.feedback}"</p>
             <div className="flex gap-6 pt-6 justify-center md:justify-start">
                <div className="flex items-center gap-3 bg-primary-500/10 border border-primary-500/20 px-6 py-3 rounded-2xl shadow-glow-sm">
                   <Zap size={18} className="text-primary-400" />
                   <span className="text-xs font-black text-primary-400 uppercase tracking-widest">+{xpEarned} XP SYNC</span>
                </div>
                <div className="flex items-center gap-3 bg-accent-amber/10 border border-accent-amber/20 px-6 py-3 rounded-2xl">
                   <Trophy size={18} className="text-accent-amber" />
                   <span className="text-xs font-black text-accent-amber uppercase tracking-widest">+{coinsEarned} CREDITS</span>
                </div>
             </div>
          </div>
          <div className="text-center shrink-0 flex flex-col items-center">
             <div className="relative mb-6 scale-125 md:scale-150">
                <svg width="120" height="120" className="-rotate-90">
                   <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
                   <motion.circle 
                      initial={{ strokeDashoffset: 339 }}
                      animate={{ strokeDashoffset: 339 - (evaluation.overallScore / 100) * 339 }}
                      transition={{ duration: 2, ease: "circOut" }}
                      cx="60" cy="60" r="54" stroke="#8b5cf6" strokeWidth="10" fill="none"
                      strokeDasharray="339"
                      strokeLinecap="round" 
                      className="shadow-glow"
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-display font-black text-white">{evaluation.overallScore}</span>
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Mastery</span>
                </div>
             </div>
             <div className="bg-dark-950 border border-white/5 px-6 py-2.5 rounded-full mt-10 shadow-inner">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Tier: <span className="text-primary-400">{evaluation.cefr}</span></span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
         <div className="md:col-span-4 glass-card p-10 border-white/5 bg-dark-900/40">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
              <BarChart2 size={18} className="text-primary-400" /> Efficiency Matrix
           </h3>
           <ScoreBar label="Syntactic Accuracy" value={evaluation.grammarScore} color="bg-primary-500" />
           <ScoreBar label="Lexical Depth" value={evaluation.vocabularyScore} color="bg-accent-indigo" />
           <ScoreBar label="Structural Cohesion" value={evaluation.coherenceScore} color="bg-accent-emerald" />
         </div>
         <div className="md:col-span-8 glass-card p-10 border-white/5 bg-dark-900/40">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
              <Shield size={18} className="text-primary-400" /> Tactical Intelligence
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
             <div className="space-y-6">
                <p className="text-[10px] font-black text-accent-emerald uppercase tracking-[0.4em] px-4 py-2 bg-accent-emerald/10 border border-accent-emerald/20 rounded-xl inline-block">Core Strengths</p>
                <ul className="space-y-4">
                   {evaluation.strengths.map((s, i) => (
                     <li key={i} className="text-sm text-slate-300 font-bold flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-transparent hover:border-accent-emerald/30 transition-all">
                        <CheckCircle size={18} className="text-accent-emerald shrink-0 mt-0.5" />
                        <span>{s}</span>
                     </li>
                   ))}
                </ul>
             </div>
             <div className="space-y-6">
                <p className="text-[10px] font-black text-accent-rose uppercase tracking-[0.4em] px-4 py-2 bg-accent-rose/10 border border-accent-rose/20 rounded-xl inline-block">Neural Gaps</p>
                <ul className="space-y-4">
                   {evaluation.improvements.map((s, i) => (
                     <li key={i} className="text-sm text-slate-300 font-bold flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-transparent hover:border-accent-rose/30 transition-all">
                        <Activity size={18} className="text-accent-rose shrink-0 mt-0.5" />
                        <span>{s}</span>
                     </li>
                   ))}
                </ul>
             </div>
           </div>
         </div>
      </div>

      <div className="glass-card border-white/5 bg-dark-900/40 overflow-hidden shadow-premium">
        <button onClick={() => setShowCorrected(!showCorrected)} className="flex items-center justify-between w-full p-10 hover:bg-white/5 transition-all">
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 bg-accent-emerald/10 rounded-2xl flex items-center justify-center text-accent-emerald border border-accent-emerald/20 shadow-glow-sm">
                <CheckCircle size={24} />
             </div>
             <div className="text-left">
                <h3 className="text-xl font-display font-black text-white tracking-tight uppercase">Recalibrated Logic</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Corrected Transmission Vector</p>
             </div>
          </div>
          <div className={`transition-transform duration-500 ${showCorrected ? 'rotate-180' : ''}`}>
             <ChevronDown size={28} className="text-slate-600" />
          </div>
        </button>
        <AnimatePresence>
           {showCorrected && (
             <motion.div 
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.5, ease: "circOut" }}
             >
                <div className="p-12 pt-0">
                   <div className="bg-dark-950 p-12 rounded-[2.5rem] border border-white/5 text-slate-200 text-xl leading-relaxed font-medium whitespace-pre-wrap shadow-inner border-l-8 border-l-accent-emerald">
                      {evaluation.correctedText}
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>

      <div className="glass-card border-white/5 bg-dark-900/40 overflow-hidden shadow-premium">
        <button onClick={() => setShowModel(!showModel)} className="flex items-center justify-between w-full p-10 hover:bg-white/5 transition-all">
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-400 border border-primary-500/20 shadow-glow-sm">
                <BookOpen size={24} />
             </div>
             <div className="text-left">
                <h3 className="text-xl font-display font-black text-white tracking-tight uppercase">Mastery Standard</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Ideal Prototype Protocol</p>
             </div>
          </div>
          <div className={`transition-transform duration-500 ${showModel ? 'rotate-180' : ''}`}>
             <ChevronDown size={28} className="text-slate-600" />
          </div>
        </button>
        <AnimatePresence>
           {showModel && (
             <motion.div 
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.5, ease: "circOut" }}
             >
                <div className="p-12 pt-0">
                   <div className="bg-dark-950 p-12 rounded-[2.5rem] border border-white/5 text-slate-200 text-xl leading-relaxed font-medium italic shadow-inner border-l-8 border-l-primary-500">
                      {evaluation.modelAnswer}
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>

      <div className="flex gap-8 pt-12">
        <button onClick={onBack} className="btn-ghost flex-1 py-6 flex items-center justify-center gap-4 rounded-2xl font-black text-xs uppercase tracking-[0.4em] border-white/5 hover:bg-white/5 transition-all group">
           <RotateCcw size={22} className="group-hover:-rotate-90 transition-transform duration-500" /> 
           Return to Nexus
        </button>
        <button onClick={onRedo} className="btn-primary flex-1 py-6 flex items-center justify-center gap-4 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-glow scale-110 hover:scale-115 transition-transform">
           <RefreshCw size={22} className="animate-spin-slow" /> 
           Re-Initiate Mission
        </button>
      </div>
    </div>
  );
}

export default function Writing() {
  const [phase, setPhase] = useState('roadmap');
  const [library, setLibrary] = useState({});
  const [completedCount, setCompletedCount] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [promptData, setPromptData] = useState(null);
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchRoadmap = async () => {
    try {
      const { data } = await axios.get('/api/writing/roadmap');
      setLibrary(data.library || {});
      setCompletedCount(data.completedCount || 0);
    } catch { toast.error("Uplink synchronization failed."); }
  };

  useEffect(() => { fetchRoadmap(); }, []);
  useEffect(() => { if (user) fetchRoadmap(); }, [user]);

  const handleSelectLesson = async (lesson) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/writing/lesson-prompt', { lessonId: lesson.id });
      setPromptData(data);
      setSelectedLesson(lesson);
      setPhase('editor');
    } catch { toast.error("Mission generation failed."); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (data) => {
    setResult(data);
    setReward({ xp: data.xpEarned, coins: data.coinsEarned, score: data.evaluation.overallScore });
    setPhase('feedback');
    fetchRoadmap();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[75vh] gap-12">
        <div className="relative">
          <div className="w-32 h-32 border-[8px] border-white/5 rounded-full" />
          <div className="w-32 h-32 border-[8px] border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          <Sparkles size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-400 animate-pulse" />
        </div>
        <div className="text-center space-y-4">
           <p className="text-3xl font-display font-black text-white tracking-tighter uppercase">Synchronizing Mission Vectors</p>
           <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">Neural engine selecting optimal composition parameters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6">
      {reward && phase === 'feedback' && <XPReward {...reward} onClose={() => setReward(null)} />}

      <AnimatePresence mode="wait">
        {phase === 'roadmap' && (
          <motion.div key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WritingRoadmap 
              library={library} 
              onSelectLesson={handleSelectLesson} 
              completedCount={completedCount} 
            />
          </motion.div>
        )}

        {phase === 'editor' && selectedLesson && promptData && (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WritingEditor 
              lesson={selectedLesson} 
              prompt={promptData} 
              onSubmit={handleSubmit} 
              onBack={() => setPhase('roadmap')} 
            />
          </motion.div>
        )}

        {phase === 'feedback' && result && (
          <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FeedbackReport 
              result={result} 
              onRedo={() => setPhase('editor')} 
              onBack={() => { setPhase('roadmap'); setResult(null); setReward(null); }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}