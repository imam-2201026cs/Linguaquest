// Premium Reading Nexus Overhaul - Lexical Narrative Edition
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, RefreshCw, ChevronRight, Zap, CheckCircle, XCircle, 
  Lock, Star, Trophy, ArrowLeft, Globe, Activity, Shield,
  Target, Sparkles, Book, Cpu, Terminal
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
    <div className="max-w-7xl mx-auto animate-slide-up pb-32 space-y-16 px-6 md:px-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="max-w-2xl">
           <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-emerald">Lexical Perception Matrix</span>
              <div className="h-px w-12 bg-accent-emerald/30" />
           </div>
           <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none mb-4">
             Reading <span className="shimmer-text">Nexus</span>
           </h1>
           <p className="text-slate-400 text-lg font-medium leading-relaxed">
             Progressive narratives mapped for cognitive mastery and neural expansion.
           </p>
        </div>
        <div className="glass-card px-10 py-6 flex items-center gap-8 border-white/5 bg-dark-950/40 relative overflow-hidden group shadow-glow-sm">
           <div className="absolute inset-0 bg-accent-emerald/5 group-hover:bg-accent-emerald/10 transition-colors" />
           <div className="relative z-10 text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-2">Global Mastery</p>
              <p className="text-4xl font-display font-black text-white">{completedCount}<span className="text-accent-emerald/30 text-2xl mx-1">/</span>180</p>
           </div>
           <div className="w-16 h-16 bg-accent-emerald/10 rounded-2xl flex items-center justify-center border border-accent-emerald/20 shadow-inner relative z-10">
              <Trophy size={32} className="text-accent-emerald animate-pulse" />
           </div>
        </div>
      </div>

      {/* Grid of Levels */}
      <div className="space-y-24">
        {levels.map((lvl) => {
          const section = library[lvl];
          if (!section) return null;
          
          return (
            <div key={lvl} className="relative">
              {/* Sticky Level Header */}
              <div className="flex items-center gap-6 mb-12 sticky top-0 z-20 py-6 bg-dark-950/60 backdrop-blur-2xl border-b border-white/5">
                <div className="w-16 h-16 bg-dark-950 border border-white/10 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner shrink-0 group">
                   <span className="group-hover:scale-125 transition-transform duration-500">{TIER_ICONS[lvl]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase tracking-[0.1em] truncate">{section.label}</h2>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1 h-2 bg-dark-950 rounded-full overflow-hidden max-w-[300px] p-0.5 border border-white/5">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${section.progress}%` }}
                         className="h-full bg-accent-emerald rounded-full shadow-glow" 
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] shrink-0">{section.progress}% DECIPHERED</span>
                  </div>
                </div>
              </div>

              {/* Tiers within Level */}
              <div className="space-y-16">
                {['beginner', 'intermediate', 'advanced'].map(tier => {
                  const tierBooks = section.books.filter(b => b.tier === tier);
                  if (!tierBooks.length) return null;
                  
                  return (
                    <div key={tier} className="space-y-8">
                      <div className="flex items-center gap-4 px-2">
                        <div className="w-2 h-2 rounded-full bg-accent-emerald shadow-glow" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                          {tier === 'beginner' ? 'Phase 1: Initiation' : tier === 'intermediate' ? 'Phase 2: Expansion' : 'Phase 3: Mastery'}
                        </span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {tierBooks.map((book) => {
                          const isLocked = !book.isUnlocked;
                          const isCompleted = book.isCompleted;
                          
                          return (
                            <motion.button
                              key={book.id}
                              whileHover={!isLocked ? { y: -8, scale: 1.02 } : {}}
                              disabled={isLocked}
                              onClick={() => !isLocked && onSelectBook(book)}
                              className={`relative group p-8 rounded-[2.5rem] border transition-all duration-700 flex flex-col items-center text-center ${
                                isCompleted 
                                ? 'bg-accent-emerald/5 border-accent-emerald/20 shadow-glow-sm' 
                                : isLocked 
                                ? 'bg-dark-950/40 border-white/5 opacity-40 grayscale cursor-not-allowed'
                                : 'bg-dark-900/40 border-white/5 hover:border-accent-emerald/50 hover:bg-white/5 shadow-premium cursor-pointer'
                              }`}
                            >
                              <div className="absolute -top-1 -right-1 z-10">
                                {isCompleted ? (
                                  <div className="w-10 h-10 bg-accent-emerald rounded-2xl flex items-center justify-center shadow-glow border border-white/10">
                                    <CheckCircle size={18} className="text-white" />
                                  </div>
                                ) : isLocked ? (
                                  <div className="w-10 h-10 bg-dark-900 border border-white/5 rounded-2xl flex items-center justify-center">
                                    <Lock size={16} className="text-slate-600" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-accent-emerald rounded-2xl flex items-center justify-center animate-pulse shadow-glow border border-white/10">
                                    <Zap size={18} className="text-white" />
                                  </div>
                                )}
                              </div>

                              <div className="w-20 h-20 bg-dark-950 rounded-3xl flex items-center justify-center text-4xl mb-6 border border-white/5 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                {book.emoji}
                              </div>
                              
                              <h3 className="text-sm font-black text-white leading-tight tracking-tight line-clamp-2 min-h-[40px] group-hover:text-accent-emerald transition-colors uppercase">
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
    } catch { toast.error("Lexical uplink failed."); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[75vh] gap-12">
      <div className="relative">
        <div className="w-32 h-32 border-[8px] border-white/5 rounded-full" />
        <div className="w-32 h-32 border-[8px] border-accent-emerald border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        <BookOpen size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-emerald animate-pulse" />
      </div>
      <div className="text-center space-y-4">
         <p className="text-3xl font-display font-black text-white tracking-tighter uppercase">Mapping Lexical Datastream</p>
         <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">Neural engine hand-picking your next textual challenge...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen max-w-[1600px] mx-auto">
      {!selectedBook ? (
        <ReadingRoadmap 
          library={library} 
          onSelectBook={setSelectedBook} 
          completedCount={completedCount}
        />
      ) : (
        <div className="px-8 animate-slide-up">
          <div className="flex items-center gap-6 mb-12">
            <button onClick={() => setSelectedBook(null)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all border border-white/5 hover:bg-white/10">
              <ArrowLeft size={24} />
            </button>
            <div>
               <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">Redirecting to Analysis Core</h2>
               <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-accent-emerald shadow-glow animate-pulse" />
                  <span className="text-[10px] font-black text-accent-emerald uppercase tracking-[0.3em]">Mission Initializing: {selectedBook.title}</span>
               </div>
            </div>
          </div>
          
          <div className="glass-card p-24 text-center border-white/5 bg-dark-900/40 space-y-12 shadow-premium">
             <div className="w-32 h-32 bg-dark-950 rounded-[3rem] flex items-center justify-center text-6xl mx-auto border border-white/10 shadow-inner">
                {selectedBook.emoji}
             </div>
             <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter">{selectedBook.title}</h2>
                <p className="text-slate-500 text-lg font-medium">Neural engine is preparing the textual environment...</p>
             </div>
             <div className="w-64 h-1.5 bg-dark-950 rounded-full mx-auto overflow-hidden border border-white/5">
                <motion.div 
                   animate={{ x: ['-100%', '100%'] }} 
                   transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                   className="w-1/2 h-full bg-accent-emerald shadow-glow" 
                />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}