import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Target, Timer, CheckCircle, XCircle, ChevronRight, Zap, Trophy, Globe, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import XPReward from '../components/XPReward';

export default function DailyChallenge() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Quiz State
  const [answers, setAnswers] = useState({});
  const [stage, setStage] = useState(1); // 1 = First 5, 2 = Next 5, 3 = Submitted
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  
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
      if (res.data.submission) {
        setStage(3);
      }
    } catch (err) {
      toast.error('Failed to load Daily Challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qIndex, optionIndex) => {
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = async (isEarlySubmit = false) => {
    const questionsToAnswer = isEarlySubmit ? 5 : 10;
    
    // Check if all required questions are answered
    for (let i = 0; i < questionsToAnswer; i++) {
      if (answers[i] === undefined) {
        return toast.error(`Please answer question ${i + 1} first!`);
      }
    }

    try {
      const res = await axios.post('/api/challenge/submit', { 
        answers, 
        questionsAnswered: questionsToAnswer 
      });
      
      setResult(res.data);
      setReward({ xp: res.data.xpEarned, coins: res.data.coinsEarned });
      setStage(3);
      fetchProfile();
      fetchChallenge(); // Refetch to get global stats & submission state
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.challenge) return null;

  const challenge = data.challenge;
  const submission = data.submission;

  // Determine which questions to show based on stage
  const currentQuestions = stage === 1 ? challenge.questions.slice(0, 5) : challenge.questions.slice(5, 10);
  const qOffset = stage === 1 ? 0 : 5;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up pb-20">
      {reward && <XPReward {...reward} onClose={() => setReward(null)} />}

      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-500/20">
            <Target size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Daily Challenge</h1>
          <p className="text-slate-300 max-w-sm mx-auto mb-6">Everyone gets the exact same quiz. Compete globally and earn <strong className="text-accent-yellow">Double XP</strong>!</p>
          
          <div className="inline-flex items-center gap-2 bg-dark-800/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-sm font-bold text-white">
            <Timer size={16} className="text-red-400" />
            Ends in: <span className="font-mono text-red-300">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Results View */}
      {stage === 3 && submission && (
        <div className="space-y-6 animate-slide-up">
          <div className="glass-card p-8 text-center border-green-500/20 bg-gradient-to-b from-green-500/5 to-transparent">
            <div className="w-20 h-20 bg-dark-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-2xl">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Challenge Completed!</h2>
            <p className="text-slate-400 mb-6">You scored {submission.score}% on today's challenge.</p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-dark-800 border border-white/5 rounded-xl p-4 min-w-[120px]">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Score</p>
                <p className="text-2xl font-bold text-white">{submission.score}%</p>
              </div>
              <div className="bg-dark-800 border border-white/5 rounded-xl p-4 min-w-[120px]">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Answered</p>
                <p className="text-2xl font-bold text-white">{submission.questionsAnswered} Qs</p>
              </div>
            </div>
          </div>

          {/* Global Stats */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Globe size={18} className="text-blue-400" /> Global Community Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-xs text-blue-300 font-bold mb-1 flex items-center gap-1"><Trophy size={12}/> Average Score</p>
                <p className="text-2xl font-bold text-blue-400">{Math.round(challenge.averageScore)}%</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <p className="text-xs text-purple-300 font-bold mb-1 flex items-center gap-1"><Target size={12}/> Total Players</p>
                <p className="text-2xl font-bold text-purple-400">{challenge.totalCompletions}</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 col-span-2 md:col-span-1">
                <p className="text-xs text-orange-300 font-bold mb-1 flex items-center gap-1"><Flame size={12}/> Hardcore (10 Qs)</p>
                <p className="text-2xl font-bold text-orange-400">{challenge.totalStage2Completions}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz View */}
      {stage !== 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-bold text-white">Stage {stage} / 2</h2>
            <span className="text-xs bg-dark-700 px-3 py-1 rounded-full text-slate-400 border border-white/5">Questions {qOffset + 1}-{qOffset + 5}</span>
          </div>

          <div className="space-y-4">
            {currentQuestions.map((q, localIndex) => {
              const absoluteIndex = qOffset + localIndex;
              return (
                <div key={absoluteIndex} className="glass-card p-5">
                  <p className="font-medium text-white mb-4 text-sm">{absoluteIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = answers[absoluteIndex] === optIndex;
                      return (
                        <button 
                          key={optIndex} 
                          onClick={() => handleAnswer(absoluteIndex, optIndex)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                            isSelected 
                              ? 'border-primary-500/50 bg-primary-500/10 text-primary-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                              : 'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 transition-colors ${isSelected ? 'border-primary-400 text-primary-400' : 'border-slate-500 text-slate-500'}`}>
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          {stage === 1 ? (
            <div className="glass-card p-6 border-primary-500/20 bg-primary-500/5 text-center mt-8">
              <h3 className="font-bold text-white mb-2">Stage 1 Complete?</h3>
              <p className="text-sm text-slate-400 mb-6">You can submit now, or continue to Stage 2 for 5 more questions and double the potential XP!</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => handleSubmit(true)} className="btn-ghost flex-1">
                  Submit Now (5 Qs)
                </button>
                <button onClick={() => {
                  for(let i=0; i<5; i++) {
                    if (answers[i] === undefined) return toast.error(`Please answer question ${i+1} first!`);
                  }
                  setStage(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Continue to Stage 2 <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => handleSubmit(false)} className="btn-primary w-full flex items-center justify-center gap-2 mt-8 py-4">
              <Zap size={18} /> Submit Final Answers
            </button>
          )}
        </div>
      )}

    </div>
  );
}
