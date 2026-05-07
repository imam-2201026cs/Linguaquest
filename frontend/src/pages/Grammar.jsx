// Premium Grammar Nexus Overhaul - Syntactic Shield Edition
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Send, AlertTriangle, Check, RefreshCw, Zap, BookOpen,
  ChevronRight, XCircle, CheckCircle, Clock, Lightbulb, Shield, HelpCircle, Trophy,
  Sparkles, Target, Activity, Wand2, Info, ArrowLeft, MoreHorizontal, MessageSquare,
  Terminal, Cpu, BarChart2, ShieldCheck, ZapOff
} from 'lucide-react';
import XPReward from '../components/XPReward';
import { useAuth } from '../context/AuthContext';

const DAILY_TIPS = [
  "Use 'who' for people and 'which' for things.",
  "Your vs. You're: 'Your' shows possession, 'You're' means 'you are'.",
  "Its vs. It's: 'Its' is possessive, 'It's' means 'it is'.",
  "Then vs. Than: Use 'then' for time, 'than' for comparisons.",
  "Affect is usually a verb, Effect is usually a noun.",
  "Use 'fewer' for countable things, 'less' for uncountable.",
  "Their = belonging to them, There = a place, They're = they are."
];

const SEVERITY_COLORS = { high: 'border-accent-rose/30 bg-accent-rose/5', medium: 'border-accent-amber/30 bg-accent-amber/5', low: 'border-primary-500/30 bg-primary-500/5' };
const SEVERITY_BADGE = { high: 'text-accent-rose bg-accent-rose/10', medium: 'text-accent-amber bg-accent-amber/10', low: 'text-primary-400 bg-primary-500/10' };

/* ── Inline Diff View ── */
function InlineDiff({ originalText, errors }) {
  if (!errors || errors.length === 0) return <p className="text-slate-200 leading-relaxed whitespace-pre-wrap font-medium text-lg">{originalText}</p>;
  
  let parts = [originalText];
  errors.forEach(err => {
    if (!err.original || !err.correction) return;
    const newParts = [];
    parts.forEach(part => {
      if (typeof part !== 'string') { newParts.push(part); return; }
      const idx = part.indexOf(err.original);
      if (idx !== -1) {
        if (idx > 0) newParts.push(part.slice(0, idx));
        newParts.push(
          <span key={Math.random()} className="mx-2 inline-flex items-center gap-3 bg-dark-950/80 rounded-2xl px-4 py-2 border border-white/5 shadow-inner">
            <del className="text-accent-rose decoration-accent-rose/50 no-underline opacity-50 font-medium">"{err.original}"</del>
            <span className="text-slate-600 text-[10px] font-black tracking-widest">→</span>
            <ins className="text-accent-emerald no-underline font-black">"{err.correction}"</ins>
          </span>
        );
        const rem = part.slice(idx + err.original.length);
        if (rem) newParts.push(rem);
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });

  return <p className="text-lg md:text-xl leading-[2.5] whitespace-pre-wrap font-medium text-slate-300">{parts}</p>;
}

export default function Grammar() {
  const [mode, setMode] = useState('checker'); // 'checker' | 'quiz'
  const { user, fetchProfile } = useAuth();
  
  const tipOfDay = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [expandedRules, setExpandedRules] = useState({});
  const [prevScore, setPrevScore] = useState(null);

  const [quiz, setQuiz] = useState(null);
  const [quizLevel, setQuizLevel] = useState('intermediate');
  const [currentQ, setCurrentQ] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStats, setQuizStats] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [streakCount, setStreakCount] = useState(0);
  const [lifelines, setLifelines] = useState({ fiftyFifty: 1, askAI: 1 });
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef(null);

  const handleCheck = async (recheckText = null) => {
    const txt = recheckText || text;
    if (!txt.trim()) return toast.error('Enter a linguistic string to analyze.');
    setLoading(true);
    if (result) setPrevScore(result.overallScore);
    
    try {
      const { data } = await axios.post('/api/grammar/check', { text: txt });
      setResult(data);
      if (recheckText) setText(recheckText);
      setReward({ xp: data.xpEarned, coins: data.coinsEarned, score: data.overallScore });
      await fetchProfile();
    } catch (err) { toast.error('Neural analysis failed.'); }
    finally { setLoading(false); }
  };

  const categories = ['All', ...new Set((result?.errors || []).map(e => e.type))];
  const filteredErrors = (result?.errors || []).filter(e => filterType === 'All' || e.type === filterType);

  const generateQuiz = async () => {
    setLoading(true); setQuizAnswers({}); setQuizSubmitted(false); setQuizStats(null);
    setCurrentQ(0); setStreakCount(0); setLifelines({ fiftyFifty: 1, askAI: 1 });
    setHiddenOptions([]); setShowHint(false); clearInterval(timerRef.current);
    try {
      const { data } = await axios.post('/api/grammar/quiz/generate', { level: quizLevel });
      setQuiz(data);
      startTimer();
    } catch { toast.error('Failed to initiate quiz protocol.'); }
    finally { setLoading(false); }
  };

  const startTimer = () => {
    setTimeLeft(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleQuizNext(null); return 30; }
        return t - 1;
      });
    }, 1000);
  };

  const useFiftyFifty = () => {
    if (lifelines.fiftyFifty <= 0 || hiddenOptions.length > 0) return;
    const q = quiz.questions[currentQ];
    const wrongs = q.options.map((_, i) => i).filter(i => i !== q.correct);
    const hide = wrongs.sort(() => 0.5 - Math.random()).slice(0, 2);
    setHiddenOptions(hide);
    setLifelines(l => ({ ...l, fiftyFifty: 0 }));
    toast.success('Linguistic noise reduced.', { icon: '🛡️' });
  };

  const useAskAI = () => {
    if (lifelines.askAI <= 0) return;
    setShowHint(true);
    setLifelines(l => ({ ...l, askAI: 0 }));
    toast('Neural hint revealed.', { icon: '🤖' });
  };

  const handleQuizNext = (ansIdx) => {
    clearInterval(timerRef.current);
    const q = quiz.questions[currentQ];
    const isCorrect = ansIdx === q.correct;
    
    const timeBonus = isCorrect && timeLeft > 15 ? 5 : 0;
    const streakBonus = isCorrect && streakCount >= 2 ? 10 : 0;
    
    setQuizAnswers(p => ({ 
      ...p, 
      [currentQ]: { ansIdx, isCorrect, xp: (isCorrect ? 10 : 0) + timeBonus + streakBonus, timeBonus, streakBonus } 
    }));

    if (isCorrect) {
      setStreakCount(s => s + 1);
      if (streakCount >= 2) toast.success('🔥 Neural Streak Multiplier!');
    } else {
      setStreakCount(0);
    }

    if (currentQ < quiz.questions.length - 1) {
      setTimeout(() => {
        setCurrentQ(c => c + 1);
        setHiddenOptions([]);
        setShowHint(false);
        startTimer();
      }, 1200);
    } else {
      setTimeout(finishQuiz, 1200);
    }
  };

  const finishQuiz = () => {
    setQuizSubmitted(true);
    let totalXp = 0;
    const topicStats = {};
    let correctCount = 0;

    Object.keys(quizAnswers).forEach(idx => {
      const q = quiz.questions[idx];
      const ans = quizAnswers[idx];
      totalXp += ans.xp;
      if (ans.isCorrect) correctCount++;
      if (!topicStats[q.topic]) topicStats[q.topic] = { c: 0, t: 0 };
      topicStats[q.topic].t++;
      if (ans.isCorrect) topicStats[q.topic].c++;
    });

    setQuizStats(topicStats);
    setReward({ xp: totalXp, coins: Math.floor(totalXp / 3), score: Math.round((correctCount/5)*100) });
    fetchProfile();
    const best = parseInt(localStorage.getItem('lq_best_quiz') || '0');
    if (totalXp > best) localStorage.setItem('lq_best_quiz', totalXp.toString());
  };

  const EXAMPLE_TEXTS = [
    "Yesterday I go to the market and buyed some vegetables. It were very fresh.",
    "She don't likes to play tennis, but she enjoy swimming in the pool.",
    "The childrens was playing in park when their mother called they.",
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-slide-up pb-32 px-6">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        <div className="max-w-2xl">
           <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-amber">Syntactic Shield Matrix</span>
              <div className="h-px w-12 bg-accent-amber/30" />
           </div>
           <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none mb-4">
             Grammar <span className="shimmer-text">Nexus</span>
           </h1>
           <p className="text-slate-400 text-lg font-medium leading-relaxed">
             Neural error detection & high-fidelity linguistic combat simulation.
           </p>
        </div>

        <div className="glass-card p-8 border-accent-amber/20 bg-accent-amber/5 max-w-sm w-full relative overflow-hidden group shadow-glow-sm">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent-amber/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
           <div className="relative z-10">
              <div className="flex items-center gap-3 text-accent-amber mb-3 text-[10px] font-black uppercase tracking-[0.2em]">
                 <Lightbulb size={16} className="animate-pulse" /> Neural Insight
              </div>
              <p className="text-base text-slate-300 italic font-medium leading-relaxed">"{tipOfDay}"</p>
           </div>
        </div>
      </div>

      {/* Mode Navigation */}
      <div className="flex p-2 bg-dark-950/60 rounded-[2.5rem] border border-white/5 gap-2 backdrop-blur-3xl mx-auto max-w-2xl shadow-premium">
        <button 
          onClick={() => setMode('checker')} 
          className={`flex-1 flex items-center justify-center gap-4 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${mode === 'checker' ? 'bg-primary-500 text-white shadow-glow scale-105' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
        >
          <Wand2 size={18}/> Analysis Protocol
        </button>
        <button 
          onClick={() => setMode('quiz')} 
          className={`flex-1 flex items-center justify-center gap-4 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${mode === 'quiz' ? 'bg-primary-500 text-white shadow-glow scale-105' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
        >
          <Activity size={18}/> Competitive Sprint
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'checker' && (
          <motion.div 
            key="checker" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="glass-card p-1.5 border-white/5 bg-dark-900 shadow-premium relative group">
               <div className="p-10 space-y-8">
                  <div className="flex items-center justify-between px-2">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Transmission Vector</p>
                     <div className="flex items-center gap-3">
                        <Terminal size={14} className="text-primary-500" />
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">{text.trim().split(/\s+/).filter(Boolean).length} Units</span>
                     </div>
                  </div>
                  <textarea
                    value={text}
                    onChange={e => { setText(e.target.value); setResult(null); setPrevScore(null); }}
                    placeholder="Initiate linguistic transmission for neural scan..."
                    className="w-full bg-transparent border-none focus:ring-0 min-h-[280px] p-8 font-medium text-xl leading-relaxed text-slate-200 placeholder-slate-800 resize-none"
                  />
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] ml-2">Seed Protocols</p>
                    <div className="flex flex-wrap gap-3">
                      {EXAMPLE_TEXTS.map((ex, i) => (
                        <button key={i} onClick={() => { setText(ex); setResult(null); setPrevScore(null); }}
                          className="text-[10px] font-black uppercase tracking-[0.2em] bg-dark-950 border border-white/5 rounded-2xl px-6 py-4 text-slate-500 hover:text-white hover:border-white/20 transition-all shadow-inner">
                          Sample Sequence {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>
               <div className="p-6 bg-dark-950/60 border-t border-white/5 rounded-b-[2.4rem]">
                  <button onClick={() => handleCheck()} disabled={loading || !text.trim()} className="btn-primary w-full py-6 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-glow hover:scale-[1.02] transition-transform">
                    {loading ? <RefreshCw size={24} className="animate-spin" /> : <><Cpu size={24} /> Execute Neural Scan</>}
                  </button>
               </div>
            </div>

            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12 pb-20"
              >
                {/* Result Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   <div className="lg:col-span-4 glass-card p-12 border-white/5 bg-dark-900/40 text-center flex flex-col items-center justify-center shadow-premium relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary-500/5" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 relative z-10">Accuracy Matrix</p>
                      <div className="relative mb-8 scale-125 relative z-10">
                         <svg width="120" height="120" className="-rotate-90">
                            <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                            <motion.circle 
                               initial={{ strokeDashoffset: 339 }}
                               animate={{ strokeDashoffset: 339 - (result.overallScore / 100) * 339 }}
                               transition={{ duration: 2, ease: "circOut" }}
                               cx="60" cy="60" r="54" stroke={result.overallScore >= 80 ? '#10b981' : '#f59e0b'} strokeWidth="8" fill="none"
                               strokeDasharray="339"
                               strokeLinecap="round" 
                               className="shadow-glow"
                            />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-display font-black text-white">{result.overallScore}%</span>
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Sync Rate</span>
                         </div>
                      </div>
                      {prevScore && (
                        <div className="bg-accent-emerald/10 border border-accent-emerald/20 px-6 py-2 rounded-full relative z-10 animate-pulse">
                           <span className="text-[10px] font-black text-accent-emerald uppercase tracking-[0.2em]">+{result.overallScore - prevScore}% Optimization</span>
                        </div>
                      )}
                   </div>

                   <div className="lg:col-span-8 glass-card p-12 border-white/5 bg-dark-900/40 shadow-premium">
                      <div className="flex items-center justify-between mb-10">
                         <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase">Deciphered Signal</h3>
                         <div className="flex items-center gap-4 bg-dark-950 px-6 py-2 rounded-full border border-white/5">
                            <ShieldCheck size={16} className="text-primary-500" />
                            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">{result.errors?.length || 0} Neural Flags</span>
                         </div>
                      </div>
                      <div className="p-10 bg-dark-950/80 rounded-[2.5rem] border border-white/5 shadow-inner min-h-[200px]">
                         <InlineDiff originalText={text} errors={result.errors} />
                      </div>
                      {result.hasErrors && (
                        <button onClick={() => handleCheck(result.correctedText)} className="btn-primary w-full mt-10 py-6 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-glow">
                          <RefreshCw size={24} className="animate-spin-slow" /> Normalize & Re-Scan
                        </button>
                      )}
                   </div>
                </div>

                {/* Flags Breakdown */}
                {result.errors?.length > 0 && (
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                      <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase flex items-center gap-5">
                         <AlertTriangle size={28} className="text-accent-amber shadow-glow-sm" /> Detailed Diagnostics
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {categories.map(c => (
                          <button key={c} onClick={() => setFilterType(c)}
                            className={`text-[10px] px-6 py-2 rounded-full border font-black uppercase tracking-[0.3em] transition-all duration-500 ${filterType === c ? 'bg-primary-500 border-primary-500 text-white shadow-glow scale-105' : 'border-white/10 text-slate-600 hover:text-white hover:bg-white/5'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {filteredErrors.map((err, i) => (
                        <motion.div 
                           key={i} 
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className={`glass-card p-10 border-white/5 bg-dark-900/40 relative overflow-hidden group shadow-premium ${SEVERITY_COLORS[err.severity] || SEVERITY_COLORS.medium}`}
                        >
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-6">
                              <span className={`text-[10px] font-black px-6 py-2 rounded-2xl uppercase tracking-[0.3em] shadow-glow-sm ${SEVERITY_BADGE[err.severity] || SEVERITY_BADGE.medium}`}>{err.type}</span>
                              <div className="h-px w-8 bg-slate-800" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] capitalize">{err.severity} Priority</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8 mb-8 flex-wrap bg-dark-950/80 p-8 rounded-[2rem] border border-white/5 relative">
                            <div className="flex flex-col">
                               <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Original</span>
                               <span className="line-through text-accent-rose font-bold opacity-40 text-2xl tracking-tight">"{err.original}"</span>
                            </div>
                            <ChevronRight size={32} className="text-slate-800" />
                            <div className="flex flex-col">
                               <span className="text-[8px] font-black text-accent-emerald uppercase tracking-[0.3em] mb-2">Correction</span>
                               <span className="text-accent-emerald font-black text-2xl tracking-tight">"{err.correction}"</span>
                            </div>
                          </div>
                          
                          <p className="text-lg text-slate-400 leading-relaxed font-medium mb-10 italic border-l-4 border-white/10 pl-8">"{err.explanation}"</p>
                          
                          {err.ruleExamples && err.ruleExamples.length > 0 && (
                            <div className="space-y-6">
                              <button onClick={() => setExpandedRules(p => ({ ...p, [i]: !p[i] }))} className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em] hover:text-white flex items-center gap-4 transition-all">
                                <BookOpen size={20} /> {expandedRules[i] ? 'Minimize Domain Protocol' : 'Learn Syntactic Logic'}
                              </button>
                              <AnimatePresence>
                                 {expandedRules[i] && (
                                   <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="p-10 bg-dark-950/80 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner"
                                   >
                                     <p className="text-[10px] text-slate-700 uppercase font-black tracking-[0.4em] mb-4">Validated Linguistic Sequences</p>
                                     {err.ruleExamples.map((ex, j) => (
                                       <div key={j} className="text-base text-slate-300 flex items-center gap-5 font-bold p-4 rounded-2xl bg-white/5 border border-transparent hover:border-accent-emerald/20 transition-all">
                                         <div className="w-8 h-8 rounded-xl bg-accent-emerald/10 flex items-center justify-center text-accent-emerald text-xs border border-accent-emerald/20">✓</div>
                                         <span>{ex}</span>
                                       </div>
                                     ))}
                                   </motion.div>
                                 )}
                              </AnimatePresence>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {mode === 'quiz' && (
          <motion.div 
            key="quiz" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {!quiz && (
              <div className="glass-card p-16 text-center flex flex-col items-center border-white/5 bg-dark-900/40 relative overflow-hidden shadow-premium">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                 <div className="w-24 h-24 bg-dark-950 rounded-[2.5rem] flex items-center justify-center mb-10 border border-white/10 shadow-inner group">
                    <Activity size={48} className="text-primary-500 shadow-glow group-hover:scale-110 transition-transform" />
                 </div>
                 <h3 className="text-5xl font-display font-black text-white tracking-tighter uppercase mb-4">Linguistic Combat</h3>
                 <p className="text-slate-400 text-xl font-medium mb-12 max-w-xl leading-relaxed">
                   High-intensity syntactic stress testing. 30s temporal limit. Sequential accuracy multipliers active.
                 </p>
                 
                 <div className="flex justify-center gap-6 mb-16">
                   {['beginner', 'intermediate', 'advanced'].map(l => (
                     <button key={l} onClick={() => setQuizLevel(l)}
                       className={`px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] border transition-all duration-700 ${quizLevel === l ? 'bg-primary-500 border-primary-500 text-white shadow-glow scale-110' : 'bg-dark-950 border-white/5 text-slate-600 hover:text-white hover:bg-white/5'}`}>
                       {l}
                     </button>
                   ))}
                 </div>
                 <button onClick={generateQuiz} disabled={loading} className="btn-primary w-full max-md:max-w-md py-6 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-glow hover:scale-105 transition-transform">
                   {loading ? <RefreshCw size={24} className="animate-spin" /> : <><Terminal size={24} /> Initiate Combat Protocol</>}
                 </button>
                 
                 {localStorage.getItem('lq_best_quiz') && (
                   <div className="mt-16 pt-10 border-t border-white/5 w-full max-w-sm">
                      <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em] mb-4">Operational Best Score</p>
                      <div className="text-4xl font-display font-black text-white flex items-center justify-center gap-4">
                         {localStorage.getItem('lq_best_quiz')} <span className="text-primary-500 text-xl tracking-widest">XP SYNC</span>
                      </div>
                   </div>
                 )}
              </div>
            )}

            {quiz && !quizSubmitted && (
              <div className="glass-card p-12 border-white/5 bg-dark-900/40 shadow-premium relative">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-10">
                    <div className={`flex items-center gap-5 font-display font-black text-4xl ${timeLeft <= 10 ? 'text-accent-rose animate-pulse' : 'text-white'}`}>
                      <Clock size={32} /> 00:{String(timeLeft).padStart(2, '0')}
                    </div>
                    <AnimatePresence>
                       {streakCount >= 2 && (
                          <motion.div 
                             initial={{ scale: 0, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             className="text-[10px] bg-primary-500/20 text-primary-400 border border-primary-500/20 px-6 py-2.5 rounded-full font-black flex items-center gap-3 tracking-[0.3em] shadow-glow-sm"
                          >
                             <Zap size={16} className="fill-primary-400"/> NEURAL STREAK {streakCount}X
                          </motion.div>
                       )}
                    </AnimatePresence>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={useFiftyFifty} disabled={lifelines.fiftyFifty <= 0} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-glow-sm ${lifelines.fiftyFifty > 0 ? 'bg-dark-950 border border-white/10 text-slate-400 hover:text-white hover:border-primary-500/30' : 'opacity-20 grayscale cursor-not-allowed'}`}>
                      <Shield size={24} />
                    </button>
                    <button onClick={useAskAI} disabled={lifelines.askAI <= 0} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-glow-sm ${lifelines.askAI > 0 ? 'bg-dark-950 border border-white/10 text-slate-400 hover:text-white hover:border-accent-amber/30' : 'opacity-20 grayscale cursor-not-allowed'}`}>
                      <HelpCircle size={24} />
                    </button>
                  </div>
                </div>

                <div className="h-2 bg-dark-950 rounded-full overflow-hidden mb-12 p-0.5 border border-white/5">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${((currentQ + (Object.keys(quizAnswers).length > currentQ ? 1 : 0)) / quiz.questions.length) * 100}%` }}
                     transition={{ duration: 0.5 }}
                     className="h-full bg-primary-500 rounded-full shadow-glow" 
                  />
                </div>

                <AnimatePresence mode="wait">
                   <motion.div 
                      key={currentQ}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className="space-y-12"
                   >
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] text-primary-400 font-black uppercase tracking-[0.4em]">{quiz.questions[currentQ].topic} Protocol</span>
                           <div className="h-px flex-1 bg-white/5" />
                           <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Unit {currentQ + 1} / {quiz.questions.length}</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter leading-tight">{quiz.questions[currentQ].question}</h3>
                     </div>
                     
                     <AnimatePresence>
                        {showHint && quiz.questions[currentQ].hint && (
                          <motion.div 
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: 'auto', opacity: 1 }}
                             className="text-lg text-accent-amber bg-accent-amber/5 border border-accent-amber/20 p-8 rounded-[2.5rem] flex items-start gap-6 font-medium italic shadow-inner"
                          >
                            <Lightbulb size={28} className="shrink-0 mt-1 text-accent-amber shadow-glow" /> 
                            <span>"{quiz.questions[currentQ].hint}"</span>
                          </motion.div>
                        )}
                     </AnimatePresence>

                     <div className="grid grid-cols-1 gap-6">
                       {quiz.questions[currentQ].options.map((opt, oi) => {
                         if (hiddenOptions.includes(oi)) return (
                           <div key={oi} className="w-full p-8 rounded-[2.5rem] border border-white/5 bg-dark-950/20 opacity-20 flex items-center gap-8 italic text-slate-700">
                             <ZapOff size={24} /> Option Decrypted & Discarded
                           </div>
                         );
                         
                         const state = quizAnswers[currentQ];
                         const isSelected = state?.ansIdx === oi;
                         const isCorrect = state !== undefined && oi === quiz.questions[currentQ].correct;
                         const isWrong = state !== undefined && isSelected && !state.isCorrect;

                         return (
                           <motion.button 
                              key={oi} 
                              whileHover={!state ? { scale: 1.02, x: 10 } : {}}
                              onClick={() => !state && handleQuizNext(oi)} 
                              disabled={!!state}
                              className={`w-full text-left p-8 rounded-[2.5rem] border transition-all duration-500 flex items-center gap-8 group/opt ${
                                isCorrect ? 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald shadow-glow scale-[1.02]' :
                                isWrong ? 'border-accent-rose bg-accent-rose/10 text-accent-rose shadow-glow scale-[1.02]' :
                                'border-white/5 bg-dark-950 text-slate-400 hover:border-primary-500/50 hover:bg-white/5'
                              }`}
                           >
                             <div className={`w-14 h-14 rounded-2xl border border-current flex items-center justify-center text-lg font-display font-black shrink-0 transition-all ${state ? 'bg-white/10' : 'group-hover/opt:bg-primary-500/10'}`}>
                               {String.fromCharCode(65 + oi)}
                             </div>
                             <span className="flex-1 text-xl font-bold tracking-tight">{opt}</span>
                             {isCorrect && (
                                <div className="flex flex-col items-end animate-slide-up">
                                   <div className="flex items-center gap-2 text-accent-emerald">
                                      <CheckCircle size={24} />
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified</span>
                                   </div>
                                   <div className="flex gap-4 mt-2">
                                      {state.timeBonus > 0 && <span className="text-[9px] font-black text-accent-amber uppercase tracking-widest">+{state.timeBonus} temporal</span>}
                                      {state.streakBonus > 0 && <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest">+{state.streakBonus} streak</span>}
                                   </div>
                                </div>
                             )}
                             {isWrong && <div className="flex items-center gap-2 text-accent-rose animate-shake"><XCircle size={28} /><span className="text-[10px] font-black uppercase tracking-widest">Corrupted</span></div>}
                           </motion.button>
                         );
                       })}
                     </div>
                   </motion.div>
                </AnimatePresence>
              </div>
            )}

            {quizSubmitted && quizStats && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-16 text-center border-white/5 bg-dark-900/40 shadow-premium flex flex-col items-center relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                 <div className="w-32 h-32 bg-dark-950 rounded-[3rem] flex items-center justify-center mb-10 border border-white/10 shadow-inner relative group overflow-hidden">
                    <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors" />
                    <Trophy size={64} className="text-primary-400 shadow-glow relative z-10 animate-bounce-slow" />
                 </div>
                 <h2 className="text-5xl font-display font-black text-white tracking-tighter uppercase mb-4">Sprint Deciphered</h2>
                 <div className="text-8xl font-display font-black text-primary-400 mb-12 tracking-tighter shimmer-text">
                   {Object.values(quizAnswers).reduce((sum, a) => sum + a.xp, 0)} <span className="text-3xl text-slate-600 tracking-widest">XP SYNC</span>
                 </div>
                 
                 <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                   <div className="col-span-full mb-4">
                      <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">Neural Diagnostic Report</p>
                   </div>
                   {Object.entries(quizStats).map(([topic, stats]) => (
                     <div key={topic} className="flex items-center justify-between bg-dark-950/80 p-6 rounded-[2rem] border border-white/5 transition-all hover:scale-105 hover:bg-white/5 group shadow-inner">
                       <div className="text-left">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 block">Topic Protocol</span>
                          <span className="text-sm font-black text-white uppercase tracking-wider">{topic}</span>
                       </div>
                       <div className="flex items-center gap-5">
                         <div className="text-right">
                            <span className="text-xl font-display font-black text-white">{stats.c}</span>
                            <span className="text-slate-700 mx-1 text-lg">/</span>
                            <span className="text-slate-700 text-lg">{stats.t}</span>
                         </div>
                         {stats.c === stats.t ? <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 flex items-center justify-center text-accent-emerald shadow-glow-sm"><CheckCircle size={20}/></div> : 
                          stats.c > 0 ? <div className="w-10 h-10 rounded-xl bg-accent-amber/10 flex items-center justify-center text-accent-amber"><BarChart2 size={20}/></div> : 
                          <div className="w-10 h-10 rounded-xl bg-accent-rose/10 flex items-center justify-center text-accent-rose"><ZapOff size={20}/></div>}
                       </div>
                     </div>
                   ))}
                 </div>

                 <div className="flex gap-6 w-full max-w-xl">
                    <button onClick={() => setMode('checker')} className="btn-ghost flex-1 py-6 flex items-center justify-center gap-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] border-white/5 hover:bg-white/5">
                       <ArrowLeft size={20} /> Analysis Core
                    </button>
                    <button onClick={() => { setQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); }} className="btn-primary flex-1 py-6 flex items-center justify-center gap-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-glow scale-105 hover:scale-110 transition-transform">
                       <RefreshCw size={24} className="animate-spin-slow" /> Re-Initiate Sprint
                    </button>
                 </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
