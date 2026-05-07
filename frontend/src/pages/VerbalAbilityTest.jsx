// Premium Verbal Ability Arena Overhaul - Elite Protocol Edition
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Volume2, Languages, Lightbulb, RefreshCw, 
  ChevronRight, Trophy, Globe, Flame, BookOpen, Brain, 
  Layers, CheckCircle, XCircle, ChevronUp, Zap, HelpCircle,
  Sparkles, Target, Activity, Shield, Award, Terminal, Cpu,
  BarChart2, ShieldCheck, ZapOff
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
  "from-primary-500 to-primary-700 shadow-primary-500/20",
  "from-accent-indigo to-primary-600 shadow-accent-indigo/20",
  "from-accent-emerald to-primary-700 shadow-accent-emerald/20",
  "from-accent-amber to-primary-600 shadow-accent-amber/20",
  "from-accent-rose to-primary-600 shadow-accent-rose/20",
  "from-primary-400 to-accent-indigo shadow-primary-400/20",
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
      <div className="max-w-7xl mx-auto pb-32 animate-slide-up space-y-16 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
           <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Verbal Mastery Matrix</span>
                 <div className="h-px w-12 bg-primary-500/30" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none mb-4">
                Verbal <span className="shimmer-text">Arena</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Precision practice modules designed for competitive linguistic excellence and neural reinforcement.
              </p>
           </div>
           <button onClick={() => navigate(-1)} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all shadow-premium">
              <ArrowLeft size={28} />
           </button>
        </div>

        {/* Mega Test Banner */}
        <motion.button 
          whileHover={{ scale: 1.01, y: -5 }}
          onClick={() => startTest('Mixed')}
          className="w-full relative group overflow-hidden rounded-[3rem] p-12 md:p-16 text-left border border-primary-500/20 shadow-premium"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-indigo opacity-90 group-hover:opacity-100 transition-all duration-1000"></div>
          <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-1000 hidden lg:block">
            <Brain size={240} />
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] border border-white/20 shadow-glow-sm">
                 <Sparkles size={16} className="animate-pulse" /> Elite Protocol Activated
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase leading-none">Ultimate Mixed Assessment</h2>
              <p className="text-white/90 text-xl font-medium leading-relaxed">
                A comprehensive 30-objective circuit spanning all linguistic domains. The definitive benchmark of your proficiency.
              </p>
            </div>
            <div className="bg-white text-primary-700 px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl group-hover:px-16 transition-all duration-700 shrink-0 text-center">
              Initiate Mega Mission
            </div>
          </div>
        </motion.button>

        <div className="space-y-12">
           <div className="flex items-center gap-6 px-4">
              <div className="w-3 h-3 rounded-full bg-primary-500 shadow-glow" />
              <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase tracking-[0.2em]">Targeted Domain Practice</h3>
              <div className="h-px flex-1 bg-white/5" />
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             {TOPICS.map((topic, i) => (
               <motion.button
                 key={topic}
                 whileHover={{ y: -10, scale: 1.02 }}
                 onClick={() => startTest(topic)}
                 className="glass-card p-10 text-left border-white/5 bg-dark-900/40 relative overflow-hidden group transition-all duration-700 shadow-premium"
               >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000 blur-2xl" />
                 <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-[2rem] bg-gradient-to-br ${TOPIC_COLORS[i % TOPIC_COLORS.length]} flex items-center justify-center mb-8 shadow-glow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                      <BookOpen size={28} className="text-white" />
                    </div>
                    <h4 className="text-xl font-display font-black text-white mb-3 tracking-tighter group-hover:text-primary-400 transition-colors uppercase">{topic}</h4>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">30 Objectives</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                       <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">High Impact</span>
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
      <div className="h-[80vh] flex flex-col items-center justify-center text-center gap-12 px-6">
        <div className="relative">
           <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[8px] border-white/5 flex items-center justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[8px] border-primary-500 border-t-transparent animate-spin absolute" />
              <Brain size={48} className="text-primary-500 animate-pulse" />
           </div>
           <div className="absolute -inset-10 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="space-y-6">
           <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter uppercase leading-none">Syncing Mission Data</h2>
           <p className="text-slate-500 text-xl font-medium">Calibrating 30 high-fidelity objectives for <br/><span className="text-primary-400 font-black uppercase tracking-widest">{selectedTopic}</span></p>
        </div>
      </div>
    );
  }

  // 3. Quiz View
  if (stage === 2) {
    const currentQ = questions[currentIndex];
    const isAnswered = answers[currentIndex] !== undefined;
    const selectedOption = answers[currentIndex];

    return (
      <div className="fixed inset-0 flex flex-col bg-dark-950 text-white overflow-hidden z-50">
        {reward && <XPReward {...reward} onClose={() => setReward(null)} />}

        {/* Header */}
        <header className="flex items-center justify-between px-10 py-6 bg-dark-950/40 border-b border-white/5 backdrop-blur-3xl shrink-0">
          <button onClick={() => setStage(0)} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 shadow-premium">
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-4 bg-dark-900 px-6 py-2 rounded-full border border-white/5 shadow-inner">
               <Terminal size={14} className="text-primary-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sector: {selectedTopic}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-3 bg-accent-emerald/10 border border-accent-emerald/20 px-6 py-3 rounded-2xl shadow-glow-emerald/10">
                <ShieldCheck size={18} className="text-accent-emerald shadow-glow" />
                <span className="text-lg font-black text-accent-emerald">{correctCount}</span>
              </div>
              <div className="flex items-center gap-3 bg-accent-rose/10 border border-accent-rose/20 px-6 py-3 rounded-2xl shadow-glow-rose/10">
                <ZapOff size={18} className="text-accent-rose" />
                <span className="text-lg font-black text-accent-rose">{wrongCount}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full overflow-hidden px-10">
          
          {/* Progress Indicator */}
          <div className="py-10 shrink-0">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Trajectory Mapping</span>
                <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">{currentIndex + 1} / {questions.length} Units</span>
             </div>
             <div className="h-2 bg-dark-900 rounded-full overflow-hidden p-0.5 border border-white/5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                 transition={{ duration: 0.8, ease: "circOut" }}
                 className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-accent-indigo rounded-full shadow-glow" 
               />
             </div>
          </div>

          <div className="flex-1 flex flex-col gap-10 overflow-hidden pb-10">
            {/* Question Card */}
            <AnimatePresence mode="wait">
               <motion.div 
                 key={currentIndex}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="glass-card overflow-hidden border-white/5 bg-dark-900/40 shadow-premium shrink-0 relative group"
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-50" />
                 <div className="bg-dark-950/60 px-6 py-3 border-b border-white/5 flex justify-between items-center relative z-10">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary-400">Objective Module {currentIndex + 1}</span>
                    <div className="flex gap-4">
                       <button onClick={() => speak(currentQ.question)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                         <Volume2 size={18} />
                       </button>
                    </div>
                 </div>
                 <div className="p-10 md:p-16 text-center relative z-10">
                   <h2 className="text-2xl md:text-4xl font-display font-black text-white leading-tight tracking-tighter uppercase max-h-[160px] overflow-y-auto scrollbar-hide">
                     {currentQ.question}
                   </h2>
                 </div>
               </motion.div>
            </AnimatePresence>

            {/* Options Area */}
            <div className="flex-1 flex flex-col justify-start gap-6 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                {currentQ.options.map((option, idx) => {
                  const isCorrect = idx === currentQ.correct;
                  const isSelected = idx === selectedOption;
                  
                  let variant = "bg-dark-900/60 border-white/5 text-slate-500 hover:border-primary-500/30 hover:bg-white/5 hover:scale-[1.02]";
                  if (isAnswered) {
                    if (isCorrect) variant = "bg-accent-emerald/20 border-accent-emerald/50 text-accent-emerald shadow-glow-emerald scale-[1.02]";
                    else if (isSelected) variant = "bg-accent-rose/20 border-accent-rose/50 text-accent-rose shadow-glow-rose scale-[1.02] animate-shake";
                    else variant = "bg-dark-950 border-white/5 text-slate-700 opacity-40 grayscale";
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!isAnswered ? { scale: 1.02 } : {}}
                      disabled={isAnswered}
                      onClick={() => handleOptionSelect(idx)}
                      className={`group relative text-left p-8 rounded-[2.5rem] border transition-all duration-500 flex items-center gap-8 ${variant} shadow-premium`}
                    >
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-sm font-display font-black shrink-0 transition-all ${isAnswered && (isCorrect || isSelected) ? 'bg-white/10 border-current' : 'border-white/10 bg-dark-950 shadow-inner'}`}>
                        {isAnswered && isCorrect ? <CheckCircle size={20} /> : isAnswered && isSelected ? <XCircle size={20} /> : String.fromCharCode(65 + idx)}
                      </div>
                      <span className="flex-1 font-bold tracking-tight text-lg leading-tight uppercase">{option}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation/Next */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 pb-12"
                  >
                    <div className="glass-card p-10 bg-dark-900/60 border-primary-500/20 shadow-premium relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
                       <div className="flex items-start gap-6">
                          <Lightbulb size={24} className="text-primary-500 shrink-0 mt-1 shadow-glow" />
                          <p className="text-slate-400 text-lg leading-relaxed font-medium">
                            {currentQ.explanation}
                          </p>
                       </div>
                    </div>

                    <button 
                      onClick={handleNext}
                      className="w-full btn-primary py-8 flex items-center justify-center gap-6 rounded-[2.5rem] shadow-glow text-[10px] font-black uppercase tracking-[0.5em] hover:scale-[1.02] transition-transform"
                    >
                      Next Objective Sector <ChevronRight size={24} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 4. Summary View
  if (stage === 3) {
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="max-w-5xl mx-auto py-16 px-6 space-y-16 animate-slide-up pb-32">
        {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
        
        <div className="glass-card p-1.5 border-white/5 bg-dark-900 shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="p-16 text-center flex flex-col items-center relative z-10">
            <div className="w-32 h-32 bg-dark-950 rounded-[3rem] flex items-center justify-center mb-12 border border-white/10 shadow-inner relative group overflow-hidden">
               <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors duration-700" />
               <Trophy size={64} className="text-primary-400 shadow-glow relative z-10 animate-bounce-slow" />
            </div>
            
            <h2 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter uppercase leading-none mb-6">
              Arena <span className="shimmer-text">Deciphered</span>
            </h2>
            <p className="text-slate-500 text-xl font-medium max-w-xl mb-16 leading-relaxed">
              Linguistic patterns for <strong className="text-white uppercase tracking-widest">{selectedTopic}</strong> successfully mapped and authenticated.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mb-16">
              <div className="bg-dark-950 border border-white/5 rounded-[3rem] p-10 transition-all hover:scale-105 shadow-inner">
                <p className="text-[10px] text-primary-500 font-black uppercase tracking-[0.4em] mb-4">Accuracy Rate</p>
                <p className="text-6xl font-display font-black text-white leading-none tracking-tighter">{score}%</p>
              </div>
              <div className="bg-dark-950 border border-white/5 rounded-[3rem] p-10 transition-all hover:scale-105 shadow-inner">
                <p className="text-[10px] text-accent-emerald font-black uppercase tracking-[0.4em] mb-4">Objectives Met</p>
                <p className="text-6xl font-display font-black text-white leading-none tracking-tighter">{correctCount}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
              <button onClick={() => startTest(selectedTopic)} className="btn-primary flex-1 py-7 flex items-center justify-center gap-6 rounded-[2.5rem] shadow-glow font-black text-[10px] uppercase tracking-[0.4em] hover:scale-105 transition-transform">
                <RefreshCw size={24} className="animate-spin-slow" /> Re-Initiate Mission
              </button>
              <button onClick={() => setStage(0)} className="btn-ghost flex-1 py-7 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] border-white/10 hover:bg-white/5 transition-all">
                Switch Domain Sector
              </button>
            </div>
          </div>
        </div>

        {/* Learning Insight */}
        <div className="glass-card p-12 border-white/5 bg-dark-900/40 relative overflow-hidden group shadow-premium">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 blur-2xl" />
          <div className="flex items-start gap-10 relative z-10">
            <div className="w-16 h-16 bg-primary-500/10 rounded-[2rem] flex items-center justify-center text-primary-400 shrink-0 border border-primary-500/20 shadow-glow-sm">
              <Cpu size={32} />
            </div>
            <div className="space-y-4">
              <h4 className="text-2xl font-display font-black text-white tracking-tighter uppercase">Neural Reinforcement: +{reward?.xp} XP SYNC</h4>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                Cognitive patterns for <strong className="text-white uppercase tracking-widest">{selectedTopic}</strong> have been reinforced within your neural profile. High-frequency exposure to diverse verbal domains is essential for total mastery.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
