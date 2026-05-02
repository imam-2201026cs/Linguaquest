import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Headphones, Play, Pause, RefreshCw, ChevronRight, Zap, Volume2,
  CheckCircle, XCircle, SkipBack, SkipForward, Eye, EyeOff, Keyboard, Mic
} from 'lucide-react';
import XPReward from '../components/XPReward';
import { useAuth } from '../context/AuthContext';

const TOPICS = ['Daily Life', 'Travel & Tourism', 'Technology', 'Health & Wellness', 'Environment', 'Food & Culture', 'Science', 'Sports'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const MAX_REPLAYS = 3;

/* ── Difficulty waveform indicator ── */
function WaveIndicator({ level }) {
  const bars = level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3;
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3].map(i => (
        <div key={i} className={`w-1 rounded-sm transition-all ${i <= bars ? 'bg-purple-400' : 'bg-white/15'}`}
          style={{ height: i === 1 ? '8px' : i === 2 ? '12px' : '16px' }} />
      ))}
    </div>
  );
}

/* ── Vocab flashcard ── */
function Flashcard({ word, meaning }) {
  const [flipped, setFlipped] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveToVocab = async (e) => {
    e.stopPropagation();
    setSaving(true);
    try {
      await axios.post('/api/vocabulary/add', { 
        word, 
        definition: meaning, 
        source: 'listening' 
      });
      toast.success('Saved to Vocabulary!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save word');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={() => setFlipped(f => !f)} className="cursor-pointer group" style={{ perspective: '600px' }}>
      <div style={{ transition: 'transform 0.5s', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none', position: 'relative', height: '80px' }}>
        {/* Front */}
        <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
          className="bg-dark-700 border border-white/10 rounded-xl flex flex-col items-center justify-center px-3 group-hover:border-purple-500/30 transition-all shadow-lg">
          <p className="text-sm font-bold text-white text-center mb-1">{word}</p>
          <button 
            onClick={saveToVocab}
            disabled={saving}
            className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded flex items-center gap-1"
          >
            {saving ? '...' : '+ Save'}
          </button>
        </div>
        {/* Back */}
        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}
          className="bg-gradient-to-br from-purple-900/40 to-dark-800 border border-purple-500/30 rounded-xl flex items-center justify-center px-3">
          <p className="text-xs text-purple-200 text-center leading-tight">{meaning}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Custom audio player ── */
function AudioPlayer({ passage, level, onReplayUsed, replaysLeft, speedBonus, onSpeedBonus }) {
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(level === 'beginner' ? 0.8 : level === 'intermediate' ? 0.9 : 1.0);
  const uttRef = useRef(null);
  const progressRef = useRef(null);

  const stopSpeech = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
    setProgress(0);
    clearInterval(progressRef.current);
  };

  const speak = (chosenRate) => {
    if (!passage) return;
    if (speaking) { stopSpeech(); return; }
    if (replaysLeft <= 0) return toast.error('No replays left!');

    onReplayUsed();
    const utt = new SpeechSynthesisUtterance(passage);
    utt.rate = chosenRate || rate;
    utt.pitch = 1;
    utt.lang = 'en-US';
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
    if (preferred) utt.voice = preferred;

    // Simulate progress bar
    const estDuration = (passage.split(' ').length / 130) * 60 * 1000 / (chosenRate || rate);
    const start = Date.now();
    progressRef.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / estDuration) * 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(progressRef.current);
    }, 200);

    utt.onend = () => { setSpeaking(false); setProgress(0); clearInterval(progressRef.current); };
    utt.onerror = () => { setSpeaking(false); clearInterval(progressRef.current); };
    uttRef.current = utt;
    speechSynthesis.speak(utt);
    setSpeaking(true);

    if ((chosenRate || rate) >= 1.25) onSpeedBonus();
  };

  const SPEEDS = [{ label: '0.75x', val: 0.75 }, { label: '1x', val: 1.0 }, { label: '1.25x', val: 1.25 }];

  return (
    <div className="bg-dark-700/60 rounded-xl p-4 space-y-3">
      {/* Waveform-style progress */}
      <div className="flex items-center gap-3">
        <button onClick={() => { stopSpeech(); setProgress(0); }} className="text-slate-500 hover:text-slate-300">
          <SkipBack size={16} />
        </button>
        <button onClick={() => speak(rate)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${replaysLeft <= 0 ? 'bg-white/5 text-slate-600 cursor-not-allowed' : speaking ? 'bg-purple-500 text-white animate-pulse' : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/40'}`}>
          {speaking ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
        <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden cursor-pointer">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-slate-500 w-8 text-right">
          {replaysLeft <= 0 ? '0' : replaysLeft}↺
        </span>
      </div>

      {/* Speed controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Speed:</span>
        {SPEEDS.map(s => (
          <button key={s.val} onClick={() => { setRate(s.val); if (speaking) { stopSpeech(); setTimeout(() => speak(s.val), 100); } }}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${rate === s.val ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'border-white/10 text-slate-500 hover:border-white/20'}`}>
            {s.label}
          </button>
        ))}
        {rate >= 1.25 && <span className="text-xs text-yellow-400 ml-auto">⚡ +20 XP speed bonus</span>}
      </div>
    </div>
  );
}

/* ── Main Listening ── */
export default function Listening() {
  const [exercise, setExercise] = useState(null);
  const [mode, setMode] = useState('mcq'); // 'mcq' | 'dictation'
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('Daily Life');
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  const [startTime, setStartTime] = useState(null);
  const [replaysLeft, setReplaysLeft] = useState(MAX_REPLAYS);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speedBonus, setSpeedBonus] = useState(false);
  // Dictation mode
  const [dictationInput, setDictationInput] = useState('');
  const [dictationResult, setDictationResult] = useState(null);
  const { fetchProfile } = useAuth();

  const generateExercise = async () => {
    setLoading(true);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setReward(null);
    setShowTranscript(false);
    setReplaysLeft(MAX_REPLAYS);
    setSpeedBonus(false);
    setDictationInput('');
    setDictationResult(null);
    try {
      const { data } = await axios.post('/api/listening/generate', { level: selectedLevel, topic: selectedTopic });
      setExercise(data);
      setStartTime(Date.now());
    } catch {
      toast.error('Failed to generate exercise. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qId, optIndex) => { if (submitted) return; setAnswers(p => ({ ...p, [qId]: optIndex })); };

  const handleSubmit = async () => {
    if (!exercise) return;
    const unanswered = exercise.questions.filter((_, i) => answers[i] === undefined);
    if (unanswered.length > 0) return toast.error('Answer all questions first!');
    setSubmitted(true);
    speechSynthesis.cancel();
    try {
      const ansArr = exercise.questions.map((_, i) => answers[i]);
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const { data } = await axios.post('/api/listening/submit', {
        answers: ansArr, questions: exercise.questions, topic: exercise.title, timeSpent
      });
      const bonusXP = speedBonus ? 20 : 0;
      setResult({ ...data, xpEarned: data.xpEarned + bonusXP });
      setReward({ xp: data.xpEarned + bonusXP, coins: data.coinsEarned, score: data.score });
      await fetchProfile();
    } catch { toast.error('Submission failed'); }
  };

  // Dictation: compare typed text to passage
  const handleDictationSubmit = () => {
    if (!dictationInput.trim()) return toast.error('Type what you heard first!');
    const original = exercise.passage.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const typed = dictationInput.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const origWords = original.split(/\s+/);
    const typedWords = typed.split(/\s+/);
    let correct = 0;
    origWords.forEach((w, i) => { if (typedWords[i] === w) correct++; });
    const accuracy = Math.round((correct / origWords.length) * 100);
    setDictationResult({ accuracy, correct, total: origWords.length });
    if (accuracy >= 80) toast.success(`Great dictation! ${accuracy}% accuracy 🎯`);
    else toast.error(`Keep practicing! ${accuracy}% accuracy`);
  };

  const reset = () => { setExercise(null); setResult(null); setReward(null); setDictationResult(null); };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
            <Headphones size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Listening Practice</h1>
            <p className="text-slate-400 text-sm">Listen and answer comprehension questions</p>
          </div>
        </div>
        {/* Mode toggle */}
        <div className="flex gap-1 bg-dark-700 p-1 rounded-xl">
          <button onClick={() => setMode('mcq')}
            className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${mode === 'mcq' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            <Volume2 size={12} /> MCQ
          </button>
          <button onClick={() => setMode('dictation')}
            className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${mode === 'dictation' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            <Keyboard size={12} /> Dictation
          </button>
        </div>
      </div>

      {/* Config */}
      {!exercise && (
        <div className="glass-card p-6 mb-6">
          <h3 className="font-semibold text-white mb-4">Customize Your Exercise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Topic</label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map(t => (
                  <button key={t} onClick={() => setSelectedTopic(t)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedTopic === t ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Level</label>
              <div className="flex gap-2">
                {LEVELS.map(l => (
                  <button key={l} onClick={() => setSelectedLevel(l)}
                    className={`flex-1 text-xs py-2 rounded-xl border capitalize transition-all flex items-center justify-center gap-2 ${selectedLevel === l ? 'bg-purple-500/20 border-purple-500/40 text-purple-400 font-semibold' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                    <WaveIndicator level={l} /> {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {mode === 'dictation' && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-4 text-sm text-purple-300">
              <Keyboard size={14} className="inline mr-2" />
              <strong>Dictation mode:</strong> AI generates a passage → you listen → type what you hear → AI checks your spelling & accuracy.
            </div>
          )}
          <button onClick={generateExercise} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : <><RefreshCw size={16} /> Generate Exercise</>}
          </button>
        </div>
      )}

      {exercise && (
        <div className="space-y-6 animate-slide-up">
          {/* Passage Card */}
          <div className="glass-card p-6 border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-display font-bold text-white">{exercise.title}</h2>
              <div className="flex items-center gap-2">
                <WaveIndicator level={selectedLevel} />
                <span className="text-xs text-slate-500 capitalize">{selectedLevel}</span>
              </div>
            </div>

            {/* Replay count */}
            <div className={`flex items-center gap-2 mb-3 text-xs ${replaysLeft <= 1 ? 'text-red-400' : 'text-slate-400'}`}>
              <Volume2 size={12} />
              {replaysLeft > 0
                ? `You can listen ${replaysLeft} more time${replaysLeft !== 1 ? 's' : ''}`
                : 'No more replays — just like a real exam!'}
            </div>

            {/* Custom audio player */}
            <AudioPlayer
              passage={exercise.passage}
              level={selectedLevel}
              replaysLeft={replaysLeft}
              onReplayUsed={() => setReplaysLeft(r => Math.max(0, r - 1))}
              speedBonus={speedBonus}
              onSpeedBonus={() => { if (!speedBonus) { setSpeedBonus(true); toast.success('⚡ Speed challenge! +20 XP bonus unlocked'); } }}
            />

            {/* Transcript reveal toggle */}
            <div className="mt-4">
              {!submitted ? (
                <button onClick={() => { setShowTranscript(v => !v); if (!showTranscript) toast('Transcript revealed — challenge yourself next time!', { icon: '👁' }); }}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-all">
                  {showTranscript ? <><EyeOff size={12} /> Hide Transcript</> : <><Eye size={12} /> Reveal Transcript</>}
                </button>
              ) : null}
              {(showTranscript || submitted) && (
                <div className="mt-3 bg-dark-600/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Transcript</p>
                  <p className="text-sm text-slate-300 leading-relaxed italic">{exercise.passage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dictation mode */}
          {mode === 'dictation' && !dictationResult && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Keyboard size={15} className="text-purple-400" /> Type What You Heard</h3>
              <textarea
                value={dictationInput}
                onChange={e => setDictationInput(e.target.value)}
                placeholder="Type the passage exactly as you heard it..."
                className="input-field min-h-[140px] resize-y text-sm leading-relaxed w-full font-mono"
              />
              <button onClick={handleDictationSubmit} className="btn-primary w-full mt-3 flex items-center justify-center gap-2">
                <ChevronRight size={16} /> Check Dictation
              </button>
            </div>
          )}

          {dictationResult && (
            <div className="glass-card p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <h3 className="font-display font-bold text-white text-lg mb-2">Dictation Result</h3>
              <div className="text-4xl font-bold text-white mb-2">{dictationResult.accuracy}%</div>
              <p className="text-slate-400 text-sm">{dictationResult.correct} / {dictationResult.total} words correct</p>
              <div className="h-2 bg-dark-600 rounded-full overflow-hidden mt-3">
                <div className={`h-full rounded-full transition-all duration-700 ${dictationResult.accuracy >= 80 ? 'bg-green-500' : dictationResult.accuracy >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                  style={{ width: `${dictationResult.accuracy}%` }} />
              </div>
              <button onClick={reset} className="btn-ghost w-full mt-4 flex items-center justify-center gap-2">
                <RefreshCw size={14} /> Try Another
              </button>
            </div>
          )}

          {/* MCQ Questions */}
          {mode === 'mcq' && (
            <div className="space-y-4">
              {exercise.questions.map((q, qi) => (
                <div key={q.id} className="glass-card p-5">
                  <p className="font-medium text-white mb-4 text-sm">{qi + 1}. {q.question}</p>
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
                            isSelected ? 'border-purple-500/50 bg-purple-500/10 text-purple-300' :
                            'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                          }`}>
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0">
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && <CheckCircle size={16} className="text-green-400 shrink-0" />}
                          {isWrong && <XCircle size={16} className="text-red-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!submitted ? (
                <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2">
                  <ChevronRight size={16} /> Submit Answers
                </button>
              ) : result && (
                <div className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-white text-lg">Results</h3>
                    <span className="text-3xl font-display font-bold text-white">{result.score}%</span>
                  </div>
                  <p className="text-slate-300 mb-2">{result.correct} out of {result.total} correct</p>
                  {speedBonus && <p className="text-yellow-400 text-sm mb-2">⚡ Speed challenge bonus: +20 XP</p>}
                  <div className="flex gap-3">
                    <span className="xp-badge"><Zap size={12} />+{result.xpEarned} XP</span>
                  </div>
                  <button onClick={reset} className="btn-ghost w-full mt-4 flex items-center justify-center gap-2">
                    <RefreshCw size={14} /> Try Another
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Vocabulary Flashcards */}
          {exercise.vocabulary?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                📚 Vocabulary Flashcards
                <span className="text-xs text-slate-500 font-normal">— click to reveal definition</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {exercise.vocabulary.map((v, i) => (
                  <Flashcard key={i} word={v.word} meaning={v.meaning} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
