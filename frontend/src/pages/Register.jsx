import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Zap, CheckCircle2, XCircle, ArrowRight, Sparkles, ShieldCheck, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

/* ── Password strength ── */
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%', text: 'text-red-400' };
  if (score <= 3) return { label: 'Medium', color: 'bg-yellow-400', width: '60%', text: 'text-yellow-400' };
  return { label: 'Strong', color: 'bg-green-500', width: '100%', text: 'text-green-400' };
}

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] left-[10%] w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]" 
      />
      <motion.div 
        animate={{ 
          y: [0, 30, 0],
          rotate: [0, -15, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-accent-indigo/10 rounded-full blur-[120px]" 
      />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(5,1,29,0)_0%,rgba(3,0,20,1)_100%)]" />
    </div>
  );
}

/* ── Onboarding quiz (post-register) ── */
const QUIZ_STEPS = [
  { id: 'level', q: "Current Mastery Level?", opts: ['Beginner (A1–A2)', 'Intermediate (B1–B2)', 'Advanced (C1–C2)'] },
  { id: 'goal',  q: "Primary Objective?",            opts: ['Professional Growth', 'Academic Excellence', 'Global Communication', 'Daily Habit'] },
  { id: 'time',  q: 'Daily Commitment?', opts: ['5–10 mins', '15–20 mins', '30+ mins'] },
];

function OnboardingQuiz({ onFinish }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const pick = (val) => {
    const next = { ...answers, [QUIZ_STEPS[step].id]: val };
    setAnswers(next);
    if (step + 1 >= QUIZ_STEPS.length) { onFinish(next); }
    else setStep(s => s + 1);
  };

  const q = QUIZ_STEPS[step];
  return (
    <div className="fixed inset-0 z-[100] bg-dark-950/90 backdrop-blur-xl flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 max-w-md w-full relative overflow-hidden"
      >
        <div className="flex gap-2 mb-8">
          {QUIZ_STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary-500 shadow-glow' : 'bg-white/10'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Question {step + 1} of {QUIZ_STEPS.length}</p>
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-8 tracking-tight">{q.q}</h2>
        <div className="space-y-3">
          {q.opts.map(opt => (
            <button key={opt} onClick={() => pick(opt)}
              className="w-full text-left p-5 rounded-2xl border border-white/5 bg-white/5 text-slate-300 hover:border-primary-500/50 hover:bg-primary-500/5 hover:text-white transition-all font-bold group">
              <div className="flex items-center justify-between">
                 <span>{opt}</span>
                 <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const strength = form.password ? getStrength(form.password) : null;

  useEffect(() => {
    if (form.username.length < 3) { setUsernameStatus(null); return; }
    setUsernameStatus('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(`/api/auth/check-username?username=${form.username}`);
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch { setUsernameStatus(null); }
    }, 500);
  }, [form.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameStatus === 'taken') return toast.error('Username already taken');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Account verified! 🚀 Setting up environment…');
      setShowQuiz(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const finishQuiz = (answers) => {
    localStorage.setItem('lq_onboarding', JSON.stringify(answers));
    toast.success(`Deployment successful! Welcome to the training grounds. 🎯`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 relative overflow-hidden selection:bg-primary-500/30">
      <FloatingShapes />
      <AnimatePresence>
        {showQuiz && <OnboardingQuiz onFinish={finishQuiz} />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md my-12"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center font-bold text-white shadow-glow group-hover:rotate-12 transition-transform duration-500">
              <Sparkles size={24} />
            </div>
            <span className="font-display font-bold text-2xl text-white tracking-tight">LinguaQuest</span>
          </Link>
          <h1 className="text-4xl font-display font-bold text-white mb-3 tracking-tight">Initiate Quest</h1>
          <p className="text-slate-400 font-medium tracking-wide">Join 50k+ learners on the path to excellence.</p>
        </div>

        <div className="glass-card p-10 border-white/5 bg-dark-900/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Identity Tag</label>
              <div className="relative">
                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  className="input-field pl-14 pr-12"
                  placeholder="TheChosenOne"
                  required
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                   {usernameStatus === 'checking' && <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />}
                   {usernameStatus === 'available' && <CheckCircle2 size={18} className="text-accent-emerald shadow-glow" />}
                   {usernameStatus === 'taken' && <XCircle size={18} className="text-accent-rose shadow-glow" />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Communication Link</label>
              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field pl-14"
                  placeholder="hero@linguaquest.io"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Security Cipher</label>
              <div className="relative">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pl-14 pr-14"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {strength && (
                <div className="mt-3 px-1">
                   <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${strength.text}`}>{strength.label} Protection</span>
                      <span className="text-[10px] text-slate-600 font-bold">{strength.width}</span>
                   </div>
                   <div className="h-1 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: strength.width }}
                        className={`h-full ${strength.color} rounded-full transition-all duration-500`}
                      />
                   </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-5 text-base flex items-center justify-center gap-3 shadow-glow"
              disabled={loading || usernameStatus === 'taken'}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Begin Activation <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-400 text-sm font-medium">
              Already enlisted?{' '}
              <Link to="/login" className="text-white font-black hover:text-primary-400 transition-colors ml-1 uppercase tracking-wider text-xs">Sign In</Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-10 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
          Premium Artisan Quality Guaranteed<br />
          © 2025 LinguaQuest Systems
        </p>
      </motion.div>
    </div>
  );
}
