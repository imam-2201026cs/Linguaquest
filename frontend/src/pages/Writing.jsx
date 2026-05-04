import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PenTool, Send, RotateCcw, Zap, BookOpen, Star, Timer,
  ChevronRight, Lock, Lightbulb, CheckCircle, AlertTriangle,
  Newspaper, Mail, Image, BarChart2, RefreshCw, Eye, Wand2, FileText
} from 'lucide-react';
import XPReward from '../components/XPReward';
import { useAuth } from '../context/AuthContext';

const MODE_ICONS = { story_continuation: BookOpen, picture_writing: Image, timed_challenge: Timer, news_article: Newspaper, letter_email: Mail, creative_scene: Star };

const ScoreBar = ({ label, value, color = 'bg-primary-500' }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold ${value >= 80 ? 'text-green-400' : value >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{value}%</span>
    </div>
    <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

function CountdownTimer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setRemaining(p => { if (p <= 1) { clearInterval(t); onExpire(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, []);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = (remaining / seconds) * 100;
  const col = pct > 50 ? 'text-green-400' : pct > 25 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="flex items-center gap-3">
      <div className={`font-mono text-2xl font-bold ${col}`}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</div>
      <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ModeSelector({ modes, onSelect, userLevel }) {
  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
          <PenTool size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Writing Practice</h1>
          <p className="text-slate-400 text-sm">Choose a writing mode — each builds different skills</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {modes.map(mode => {
          const locked = userLevel < (mode.unlockLevel || 1);
          return (
            <button key={mode.id} onClick={() => locked ? toast.error(`Reach Level ${mode.unlockLevel} to unlock!`) : onSelect(mode)}
              className={`glass-card p-5 text-left transition-all duration-300 relative overflow-hidden group ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.03] hover:border-white/15 cursor-pointer'}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              {locked && <div className="absolute top-3 right-3 flex items-center gap-1 bg-dark-700 border border-white/10 rounded-full px-2 py-1"><Lock size={10} className="text-slate-400" /><span className="text-xs text-slate-400">Lv {mode.unlockLevel}</span></div>}
              <div className="relative">
                <div className={`w-12 h-12 bg-gradient-to-br ${mode.color} rounded-xl flex items-center justify-center mb-4 text-2xl shadow-lg`}>{mode.emoji}</div>
                <h3 className="font-display font-bold text-white text-lg mb-1">{mode.label}</h3>
                <p className="text-slate-400 text-sm mb-3 leading-relaxed">{mode.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="xp-badge text-xs"><Zap size={10} />{mode.xp}</span>
                  {!locked && <span className="text-xs text-primary-400 flex items-center gap-1">Start <ChevronRight size={12} /></span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="glass-card p-4 border-primary-500/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="flex items-start gap-2"><span className="text-primary-400">💡</span> Write more than the minimum for bonus XP</div>
          <div className="flex items-start gap-2"><span className="text-green-400">⚡</span> Finish timed challenges early for extra XP</div>
          <div className="flex items-start gap-2"><span className="text-accent-yellow">🏆</span> Score 90%+ to unlock achievement badges</div>
        </div>
      </div>
    </div>
  );
}

function WritingEditor({ mode, prompt, onSubmit, onBack }) {
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const [improving, setImproving] = useState(false);
  const [improveResult, setImproveResult] = useState(null);
  const [selectedSentence, setSelectedSentence] = useState('');

  useEffect(() => { setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0); }, [text]);

  const handleSubmit = async () => {
    if (!text.trim()) return toast.error('Write something first!');
    if (wordCount < (prompt.minWords || 30)) return toast.error(`Write at least ${prompt.minWords || 30} words!`);
    setLoading(true);
    try {
      const { data } = await axios.post('/api/writing/submit', { text, mode: mode.id, promptData: prompt, timeSpent: Math.floor((Date.now() - startTime) / 1000), wordCount });
      onSubmit(data);
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    finally { setLoading(false); }
  };

  const handleImprove = async () => {
    const sel = window.getSelection()?.toString().trim() || selectedSentence;
    if (!sel || sel.length < 5) return toast.error('Select a sentence to improve first!');
    setImproving(true);
    try {
      const { data } = await axios.post('/api/writing/improve', { sentence: sel });
      setImproveResult(data);
    } catch { toast.error('Could not improve sentence'); }
    finally { setImproving(false); }
  };

  const applyImprovement = () => {
    if (!improveResult) return;
    const sel = window.getSelection()?.toString().trim() || selectedSentence;
    if (sel) setText(prev => prev.replace(sel, improveResult.improved));
    setImproveResult(null);
    toast.success('Improvement applied!');
  };

  const pct = Math.min(100, (wordCount / (prompt.minWords || 100)) * 100);
  const barColor = pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-primary-500';
  const connectors = ['Furthermore,', 'However,', 'In contrast,', 'As a result,', 'To conclude,', 'Additionally,', 'Nevertheless,', 'In particular,'];
  const verbs = ['demonstrates', 'argues', 'reveals', 'emphasises', 'highlights', 'suggests'];

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="btn-ghost text-sm py-2 px-3 flex items-center gap-1"><RotateCcw size={14} /> Back</button>
        <span className="text-xl">{mode.emoji}</span>
        <h2 className="text-xl font-display font-bold text-white">{mode.label}</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Prompt */}
          <div className="glass-card p-5 border-primary-500/20 bg-primary-500/5">
            {mode.id === 'story_continuation' && (<div><p className="text-xs text-primary-400 font-semibold mb-2">📖 STORY STARTER</p><p className="text-slate-200 italic leading-relaxed">"{prompt.starter}"</p><p className="text-xs text-slate-500 mt-2">Topic: {prompt.topic}</p></div>)}
            {mode.id === 'news_article' && (<div><p className="text-xs text-primary-400 font-semibold mb-2">📰 HEADLINE</p><p className="text-2xl font-display font-bold text-white mb-2">"{prompt.headline}"</p><p className="text-slate-400 text-sm">{prompt.context}</p></div>)}
            {mode.id === 'letter_email' && (<div><p className="text-xs text-primary-400 font-semibold mb-2">✉️ {prompt.format?.toUpperCase()}</p><p className="text-slate-200 leading-relaxed">{prompt.situation}</p><p className="text-xs text-slate-500 mt-2">Tone: {prompt.tone}</p></div>)}
            {mode.id === 'creative_scene' && (<div><p className="text-xs text-primary-400 font-semibold mb-3">🎭 CREATIVE SCENE</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2"><div className="bg-dark-600/50 rounded-lg p-2"><p className="text-xs text-slate-500">Characters</p><p className="text-xs text-slate-300">{prompt.characters}</p></div><div className="bg-dark-600/50 rounded-lg p-2"><p className="text-xs text-slate-500">Setting</p><p className="text-xs text-slate-300">{prompt.setting}</p></div><div className="bg-dark-600/50 rounded-lg p-2"><p className="text-xs text-slate-500">Situation</p><p className="text-xs text-slate-300">{prompt.situation}</p></div></div></div>)}
            {mode.id === 'timed_challenge' && (<div><p className="text-xs text-primary-400 font-semibold mb-2">⏱️ TIMED CHALLENGE</p><p className="text-xl font-display font-bold text-white mb-3">"{prompt.topic}"</p><CountdownTimer seconds={prompt.timeSeconds || 300} onExpire={() => { toast('⏰ Time up! Submitting...'); handleSubmit(); }} /></div>)}
            {mode.id === 'picture_writing' && (<div><p className="text-xs text-primary-400 font-semibold mb-2">🖼️ PICTURE PROMPT</p><img src={prompt.imageUrl} alt={prompt.description} className="w-full h-44 object-cover rounded-xl mb-3" onError={e => e.target.style.display='none'} /><p className="text-slate-400 text-sm">{prompt.task}</p></div>)}
            <p className="text-xs text-slate-500 mt-3">Minimum: <span className="text-white font-medium">{prompt.minWords || 60} words</span></p>
          </div>

          {/* Textarea */}
          <div className="glass-card p-4">
            <textarea value={text} onChange={e => setText(e.target.value)} onMouseUp={() => setSelectedSentence(window.getSelection()?.toString().trim() || '')}
              placeholder={`Start writing here...\n\nTip: Select any sentence then click "Improve with AI" for suggestions!`}
              className="input-field min-h-[260px] resize-y font-body text-base leading-relaxed" />
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Word count</span>
                <span className={pct >= 100 ? 'text-green-400 font-medium' : 'text-slate-400'}>{wordCount} / {prompt.minWords || 60} minimum {pct >= 100 && '✓'}</span>
              </div>
              <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} rounded-full transition-all duration-300`} style={{ width: `${Math.min(pct,100)}%` }} />
              </div>
            </div>
          </div>

          {improveResult && (
            <div className="glass-card p-4 border-green-500/20 bg-green-500/5 animate-slide-up">
              <p className="text-xs text-green-400 font-semibold mb-2 flex items-center gap-1"><Wand2 size={12} /> AI SUGGESTION</p>
              <p className="text-slate-200 mb-2">"{improveResult.improved}"</p>
              <p className="text-xs text-slate-400 mb-3">{improveResult.explanation}</p>
              <div className="flex gap-2">
                <button onClick={applyImprovement} className="btn-primary text-xs py-1.5 px-3">Apply</button>
                <button onClick={() => setImproveResult(null)} className="btn-ghost text-xs py-1.5 px-3">Dismiss</button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button onClick={handleImprove} disabled={improving || !text.trim()} className="btn-ghost flex items-center gap-2 text-sm disabled:opacity-50">
              {improving ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Wand2 size={14} />} Improve Selected
            </button>
            <button onClick={handleSubmit} disabled={loading || wordCount < (prompt.minWords || 30)} className="btn-primary flex items-center gap-2 flex-1 justify-center disabled:opacity-50">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing...</> : <><Send size={16} /> Submit for Review</>}
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Lightbulb size={12} /> Writing Buddy</h3>
            <p className="text-xs text-slate-500 mb-1.5">Useful connectors:</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {connectors.map(p => <button key={p} onClick={() => setText(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + p + ' ')} className="text-xs bg-dark-600 hover:bg-primary-500/20 hover:text-primary-400 border border-white/5 rounded-full px-2 py-0.5 text-slate-400 transition-all">{p}</button>)}
            </div>
            <p className="text-xs text-slate-500 mb-1.5">Strong verbs:</p>
            <div className="flex flex-wrap gap-1">
              {verbs.map(v => <button key={v} onClick={() => setText(prev => prev + ' ' + v)} className="text-xs bg-dark-600 hover:bg-green-500/20 hover:text-green-400 border border-white/5 rounded-full px-2 py-0.5 text-slate-400 transition-all">{v}</button>)}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Structure Guide</h3>
            <div className="space-y-2 text-xs text-slate-400">
              {mode.id === 'news_article' && ['Opening (who, what, when, where)', 'Background details', 'Expert quotes/opinions', 'Conclusion'].map((s,i) => <div key={i} className="flex items-start gap-2"><span className="text-primary-400">{i+1}.</span>{s}</div>)}
              {mode.id === 'letter_email' && ['Greeting', 'Opening (state purpose)', 'Main body (details)', 'Closing (what you expect)', 'Sign-off'].map((s,i) => <div key={i} className="flex items-start gap-2"><span className="text-primary-400">{i+1}.</span>{s}</div>)}
              {(mode.id === 'story_continuation' || mode.id === 'creative_scene') && ['Set scene and mood', 'Develop characters', 'Build tension/conflict', 'Resolution or cliffhanger'].map((s,i) => <div key={i} className="flex items-start gap-2"><span className="text-primary-400">{i+1}.</span>{s}</div>)}
              {(mode.id === 'timed_challenge' || mode.id === 'picture_writing') && ['Introduction (main idea)', 'Supporting points with examples', 'Descriptive details', 'Conclusion / your opinion'].map((s,i) => <div key={i} className="flex items-start gap-2"><span className="text-primary-400">{i+1}.</span>{s}</div>)}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Live Stats</h3>
            <div className="space-y-2 text-sm">
              {[['Words', wordCount], ['Characters', text.length], ['Sentences', text.split(/[.!?]+/).filter(s => s.trim()).length], ['Paragraphs', text.split(/\n\n+/).filter(p => p.trim()).length || 1]].map(([l, v]) => (
                <div key={l} className="flex justify-between"><span className="text-slate-400">{l}</span><span className="text-white font-medium">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackReport({ result, mode, onRedo, onBack }) {
  const { evaluation, xpEarned, coinsEarned } = result;
  const [showModel, setShowModel] = useState(false);
  const [showCorrected, setShowCorrected] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-slide-up">
      <div className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-white mb-1">Writing Report Card</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{evaluation.feedback}</p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <div className={`text-4xl font-display font-bold ${evaluation.overallScore >= 80 ? 'text-green-400' : evaluation.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{evaluation.overallScore}%</div>
            <div className="text-sm text-slate-400">CEFR: <span className="text-primary-400 font-bold">{evaluation.cefr}</span></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="xp-badge"><Zap size={12} />+{xpEarned} XP</span>
          <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">+{coinsEarned} Coins</span>
          <span className="text-xs bg-dark-600 border border-white/5 rounded-full px-2 py-1 text-slate-400">{evaluation.wordCount} words</span>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><BarChart2 size={18} className="text-primary-400" /> Detailed Scores</h3>
        <ScoreBar label="Grammar" value={evaluation.grammarScore} color="bg-blue-500" />
        <ScoreBar label="Vocabulary" value={evaluation.vocabularyScore} color="bg-purple-500" />
        <ScoreBar label="Coherence" value={evaluation.coherenceScore} color="bg-green-500" />
        <ScoreBar label="Content" value={evaluation.contentScore} color="bg-orange-500" />
        <ScoreBar label="Creativity" value={evaluation.creativityScore} color="bg-pink-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 border-green-500/10">
          <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2"><CheckCircle size={16} /> Strengths</h3>
          <ul className="space-y-2">{(evaluation.strengths||[]).map((s,i) => <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-green-400 shrink-0">✓</span>{s}</li>)}</ul>
        </div>
        <div className="glass-card p-5 border-amber-500/10">
          <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2"><AlertTriangle size={16} /> To Improve</h3>
          <ul className="space-y-2">{(evaluation.improvements||[]).map((s,i) => <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-amber-400 shrink-0">→</span>{s}</li>)}</ul>
        </div>
      </div>

      {evaluation.sentenceAnalysis?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2"><FileText size={18} className="text-primary-400" /> Sentence Analysis</h3>
          <div className="space-y-2">
            {evaluation.sentenceAnalysis.slice(0,6).map((s,i) => (
              <div key={i} className={`p-3 rounded-xl text-sm border ${s.status==='correct'?'border-green-500/20 bg-green-500/5':s.status==='minor'?'border-yellow-500/20 bg-yellow-500/5':'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-start gap-2">
                  <span className={s.status==='correct'?'text-green-400':s.status==='minor'?'text-yellow-400':'text-red-400'}>{s.status==='correct'?'✓':s.status==='minor'?'⚠':'✗'}</span>
                  <div><p className="text-slate-300 italic">"{s.sentence}"</p>{s.note && <p className="text-xs text-slate-500 mt-1">{s.note}</p>}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {evaluation.vocabularyHighlights?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-display font-bold text-white mb-3">Vocabulary Feedback</h3>
          <div className="space-y-2">
            {evaluation.vocabularyHighlights.map((v,i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span>{v.note?'👍':'💡'}</span>
                <div><span className="font-medium text-white">"{v.word}"</span><span className="text-slate-400 ml-2">{v.note || `→ Try: "${v.suggestion}"`}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {evaluation.nextLevelTip && (
        <div className="glass-card p-4 border-primary-500/20 bg-primary-500/5">
          <p className="text-xs text-primary-400 font-semibold mb-1 flex items-center gap-1"><Star size={12} /> NEXT LEVEL TIP</p>
          <p className="text-sm text-slate-300">{evaluation.nextLevelTip}</p>
        </div>
      )}

      {evaluation.modelAnswer && (
        <div className="glass-card p-5">
          <button onClick={() => setShowModel(p=>!p)} className="flex items-center justify-between w-full mb-3">
            <h3 className="font-display font-bold text-white flex items-center gap-2"><Eye size={18} className="text-primary-400" /> Model Answer</h3>
            <span className="text-xs text-slate-400">{showModel?'Hide':'Show'}</span>
          </button>
          {showModel && <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-primary-500/30 pl-4">{evaluation.modelAnswer}</p>}
        </div>
      )}

      {evaluation.correctedText && (
        <div className="glass-card p-5">
          <button onClick={() => setShowCorrected(p=>!p)} className="flex items-center justify-between w-full mb-3">
            <h3 className="font-display font-bold text-white flex items-center gap-2"><BookOpen size={18} className="text-green-400" /> Corrected Version</h3>
            <span className="text-xs text-slate-400">{showCorrected?'Hide':'Show'}</span>
          </button>
          {showCorrected && <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{evaluation.correctedText}</p>}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-ghost flex-1 flex items-center justify-center gap-2"><RotateCcw size={16} /> All Modes</button>
        <button onClick={onRedo} className="btn-primary flex-1 flex items-center justify-center gap-2"><RefreshCw size={16} /> Try Again</button>
      </div>
    </div>
  );
}

export default function Writing() {
  const [phase, setPhase] = useState('modes');
  const [modes, setModes] = useState([]);
  const [selectedMode, setSelectedMode] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const { user, fetchProfile } = useAuth();

  useEffect(() => {
    setUserLevel(user?.level || 1);
    axios.get('/api/writing/modes').then(r => setModes(r.data)).catch(() => {});
  }, [user]);

  const handleSelectMode = async (mode) => {
    setSelectedMode(mode);
    try {
      const { data } = await axios.get(`/api/writing/prompts/${mode.id}`);
      setPrompts(data.prompts || []);
      setPhase('prompts');
    } catch { toast.error('Failed to load prompts'); }
  };

  const handleSubmit = async (data) => {
    setResult(data);
    setReward({ xp: data.xpEarned, coins: data.coinsEarned, score: data.evaluation.overallScore });
    setPhase('feedback');
    await fetchProfile();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {reward && phase === 'feedback' && <XPReward {...reward} onClose={() => setReward(null)} />}

      {phase === 'modes' && <ModeSelector modes={modes} onSelect={handleSelectMode} userLevel={userLevel} />}

      {phase === 'prompts' && selectedMode && (
        <div className="max-w-3xl mx-auto animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setPhase('modes')} className="btn-ghost text-sm py-2 px-3 flex items-center gap-1"><RotateCcw size={14} /> Back</button>
            <span className="text-xl">{selectedMode.emoji}</span>
            <h2 className="text-xl font-display font-bold text-white">{selectedMode.label} — Choose a Prompt</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((prompt, i) => (
              <button key={i} onClick={() => { setSelectedPrompt(prompt); setPhase('editor'); }}
                className="glass-card p-5 text-left hover:border-white/15 hover:scale-[1.02] transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${selectedMode.color} text-white font-medium`}>{prompt.topic || prompt.format || `Prompt ${i+1}`}</span>
                  <span className="text-xs text-slate-500">Min {prompt.minWords} words</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">{prompt.starter || prompt.headline || prompt.situation || prompt.topic || prompt.task}</p>
                {prompt.timeSeconds && <div className="mt-2 flex items-center gap-1 text-xs text-orange-400"><Timer size={12} /> {Math.floor(prompt.timeSeconds/60)} min limit</div>}
                <div className="mt-3 flex items-center gap-1 text-xs text-primary-400 group-hover:gap-2 transition-all">Choose this prompt <ChevronRight size={12} /></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'editor' && selectedMode && selectedPrompt && (
        <WritingEditor mode={selectedMode} prompt={selectedPrompt} onSubmit={handleSubmit} onBack={() => setPhase('prompts')} />
      )}

      {phase === 'feedback' && result && (
        <FeedbackReport result={result} mode={selectedMode} onRedo={() => setPhase('editor')} onBack={() => { setPhase('modes'); setResult(null); setReward(null); }} />
      )}
    </div>
  );
}
