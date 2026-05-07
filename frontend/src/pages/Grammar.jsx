import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  CheckSquare, Send, AlertTriangle, Check, RefreshCw, Zap, BookOpen,
  ChevronRight, XCircle, CheckCircle, Clock, Lightbulb, Shield, HelpCircle, Trophy
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

const SEVERITY_COLORS = { high: 'border-red-500/30 bg-red-500/5', medium: 'border-yellow-500/30 bg-yellow-500/5', low: 'border-blue-500/30 bg-blue-500/5' };
const SEVERITY_BADGE = { high: 'text-red-400 bg-red-500/10', medium: 'text-yellow-400 bg-yellow-500/10', low: 'text-blue-400 bg-blue-500/10' };

/* ── Inline Diff View ── */
function InlineDiff({ originalText, errors }) {
  if (!errors || errors.length === 0) return <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{originalText}</p>;
  
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
          <span key={Math.random()} className="mx-1 inline-flex items-center gap-1 bg-white/5 rounded px-1 border border-white/10">
            <del className="text-red-400 decoration-red-500/50">{err.original}</del>
            <span className="text-slate-500 text-[10px]">→</span>
            <ins className="text-green-400 no-underline font-medium">{err.correction}</ins>
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

  return <p className="text-sm leading-loose whitespace-pre-wrap">{parts}</p>;
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
  
  // Quiz mechanics
  const [timeLeft, setTimeLeft] = useState(30);
  const [streakCount, setStreakCount] = useState(0);
  const [lifelines, setLifelines] = useState({ fiftyFifty: 1, askAI: 1 });
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef(null);

  /* ── Checker Logic ── */
  const handleCheck = async (recheckText = null) => {
    const txt = recheckText || text;
    if (!txt.trim()) return toast.error('Enter some text to check!');
    setLoading(true);
    if (result) setPrevScore(result.overallScore);
    
    try {
      const { data } = await axios.post('/api/grammar/check', { text: txt });
      setResult(data);
      if (recheckText) setText(recheckText);
      setReward({ xp: data.xpEarned, coins: data.coinsEarned, score: data.overallScore });
      await fetchProfile();
    } catch (err) { toast.error('Check failed'); }
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
    } catch { toast.error('Failed to generate quiz'); }
    finally { setLoading(false); }
  };

  const startTimer = () => {
    setTimeLeft(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleQuizNext(null); return 30; } // Auto-skip on timeout
        return t - 1;
      });
    }, 1000);
  };

  const useFiftyFifty = () => {
    if (lifelines.fiftyFifty <= 0 || hiddenOptions.length > 0) return;
    const q = quiz.questions[currentQ];
    const wrongs = q.options.map((_, i) => i).filter(i => i !== q.correct);
    // Hide 2 random wrong options
    const hide = wrongs.sort(() => 0.5 - Math.random()).slice(0, 2);
    setHiddenOptions(hide);
    setLifelines(l => ({ ...l, fiftyFifty: 0 }));
    toast.success('Removed 2 wrong answers!');
  };

  const useAskAI = () => {
    if (lifelines.askAI <= 0) return;
    setShowHint(true);
    setLifelines(l => ({ ...l, askAI: 0 }));
    toast('AI Hint revealed!', { icon: '🤖' });
  };

  const handleQuizNext = (ansIdx) => {
    clearInterval(timerRef.current);
    const q = quiz.questions[currentQ];
    const isCorrect = ansIdx === q.correct;
    
    // Save answer & time bonus
    const timeBonus = isCorrect && timeLeft > 15 ? 5 : 0;
    const streakBonus = isCorrect && streakCount >= 2 ? 10 : 0; // 2x XP effectively
    
    setQuizAnswers(p => ({ 
      ...p, 
      [currentQ]: { ansIdx, isCorrect, xp: (isCorrect ? 10 : 0) + timeBonus + streakBonus, timeBonus, streakBonus } 
    }));

    if (isCorrect) {
      setStreakCount(s => s + 1);
      if (streakCount >= 2) toast.success('🔥 Streak Multiplier Active!');
    } else {
      setStreakCount(0);
    }

    if (currentQ < quiz.questions.length - 1) {
      setTimeout(() => {
        setCurrentQ(c => c + 1);
        setHiddenOptions([]);
        setShowHint(false);
        startTimer();
      }, 1500); // Brief pause to show correct answer
    } else {
      setTimeout(finishQuiz, 1500);
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

    // Local Leaderboard
    const best = parseInt(localStorage.getItem('lq_best_quiz') || '0');
    if (totalXp > best) localStorage.setItem('lq_best_quiz', totalXp.toString());
  };

  const EXAMPLE_TEXTS = [
    "Yesterday I go to the market and buyed some vegetables. It were very fresh.",
    "She don't likes to play tennis, but she enjoy swimming in the pool.",
    "The childrens was playing in park when their mother called they.",
  ];

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}

      {/* Header & Daily Tip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center">
            <CheckSquare size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Grammar Tools</h1>
            {user?.streak >= 5 && (
              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                🔥 Grammar Master Badge ({user.streak} days!)
              </span>
            )}
          </div>
        </div>
        <div className="bg-dark-600/50 border border-white/5 p-3 rounded-xl max-w-sm w-full">
          <div className="flex items-center gap-1.5 text-orange-400 mb-1 text-xs font-bold uppercase tracking-wider">
            <Lightbulb size={12} /> Tip of the Day
          </div>
          <p className="text-sm text-slate-300 italic">"{tipOfDay}"</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode('checker')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${mode === 'checker' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
          ✍️ Grammar Checker
        </button>
        <button onClick={() => setMode('quiz')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${mode === 'quiz' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
          🧠 Grammar Quiz
        </button>
      </div>

      {/* ── CHECKER MODE ── */}
      {mode === 'checker' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">Paste your text here</label>
              <span className="text-xs text-slate-500">{text.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setResult(null); setPrevScore(null); }}
              placeholder="Type or paste your text here to check for grammar mistakes..."
              className="input-field min-h-[160px] resize-y font-body leading-relaxed"
            />
            {/* Examples */}
            <div className="mt-3">
              <p className="text-xs text-slate-500 mb-2">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_TEXTS.map((ex, i) => (
                  <button key={i} onClick={() => { setText(ex); setResult(null); setPrevScore(null); }}
                    className="text-xs bg-dark-600 border border-white/10 rounded-lg px-3 py-1.5 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all text-left max-w-xs truncate">
                    Example {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => handleCheck()} disabled={loading || !text.trim()} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</> : <><Send size={16} /> Check Grammar</>}
            </button>
          </div>

          {result && (
            <div className="space-y-4 animate-slide-up">
              {/* Score Card */}
              <div className={`glass-card p-5 ${result.hasErrors ? 'border-yellow-500/20' : 'border-green-500/20'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">Grammar Score</h3>
                    {prevScore && <p className="text-sm text-green-400 mt-1">📈 Improved by {result.overallScore - prevScore} points!</p>}
                    {!prevScore && <p className="text-slate-400 text-sm mt-1">{result.errors?.length || 0} issue{(result.errors?.length || 0) !== 1 ? 's' : ''} found</p>}
                  </div>
                  <div className={`text-5xl font-display font-bold ${result.overallScore >= 80 ? 'text-green-400' : result.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {result.overallScore}%
                  </div>
                </div>
              </div>

              {/* Inline Diff View */}
              <div className="glass-card p-6 border-white/10">
                <h3 className="font-semibold text-white mb-4">Document Edits</h3>
                <div className="p-4 bg-dark-700/50 rounded-xl border border-white/5 font-body">
                  <InlineDiff originalText={text} errors={result.errors} />
                </div>
                {result.hasErrors && (
                  <button onClick={() => handleCheck(result.correctedText)} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                    <RefreshCw size={16} /> Apply Corrections & Recheck
                  </button>
                )}
              </div>

              {/* Errors List & Filters */}
              {result.errors?.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2"><AlertTriangle size={16} className="text-amber-400" /> Error Breakdown</h3>
                    <div className="flex gap-1">
                      {categories.map(c => (
                        <button key={c} onClick={() => setFilterType(c)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${filterType === c ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'border-white/10 text-slate-400'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredErrors.map((err, i) => (
                    <div key={i} className={`glass-card p-4 border ${SEVERITY_COLORS[err.severity] || SEVERITY_COLORS.medium}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_BADGE[err.severity] || SEVERITY_BADGE.medium}`}>{err.type}</span>
                          <span className="text-xs text-slate-500 capitalize">{err.severity} severity</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm mb-2 flex-wrap">
                        <span className="line-through text-red-400 bg-red-500/10 px-1.5 rounded">"{err.original}"</span>
                        <ChevronRight size={12} className="text-slate-500" />
                        <span className="text-green-400 bg-green-500/10 px-1.5 rounded font-medium">"{err.correction}"</span>
                      </div>
                      
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">{err.explanation}</p>
                      
                      {/* Rule Library / Examples */}
                      {err.ruleExamples && err.ruleExamples.length > 0 && (
                        <div>
                          <button onClick={() => setExpandedRules(p => ({ ...p, [i]: !p[i] }))} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium transition-all">
                            <BookOpen size={12} /> {expandedRules[i] ? 'Hide Rule Examples' : 'Learn Rule'}
                          </button>
                          {expandedRules[i] && (
                            <div className="mt-2 p-3 bg-dark-700/80 rounded-xl border border-white/5 space-y-1.5">
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Correct Usage Examples:</p>
                              {err.ruleExamples.map((ex, j) => (
                                <p key={j} className="text-xs text-slate-300 flex items-start gap-1.5">
                                  <span className="text-green-400 mt-0.5">✓</span> <span>{ex}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredErrors.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No errors matching this category.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ MODE ── */}
      {mode === 'quiz' && (
        <div className="space-y-6">
          {!quiz && (
            <div className="glass-card p-6 text-center">
              <Trophy size={48} className="text-orange-400 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-white mb-2">Grammar Sprint</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">30 seconds per question. Answer faster for time bonuses. Get 3 in a row for 2x XP!</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {['beginner', 'intermediate', 'advanced'].map(l => (
                  <button key={l} onClick={() => setQuizLevel(l)}
                    className={`px-4 py-2 rounded-xl text-xs capitalize border transition-all ${quizLevel === l ? 'bg-orange-500/20 border-orange-500/30 text-orange-400 font-bold' : 'border-white/10 text-slate-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <button onClick={generateQuiz} disabled={loading} className="btn-primary w-full max-w-xs mx-auto flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : <>🧠 Start Quiz</>}
              </button>
              
              {localStorage.getItem('lq_best_quiz') && (
                <p className="text-xs text-slate-500 mt-4">Your Daily Best: <span className="text-orange-400 font-bold">{localStorage.getItem('lq_best_quiz')} XP</span></p>
              )}
            </div>
          )}

          {quiz && !quizSubmitted && (
            <div className="glass-card p-6 animate-slide-up">
              {/* Quiz Header: Timer & Lifelines */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-1.5 font-mono text-lg font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                    <Clock size={18} /> 00:{String(timeLeft).padStart(2, '0')}
                  </div>
                  {streakCount >= 2 && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-lg font-bold flex items-center gap-1 animate-bounce"><Zap size={12}/> 2x XP</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={useFiftyFifty} disabled={lifelines.fiftyFifty <= 0} className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${lifelines.fiftyFifty > 0 ? 'bg-dark-600 border-white/10 text-white hover:bg-white/10' : 'bg-transparent border-transparent text-slate-600'}`}>
                    <Shield size={12} /> 50/50
                  </button>
                  <button onClick={useAskAI} disabled={lifelines.askAI <= 0} className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${lifelines.askAI > 0 ? 'bg-dark-600 border-white/10 text-white hover:bg-white/10' : 'bg-transparent border-transparent text-slate-600'}`}>
                    <HelpCircle size={12} /> Hint
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="flex gap-1 mb-4">
                {quiz.questions.map((_, i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i === currentQ ? 'bg-orange-400' : i < currentQ ? 'bg-green-500' : 'bg-white/10'}`} />
                ))}
              </div>

              {/* Question */}
              {quiz.questions[currentQ] && (
                <div className="space-y-4 relative">
                  <span className="text-xs text-orange-400 font-semibold uppercase tracking-wider">{quiz.questions[currentQ].topic}</span>
                  <p className="text-lg font-medium text-white mb-4">{quiz.questions[currentQ].question}</p>
                  
                  {showHint && quiz.questions[currentQ].hint && (
                    <p className="text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl mb-4 flex items-start gap-2">
                      <Lightbulb size={16} className="shrink-0 mt-0.5" /> {quiz.questions[currentQ].hint}
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-2">
                    {quiz.questions[currentQ].options.map((opt, oi) => {
                      if (hiddenOptions.includes(oi)) return <div key={oi} className="hidden" />;
                      
                      const state = quizAnswers[currentQ];
                      const isSelected = state?.ansIdx === oi;
                      const isCorrect = state !== undefined && oi === quiz.questions[currentQ].correct;
                      const isWrong = state !== undefined && isSelected && !state.isCorrect;

                      return (
                        <button key={oi} onClick={() => !state && handleQuizNext(oi)} disabled={!!state}
                          className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                            isCorrect ? 'border-green-500 bg-green-500/20 text-green-300' :
                            isWrong ? 'border-red-500 bg-red-500/20 text-red-300' :
                            'border-white/10 text-slate-300 hover:border-orange-500/50 hover:bg-orange-500/5'
                          }`}>
                          <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs shrink-0 font-bold">
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="flex-1 text-base">{opt}</span>
                          {isCorrect && <span className="text-green-400 text-xs font-bold flex flex-col items-end">
                            Correct!
                            {state.timeBonus > 0 && <span className="text-yellow-400">+ {state.timeBonus} Time XP</span>}
                            {state.streakBonus > 0 && <span className="text-orange-400">+ {state.streakBonus} Streak XP</span>}
                          </span>}
                          {isWrong && <XCircle size={18} className="text-red-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quiz Results */}
          {quizSubmitted && quizStats && (
            <div className="glass-card p-6 animate-slide-up text-center border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-amber-500/5">
              <h2 className="text-2xl font-display font-bold text-white mb-2">Quiz Complete!</h2>
              <div className="text-5xl font-display font-bold text-orange-400 mb-6">
                {Object.values(quizAnswers).reduce((sum, a) => sum + a.xp, 0)} XP
              </div>
              
              {/* Detailed topic breakdown */}
              <div className="max-w-xs mx-auto space-y-2 mb-8 text-left bg-dark-800 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Performance by Topic</p>
                {Object.entries(quizStats).map(([topic, stats]) => (
                  <div key={topic} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{topic}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{stats.c}/{stats.t}</span>
                      {stats.c === stats.t ? <CheckCircle size={14} className="text-green-400"/> : 
                       stats.c > 0 ? <AlertTriangle size={14} className="text-yellow-400"/> : 
                       <XCircle size={14} className="text-red-400"/>}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => { setQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); }} className="btn-primary w-full max-w-xs mx-auto flex items-center justify-center gap-2">
                <RefreshCw size={16} /> Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
