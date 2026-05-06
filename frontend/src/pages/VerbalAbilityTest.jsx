import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Volume2, Languages, Lightbulb, RefreshCw, 
  ChevronRight, Trophy, Globe, Flame, BookOpen, Brain, 
  Layers, CheckCircle, XCircle, ChevronUp, Zap, HelpCircle,
  Sparkles, Target, Activity, Shield, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import XPReward from '../components/XPReward';

const TOPICS = [
  "Antonyms", "Synonyms", "Spelling Errors", "One Word Substitution", "Verbs", "Adverbs", "Tenses",
  "Subject-Verb Agreement", "Idioms & Phrases", "Agreement", "Articles", "Error Detection",
  "Preposition", "Conjunction",
  "Fill in the Blanks", "Sentence Correction", "Rearrangement", "Vocabulary", "Unseen Passage",
  "Narration (Direct & Indirect Speech)", "Active & Passive Voice"
];

const TOPIC_COLORS = [
  "from-primary-500 to-primary-700",
  "from-accent-indigo to-primary-600",
  "from-accent-emerald to-primary-700",
  "from-accent-amber to-primary-600",
  "from-accent-rose to-primary-600",
  "from-primary-400 to-accent-indigo",
];

export default function VerbalAbilityTest() {
  const navigate = useNavigate();
  const { fetchProfile } = useAuth();
  
  const [stage, setStage] = useState(0); // 0: Selection, 1: Loading, 2: Quiz, 3: Summary
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reward, setReward] = useState(null);

  const startTest = async (topic) => {
    setSelectedTopic(topic);
    setStage(1);
    try {
      const res = await axios.post('/api/verbal-test/generate', { topic });
      setQuestions(res.data.questions);
      setStage(2);
      setCurrentIndex(0);
      setAnswers({});
      setIsAnswered(false);
      setSelectedOption(null);
      setCorrectCount(0);
      setWrongCount(0);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to generate test.';
      toast.error(errorMsg);
      setStage(0);
    }
  };

  const handleOptionSelect = (optIndex) => {
    if (isAnswered) return;
    
    const currentQ = questions[currentIndex];
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
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    const score = Math.round((correctCount / questions.length) * 100);
    const xp = correctCount * 5; 
    setReward({ xp, coins: Math.floor(xp / 4) });
    setStage(3);
    fetchProfile();
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // 1. Topic Selection View
  if (stage === 0) {
    return (
      <div className="max-w-6xl mx-auto pb-20 animate-slide-up space-y-10 px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">Verbal Mastery</span>
                 <div className="h-px w-8 bg-primary-500/30" />
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">Verbal Ability <span className="shimmer-text">Arena</span></h1>
              <p className="text-slate-400 text-sm md:text-lg mt-2 font-medium">Precision practice for competitive excellence.</p>
           </div>
           <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors mx-auto md:mx-0">
              <ArrowLeft size={24} />
           </button>
        </div>

        {/* Mega Test Banner */}
        <motion.button 
          whileHover={{ scale: 1.01 }}
          onClick={() => startTest('Mixed')}
          className="w-full relative group overflow-hidden rounded-[24px] md:rounded-[32px] p-8 md:p-12 text-left border border-primary-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-indigo opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700 hidden md:block">
            <Brain size={160} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                 <Sparkles size={12} className="animate-pulse" /> Elite Protocol
              </div>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-white tracking-tight">Ultimate Mixed Assessment</h2>
              <p className="text-white/80 text-sm md:text-lg font-medium max-w-xl">A comprehensive 30-objective circuit spanning all linguistic domains. The definitive test of your proficiency.</p>
            </div>
            <div className="bg-white text-primary-700 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-2xl group-hover:px-10 md:group-hover:px-12 transition-all">
              Initiate Mega Mission
            </div>
          </div>
        </motion.button>

        <div className="space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow" />
              <h3 className="text-lg md:text-xl font-display font-bold text-white tracking-tight uppercase tracking-widest">Targeted Domain Practice</h3>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
             {TOPICS.map((topic, i) => (
               <motion.button
                 key={topic}
                 whileHover={{ y: -5 }}
                 onClick={() => startTest(topic)}
                 className="glass-card p-6 md:p-8 text-left border-white/5 bg-dark-900/40 relative overflow-hidden group transition-all duration-500"
               >
                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                 <div className="relative z-10">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${TOPIC_COLORS[i % TOPIC_COLORS.length]} flex items-center justify-center mb-4 md:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <BookOpen size={20} md:size={24} className="text-white" />
                    </div>
                    <h4 className="text-base md:text-lg font-bold text-white mb-2 tracking-tight group-hover:text-primary-400 transition-colors">{topic}</h4>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">30 Objectives</span>
                       <div className="w-1 h-1 rounded-full bg-slate-700" />
                       <span className="text-[9px] md:text-[10px] font-black text-primary-400 uppercase tracking-widest">Advanced</span>
                    </div>
                 </div>
               </motion.button>
             ))}
           </div>
        </div>
      </div>
    );
  }

  // 2. Loading View
  if (stage === 1) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 px-6">
        <div className="relative">
           <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[6px] border-white/5 flex items-center justify-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[6px] border-primary-500 border-t-transparent animate-spin absolute" />
              <Brain size={28} md:size={32} className="text-primary-500 animate-pulse" />
           </div>
           <div className="absolute -inset-4 bg-primary-500/10 rounded-full blur-2xl animate-pulse" />
        </div>
        <div className="space-y-3">
           <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">Syncing Mission Data</h2>
           <p className="text-slate-400 text-base md:text-lg font-medium">Calibrating 30 high-fidelity objectives for <br/><span className="text-primary-400 font-bold">{selectedTopic}</span></p>
        </div>
      </div>
    );
  }

  // 3. Quiz View
  if (stage === 2) {
    const currentQ = questions[currentIndex];
    return (
      <div className="max-w-2xl mx-auto flex flex-col min-h-[80vh] text-white">
        {/* Header */}
        <header className="flex items-center justify-between p-4 md:p-6 bg-dark-950/20 sticky top-0 z-30 backdrop-blur-xl border-b border-white/5">
          <button onClick={() => setStage(0)} className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5">
            <ArrowLeft size={18} md:size={20} />
          </button>
          <div className="flex gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 bg-accent-emerald/10 border border-accent-emerald/20 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent-emerald animate-pulse shadow-glow" />
              <span className="text-[10px] md:text-xs font-black text-accent-emerald uppercase tracking-widest">{correctCount}</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 bg-accent-rose/10 border border-accent-rose/20 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent-rose shadow-glow" />
              <span className="text-[10px] md:text-xs font-black text-accent-rose uppercase tracking-widest">{wrongCount}</span>
            </div>
          </div>
        </header>

        {/* Progress System */}
        <div className="px-6 py-6 md:py-8">
           <div className="flex justify-between items-end mb-4 px-1">
              <div>
                 <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">{selectedTopic} Domain</p>
                 <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">Active Assessment</h2>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Progress</p>
                 <p className="text-sm font-black text-white">{currentIndex + 1} / {questions.length}</p>
              </div>
           </div>
           <div className="h-2 bg-dark-900 rounded-full overflow-hidden p-0.5 border border-white/5">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
               transition={{ duration: 0.5 }}
               className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full shadow-glow" 
             />
           </div>
        </div>

        <div className="px-6 space-y-6 md:space-y-8 pb-20">
          {/* Question Card */}
          <AnimatePresence mode="wait">
             <motion.div 
               key={currentIndex}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="glass-card p-1 border-white/5 bg-gradient-to-br from-primary-500/10 to-transparent"
             >
               <div className="p-6 md:p-10 text-center space-y-4 md:space-y-6">
                 <h2 className="text-lg md:text-2xl font-display font-bold text-white leading-tight md:leading-relaxed tracking-tight">
                   {currentQ.question}
                 </h2>
                 <div className="flex justify-center gap-6">
                    <button onClick={() => speak(currentQ.question)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-all border border-white/5">
                      <Volume2 size={22} />
                    </button>
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 border border-white/5">
                      <Languages size={22} />
                    </div>
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
                if (isCorrect) variant = "bg-accent-emerald/20 border-accent-emerald/40 text-accent-emerald shadow-glow";
                else if (isSelected) variant = "bg-accent-rose/20 border-accent-rose/40 text-accent-rose shadow-glow";
                else variant = "bg-dark-950 border-white/5 text-slate-600 opacity-40";
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(idx)}
                  className={`group relative text-left p-4 md:p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 md:gap-5 ${variant}`}
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-black shrink-0 transition-all ${isAnswered && (isCorrect || isSelected) ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>
                    {isAnswered && isCorrect ? <CheckCircle size={18} /> : isAnswered && isSelected ? <XCircle size={18} /> : String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1 font-bold tracking-tight text-sm md:text-base">{option}</span>
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
                 className="space-y-4 md:space-y-6"
               >
                 <div className="glass-card p-6 md:p-8 bg-primary-500/5 border-primary-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12" />
                    <div className="flex items-center gap-3 text-primary-400 font-black text-[10px] uppercase tracking-widest mb-3 md:mb-4">
                      <Lightbulb size={16} />
                      <span>Neural Analysis</span>
                    </div>
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
                      {currentQ.explanation}
                    </p>
                 </div>

                 <button 
                    onClick={handleNext}
                    className="w-full btn-primary py-4 md:py-5 flex items-center justify-center gap-3 rounded-2xl shadow-glow text-sm md:text-base uppercase font-black tracking-widest"
                  >
                    {currentIndex === questions.length - 1 ? 'Terminate Mission' : 'Next Objective'} <ChevronRight size={20} />
                  </button>
               </motion.div>
             )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // 4. Summary View
  if (stage === 3) {
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="max-w-4xl mx-auto py-10 px-6 space-y-10 animate-slide-up">
        {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
        
        <div className="glass-card p-1 border-white/5 bg-gradient-to-br from-primary-500/10 to-transparent shadow-2xl">
          <div className="p-8 md:p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-dark-950 rounded-[28px] md:rounded-[32px] flex items-center justify-center mb-6 md:mb-8 border border-white/5 shadow-inner relative group overflow-hidden">
               <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors" />
               <Trophy size={40} md:size={48} className="text-primary-400 shadow-glow relative z-10" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
              Mission <span className="shimmer-text">Finalized</span>
            </h2>
            <p className="text-slate-400 text-base md:text-lg font-medium max-w-sm mb-8 md:mb-10 leading-relaxed">
              Domain Mastery in <span className="text-white font-bold">{selectedTopic}</span> authenticated. Performance analytics captured.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-lg mb-10 md:mb-12">
              <div className="bg-dark-950 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 transition-transform hover:scale-105">
                <p className="text-[10px] text-primary-400 uppercase font-black tracking-widest mb-2">Accuracy Rate</p>
                <p className="text-3xl md:text-5xl font-black text-white leading-none">{score}%</p>
              </div>
              <div className="bg-dark-950 border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 transition-transform hover:scale-105">
                <p className="text-[10px] text-accent-emerald uppercase font-black tracking-widest mb-2">Objectives Met</p>
                <p className="text-3xl md:text-5xl font-black text-white leading-none">{correctCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <button onClick={() => startTest(selectedTopic)} className="btn-primary py-4 md:py-5 flex items-center justify-center gap-3 rounded-2xl shadow-glow font-black text-xs uppercase tracking-[0.2em]">
                <RefreshCw size={18} /> Re-Initiate
              </button>
              <button onClick={() => setStage(0)} className="btn-ghost py-4 md:py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border-white/5">
                Practice Domain
              </button>
            </div>
          </div>
        </div>

        {/* Learning Insight */}
        <div className="glass-card p-8 md:p-10 border-white/5 bg-dark-900/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <div className="flex items-start gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary-400 shrink-0 border border-primary-500/20">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-display font-bold text-white mb-2 tracking-tight">Neural Reward: +{reward?.xp} XP</h4>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
                Cognitive patterns for <strong className="text-white">{selectedTopic}</strong> have been reinforced. Regular engagement with diverse domains ensures a robust linguistic foundation.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
