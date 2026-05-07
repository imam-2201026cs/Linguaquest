import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Volume2, Languages, Lightbulb, RefreshCw, 
  ChevronRight, Trophy, Globe, Flame, BookOpen, Brain, 
  Layers, CheckCircle, XCircle, ChevronUp, Zap, HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import XPReward from '../components/XPReward';

const TOPICS = [
  "Antonyms", "Synonyms", "Spelling Errors", "One Word Substitution", "Verbs", "Adverbs", "Tenses",
  "Subject-Verb Agreement", "Idioms & Phrases", "Agreement", "Articles", "Error Detection",
  "Fill in the Blanks", "Sentence Correction", "Rearrangement", "Vocabulary", "Unseen Passage",
  "Narration (Direct & Indirect Speech)", "Active & Passive Voice"
];

const TOPIC_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-orange-500 to-red-600",
  "from-green-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600"
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
      toast.error('Failed to generate test. Please try again.');
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
    const xp = correctCount * 5; // 5 XP per correct answer
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
      <div className="max-w-4xl mx-auto pb-20 animate-slide-up">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Verbal Ability Test</h1>
            <p className="text-slate-400">Master English proficiency with 15-question targeted practice</p>
          </div>
        </div>

        {/* Mixed Test Banner */}
        <button 
          onClick={() => startTest('Mixed')}
          className="w-full mb-8 relative group overflow-hidden rounded-3xl p-8 text-left transition-all hover:scale-[1.01]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-blue opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Brain size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white mb-3 inline-block">MOST CHALLENGING</div>
              <h2 className="text-3xl font-bold text-white mb-2">Mixed Ability Test</h2>
              <p className="text-white/80 max-w-md">A comprehensive 15-question mixture of all topics to test your overall English proficiency.</p>
            </div>
            <div className="bg-white text-primary-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl">
              Start Mega Test <ChevronRight size={18} />
            </div>
          </div>
        </button>

        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Layers size={20} className="text-primary-400" /> Practice by Topic
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {TOPICS.map((topic, i) => (
            <button
              key={topic}
              onClick={() => startTest(topic)}
              className="glass-card p-6 text-left group hover:border-primary-500/50 transition-all hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TOPIC_COLORS[i % TOPIC_COLORS.length]} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <BookOpen size={20} className="text-white" />
              </div>
              <h4 className="font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">{topic}</h4>
              <p className="text-xs text-slate-500">15 Questions • Advanced</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Loading View
  if (stage === 1) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-primary-500">
            <Brain size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Generating Your Test</h2>
        <p className="text-slate-400">Our AI is hand-picking 15 high-quality questions for <br/><strong className="text-primary-400">{selectedTopic}</strong>...</p>
      </div>
    );
  }

  // 3. Quiz View
  if (stage === 2) {
    const currentQ = questions[currentIndex];
    return (
      <div className="max-w-xl mx-auto min-h-[90vh] flex flex-col pb-10 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sticky top-0 bg-dark-900/80 backdrop-blur-md z-20 border-b border-white/5 mb-6">
          <button onClick={() => setStage(0)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
              <span className="w-5 h-5 bg-green-500 text-dark-900 rounded-full flex items-center justify-center text-[10px] font-bold">{correctCount}</span>
              <span className="text-xs font-bold text-green-400">Correct</span>
            </div>
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
              <span className="w-5 h-5 bg-red-500 text-dark-900 rounded-full flex items-center justify-center text-[10px] font-bold">{wrongCount}</span>
              <span className="text-xs font-bold text-red-400">Wrong</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 mb-8">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            <span>{selectedTopic}</span>
            <span>{currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
              style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-6 flex-1 space-y-6">
          {/* Question Card */}
          <div className="glass-card border-primary-500/20">
            <div className="p-8">
              <h2 className="text-xl font-medium text-center text-white mb-8 leading-relaxed">
                {currentQ.question}
              </h2>
              <div className="flex justify-center gap-4">
                <button onClick={() => speak(currentQ.question)} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Volume2 size={20} />
                </button>
                <button className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Languages size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              let statusClass = "border-white/10 text-slate-300 hover:border-primary-500/30 hover:bg-primary-500/5";
              if (isAnswered) {
                if (idx === currentQ.correct) {
                  statusClass = "border-green-500 bg-green-500/10 text-green-400 font-bold";
                } else if (idx === selectedOption) {
                  statusClass = "border-red-500 bg-red-500/10 text-red-400 font-bold";
                } else {
                  statusClass = "border-white/5 text-slate-500 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${statusClass}`}
                >
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${isAnswered && idx === currentQ.correct ? 'bg-green-500 border-green-500 text-white' : isAnswered && idx === selectedOption ? 'bg-red-500 border-red-500 text-white' : 'border-slate-500 text-slate-500 group-hover:border-primary-400'}`}>
                    {isAnswered && idx === currentQ.correct ? '✓' : isAnswered && idx === selectedOption ? '✕' : String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1 text-base">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="animate-slide-up">
              <div className="bg-primary-500/5 border border-primary-500/20 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Lightbulb size={48} />
                </div>
                <div className="flex items-center gap-2 text-primary-400 font-bold text-sm mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <Lightbulb size={16} />
                  </div>
                  <span>Detailed Explanation</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                  {currentQ.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="pt-6">
              <button 
                onClick={handleNext}
                className="w-full btn-primary py-5 flex items-center justify-center gap-2 rounded-2xl shadow-xl shadow-primary-500/20 text-lg font-bold"
              >
                {currentIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'} <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Summary View
  if (stage === 3) {
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-slide-up">
        {reward && <XPReward {...reward} onClose={() => setReward(null)} />}
        
        <div className="glass-card p-12 text-center border-primary-500/20 bg-gradient-to-b from-primary-500/10 to-transparent">
          <div className="w-24 h-24 bg-dark-700/50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-blue opacity-20 rounded-3xl group-hover:opacity-40 transition-opacity"></div>
             <Trophy size={48} className="text-primary-400 relative z-10" />
          </div>
          
          <h2 className="text-4xl font-display font-bold text-white mb-3">Test Complete!</h2>
          <p className="text-slate-400 mb-10 text-lg">You completed the <strong className="text-white">{selectedTopic}</strong> Verbal Ability Test.</p>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="bg-dark-800/50 border border-white/5 rounded-3xl p-8 transition-transform hover:scale-105">
              <p className="text-xs text-primary-400 uppercase font-black tracking-widest mb-2">Accuracy</p>
              <p className="text-5xl font-bold text-white">{score}%</p>
            </div>
            <div className="bg-dark-800/50 border border-white/5 rounded-3xl p-8 transition-transform hover:scale-105">
              <p className="text-xs text-green-400 uppercase font-black tracking-widest mb-2">Correct</p>
              <p className="text-5xl font-bold text-white">{correctCount}</p>
            </div>
          </div>

          <div className="space-y-4 max-w-sm mx-auto">
            <button onClick={() => startTest(selectedTopic)} className="btn-primary w-full py-4 flex items-center justify-center gap-2 rounded-2xl text-lg">
              <RefreshCw size={20} /> Retake Test
            </button>
            <button onClick={() => setStage(0)} className="btn-ghost w-full py-4 rounded-2xl text-lg">
              Practice Other Topics
            </button>
            <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-white transition-colors text-sm font-medium">
              Return to Dashboard
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-card p-8 border-blue-500/20 bg-blue-500/5 flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
            <Zap size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white mb-1">XP & Learning</h4>
            <p className="text-sm text-slate-400">Consistent practice on various topics is the key to mastering verbal ability. You've earned <strong>{reward?.xp} XP</strong> for this session!</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
