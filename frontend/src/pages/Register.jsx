import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Zap, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
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

/* ── Confetti burst ── */
function spawnConfetti() {
  const colors = ['#6366f1', '#a855f7', '#facc15', '#34d399', '#f472b6'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; top:50%; left:50%; width:8px; height:8px; border-radius:50%;
      background:${colors[i % colors.length]}; pointer-events:none; z-index:9999;
      animation: confettiFly 1s ${Math.random() * 0.4}s ease-out forwards;
      --tx:${(Math.random() - 0.5) * 600}px; --ty:${(Math.random() - 0.8) * 500}px;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
  const style = document.createElement('style');
  style.textContent = `@keyframes confettiFly { to { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }`;
  document.head.appendChild(style);
  setTimeout(() => style.remove(), 2000);
}

/* ── Onboarding quiz (post-register) ── */
const QUIZ_STEPS = [
  { id: 'level', q: "What's your current English level?", opts: ['Beginner (A1–A2)', 'Intermediate (B1–B2)', 'Advanced (C1–C2)'] },
  { id: 'goal',  q: "What's your main goal?",            opts: ['Improve for work', 'Pass an exam (IELTS/TOEFL)', 'Travel & everyday use', 'Just for fun'] },
  { id: 'time',  q: 'How much time can you practice daily?', opts: ['5–10 mins', '15–20 mins', '30+ mins'] },
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
    <div className="fixed inset-0 z-50 bg-dark-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full animate-slide-up">
        <div className="flex gap-1 mb-6">
          {QUIZ_STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-primary-500' : 'bg-white/10'}`} />
          ))}
        </div>
        <p className="text-xs text-slate-500 mb-2">Question {step + 1} of {QUIZ_STEPS.length}</p>
        <h2 className="text-xl font-display font-bold text-white mb-6">{q.q}</h2>
        <div className="space-y-3">
          {q.opts.map(opt => (
            <button key={opt} onClick={() => pick(opt)}
              className="w-full text-left p-4 rounded-xl border border-white/10 text-slate-300 hover:border-primary-500/50 hover:bg-primary-500/5 hover:text-white transition-all">
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Floating label field ── */
function FloatField({ icon: Icon, label, type = 'text', value, onChange, required, minLength, children }) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  return (
    <div className="relative mt-1">
      <div className="relative">
        <Icon size={16} className={`absolute left-3.5 top-3.5 transition-colors ${focused ? 'text-primary-400' : 'text-slate-500'}`} />
        <input
          type={type} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          required={required} minLength={minLength}
          placeholder=" "
          className={`input-field pl-10 pt-5 pb-2 transition-all peer ${children ? 'pr-10' : ''}`}
        />
        <label className={`absolute left-10 pointer-events-none transition-all duration-200 ${floated ? 'top-1.5 text-[10px] text-primary-400' : 'top-3.5 text-sm text-slate-500'}`}>
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

/* ── Main Register ── */
export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [showQuiz, setShowQuiz] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const strength = form.password ? getStrength(form.password) : null;

  // Debounced username check
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
      spawnConfetti();
      toast.success('Account created! 🚀 Quick setup…');
      setShowQuiz(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const finishQuiz = (answers) => {
    localStorage.setItem('lq_onboarding', JSON.stringify(answers));
    toast.success(`Welcome! Let's get you to ${answers.level?.split(' ')[0]} exercises! 🎯`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {showQuiz && <OnboardingQuiz onFinish={finishQuiz} />}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-purple rounded-xl flex items-center justify-center font-bold text-white">LQ</div>
            <span className="font-display font-bold text-xl text-white">LinguaQuest</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Join the Quest!</h1>
          <p className="text-slate-400">Create your free account and start leveling up</p>
        </div>

        <div className="glass-card p-8">
          {/* Perks */}
          <div className="flex gap-2 flex-wrap mb-5">
            {['🎮 Gamified', '🤖 AI Feedback', '🏆 Leaderboards'].map(p => (
              <span key={p} className="text-xs bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full px-3 py-1">{p}</span>
            ))}
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-3 py-1">✅ 100% Free</span>
          </div>

          {/* OAuth placeholder */}
          <button type="button" onClick={() => toast('Google sign-in coming soon!')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all mb-4 text-sm font-medium">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.4 4 9.8 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.4 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.4C9.8 35.6 16.4 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C37.1 40.5 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">or with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <FloatField icon={User} label="Username" value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                required minLength={3}>
                <div className="absolute right-3.5 top-3.5">
                  {usernameStatus === 'checking' && <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />}
                  {usernameStatus === 'available' && <CheckCircle2 size={16} className="text-green-400" />}
                  {usernameStatus === 'taken' && <XCircle size={16} className="text-red-400" />}
                </div>
              </FloatField>
              {usernameStatus === 'available' && <p className="text-xs text-green-400 mt-1 ml-1">✓ Username available</p>}
              {usernameStatus === 'taken' && <p className="text-xs text-red-400 mt-1 ml-1">✗ Username already taken</p>}
            </div>

            {/* Email */}
            <FloatField icon={Mail} label="Email" type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />

            {/* Password */}
            <div>
              <FloatField icon={Lock} label="Password" type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required minLength={6}>
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </FloatField>
              {/* Strength meter */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} rounded-full transition-all duration-500`} style={{ width: strength.width }} />
                  </div>
                  <p className={`text-xs mt-1 ml-1 ${strength.text}`}>{strength.label} password</p>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3" disabled={loading || usernameStatus === 'taken'}>
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Zap size={16} /> Create Account — It's Free!</>}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
