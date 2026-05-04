import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BookOpen, RefreshCw, ChevronRight, Zap, CheckCircle, XCircle, 
  Info, Lock, Star, Clock, BarChart2, Layers, Map, Trophy,
  Palette, Sparkles, Book
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
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <Map size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Reading Roadmap</h1>
            <p className="text-slate-400 text-sm">180 Progressive Cartoon Stories</p>
          </div>
        </div>
        <div className="glass-card px-6 py-3 flex items-center gap-4 border-green-500/20 bg-green-500/5">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Mastery</p>
            <p className="text-xl font-display font-black text-white">{completedCount} / 180</p>
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
              {/* Level Header */}
              <div className="flex items-center gap-4 mb-6 sticky top-0 z-10 py-2 bg-dark-900/80 backdrop-blur-md">
                <div className="text-3xl">{TIER_ICONS[lvl]}</div>
                <div className="flex-1">
                  <h2 className="text-xl font-display font-bold text-white">{section.label}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden max-w-[200px]">
                      <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${section.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{section.progress}% Complete</span>
                  </div>
                </div>
              </div>

              {/* Roadmap Path */}
              <div className="space-y-8">
                {['beginner', 'intermediate', 'advanced'].map(tier => {
                  const tierBooks = section.books.filter(b => b.tier === tier);
                  if (!tierBooks.length) return null;
                  
                  return (
                    <div key={tier} className="space-y-3">
                      <div className="flex items-center gap-2 opacity-50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tier} Phase</span>
                        <div className="h-[1px] flex-1 bg-white/5" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {tierBooks.map((book) => {
                          const idx = section.books.indexOf(book);
                          const isUnlockedByForce = (lvl === 'beginner' && idx === 0);
                          const isLocked = !book.isUnlocked && !isUnlockedByForce;
                          const isCompleted = book.isCompleted;
                          
                          return (
                            <button
                              key={book.id}
                              disabled={isLocked}
                              onClick={() => onSelectBook(book)}
                              className={`relative group p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center ${
                                isCompleted 
                                ? 'bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/5' 
                                : isLocked 
                                ? 'bg-dark-800/50 border-white/5 opacity-40 cursor-not-allowed'
                                : 'bg-dark-700 border-white/10 hover:border-green-500/50 hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 cursor-pointer'
                              }`}
                            >
                              {/* Badge */}
                              <div className="absolute -top-2 -right-2 z-20">
                                {isCompleted ? (
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"><CheckCircle size={14} className="text-white" /></div>
                                ) : isLocked ? (
                                  <div className="w-6 h-6 bg-dark-800 border border-white/10 rounded-full flex items-center justify-center"><Lock size={12} className="text-slate-500" /></div>
                                ) : (
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse shadow-lg"><Zap size={12} className="text-white" /></div>
                                )}
                              </div>

                              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                {book.emoji}
                              </div>
                              
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Module {idx + 1}</div>
                              <h3 className="text-xs font-bold text-white leading-tight line-clamp-2 min-h-[32px]">
                                {book.title}
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
      return toast.error("Please answer all questions!");
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
        toast.success("Lesson Mastered! Next one unlocked.", { icon: '🔥' });
      }
    } catch { toast.error("Failed to submit"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up pb-20">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
      
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-ghost text-sm py-2 px-3 flex items-center gap-1">
          <ChevronRight size={14} className="rotate-180" /> Back to Roadmap
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{exercise.book.emoji}</span>
          <h2 className="text-xl font-display font-bold text-white">{exercise.book.title}</h2>
        </div>
      </div>

      {!quizMode ? (
        <div className="space-y-6">
          {/* Cartoon Illustration Placeholder */}
          <div className="glass-card p-2 border-white/5 bg-gradient-to-br from-dark-800 to-dark-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="aspect-video bg-dark-700 rounded-2xl flex flex-col items-center justify-center p-8 text-center relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative z-10">
                <Palette size={48} className="text-green-400 mb-4 mx-auto animate-bounce" />
                <p className="text-slate-300 italic text-sm max-w-sm">"{exercise.illustrationPrompt || 'An engaging cartoon illustration for this story'}"</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  <Sparkles size={12} className="text-yellow-500" /> AI Cartoon Style
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 border-green-500/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
            <p className="text-slate-200 leading-[2] text-lg whitespace-pre-wrap font-body">
              {exercise.passage}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-6 border-blue-500/10">
              <h3 className="text-xs font-bold text-blue-400 uppercase mb-4 flex items-center gap-2">
                <Book size={14} /> Key Vocabulary
              </h3>
              <div className="space-y-3">
                {exercise.vocabulary.map((v, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-white font-bold text-sm">{v.word}</span>
                    <span className="text-slate-400 text-xs">{v.definition}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6 border-purple-500/10 flex flex-col justify-center items-center text-center">
              <p className="text-slate-400 text-sm mb-6 italic">"Finished reading? Let's see how much you understood!"</p>
              <button 
                onClick={() => setQuizMode(true)}
                className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg"
              >
                Start Comprehension Quiz <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card p-4 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
               <span className="text-2xl">{exercise.book.emoji}</span>
               <div>
                 <p className="text-[10px] text-slate-500 uppercase font-bold">Quiz Mode</p>
                 <p className="text-white font-bold">{exercise.book.title}</p>
               </div>
            </div>
            <span className="text-xs text-slate-400">{Object.keys(answers).length} / {exercise.questions.length} Answered</span>
          </div>

          {exercise.questions.map((q, qi) => (
            <div key={qi} className="glass-card p-6 animate-fade-in" style={{ animationDelay: `${qi * 100}ms` }}>
              <p className="font-bold text-white mb-6 text-lg">Q{qi + 1}. {q.question}</p>
              <div className="space-y-3">
                {q.options.map((opt, oi) => {
                  const letter = ['A', 'B', 'C', 'D'][oi];
                  const isSelected = answers[qi] === oi;
                  const isCorrect = result && oi === q.correct;
                  const isWrong = result && isSelected && oi !== q.correct;
                  
                  return (
                    <button
                      key={oi}
                      disabled={loading || result}
                      onClick={() => setAnswers(p => ({ ...p, [qi]: oi }))}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                        isCorrect ? 'border-green-500 bg-green-500/10 text-green-400' :
                        isWrong ? 'border-red-500 bg-red-500/10 text-red-400' :
                        isSelected ? 'border-green-500 bg-green-500/5 text-white' :
                        'border-white/5 bg-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                        isSelected ? 'bg-green-500 text-white' : 'bg-dark-600 text-slate-500'
                      }`}>{letter}</span>
                      <span className="flex-1 font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>
              {result && q.explanation && (
                <div className="mt-4 p-4 bg-dark-800 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-400 leading-relaxed"><span className="text-green-400 font-bold">Explanation:</span> {q.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {!result ? (
            <button 
              onClick={handleSubmit}
              disabled={loading || Object.keys(answers).length < exercise.questions.length}
              className="btn-primary w-full py-4 text-xl mt-8 disabled:opacity-50"
            >
              {loading ? "Grading..." : "Submit Answers"}
            </button>
          ) : (
            <div className="glass-card p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 text-center mt-8">
              <div className="text-5xl font-black text-white mb-2">{result.score}%</div>
              <p className="text-slate-300 mb-6">{result.score >= 70 ? "Excellent Mastery!" : "Keep Practicing!"}</p>
              <button onClick={onBack} className="btn-primary px-10">Continue Roadmap</button>
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
    } catch { toast.error("Failed to load library"); }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  useEffect(() => {
    if (user) fetchLibrary();
  }, [user]);

  const handleSelectBook = async (book) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/reading/book-passage', { bookId: book.id });
      setExercise(data);
      setPhase('exercise');
    } catch { toast.error("Failed to load story"); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-green-500/20 rounded-full" />
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          <Palette size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500" />
        </div>
        <p className="text-slate-400 animate-pulse font-display font-bold">Illustrating your cartoon story...</p>
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
