import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Headphones, Play, Pause, RefreshCw, ChevronRight, Zap, Volume2, CheckCircle, XCircle, Lock, Tv, Mic, Info, BarChart2 } from 'lucide-react';
import XPReward from '../components/XPReward';
import { useAuth } from '../context/AuthContext';

const TIER_LABELS = { beginner:'🟢 Beginner', elementary:'🟡 Elementary', intermediate:'🟠 Intermediate', upper_intermediate:'🔴 Upper Intermediate', advanced:'🔥 Advanced', expert:'💎 Expert' };

// ── YouTube Player ────────────────────────────────────────────────────────────
function YouTubePlayer({ videoId, onReady }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoId) return;
    const loadPlayer = () => {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: { cc_load_policy: 1, cc_lang_pref: 'en', hl: 'en', rel: 0, modestbranding: 1 },
          events: { onReady: () => onReady && onReady() }
        });
      }
    };
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = loadPlayer;
    } else { loadPlayer(); }
    return () => { try { playerRef.current?.destroy(); } catch {} };
  }, [videoId]);

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full rounded-xl overflow-hidden" />
    </div>
  );
}

// ── Video Library Page ────────────────────────────────────────────────────────
function VideoLibrary({ library, onSelectVideo, onSwitchToAI }) {
  const tiers = ['beginner','elementary','intermediate','upper_intermediate','advanced','expert'];
  return (
    <div className="max-w-5xl mx-auto animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center"><Headphones size={22} className="text-white" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Listening Centre</h1>
          <p className="text-slate-400 text-sm">Watch real videos or practice with AI passages</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-purple-500/20 border border-purple-500/30 text-purple-400">
          <Tv size={16} /> 🎬 Video Learning
        </button>
        <button onClick={onSwitchToAI} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-slate-400 hover:bg-white/10 transition-all">
          <Mic size={16} /> 🎧 AI Passages
        </button>
      </div>

      <div className="space-y-6">
        {tiers.map(tier => {
          const section = library[tier];
          if (!section) return null;
          return (
            <div key={tier}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-display font-bold text-white">{TIER_LABELS[tier]}</h2>
                {!section.unlocked && <span className="text-xs text-slate-500 bg-dark-600 border border-white/10 rounded-full px-2 py-0.5">Unlock at Level {section.requiredLevel}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {section.videos.map(video => (
                  <button key={video.id} onClick={() => section.unlocked ? onSelectVideo(video) : toast.error(`Reach Level ${section.requiredLevel} to unlock!`)}
                    className={`glass-card p-4 text-left transition-all relative overflow-hidden group ${section.unlocked?'hover:scale-[1.02] hover:border-purple-500/20 cursor-pointer':'opacity-50 cursor-not-allowed'}`}>
                    {!section.unlocked && <div className="absolute top-2 right-2"><Lock size={12} className="text-slate-500" /></div>}
                    <div className="relative mb-3 rounded-lg overflow-hidden bg-dark-600" style={{paddingBottom:'56.25%'}}>
                      <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt={video.title} className="absolute inset-0 w-full h-full object-cover" onError={e=>e.target.style.background='#1e2d4a'} />
                      {section.unlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"><div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center"><Play size={18} className="text-white ml-1" /></div></div>}
                    </div>
                    <h3 className="font-semibold text-white text-xs mb-1 line-clamp-2 leading-tight">{video.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">{video.channel}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{video.duration}</span>
                      <span className="text-xs bg-dark-600 border border-white/5 rounded-full px-2 py-0.5 text-slate-400">{video.topic}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Video Watch + Quiz ────────────────────────────────────────────────────────
function VideoPlayer({ video, onBack, onComplete }) {
  const [phase, setPhase] = useState('watch');
  const [questions, setQuestions] = useState(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  const [showExplanation, setShowExplanation] = useState({});
  const [startTime] = useState(Date.now());
  const { fetchProfile } = useAuth();

  const loadQuestions = async () => {
    setLoadingQ(true);
    try {
      const { data } = await axios.post('/api/listening/video-questions', { videoId: video.youtubeId, title: video.title, topic: video.topic, description: video.description });
      setQuestions(data); setPhase('quiz');
    } catch { toast.error('Failed to load questions. Try again!'); }
    finally { setLoadingQ(false); }
  };

  const handleSubmit = async () => {
    if (!questions) return;
    const unanswered = questions.questions.filter((_,i) => answers[i]===undefined);
    if (unanswered.length) return toast.error('Answer all questions!');
    setSubmitted(true);
    try {
      const ansArr = questions.questions.map((_,i) => answers[i]);
      const timeSpent = Math.floor((Date.now()-startTime)/1000);
      const { data } = await axios.post('/api/listening/submit', { answers: ansArr, questions: questions.questions, topic: video.title, timeSpent, mode: 'video' });
      setResult(data); setReward({ xp: data.xpEarned, coins: data.coinsEarned, score: data.score });
      await fetchProfile();
    } catch { toast.error('Submission failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="btn-ghost text-sm py-2 px-3 flex items-center gap-1"><ChevronRight size={14} className="rotate-180" /> Library</button>
        <h2 className="text-lg font-display font-bold text-white truncate">{video.title}</h2>
      </div>

      {phase === 'watch' && (
        <div className="space-y-4">
          <div className="glass-card p-1 border-purple-500/20 overflow-hidden rounded-2xl">
            <YouTubePlayer videoId={video.youtubeId} onReady={() => {}} />
          </div>
          <div className="glass-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-display font-bold text-white">{video.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{video.channel} • {video.duration}</p>
              </div>
              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full px-2 py-1">{video.topic}</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">{video.description}</p>
            <div className="p-3 bg-dark-600/50 rounded-xl border border-white/5 mb-4">
              <p className="text-xs text-slate-400">💡 <span className="text-white font-medium">Tips:</span> Watch the full video, take notes, pay attention to key vocabulary. Enable subtitles using the CC button in the YouTube player.</p>
            </div>
            <button onClick={loadQuestions} disabled={loadingQ} className="btn-primary w-full flex items-center justify-center gap-2">
              {loadingQ?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Loading questions...</>:<><ChevronRight size={16}/>I'm Done — Test Me</>}
            </button>
          </div>
        </div>
      )}

      {phase === 'quiz' && questions && (
        <div className="space-y-4">
          <div className="glass-card p-4 bg-purple-500/5 border-purple-500/20">
            <div className="flex items-center gap-2 mb-2"><BarChart2 size={16} className="text-purple-400" /><span className="font-semibold text-white">Comprehension Quiz</span></div>
            <p className="text-xs text-slate-400">Based on: {video.title}</p>
          </div>

          {questions.keyPoints?.length > 0 && (
            <div className="glass-card p-4">
              <p className="text-xs text-slate-500 mb-2 font-semibold">KEY POINTS TO REMEMBER:</p>
              <ul className="space-y-1">{questions.keyPoints.map((p,i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-purple-400 shrink-0">•</span>{p}</li>)}</ul>
            </div>
          )}

          {questions.questions.map((q,qi) => (
            <div key={q.id} className="glass-card p-5">
              <p className="font-medium text-white mb-3 text-sm">{qi+1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt,oi) => {
                  const isSelected = answers[qi]===oi;
                  const isCorrect = submitted && oi===q.correct;
                  const isWrong = submitted && isSelected && oi!==q.correct;
                  return (
                    <button key={oi} onClick={() => !submitted && setAnswers(p=>({...p,[qi]:oi}))}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${isCorrect?'border-green-500/50 bg-green-500/10 text-green-400':isWrong?'border-red-500/50 bg-red-500/10 text-red-400':isSelected?'border-purple-500/50 bg-purple-500/10 text-purple-300':'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'} ${submitted?'cursor-default':'cursor-pointer'}`}>
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0">{String.fromCharCode(65+oi)}</span>
                      <span className="flex-1">{opt}</span>
                      {isCorrect && <CheckCircle size={16} />}
                      {isWrong && <XCircle size={16} />}
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <div className="mt-2">
                  <button onClick={() => setShowExplanation(p=>({...p,[qi]:!p[qi]}))} className="text-xs flex items-center gap-1 text-primary-400"><Info size={12}/>{showExplanation[qi]?'Hide':'Show'} Explanation</button>
                  {showExplanation[qi] && <p className="text-xs text-slate-400 mt-2 p-3 bg-dark-600/50 rounded-lg">{q.explanation}</p>}
                </div>
              )}
            </div>
          ))}

          {questions.vocabulary?.length > 0 && submitted && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3 text-sm">📚 Vocabulary from this Video</h3>
              <div className="space-y-2">
                {questions.vocabulary.map((v,i) => (
                  <div key={i} className="bg-dark-600/50 rounded-xl p-3">
                    <span className="font-medium text-white text-sm">{v.word}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{v.definition}</p>
                    {v.example && <p className="text-xs text-slate-500 italic mt-0.5">"{v.example}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {questions.discussionQuestion && submitted && (
            <div className="glass-card p-4 border-primary-500/10 bg-primary-500/5">
              <p className="text-xs text-primary-400 font-semibold mb-1">💬 DISCUSSION QUESTION</p>
              <p className="text-sm text-slate-300">{questions.discussionQuestion}</p>
            </div>
          )}

          {!submitted ? (
            <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2"><ChevronRight size={16}/> Submit Answers</button>
          ) : result && (
            <div className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-white">Results</h3>
                <span className={`text-3xl font-display font-bold ${result.score>=80?'text-green-400':result.score>=60?'text-yellow-400':'text-red-400'}`}>{result.score}%</span>
              </div>
              <p className="text-slate-300 mb-3">{result.correct} out of {result.total} correct</p>
              <div className="flex gap-2 mb-4"><span className="xp-badge"><Zap size={12}/>+{result.xpEarned} XP</span></div>
              <button onClick={onBack} className="btn-ghost w-full text-sm flex items-center justify-center gap-2"><RefreshCw size={14}/> Watch Another</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── AI Passage Mode (Original Feature) ───────────────────────────────────────
function AIPassageMode({ topics, onBack }) {
  const [selectedTopic, setSelectedTopic] = useState('Daily Life');
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const { fetchProfile } = useAuth();

  const generate = async () => {
    setLoading(true); setAnswers({}); setSubmitted(false); setResult(null); setReward(null);
    try {
      const { data } = await axios.post('/api/listening/generate', { topic: selectedTopic });
      setExercise(data); setStartTime(Date.now());
    } catch { toast.error('Failed to generate. Try again!'); }
    finally { setLoading(false); }
  };

  const speak = () => {
    if (!exercise?.passage) return;
    if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
    const utt = new SpeechSynthesisUtterance(exercise.passage);
    utt.lang = 'en-US'; utt.rate = 0.9;
    const voices = speechSynthesis.getVoices();
    const pref = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
    if (pref) utt.voice = pref;
    utt.onend = () => setSpeaking(false);
    speechSynthesis.speak(utt); setSpeaking(true);
  };

  const handleSubmit = async () => {
    const unanswered = exercise.questions.filter((_,i) => answers[i]===undefined);
    if (unanswered.length) return toast.error('Answer all questions!');
    setSubmitted(true); speechSynthesis.cancel(); setSpeaking(false);
    try {
      const ansArr = exercise.questions.map((_,i) => answers[i]);
      const timeSpent = startTime ? Math.floor((Date.now()-startTime)/1000) : 0;
      const { data } = await axios.post('/api/listening/submit', { answers: ansArr, questions: exercise.questions, topic: exercise.title, timeSpent, mode: 'ai' });
      setResult(data); setReward({ xp: data.xpEarned, coins: data.coinsEarned, score: data.score });
      await fetchProfile();
    } catch { toast.error('Submission failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="btn-ghost text-sm py-2 px-3 flex items-center gap-1"><ChevronRight size={14} className="rotate-180"/> Videos</button>
        <h2 className="text-xl font-display font-bold text-white">AI Listening Passages</h2>
      </div>

      {!exercise ? (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Choose a Topic</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {topics.map(t => <button key={t} onClick={() => setSelectedTopic(t)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedTopic===t?'bg-purple-500/20 border-purple-500/40 text-purple-400':'border-white/10 text-slate-400 hover:border-white/20'}`}>{t}</button>)}
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Generating...</>:<><Mic size={16}/>Generate Passage</>}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card p-5 border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-white">{exercise.title}</h3>
              <button onClick={speak} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${speaking?'bg-purple-500 text-white animate-pulse':'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'}`}>
                {speaking?<><Pause size={14}/>Stop</>:<><Play size={14}/>Listen</>}
              </button>
            </div>
            <div className="bg-dark-600/50 rounded-xl p-4 mb-3">
              <p className="text-sm text-slate-300 leading-relaxed">{submitted ? exercise.passage : '🎧 Click "Listen" to hear the passage, then answer the questions below.'}</p>
              {!submitted && <p className="text-xs text-slate-500 mt-2">💡 Transcript revealed after you submit</p>}
            </div>
            {exercise.vocabulary?.length > 0 && (
              <div className="flex flex-wrap gap-2">{exercise.vocabulary.map((v,i) => <span key={i} title={v.meaning} className="text-xs bg-dark-600 border border-white/10 rounded-lg px-2 py-1 text-slate-300 cursor-help">{v.word}</span>)}</div>
            )}
          </div>

          <div className="space-y-4">
            {exercise.questions.map((q,qi) => (
              <div key={q.id} className="glass-card p-5">
                <p className="font-medium text-white mb-3 text-sm">{qi+1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt,oi) => {
                    const isSelected = answers[qi]===oi;
                    const isCorrect = submitted && oi===q.correct;
                    const isWrong = submitted && isSelected && oi!==q.correct;
                    return (
                      <button key={oi} onClick={() => !submitted && setAnswers(p=>({...p,[qi]:oi}))}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${isCorrect?'border-green-500/50 bg-green-500/10 text-green-400':isWrong?'border-red-500/50 bg-red-500/10 text-red-400':isSelected?'border-purple-500/50 bg-purple-500/10 text-purple-300':'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'} ${submitted?'cursor-default':'cursor-pointer'}`}>
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0">{String.fromCharCode(65+oi)}</span>
                        <span className="flex-1">{opt}</span>
                        {isCorrect && <CheckCircle size={16}/>}
                        {isWrong && <XCircle size={16}/>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!submitted ? (
            <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2"><ChevronRight size={16}/> Submit Answers</button>
          ) : result && (
            <div className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-white">Results</h3>
                <span className={`text-3xl font-display font-bold ${result.score>=80?'text-green-400':result.score>=60?'text-yellow-400':'text-red-400'}`}>{result.score}%</span>
              </div>
              <p className="text-slate-300 mb-3">{result.correct} / {result.total} correct</p>
              <div className="flex gap-2 mb-4"><span className="xp-badge"><Zap size={12}/>+{result.xpEarned} XP</span></div>
              <button onClick={() => {setExercise(null);setResult(null);setReward(null);}} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"><RefreshCw size={14}/>Try Another</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Listening Page ───────────────────────────────────────────────────────
export default function Listening() {
  const [phase, setPhase] = useState('library');
  const [library, setLibrary] = useState({});
  const [topics, setTopics] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    Promise.all([axios.get('/api/listening/videos'), axios.get('/api/listening/info')])
      .then(([v, i]) => { setLibrary(v.data.library || {}); setTopics(i.data.topics || []); })
      .catch(() => toast.error('Failed to load listening content'));
  }, []);

  if (phase === 'video' && selectedVideo) return <VideoPlayer video={selectedVideo} onBack={() => { setPhase('library'); setSelectedVideo(null); }} />;
  if (phase === 'ai') return <AIPassageMode topics={topics} onBack={() => setPhase('library')} />;

  return (
    <VideoLibrary
      library={library}
      onSelectVideo={(v) => { setSelectedVideo(v); setPhase('video'); }}
      onSwitchToAI={() => setPhase('ai')}
    />
  );
}
