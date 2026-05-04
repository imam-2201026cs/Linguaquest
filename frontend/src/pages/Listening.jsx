import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Headphones, Play, Pause, RefreshCw, ChevronRight, Zap,
  CheckCircle, XCircle, Lock, Tv, Mic, Info, BarChart2
} from 'lucide-react';
import XPReward from '../components/XPReward';
import { useAuth } from '../context/AuthContext';

const VIDEO_LIBRARY = {
  beginner: {
    unlockLevel: 1, label: '🟢 Beginner',
    videos: [
      { id: 'v_b1', youtubeId: 'mFCOUMsr0Hk', title: 'Peppa Pig - Best Moments', channel: 'Peppa Pig Official', duration: '10 min', topic: 'Family & Animals', description: 'Fun moments with Peppa Pig and her family' },
      { id: 'v_b2', youtubeId: 'tos_O0WFeiM', title: 'Wheels on the Bus + Nursery Rhymes', channel: 'Cocomelon', duration: '8 min', topic: 'Songs & Learning', description: 'Popular nursery rhymes to build basic English vocabulary' },
      { id: 'v_b3', youtubeId: 'E2x3HdPlkQQ', title: 'Kids Vocabulary - Animals', channel: 'English Singsing', duration: '5 min', topic: 'Vocabulary', description: 'Learn animal names and sounds in English' },
      { id: 'v_b4', youtubeId: '6dR86-dDqhc', title: 'Weather Words for Kids', channel: 'English Singsing', duration: '5 min', topic: 'Weather', description: 'Learn weather words and expressions in English' },
    ]
  },
  elementary: {
    unlockLevel: 3, label: '🟡 Elementary',
    videos: [
      { id: 'v_e1', youtubeId: 'XiCrniLQGYc', title: 'Amazing Animals', channel: 'Nat Geo Kids', duration: '8 min', topic: 'Animals & Nature', description: 'Fascinating facts about animals from around the world' },
      { id: 'v_e2', youtubeId: 'AnvJ3kpWMG4', title: '6 Minute English - Sleep', channel: 'BBC Learning English', duration: '6 min', topic: 'Health', description: 'Discuss sleep and health using real natural English' },
      { id: 'v_e3', youtubeId: 'vQFSBFiH8PY', title: '6 Minute English - Technology', channel: 'BBC Learning English', duration: '6 min', topic: 'Technology', description: 'Talk about technology using everyday English' },
      { id: 'v_e4', youtubeId: 'LnMTBxhUFhY', title: 'English Conversation Practice', channel: 'Learn English', duration: '10 min', topic: 'Conversation', description: 'Natural English conversation practice' },
    ]
  },
  intermediate: {
    unlockLevel: 5, label: '🟠 Intermediate',
    videos: [
      { id: 'v_i1', youtubeId: 'OWASCXDGOWo', title: 'How Does the Brain Work?', channel: 'TED-Ed', duration: '5 min', topic: 'Science', description: 'An animated explanation of how our brain functions' },
      { id: 'v_i2', youtubeId: 'NbuUW9i-mHs', title: 'What Makes a Hero?', channel: 'TED-Ed', duration: '4 min', topic: 'Literature', description: "The hero's journey explained through great stories" },
      { id: 'v_i3', youtubeId: 'Y6e_m9iq-4Q', title: 'How Do Vaccines Work?', channel: 'TED-Ed', duration: '5 min', topic: 'Health', description: 'The science behind vaccines explained simply' },
      { id: 'v_i4', youtubeId: 'e-QFj59PON4', title: 'The History of English', channel: 'TED-Ed', duration: '5 min', topic: 'Language', description: 'How the English language evolved over 1400 years' },
    ]
  },
  upper_intermediate: {
    unlockLevel: 8, label: '🔴 Upper Intermediate',
    videos: [
      { id: 'v_u1', youtubeId: 'arj7oStGLkU', title: 'Your Body Language Shapes Who You Are', channel: 'TED', duration: '21 min', topic: 'Psychology', description: 'Amy Cuddy on how body language affects your mind' },
      { id: 'v_u2', youtubeId: 'iG9CE55wbtY', title: 'Do Schools Kill Creativity?', channel: 'TED', duration: '20 min', topic: 'Education', description: 'Sir Ken Robinson on creativity in schools' },
      { id: 'v_u3', youtubeId: 'H14bBuluwB8', title: 'The Power of Introverts', channel: 'TED', duration: '19 min', topic: 'Psychology', description: 'Susan Cain celebrates the power of introverted people' },
      { id: 'v_u4', youtubeId: 'RcGyVTAoXEU', title: 'The Danger of a Single Story', channel: 'TED', duration: '18 min', topic: 'Culture', description: 'Chimamanda Adichie on stereotypes and storytelling' },
    ]
  },
  advanced: {
    unlockLevel: 11, label: '🔥 Advanced',
    videos: [
      { id: 'v_a1', youtubeId: 'VcjzHMhBtf0', title: 'How Language Shapes the Way We Think', channel: 'TED', duration: '14 min', topic: 'Language', description: 'How the language you speak influences your thoughts' },
      { id: 'v_a2', youtubeId: '_mG-hhWL_ug', title: 'Why Good Leaders Make You Feel Safe', channel: 'TED', duration: '12 min', topic: 'Leadership', description: 'Simon Sinek on what makes a great leader' },
      { id: 'v_a3', youtubeId: 'JC82Il2cjqA', title: 'How to Speak So People Want to Listen', channel: 'TED', duration: '10 min', topic: 'Communication', description: 'Julian Treasure on powerful speaking' },
    ]
  },
  expert: {
    unlockLevel: 15, label: '💎 Expert',
    videos: [
      { id: 'v_x1', youtubeId: '8jPQjjsBbIc', title: 'The Puzzle of Motivation', channel: 'TED', duration: '18 min', topic: 'Psychology', description: 'Dan Pink challenges traditional notions of motivation' },
      { id: 'v_x2', youtubeId: 'eIho2S0ZahI', title: 'The Art of Innovation', channel: 'TED', duration: '16 min', topic: 'Business', description: 'Tom Kelley on building a culture of creativity' },
    ]
  },
};

function YouTubePlayer({ videoId }) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    const loadPlayer = () => {
      if (window.YT && window.YT.Player) {
        new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: { cc_load_policy: 1, cc_lang_pref: 'en', hl: 'en', rel: 0, modestbranding: 1 },
        });
      }
    };
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = loadPlayer;
    } else { loadPlayer(); }
  }, [videoId]);
  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

function VideoLibrary({ onSelectVideo, onSwitchToAI, userLevel }) {
  const tiers = ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'expert'];
  return (
    <div className="max-w-5xl mx-auto animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
          <Headphones size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Listening Centre</h1>
          <p className="text-slate-400 text-sm">Watch real videos or practise with AI passages</p>
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
      <div className="space-y-8">
        {tiers.map(tier => {
          const section = VIDEO_LIBRARY[tier];
          const unlocked = userLevel >= section.unlockLevel;
          return (
            <div key={tier}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-display font-bold text-white">{section.label}</h2>
                {!unlocked && <span className="text-xs text-slate-500 bg-dark-600 border border-white/10 rounded-full px-2 py-0.5">Unlock at Level {section.unlockLevel}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {section.videos.map(video => (
                  <button key={video.id}
                    onClick={() => unlocked ? onSelectVideo(video) : toast.error(`Reach Level ${section.unlockLevel} to unlock!`)}
                    className={`glass-card p-3 text-left transition-all relative overflow-hidden group ${unlocked ? 'hover:scale-[1.02] hover:border-purple-500/20 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                    {!unlocked && <div className="absolute top-2 right-2"><Lock size={12} className="text-slate-500" /></div>}
                    <div className="relative mb-3 rounded-lg overflow-hidden bg-dark-600" style={{ paddingBottom: '56.25%' }}>
                      <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                      {unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center"><Play size={18} className="text-white ml-1" /></div>
                        </div>
                      )}
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

function VideoPlayer({ video, onBack }) {
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
    if (questions.questions.some((_, i) => answers[i] === undefined)) return toast.error('Answer all questions!');
    setSubmitted(true);
    try {
      const { data } = await axios.post('/api/listening/submit', {
        answers: questions.questions.map((_, i) => answers[i]),
        questions: questions.questions, topic: video.title,
        timeSpent: Math.floor((Date.now() - startTime) / 1000), mode: 'video'
      });
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
          <div className="glass-card p-2 border-purple-500/20 rounded-2xl overflow-hidden"><YouTubePlayer videoId={video.youtubeId} /></div>
          <div className="glass-card p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-display font-bold text-white">{video.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{video.channel} • {video.duration}</p>
              </div>
              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full px-2 py-1 shrink-0">{video.topic}</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">{video.description}</p>
            <div className="p-3 bg-dark-600/50 rounded-xl border border-white/5 mb-4">
              <p className="text-xs text-slate-400">💡 <span className="text-white font-medium">Tips:</span> Watch the full video carefully. Enable subtitles using the <strong>CC</strong> button. Take notes on key points.</p>
            </div>
            <button onClick={loadQuestions} disabled={loadingQ} className="btn-primary w-full flex items-center justify-center gap-2">
              {loadingQ ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading questions...</> : <><ChevronRight size={16} /> I'm Done — Test Me</>}
            </button>
          </div>
        </div>
      )}
      {phase === 'quiz' && questions && (
        <div className="space-y-4">
          <div className="glass-card p-4 bg-purple-500/5 border-purple-500/20">
            <div className="flex items-center gap-2 mb-1"><BarChart2 size={16} className="text-purple-400" /><span className="font-semibold text-white">Comprehension Quiz</span></div>
            <p className="text-xs text-slate-400">Based on: {video.title}</p>
          </div>
          {questions.keyPoints?.length > 0 && (
            <div className="glass-card p-4">
              <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Key Points:</p>
              <ul className="space-y-1">{questions.keyPoints.map((p, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-purple-400 shrink-0">•</span>{p}</li>)}</ul>
            </div>
          )}
          {questions.questions.map((q, qi) => (
            <div key={q.id} className="glass-card p-5">
              <p className="font-medium text-white mb-3 text-sm">{qi + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrect = submitted && oi === q.correct;
                  const isWrong = submitted && isSelected && oi !== q.correct;
                  return (
                    <button key={oi} onClick={() => !submitted && setAnswers(p => ({ ...p, [qi]: oi }))}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${isCorrect ? 'border-green-500/50 bg-green-500/10 text-green-400' : isWrong ? 'border-red-500/50 bg-red-500/10 text-red-400' : isSelected ? 'border-purple-500/50 bg-purple-500/10 text-purple-300' : 'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}>
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0">{String.fromCharCode(65 + oi)}</span>
                      <span className="flex-1">{opt}</span>
                      {isCorrect && <CheckCircle size={16} />}{isWrong && <XCircle size={16} />}
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <div className="mt-2">
                  <button onClick={() => setShowExplanation(p => ({ ...p, [qi]: !p[qi] }))} className="text-xs flex items-center gap-1 text-primary-400">
                    <Info size={12} /> {showExplanation[qi] ? 'Hide' : 'Show'} Explanation
                  </button>
                  {showExplanation[qi] && <p className="text-xs text-slate-400 mt-2 p-3 bg-dark-600/50 rounded-lg">{q.explanation}</p>}
                </div>
              )}
            </div>
          ))}
          {questions.vocabulary?.length > 0 && submitted && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3 text-sm">📚 Vocabulary from this Video</h3>
              <div className="space-y-2">
                {questions.vocabulary.map((v, i) => (
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
          {!submitted
            ? <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2"><ChevronRight size={16} /> Submit Answers</button>
            : result && (
              <div className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-white">Results</h3>
                  <span className={`text-3xl font-display font-bold ${result.score >= 80 ? 'text-green-400' : result.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{result.score}%</span>
                </div>
                <p className="text-slate-300 mb-3">{result.correct} out of {result.total} correct</p>
                <div className="flex gap-2 mb-4"><span className="xp-badge"><Zap size={12} />+{result.xpEarned} XP</span></div>
                <button onClick={onBack} className="btn-ghost w-full text-sm flex items-center justify-center gap-2"><RefreshCw size={14} /> Watch Another</button>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}

function AIPassageMode({ onBack }) {
  const topics = ['Daily Life', 'Travel & Tourism', 'Technology', 'Health & Wellness', 'Environment', 'Food & Culture', 'Science', 'Sports', 'Business', 'History'];
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
    const pref = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
    if (pref) utt.voice = pref;
    utt.onend = () => setSpeaking(false);
    speechSynthesis.speak(utt); setSpeaking(true);
  };

  const handleSubmit = async () => {
    if (exercise.questions.some((_, i) => answers[i] === undefined)) return toast.error('Answer all questions!');
    setSubmitted(true); speechSynthesis.cancel(); setSpeaking(false);
    try {
      const { data } = await axios.post('/api/listening/submit', {
        answers: exercise.questions.map((_, i) => answers[i]),
        questions: exercise.questions, topic: exercise.title,
        timeSpent: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0, mode: 'ai'
      });
      setResult(data); setReward({ xp: data.xpEarned, coins: data.coinsEarned, score: data.score });
      await fetchProfile();
    } catch { toast.error('Submission failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="btn-ghost text-sm py-2 px-3 flex items-center gap-1"><ChevronRight size={14} className="rotate-180" /> Videos</button>
        <h2 className="text-xl font-display font-bold text-white">AI Listening Passages</h2>
      </div>
      {!exercise ? (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Choose a Topic</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {topics.map(t => (
              <button key={t} onClick={() => setSelectedTopic(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedTopic === t ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>{t}</button>
            ))}
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : <><Mic size={16} /> Generate Passage</>}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card p-5 border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-white">{exercise.title}</h3>
              <button onClick={speak} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${speaking ? 'bg-purple-500 text-white animate-pulse' : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'}`}>
                {speaking ? <><Pause size={14} /> Stop</> : <><Play size={14} /> Listen</>}
              </button>
            </div>
            <div className="bg-dark-600/50 rounded-xl p-4 mb-3">
              <p className="text-sm text-slate-300 leading-relaxed">{submitted ? exercise.passage : '🎧 Click "Listen" to hear the passage, then answer the questions below.'}</p>
              {!submitted && <p className="text-xs text-slate-500 mt-2">💡 Transcript revealed after submitting</p>}
            </div>
            {exercise.vocabulary?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exercise.vocabulary.map((v, i) => <span key={i} title={v.meaning} className="text-xs bg-dark-600 border border-white/10 rounded-lg px-2 py-1 text-slate-300 cursor-help">{v.word}</span>)}
              </div>
            )}
          </div>
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
                      <button key={oi} onClick={() => !submitted && setAnswers(p => ({ ...p, [qi]: oi }))}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${isCorrect ? 'border-green-500/50 bg-green-500/10 text-green-400' : isWrong ? 'border-red-500/50 bg-red-500/10 text-red-400' : isSelected ? 'border-purple-500/50 bg-purple-500/10 text-purple-300' : 'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}>
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0">{String.fromCharCode(65 + oi)}</span>
                        <span className="flex-1">{opt}</span>
                        {isCorrect && <CheckCircle size={16} />}{isWrong && <XCircle size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {!submitted
            ? <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2"><ChevronRight size={16} /> Submit Answers</button>
            : result && (
              <div className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-white">Results</h3>
                  <span className={`text-3xl font-display font-bold ${result.score >= 80 ? 'text-green-400' : result.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{result.score}%</span>
                </div>
                <p className="text-slate-300 mb-3">{result.correct} / {result.total} correct</p>
                <div className="flex gap-2 mb-4"><span className="xp-badge"><Zap size={12} />+{result.xpEarned} XP</span></div>
                <button onClick={() => { setExercise(null); setResult(null); setReward(null); }} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
                  <RefreshCw size={14} /> Try Another
                </button>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}

export default function Listening() {
  const [phase, setPhase] = useState('library');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const { user } = useAuth();

  useEffect(() => { setUserLevel(user?.level || 1); }, [user]);

  if (phase === 'video' && selectedVideo) return <VideoPlayer video={selectedVideo} onBack={() => { setPhase('library'); setSelectedVideo(null); }} />;
  if (phase === 'ai') return <AIPassageMode onBack={() => setPhase('library')} />;
  return <VideoLibrary userLevel={userLevel} onSelectVideo={v => { setSelectedVideo(v); setPhase('video'); }} onSwitchToAI={() => setPhase('ai')} />;
}