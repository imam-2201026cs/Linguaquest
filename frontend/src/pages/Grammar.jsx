import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Send, AlertTriangle, Check, RefreshCw, Zap, BookOpen,
  ChevronRight, XCircle, CheckCircle, Clock, Lightbulb, Shield, HelpCircle, Trophy,
  Sparkles, Target, Activity, Wand2, Info, ArrowLeft, MoreHorizontal, MessageSquare
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
  if (!errors || errors.length === 0) return <p className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{originalText}</p>;
  
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
          <span key={Math.random()} className="mx-1 inline-flex items-center gap-2 bg-dark-950/80 rounded-xl px-2.5 py-1 border border-white/5 shadow-inner">
            <del className="text-accent-rose decoration-accent-rose/50 no-underline opacity-50">{err.original}</del>
            <span className="text-slate-600 text-[10px] font-black tracking-widest">→</span>
            <ins className="text-accent-emerald no-underline font-black">{err.correction}</ins>
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

  return <p className="text-sm md:text-base leading-loose whitespace-pre-wrap font-medium text-slate-300">{parts}</p>;
}

export default function Grammar() {
  const [mode, setMode] = useState('checker'); // 'checker' | 'quiz'
  const { user, fetchProfile } = useAuth();
  
  // Daily tip
  const tipOfDay = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];

  // Checker state
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [expandedRules, setExpandedRules] = useState({});
  const [prevScore, setPrevScore] = useState(null);

  // Quiz state
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

  /* ── Checker Logic ── */
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

  /* ── Quiz Logic ── */
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
    toast.success('Linguistic noise reduced.');
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
    <div className="space-y-10 pb-20">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 animate-slide-up">
        <div className="flex-1">
           <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-amber">Syntactic Shield</span>
              <div className="h-px w-8 bg-accent-amber/30" />
           </div>
           <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Grammar <span className="shimmer-text">Nexus</span></h1>
           <p className="text-slate-400 text-lg mt-2 font-medium">Neural error detection & competitive linguistics.</p>
        </div>

        <div className="glass-card p-6 border-accent-amber/20 bg-accent-amber/5 max-w-sm w-full relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-accent-amber/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-accent-amber mb-2 text-[10px] font-black uppercase tracking-widest">
                 <Lightbulb size={12} className="animate-pulse" /> Neural Insight
              </div>
              <p className="text-sm text-slate-300 italic font-medium leading-relaxed">"{tipOfDay}"</p>
           </div>
        </div>
      </div>

      {/* Mode Navigation */}
      <div className="flex p-1.5 bg-dark-900/50 rounded-[24px] border border-white/5 gap-1.5 backdrop-blur-xl animate-slide-up">
        <button 
          onClick={() => setMode('checker')} 
          className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${mode === 'checker' ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200'}`}
        >
          <Wand2 size={14}/> Analysis Protocol
        </button>
        <button 
          onClick={() => setMode('quiz')} 
          className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${mode === 'quiz' ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200'}`}
        >
          <Activity size={14}/> Competitive Sprint
        </button>
      </div>

      {/* ── CHECKER MODE ── */}
      {mode === 'checker' && (
        <div className="space-y-8 animate-slide-up">
          <div className="glass-card p-1 border-white/5 bg-dark-900 shadow-2xl relative">
             <div className="p-8 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TRANSMISSION INPUT</p>
                   <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">{text.trim().split(/\s+/).filter(Boolean).length} WORDS</span>
                </div>
                <textarea
                  value={text}
                  onChange={e => { setText(e.target.value); setResult(null); setPrevScore(null); }}
                  placeholder="Paste your linguistic composition for neural analysis..."
                  className="w-full bg-transparent border-none focus:ring-0 min-h-[220px] p-6 font-medium text-lg leading-relaxed text-slate-200 placeholder-slate-700 resize-none"
                />
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Seed Protocols (Examples)</p>
                  <div className="flex flex-wrap gap-2 px-1">
                    {EXAMPLE_TEXTS.map((ex, i) => (
                      <button key={i} onClick={() => { setText(ex); setResult(null); setPrevScore(null); }}
                        className="text-[10px] font-black uppercase tracking-tight bg-dark-950 border border-white/5 rounded-xl px-4 py-2.5 text-slate-500 hover:text-white hover:border-white/10 transition-all">
                        Sample {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
             <div className="p-4 bg-dark-950/40 border-t border-white/5 rounded-b-[24px]">
                <button onClick={() => handleCheck()} disabled={loading || !text.trim()} className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-glow">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={16} /> Execute Neural Scan</>}
                </button>
             </div>
          </div>

          {result && (
            <div className="space-y-8 animate-slide-up pb-10">
              {/* Score Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-1 glass-card p-8 border-white/5 bg-dark-900/40 text-center flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Accuracy</p>
                    <div className="relative mb-4">
                       <svg width="100" height="100" className="-rotate-90">
                          <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                          <motion.circle 
                             initial={{ strokeDashoffset: 283 }}
                             animate={{ strokeDashoffset: 283 - (result.overallScore / 100) * 283 }}
                             transition={{ duration: 1.5 }}
                             cx="50" cy="50" r="45" stroke={result.overallScore >= 80 ? '#10b981' : '#f59e0b'} strokeWidth="6" fill="none"
                             strokeDasharray="283"
                             strokeLinecap="round" 
                             className="shadow-glow"
                          />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white">
                          {result.overallScore}%
                       </div>
                    </div>
                    {prevScore && <span className="text-[10px] font-black text-accent-emerald uppercase animate-pulse">+{result.overallScore - prevScore}% Improvement</span>}
                 </div>

                 <div className="md:col-span-2 glass-card p-10 border-white/5 bg-dark-900/40">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-display font-bold text-white tracking-tight">Decoded composition</h3>
                       <div className="flex items-center gap-2 bg-dark-950 px-3 py-1 rounded-full border border-white/5">
                          <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest">{result.errors?.length || 0} Flags Found</span>
                       </div>
                    </div>
                    <div className="p-8 bg-dark-950 rounded-3xl border border-white/5 shadow-inner">
                       <InlineDiff originalText={text} errors={result.errors} />
                    </div>
                    {result.hasErrors && (
                      <button onClick={() => handleCheck(result.correctedText)} className="btn-primary w-full mt-8 py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-glow">
                        <RefreshCw size={16} /> Normalize & Re-Scan
                      </button>
                    )}
                 </div>
              </div>

              {/* Error Breakdown */}
              {result.errors?.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                       <AlertTriangle size={20} className="text-accent-amber" /> Neural Flags
                    </h3>
                    <div className="flex gap-2">
                      {categories.map(c => (
                        <button key={c} onClick={() => setFilterType(c)}
                          className={`text-[9px] px-4 py-1.5 rounded-full border font-black uppercase tracking-widest transition-all ${filterType === c ? 'bg-primary-500 border-primary-500 text-white shadow-glow' : 'border-white/10 text-slate-500 hover:text-white'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {filteredErrors.map((err, i) => (
                      <div key={i} className={`glass-card p-8 border-white/5 bg-dark-900/40 relative overflow-hidden group ${SEVERITY_COLORS[err.severity] || SEVERITY_COLORS.medium}`}>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest ${SEVERITY_BADGE[err.severity] || SEVERITY_BADGE.medium}`}>{err.type}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest capitalize">{err.severity} Priority</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-6 flex-wrap bg-dark-950/50 p-4 rounded-2xl border border-white/5">
                          <span className="line-through text-accent-rose font-medium opacity-50 px-2 text-lg">"{err.original}"</span>
                          <ChevronRight size={16} className="text-slate-600" />
                          <span className="text-accent-emerald font-black px-2 text-lg">"{err.correction}"</span>
                        </div>
                        
                        <p className="text-sm text-slate-400 leading-relaxed font-medium mb-6 italic">"{err.explanation}"</p>
                        
                        {err.ruleExamples && err.ruleExamples.length > 0 && (
                          <div className="space-y-4">
                            <button onClick={() => setExpandedRules(p => ({ ...p, [i]: !p[i] }))} className="text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-white flex items-center gap-2 transition-all">
                              <BookOpen size={14} /> {expandedRules[i] ? 'Minimize Protocol' : 'Learn Domain Rule'}
                            </button>
                            <AnimatePresence>
                               {expandedRules[i] && (
                                 <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-6 bg-dark-950 rounded-2xl border border-white/5 space-y-3"
                                 >
                                   <p className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em] mb-2">Authenticated Usage Patterns</p>
                                   {err.ruleExamples.map((ex, j) => (
                                     <div key={j} className="text-sm text-slate-300 flex items-center gap-3 font-medium">
                                       <div className="w-5 h-5 rounded-lg bg-accent-emerald/10 flex items-center justify-center text-accent-emerald text-[10px]">✓</div>
                                       <span>{ex}</span>
                                     </div>
                                   ))}
                                 </motion.div>
                               )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ MODE ── */}
      {mode === 'quiz' && (
        <div className="space-y-8 animate-slide-up">
          {!quiz && (
            <div className="glass-card p-12 text-center flex flex-col items-center border-white/5 bg-dark-900/40 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full -mr-24 -mt-24" />
               <div className="w-20 h-20 bg-dark-950 rounded-[24px] flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                  <Activity size={32} className="text-primary-500 shadow-glow" />
               </div>
               <h3 className="text-3xl font-display font-bold text-white tracking-tight mb-2">Linguistic Combat</h3>
               <p className="text-slate-400 text-lg font-medium mb-10 max-w-sm leading-relaxed">30s limit. Sequential precision required. Multipliers active for streaks.</p>
               
               <div className="flex justify-center gap-3 mb-10">
                 {['beginner', 'intermediate', 'advanced'].map(l => (
                   <button key={l} onClick={() => setQuizLevel(l)}
                     className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${quizLevel === l ? 'bg-primary-500 border-primary-500 text-white shadow-glow' : 'bg-dark-950 border-white/5 text-slate-500 hover:text-white'}`}>
                     {l}
                   </button>
                 ))}
               </div>
               <button onClick={generateQuiz} disabled={loading} className="btn-primary w-full max-w-sm py-5 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-glow">
                 {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <> Initiate Quiz Protocol</>}
               </button>
               
               {localStorage.getItem('lq_best_quiz') && (
                 <div className="mt-10 pt-6 border-t border-white/5 w-full">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Operational Best</p>
                    <p className="text-2xl font-black text-white mt-1">{localStorage.getItem('lq_best_quiz')} <span className="text-primary-400 text-sm">XP</span></p>
                 </div>
               )}
            </div>
          )}

          {quiz && !quizSubmitted && (
            <div className="glass-card p-10 animate-slide-up border-white/5 bg-dark-900/40">
              {/* Quiz Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                  <div className={`flex items-center gap-3 font-black text-2xl ${timeLeft <= 10 ? 'text-accent-rose animate-pulse' : 'text-white'}`}>
                    <Clock size={24} /> 00:{String(timeLeft).padStart(2, '0')}
                  </div>
                  <AnimatePresence>
                     {streakCount >= 2 && (
                        <motion.div 
                           initial={{ scale: 0, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           className="text-[10px] bg-primary-500/20 text-primary-400 border border-primary-500/20 px-4 py-1.5 rounded-full font-black flex items-center gap-2 tracking-[0.2em]"
                        >
                           <Zap size={12} className="fill-primary-400"/> MULTIPLIER 2X
                        </motion.div>
                     )}
                  </AnimatePresence>
                </div>
                <div className="flex gap-3">
                  <button onClick={useFiftyFifty} disabled={lifelines.fiftyFifty <= 0} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${lifelines.fiftyFifty > 0 ? 'bg-dark-950 border border-white/5 text-slate-400 hover:text-white' : 'opacity-20 grayscale cursor-not-allowed'}`}>
                    <Shield size={20} />
                  </button>
                  <button onClick={useAskAI} disabled={lifelines.askAI <= 0} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${lifelines.askAI > 0 ? 'bg-dark-950 border border-white/5 text-slate-400 hover:text-white' : 'opacity-20 grayscale cursor-not-allowed'}`}>
                    <HelpCircle size={20} />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="h-1.5 bg-dark-950 rounded-full overflow-hidden mb-10 p-0.5 border border-white/5">
                <motion.div 
                   animate={{ width: `${((currentQ + (Object.keys(quizAnswers).length > currentQ ? 1 : 0)) / quiz.questions.length) * 100}%` }}
                   className="h-full bg-primary-500 rounded-full shadow-glow" 
                />
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                 <motion.div 
                    key={currentQ}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                 >
                   <div className="space-y-3">
                      <p className="text-[10px] text-primary-400 font-black uppercase tracking-[0.2em]">{quiz.questions[currentQ].topic}</p>
                      <h3 className="text-2xl font-display font-bold text-white tracking-tight leading-relaxed">{quiz.questions[currentQ].question}</h3>
                   </div>
                   
                   <AnimatePresence>
                      {showHint && quiz.questions[currentQ].hint && (
                        <motion.div 
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: 'auto', opacity: 1 }}
                           className="text-sm text-accent-amber bg-accent-amber/5 border border-accent-amber/10 p-5 rounded-2xl flex items-start gap-3 font-medium italic"
                        >
                          <Lightbulb size={18} className="shrink-0 mt-0.5 text-accent-amber shadow-glow" /> 
                          <span>"{quiz.questions[currentQ].hint}"</span>
                        </motion.div>
                      )}
                   </AnimatePresence>

                   <div className="grid grid-cols-1 gap-4">
                     {quiz.questions[currentQ].options.map((opt, oi) => {
                       if (hiddenOptions.includes(oi)) return null;
                       
                       const state = quizAnswers[currentQ];
                       const isSelected = state?.ansIdx === oi;
                       const isCorrect = state !== undefined && oi === quiz.questions[currentQ].correct;
                       const isWrong = state !== undefined && isSelected && !state.isCorrect;

                       return (
                         <motion.button 
                            key={oi} 
                            whileHover={!state ? { scale: 1.02 } : {}}
                            onClick={() => !state && handleQuizNext(oi)} 
                            disabled={!!state}
                            className={`w-full text-left p-6 rounded-3xl border transition-all flex items-center gap-6 ${
                              isCorrect ? 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald shadow-glow' :
                              isWrong ? 'border-accent-rose bg-accent-rose/10 text-accent-rose shadow-glow' :
                              'border-white/5 bg-dark-950 text-slate-400 hover:border-primary-500/50 hover:bg-white/5'
                            }`}
                         >
                           <div className={`w-10 h-10 rounded-2xl border border-current flex items-center justify-center text-xs font-black shrink-0 transition-all ${state ? 'bg-white/10' : ''}`}>
                             {String.fromCharCode(65 + oi)}
                           </div>
                           <span className="flex-1 text-base font-bold tracking-tight">{opt}</span>
                           {isCorrect && (
                              <div className="flex flex-col items-end">
                                 <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                 {state.timeBonus > 0 && <span className="text-[9px] font-black text-accent-amber uppercase mt-1">+{state.timeBonus} Time</span>}
                                 {state.streakBonus > 0 && <span className="text-[9px] font-black text-primary-400 uppercase mt-0.5">+{state.streakBonus} Multiplier</span>}
                              </div>
                           )}
                           {isWrong && <XCircle size={20} className="text-accent-rose" />}
                         </motion.button>
                       );
                     })}
                   </div>
                 </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Quiz Results */}
          {quizSubmitted && quizStats && (
            <div className="glass-card p-12 text-center border-white/5 bg-dark-900/40 animate-slide-up flex flex-col items-center">
               <div className="w-24 h-24 bg-dark-950 rounded-[32px] flex items-center justify-center mb-8 border border-white/5 shadow-inner relative group overflow-hidden">
                  <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors" />
                  <Trophy size={48} className="text-primary-400 shadow-glow relative z-10" />
               </div>
               <h2 className="text-4xl font-display font-bold text-white tracking-tight mb-2">Sprint Deciphered</h2>
               <div className="text-6xl font-black text-primary-400 mb-10 tracking-tight shimmer-text">
                 {Object.values(quizAnswers).reduce((sum, a) => sum + a.xp, 0)} <span className="text-2xl text-slate-600">XP</span>
               </div>
               
               <div className="w-full max-w-sm space-y-3 mb-12">
                 <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] text-center mb-4">Neural Topic Performance</p>
                 {Object.entries(quizStats).map(([topic, stats]) => (
                   <div key={topic} className="flex items-center justify-between bg-dark-950/50 p-4 rounded-2xl border border-white/5 transition-transform hover:scale-105">
                     <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{topic}</span>
                     <div className="flex items-center gap-3">
                       <span className="text-sm font-black text-white">{stats.c}<span className="text-slate-700 mx-1">/</span>{stats.t}</span>
                       {stats.c === stats.t ? <CheckCircle size={16} className="text-accent-emerald"/> : 
                        stats.c > 0 ? <Activity size={16} className="text-accent-amber"/> : 
                        <XCircle size={16} className="text-accent-rose"/>}
                     </div>
                   </div>
                 ))}
               </div>

               <button onClick={() => { setQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); }} className="btn-primary w-full max-w-xs py-5 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-glow">
                 <RefreshCw size={18} /> Re-Initiate Sprint
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
