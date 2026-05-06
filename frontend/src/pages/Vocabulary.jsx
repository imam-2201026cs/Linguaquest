import { useState, useEffect } from 'react';
import axios from 'axios';
import TinderCard from 'react-tinder-card';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, ArrowLeft, ArrowRight, BookA, Repeat, CheckCircle, 
  RefreshCcw, Sparkles, Search, Zap, Volume2, Globe, Heart, 
  Briefcase, Info, X, ChevronRight, Activity, Shield, Target, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import XPReward from '../components/XPReward';

export default function Vocabulary() {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'library'
  const [queue, setQueue] = useState([]);
  const [allWords, setAllWords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reward, setReward] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { fetchProfile } = useAuth();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'review') {
        const { data } = await axios.get('/api/vocabulary');
        const combined = [...data.newWords, ...data.dueReviews].sort(() => 0.5 - Math.random());
        setQueue(combined);
        setStats(data.stats);
        setCurrentIndex(combined.length - 1);
      } else {
        const { data } = await axios.get('/api/vocabulary/all');
        setAllWords(data);
      }
    } catch (err) {
      toast.error('Neural library sync failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (dir, wordId) => {
    const knewIt = dir === 'right';
    setFlipped(false);
    
    try {
      const { data } = await axios.post('/api/vocabulary/review', { wordId, knewIt });
      setCurrentIndex(prev => prev - 1);
      
      if (knewIt) {
        toast.success(`Pattern Verified. Next review: ${data.vocab.interval}d`, { id: 'swipe-toast' });
      } else {
        toast('Reinforcement required.', { icon: '🔄', id: 'swipe-toast' });
      }
      
      if (currentIndex === 0) {
        const totalCards = queue.length;
        setReward({ xp: totalCards * 2, coins: Math.floor(totalCards / 2) });
        fetchProfile();
      }
    } catch {
      toast.error('Review sync error.');
    }
  };

  const filteredWords = allWords.filter(w => 
    w.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && queue.length === 0 && allWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-8 animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 border-[6px] border-white/5 rounded-full" />
          <div className="w-24 h-24 border-[6px] border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          <Brain size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-500 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
           <p className="text-2xl font-display font-bold text-white tracking-tight">Syncing Neural Lexicon</p>
           <p className="text-slate-500 font-medium">Retrieving spaced-repetition patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto min-h-[85vh] flex flex-col pt-4 pb-12 animate-slide-up select-none space-y-8">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">Cognitive Retention</span>
              <div className="h-px w-8 bg-primary-500/30" />
           </div>
           <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">Vocabulary <span className="shimmer-text">Nexus</span></h1>
           <p className="text-slate-500 text-sm font-medium">Spaced-repetition protocol for high-fidelity memory mapping.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-dark-900/50 rounded-[24px] border border-white/5 gap-1.5 backdrop-blur-xl mx-4">
        <button 
          onClick={() => setActiveTab('review')}
          className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'review' ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200'}`}
        >
          <Repeat size={14} /> Neural Review
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'library' ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200'}`}
        >
          <BookA size={14} /> Pattern Library
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 overflow-hidden">
        {activeTab === 'review' ? (
          <>
            {queue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-slide-up">
                <div className="w-24 h-24 bg-dark-950 rounded-[32px] flex items-center justify-center border border-white/5 shadow-inner group overflow-hidden relative">
                   <div className="absolute inset-0 bg-accent-emerald/10" />
                   <CheckCircle size={40} className="text-accent-emerald shadow-glow relative z-10" />
                </div>
                <div className="space-y-3">
                   <h2 className="text-3xl font-display font-bold text-white tracking-tight">Lexicon Optimized</h2>
                   <p className="text-slate-400 text-lg font-medium max-w-[280px] leading-relaxed mx-auto">
                      All daily spaced-repetition patterns have been successfully reinforced.
                   </p>
                </div>
                <button onClick={fetchData} className="btn-ghost px-8 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border-white/5">
                   <RefreshCcw size={14} /> Re-Sync
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-6">
                <div className="flex items-center justify-between px-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentIndex + 1} Patterns Pending</p>
                   <div className="flex items-center gap-4">
                      <div className="w-32 h-1.5 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                          className="h-full bg-primary-500 rounded-full shadow-glow" 
                          animate={{ width: `${((queue.length - 1 - currentIndex) / queue.length) * 100}%` }} 
                        />
                      </div>
                   </div>
                </div>

                {/* Flashcard Area */}
                <div className="relative flex-1 flex flex-col justify-center items-center perspective-2000 py-10">
                  <AnimatePresence>
                  {queue.map((item, index) => (
                    index === currentIndex && (
                    <TinderCard
                      className="absolute w-full max-w-[380px] z-50"
                      key={item._id}
                      onSwipe={(dir) => handleSwipe(dir, item._id)}
                      preventSwipe={['up', 'down']}
                      swipeRequirementType="position"
                      swipeThreshold={100}
                    >
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        onClick={() => setFlipped(!flipped)}
                        className={`
                          w-full h-[450px] rounded-[40px] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]
                          flex flex-col cursor-pointer transition-all duration-700 transform-style-3d relative
                          ${flipped ? 'rotate-y-180' : ''}
                        `}
                      >
                        {/* FRONT */}
                        <div className="absolute inset-0 w-full h-full backface-hidden p-12 flex flex-col items-center justify-center text-center bg-gradient-to-b from-dark-900 to-dark-950 rounded-[40px] shadow-inner">
                          <div className="absolute top-8 left-8 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow animate-pulse" />
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Scan</span>
                          </div>
                          {item.status === 'new' && (
                            <div className="absolute top-8 right-8 bg-accent-amber/10 border border-accent-amber/20 px-3 py-1 rounded-xl flex items-center gap-1.5">
                               <Sparkles size={10} className="text-accent-amber" />
                               <span className="text-[9px] font-black text-accent-amber uppercase tracking-widest">Initial Sync</span>
                            </div>
                          )}
                          <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">{item.word}</h2>
                          <div className="mt-8 px-6 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-white/10 transition-colors">
                             Decipher Meaning
                          </div>
                        </div>

                        {/* BACK */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-12 flex flex-col bg-dark-900 border border-primary-500/20 rounded-[40px] overflow-hidden">
                           <div className="absolute inset-0 bg-primary-500/5" />
                           <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                 <h2 className="text-2xl font-display font-bold text-white tracking-tight">{item.word}</h2>
                                 <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                                    <Volume2 size={16} />
                                 </div>
                              </div>
                              <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <div className="space-y-2">
                                  <p className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em]">Neural Definition</p>
                                  <p className="text-slate-200 text-base leading-relaxed font-medium">{item.definition}</p>
                                </div>
                                {item.example && (
                                  <div className="space-y-3">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Contextual Application</p>
                                    <div className="p-4 bg-dark-950/80 rounded-2xl border border-white/5 italic">
                                       <p className="text-slate-300 text-sm leading-relaxed font-medium">"{item.example}"</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="pt-6 border-t border-white/5 mt-auto flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <ArrowLeft size={12} className="text-accent-rose" />
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Reinforce</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Verify</span>
                                    <ArrowRight size={12} className="text-accent-emerald" />
                                 </div>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    </TinderCard>
                    )
                  ))}
                  </AnimatePresence>

                  {/* Behind Cards (Visual Stack) */}
                  {currentIndex > 0 && (
                     <div className="absolute w-full max-w-[380px] h-[450px] bg-dark-900/50 border border-white/5 rounded-[40px] scale-95 -translate-y-4 -z-10" />
                  )}
                  {currentIndex > 1 && (
                     <div className="absolute w-full max-w-[380px] h-[450px] bg-dark-900/30 border border-white/5 rounded-[40px] scale-90 -translate-y-8 -z-20" />
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-12 pt-6">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('left', queue[currentIndex]._id)}
                    className="w-16 h-16 rounded-[24px] bg-dark-950 border border-accent-rose/20 text-accent-rose flex items-center justify-center hover:bg-accent-rose hover:text-white transition-all shadow-glow-sm"
                  >
                    <X size={24} />
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('right', queue[currentIndex]._id)}
                    className="w-16 h-16 rounded-[24px] bg-dark-950 border border-accent-emerald/20 text-accent-emerald flex items-center justify-center hover:bg-accent-emerald hover:text-white transition-all shadow-glow-sm"
                  >
                    <CheckCircle size={24} />
                  </motion.button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col space-y-6 animate-slide-up">
            {/* Search */}
            <div className="relative mx-2">
              <input 
                type="text" 
                placeholder="Query Lexical Database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-950 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-all shadow-inner placeholder-slate-700 font-medium"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {filteredWords.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-slate-600 font-medium italic">No matching neural patterns found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredWords.map(w => (
                    <motion.div 
                      key={w._id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card p-6 border-white/5 bg-dark-900/40 hover:border-primary-500/30 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                      <div className="relative z-10 flex items-start justify-between mb-3">
                        <div>
                           <h3 className="text-xl font-display font-bold text-white group-hover:text-primary-400 transition-colors tracking-tight">{w.word}</h3>
                           <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mt-1">Source: <span className="text-primary-500/80">{w.source}</span></p>
                        </div>
                        <span className={`text-[9px] px-3 py-1 rounded-xl font-black uppercase tracking-widest ${
                          w.status === 'graduated' ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 
                          w.status === 'learning' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 
                          'bg-accent-amber/10 text-accent-amber border border-accent-amber/20'
                        }`}>
                          {w.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium mb-4 relative z-10 italic">"{w.definition}"</p>
                      <div className="flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] relative z-10">
                        <div className="flex items-center gap-2">
                           <Target size={10} className="text-primary-500" />
                           <span>Pattern Sync: 100%</span>
                        </div>
                        <span>Added {new Date(w.createdAt).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
