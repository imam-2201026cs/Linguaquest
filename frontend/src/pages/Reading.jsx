import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, RefreshCw, ChevronRight, Zap, CheckCircle, XCircle, 
  Lock, Star, Trophy, ArrowLeft, Globe, Activity, Shield,
  Target, Sparkles, Book
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
    <div className="max-w-6xl mx-auto animate-slide-up pb-20 space-y-10 md:space-y-12 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div className="text-center md:text-left">
           <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-emerald">Lexical Perception</span>
              <div className="h-px w-8 bg-accent-emerald/30" />
           </div>
           <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">Reading <span className="shimmer-text">Nexus</span></h1>
           <p className="text-slate-400 text-sm md:text-lg mt-2 font-medium">Progressive narratives mapped for cognitive mastery.</p>
        </div>
        <div className="glass-card px-6 py-4 md:px-8 md:py-5 flex items-center gap-4 md:gap-6 border-white/10 bg-dark-900/40 relative overflow-hidden group mx-auto md:mx-0">
           <div className="absolute inset-0 bg-accent-emerald/5 group-hover:bg-accent-emerald/10 transition-colors" />
           <div className="relative z-10 text-right">
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1">Global Mastery</p>
              <p className="text-2xl md:text-3xl font-display font-black text-white">{completedCount}<span className="text-accent-emerald/50 text-xl mx-1">/</span>180</p>
           </div>
           <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-emerald/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-accent-emerald/20 shadow-glow relative z-10">
              <Trophy size={20} md:size={24} className="text-accent-emerald" />
           </div>
        </div>
      </div>

      <div className="space-y-12 md:space-y-16">
        {levels.map((lvl) => {
          const section = library[lvl];
          if (!section) return null;
          
          return (
            <div key={lvl} className="relative">
              <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-8 sticky top-0 z-20 py-3 md:py-4 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 px-2">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-dark-950 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-inner shrink-0">
                   {TIER_ICONS[lvl]}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-2xl font-display font-bold text-white tracking-tight uppercase tracking-widest truncate">{section.label}</h2>
                  <div className="flex items-center gap-3 mt-1 md:mt-2">
                    <div className="flex-1 h-1 bg-dark-950 rounded-full overflow-hidden max-w-[180px] md:max-w-[240px] border border-white/5">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${section.progress}%` }}
                         className="h-full bg-accent-emerald rounded-full shadow-glow" 
                      />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">{section.progress}% Deciphered</span>
                  </div>
                </div>
              </div>

              <div className="space-y-10 md:space-y-12">
                {['beginner', 'intermediate', 'advanced'].map(tier => {
                  const tierBooks = section.books.filter(b => b.tier === tier);
                  if (!tierBooks.length) return null;
                  
                  return (
                    <div key={tier} className="space-y-5 md:space-y-6">
                      <div className="flex items-center gap-3 md:gap-4 px-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-glow" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{tier} Protocol</span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {tierBooks.map((book) => {
                          const isLocked = !book.isUnlocked;
                          const isCompleted = book.isCompleted;
                          
                          return (
                            <motion.button
                              key={book.id}
                              whileHover={!isLocked ? { y: -3 } : {}}
                              disabled={isLocked}
                              onClick={() => !isLocked && onSelectBook(book)}
                              className={`relative group p-6 md:p-8 rounded-[24px] md:rounded-[32px] border transition-all duration-500 flex flex-col items-center text-center ${
                                isCompleted 
                                ? 'bg-accent-emerald/5 border-accent-emerald/20' 
                                : isLocked 
                                ? 'bg-dark-950 border-white/5 opacity-40 grayscale cursor-not-allowed'
                                : 'bg-dark-900/40 border-white/5 hover:border-accent-emerald/50 hover:bg-white/5 shadow-2xl cursor-pointer'
                              }`}
                            >
                              <div className="absolute -top-1 -right-1">
                                {isCompleted ? (
                                  <div className="w-7 h-7 md:w-8 md:h-8 bg-accent-emerald rounded-lg md:rounded-xl flex items-center justify-center shadow-glow">
                                    <CheckCircle size={14} md:size={16} className="text-white" />
                                  </div>
                                ) : isLocked ? (
                                  <div className="w-7 h-7 md:w-8 md:h-8 bg-dark-800 border border-white/10 rounded-lg md:rounded-xl flex items-center justify-center">
                                    <Lock size={12} md:size={14} className="text-slate-600" />
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 md:w-8 md:h-8 bg-accent-emerald rounded-lg md:rounded-xl flex items-center justify-center animate-pulse shadow-glow">
                                    <Zap size={14} md:size={16} className="text-white" />
                                  </div>
                                )}
                              </div>

                              <div className="w-12 h-12 md:w-16 md:h-16 bg-dark-950 rounded-xl md:rounded-2xl flex items-center justify-center text-3xl md:text-4xl mb-4 md:mb-6 border border-white/5 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                {book.emoji}
                              </div>
                              
                              <h3 className="text-xs md:text-sm font-bold text-white leading-tight tracking-tight line-clamp-2 min-h-[32px] md:min-h-[40px] group-hover:text-accent-emerald transition-colors">
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

export default function Reading() {
  const { user, fetchProfile } = useAuth();
  const [library, setLibrary] = useState({});
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const res = await axios.get('/api/reading/library');
      setLibrary(res.data.library);
      setCompletedCount(res.data.completedCount);
    } catch { toast.error("Failed to sync lexical library."); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-accent-emerald border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mapping Textual Datastream</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      {!selectedBook ? (
        <ReadingRoadmap 
          library={library} 
          onSelectBook={setSelectedBook} 
          completedCount={completedCount}
        />
      ) : (
        <div className="p-4 md:p-0">
          {/* Simple back logic for now */}
          <button onClick={() => setSelectedBook(null)} className="btn-ghost mb-4 flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Nexus
          </button>
          <div className="text-center py-20 text-slate-500">
            <h2 className="text-2xl font-bold text-white">Module Selected: {selectedBook.title}</h2>
            <p className="mt-2">Redirecting to Analysis Core...</p>
          </div>
        </div>
      )}
    </div>
  );
}