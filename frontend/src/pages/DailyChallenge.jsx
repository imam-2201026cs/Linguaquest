import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Target, Timer, CheckCircle, XCircle, ChevronRight, Zap, Trophy, 
  Globe, Flame, ArrowLeft, Volume2, Languages, Lightbulb, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import XPReward from '../components/XPReward';
import { useNavigate } from 'react-router-dom';

export default function DailyChallenge() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  
  const [stage, setStage] = useState(1); // 1 = Quiz, 2 = Summary
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  const [showStageBreak, setShowStageBreak] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState('');

  const { fetchProfile } = useAuth();

  useEffect(() => {
    fetchChallenge();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateTimer = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    
    if (diff <= 0) {
      setTimeLeft('Expired');
      return;
    }

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeLeft(`${h}h ${m}m ${s}s`);
  };

  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/challenge/daily');
      setData(res.data);
      // We don't automatically jump to stage 2 even if submission exists, 
      // because user can now attempt more than once.
    } catch (err) {
      toast.error('Failed to load Daily Challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optIndex) => {
    if (isAnswered) return;
    
    const currentQ = data.challenge.questions[currentIndex];
    const isCorrect = optIndex === currentQ.correct;
    
    setSelectedOption(optIndex);
    setIsAnswered(true);
    setAnswers(prev => ({ ...prev, [currentIndex]: optIndex }));
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    const totalQs = data.challenge.questions.length;
    
    if (currentIndex === 4 && !showStageBreak && totalQs > 5) {
      setShowStageBreak(true);
      return;
    }

    if (currentIndex < totalQs - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      setShowStageBreak(false);
    } else {
      submitQuiz(10);
    }
  };

  const submitQuiz = async (questionsAnswered) => {
    try {
      const res = await axios.post('/api/challenge/submit', { 
        answers, 
        questionsAnswered 
      });
      
      setResult(res.data);
      if (res.data.xpEarned > 0) {
        setReward({ xp: res.data.xpEarned, coins: res.data.coinsEarned });
      }
      setStage(2);
      fetchProfile();
      // Update global stats by refetching challenge data
      const refreshRes = await axios.get('/api/challenge/daily');
      setData(refreshRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setAnswers({});
    setIsAnswered(false);
    setSelectedOption(null);
    setCorrectCount(0);
    setWrongCount(0);
    setStage(1);
    setResult(null);
    setShowStageBreak(false);
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.challenge) return null;

  const challenge = data.challenge;
  const currentQ = challenge.questions[currentIndex];

  // Quiz View
  if (stage === 1) {
    return (
      <div className="max-w-xl mx-auto min-h-[90vh] flex flex-col bg-dark-900 text-white pb-10">
        {reward && <XPReward {...reward} onClose={() => setReward(null)} />}

        {/* Header */}
        <div className="flex items-center justify-between p-4 sticky top-0 bg-dark-900 z-20 border-b border-white/5">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
              <span className="w-5 h-5 bg-green-500 text-dark-900 rounded-full flex items-center justify-center text-[10px] font-bold">{correctCount}</span>
              <span className="text-xs font-bold text-green-400">Correct</span>
            </div>
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
              <span className="w-5 h-5 bg-red-500 text-dark-900 rounded-full flex items-center justify-center text-[10px] font-bold">{wrongCount}</span>
              <span className="text-xs font-bold text-red-400">Wrong</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-dark-700">
          <div 
            className="h-full bg-green-500 transition-all duration-500 ease-out" 
            style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / challenge.questions.length) * 100}%` }}
          />
        </div>

        <div className="p-6 flex-1 space-y-6">
          {/* Question Card */}
          <div className="glass-card border-primary-500/30 overflow-hidden">
            <div className="bg-primary-500/10 p-3 text-center border-b border-primary-500/20">
              <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
                QUESTION {currentIndex + 1} OF {challenge.questions.length}
              </span>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-medium text-center text-primary-100 mb-6 leading-relaxed">
                {currentQ.question}
              </h2>
              <div className="flex justify-center gap-4">
                <button onClick={() => speak(currentQ.question)} className="p-2 text-slate-400 hover:text-white transition-colors">
                  <Volume2 size={20} />
                </button>
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                  <Languages size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              let statusClass = "border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5";
              if (isAnswered) {
                if (idx === currentQ.correct) {
                  statusClass = "border-green-500 bg-green-500 text-white font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)]";
                } else if (idx === selectedOption) {
                  statusClass = "border-red-500 bg-red-500 text-white font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)]";
                } else {
                  statusClass = "border-white/5 text-slate-500 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${statusClass}`}
                >
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${isAnswered && (idx === currentQ.correct || idx === selectedOption) ? 'border-white text-white' : 'border-slate-500 text-slate-500'}`}>
                    {isAnswered && idx === currentQ.correct ? '✓' : String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="animate-slide-up">
              <div className="bg-primary-500/10 border border-primary-500/20 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-primary-400 font-bold text-sm mb-2">
                  <Lightbulb size={18} />
                  <span>Here is the explanation</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Early Submit Stage Break */}
          {showStageBreak && (
            <div className="glass-card p-6 border-yellow-500/30 bg-yellow-500/5 text-center mt-4">
              <h3 className="font-bold text-white mb-2">Stage 1 Complete!</h3>
              <p className="text-sm text-slate-400 mb-6">Continue for 5 more questions and double the XP, or submit now.</p>
              <div className="flex gap-3">
                <button onClick={() => submitQuiz(5)} className="btn-ghost flex-1">Submit (5 Qs)</button>
                <button onClick={() => { setShowStageBreak(false); handleNext(); }} className="btn-primary flex-1">Stage 2</button>
              </div>
            </div>
          )}
        </div>

        {/* Floating next button */}
        {isAnswered && !showStageBreak && (
          <div className="p-6">
             <button 
              onClick={handleNext}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 rounded-2xl shadow-xl shadow-primary-500/20"
            >
              Next Question <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Summary View
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up pb-20">
      <div className="glass-card p-10 text-center border-primary-500/20 bg-gradient-to-b from-primary-500/10 to-transparent">
        <div className="w-24 h-24 bg-dark-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-blue opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <Trophy size={48} className="text-primary-400 relative z-10" />
        </div>
        
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          {result?.score >= 80 ? "Excellent Work!" : result?.score >= 50 ? "Good work finishing the quiz" : "Great effort!"}
        </h2>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
          {result?.score >= 50 ? "Let's turn today's mistakes into tomorrow's wins" : "Every day is a chance to get better. Keep practicing!"}
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="bg-dark-800 border border-white/5 rounded-2xl p-6 min-w-[140px]">
            <p className="text-xs text-green-500 uppercase font-black tracking-widest mb-1">Correct</p>
            <p className="text-4xl font-bold text-white">{result?.correct}</p>
          </div>
          <div className="bg-dark-800 border border-white/5 rounded-2xl p-6 min-w-[140px]">
            <p className="text-xs text-red-500 uppercase font-black tracking-widest mb-1">Wrong</p>
            <p className="text-4xl font-bold text-white">{result?.total - result?.correct}</p>
          </div>
        </div>

        <div className="space-y-3 max-w-sm mx-auto">
          <button onClick={resetQuiz} className="btn-primary w-full py-4 flex items-center justify-center gap-2 rounded-2xl">
            <RefreshCw size={18} /> Try Again
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost w-full py-4 rounded-2xl">
            Back to Home Screen
          </button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="glass-card p-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
          <Globe size={18} className="text-blue-400" /> Global Community Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5">
            <p className="text-xs text-blue-300 font-bold mb-1 flex items-center gap-1"><Trophy size={12}/> Average Score</p>
            <p className="text-3xl font-bold text-blue-400">{Math.round(challenge.averageScore)}%</p>
          </div>
          <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-5">
            <p className="text-xs text-purple-300 font-bold mb-1 flex items-center gap-1"><Target size={12}/> Total Players</p>
            <p className="text-3xl font-bold text-purple-400">{challenge.totalCompletions}</p>
          </div>
          <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-5 col-span-2 md:col-span-1">
            <p className="text-xs text-orange-300 font-bold mb-1 flex items-center gap-1"><Flame size={12}/> Hardcore (10 Qs)</p>
            <p className="text-3xl font-bold text-orange-400">{challenge.totalStage2Completions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
