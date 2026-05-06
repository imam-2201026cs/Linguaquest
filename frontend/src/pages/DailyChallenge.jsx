import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Timer, CheckCircle, XCircle, ChevronRight, Zap, Trophy, 
  Globe, Flame, ArrowLeft, Volume2, Languages, Lightbulb, RefreshCw,
  Sparkles, Activity, Shield
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Challenge Data</p>
      </div>
    );
  }

  if (!data || !data.challenge) return null;

  const challenge = data.challenge;
  const currentQ = challenge.questions[currentIndex];

  // Quiz View
  if (stage === 1) {
    return (
      <div className="fixed inset-0 flex flex-col bg-dark-950 text-white overflow-hidden">
        {reward && <XPReward {...reward} onClose={() => setReward(null)} />}

        {/* Header - Compact */}
        <header className="flex items-center justify-between px-6 py-3 bg-dark-950/20 border-b border-white/5 shrink-0">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-accent-emerald/10 border border-accent-emerald/20 px-3 py-1.5 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse shadow-glow" />
              <span className="text-[10px] font-black text-accent-emerald uppercase tracking-widest">{correctCount}</span>
            </div>
            <div className="flex items-center gap-2 bg-accent-rose/10 border border-accent-rose/20 px-3 py-1.5 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-rose shadow-glow" />
              <span className="text-[10px] font-black text-accent-rose uppercase tracking-widest">{wrongCount}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area - Scroll-free Flex */}
        <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
          
          {/* Progress Indicator - Slim */}
          <div className="px-6 py-4 shrink-0">
             <div className="h-1.5 bg-dark-900 rounded-full overflow-hidden p-0.5 border border-white/5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / challenge.questions.length) * 100}%` }}
                 transition={{ duration: 0.5 }}
                 className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full shadow-glow" 
               />
             </div>
          </div>

          <div className="flex-1 flex flex-col px-6 gap-4 md:gap-6 overflow-hidden">
            {/* Question Card - Adaptive Height */}
            <AnimatePresence mode="wait">
               <motion.div 
                 key={currentIndex}
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
                 className="glass-card overflow-hidden border-white/5 bg-gradient-to-br from-primary-600/20 to-primary-900/40 shadow-2xl shrink-0"
               >
                 <div className="bg-dark-950/40 px-4 py-2 border-b border-white/5 text-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-200 opacity-60">
                      Objective {currentIndex + 1} / {challenge.questions.length}
                    </span>
                 </div>
                 <div className="p-5 md:p-8 text-center space-y-4">
                   <h2 className="text-sm md:text-xl font-display font-bold text-white leading-relaxed tracking-tight max-h-[120px] overflow-y-auto scrollbar-hide">
                     {currentQ.question}
                   </h2>
                   <div className="flex justify-center gap-3">
                      <button onClick={() => speak(currentQ.question)} className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5">
                        <Volume2 size={16} />
                      </button>
                      <button className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/40 border border-white/5">
                        <Languages size={16} />
                      </button>
                   </div>
                 </div>
               </motion.div>
            </AnimatePresence>

            {/* Options Area - Grid on Tablet/PC, Stack on Mobile */}
            <div className="flex-1 flex flex-col justify-center gap-2 md:gap-4 overflow-y-auto scrollbar-hide pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                {currentQ.options.map((option, idx) => {
                  const isCorrect = idx === currentQ.correct;
                  const isSelected = idx === selectedOption;
                  
                  let variant = "bg-dark-900/50 border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/5";
                  if (isAnswered) {
                    if (isCorrect) variant = "bg-accent-emerald/20 border-accent-emerald/40 text-accent-emerald";
                    else if (isSelected) variant = "bg-accent-rose/20 border-accent-rose/40 text-accent-rose";
                    else variant = "bg-dark-950/30 border-white/5 text-slate-600 opacity-40";
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!isAnswered ? { scale: 1.01 } : {}}
                      disabled={isAnswered}
                      onClick={() => handleOptionSelect(idx)}
                      className={`group relative text-left p-3 md:p-5 rounded-xl md:rounded-2xl border transition-all duration-300 flex flex-col gap-2 ${variant}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-black shrink-0 ${isAnswered && (isCorrect || isSelected) ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                          {isAnswered && isCorrect ? <CheckCircle size={12} /> : isAnswered && isSelected ? <XCircle size={12} /> : String.fromCharCode(65 + idx)}
                        </div>
                        <span className="flex-1 font-bold tracking-tight text-xs md:text-base leading-snug line-clamp-2">{option}</span>
                      </div>
                      
                      {/* Sub-icons inside options for aesthetics */}
                      <div className="flex gap-2 px-1 opacity-10 group-hover:opacity-40 transition-opacity">
                        <Volume2 size={10} />
                        <Languages size={10} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation/Next - Only if answered */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="glass-card p-4 bg-primary-500/5 border-primary-500/10">
                       <p className="text-slate-300 text-[11px] md:text-sm leading-relaxed line-clamp-3 overflow-y-auto max-h-[80px] scrollbar-hide">
                         {currentQ.explanation}
                       </p>
                    </div>

                    {!showStageBreak && (
                       <button 
                         onClick={handleNext}
                         className="w-full btn-primary py-3 md:py-4 flex items-center justify-center gap-3 rounded-xl shadow-glow text-xs md:text-base"
                       >
                         Continue <ChevronRight size={16} />
                       </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Stage Break Overlay - Denser */}
        <AnimatePresence>
          {showStageBreak && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-dark-950/90 backdrop-blur-sm"
            >
              <div className="glass-card p-8 border-accent-amber/30 bg-accent-amber/5 text-center space-y-6 max-w-sm">
                 <div className="w-12 h-12 bg-accent-amber/10 rounded-2xl flex items-center justify-center mx-auto">
                    <Activity size={24} className="text-accent-amber" />
                 </div>
                 <h3 className="text-xl font-display font-bold text-white tracking-tight">Phase 1 Normalized</h3>
                 <p className="text-slate-400 text-xs">Advance for <span className="text-accent-amber font-black italic">Double Rewards</span>, or extract now.</p>
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => submitQuiz(5)} className="btn-ghost py-3 text-[9px] font-black uppercase tracking-widest border-white/5">Extract</button>
                    <button onClick={() => { setShowStageBreak(false); handleNext(); }} className="btn-primary py-3 text-[9px] font-black uppercase tracking-widest shadow-glow">Advance</button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Summary View
  return (
    <div className="max-w-3xl mx-auto py-10 px-6 space-y-10 animate-slide-up">
      <div className="glass-card p-1 border-white/5 bg-gradient-to-br from-primary-500/10 to-transparent shadow-2xl">
        <div className="p-8 md:p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-dark-950 rounded-[28px] md:rounded-[32px] flex items-center justify-center mb-6 md:mb-8 border border-white/5 shadow-inner relative group overflow-hidden">
             <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors" />
             <Trophy size={40} md:size={48} className="text-primary-400 shadow-glow relative z-10" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
            Mission <span className="shimmer-text">Deciphered</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg font-medium max-w-sm mb-8 md:mb-10 leading-relaxed">
            {result?.score >= 80 ? "Exemplary performance! You've dominated today's global protocol." : "Solid progress recorded. Every mistake is a recalibration for success."}
          </p>
          
          <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-md mb-10 md:mb-12">
            <div className="bg-dark-950 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 transition-transform hover:scale-105">
              <p className="text-[10px] text-accent-emerald uppercase font-black tracking-widest mb-2">Verified</p>
              <p className="text-3xl md:text-5xl font-black text-white leading-none">{result?.correct}</p>
            </div>
            <div className="bg-dark-950 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 transition-transform hover:scale-105">
              <p className="text-[10px] text-accent-rose uppercase font-black tracking-widest mb-2">Flags</p>
              <p className="text-3xl md:text-5xl font-black text-white leading-none">{result?.total - result?.correct}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <button onClick={resetQuiz} className="btn-primary py-4 md:py-5 flex items-center justify-center gap-3 rounded-2xl shadow-glow font-black text-xs uppercase tracking-[0.2em]">
              <RefreshCw size={18} /> Re-Initiate
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-ghost py-4 md:py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border-white/5">
              Command Center
            </button>
          </div>
        </div>
      </div>

      {/* Global Analytics */}
      <div className="glass-card p-8 md:p-10 border-white/5 bg-dark-900/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
        
        <h3 className="text-lg md:text-xl font-display font-bold text-white mb-6 md:mb-8 flex items-center gap-3">
          <Globe size={20} className="text-primary-400" /> Global Intelligence
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          <div className="space-y-2">
             <div className="flex items-center gap-2 mb-1">
                <Trophy size={14} className="text-accent-amber"/>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average Mastery</p>
             </div>
             <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{Math.round(challenge.averageScore)}%</p>
          </div>
          <div className="space-y-2">
             <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-primary-400"/>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Operatives</p>
             </div>
             <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{challenge.totalCompletions}</p>
          </div>
          <div className="space-y-2">
             <div className="flex items-center gap-2 mb-1">
                <Flame size={14} className="text-accent-rose"/>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hardcore Elite</p>
             </div>
             <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{challenge.totalStage2Completions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
