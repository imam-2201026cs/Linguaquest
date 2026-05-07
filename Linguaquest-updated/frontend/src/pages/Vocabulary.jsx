import { useState, useEffect } from 'react';
import axios from 'axios';
import TinderCard from 'react-tinder-card';
import toast from 'react-hot-toast';
import { Brain, ArrowLeft, ArrowRight, BookA, Repeat, CheckCircle, RefreshCcw, Sparkles } from 'lucide-react';
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
      toast.error('Failed to load vocabulary');
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
        toast.success(`Got it! Next review in ${data.vocab.interval} days.`, { id: 'swipe-toast', duration: 1500 });
      } else {
        toast('Learning... Will see this again soon.', { icon: '🔄', id: 'swipe-toast', duration: 1500 });
      }
      
      if (currentIndex === 0) {
        const totalCards = queue.length;
        setReward({ xp: totalCards * 2, coins: Math.floor(totalCards / 2) });
        fetchProfile();
      }
    } catch {
      toast.error('Failed to save review');
    }
  };

  const filteredWords = allWords.filter(w => 
    w.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && queue.length === 0 && allWords.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col pt-4 pb-12 overflow-hidden animate-slide-up select-none">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white leading-tight">Vocab Builder</h1>
            <p className="text-xs text-slate-400">Master new words daily</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 p-1 rounded-xl mb-6 mx-4">
        <button 
          onClick={() => setActiveTab('review')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'review' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Repeat size={16} /> Review
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'library' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <BookA size={16} /> Library
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 overflow-hidden">
        {activeTab === 'review' ? (
          <>
            {queue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up">
                <div className="w-20 h-20 bg-dark-700/50 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-xl">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                {stats?.total === 0 ? (
                  <>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">No words yet!</h2>
                    <p className="text-slate-400 mb-8 max-w-[240px]">Start learning words in Reading, Listening, or Roleplay modules to see them here.</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">You're all caught up! 🌟</h2>
                    <p className="text-slate-400 mb-8 max-w-[240px]">You've reviewed all your words for today. Check your Library to see all saved words!</p>
                  </>
                )}
                <button onClick={fetchData} className="btn-ghost flex items-center gap-2">
                  <RefreshCcw size={16} /> Refresh
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {currentIndex + 1} cards left
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 transition-all duration-500" 
                        style={{ width: `${((queue.length - 1 - currentIndex) / queue.length) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Flashcard Area */}
                <div className="relative flex-1 flex flex-col justify-center items-center perspective-1000">
                  {queue.map((item, index) => (
                    <TinderCard
                      className="absolute w-full max-w-[340px]"
                      key={item._id}
                      onSwipe={(dir) => handleSwipe(dir, item._id)}
                      preventSwipe={['up', 'down']}
                      swipeRequirementType="position"
                      swipeThreshold={80}
                    >
                      <div 
                        onClick={() => index === currentIndex && setFlipped(!flipped)}
                        className={`
                          w-full h-[400px] bg-dark-800 rounded-3xl border border-white/10 shadow-2xl
                          flex flex-col cursor-pointer transition-all duration-300 transform-style-3d
                          ${index === currentIndex ? 'scale-100 opacity-100 z-10' : 'scale-95 opacity-0 -translate-y-4 pointer-events-none'}
                          ${flipped && index === currentIndex ? 'rotate-y-180' : ''}
                        `}
                      >
                        {/* FRONT */}
                        <div className="absolute inset-0 w-full h-full backface-hidden p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-dark-800 to-dark-900 rounded-3xl">
                          {item.status === 'new' && (
                            <span className="absolute top-4 left-4 flex items-center gap-1 text-[10px] font-bold text-accent-yellow bg-accent-yellow/10 px-2 py-0.5 rounded">
                              <Sparkles size={10} /> NEW
                            </span>
                          )}
                          <h2 className="text-4xl font-display font-bold text-white mb-2">{item.word}</h2>
                          <p className="text-slate-500 text-xs mt-4">Tap to reveal meaning</p>
                        </div>

                        {/* BACK */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-8 flex flex-col bg-dark-900 border border-primary-500/20 rounded-3xl overflow-y-auto custom-scrollbar">
                          <h2 className="text-2xl font-display font-bold text-white mb-4 border-b border-white/5 pb-2">{item.word}</h2>
                          <div className="space-y-4 flex-1">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Meaning</p>
                              <p className="text-slate-200 text-sm leading-relaxed">{item.definition}</p>
                            </div>
                            {item.example && (
                              <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Example</p>
                                <p className="text-slate-300 text-sm italic border-l-2 border-primary-500/30 pl-3">"{item.example}"</p>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-center text-slate-600 mt-4 italic">Swipe left if wrong • Swipe right if correct</p>
                        </div>
                      </div>
                    </TinderCard>
                  ))}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-12 mt-8 mb-4">
                  <button 
                    onClick={() => handleSwipe('left', queue[currentIndex]._id)}
                    className="w-12 h-12 rounded-full bg-dark-800 border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button 
                    onClick={() => handleSwipe('right', queue[currentIndex]._id)}
                    className="w-12 h-12 rounded-full bg-dark-800 border border-green-500/30 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-lg active:scale-90"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search */}
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Search your vocabulary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-800 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
              />
              <BookA size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {filteredWords.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">No words found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWords.map(w => (
                    <div key={w._id} className="glass-card p-4 hover:border-primary-500/30 transition-all group">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors">{w.word}</h3>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          w.status === 'graduated' ? 'bg-green-500/10 text-green-400' : 
                          w.status === 'learning' ? 'bg-blue-500/10 text-blue-400' : 
                          'bg-accent-yellow/10 text-accent-yellow'
                        }`}>
                          {w.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">{w.definition}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] text-slate-600 italic">Source: {w.source}</span>
                        <span className="text-[10px] text-slate-600">Added {new Date(w.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
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
