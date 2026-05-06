import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('lq_remember') === 'true');
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 relative overflow-hidden selection:bg-primary-500/30">
      <FloatingShapes />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center font-bold text-white shadow-glow group-hover:rotate-12 transition-transform duration-500">
              <Sparkles size={24} />
            </div>
            <span className="font-display font-bold text-2xl text-white tracking-tight">LinguaQuest</span>
          </Link>
          <h1 className="text-4xl font-display font-bold text-white mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 font-medium tracking-wide">Continue your mission to English mastery.</p>
        </div>

        <div className="glass-card p-10 border-white/5 bg-dark-900/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Protocol</label>
              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field pl-14"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Secure Key</label>
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
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${rememberMe ? 'bg-primary-500 border-primary-500' : 'border-white/10 group-hover:border-primary-500/30'}`}
                >
                  {rememberMe && <ShieldCheck size={12} className="text-white" />}
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300 transition-colors">Remember Session</span>
              </label>
              <Link to="/register" className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">Forgot Access?</Link>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-5 text-base flex items-center justify-center gap-3 shadow-glow"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter Training Grounds <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-400 text-sm font-medium">
              New recruit?{' '}
              <Link to="/register" className="text-white font-black hover:text-primary-400 transition-colors ml-1 uppercase tracking-wider text-xs">Create Account</Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-10 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
          Artisan Crafted for Excellence<br />
          © 2025 LinguaQuest Systems
        </p>
      </motion.div>
    </div>
  );
}
