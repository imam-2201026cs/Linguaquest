import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BookOpen, RefreshCw, ChevronRight, Zap, CheckCircle, XCircle,
  Info, Clock, Highlighter, Bookmark, BookmarkCheck, Timer, AlignLeft
} from 'lucide-react';
import XPReward from '../components/XPReward';
import { useAuth } from '../context/AuthContext';
import WordPopup from '../components/WordPopup';

const GENRES = ['General Knowledge', 'Science & Technology', 'History', 'Environment', 'Health', 'Culture & Arts', 'Business', 'Space & Universe'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const TIMED_DURATION = 180; // 3 minutes

/* ── Flesch-Kincaid readability (approximate) ── */
function readabilityBadge(passage) {
  const words = passage.split(/\s+/).length;
  const sentences = (passage.match(/[.!?]+/g) || []).length || 1;
  const syllables = passage.split(/\s+/).reduce((s, w) => s + Math.max(1, w.replace(/[^aeiouy]/gi, '').length), 0);
  const fk = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  if (fk >= 80) return { label: 'A1', color: 'text-green-400 bg-green-500/10 border-green-500/20' };
  if (fk >= 70) return { label: 'A2', color: 'text-lime-400 bg-lime-500/10 border-lime-500/20' };
  if (fk >= 60) return { label: 'B1', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
  if (fk >= 50) return { label: 'B2', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
  if (fk >= 30) return { label: 'C1', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  return { label: 'C2', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
}

/* ── Word cloud (top unique advanced words) ── */
function WordCloud({ passage }) {
  const stopwords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','is','it','its','that','this','with','as','by','from','was','are','be','have','has','had','not','he','she','they','we','you','i','his','her','their','our','an','so','if','then','than','when','which','who','what','how']);
  const freq = {};
  passage.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).forEach(w => {
    if (w.length > 5 && !stopwords.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);
  const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-xs'];
  const colors = ['text-green-400', 'text-emerald-400', 'text-teal-400', 'text-cyan-400', 'text-green-300', 'text-emerald-300'];

  if (top.length === 0) return null;
  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
        <AlignLeft size={15} className="text-green-400" /> Related Word Cloud
      </h3>
      <div className="flex flex-wrap gap-3 justify-center py-2">
        {top.map((w, i) => (
          <span key={w} className={`${sizes[Math.min(i, sizes.length - 1)]} ${colors[i % colors.length]} font-semibold cursor-default hover:opacity-70 transition-opacity`}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Highlighted passage renderer ── */
function HighlightedPassage({ passage, highlights, annotations, onSelect }) {
  return (
    <div
      onMouseUp={onSelect}
      className="text-slate-300 leading-[2] text-sm select-text cursor-text"
      style={{ whiteSpace: 'pre-wrap' }}
    >
      {passage}
      {highlights.length > 0 && (
        <div className="mt-3 space-y-1">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="w-2 h-2 mt-1 rounded-full bg-yellow-400 shrink-0" />
              <span className="text-yellow-300 italic">"{h.text}"</span>
              {annotations[h.text] && <span className="text-slate-500">— {annotations[h.text]}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Reading Page ── */
export default function Reading() {
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  const [genre, setGenre] = useState('General Knowledge');
  const [level, setLevel] = useState('intermediate');
  const [showExplanation, setShowExplanation] = useState({});
  // Speed tracker
  const [readStart, setReadStart] = useState(null);
  const [wpm, setWpm] = useState(null);
  // Highlights & annotations
  const [highlights, setHighlights] = useState([]);
  const [annotations, setAnnotations] = useState({});
  const [pendingHighlight, setPendingHighlight] = useState(null);
  const [annotationText, setAnnotationText] = useState('');
  // Word popup
  const [popupWord, setPopupWord] = useState(null);
  // Progressive reveal
  const [revealedParas, setRevealedParas] = useState(1);
  const [questionsVisible, setQuestionsVisible] = useState(false);
  // Bookmarks
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('lq_bookmarks') || '[]'));
  const [isBookmarked, setIsBookmarked] = useState(false);
  // Timed challenge
  const [timedMode, setTimedMode] = useState(false);
  const [timerLeft, setTimerLeft] = useState(TIMED_DURATION);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const { fetchProfile } = useAuth();

  const paragraphs = exercise?.passage?.split(/\n+/).filter(Boolean) || [];

  /* Generate */
  const generate = async () => {
    setLoading(true);
    setAnswers({}); setSubmitted(false); setResult(null); setReward(null);
    setShowExplanation({}); setHighlights([]); setAnnotations({});
    setPendingHighlight(null); setRevealedParas(1); setQuestionsVisible(false);
    setWpm(null); setTimerLeft(TIMED_DURATION);
    clearInterval(timerRef.current);
    try {
      const { data } = await axios.post('/api/reading/generate', { level, genre });
      setExercise(data);
      setIsBookmarked(bookmarks.some(b => b.title === data.title));
      setReadStart(Date.now());
      startTimeRef.current = Date.now();
      if (timedMode) {
        timerRef.current = setInterval(() => {
          setTimerLeft(t => {
            if (t <= 1) { clearInterval(timerRef.current); handleAutoSubmit(); return 0; }
            return t - 1;
          });
        }, 1000);
      }
    } catch { toast.error('Failed to generate reading. Try again!'); }
    finally { setLoading(false); }
  };

  const handleAutoSubmit = useCallback(() => {
    toast('⏰ Time is up! Submitting…', { icon: '⏰' });
    setQuestionsVisible(true);
    setSubmitted(true);
  }, []);

  /* Reading speed: when user clicks "Start Questions" */
  const handleStartQuestions = () => {
    if (readStart) {
      const mins = (Date.now() - readStart) / 60000;
      const words = exercise.passage.split(/\s+/).length;
      setWpm(Math.round(words / mins));
    }
    setQuestionsVisible(true);
  };

  /* Highlight selection */
  const handleTextSelect = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (text && text.length > 2 && text.length < 200) {
      setPendingHighlight({ text });
    }
  };

  /* Double-click word for definition */
  const handleWordClick = (e) => {
    if (e.detail === 2) {
      const word = window.getSelection()?.toString().trim().replace(/[^a-zA-Z]/g, '');
      if (word && word.length > 2) setPopupWord(word.toLowerCase());
    }
  };

  const addHighlight = () => {
    if (!pendingHighlight) return;
    setHighlights(h => [...h, pendingHighlight]);
    if (annotationText.trim()) setAnnotations(a => ({ ...a, [pendingHighlight.text]: annotationText.trim() }));
    setPendingHighlight(null);
    setAnnotationText('');
    toast.success('Highlighted!');
  };

  /* Bookmark */
  const toggleBookmark = () => {
    const updated = isBookmarked
      ? bookmarks.filter(b => b.title !== exercise.title)
      : [...bookmarks, { title: exercise.title, genre, level, passage: exercise.passage.slice(0, 120) + '…' }];
    setBookmarks(updated);
    localStorage.setItem('lq_bookmarks', JSON.stringify(updated));
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed' : 'Article bookmarked! 📌');
  };

  /* Answer & Submit */
  const handleAnswer = (qi, oi) => { if (submitted) return; setAnswers(p => ({ ...p, [qi]: oi })); };

  const handleSubmit = async () => {
    const unanswered = exercise.questions.filter((_, i) => answers[i] === undefined);
    if (unanswered.length > 0) return toast.error('Answer all questions first!');
    clearInterval(timerRef.current);
    setSubmitted(true);
    try {
      const ansArr = exercise.questions.map((_, i) => answers[i]);
      const timeSpent = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
      const { data } = await axios.post('/api/reading/submit', {
        answers: ansArr, questions: exercise.questions, topic: exercise.title, timeSpent
      });
      // Timed bonus
      const bonus = timedMode && timerLeft > 0 ? 10 : 0;
      setResult({ ...data, xpEarned: data.xpEarned + bonus, timedBonus: bonus });
      setReward({ xp: data.xpEarned + bonus, coins: data.coinsEarned, score: data.score });
      await fetchProfile();
    } catch { toast.error('Submission failed'); }
  };

  const reset = () => {
    setExercise(null); setResult(null); setReward(null); setWpm(null);
    setQuestionsVisible(false); clearInterval(timerRef.current);
  };

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const rb = exercise ? readabilityBadge(exercise.passage) : null;

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
      {popupWord && <WordPopup word={popupWord} onClose={() => setPopupWord(null)} />}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center">
          <BookOpen size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Reading Comprehension</h1>
          <p className="text-slate-400 text-sm">Read passages and answer comprehension questions</p>
        </div>
      </div>

      {/* Config */}
      {!exercise && (
        <div className="glass-card p-6 space-y-5">
          <h3 className="font-semibold text-white">Choose Your Reading</h3>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Genre</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenre(g)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${genre === g ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`flex-1 text-xs py-2 rounded-xl border capitalize transition-all ${level === l ? 'bg-green-500/20 border-green-500/40 text-green-400 font-semibold' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {/* Timed challenge toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div onClick={() => setTimedMode(v => !v)}
              className={`w-10 h-6 rounded-full transition-all relative ${timedMode ? 'bg-green-500' : 'bg-white/10'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${timedMode ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-300">
              ⏱ Timed challenge (3 min) — <span className="text-green-400">+10 bonus XP</span>
            </span>
          </label>
          {/* Saved bookmarks */}
          {bookmarks.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">📌 Your Bookmarks ({bookmarks.length})</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {bookmarks.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                    <div>
                      <p className="text-xs text-white font-medium">{b.title}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{b.genre} · {b.level}</p>
                    </div>
                    <button onClick={() => {
                      const updated = bookmarks.filter((_, j) => j !== i);
                      setBookmarks(updated); localStorage.setItem('lq_bookmarks', JSON.stringify(updated));
                    }} className="text-slate-600 hover:text-red-400 text-xs">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : <><BookOpen size={16} /> Generate Reading</>}
          </button>
        </div>
      )}

      {exercise && (
        <div className="space-y-6 animate-slide-up">
          {/* Passage Card */}
          <div className="glass-card p-6 border-green-500/20">
            <div className="flex items-start justify-between mb-3 gap-3">
              <div>
                <h2 className="text-lg font-display font-bold text-white">{exercise.title}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-3 py-1 capitalize">{exercise.difficulty}</span>
                  {rb && <span className={`text-xs border rounded-full px-2 py-1 font-bold ${rb.color}`}>CEFR {rb.label}</span>}
                  {wpm && <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={10} /> {wpm} WPM</span>}
                  {timedMode && timerLeft > 0 && !submitted && (
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${timerLeft < 30 ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
                      <Timer size={10} className="inline mr-1" />{fmtTime(timerLeft)}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={toggleBookmark} className={`p-2 rounded-xl transition-all ${isBookmarked ? 'text-green-400 bg-green-500/10' : 'text-slate-500 hover:text-green-400'}`}>
                {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            </div>

            {/* Highlighted passage with progressive reveal */}
            <div onClick={handleWordClick}>
              <HighlightedPassage
                passage={paragraphs.slice(0, revealedParas).join('\n\n')}
                highlights={highlights}
                annotations={annotations}
                onSelect={handleTextSelect}
              />
            </div>

            {/* Progressive reveal button */}
            {!questionsVisible && revealedParas < paragraphs.length && (
              <button onClick={() => setRevealedParas(r => r + 1)}
                className="mt-4 text-sm text-green-400 hover:text-green-300 border border-green-500/20 hover:border-green-500/40 px-4 py-2 rounded-xl transition-all w-full">
                Continue Reading ↓
              </button>
            )}
            {!questionsVisible && revealedParas >= paragraphs.length && (
              <button onClick={handleStartQuestions}
                className="mt-4 btn-primary w-full flex items-center justify-center gap-2">
                <ChevronRight size={16} /> Start Questions
              </button>
            )}

            {/* Highlight annotation panel */}
            {pendingHighlight && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-2">
                <p className="text-xs text-yellow-400">Selected: <em>"{pendingHighlight.text}"</em></p>
                <input value={annotationText} onChange={e => setAnnotationText(e.target.value)}
                  placeholder="Add a note (optional)…"
                  className="input-field text-xs py-2" />
                <div className="flex gap-2">
                  <button onClick={addHighlight} className="text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 px-3 py-1.5 rounded-lg transition-all">
                    <Highlighter size={11} className="inline mr-1" /> Save Highlight
                  </button>
                  <button onClick={() => setPendingHighlight(null)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
                </div>
              </div>
            )}

            {exercise.summary && submitted && (
              <div className="mt-4 p-3 bg-dark-600/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-500 mb-1">Summary:</p>
                <p className="text-xs text-slate-400 italic">{exercise.summary}</p>
              </div>
            )}
          </div>

          {/* Questions */}
          {questionsVisible && (
            <div className="space-y-4">
              {exercise.questions.map((q, qi) => (
                <div key={q.id} className="glass-card p-5">
                  <p className="font-medium text-white mb-3 text-sm">{qi + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[qi] === oi;
                      const isCorrect = submitted && oi === q.correct;
                      const isWrong = submitted && isSelected && oi !== q.correct;
                      return (
                        <button key={oi} onClick={() => handleAnswer(qi, oi)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                            isCorrect ? 'border-green-500/50 bg-green-500/10 text-green-400' :
                            isWrong ? 'border-red-500/50 bg-red-500/10 text-red-400' :
                            isSelected ? 'border-green-500/50 bg-green-500/10 text-green-300' :
                            'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                          }`}>
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0">
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && <CheckCircle size={16} className="shrink-0" />}
                          {isWrong && <XCircle size={16} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && q.explanation && (
                    <div className="mt-3">
                      <button onClick={() => setShowExplanation(p => ({ ...p, [qi]: !p[qi] }))}
                        className="text-xs flex items-center gap-1 text-primary-400 hover:text-primary-300">
                        <Info size={12} /> {showExplanation[qi] ? 'Hide' : 'Show'} Explanation
                      </button>
                      {showExplanation[qi] && (
                        <p className="text-xs text-slate-400 mt-2 p-3 bg-dark-600/50 rounded-lg">{q.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {!submitted ? (
                <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2">
                  <ChevronRight size={16} /> Submit Answers
                </button>
              ) : result && (
                <div className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-white">Result</h3>
                    <span className="text-3xl font-display font-bold text-white">{result.score}%</span>
                  </div>
                  <p className="text-slate-300 mb-1">{result.correct} / {result.total} correct</p>
                  {wpm && <p className="text-sm text-slate-400 mb-1"><Clock size={12} className="inline mr-1" /> Reading speed: {wpm} WPM</p>}
                  {result.timedBonus > 0 && <p className="text-sm text-green-400 mb-2">⏱ Timed bonus: +{result.timedBonus} XP</p>}
                  <div className="flex gap-2 mb-4">
                    <span className="xp-badge"><Zap size={12} />+{result.xpEarned} XP</span>
                  </div>
                  <button onClick={reset} className="btn-ghost w-full flex items-center justify-center gap-2">
                    <RefreshCw size={14} /> Read Another
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Word cloud — shown after submit */}
          {submitted && <WordCloud passage={exercise.passage} />}
        </div>
      )}
    </div>
  );
}
