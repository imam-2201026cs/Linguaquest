import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PenTool, Send, RotateCcw, Zap, ChevronRight, Clock, BookOpen, Lock, Wand2, Eye, EyeOff, Flame } from 'lucide-react';
import XPReward from '../components/XPReward';
import { useAuth } from '../context/AuthContext';
import WordPopup from '../components/WordPopup';

const LEVEL_COLORS = {
  beginner: 'text-green-400 bg-green-500/10 border-green-500/20',
  intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
};
const LEVEL_REQUIRED = { beginner: 0, intermediate: 2, advanced: 3 };
const TARGET_WORDS = 200;
const TIMER_OPTIONS = [{ label: '15 min', secs: 900 }, { label: '25 min', secs: 1500 }, { label: '30 min', secs: 1800 }];
const VOCAB_MAP = { good: ['excellent', 'commendable', 'remarkable'], bad: ['poor', 'substandard', 'inadequate'], big: ['substantial', 'considerable', 'immense'], small: ['diminutive', 'minimal', 'negligible'], nice: ['pleasant', 'delightful', 'appealing'], very: ['extremely', 'remarkably', 'exceptionally'], said: ['remarked', 'stated', 'declared'] };
const STATUS_STYLE = { correct: 'bg-green-500/15 border-b-2 border-green-400', minor: 'bg-yellow-500/15 border-b-2 border-yellow-400', major: 'bg-red-500/15 border-b-2 border-red-400' };

const ScoreBar = ({ label, value, color = 'bg-primary-500' }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}%</span>
    </div>
    <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const STATUS_ICONS = { correct: '✅', minor: '⚠️', major: '❌' };
const STATUS_LABELS = { correct: 'Correct', minor: 'Minor Issue', major: 'Grammar Error' };
const STATUS_NOTE_STYLE = { correct: 'border-green-500/40 bg-green-500/10 text-green-300', minor: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300', major: 'border-red-500/40 bg-red-500/10 text-red-300' };

function SentenceHighlight({ text, analysis }) {
  const [activeIdx, setActiveIdx] = useState(null);

  if (!analysis || analysis.length === 0)
    return <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>;

  let remaining = text;
  const parts = [];

  analysis.forEach((item, idx) => {
    const pos = remaining.indexOf(item.sentence);
    if (pos === -1) return;
    if (pos > 0) parts.push(<span key={`pre-${idx}`} className="text-slate-300">{remaining.slice(0, pos)}</span>);

    const isActive = activeIdx === idx;
    parts.push(
      <span key={`s-${idx}`} className="relative inline">
        <span
          onClick={() => setActiveIdx(isActive ? null : idx)}
          className={`${STATUS_STYLE[item.status] || ''} px-0.5 rounded cursor-pointer select-none`}
        >
          {item.sentence}
        </span>
        {isActive && item.status !== 'correct' && (
          <span
            className={`absolute left-0 top-full mt-1 z-50 flex flex-col gap-1 rounded-xl border px-3 py-2 text-xs shadow-xl whitespace-normal min-w-[220px] max-w-xs ${STATUS_NOTE_STYLE[item.status]}`}
            style={{ pointerEvents: 'none' }}
          >
            <span className="font-bold text-sm">
              {STATUS_ICONS[item.status]} {STATUS_LABELS[item.status]}
            </span>
            <span className="leading-relaxed opacity-90">{item.note || 'No additional details.'}</span>
          </span>
        )}
      </span>
    );
    remaining = remaining.slice(pos + item.sentence.length);
  });

  if (remaining) parts.push(<span key="tail" className="text-slate-300">{remaining}</span>);

  return (
    <div>
      <p className="text-sm leading-loose">{parts}</p>
      {activeIdx !== null && analysis[activeIdx]?.status !== 'correct' && (
        <button onClick={() => setActiveIdx(null)} className="mt-3 text-xs text-slate-500 hover:text-slate-300">
          ✕ Close note
        </button>
      )}
    </div>
  );
}

export default function Writing() {
  const { user, fetchProfile } = useAuth();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  // Auto-save
  const [savedAt, setSavedAt] = useState(null);
  const [savedAgo, setSavedAgo] = useState('');
  // Timer
  const [timerSecs, setTimerSecs] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const timerRef = useRef(null);
  // Improve This
  const [selectedSentence, setSelectedSentence] = useState('');
  const [improved, setImproved] = useState(null);
  const [improving, setImproving] = useState(false);
  // Vocab suggestions
  const [vocabSuggestions, setVocabSuggestions] = useState([]);
  // Model answer
  const [showModel, setShowModel] = useState(false);
  // Word popup
  const [popupWord, setPopupWord] = useState(null);

  const handleWordClick = (e) => {
    if (e.detail === 2) {
      const word = window.getSelection()?.toString().trim().replace(/[^a-zA-Z]/g, '');
      if (word && word.length > 2) setPopupWord(word.toLowerCase());
    }
  };

  useEffect(() => {
    axios.get('/api/writing/topics').then(r => setTopics(r.data)).catch(() => toast.error('Failed to load topics'));
  }, []);

  useEffect(() => {
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    // Vocab suggestions
    const words = text.toLowerCase().split(/\s+/);
    const found = [];
    words.forEach(w => { const clean = w.replace(/[^a-z]/g, ''); if (VOCAB_MAP[clean]) found.push({ word: clean, alts: VOCAB_MAP[clean] }); });
    const unique = found.filter((v, i, a) => a.findIndex(x => x.word === v.word) === i).slice(0, 4);
    setVocabSuggestions(unique);
  }, [text]);

  // Auto-save every 30s
  useEffect(() => {
    if (!selectedTopic || !text) return;
    const key = `draft_${selectedTopic.id}`;
    const id = setInterval(() => {
      localStorage.setItem(key, text);
      setSavedAt(Date.now());
    }, 30000);
    return () => clearInterval(id);
  }, [text, selectedTopic]);

  // Saved-ago ticker
  useEffect(() => {
    if (!savedAt) return;
    const id = setInterval(() => {
      const secs = Math.floor((Date.now() - savedAt) / 1000);
      setSavedAgo(secs < 60 ? `${secs}s ago` : `${Math.floor(secs / 60)}m ago`);
    }, 5000);
    setSavedAgo('just now');
    return () => clearInterval(id);
  }, [savedAt]);

  // Countdown timer
  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) { clearInterval(timerRef.current); toast('⏰ Time is up! Submitting…', { icon: '⏰' }); handleSubmit(); return; }
    timerRef.current = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [remaining]);

  const startTopic = (topic) => {
    setSelectedTopic(topic);
    const saved = localStorage.getItem(`draft_${topic.id}`);
    setText(saved || '');
    setResult(null);
    setStartTime(Date.now());
    setSavedAt(null);
    setTimerSecs(null);
    setRemaining(null);
    setImproved(null);
    setSelectedSentence('');
    clearInterval(timerRef.current);
  };

  const startTimer = (secs) => {
    clearInterval(timerRef.current);
    setTimerSecs(secs);
    setRemaining(secs);
  };

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) return toast.error('Please write something!');
    setLoading(true);
    clearInterval(timerRef.current);
    try {
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const { data } = await axios.post('/api/writing/submit', { text, topicId: selectedTopic?.id, timeSpent });
      setResult(data);
      setReward({ xp: data.xpEarned, coins: data.coinsEarned, score: data.evaluation.overallScore });
      localStorage.removeItem(`draft_${selectedTopic?.id}`);
      await fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  }, [text, startTime, selectedTopic, fetchProfile]);

  const handleImprove = async () => {
    if (!selectedSentence.trim()) return toast.error('Select a sentence first');
    setImproving(true);
    try {
      const { data } = await axios.post('/api/writing/improve', { sentence: selectedSentence });
      setImproved(data);
    } catch { toast.error('Could not improve sentence'); }
    finally { setImproving(false); }
  };

  const handleTextSelect = () => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 5) setSelectedSentence(sel);
  };

  const reset = () => { setSelectedTopic(null); setResult(null); setText(''); setReward(null); setTimerSecs(null); setRemaining(null); clearInterval(timerRef.current); };

  const userLevel = user?.level || 1;
  const progressPct = Math.min(100, Math.round((wordCount / TARGET_WORDS) * 100));
  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Topic picker ──
  if (!selectedTopic) return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
          <PenTool size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Writing Practice</h1>
          <p className="text-slate-400 text-sm">Choose a topic and get AI-powered feedback</p>
        </div>
      </div>

      {/* Writing streak bonus */}
      {(user?.streak || 0) >= 2 && (
        <div className="glass-card p-4 mb-6 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20 flex items-center gap-3">
          <Flame size={20} className="text-orange-400" />
          <p className="text-sm text-slate-200">
            You've written <span className="font-bold text-orange-400">{user.streak} days in a row!</span> Keep it up for a <span className="font-bold text-yellow-400">+50 bonus XP</span> milestone!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map(topic => {
          const required = LEVEL_REQUIRED[topic.level] || 0;
          const locked = userLevel < required;
          return (
            <button
              key={topic.id}
              onClick={() => !locked && startTopic(topic)}
              disabled={locked}
              className={`glass-card p-6 text-left transition-all duration-200 group relative ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500/30 hover:scale-[1.02]'}`}
            >
              {locked && (
                <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-dark-900/60 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <Lock size={22} className="text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Reach Level {required}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className={`text-xs font-semibold px-2 py-1 rounded-full capitalize border ${LEVEL_COLORS[topic.level]}`}>{topic.level}</div>
                <ChevronRight size={18} className="text-slate-500 group-hover:text-primary-400 transition-colors" />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{topic.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{topic.prompt}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="xp-badge text-xs"><Zap size={10} />10-50 XP</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Writing view ──
  if (!result) return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-4" onClick={handleWordClick}>
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
      {popupWord && <WordPopup word={popupWord} onClose={() => setPopupWord(null)} source="writing" />}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={reset} className="btn-ghost text-sm py-2 px-3 flex items-center gap-1">
          <RotateCcw size={14} /> Back
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-display font-bold text-white">{selectedTopic.title}</h1>
          <p className="text-slate-400 text-sm truncate">{selectedTopic.prompt}</p>
        </div>
        {/* Timer display */}
        {remaining !== null && (
          <div className={`font-mono font-bold text-lg px-3 py-1 rounded-lg ${remaining < 60 ? 'text-red-400 bg-red-500/10' : 'text-primary-400 bg-primary-500/10'}`}>
            <Clock size={14} className="inline mr-1" />{fmtTime(remaining)}
          </div>
        )}
      </div>

      {/* Pomodoro Timer Selector */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs text-slate-400 font-medium">⏱ Timer:</span>
        {TIMER_OPTIONS.map(o => (
          <button key={o.secs} onClick={() => startTimer(o.secs)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${timerSecs === o.secs ? 'bg-primary-500 border-primary-500 text-white' : 'border-white/10 text-slate-400 hover:border-primary-500/50'}`}>
            {o.label}
          </button>
        ))}
        {timerSecs && <button onClick={() => { clearInterval(timerRef.current); setTimerSecs(null); setRemaining(null); }} className="text-xs text-red-400 hover:text-red-300">Cancel</button>}
        {savedAt && <span className="ml-auto text-xs text-slate-500">💾 Draft saved {savedAgo}</span>}
      </div>

      {/* Word count + progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="text-slate-400 font-medium">Words: <span className={wordCount >= TARGET_WORDS ? 'text-green-400 font-bold' : wordCount >= TARGET_WORDS * 0.5 ? 'text-yellow-400' : 'text-white'}>{wordCount}</span> / {TARGET_WORDS} recommended</span>
          <span className={wordCount >= TARGET_WORDS ? 'text-green-400 font-bold' : 'text-slate-400'}>{progressPct}%</span>
        </div>
        <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${wordCount >= TARGET_WORDS ? 'bg-green-500' : wordCount >= TARGET_WORDS * 0.5 ? 'bg-yellow-400' : 'bg-primary-500'}`}
            style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Textarea */}
      <div className="glass-card p-6">
        <label className="text-sm font-medium text-slate-300 block mb-3">Your Response</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onMouseUp={handleTextSelect}
          onKeyUp={handleTextSelect}
          placeholder={`Write about: ${selectedTopic.prompt}\n\nTip: Aim for at least ${TARGET_WORDS} words for better feedback.`}
          className="input-field min-h-[280px] resize-y font-body text-base leading-relaxed w-full"
        />
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-500">💡 Select any sentence to use "Improve This"</p>
          <button onClick={handleSubmit} disabled={loading || !text.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</> : <><Send size={16} /> Submit for Review</>}
          </button>
        </div>
      </div>

      {/* Improve This panel */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Wand2 size={16} className="text-accent-purple" /> Improve This AI Assistant</h3>
        <div className="flex gap-3 mb-3">
          <div className="flex-1 px-3 py-2 bg-dark-700 rounded-lg text-sm text-slate-400 min-h-[40px] italic truncate">
            {selectedSentence || 'Select a sentence in the text above…'}
          </div>
          <button onClick={handleImprove} disabled={!selectedSentence || improving}
            className="btn-primary text-sm px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {improving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Wand2 size={14} />}
            Improve
          </button>
        </div>
        {improved && (
          <div className="p-3 bg-accent-purple/10 border border-accent-purple/20 rounded-xl space-y-1">
            <p className="text-sm text-white">✨ <span className="font-semibold">Improved:</span> {improved.improved}</p>
            <p className="text-xs text-slate-400">💬 {improved.explanation}</p>
            <button onClick={() => { setText(t => t.replace(selectedSentence, improved.improved)); setImproved(null); setSelectedSentence(''); toast.success('Sentence replaced!'); }}
              className="text-xs text-primary-400 hover:text-primary-300 mt-1">Use this →</button>
          </div>
        )}
      </div>

      {/* Vocab suggestions */}
      {vocabSuggestions.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">📚 Vocabulary Suggestions</h3>
          <div className="flex flex-wrap gap-3">
            {vocabSuggestions.map(({ word, alts }) => (
              <div key={word} className="flex items-center gap-2 bg-dark-700 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-400 line-through">{word}</span>
                <span className="text-slate-500">→</span>
                {alts.map(a => (
                  <button key={a} onClick={() => { setText(t => t.replace(new RegExp(`\\b${word}\\b`, 'i'), a)); toast.success(`Replaced "${word}" with "${a}"`); }}
                    className="text-xs text-primary-400 hover:text-primary-300 hover:underline">{a}</button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Results view ──
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up" onClick={handleWordClick}>
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
      {popupWord && <WordPopup word={popupWord} onClose={() => setPopupWord(null)} source="writing" />}

      {/* Overview */}
      <div className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-white">AI Feedback</h2>
          <div className="text-4xl font-display font-bold text-white">{result.evaluation.overallScore}%</div>
        </div>
        <p className="text-slate-300 leading-relaxed">{result.evaluation.feedback}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.evaluation.cefr && (
            <span className="text-xs bg-primary-500/20 text-primary-400 border border-primary-500/20 rounded-full px-3 py-1">CEFR: {result.evaluation.cefr}</span>
          )}
          <span className="xp-badge"><Zap size={10} />+{result.xpEarned} XP</span>
        </div>
      </div>

      {/* Scores */}
      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-white mb-4">Detailed Scores</h3>
        <ScoreBar label="Grammar" value={result.evaluation.grammarScore} color="bg-blue-500" />
        <ScoreBar label="Vocabulary" value={result.evaluation.vocabularyScore} color="bg-purple-500" />
        <ScoreBar label="Coherence" value={result.evaluation.coherenceScore} color="bg-green-500" />
        <ScoreBar label="Content" value={result.evaluation.contentScore} color="bg-orange-500" />
      </div>

      {/* Sentence Highlight */}
      {result.evaluation.sentenceAnalysis?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">🔍 Sentence-Level Analysis</h3>
          <div className="flex flex-wrap gap-3 mb-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500/30 inline-block border-b-2 border-green-400" /> Correct</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-500/30 inline-block border-b-2 border-yellow-400" /> Minor issue</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500/30 inline-block border-b-2 border-red-400" /> Grammar error</span>
          </div>
          <SentenceHighlight text={text} analysis={result.evaluation.sentenceAnalysis} />
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="font-semibold text-green-400 mb-3">✅ Strengths</h3>
          <ul className="space-y-2">
            {(result.evaluation.strengths || []).map((s, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-green-400 mt-0.5">•</span>{s}</li>
            ))}
          </ul>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-semibold text-amber-400 mb-3">💡 To Improve</h3>
          <ul className="space-y-2">
            {(result.evaluation.improvements || []).map((s, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Corrected Version */}
      {result.evaluation.correctedText && (
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><BookOpen size={16} className="text-primary-400" /> Corrected Version</h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{result.evaluation.correctedText}</p>
        </div>
      )}

      {/* Model Answer toggle */}
      {result.evaluation.modelAnswer && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">🏆 Model Answer</h3>
            <button onClick={() => setShowModel(v => !v)} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              {showModel ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}
            </button>
          </div>
          {showModel && <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{result.evaluation.modelAnswer}</p>}
        </div>
      )}

      <button onClick={reset} className="btn-primary w-full flex items-center justify-center gap-2">
        <PenTool size={16} /> Practice Another Topic
      </button>
    </div>
  );
}
