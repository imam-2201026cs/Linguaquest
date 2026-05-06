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
      <div className="max-w-2xl mx-auto flex flex-col min-h-[80vh] text-white">
        {reward && <XPReward {...reward} onClose={() => setReward(null)} />}

        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-dark-950/20 sticky top-0 z-30 backdrop-blur-xl border-b border-white/5">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-4">
            <div className="flex items-center gap-3 bg-accent-emerald/10 border border-accent-emerald/20 px-4 py-2 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse shadow-glow" />
              <span className="text-xs font-black text-accent-emerald uppercase tracking-widest">{correctCount}</span>
            </div>
            <div className="flex items-center gap-3 bg-accent-rose/10 border border-accent-rose/20 px-4 py-2 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-accent-rose shadow-glow" />
              <span className="text-xs font-black text-accent-rose uppercase tracking-widest">{wrongCount}</span>
            </div>
          </div>
        </header>

        {/* Progress System */}
        <div className="px-6 py-4 md:py-6">
           <div className="h-2 bg-dark-900 rounded-full overflow-hidden p-0.5 border border-white/5">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / challenge.questions.length) * 100}%` }}
               transition={{ duration: 0.5 }}
               className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full shadow-glow" 
             />
           </div>
        </div>

        <div className="px-6 space-y-6 pb-20">
          {/* Question Card */}
          <AnimatePresence mode="wait">
             <motion.div 
               key={currentIndex}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="glass-card overflow-hidden border-white/5 bg-gradient-to-br from-primary-600 to-primary-900 shadow-2xl"
             >
               {/* Question Header */}
               <div className="bg-dark-950/40 px-6 py-3 border-b border-white/5 text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-200 opacity-80">
                    Question {currentIndex + 1} of {challenge.questions.length}
                  </span>
               </div>

               {/* Question Body */}
               <div className="p-8 md:p-12 text-center space-y-6">
                 <h2 className="text-base md:text-2xl font-display font-bold text-white leading-relaxed tracking-tight">
                   {currentQ.question}
                 </h2>
                 
                 {/* Action Row */}
                 <div className="flex justify-center gap-4 pt-2">
                    <button onClick={() => speak(currentQ.question)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all border border-white/10">
                      <Volume2 size={18} />
                    </button>
                    <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all border border-white/10">
                      <Languages size={18} />
                    </button>
                 </div>
               </div>
             </motion.div>
          </AnimatePresence>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {currentQ.options.map((option, idx) => {
              const isCorrect = idx === currentQ.correct;
              const isSelected = idx === selectedOption;
              
              let variant = "bg-dark-900/50 border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/5";
              if (isAnswered) {
                if (isCorrect) variant = "bg-accent-emerald/20 border-accent-emerald/40 text-accent-emerald shadow-[0_0_20px_rgba(16,185,129,0.1)]";
                else if (isSelected) variant = "bg-accent-rose/20 border-accent-rose/40 text-accent-rose shadow-[0_0_20px_rgba(244,63,94,0.1)]";
                else variant = "bg-dark-950 border-white/5 text-slate-600 opacity-40";
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!isAnswered ? { scale: 1.01 } : {}}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(idx)}
                  className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-4 ${variant}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 transition-all ${isAnswered && (isCorrect || isSelected) ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                      {isAnswered && isCorrect ? <CheckCircle size={14} /> : isAnswered && isSelected ? <XCircle size={14} /> : String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1 font-bold tracking-tight text-sm md:text-base leading-snug">{option}</span>
                  </div>

                  {/* Option Utility Icons */}
                  <div className="flex gap-4 px-1 opacity-20 group-hover:opacity-60 transition-all duration-300">
                    <Volume2 size={14} />
                    <Languages size={14} />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation Box */}
          <AnimatePresence>
             {isAnswered && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-4"
               >
                 <div className="glass-card p-6 md:p-8 bg-primary-500/5 border-primary-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12" />
                    <div className="flex items-center gap-3 text-primary-400 font-black text-[10px] uppercase tracking-widest mb-3 md:mb-4">
                      <Lightbulb size={16} />
                      <span>Neural Insight</span>
                    </div>
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
                      {currentQ.explanation}
                    </p>
                 </div>

                 {!showStageBreak && (
                    <button 
                      onClick={handleNext}
                      className="w-full btn-primary py-4 md:py-5 flex items-center justify-center gap-3 rounded-2xl shadow-glow text-sm md:text-base"
                    >
                      Continue Protocol <ChevronRight size={20} />
                    </button>
                 )}
               </motion.div>
             )}
          </AnimatePresence>

          {/* Stage Break */}
          <AnimatePresence>
            {showStageBreak && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 md:p-10 border-accent-amber/30 bg-accent-amber/5 text-center space-y-6 md:space-y-8"
              >
                <div>
                   <div className="w-14 h-14 md:w-16 md:h-16 bg-accent-amber/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                      <Activity size={32} className="text-accent-amber" />
                   </div>
                   <h3 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">Phase 1 Normalized</h3>
                   <p className="text-slate-400 text-xs md:text-sm mt-2">Extend the mission for 5 more objectives to <span className="text-accent-amber font-black italic">Double Rewards</span>, or extract now.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => submitQuiz(5)} className="btn-ghost py-3 md:py-4 text-[10px] font-black uppercase tracking-widest border-white/5">Extract (5 XP)</button>
                   <button onClick={() => { setShowStageBreak(false); handleNext(); }} className="btn-primary py-3 md:py-4 text-[10px] font-black uppercase tracking-widest shadow-glow">Advance Phase 2</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
