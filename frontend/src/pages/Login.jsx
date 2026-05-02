import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Floating label field ── */
function FloatField({ icon: Icon, label, type = 'text', value, onChange, required, children }) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  return (
    <div className="relative mt-1">
      <div className="relative">
        <Icon size={16} className={`absolute left-3.5 top-3.5 transition-colors ${focused ? 'text-primary-400' : 'text-slate-500'}`} />
        <input
          type={type} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          required={required}
          placeholder=" "
          className={`input-field pl-10 pt-5 pb-2 peer ${children ? 'pr-10' : ''}`}
        />
        <label className={`absolute left-10 pointer-events-none transition-all duration-200 ${floated ? 'top-1.5 text-[10px] text-primary-400' : 'top-3.5 text-sm text-slate-500'}`}>
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('lq_remember') === 'true');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Pre-fill email if remembered
  useEffect(() => {
    const saved = localStorage.getItem('lq_saved_email');
    if (saved) setForm(f => ({ ...f, email: saved }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      if (rememberMe) {
        localStorage.setItem('lq_remember', 'true');
        localStorage.setItem('lq_saved_email', form.email);
      } else {
        localStorage.removeItem('lq_remember');
        localStorage.removeItem('lq_saved_email');
      }
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-purple rounded-xl flex items-center justify-center font-bold text-white">LQ</div>
            <span className="font-display font-bold text-xl text-white">LinguaQuest</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-slate-400">Continue your English journey</p>
        </div>

        <div className="glass-card p-8">
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
            <FloatField icon={Mail} label="Email" type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />

            <FloatField icon={Lock} label="Password" type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required>
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </FloatField>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div
                onClick={() => setRememberMe(v => !v)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-primary-500 border-primary-500' : 'border-white/20 group-hover:border-primary-500/50'}`}>
                {rememberMe && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
            </label>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3" disabled={loading}>
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Zap size={16} /> Login</>}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            New to LinguaQuest?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
