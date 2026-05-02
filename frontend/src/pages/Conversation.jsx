import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  MessageCircle, Play, Square, Mic, MicOff, Volume2, VolumeX,
  Send, RotateCcw, ChevronRight, Zap, Star, Lock, Trophy,
  AlertTriangle, CheckCircle, XCircle, Clock, BarChart2,
  BookOpen, Target, Lightbulb, ArrowLeft,
  Flame, Award, Users, Briefcase, Globe, GraduationCap, Heart,
  Search, Upload, Check, Crown
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
  beginner: 'text-green-400 border-green-500/30 bg-green-500/10',
  intermediate: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  advanced: 'text-red-400 border-red-500/30 bg-red-500/10',
  challenge: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
};

const MODE_INFO = {
  free: { label: 'Free Mode', desc: 'No hints, full immersion', icon: '🎯' },
  guided: { label: 'Guided Mode', desc: 'AI gives hints when needed', icon: '💡' },
  correction: { label: 'Correction Mode', desc: 'AI corrects every mistake inline', icon: '✏️' },
  silent: { label: 'Silent Mode', desc: 'Mistakes tracked silently', icon: '🔇' },
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
function ScoreRing({ score, size = 80, label }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#fbbf24' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="#1e2d4a" strokeWidth="8" fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="text-center -mt-14 mb-6">
        <div className="text-xl font-bold" style={{ color }}>{score}%</div>
      </div>
      {label && <p className="text-xs text-slate-400 text-center">{label}</p>}
    </div>
  );
}

function LiveAnalysis({ errors, messageCount, scores }) {
  const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 80;
  const stats = [
    { label: 'Grammar', val: avg(scores.grammar) },
    { label: 'Vocabulary', val: avg(scores.vocabulary) },
    { label: 'Formality', val: avg(scores.formality) },
    { label: 'Relevance', val: avg(scores.relevance) },
  ];

  const getColor = (v) => v >= 80 ? 'text-green-400' : v >= 60 ? 'text-yellow-400' : 'text-red-400';
  const getBar = (v) => v >= 80 ? 'bg-green-500' : v >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Analysis</span>
      </div>
      <div className="space-y-2">
        {stats.map(({ label, val }) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{label}</span>
              <span className={getColor(val)}>{val}%</span>
            </div>
            <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
              <div className={`h-full ${getBar(val)} rounded-full transition-all duration-500`} style={{ width: `${val}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 pt-3">
        <p className="text-xs text-slate-500">Messages sent: {messageCount}</p>
        {errors.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] text-amber-400 uppercase tracking-tighter mb-1">Recent Flags</p>
            <div className="space-y-1">
              {errors.slice(-2).map((e, i) => (
                <div key={i} className="text-[10px] bg-red-500/5 border border-red-500/10 rounded-lg p-2 text-slate-300">
                  <span className="line-through text-red-400/70">"{e.original}"</span> → <span className="text-green-400">"{e.correction}"</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ report, scenario, duration, xpEarned, coinsEarned, onRestart, onBack }) {
  const formatDuration = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;
  const scoreItems = [
    { label: 'Grammar', val: report.grammarScore, icon: '✏️' },
    { label: 'Vocabulary', val: report.vocabularyScore, icon: '📚' },
    { label: 'Fluency', val: report.fluencyScore, icon: '🗣️' },
    { label: 'Formality', val: report.formalityScore, icon: '👔' },
    { label: 'Confidence', val: report.confidenceScore, icon: '💪' },
    { label: 'Relevance', val: report.relevanceScore, icon: '🎯' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-slide-up pb-20">
      <div className="glass-card p-6 text-center bg-gradient-to-br from-primary-500/10 to-accent-purple/10 border-primary-500/20">
        <div className="text-4xl mb-2">{scenario?.emoji || scenario?.icon || '🎭'}</div>
        <h2 className="text-2xl font-display font-bold text-white mb-1">{scenario?.title}</h2>
        <p className="text-slate-400 text-sm mb-4">{scenario?.category || 'Professional Mock Interview'} • {formatDuration(duration)}</p>
        <div className="flex justify-center mb-4"><ScoreRing score={report.overallScore} size={100} /></div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-xl px-5 py-2.5">
            <div className="flex items-center gap-1 text-accent-yellow font-bold text-xl"><Zap size={14}/>+{xpEarned}</div>
            <span className="text-xs text-slate-400">XP</span>
          </div>
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl px-5 py-2.5">
            <div className="text-xl font-bold text-primary-400">{report.cefrLevel}</div>
            <span className="text-xs text-slate-400">Level</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><BarChart2 size={18} /> Breakdown</h3>
        <div className="grid grid-cols-2 gap-3">
          {scoreItems.map(({ label, val, icon }) => (
            <div key={label} className="bg-dark-600/50 rounded-xl p-3">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">{icon} {label}</span>
                <span className="font-bold text-white">{val}%</span>
              </div>
              <div className="h-1.5 bg-dark-500 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500" style={{ width: `${val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-ghost flex-1">Back to Home</button>
        <button onClick={onRestart} className="btn-primary flex-1">Try Again</button>
      </div>
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
      r.continuous = false; r.interimResults = false; r.lang = 'en-US';
      r.onresult = (e) => { setInput(p => p + e.results[0][0].transcript + ' '); setListening(false); };
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      recognitionRef.current = r;
    }
    return () => recognitionRef.current?.abort();
  }, []);

  const handleWordClick = (e) => {
    if (e.detail === 2) {
      const word = window.getSelection()?.toString().trim().replace(/[^a-zA-Z]/g, '');
      if (word && word.length > 2) setPopupWord(word.toLowerCase());
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
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
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)] lg:h-[calc(100vh-140px)] max-h-[850px]" onClick={handleWordClick}>
      {popupWord && <WordPopup word={popupWord} onClose={() => setPopupWord(null)} source="conversation" />}
      
      <div className="flex-1 flex flex-col glass-card overflow-hidden min-h-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{scenario.emoji || scenario.icon}</div>
            <div>
              <h3 className="font-bold text-white text-sm">{scenario.title}</h3>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${DIFFICULTY_COLORS[difficulty]}`}>{difficulty}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex text-sm font-mono text-slate-300 bg-dark-600 px-3 py-1 rounded-lg items-center gap-2">
              <Clock size={12}/> {formatTime(elapsed)}
            </div>
            <button onClick={() => setTtsEnabled(p => !p)} className={`p-2 rounded-lg ${ttsEnabled ? 'text-primary-400 bg-primary-500/10' : 'text-slate-500'}`}>
              {ttsEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
            </button>
            <button onClick={() => setShowEndConfirm(true)} className="btn-primary py-1.5 px-3 text-[10px] sm:text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border-none">
              End
            </button>
          </div>
        </div>

        {/* Roles bar */}
        <div className="px-4 py-2 bg-dark-600/40 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-3">
          <span>You: <span className="text-white">{scenario.userRole || 'Job Candidate'}</span></span>
          <span className="text-slate-700">•</span>
          <span>AI: <span className="text-primary-400">{scenario.role?.split(' at ')[0] || 'Interviewer'}</span></span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-xs shrink-0 mt-1">🎭</div>}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-dark-600/80 border border-white/5 text-slate-200 rounded-tl-sm'}`}>
                {msg.content}
              </div>
              {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs shrink-0 mt-1">👤</div>}
            </div>
          ))}
          {loading && <div className="flex justify-start gap-2"><div className="w-8 h-8 rounded-full bg-primary-500/20 animate-pulse"/><div className="bg-dark-600/40 w-24 h-10 rounded-2xl animate-pulse"/></div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <button onClick={() => recognitionRef.current?.start()} className={`p-3 rounded-xl ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-slate-400'}`}>
              <Mic size={20}/>
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Type your message..."
              className="input-field flex-1 resize-none py-3"
              rows={1}
            />
            <button onClick={sendMessage} disabled={!input.trim()} className="btn-primary px-5 disabled:opacity-50">
              <Send size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel - Hidden on mobile, shown on large screens */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col gap-3 overflow-y-auto custom-scrollbar">
        <div className="glass-card pt-12 pb-4 px-4 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-dark-800 to-dark-900 border-primary-500/10">
          <AIAvatar isThinking={loading} isSpeaking={speaking} avatarUrl={aiAvatarImg} />
          <div className="text-center">
            <h4 className="text-sm font-bold text-white">{scenario.role?.split(' at ')[0] || 'AI Interviewer'}</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Neural Link Established</p>
          </div>
        </div>

        <div className="glass-card p-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Target size={12}/> Session Goals</h4>
          <ul className="space-y-1.5">
            {(scenario.goals || ['Communicate clearly', 'Maintain professional tone']).map((g, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5"><span className="text-primary-400">•</span>{g}</li>
            ))}
          </ul>
        </div>

        <LiveAnalysis errors={allErrors} messageCount={messageCount} scores={scores} />
      </div>

      {showEndConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-2">End Conversation?</h3>
            <p className="text-slate-400 text-sm mb-6">Ready to see your performance report and earn rewards?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="btn-ghost flex-1">Keep Going</button>
              <button onClick={handleEnd} className="btn-primary flex-1 bg-red-600 border-none">End & Analyze</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfessionalSetupModal({ role, onStart, onClose }) {
  const [round, setRound] = useState('warmup');
  const [duration, setDuration] = useState('5');
  const [interviewer, setInterviewer] = useState(INTERVIEWERS[3]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Resume state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const fileInputRef = useRef(null);

  const rounds = [
    { id: 'warmup', title: 'Warm Up', sub: 'NON TECHNICAL', icon: '☕' },
    { id: 'coding', title: 'Coding', sub: 'PROGRAMMING', icon: '💻' },
    { id: 'technical', title: 'Role Related', sub: 'TECHNICAL', icon: '⚙️' },
    { id: 'behavioral', title: 'Behavioral', sub: 'HR', icon: '🤝' },
  ];

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) return toast.error('Please upload a PDF, DOC, DOCX, or TXT file.');
    if (file.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB.');

    setResumeFile(file);
    setResumeLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await axios.post('/api/conversation/resume/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeData(data.data);
      toast.success('✅ Resume parsed! Your interview will be personalized.');
    } catch (err) {
      toast.error('Could not parse resume — using default questions.');
      setResumeFile(null);
    } finally {
      setResumeLoading(false);
    }
  };

  const handleStart = async () => {
    if (!resumeData) {
      toast.error('Please upload your resume first. The interview is personalized for you.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/conversation/professional/start', {
        role: role.title,
        round,
        duration,
        interviewerId: interviewer.id,
        resumeData: resumeData || null,
        difficulty: 'intermediate'
      });
      onStart(
        { ...role, isProfessional: true, round, interviewerId: interviewer.id,
          goals: [`Complete a ${round} interview for ${role.title}`, 'Communicate clearly and professionally', 'Answer all questions confidently'] },
        'intermediate',
        'free',
        data.conversationId,
        data.openingMessage
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full animate-bounce-in shadow-2xl relative max-h-[95vh] flex flex-col">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 z-10">
          <XCircle size={24}/>
        </button>
        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4 shrink-0">Interview Details</h2>

        <div className="space-y-6 overflow-y-auto no-scrollbar pr-1 flex-1">
          {/* Role */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
            <div className="text-2xl">{role.icon}</div>
            <div className="font-bold text-slate-800">{role.title}</div>
          </div>

          {/* Resume Upload */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-700">Resume Based Interview <span className="text-red-500">*</span></p>
              <p className="text-xs text-slate-400 mt-0.5">Please upload your resume to personalize the interview questions.</p>
              {resumeFile && (
                <p className={`text-xs mt-2 flex items-center gap-1.5 ${resumeData ? 'text-green-600' : 'text-amber-600'}`}>
                  {resumeLoading ? <><div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/> Parsing...</> : resumeData ? <><Check size={12}/>{resumeFile.name} — Personalized ✓</> : resumeFile.name}
                </p>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleResumeUpload} className="hidden"/>
            <button onClick={() => fileInputRef.current?.click()} disabled={resumeLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 disabled:opacity-60">
              {resumeLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Upload size={14}/>}
              {resumeFile ? 'Change File' : 'Upload Resume'}
            </button>
          </div>

          {/* Rounds */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Select Round <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {rounds.map(r => (
                <button key={r.id} onClick={() => setRound(r.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${round === r.id ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-500/20' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                  <div className="text-xl mb-1">{r.icon}</div>
                  <div className="text-[10px] font-bold text-slate-800">{r.title}</div>
                  <div className="text-[8px] text-slate-400 uppercase">{r.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Interview Duration <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {['5', '15', '30'].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`px-6 py-2.5 rounded-xl border text-xs font-bold transition-all ${duration === d ? 'bg-primary-100 border-primary-500 text-primary-700' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'}`}>
                  {d} mins
                </button>
              ))}
            </div>
          </div>

          {/* Interviewer */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Select Your Interviewer <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INTERVIEWERS.map(i => (
                <button key={i.id} onClick={() => setInterviewer(i)}
                  className={`p-2 rounded-2xl border transition-all ${interviewer.id === i.id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-slate-100 hover:border-slate-200'}`}>
                  <img src={i.img} className="w-full aspect-square object-cover object-top rounded-xl mb-1.5" alt={i.name}/>
                  <div className="text-[10px] font-bold text-slate-800">{i.name}</div>
                  <div className="text-[8px] text-slate-400">{i.location}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Practice Settings</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={audioEnabled} onChange={e => setAudioEnabled(e.target.checked)} className="w-4 h-4 accent-primary-600"/>
              <span className="text-sm text-slate-600">Enable AI Voice Responses (TTS)</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t shrink-0">
          <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">CANCEL</button>
          <button onClick={handleStart} disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary-500/20 transition-all hover:scale-105 disabled:opacity-60 flex items-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
            {loading ? 'Starting Interview...' : 'START PRACTICE'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EveryDay View (Map) ──────────────────────────────────────────────────────
function EveryDayView({ onSelect }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Professional', 'Travel & Daily Life', 'Social'];

  useEffect(() => {
    axios.get('/api/conversation/scenarios').then(r => setScenarios(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"/></div>;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border ${filter === c ? 'bg-primary-500 border-primary-500 text-white' : 'bg-dark-800 border-white/5 text-slate-500 hover:text-white'}`}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scenarios.filter(s => filter === 'All' || s.category === filter).map(s => (
          <div key={s.id} onClick={() => s.unlocked ? onSelect(s) : toast.error('Level too low!')} className={`glass-card p-5 cursor-pointer hover:scale-[1.02] transition-all group ${!s.unlocked && 'opacity-50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-dark-600 rounded-xl flex items-center justify-center text-2xl">{s.emoji}</div>
              {!s.unlocked && <Lock size={14} className="text-slate-500" />}
            </div>
            <h3 className="font-bold text-white text-sm mb-1 group-hover:text-primary-400">{s.title}</h3>
            <p className="text-[10px] text-slate-500 mb-4">{s.category}</p>
            <button className="w-full btn-primary py-2 text-xs">Start Roleplay</button>
          </div>
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
    <div className="space-y-8 animate-slide-up pb-20">
      <div className="text-center max-w-2xl mx-auto space-y-4 py-6">
        <div className="inline-flex items-center gap-2 bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
           <Zap size={10} className="fill-accent-yellow"/> 3000+ Roles Available
        </div>
        <h1 className="text-4xl font-display font-bold text-white">Role-Specific <span className="text-primary-400">AI Mock Interviews</span></h1>
        <p className="text-slate-400 text-sm">Practice role-specific interviews with real-world questions. Improve domain knowledge, articulation and communication with instant feedback report.</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 flex-wrap">
        {['Role Based', 'Company Based', 'JD Based', 'Resume Toolkit', 'Create Your Own'].map(tab => (
          <button key={tab} onClick={() => setSelectedTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${selectedTab === tab ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-dark-800 border-white/5 text-slate-500 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
          <Search size={20}/>
        </div>
        <input 
          type="text" 
          placeholder="Search for roles (e.g. Software Engineer, Data Analyst)"
          className="w-full bg-dark-800/80 border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-2xl"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="absolute right-2 inset-y-2 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all">SEARCH</button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 ml-1"><Briefcase size={20} className="text-primary-400"/> Roles</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(role => (
            <div key={role.id} onClick={() => onSelect(role)}
              className="bg-white hover:bg-slate-50 rounded-2xl p-6 text-center cursor-pointer transition-all hover:scale-105 shadow-xl group border-2 border-transparent hover:border-primary-500/20">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{role.icon}</div>
              <h4 className="font-bold text-slate-800 text-sm">{role.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Exported Component ──────────────────────────────────────────────────────
export default function Conversation() {
  const [activeTab, setActiveTab] = useState('everyday'); // everyday | professional
  const [view, setView] = useState('home'); // home | chat | report
  const [setupScenario, setSetupScenario] = useState(null);
  
  // Game session states
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [openingMessage, setOpeningMessage] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [mode, setMode] = useState('free');
  const [reportData, setReportData] = useState(null);
  const [reward, setReward] = useState(null);
  
  const { fetchProfile } = useAuth();

  const handleStartSession = async (scenario, diff, m, preCreatedConvId, preCreatedOpening) => {
    // Professional sessions create their own conversation in the modal
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

    // Everyday roleplay — call the standard conversation/start endpoint
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
      toast.error(err.response?.data?.message || 'Failed to start session');
    }
  };

  const handleEnd = async (data) => {
    setReportData(data);
    setReward({ xp: data.xpEarned, coins: data.coinsEarned });
    setView('report');
    fetchProfile();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4">
      {reward && view === 'report' && <XPReward {...reward} onClose={() => setReward(null)} />}
      
      {view === 'home' && (
        <>
          <div className="flex justify-center mb-8">
            <div className="bg-dark-800 p-1 rounded-2xl flex gap-1 border border-white/5 shadow-2xl">
              <button 
                onClick={() => setActiveTab('everyday')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'everyday' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Globe size={16}/> Everyday Roleplay
              </button>
              <button 
                onClick={() => setActiveTab('professional')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'professional' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Briefcase size={16}/> Career Success
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

// ScenarioSetupModal for EveryDay View (Original style)
function ScenarioSetupModal({ scenario, onStart, onClose }) {
  const [difficulty, setDifficulty] = useState('intermediate');
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card p-8 max-w-lg w-full animate-slide-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center text-4xl">{scenario.emoji}</div>
          <div>
            <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
            <p className="text-slate-400">{scenario.category}</p>
          </div>
        </div>
        <div className="space-y-6 mb-8">
           <label className="text-xs font-bold text-slate-500 uppercase block">Difficulty</label>
           <div className="grid grid-cols-3 gap-2">
             {['beginner', 'intermediate', 'advanced'].map(d => (
               <button key={d} onClick={() => setDifficulty(d)} className={`py-2 rounded-xl text-xs capitalize border transition-all ${difficulty === d ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'border-white/5 text-slate-500'}`}>{d}</button>
             ))}
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => onStart(scenario, difficulty, 'free')} className="btn-primary flex-1">Start Session</button>
        </div>
      </div>
    </div>
  );
}
