import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool, Send, RotateCcw, Zap, BookOpen, Timer,
  ChevronRight, Lock, CheckCircle, Trophy, BarChart2,
  RefreshCw, Wand2, FileText, Maximize2, Minimize2, Sparkles,
  Award, Target, Activity, Shield, Info, ArrowLeft, MoreHorizontal,
  ChevronDown, ChevronUp, Lightbulb, MessageSquare
} from 'lucide-react';
import XPReward from '../components/XPReward';
import { useAuth } from '../context/AuthContext';

const ScoreBar = ({ label, value, color = 'bg-primary-500' }) => (
  <div className="mb-4">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
      <span className="text-slate-500">{label}</span>
      <span className={`font-black ${value >= 80 ? 'text-accent-emerald' : value >= 60 ? 'text-accent-amber' : 'text-accent-rose'}`}>{value}%</span>
    </div>
    <div className="h-1.5 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-white/5">
      <motion.div 
         initial={{ width: 0 }}
         animate={{ width: `${value}%` }}
         transition={{ duration: 1.5, ease: "easeOut" }}
         className={`h-full ${color} rounded-full shadow-glow`} 
      />
    </div>
  </div>
);

function WritingRoadmap({ library, onSelectLesson, completedCount }) {
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  
  return (
    <div className="max-w-6xl mx-auto animate-slide-up pb-20 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">Advanced Composition</span>
              <div className="h-px w-8 bg-primary-500/30" />
           </div>
           <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Writing <span className="shimmer-text">Nexus</span></h1>
           <p className="text-slate-400 text-lg mt-2 font-medium">90 Curated missions from Foundations to Mastery.</p>
        </div>
        <div className="glass-card px-8 py-5 flex items-center gap-6 border-white/10 bg-dark-900/40 relative overflow-hidden group">
           <div className="absolute inset-0 bg-primary-500/5 group-hover:bg-primary-500/10 transition-colors" />
           <div className="relative z-10 text-right">
             <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1">Global Mastery</p>
             <p className="text-3xl font-display font-black text-white">{completedCount}<span className="text-primary-500/50 text-xl mx-1">/</span>90</p>
           </div>
           <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center border border-primary-500/20 shadow-glow relative z-10">
              <Trophy size={24} className="text-primary-400" />
           </div>
        </div>
      </div>

      <div className="space-y-16">
        {levels.map((lvl) => {
          const section = library[lvl];
          if (!section) return null;
          
          return (
            <div key={lvl} className="relative">
              <div className="flex items-center gap-5 mb-8 sticky top-0 z-20 py-4 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
                <div className="w-14 h-14 bg-dark-950 border border-white/10 rounded-2xl flex items-center justify-center text-xl font-black text-primary-400 shadow-inner">
                   {lvl.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-display font-bold text-white tracking-tight">{section.label}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-1.5 bg-dark-950 rounded-full overflow-hidden max-w-[240px] p-0.5 border border-white/5">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${section.progress}%` }}
                         className="h-full bg-primary-500 rounded-full shadow-glow" 
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{section.progress}% Complete</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {section.lessons.map((lesson, index) => {
                  const isLocked = !lesson.isUnlocked;
                  const isCompleted = lesson.isCompleted;
                  
                  return (
                    <motion.button
                      key={lesson.id}
                      whileHover={!isLocked ? { y: -5 } : {}}
                      disabled={isLocked}
                      onClick={() => !isLocked && onSelectLesson(lesson)}
                      className={`relative group p-8 rounded-[32px] border transition-all duration-500 flex flex-col items-center text-center ${
                        isCompleted 
                        ? 'bg-accent-emerald/5 border-accent-emerald/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                        : isLocked 
                        ? 'bg-dark-950 border-white/5 opacity-40 grayscale cursor-not-allowed'
                        : 'bg-dark-900/40 border-white/5 hover:border-primary-500/50 hover:bg-white/5 shadow-2xl cursor-pointer'
                      }`}
                    >
                      <div className="absolute -top-1 -right-1">
                        {isCompleted ? (
                          <div className="w-8 h-8 bg-accent-emerald rounded-xl flex items-center justify-center shadow-glow">
                            <CheckCircle size={16} className="text-white" />
                          </div>
                        ) : isLocked ? (
                          <div className="w-8 h-8 bg-dark-800 border border-white/10 rounded-xl flex items-center justify-center">
                            <Lock size={14} className="text-slate-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center animate-pulse shadow-glow">
                            <Zap size={16} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="w-16 h-16 bg-dark-950 rounded-2xl flex items-center justify-center text-4xl mb-6 border border-white/5 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        {lesson.emoji}
                      </div>
                      
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">
                        Objective {index + 1}
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight tracking-tight line-clamp-2 min-h-[40px] group-hover:text-primary-400 transition-colors">
                        {lesson.title}
                      </h3>
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
        toast.success(`Mission Success! Included "${mission.word}"`, { icon: '🎯' });
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
    if (currentWordCount >= 50) checkMilestone(50, '🌱', 'Solid Foundation');
    if (currentWordCount >= 100) checkMilestone(100, '🌿', 'Fluent Structure');
    if (currentWordCount >= 200) checkMilestone(200, '🌳', 'Masterful Length');
  }, [text]);

  const handleSubmit = async () => {
    if (!text.trim()) return toast.error('Initiate communication first!');
    if (wordCount < (prompt.minWords || 30)) return toast.error(`Target at least ${prompt.minWords || 30} words.`);
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
    } catch (err) { toast.error('Submission failed.'); }
    finally { setLoading(false); }
  };

  const handleImprove = async () => {
    const sel = window.getSelection()?.toString().trim() || selectedSentence;
    if (!sel || sel.length < 5) return toast.error('Select a linguistic segment to improve.');
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
    } catch { toast.error('Muse disconnected.'); }
    finally { setMuseLoading(false); }
  };

  const applySuggestion = (s) => {
    setText(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + s);
    setMuseSuggestions(null);
    toast.success('Idea integrated.');
  };

  const pct = Math.min(100, (wordCount / (prompt.minWords || 100)) * 100);
  const barColor = pct >= 100 ? 'bg-accent-emerald' : pct >= 60 ? 'bg-accent-amber' : 'bg-primary-500';
  const connectors = ['Furthermore,', 'However,', 'In contrast,', 'As a result,', 'To conclude,', 'Additionally,', 'Nevertheless,', 'In particular,'];

  return (
    <div className="max-w-6xl mx-auto animate-slide-up space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors border border-white/5">
             <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
             <div className="text-3xl">{lesson.emoji}</div>
             <div>
                <h2 className="text-xl font-display font-bold text-white tracking-tight">{lesson.title}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1 h-1 rounded-full bg-primary-500 shadow-glow" />
                   <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Active Writing Protocol</span>
                </div>
             </div>
          </div>
        </div>
        <button 
           onClick={() => setFocusMode(!focusMode)} 
           className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${focusMode ? 'bg-primary-500 text-white shadow-glow' : 'bg-dark-900 border border-white/5 text-slate-500 hover:text-white'}`}
        >
          {focusMode ? <><Minimize2 size={14} /> Normal View</> : <><Maximize2 size={14} /> Focus Mode</>}
        </button>
      </div>

      <div className={`grid grid-cols-1 ${focusMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-8 transition-all duration-500 pb-20`}>
        <div className={focusMode ? 'max-w-3xl mx-auto w-full space-y-8' : 'lg:col-span-2 space-y-6'}>
          {mission && (
            <div className={`glass-card p-5 border-white/5 transition-all duration-500 flex items-center justify-between relative overflow-hidden ${isMissionComplete ? 'bg-accent-emerald/5 border-accent-emerald/20' : 'bg-primary-500/5 border-primary-500/20'}`}>
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMissionComplete ? 'bg-accent-emerald text-white' : 'bg-primary-500 text-white shadow-glow'}`}>
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Neural Objective</p>
                  <p className="text-sm font-bold text-white">Include Keyword: <span className="text-primary-400 underline decoration-2 underline-offset-4">{mission.word}</span></p>
                </div>
              </div>
              {isMissionComplete && <div className="bg-accent-emerald/10 px-3 py-1.5 rounded-lg text-accent-emerald text-[9px] font-black uppercase tracking-widest border border-accent-emerald/20">Mission Verified ✓</div>}
            </div>
          )}

          <div className="glass-card p-10 border-white/5 bg-dark-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-6">
               <div>
                  <p className="text-[10px] text-primary-400 font-black uppercase tracking-widest mb-3">Mission parameters</p>
                  <h3 className="text-2xl font-display font-bold text-white tracking-tight leading-tight">{prompt.task}</h3>
               </div>
               {prompt.starter && <p className="text-slate-400 italic text-lg leading-relaxed font-medium">"{prompt.starter}"</p>}
               {prompt.imageUrl && <img src={prompt.imageUrl} className="w-full aspect-video object-cover rounded-[24px] border border-white/10 shadow-2xl" alt="Mission Context" />}
               <div className="flex items-center gap-6 pt-2">
                 <div className="flex items-center gap-2">
                    <FileText size={14} className="text-primary-400" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">Min {prompt.minWords} Words</span>
                 </div>
                 {prompt.timeSeconds > 0 && (
                   <div className="flex items-center gap-2">
                      <Timer size={14} className="text-accent-amber" />
                      <span className="text-xs font-black text-white uppercase tracking-widest">Timed Operation</span>
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="glass-card p-1 border-white/5 bg-dark-900 shadow-2xl relative">
             <div className="absolute top-0 left-0 right-0 h-1 z-10 bg-dark-950/50 backdrop-blur-md rounded-t-xl overflow-hidden">
                <motion.div 
                   animate={{ width: `${pct}%` }}
                   className={`h-full ${barColor} shadow-glow`} 
                />
             </div>
             <textarea 
               value={text} 
               onChange={e => setText(e.target.value)}
               placeholder="Transmit your composition here..."
               className="w-full bg-transparent border-none focus:ring-0 min-h-[450px] p-10 font-medium text-lg leading-relaxed text-slate-200 placeholder-slate-700 resize-none"
             />
             <div className="flex justify-between items-center p-6 bg-dark-950/40 border-t border-white/5 rounded-b-[24px]">
                <div className="flex gap-6">
                   <div className="text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">WORD COUNT</p>
                      <p className="text-lg font-black text-white">{wordCount}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">TARGET</p>
                      <p className="text-lg font-black text-white">{pct.toFixed(0)}%</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <button onClick={handleImprove} disabled={improving || !text.trim()} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5">
                      <Wand2 size={20} />
                   </button>
                   <button onClick={handleSuggestIdea} disabled={museLoading || !text.trim()} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary-400 hover:text-white transition-all border border-primary-500/20">
                      <Sparkles size={20} />
                   </button>
                   <button 
                      onClick={handleSubmit} 
                      disabled={loading || wordCount < (prompt.minWords || 30)} 
                      className="btn-primary py-3 px-10 text-[10px] font-black uppercase tracking-widest shadow-glow flex items-center gap-3"
                   >
                      {loading ? "Decrypting..." : <><Send size={16} /> Commit Composition</>}
                   </button>
                </div>
             </div>
          </div>

          <AnimatePresence>
            {improveResult && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="glass-card p-8 border-accent-emerald/20 bg-accent-emerald/5 relative overflow-hidden"
               >
                 <div className="flex items-center gap-3 text-accent-emerald font-black text-[10px] uppercase tracking-widest mb-4">
                   <Wand2 size={16} />
                   <span>Neural Recalibration</span>
                 </div>
                 <p className="text-white text-lg font-medium mb-4 italic leading-relaxed">"{improveResult.improved}"</p>
                 <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">{improveResult.explanation}</p>
                 <div className="flex gap-3">
                   <button onClick={applyImprovement} className="btn-primary py-3 px-6 text-[10px] font-black uppercase tracking-widest shadow-glow">Integrate</button>
                   <button onClick={() => setImproveResult(null)} className="btn-ghost py-3 px-6 text-[10px] font-black uppercase tracking-widest border-white/5">Abort</button>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {museSuggestions && (
              <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="glass-card p-8 border-primary-500/20 bg-primary-500/5"
              >
                <div className="flex items-center gap-3 text-primary-400 font-black text-[10px] uppercase tracking-widest mb-6">
                   <Sparkles size={16} />
                   <span>Muse Protocol: Ideas & Directions</span>
                </div>
                <div className="grid grid-cols-1 gap-3 mb-8">
                  {museSuggestions.suggestions.map((s, i) => (
                    <button key={i} onClick={() => applySuggestion(s)} className="text-left p-5 rounded-2xl bg-dark-950/50 hover:bg-primary-500/10 border border-white/5 text-sm text-slate-300 transition-all font-medium leading-relaxed">
                      "{s}"
                    </button>
                  ))}
                </div>
                <button onClick={() => setMuseSuggestions(null)} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Abort Muse</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!focusMode && (
          <div className="space-y-6">
            <div className="glass-card p-8 border-white/5 bg-dark-900/40">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Maximize2 size={12} className="text-primary-400" /> Syntactic Connectors
               </h3>
               <div className="flex flex-wrap gap-2">
                 {connectors.map(p => (
                   <button 
                      key={p} 
                      onClick={() => setText(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + p + ' ')} 
                      className="text-[10px] font-black uppercase tracking-tight bg-dark-950 hover:bg-primary-500/20 px-3 py-2 rounded-xl text-slate-400 border border-white/5 hover:border-primary-500/30 transition-all"
                   >
                      {p}
                   </button>
                 ))}
               </div>
            </div>

            <div className="glass-card p-8 border-white/5 bg-dark-900/40">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={12} className="text-primary-400" /> Operational Metrics
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sentences</span>
                     <span className="text-lg font-black text-white">{text.split(/[.!?]+/).filter(s => s.trim()).length}</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center px-1">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Characters</span>
                     <span className="text-lg font-black text-white">{text.length}</span>
                  </div>
               </div>
            </div>

            <div className="glass-card p-8 border-white/5 bg-dark-900/40">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Lightbulb size={12} className="text-accent-amber" /> Neural Tip
               </h3>
               <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Focus on varied sentence structures. Start sentences with adverbial phrases to increase your complexity score.
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
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up pb-20">
      <div className="glass-card p-10 bg-gradient-to-br from-primary-500/10 to-transparent border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full -mr-24 -mt-24" />
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative z-10">
          <div className="flex-1 space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow" />
                <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Post-Mission Intelligence</span>
             </div>
             <h2 className="text-4xl font-display font-bold text-white tracking-tight leading-tight">Composition Assessment</h2>
             <p className="text-slate-400 text-lg font-medium leading-relaxed italic">"{evaluation.feedback}"</p>
             <div className="flex gap-4 pt-4">
                <div className="flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 px-4 py-2 rounded-2xl">
                   <Zap size={14} className="text-primary-400" />
                   <span className="text-xs font-black text-primary-400">+{xpEarned} XP</span>
                </div>
                <div className="flex items-center gap-2 bg-accent-amber/10 border border-accent-amber/20 px-4 py-2 rounded-2xl">
                   <Trophy size={14} className="text-accent-amber" />
                   <span className="text-xs font-black text-accent-amber">+{coinsEarned} CR</span>
                </div>
             </div>
          </div>
          <div className="text-center shrink-0 flex flex-col items-center">
             <div className="relative mb-4">
                <svg width="120" height="120" className="-rotate-90">
                   <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                   <motion.circle 
                      initial={{ strokeDashoffset: 314 }}
                      animate={{ strokeDashoffset: 314 - (evaluation.overallScore / 100) * 314 }}
                      transition={{ duration: 1.5 }}
                      cx="60" cy="60" r="50" stroke="#8b5cf6" strokeWidth="8" fill="none"
                      strokeDasharray="314"
                      strokeLinecap="round" 
                      className="shadow-glow"
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-3xl font-black text-white">{evaluation.overallScore}%</span>
                </div>
             </div>
             <div className="bg-dark-950 border border-white/5 px-4 py-1.5 rounded-full">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CEFR: <span className="text-primary-400">{evaluation.cefr}</span></span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="glass-card p-8 border-white/5 bg-dark-900/40">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
              <BarChart2 size={14} className="text-primary-400" /> Neural Metrics
           </h3>
           <ScoreBar label="Syntactic Grammar" value={evaluation.grammarScore} color="bg-primary-500" />
           <ScoreBar label="Lexical Complexity" value={evaluation.vocabularyScore} color="bg-accent-indigo" />
           <ScoreBar label="Structural Coherence" value={evaluation.coherenceScore} color="bg-accent-emerald" />
         </div>
         <div className="glass-card p-8 md:col-span-2 border-white/5 bg-dark-900/40">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Shield size={14} className="text-primary-400" /> Strategic Intelligence
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             <div className="space-y-4">
                <p className="text-[10px] font-black text-accent-emerald uppercase tracking-widest px-2">Strengths</p>
                <ul className="space-y-3">
                   {evaluation.strengths.map((s, i) => (
                     <li key={i} className="text-xs text-slate-300 font-bold flex items-start gap-3">
                        <CheckCircle size={14} className="text-accent-emerald shrink-0 mt-0.5" />
                        <span>{s}</span>
                     </li>
                   ))}
                </ul>
             </div>
             <div className="space-y-4">
                <p className="text-[10px] font-black text-accent-amber uppercase tracking-widest px-2">Improvements</p>
                <ul className="space-y-3">
                   {evaluation.improvements.map((s, i) => (
                     <li key={i} className="text-xs text-slate-300 font-bold flex items-start gap-3">
                        <ArrowLeft size={14} className="text-accent-amber rotate-180 shrink-0 mt-0.5" />
                        <span>{s}</span>
                     </li>
                   ))}
                </ul>
             </div>
           </div>
         </div>
      </div>

      <div className="glass-card border-white/5 bg-dark-900/40 overflow-hidden">
        <button onClick={() => setShowCorrected(!showCorrected)} className="flex items-center justify-between w-full p-8 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-accent-emerald/10 rounded-xl flex items-center justify-center text-accent-emerald border border-accent-emerald/20">
                <CheckCircle size={20} />
             </div>
             <h3 className="text-lg font-display font-bold text-white tracking-tight">Recalibrated Version</h3>
          </div>
          {showCorrected ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
        </button>
        <AnimatePresence>
           {showCorrected && (
             <motion.div 
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
             >
                <div className="p-10 pt-0">
                   <div className="bg-dark-950 p-10 rounded-3xl border border-white/5 text-slate-200 text-lg leading-relaxed font-medium whitespace-pre-wrap shadow-inner">
                      {evaluation.correctedText}
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>

      <div className="glass-card border-white/5 bg-dark-900/40 overflow-hidden">
        <button onClick={() => setShowModel(!showModel)} className="flex items-center justify-between w-full p-8 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-400 border border-primary-500/20">
                <BookOpen size={20} />
             </div>
             <h3 className="text-lg font-display font-bold text-white tracking-tight">Ideal Model Protocol</h3>
          </div>
          {showModel ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
        </button>
        <AnimatePresence>
           {showModel && (
             <motion.div 
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
             >
                <div className="p-10 pt-0">
                   <div className="bg-dark-950 p-10 rounded-3xl border border-white/5 text-slate-200 text-lg leading-relaxed font-medium italic shadow-inner">
                      {evaluation.modelAnswer}
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>

      <div className="flex gap-6 pt-10">
        <button onClick={onBack} className="btn-ghost flex-1 py-5 flex items-center justify-center gap-3 rounded-2xl font-black text-xs uppercase tracking-widest border-white/5">
           <RotateCcw size={18} /> Roadmap Nexus
        </button>
        <button onClick={onRedo} className="btn-primary flex-1 py-5 flex items-center justify-center gap-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-glow">
           <RefreshCw size={18} /> Re-Initiate
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
    } catch { toast.error("Communication error."); }
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
    } catch { toast.error("Lesson generation failed."); }
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
      <div className="flex flex-col items-center justify-center h-[70vh] gap-8">
        <div className="relative">
          <div className="w-24 h-24 border-[6px] border-white/5 rounded-full" />
          <div className="w-24 h-24 border-[6px] border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          <Sparkles size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-500 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
           <p className="text-2xl font-display font-bold text-white tracking-tight">Syncing Mission Data</p>
           <p className="text-slate-500 font-medium">Neural engine hand-picking your next composition challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {reward && phase === 'feedback' && <XPReward {...reward} onClose={() => setReward(null)} />}

      {phase === 'roadmap' && (
        <WritingRoadmap 
          library={library} 
          onSelectLesson={handleSelectLesson} 
          completedCount={completedCount} 
        />
      )}

      {phase === 'editor' && selectedLesson && promptData && (
        <WritingEditor 
          lesson={selectedLesson} 
          prompt={promptData} 
          onSubmit={handleSubmit} 
          onBack={() => setPhase('roadmap')} 
        />
      )}

      {phase === 'feedback' && result && (
        <FeedbackReport 
          result={result} 
          onRedo={() => setPhase('editor')} 
          onBack={() => { setPhase('roadmap'); setResult(null); setReward(null); }} 
        />
      )}
    </div>
  );
}