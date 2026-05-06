import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, RefreshCw, ChevronRight, Zap, CheckCircle, XCircle, 
  Info, Lock, Star, Clock, BarChart2, Layers, Map, Trophy,
  Palette, Sparkles, Book, ArrowLeft, Globe, Activity, Shield,
  Target, Volume2, Search, MessageSquare, Award
} from 'lucide-react';
import XPReward from '../components/XPReward';
import { useAuth } from '../context/AuthContext';

const TIER_ICONS = { 
  beginner: '🌱', elementary: '🏰', intermediate: '🔍', 
  upper_intermediate: '🌍', advanced: '🎩', expert: '💎' 
};

function ReadingRoadmap({ library, onSelectBook, completedCount }) {
  const levels = ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'expert'];
  
  return (
    <div className="max-w-6xl mx-auto animate-slide-up pb-20 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-emerald">Lexical Perception</span>
              <div className="h-px w-8 bg-accent-emerald/30" />
           </div>
           <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Reading <span className="shimmer-text">Nexus</span></h1>
           <p className="text-slate-400 text-lg mt-2 font-medium">180 Progressive narratives mapped for cognitive mastery.</p>
        </div>
        <div className="glass-card px-8 py-5 flex items-center gap-6 border-white/10 bg-dark-900/40 relative overflow-hidden group">
           <div className="absolute inset-0 bg-accent-emerald/5 group-hover:bg-accent-emerald/10 transition-colors" />
           <div className="relative z-10 text-right">
             <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1">Global Mastery</p>
             <p className="text-3xl font-display font-black text-white">{completedCount}<span className="text-accent-emerald/50 text-xl mx-1">/</span>180</p>
           </div>
           <div className="w-12 h-12 bg-accent-emerald/10 rounded-2xl flex items-center justify-center border border-accent-emerald/20 shadow-glow relative z-10">
              <Trophy size={24} className="text-accent-emerald" />
           </div>
        </div>
      </div>

      <div className="space-y-16">
        {levels.map((lvl) => {
          const section = library[lvl];
          if (!section) return null;
          
          return (
            <div key={lvl} className="relative">
              <div className="flex items-center gap-5 mb-8 sticky top-0 z-20 py-4 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
                <div className="w-14 h-14 bg-dark-950 border border-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                   {TIER_ICONS[lvl]}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-display font-bold text-white tracking-tight uppercase tracking-widest">{section.label}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-1.5 bg-dark-950 rounded-full overflow-hidden max-w-[240px] p-0.5 border border-white/5">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${section.progress}%` }}
                         className="h-full bg-accent-emerald rounded-full shadow-glow" 
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{section.progress}% Deciphered</span>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                {['beginner', 'intermediate', 'advanced'].map(tier => {
                  const tierBooks = section.books.filter(b => b.tier === tier);
                  if (!tierBooks.length) return null;
                  
                  return (
                    <div key={tier} className="space-y-6">
                      <div className="flex items-center gap-4 px-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-glow" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{tier} Protocol Phase</span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {tierBooks.map((book) => {
                          const isLocked = !book.isUnlocked;
                          const isCompleted = book.isCompleted;
                          const globalIndex = section.books.indexOf(book);
                          
                          return (
                            <motion.button
                              key={book.id}
                              whileHover={!isLocked ? { y: -5 } : {}}
                              disabled={isLocked}
                              onClick={() => !isLocked && onSelectBook(book)}
                              className={`relative group p-8 rounded-[32px] border transition-all duration-500 flex flex-col items-center text-center ${
                                isCompleted 
                                ? 'bg-accent-emerald/5 border-accent-emerald/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                                : isLocked 
                                ? 'bg-dark-950 border-white/5 opacity-40 grayscale cursor-not-allowed'
                                : 'bg-dark-900/40 border-white/5 hover:border-accent-emerald/50 hover:bg-white/5 shadow-2xl cursor-pointer'
                              }`}
                            >
                              <div className="absolute -top-1 -right-1">
                                {isCompleted ? (
                                  <div className="w-8 h-8 bg-accent-emerald rounded-xl flex items-center justify-center shadow-glow">
                                    <CheckCircle size={16} className="text-white" />
                                  </div>
                                ) : isLocked ? (
                                  <div className="w-8 h-8 bg-dark-800 border border-white/10 rounded-xl flex items-center justify-center">
                                    <Lock size={14} className="text-slate-600" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-accent-emerald rounded-xl flex items-center justify-center animate-pulse shadow-glow">
                                    <Zap size={16} className="text-white" />
                                  </div>
                                )}
                              </div>

                              <div className="w-16 h-16 bg-dark-950 rounded-2xl flex items-center justify-center text-4xl mb-6 border border-white/5 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                {book.emoji}
                              </div>
                              
                              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">
                                Module {globalIndex + 1}
                              </div>
                              <h3 className="text-sm font-bold text-white leading-tight tracking-tight line-clamp-2 min-h-[40px] group-hover:text-accent-emerald transition-colors">
                                {book.title}
                              </h3>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
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

function ReadingExercise({ exercise, onBack, onComplete }) {
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  const [startTime] = useState(Date.now());
  const { fetchProfile } = useAuth();

  const handleSubmit = async () => {
    if (Object.keys(answers).length < exercise.questions.length) {
      return toast.error("Answer all assessment objectives.");
    }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/reading/submit', {
        answers: exercise.questions.map((_, i) => answers[i]),
        questions: exercise.questions,
        bookId: exercise.book.id,
        timeSpent: Math.floor((Date.now() - startTime) / 1000)
      });
      setResult(data);
      setReward({ xp: data.xpEarned, coins: data.coinsEarned, score: data.score });
      await fetchProfile();
      if (data.score >= 70) {
        toast.success("Cognitive Mapping Verified!", { icon: '🔥' });
      }
    } catch { toast.error("Assessment submission failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up pb-20 space-y-8">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
      
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors border border-white/5">
           <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
           <div className="text-3xl">{exercise.book.emoji}</div>
           <div>
              <h2 className="text-xl font-display font-bold text-white tracking-tight">{exercise.book.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                 <div className="w-1 h-1 rounded-full bg-accent-emerald shadow-glow" />
                 <span className="text-[10px] font-black text-accent-emerald uppercase tracking-widest">Active Analysis Session</span>
              </div>
           </div>
        </div>
      </div>

      {!quizMode ? (
        <div className="space-y-10">
          <div className="glass-card p-1.5 border-white/10 bg-dark-900 shadow-2xl relative overflow-hidden group rounded-[40px]">
            <div className="aspect-video bg-dark-950 rounded-[32px] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-emerald/10 to-transparent opacity-50" />
              <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="relative z-10"
              >
                <Palette size={64} className="text-accent-emerald mb-6 mx-auto shadow-glow" />
                <p className="text-slate-400 italic text-lg max-w-lg leading-relaxed font-medium">"{exercise.illustrationPrompt || 'Visualizing narrative structure...'}"</p>
                <div className="mt-8 flex items-center justify-center gap-3">
                   <div className="bg-dark-900 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                      <Sparkles size={14} className="text-accent-amber" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Narrative Synthesis</span>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="glass-card p-12 border-white/5 bg-dark-900/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-accent-emerald/20" />
            <p className="text-slate-200 leading-[2] text-xl whitespace-pre-wrap font-medium">
              {exercise.passage}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 glass-card p-10 border-white/5 bg-dark-900/40">
              <h3 className="text-[10px] font-black text-accent-emerald uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <BookOpen size={16} /> Neural Lexical Map
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(exercise.vocabulary || []).map((v, i) => (
                  <div key={i} className="space-y-2 p-4 rounded-2xl bg-dark-950 border border-white/5 group hover:border-accent-emerald/30 transition-all">
                    <p className="text-base font-black text-white group-hover:text-accent-emerald transition-colors">{v.word}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{v.definition}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-10 border-white/5 bg-gradient-to-br from-accent-emerald/10 to-transparent flex flex-col justify-center items-center text-center group">
              <div className="w-16 h-16 bg-dark-950 rounded-2xl flex items-center justify-center mb-8 border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                 <Activity size={32} className="text-accent-emerald shadow-glow" />
              </div>
              <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed italic">Analysis complete? <br/>Initiate comprehension assessment.</p>
              <button 
                onClick={() => setQuizMode(true)}
                className="btn-primary w-full py-5 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-glow"
              >
                Execute Quiz <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-10">
          <div className="glass-card p-6 flex items-center justify-between border-white/5 bg-dark-900/40">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-dark-950 rounded-2xl flex items-center justify-center text-2xl border border-white/5">
                  {exercise.book.emoji}
               </div>
               <div>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Assessment Protocol</p>
                 <p className="text-base font-bold text-white tracking-tight">{exercise.book.title}</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[9px] font-black text-accent-emerald uppercase tracking-widest mb-1">Status</p>
               <span className="text-sm font-black text-white">{Object.keys(answers).length}<span className="text-slate-700 mx-1">/</span>{exercise.questions.length} Decoded</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {exercise.questions.map((q, qi) => (
              <motion.div 
                 key={qi} 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: qi * 0.1 }}
                 className="glass-card p-10 border-white/5 bg-dark-900/40"
              >
                <h4 className="text-xl font-display font-bold text-white leading-relaxed tracking-tight mb-8">Q{qi + 1}. {q.question}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, oi) => {
                    const letter = ['A', 'B', 'C', 'D'][oi];
                    const isSelected = answers[qi] === oi;
                    const isCorrect = result && oi === q.correct;
                    const isWrong = result && isSelected && oi !== q.correct;
                    
                    return (
                      <button
                        key={oi}
                        disabled={loading || !!result}
                        onClick={() => setAnswers(p => ({ ...p, [qi]: oi }))}
                        className={`text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                          isCorrect ? 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald shadow-glow' :
                          isWrong ? 'border-accent-rose bg-accent-rose/10 text-accent-rose shadow-glow' :
                          isSelected ? 'border-accent-emerald bg-accent-emerald/5 text-white shadow-glow' :
                          'border-white/5 bg-dark-950 text-slate-500 hover:border-white/10 hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isSelected ? 'bg-accent-emerald text-white' : 'bg-dark-900 border border-white/10 text-slate-600'
                        }`}>{letter}</div>
                        <span className="flex-1 font-bold tracking-tight text-sm">{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {result && q.explanation && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8 p-6 bg-dark-950 rounded-2xl border border-white/5"
                  >
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      <span className="text-accent-emerald font-black uppercase tracking-widest mr-2">Neural Insight:</span> {q.explanation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {!result ? (
            <button 
              onClick={handleSubmit}
              disabled={loading || Object.keys(answers).length < exercise.questions.length}
              className="btn-primary w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-glow mt-6"
            >
              {loading ? "Decrypting Score..." : "Commit Analysis"}
            </button>
          ) : (
            <div className="glass-card p-12 bg-gradient-to-br from-accent-emerald/10 to-transparent border-white/5 text-center mt-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-dark-950 rounded-[24px] flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                 <Award size={40} className="text-accent-emerald shadow-glow" />
              </div>
              <div className="text-6xl font-black text-white mb-2 tracking-tight">{result.score}%</div>
              <p className="text-slate-400 text-lg font-medium mb-10 italic">"{result.score >= 70 ? "Comprehension validated. Protocol completed." : "Performance below threshold. Re-analysis suggested."}"</p>
              <button onClick={onBack} className="btn-primary px-12 py-4 text-[10px] font-black uppercase tracking-widest shadow-glow">Return to Nexus</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Reading() {
  const [phase, setPhase] = useState('roadmap');
  const [library, setLibrary] = useState({});
  const [completedCount, setCompletedCount] = useState(0);
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchLibrary = async () => {
    try {
      const { data } = await axios.get('/api/reading/books');
      setLibrary(data.library || {});
      setCompletedCount(data.completedCount || 0);
    } catch { toast.error("Neural library sync failed."); }
  };

  useEffect(() => { fetchLibrary(); }, []);
  useEffect(() => { if (user) fetchLibrary(); }, [user]);

  const handleSelectBook = async (book) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/reading/book-passage', { bookId: book.id });
      setExercise(data);
      setPhase('exercise');
    } catch { toast.error("Narrative generation error."); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-8">
        <div className="relative">
          <div className="w-24 h-24 border-[6px] border-white/5 rounded-full" />
          <div className="w-24 h-24 border-[6px] border-accent-emerald border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          <Palette size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-emerald animate-pulse" />
        </div>
        <div className="text-center space-y-2">
           <p className="text-2xl font-display font-bold text-white tracking-tight">Synthesizing Narrative</p>
           <p className="text-slate-500 font-medium">Neural engine hand-picking your next reading mission...</p>
        </div>
      </div>
    );
  }

  if (phase === 'exercise' && exercise) {
    return (
      <ReadingExercise 
        exercise={exercise} 
        onBack={() => { setPhase('roadmap'); fetchLibrary(); }} 
      />
    );
  }

  return (
    <ReadingRoadmap 
      library={library} 
      onSelectBook={handleSelectBook} 
      completedCount={completedCount} 
    />
  );
}