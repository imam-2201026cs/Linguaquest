import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Play, Square, Mic, MicOff, Volume2, VolumeX,
  Send, RotateCcw, ChevronRight, Zap, Star, Lock, Trophy,
  AlertTriangle, CheckCircle, XCircle, Clock, BarChart2,
  BookOpen, Target, Lightbulb, ArrowLeft, ArrowRight, User,
  Flame, Award, Users, Briefcase, Globe, GraduationCap, Heart,
  Search, Upload, Check, Crown, Sparkles, MessageSquare, Info
} from 'lucide-react';

import XPReward from '../components/XPReward';
import { useAuth } from '../context/AuthContext';
import WordPopup from '../components/WordPopup';
import AIAvatar from '../components/AIAvatar';

// Assets
import aiAvatarImg from '../assets/ai-avatar.png';
import emmaImg from '../assets/interviewers/emma.png';
import johnImg from '../assets/interviewers/john.png';
import payalImg from '../assets/interviewers/payal.png';
import kapilImg from '../assets/interviewers/kapil.png';

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  'Professional': Briefcase,
  'Travel & Daily Life': Globe,
  'Academic': GraduationCap,
  'Social': Heart,
};

const DIFFICULTY_COLORS = {
  beginner: 'text-accent-emerald border-accent-emerald/20 bg-accent-emerald/10',
  intermediate: 'text-accent-amber border-accent-amber/20 bg-accent-amber/10',
  advanced: 'text-accent-rose border-accent-rose/20 bg-accent-rose/10',
  challenge: 'text-primary-400 border-primary-400/20 bg-primary-400/10',
};

const PROFESSIONAL_ROLES = [
  { id: 'fullstack', title: 'Full Stack Developer', icon: '💻' },
  { id: 'sales', title: 'Sales Executive', icon: '🤝' },
  { id: 'cs', title: 'Customer Service Representative', icon: '🎧' },
  { id: 'account', title: 'Account Manager', icon: '💼' },
  { id: 'pm', title: 'Project Manager', icon: '📋' },
  { id: 'data', title: 'Data Analyst', icon: '📈' },
  { id: 'finance', title: 'Financial Analyst', icon: '💰' },
  { id: 'marketing', title: 'Marketing Manager', icon: '📣' },
  { id: 'software', title: 'Software Engineer', icon: '🛠️' },
  { id: 'ds', title: 'Data Scientist', icon: '🧪' },
  { id: 'web', title: 'Web Designer', icon: '🎨' },
  { id: 'digital', title: 'Digital Marketing Specialist', icon: '📱' },
];

const INTERVIEWERS = [
  { id: 'payal', name: 'Payal', location: 'IN English', img: payalImg },
  { id: 'emma', name: 'Emma', location: 'US English', img: emmaImg },
  { id: 'john', name: 'John', location: 'US English', img: johnImg },
  { id: 'kapil', name: 'Kapil', location: 'IN English', img: kapilImg },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
function ScoreRing({ score, size = 100, label }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
          <motion.circle 
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth="10" fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round" 
            className="shadow-glow"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-black text-white">{score}%</span>
        </div>
      </div>
      {label && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>}
    </div>
  );
}

function LiveAnalysis({ errors, messageCount, scores }) {
  const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 80;
  const stats = [
    { label: 'Grammar', val: avg(scores.grammar) },
    { label: 'Vocabulary', val: avg(scores.vocabulary) },
    { label: 'Fluency', val: avg(scores.formality) },
    { label: 'Logic', val: avg(scores.relevance) },
  ];

  return (
    <div className="glass-card p-6 space-y-6 border-white/5 bg-dark-900/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Analysis</span>
        </div>
        <span className="text-[10px] font-black text-primary-400">{messageCount} EXCH</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {stats.map(({ label, val }) => (
          <div key={label} className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
              <span>{label}</span>
              <span className="text-white">{val}%</span>
            </div>
            <div className="h-1 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div 
                animate={{ width: `${val}%` }}
                className="h-full bg-primary-500 rounded-full" 
              />
            </div>
          </div>
        ))}
      </div>
      {errors.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <p className="text-[9px] font-black text-accent-amber uppercase tracking-widest mb-3">Recent Corrections</p>
          <div className="space-y-2">
            {errors.slice(-2).map((e, i) => (
              <div key={i} className="text-[10px] bg-dark-950/50 border border-white/5 rounded-xl p-3 leading-relaxed">
                <span className="text-slate-500 line-through">"{e.original}"</span>
                <span className="mx-1 text-primary-400">→</span>
                <span className="text-white font-bold">"{e.correction}"</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCard({ report, scenario, duration, xpEarned, coinsEarned, onRestart, onBack }) {
  const formatDuration = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;
  const scoreItems = [
    { label: 'Grammar', val: report.grammarScore, icon: '✏️' },
    { label: 'Vocab', val: report.vocabularyScore, icon: '📚' },
    { label: 'Fluency', val: report.fluencyScore, icon: '🗣️' },
    { label: 'Formal', val: report.formalityScore, icon: '👔' },
    { label: 'Conf', val: report.confidenceScore, icon: '💪' },
    { label: 'Rel', val: report.relevanceScore, icon: '🎯' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8 animate-slide-up">
      <div className="text-center space-y-4">
         <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
            <Trophy size={12} className="fill-primary-400"/> Session Deciphered
         </div>
         <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Performance Summary</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1 space-y-8">
            <div className="glass-card p-8 border-white/5 bg-dark-900/40 text-center flex flex-col items-center">
               <div className="text-5xl mb-6">{scenario?.emoji || scenario?.icon || '🎭'}</div>
               <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{scenario?.title}</h3>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8">{formatDuration(duration)} MISSION</p>
               <ScoreRing score={report.overallScore} size={140} label="Overall Mastery" />
               <div className="mt-8 flex gap-3 w-full">
                  <div className="flex-1 bg-dark-950 border border-white/5 rounded-2xl p-4">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">XP EARNED</p>
                     <p className="text-xl font-black text-primary-400 leading-none">+{xpEarned}</p>
                  </div>
                  <div className="flex-1 bg-dark-950 border border-white/5 rounded-2xl p-4">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">CEFR RANK</p>
                     <p className="text-xl font-black text-white leading-none">{report.cefrLevel}</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 border-white/5 bg-dark-900/40">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <BarChart2 size={18} className="text-primary-400" /> Neural Breakdown
               </h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {scoreItems.map(({ label, val, icon }) => (
                    <div key={label} className="space-y-3">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{icon} {label}</span>
                          <span className="text-xs font-black text-white">{val}%</span>
                       </div>
                       <div className="h-1.5 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${val}%` }}
                             className="h-full bg-primary-500 rounded-full" 
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="glass-card p-8 border-white/5 bg-dark-900/40">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                  <Lightbulb size={18} className="text-accent-amber" /> AI Insights
               </h3>
               <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
                 "Your articulation during the {scenario?.title} simulation was impressive. Focus on refining your use of complex transition phrases and maintaining formal structures in professional contexts."
               </p>
            </div>

            <div className="flex gap-4">
               <button onClick={onBack} className="btn-ghost flex-1 py-4 text-sm font-black uppercase tracking-widest border-white/5">Exit Mission</button>
               <button onClick={onRestart} className="btn-primary flex-1 py-4 text-sm font-black uppercase tracking-widest shadow-glow">Re-Initiate</button>
            </div>
         </div>
      </div>
    </div>
  );
}

function VoiceWaveform() {
  return (
    <div className="flex items-center justify-center gap-1.5 h-12">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            height: [12, 32, 16, 28, 12],
            opacity: [0.3, 1, 0.5, 1, 0.3]
          }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity, 
            delay: i * 0.08,
            ease: "easeInOut"
          }}
          className="w-1.5 bg-primary-400 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
        />
      ))}
    </div>
  );
}

// ─── Main Chat Interface ─────────────────────────────────────────────────────
function ChatInterface({ conversationId, scenario, difficulty, mode, openingMessage, onEnd }) {
  const [messages, setMessages] = useState(
    openingMessage ? [{ role: 'assistant', content: openingMessage, errors: [] }] : []
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ending, setEnding] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [allErrors, setAllErrors] = useState([]);
  const [scores, setScores] = useState({ grammar: [], vocabulary: [], formality: [], relevance: [] });
  const [messageCount, setMessageCount] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [popupWord, setPopupWord] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = useCallback((text) => {
    if (!ttsEnabled) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    utt.rate = difficulty === 'beginner' ? 0.85 : difficulty === 'advanced' ? 1.1 : 0.95;
    
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);

    speechSynthesis.speak(utt);
  }, [ttsEnabled, difficulty]);

  useEffect(() => {
    if (openingMessage && ttsEnabled) {
      setTimeout(() => speak(openingMessage), 500);
    }
  }, [openingMessage]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.continuous = true; 
      r.interimResults = true; 
      r.lang = 'en-US';

      r.onresult = (e) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        setInput(transcript);
        
        // Auto-submit logic: if user stops speaking for 1.5s
        if (recognitionRef.current.timer) clearTimeout(recognitionRef.current.timer);
        recognitionRef.current.timer = setTimeout(() => {
          if (transcript.trim()) {
            r.stop();
            sendMessage(transcript.trim());
          }
        }, 1500);
      };

      r.onstart = () => setListening(true);
      r.onend = () => {
        setListening(false);
        if (recognitionRef.current.timer) clearTimeout(recognitionRef.current.timer);
      };
      r.onerror = () => setListening(false);
      recognitionRef.current = r;
    }
    return () => {
      recognitionRef.current?.abort();
      if (recognitionRef.current?.timer) clearTimeout(recognitionRef.current.timer);
    };
  }, []);

  const handleWordClick = (e) => {
    if (e.detail === 2) {
      const word = window.getSelection()?.toString().trim().replace(/[^a-zA-Z]/g, '');
      if (word && word.length > 2) setPopupWord(word.toLowerCase());
    }
  };

  const sendMessage = async (overrideInput) => {
    const userMsg = (overrideInput || input).trim();
    if (!userMsg || loading) return;
    
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: userMsg, errors: [] }]);

    try {
      const { data } = await axios.post('/api/conversation/message', { conversationId, message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, errors: [] }]);
      setAllErrors(prev => [...prev, ...(data.errors || [])]);
      setMessageCount(data.messageCount);
      if (data.analysis) {
        setScores(prev => ({
          grammar: [...prev.grammar, data.analysis.grammarScore].slice(-10),
          vocabulary: [...prev.vocabulary, data.analysis.vocabularyScore].slice(-10),
          fluency: [...prev.fluency || [], data.analysis.fluencyScore].slice(-10),
          formality: [...prev.formality, data.analysis.formalityScore].slice(-10),
          relevance: [...prev.relevance, data.analysis.relevanceScore].slice(-10),
        }));
      }
      if (ttsEnabled) speak(data.reply);
    } catch (err) {
      toast.error('Failed to send message');
      setMessages(prev => prev.slice(0, -1));
      setInput(userMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (messageCount < 2) return toast.error('Have at least 2 exchanges first!');
    setEnding(true);
    try {
      const { data } = await axios.post('/api/conversation/end', { conversationId, duration: elapsed });
      onEnd({ ...data, duration: elapsed });
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setEnding(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[600px] lg:h-[calc(100vh-180px)]" onClick={handleWordClick}>
      {popupWord && <WordPopup word={popupWord} onClose={() => setPopupWord(null)} source="conversation" />}
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-card border-white/5 bg-dark-900/40 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-dark-950/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/5 shadow-inner">
               {scenario.emoji || scenario.icon}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight leading-tight">{scenario.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                 <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${DIFFICULTY_COLORS[difficulty]}`}>{difficulty}</span>
                 <div className="w-1 h-1 rounded-full bg-slate-700" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{formatTime(elapsed)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTtsEnabled(!ttsEnabled)} 
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${ttsEnabled ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-950 text-slate-500'}`}
            >
              {ttsEnabled ? <Volume2 size={18}/> : <VolumeX size={18}/>}
            </button>
            <button 
               onClick={() => setShowEndConfirm(true)} 
               className="btn-primary bg-accent-rose hover:bg-accent-rose/80 text-white border-none py-2 px-5 text-xs font-black uppercase tracking-widest shadow-glow"
            >
              End Mission
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth">
          {messages.map((msg, i) => (
            <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-4`}
            >
              {msg.role === 'assistant' && (
                 <div className="w-10 h-10 rounded-2xl bg-primary-500 flex items-center justify-center shrink-0 shadow-glow">
                    <Sparkles size={20} className="text-white" />
                 </div>
              )}
              <div className={`max-w-[75%] space-y-2`}>
                 <div className={`px-6 py-4 rounded-2xl text-sm leading-relaxed font-medium shadow-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-dark-800/80 border border-white/5 text-slate-200 rounded-tl-sm'}`}>
                    {msg.content}
                 </div>
                 <p className={`text-[10px] font-black uppercase tracking-widest text-slate-600 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.role === 'user' ? 'You' : (scenario.role?.split(' at ')[0] || 'AI Intelligence')}
                 </p>
              </div>
              {msg.role === 'user' && (
                 <div className="w-10 h-10 rounded-2xl bg-dark-800 border border-white/10 flex items-center justify-center shrink-0">
                    <User size={20} className="text-slate-400" />
                 </div>
              )}
            </motion.div>
          ))}
          {loading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/20 animate-pulse shrink-0"/>
                <div className="bg-dark-800/40 w-32 h-12 rounded-2xl animate-pulse"/>
             </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/5 bg-dark-950/20">
          <div className="flex gap-4 bg-dark-800/80 p-2 rounded-[24px] border border-white/5 shadow-inner group focus-within:border-primary-500/30 transition-all">
            <button 
              onClick={() => recognitionRef.current?.start()} 
              className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all ${listening ? 'bg-accent-rose text-white animate-pulse shadow-glow' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
              {listening ? <MicOff size={20}/> : <Mic size={20}/>}
            </button>
            {listening ? (
              <div className="flex-1 px-4">
                <VoiceWaveform />
              </div>
            ) : (
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Transmit your message..."
                className="bg-transparent border-none focus:ring-0 flex-1 resize-none py-3 text-sm font-medium text-white placeholder-slate-600"
                rows={1}
              />
            )}
            <button 
               onClick={sendMessage} 
               disabled={!input.trim() || loading} 
               className="w-12 h-12 rounded-[18px] bg-primary-500 text-white flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all shadow-glow hover:scale-105"
            >
              <Send size={18}/>
            </button>
          </div>
          <div className="flex items-center gap-4 mt-3 px-2">
             <div className="flex items-center gap-1.5">
                <Info size={10} className="text-slate-600" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Double click words for translation</span>
             </div>
          </div>
        </div>
      </div>

      {/* Analytics Sidebar */}
      <div className="hidden lg:flex w-80 shrink-0 flex-col gap-6">
        <div className="glass-card pt-12 pb-8 px-6 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-dark-900 to-dark-950 border-white/5">
          <AIAvatar isThinking={loading} isSpeaking={speaking} avatarUrl={aiAvatarImg} />
          <div className="text-center">
            <h4 className="text-base font-bold text-white tracking-tight">{scenario.role?.split(' at ')[0] || 'AI Interviewer'}</h4>
            <p className="text-[10px] text-primary-400 font-black uppercase tracking-[0.2em] mt-1.5 animate-pulse">Connection Stable</p>
          </div>
        </div>

        <div className="glass-card p-6 border-white/5 bg-dark-900/40">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Target size={12} className="text-primary-400"/> Operational Goals
          </h4>
          <ul className="space-y-3">
            {(scenario.goals || ['Maintain professional clarity', 'Structure answers logically', 'Expand on key details']).map((g, i) => (
              <li key={i} className="text-[11px] font-bold text-slate-300 flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500/50 mt-1" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>

        <LiveAnalysis errors={allErrors} messageCount={messageCount} scores={scores} />
      </div>

      {/* End Confirmation Modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-950/80 backdrop-blur-xl">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="glass-card p-10 max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-accent-rose/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <AlertTriangle size={32} className="text-accent-rose" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3 tracking-tight">Terminate Mission?</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">Are you ready to finalize your progress and receive your performance analytics?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowEndConfirm(false)} className="btn-ghost flex-1 py-3 text-xs font-black uppercase tracking-widest">Continue</button>
                <button onClick={handleEnd} className="btn-primary flex-1 py-3 bg-accent-rose border-none text-xs font-black uppercase tracking-widest shadow-glow">Terminate</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── EveryDay View ──────────────────────────────────────────────────────
function EveryDayView({ onSelect }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Professional', 'Travel & Daily Life', 'Social'];

  useEffect(() => {
    axios.get('/api/conversation/scenarios').then(r => setScenarios(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
     <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"/>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Scenarios</p>
     </div>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map(c => (
          <button 
            key={c} 
            onClick={() => setFilter(c)} 
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filter === c ? 'bg-primary-500 border-primary-500 text-white shadow-glow' : 'bg-dark-900/50 border-white/5 text-slate-500 hover:text-white'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {scenarios.filter(s => filter === 'All' || s.category === filter).map(s => (
          <motion.div 
            key={s.id} 
            whileHover={{ y: -5 }}
            onClick={() => s.unlocked ? onSelect(s) : toast.error('Level too low!')} 
            className={`glass-card p-8 cursor-pointer border-white/5 bg-dark-900/40 relative overflow-hidden group transition-all duration-500 ${!s.unlocked ? 'opacity-40 grayscale' : 'hover:bg-white/5'}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
               <div className="w-16 h-16 bg-dark-950 rounded-2xl flex items-center justify-center text-4xl mb-6 border border-white/5 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  {s.emoji}
               </div>
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest">{s.category}</p>
                     {!s.unlocked && <Lock size={12} className="text-slate-600" />}
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-primary-400 transition-colors">{s.title}</h3>
                  <div className="pt-6 flex items-center gap-1.5 text-slate-500 font-bold group-hover:gap-2 transition-all">
                     <span className="text-[10px] uppercase tracking-widest">Initialize Mission</span>
                     <ArrowRight size={14} />
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Career Success View (Professional) ──────────────────────────────────────
function CareerSuccessView({ onSelect }) {
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('Role Based');

  const filtered = PROFESSIONAL_ROLES.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-12 animate-slide-up pb-20">
      <div className="text-center max-w-3xl mx-auto space-y-6 pt-10">
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em]"
        >
           <Zap size={12} className="fill-accent-amber"/> Neural Engine Active
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight">AI Professional <span className="shimmer-text">Simulations</span></h1>
        <p className="text-slate-400 text-lg font-medium leading-relaxed">
          The most advanced AI-powered role-specific interview environment. Practice domain articulation, body language and logic with real-time neural feedback.
        </p>
      </div>

      <div className="max-w-2xl mx-auto relative group px-4">
        <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
          <Search size={22}/>
        </div>
        <input 
          type="text" 
          placeholder="Search professional designation..."
          className="input-field py-6 pl-16 pr-36 bg-dark-900/60 shadow-2xl border-white/10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="absolute right-6 inset-y-2 px-8 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-[18px] text-[10px] uppercase tracking-widest shadow-glow transition-all">Search</button>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
              <Briefcase size={24} className="text-primary-400"/> Operational Designations
           </h3>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filtered.length} ROLES</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(role => (
            <motion.div 
               key={role.id} 
               whileHover={{ scale: 1.05 }}
               onClick={() => onSelect(role)}
               className="glass-card p-10 text-center cursor-pointer border-white/5 bg-dark-900/40 relative overflow-hidden group transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                 <div className="text-5xl mb-6 group-hover:rotate-6 transition-transform duration-500">{role.icon}</div>
                 <h4 className="font-bold text-white tracking-tight text-lg group-hover:text-primary-400 transition-colors">{role.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfessionalSetupModal({ role, onStart, onClose }) {
  const [round, setRound] = useState('warmup');
  const [duration, setDuration] = useState('5');
  const [interviewer, setInterviewer] = useState(INTERVIEWERS[3]);
  const [loading, setLoading] = useState(false);

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const fileInputRef = useRef(null);

  const rounds = [
    { id: 'warmup', title: 'Warm Up', sub: 'BEHAVIORAL', icon: '☕' },
    { id: 'technical', title: 'Technical', sub: 'LOGIC', icon: '⚙️' },
    { id: 'coding', title: 'Coding', sub: 'PRACTICAL', icon: '💻' },
    { id: 'behavioral', title: 'HR Round', sub: 'CULTURAL', icon: '🤝' },
  ];

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    setResumeLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await axios.post('/api/conversation/resume/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeData(data.data);
      toast.success('Neural mapping successful. Content parsed.');
    } catch (err) {
      toast.error('Mapping failed. Using standard protocols.');
      setResumeFile(null);
    } finally {
      setResumeLoading(false);
    }
  };

  const handleStart = async () => {
    if (!resumeData) return toast.error('Identity scan (Resume) required for personalization.');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/conversation/professional/start', {
        role: role.title, round, duration, interviewerId: interviewer.id,
        resumeData: resumeData || null, difficulty: 'intermediate'
      });
      onStart(
        { ...role, isProfessional: true, round, interviewerId: interviewer.id,
          goals: [`Excel in ${round} simulation for ${role.title}`, 'Articulate career milestones clearly', 'Demonstrate role proficiency'] },
        'intermediate', 'free', data.conversationId, data.openingMessage
      );
    } catch (err) {
      toast.error('Mission initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-950/90 backdrop-blur-xl">
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="glass-card p-1 max-w-3xl w-full relative overflow-hidden"
      >
        <div className="p-10 bg-dark-900 flex flex-col max-h-[85vh] overflow-y-auto no-scrollbar">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Mission Configuration</h2>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                <XCircle size={20}/>
              </button>
           </div>

           <div className="space-y-8">
              <div className="bg-dark-950 border border-white/5 rounded-2xl p-6 flex items-center gap-5">
                <div className="text-4xl">{role.icon}</div>
                <div>
                   <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-0.5">TARGET ROLE</p>
                   <h4 className="text-xl font-bold text-white tracking-tight">{role.title}</h4>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-sm font-bold text-white">Identity Scan (Resume) <span className="text-accent-rose">*</span></p>
                       <p className="text-xs text-slate-500 mt-1">Upload your resume to calibrate the AI persona.</p>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="btn-primary py-2.5 px-6 text-[10px] font-black uppercase tracking-widest shadow-glow">
                       {resumeLoading ? 'SCANNING...' : resumeFile ? 'RE-UPLOAD' : 'UPLOAD PDF'}
                    </button>
                    <input ref={fileInputRef} type="file" onChange={handleResumeUpload} className="hidden"/>
                 </div>
                 {resumeFile && (
                    <div className="p-4 rounded-xl bg-accent-emerald/5 border border-accent-emerald/20 flex items-center gap-3">
                       <Check size={14} className="text-accent-emerald" />
                       <span className="text-[10px] font-black text-accent-emerald uppercase tracking-widest">{resumeFile.name} Mapped ✓</span>
                    </div>
                 )}
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Simulation Type</p>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {rounds.map(r => (
                      <button key={r.id} onClick={() => setRound(r.id)}
                        className={`p-4 rounded-2xl border text-center transition-all duration-300 ${round === r.id ? 'bg-primary-500/10 border-primary-500 ring-2 ring-primary-500/20' : 'bg-dark-950 border-white/5 hover:border-white/10'}`}>
                        <div className="text-2xl mb-2">{r.icon}</div>
                        <p className="text-[10px] font-black text-white uppercase tracking-tight">{r.title}</p>
                        <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">{r.sub}</p>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Neural Persona</p>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {INTERVIEWERS.map(i => (
                      <button key={i.id} onClick={() => setInterviewer(i)}
                        className={`p-2 rounded-2xl border transition-all duration-300 ${interviewer.id === i.id ? 'border-primary-500 bg-primary-500/10' : 'border-white/5 hover:border-white/10 opacity-40 hover:opacity-100'}`}>
                        <img src={i.img} className="w-full aspect-square object-cover object-top rounded-xl mb-2 grayscale group-hover:grayscale-0 transition-all" alt={i.name}/>
                        <p className="text-[10px] font-black text-white tracking-tight">{i.name}</p>
                        <p className="text-[8px] text-slate-600 font-bold uppercase">{i.location}</p>
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5">
              <button onClick={onClose} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Abort</button>
              <button 
                 onClick={handleStart} 
                 disabled={loading}
                 className="btn-primary py-4 px-10 text-xs font-black uppercase tracking-[0.2em] shadow-glow"
              >
                 {loading ? 'Initializing...' : 'Initiate Simulation'}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Exported Component ──────────────────────────────────────────────────────
export default function Conversation() {
  const [activeTab, setActiveTab] = useState('everyday');
  const [view, setView] = useState('home');
  const [setupScenario, setSetupScenario] = useState(null);
  
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [openingMessage, setOpeningMessage] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [mode, setMode] = useState('free');
  const [reportData, setReportData] = useState(null);
  const [reward, setReward] = useState(null);
  
  const { fetchProfile } = useAuth();

  const handleStartSession = async (scenario, diff, m, preCreatedConvId, preCreatedOpening) => {
    if (preCreatedConvId) {
      setConversationId(preCreatedConvId);
      setOpeningMessage(preCreatedOpening);
      setDifficulty(diff);
      setMode(m);
      setSelectedScenario(scenario);
      setSetupScenario(null);
      setView('chat');
      return;
    }

    try {
      const payload = { 
        scenarioId: scenario.id || scenario.title.toLowerCase().replace(/\s/g, '-'), 
        difficulty: diff, 
        mode: m,
      };
      const { data } = await axios.post('/api/conversation/start', payload);
      setConversationId(data.conversationId);
      setOpeningMessage(data.openingMessage);
      setDifficulty(diff);
      setMode(m);
      setSelectedScenario(scenario);
      setSetupScenario(null);
      setView('chat');
    } catch (err) {
      toast.error('Mission initiation failed.');
    }
  };

  const handleEnd = async (data) => {
    setReportData(data);
    setReward({ xp: data.xpEarned, coins: data.coinsEarned });
    setView('report');
    fetchProfile();
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {reward && view === 'report' && <XPReward {...reward} onClose={() => setReward(null)} />}
      
      {view === 'home' && (
        <>
          <div className="flex justify-center mb-12">
            <div className="bg-dark-900/50 p-1.5 rounded-[22px] flex gap-1.5 border border-white/5 shadow-2xl backdrop-blur-xl">
              <button 
                onClick={() => setActiveTab('everyday')}
                className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 ${activeTab === 'everyday' ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200'}`}
              >
                <Globe size={14}/> Operational Missions
              </button>
              <button 
                onClick={() => setActiveTab('professional')}
                className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 ${activeTab === 'professional' ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-500 hover:text-slate-200'}`}
              >
                <Briefcase size={14}/> Career Simulations
              </button>
            </div>
          </div>

          {activeTab === 'everyday' ? (
            <EveryDayView onSelect={setSetupScenario} />
          ) : (
            <CareerSuccessView onSelect={setSetupScenario} />
          )}
        </>
      )}

      {setupScenario && (
        activeTab === 'everyday' ? (
          <ScenarioSetupModal scenario={setupScenario} onStart={handleStartSession} onClose={() => setSetupScenario(null)} />
        ) : (
          <ProfessionalSetupModal role={setupScenario} onStart={handleStartSession} onClose={() => setSetupScenario(null)} />
        )
      )}

      {view === 'chat' && conversationId && (
        <ChatInterface 
          conversationId={conversationId} 
          scenario={selectedScenario} 
          difficulty={difficulty} 
          mode={mode} 
          openingMessage={openingMessage} 
          onEnd={handleEnd} 
        />
      )}

      {view === 'report' && reportData && (
        <ReportCard 
          report={reportData.reportCard} 
          scenario={selectedScenario} 
          duration={reportData.duration} 
          xpEarned={reportData.xpEarned} 
          coinsEarned={reportData.coinsEarned} 
          onRestart={() => setView('home')} 
          onBack={() => setView('home')} 
        />
      )}
    </div>
  );
}

// ScenarioSetupModal for EveryDay View
function ScenarioSetupModal({ scenario, onStart, onClose }) {
  const [difficulty, setDifficulty] = useState('intermediate');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-950/90 backdrop-blur-xl">
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="glass-card p-10 max-w-lg w-full relative overflow-hidden"
      >
        <div className="flex items-center gap-5 mb-10">
          <div className="w-20 h-20 bg-dark-950 border border-white/5 rounded-[24px] flex items-center justify-center text-4xl shadow-inner group-hover:rotate-6 transition-transform">
             {scenario.emoji}
          </div>
          <div>
            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">{scenario.category}</p>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">{scenario.title}</h2>
          </div>
        </div>

        <div className="space-y-6 mb-10">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Simulation Difficulty</p>
           <div className="grid grid-cols-3 gap-3">
             {['beginner', 'intermediate', 'advanced'].map(d => (
               <button 
                  key={d} 
                  onClick={() => setDifficulty(d)} 
                  className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${difficulty === d ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'border-white/5 text-slate-500 hover:border-white/10'}`}
               >
                  {d}
               </button>
             ))}
           </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="btn-ghost flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-white/5">Abort</button>
          <button onClick={() => onStart(scenario, difficulty, 'free')} className="btn-primary flex-1 py-4 text-[10px] font-black uppercase tracking-widest shadow-glow">Initiate Mission</button>
        </div>
      </motion.div>
    </div>
  );
}
