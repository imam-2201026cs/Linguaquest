import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Zap, Trophy, BookOpen, Headphones, PenTool, CheckSquare, ArrowRight, Star, Play, X, ChevronLeft, ChevronRight as ChevronRightIcon, MessageCircle, Brain, Target } from 'lucide-react';

/* ── Data ── */
const features = [
  { icon: MessageCircle, title: 'AI Mock Interviews', desc: 'Practice real-world roleplay and upload your resume for personalized professional career interviews.', color: 'from-indigo-500 to-purple-400' },
  { icon: Brain,        title: 'Vocabulary Builder',  desc: 'Master new words with our spaced-repetition flashcard system tailored to your interactions.', color: 'from-pink-500 to-rose-400' },
  { icon: Target,       title: 'Daily Challenge',     desc: 'Test your knowledge daily with 10-question AI generated quizzes across all difficulty levels.', color: 'from-yellow-500 to-orange-400' },
  { icon: PenTool,      title: 'AI Writing Coach',    desc: 'Get instant AI feedback with detailed scoring, corrections, and sentence-level highlights.', color: 'from-blue-500 to-cyan-400'     },
  { icon: CheckSquare,  title: 'Verbal Ability',      desc: 'Master grammar, idioms, and vocabulary with 30-question targeted practice tests.', color: 'from-amber-500 to-orange-400' },
  { icon: Headphones,   title: 'Listening Practice',  desc: 'Train your ear with AI-generated passages and comprehension questions.',                      color: 'from-purple-500 to-pink-400'   },
  { icon: BookOpen,     title: 'Smart Reading',       desc: 'Build comprehension with adaptive reading exercises across all levels.',                       color: 'from-green-500 to-emerald-400' },
];

const rawStats = [
  { target: 50000, suffix: 'K+', divisor: 1000, label: 'Learners'      },
  { target: 1000,  suffix: 'K+', divisor: 1,    label: 'Exercises Done' },
  { target: 4.9,   suffix: '★',  divisor: 1,    label: 'Rating'         },
  { target: 98,    suffix: '%',  divisor: 1,    label: 'Success Rate'   },
];

const testimonials = [
  { name: 'Priya S.',    avatar: 'P', stars: 5, text: 'LinguaQuest transformed my English in just 3 weeks! The AI feedback is incredibly detailed.' },
  { name: 'Ali K.',      avatar: 'A', stars: 5, text: 'The gamification keeps me coming back every single day. I\'ve hit a 21-day streak!' },
  { name: 'Chen W.',     avatar: 'C', stars: 5, text: 'Best free English tool I\'ve ever used. The writing coach alone is worth it.' },
  { name: 'Fatima R.',   avatar: 'F', stars: 5, text: 'My IELTS score jumped from 6.0 to 7.5 after two months of daily practice here.' },
  { name: 'Marco T.',    avatar: 'M', stars: 4, text: 'The sentence-level highlighting showed me mistakes I didn\'t even know I was making.' },
];

const QUIZ = [
  { q: 'She __ to school every day.', opts: ['go', 'goes', 'going', 'gone'], correct: 1 },
  { q: 'Which sentence is correct?', opts: ['He don\'t like it.', 'He doesn\'t likes it.', 'He doesn\'t like it.', 'He not like it.'], correct: 2 },
  { q: 'Choose the best synonym for "happy".', opts: ['Sad', 'Elated', 'Tired', 'Angry'], correct: 1 },
];

const LEVEL_MAP = { 0: 'A1 Beginner', 1: 'A2 Elementary', 2: 'B1 Intermediate', 3: 'B2 Upper-Intermediate' };

const MODULE_PREVIEW = [
  { label: 'Interviews', icon: '🗣️', score: 92, badge: '+100 XP', color: 'from-indigo-600 to-purple-500' },
  { label: 'Writing', icon: '✍️', score: 87, badge: '+40 XP', color: 'from-blue-600 to-cyan-500' },
  { label: 'Vocabulary', icon: '🧠', score: 98, badge: '+25 XP', color: 'from-pink-600 to-rose-500' },
  { label: 'Daily Quiz', icon: '🎯', score: 100, badge: '+200 XP', color: 'from-yellow-500 to-orange-400' },
  { label: 'Verbal Test', icon: '⚡', score: 85, badge: '+150 XP', color: 'from-amber-600 to-orange-500' },
  { label: 'Reading', icon: '📖', score: 95, badge: '+50 XP', color: 'from-green-600 to-emerald-500' },
];

/* ── Animated counter ── */
function AnimatedStat({ target, suffix, divisor, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const id = setInterval(() => {
          current = Math.min(current + increment, target);
          setCount(current);
          if (current >= target) clearInterval(id);
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const display = divisor > 1
    ? (count / divisor).toFixed(count >= target ? 0 : 1)
    : count >= target ? target : count.toFixed(target % 1 !== 0 ? 1 : 0);

  return (
    <div ref={ref} className="glass-card p-4 text-center">
      <div className="text-2xl font-display font-bold text-white">{display}{suffix}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

/* ── Testimonials carousel ── */
function Testimonials() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIdx(i => (i + 1) % testimonials.length);

  useEffect(() => {
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, []);

  const t = testimonials[idx];
  return (
    <section className="relative z-10 max-w-3xl mx-auto px-6 pb-20">
      <h2 className="text-3xl font-display font-bold text-white text-center mb-10">What Learners Say</h2>
      <div className="glass-card p-8 text-center relative">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-purple rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
          {t.avatar}
        </div>
        <div className="flex justify-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className={i < t.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
          ))}
        </div>
        <p className="text-slate-300 italic mb-4 leading-relaxed">"{t.text}"</p>
        <p className="text-sm font-semibold text-white">{t.name}</p>
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={prev} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"><ChevronLeft size={16} className="text-slate-400" /></button>
          <div className="flex gap-1 items-center">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-primary-400 w-4' : 'bg-white/20'}`} />
            ))}
          </div>
          <button onClick={next} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"><ChevronRightIcon size={16} className="text-slate-400" /></button>
        </div>
      </div>
    </section>
  );
}

/* ── Level quiz teaser ── */
function QuizTeaser() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [chosen, setChosen] = useState(null);

  const answer = (i) => {
    if (chosen !== null) return;
    setChosen(i);
    const correct = i === QUIZ[step].correct;
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (step + 1 >= QUIZ.length) { setDone(true); }
      else { setStep(s => s + 1); setChosen(null); }
    }, 800);
  };

  const reset = () => { setStep(0); setScore(0); setDone(false); setChosen(null); };

  return (
    <section className="relative z-10 max-w-2xl mx-auto px-6 pb-20">
      <h2 className="text-3xl font-display font-bold text-white text-center mb-3">What's Your English Level?</h2>
      <p className="text-slate-400 text-center mb-8 text-sm">Answer 3 quick questions to find out</p>
      <div className="glass-card p-6">
        {!done ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-500">Question {step + 1} of {QUIZ.length}</span>
              <div className="flex gap-1">
                {QUIZ.map((_, i) => <div key={i} className={`w-6 h-1.5 rounded-full ${i <= step ? 'bg-primary-500' : 'bg-white/10'}`} />)}
              </div>
            </div>
            <p className="text-white font-semibold mb-4">{QUIZ[step].q}</p>
            <div className="grid grid-cols-2 gap-3">
              {QUIZ[step].opts.map((opt, i) => {
                let cls = 'p-3 rounded-xl border text-sm text-left transition-all cursor-pointer ';
                if (chosen === null) cls += 'border-white/10 hover:border-primary-500/50 text-slate-300';
                else if (i === QUIZ[step].correct) cls += 'border-green-500 bg-green-500/10 text-green-300';
                else if (i === chosen) cls += 'border-red-500 bg-red-500/10 text-red-300';
                else cls += 'border-white/5 text-slate-600';
                return <button key={i} onClick={() => answer(i)} className={cls}>{opt}</button>;
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🎯</div>
            <p className="text-white font-display font-bold text-xl mb-1">Your Level: {LEVEL_MAP[score]}</p>
            <p className="text-slate-400 text-sm mb-6">You got {score}/{QUIZ.length} correct</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="btn-primary flex items-center justify-center gap-2">Start Learning at Your Level <ArrowRight size={16} /></Link>
              <button onClick={reset} className="btn-ghost text-sm">Retake Quiz</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Live demo mockup ── */
function LiveDemo() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(i => (i + 1) % MODULE_PREVIEW.length), 2200);
    return () => clearInterval(id);
  }, []);

  const m = MODULE_PREVIEW[active];
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
      <h2 className="text-3xl font-display font-bold text-white text-center mb-3">See It in Action</h2>
      <p className="text-slate-400 text-center text-sm mb-10">Watch the modules cycle — this is what you'll see inside</p>
      <div className="glass-card p-6 max-w-md mx-auto">
        <div className="flex gap-2 mb-4">
          {MODULE_PREVIEW.map((mod, i) => (
            <button key={mod.label} onClick={() => setActive(i)}
              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${i === active ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-500'}`}>
              {mod.icon}
            </button>
          ))}
        </div>
        <div className={`bg-gradient-to-br ${m.color} rounded-xl p-5 text-white transition-all duration-500`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold">{m.icon} {m.label}</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{m.badge}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${m.score}%` }} />
          </div>
          <div className="flex justify-between text-xs opacity-80">
            <span>Score</span><span>{m.score}%</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 text-center mt-4">✨ AI analyses your responses in real-time</p>
      </div>
    </section>
  );
}

/* ── Video demo modal ── */
function VideoDemoButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-white/15 text-slate-300 hover:text-white hover:border-white/30 bg-white/5 hover:bg-white/10 rounded-xl px-6 py-3 text-sm font-medium transition-all">
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
          <Play size={10} className="text-white ml-0.5" />
        </div>
        Watch Demo
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="glass-card p-8 max-w-lg w-full text-center relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white"><X size={18} /></button>
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-white font-display font-bold text-xl mb-2">Demo Coming Soon</h3>
            <p className="text-slate-400 text-sm mb-6">A full walkthrough video is being recorded. In the meantime, sign up for free and explore yourself!</p>
            <Link to="/register" onClick={() => setOpen(false)} className="btn-primary inline-flex items-center gap-2">
              Try It Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Floating particles ── */
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 6,
    duration: Math.random() * 8 + 6,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div key={p.id}
          style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: p.id % 3 === 0 ? 'rgba(99,102,241,0.5)' : p.id % 3 === 1 ? 'rgba(168,85,247,0.4)' : 'rgba(251,191,36,0.3)',
            animation: `floatParticle ${p.duration}s ${p.delay}s infinite ease-in-out alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatParticle {
          0%   { transform: translateY(0px) translateX(0px) scale(1); opacity:0.4; }
          50%  { transform: translateY(-30px) translateX(15px) scale(1.3); opacity:0.8; }
          100% { transform: translateY(-55px) translateX(-10px) scale(0.8); opacity:0.2; }
        }
      `}</style>
    </div>
  );
}

/* ── Main Landing ── */
export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      <Particles />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-purple rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/30">LQ</div>
          <span className="font-display font-bold text-xl text-white">LinguaQuest</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm py-2 px-4">Login</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started Free</Link>
        </div>
      </nav>

      {/* Free badge */}
      <div className="relative z-10 flex justify-center pt-2 pb-0">
        <span className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-4 py-1.5 rounded-full">
          🎉 100% Free — No credit card required. Ever.
        </span>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-8 text-sm text-primary-400 font-medium">
          <Zap size={14} /> Powered by Gemini AI
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          Master English<br />
          <span className="shimmer-text">Like a Quest</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-body leading-relaxed">
          Level up your English with immersive AI roleplay, personalized mock interviews, and daily gamified challenges — all designed to keep you motivated.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-base py-4 px-8">
            Start Your Quest <ArrowRight size={18} />
          </Link>
          <VideoDemoButton />
        </div>

        {/* Animated stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-4">
          {rawStats.map(s => <AnimatedStat key={s.label} {...s} />)}
        </div>
      </section>

      {/* Live Demo Preview */}
      <LiveDemo />

      {/* How it works */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-display font-bold text-white text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { step: '01', icon: '📝', title: 'Sign Up Free',   desc: 'Create your account in 30 seconds — no card needed.' },
            { step: '02', icon: '🎯', title: 'Practice Daily', desc: 'Complete AI-powered exercises across writing, reading, listening and grammar.' },
            { step: '03', icon: '🏆', title: 'Level Up',       desc: 'Earn XP, climb the leaderboard, and watch your English soar.' },
          ].map(({ step, icon, title, desc }, i) => (
            <div key={step} className="glass-card p-6 text-center relative group hover:scale-[1.02] transition-all duration-300">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-purple rounded-full flex items-center justify-center text-xs font-bold text-white">{step}</div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
              {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 text-slate-600 text-xl z-10">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white text-center mb-12">Everything You Need to Excel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass-card p-6 hover:border-white/10 hover:scale-[1.02] transition-all duration-300 group">
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz teaser */}
      <QuizTeaser />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="glass-card p-8 md:p-12 bg-gradient-to-br from-primary-500/10 to-accent-purple/10 border-primary-500/20 text-center">
          <Trophy size={48} className="text-accent-yellow mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold text-white mb-4">Learn. Earn. Compete.</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">Earn XP for every exercise, maintain daily streaks, collect coins, unlock achievements and climb the global leaderboard.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base py-3 px-8">
            Join Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 text-center py-8 text-slate-600 text-sm border-t border-white/5">
        © 2025 LinguaQuest — AI-Powered English Learning
      </footer>
    </div>
  );
}
