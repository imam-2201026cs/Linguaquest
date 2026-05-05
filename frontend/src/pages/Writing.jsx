import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PenTool, Send, RotateCcw, Zap, BookOpen, Star, Timer,
  ChevronRight, Lock, Lightbulb, CheckCircle, AlertTriangle,
  Newspaper, Mail, Image, BarChart2, RefreshCw, Eye, Wand2, FileText,
  Maximize2, Minimize2, Sparkles, MessageSquarePlus
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
      <div className={`font-mono text-2xl font-bold ${col}`}>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</div>
      <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function WritingRoadmap({ library, onSelectLesson, completedCount }) {
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <PenTool size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Writing Centre <span className="text-blue-500 text-xs">v2.0</span></h1>
            <p className="text-slate-400 text-sm">90 Level-wise Lessons (A1-C2)</p>
          </div>
        </div>
        <div className="glass-card px-6 py-3 flex items-center gap-4 border-blue-500/20 bg-blue-500/5">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Mastery</p>
            <p className="text-xl font-display font-black text-white">{completedCount} / 90</p>
          </div>
          <Trophy size={32} className="text-yellow-400" />
        </div>
      </div>

      <div className="space-y-12">
        {levels.map((lvl) => {
          const section = library[lvl];
          if (!section) return null;
          
          return (
            <div key={lvl} className="relative">
              <div className="flex items-center gap-4 mb-6 sticky top-0 z-10 py-2 bg-dark-900/80 backdrop-blur-md">
                <div className="text-2xl font-bold text-blue-400">{lvl.toUpperCase()}</div>
                <div className="flex-1">
                  <h2 className="text-xl font-display font-bold text-white">{section.label}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden max-w-[200px]">
                      <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${section.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{section.progress}% Complete</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {section.lessons.map((lesson, index) => {
                  const isLocked = !lesson.isUnlocked;
                  const isCompleted = lesson.isCompleted;
                  
                  return (
                    <button
                      key={lesson.id}
                      disabled={isLocked}
                      onClick={() => !isLocked && onSelectLesson(lesson)}
                      className={`relative group p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center ${
                        isCompleted 
                        ? 'bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/5' 
                        : isLocked 
                        ? 'bg-dark-800/50 border-white/5 opacity-40 cursor-not-allowed'
                        : 'bg-dark-700 border-white/10 hover:border-blue-500/50 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer'
                      }`}
                    >
                      <div className="absolute -top-2 -right-2 z-20">
                        {isCompleted ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                        ) : isLocked ? (
                          <div className="w-6 h-6 bg-dark-800 border border-white/10 rounded-full flex items-center justify-center">
                            <Lock size={12} className="text-slate-500" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                            <Zap size={12} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {lesson.emoji}
                      </div>
                      
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">
                        Lesson {index + 1}
                      </div>
                      <h3 className="text-xs font-bold text-white leading-tight line-clamp-2 min-h-[32px]">
                        {lesson.title}
                      </h3>
                    </button>
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
        toast.success(`🎯 Mission Accomplished! Included "${mission.word}"`, { icon: '🎯' });
      }
    } else {
      setIsMissionComplete(false);
    }

    const checkMilestone = (count, emoji, msg) => {
      if (currentWordCount >= count && !milestones.has(count)) {
        toast.success(`${emoji} ${count} words! ${msg}`, { duration: 3000 });
        setMilestones(prev => new Set([...prev, count]));
      }
    };
    if (currentWordCount >= 50) checkMilestone(50, '🌱', 'Great start!');
    if (currentWordCount >= 100) checkMilestone(100, '🌿', 'You are on a roll!');
    if (currentWordCount >= 200) checkMilestone(200, '🌳', 'Writing Master!');
  }, [text]);

  const handleSubmit = async () => {
    if (!text.trim()) return toast.error('Write something first!');
    if (wordCount < (prompt.minWords || 30)) return toast.error(`Write at least ${prompt.minWords || 30} words!`);
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

  const handleSuggestIdea = async () => {
    setMuseLoading(true);
    try {
      const { data } = await axios.post('/api/writing/suggest-idea', {
        text,
        prompt: prompt.starter || prompt.headline || prompt.topic || prompt.task,
        mode: lesson.modeId
      });
      setMuseSuggestions(data);
    } catch { toast.error('AI Muse is taking a break...'); }
    finally { setMuseLoading(false); }
  };

  const applySuggestion = (s) => {
    setText(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + s);
    setMuseSuggestions(null);
    toast.success('Idea added!');
  };

  const pct = Math.min(100, (wordCount / (prompt.minWords || 100)) * 100);
  const barColor = pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-primary-500';
  const connectors = ['Furthermore,', 'However,', 'In contrast,', 'As a result,', 'To conclude,', 'Additionally,', 'Nevertheless,', 'In particular,'];
  const verbs = ['demonstrates', 'argues', 'reveals', 'emphasises', 'highlights', 'suggests'];

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost text-sm py-2 px-3 flex items-center gap-1"><RotateCcw size={14} /> Back to Roadmap</button>
          <span className="text-xl">{lesson.emoji}</span>
          <h2 className="text-xl font-display font-bold text-white">{lesson.title}</h2>
        </div>
        <button onClick={() => setFocusMode(!focusMode)} className="btn-ghost text-xs flex items-center gap-2">
          {focusMode ? <><Minimize2 size={14} /> Exit Focus</> : <><Maximize2 size={14} /> Focus Mode</>}
        </button>
      </div>

      <div className={`grid grid-cols-1 ${focusMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-4 transition-all duration-500`}>
        <div className={focusMode ? 'max-w-2xl mx-auto w-full space-y-6' : 'lg:col-span-2 space-y-4'}>
          {mission && (
            <div className={`p-3 rounded-xl border transition-all duration-500 flex items-center justify-between ${isMissionComplete ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMissionComplete ? 'bg-green-500 text-white' : 'bg-blue-500 text-white animate-pulse'}`}>
                  <Zap size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Daily Mission</p>
                  <p className="text-sm font-semibold">Include the word: <span className="underline decoration-2 underline-offset-4">{mission.word}</span></p>
                </div>
              </div>
              {isMissionComplete && <CheckCircle size={20} className="text-green-500" />}
            </div>
          )}

          <div className="glass-card p-6 border-blue-500/20 bg-blue-500/5">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">Prompt Task</p>
            <h3 className="text-lg font-bold text-white mb-3">{prompt.task}</h3>
            {prompt.starter && <p className="text-slate-300 italic mb-4">"{prompt.starter}"</p>}
            {prompt.imageUrl && <img src={prompt.imageUrl} className="w-full h-48 object-cover rounded-xl mb-4" alt="Prompt" />}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><FileText size={12} /> Min {prompt.minWords} words</span>
              {prompt.timeSeconds > 0 && <span className="flex items-center gap-1 text-orange-400"><Timer size={12} /> Timed Challenge</span>}
            </div>
          </div>

          <div className="glass-card p-4">
            <textarea 
              value={text} 
              onChange={e => setText(e.target.value)}
              placeholder="Start writing here..."
              className="input-field min-h-[300px] resize-y font-body text-base leading-relaxed"
            />
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Word count: {wordCount}</span>
                <span className={pct >= 100 ? 'text-green-400 font-medium' : 'text-slate-400'}>{pct.toFixed(0)}% of target</span>
              </div>
              <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={handleImprove} disabled={improving || !text.trim()} className="btn-ghost flex items-center gap-2 text-sm">
              <Wand2 size={14} /> Improve
            </button>
            <button onClick={handleSuggestIdea} disabled={museLoading || !text.trim()} className="btn-ghost flex items-center gap-2 text-sm text-blue-400 border-blue-500/20">
              <Sparkles size={14} /> Suggest Idea
            </button>
            <button onClick={handleSubmit} disabled={loading || wordCount < (prompt.minWords || 30)} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? "Analyzing..." : <><Send size={16} /> Submit Writing</>}
            </button>
          </div>

          {improveResult && (
             <div className="glass-card p-4 border-green-500/20 bg-green-500/5 animate-slide-up">
               <p className="text-xs text-green-400 font-bold mb-2">AI Suggestion</p>
               <p className="text-white mb-2 italic">"{improveResult.improved}"</p>
               <p className="text-xs text-slate-400 mb-3">{improveResult.explanation}</p>
               <div className="flex gap-2">
                 <button onClick={applyImprovement} className="btn-primary text-xs py-1.5 px-3">Apply</button>
                 <button onClick={() => setImproveResult(null)} className="btn-ghost text-xs py-1.5 px-3">Dismiss</button>
               </div>
             </div>
          )}

          {museSuggestions && (
            <div className="glass-card p-4 border-blue-500/20 bg-blue-500/5 animate-slide-up">
              <p className="text-xs text-blue-400 font-bold mb-3">AI Muse Suggestions</p>
              <div className="space-y-2 mb-4">
                {museSuggestions.suggestions.map((s, i) => (
                  <button key={i} onClick={() => applySuggestion(s)} className="w-full text-left p-3 rounded-lg bg-dark-600/50 hover:bg-blue-500/20 border border-white/5 text-sm text-slate-300 transition-all">
                    "{s}"
                  </button>
                ))}
              </div>
              <button onClick={() => setMuseSuggestions(null)} className="text-xs text-slate-400">Dismiss</button>
            </div>
          )}
        </div>

        {!focusMode && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Connectors</h3>
              <div className="flex flex-wrap gap-1">
                {connectors.map(p => <button key={p} onClick={() => setText(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + p + ' ')} className="text-xs bg-dark-600 hover:bg-blue-500/20 px-2 py-1 rounded-lg text-slate-400">{p}</button>)}
              </div>
            </div>
            <div className="glass-card p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Live Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span>Sentences</span><span className="text-white font-bold">{text.split(/[.!?]+/).filter(s => s.trim()).length}</span></div>
                <div className="flex justify-between text-slate-400"><span>Characters</span><span className="text-white font-bold">{text.length}</span></div>
              </div>
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
    <div className="max-w-4xl mx-auto space-y-5 animate-slide-up pb-20">
      <div className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold text-white mb-1">Writing Report Card</h2>
            <p className="text-slate-400 text-sm">{evaluation.feedback}</p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <div className={`text-5xl font-display font-black ${evaluation.overallScore >= 80 ? 'text-green-400' : evaluation.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{evaluation.overallScore}%</div>
            <div className="text-xs font-bold text-slate-500 uppercase">CEFR Level: <span className="text-blue-400">{evaluation.cefr}</span></div>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="xp-badge bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Zap size={12} /> +{xpEarned} XP</span>
          <span className="xp-badge bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Trophy size={12} /> +{coinsEarned} Coins</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="glass-card p-5">
           <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Scores</h3>
           <ScoreBar label="Grammar" value={evaluation.grammarScore} color="bg-blue-500" />
           <ScoreBar label="Vocabulary" value={evaluation.vocabularyScore} color="bg-purple-500" />
           <ScoreBar label="Coherence" value={evaluation.coherenceScore} color="bg-green-500" />
         </div>
         <div className="glass-card p-5 md:col-span-2">
           <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Strengths & Improvements</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <ul className="space-y-2">
               {evaluation.strengths.map((s, i) => <li key={i} className="text-xs text-green-400 flex items-start gap-2"><span>✓</span> {s}</li>)}
             </ul>
             <ul className="space-y-2">
               {evaluation.improvements.map((s, i) => <li key={i} className="text-xs text-yellow-400 flex items-start gap-2"><span>→</span> {s}</li>)}
             </ul>
           </div>
         </div>
      </div>

      <div className="glass-card p-6">
        <button onClick={() => setShowCorrected(!showCorrected)} className="flex items-center justify-between w-full mb-4">
          <h3 className="font-bold text-white flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Corrected Version</h3>
          <span className="text-xs text-slate-500">{showCorrected ? 'Hide' : 'Show'}</span>
        </button>
        {showCorrected && <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-dark-800/50 p-4 rounded-xl border border-white/5">{evaluation.correctedText}</p>}
      </div>

      <div className="glass-card p-6">
        <button onClick={() => setShowModel(!showModel)} className="flex items-center justify-between w-full mb-4">
          <h3 className="font-bold text-white flex items-center gap-2"><BookOpen size={18} className="text-blue-500" /> Model Answer</h3>
          <span className="text-xs text-slate-500">{showModel ? 'Hide' : 'Show'}</span>
        </button>
        {showModel && <p className="text-slate-300 text-sm leading-relaxed italic bg-dark-800/50 p-4 rounded-xl border border-white/5">{evaluation.modelAnswer}</p>}
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={onBack} className="btn-ghost flex-1 py-4 flex items-center justify-center gap-2"><RotateCcw size={18} /> Roadmap</button>
        <button onClick={onRedo} className="btn-primary flex-1 py-4 flex items-center justify-center gap-2"><RefreshCw size={18} /> Try Again</button>
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
    } catch { toast.error("Failed to load writing centre"); }
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
    } catch { toast.error("Failed to load lesson. Please try again."); }
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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full" />
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          <Sparkles size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
        </div>
        <p className="text-slate-400 animate-pulse font-display font-bold">Generating your writing challenge...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
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
e('modes'); setResult(null); setReward(null); }} />
      )}
    </div>
  );
}