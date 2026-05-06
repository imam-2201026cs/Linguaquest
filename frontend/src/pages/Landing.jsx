import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, BookOpen, Headphones, PenTool, CheckSquare, ArrowRight, Star, Play, X, ChevronLeft, ChevronRight as ChevronRightIcon, MessageCircle, Brain, Target, ShieldCheck, Sparkles, Globe, BarChart3 } from 'lucide-react';

/* ── Data ── */
const features = [
  { icon: MessageCircle, title: 'AI Mock Interviews', desc: 'Practice real-world roleplay and upload your resume for personalized professional career interviews.', color: 'from-primary-500 to-accent-indigo' },
  { icon: Brain,        title: 'Vocabulary Builder',  desc: 'Master new words with our spaced-repetition flashcard system tailored to your interactions.', color: 'from-accent-rose to-primary-500' },
  { icon: Target,       title: 'Daily Challenge',     desc: 'Test your knowledge daily with 10-question AI generated quizzes across all difficulty levels.', color: 'from-accent-amber to-accent-gold' },
  { icon: PenTool,      title: 'AI Writing Coach',    desc: 'Get instant AI feedback with detailed scoring, corrections, and sentence-level highlights.', color: 'from-primary-400 to-accent-indigo'     },
  { icon: CheckSquare,  title: 'Verbal Ability',      desc: 'Master grammar, idioms, and vocabulary with 30-question targeted practice tests.', color: 'from-accent-amber to-primary-600' },
  { icon: Headphones,   title: 'Listening Practice',  desc: 'Train your ear with AI-generated passages and comprehension questions.',                      color: 'from-primary-600 to-accent-rose'   },
];

const rawStats = [
  { target: 50000, suffix: 'K+', divisor: 1000, label: 'Active Learners'      },
  { target: 1000,  suffix: 'K+', divisor: 1,    label: 'Lessons Completed' },
  { target: 4.9,   suffix: '★',  divisor: 1,    label: 'Global Rating'         },
  { target: 98,    suffix: '%',  divisor: 1,    label: 'Fluency Success'   },
];

const testimonials = [
  { name: 'Priya Sharma',    role: 'IELTS Candidate', avatar: 'PS', stars: 5, text: 'LinguaQuest transformed my English in just 3 weeks! The AI feedback is incredibly detailed and actionable.' },
  { name: 'Ali Khan',      role: 'Software Engineer', avatar: 'AK', stars: 5, text: 'The gamification keeps me coming back every single day. I\'ve hit a 21-day streak and feel more confident than ever.' },
  { name: 'Chen Wei',     role: 'Business Student', avatar: 'CW', stars: 5, text: 'Best free English tool I\'ve ever used. The writing coach alone is worth more than most paid courses.' },
];

const QUIZ = [
  { q: 'She __ to school every day.', opts: ['go', 'goes', 'going', 'gone'], correct: 1 },
  { q: 'Which sentence is correct?', opts: ['He don\'t like it.', 'He doesn\'t likes it.', 'He doesn\'t like it.', 'He not like it.'], correct: 2 },
  { q: 'Choose the best synonym for "happy".', opts: ['Sad', 'Elated', 'Tired', 'Angry'], correct: 1 },
];

const LEVEL_MAP = { 0: 'A1 Beginner', 1: 'A2 Elementary', 2: 'B1 Intermediate', 3: 'B2 Upper-Intermediate' };

const MODULE_PREVIEW = [
  { label: 'Interviews', icon: '🗣️', score: 92, badge: '+100 XP', color: 'from-primary-600 to-accent-indigo' },
  { label: 'Writing', icon: '✍️', score: 87, badge: '+40 XP', color: 'from-primary-500 to-primary-700' },
  { label: 'Vocabulary', icon: '🧠', score: 98, badge: '+25 XP', color: 'from-accent-rose to-primary-600' },
  { label: 'Daily Quiz', icon: '🎯', score: 100, badge: '+200 XP', color: 'from-accent-amber to-accent-gold' },
];

/* ── Components ── */

function SectionHeader({ title, subtitle, centered = true }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mb-16 ${centered ? 'text-center' : ''}`}
    >
      <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
    </motion.div>
  );
}

function AnimatedStat({ target, suffix, divisor, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
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
    <div ref={ref} className="text-center group">
      <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
        {display}{suffix}
      </div>
      <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">{label}</div>
    </div>
  );
}

function Testimonials() {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx(i => (i + 1) % testimonials.length);
  const prev = () => setIdx(i => (i - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      <SectionHeader title="Trusted by Thousands" subtitle="Join a global community of learners achieving their dreams." />
      
      <div className="max-w-5xl mx-auto px-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-card p-10 md:p-16 flex flex-col md:flex-row gap-10 items-center"
          >
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary-500 to-accent-indigo flex items-center justify-center text-3xl font-bold text-white shadow-glow relative z-10">
                {testimonials[idx].avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-accent-gold p-2 rounded-full z-20 shadow-lg">
                <Star size={16} className="text-dark-950 fill-dark-950" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex justify-center md:justify-start gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-accent-gold fill-accent-gold" />
                ))}
              </div>
              <p className="text-xl md:text-2xl text-slate-200 italic leading-relaxed mb-8">
                "{testimonials[idx].text}"
              </p>
              <div>
                <h4 className="text-white font-bold text-lg">{testimonials[idx].name}</h4>
                <p className="text-primary-400 font-medium">{testimonials[idx].role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-4 mt-10">
          <button onClick={prev} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-primary-500' : 'w-2 bg-white/10'}`} />
            ))}
          </div>
          <button onClick={next} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5">
            <ChevronRightIcon size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

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
    <section className="py-24 bg-dark-900/50">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeader title="Discover Your Potential" subtitle="Take a 30-second assessment to find your starting point." />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          {!done ? (
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Question {step + 1} of {QUIZ.length}</span>
                <div className="flex gap-2">
                  {QUIZ.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-primary-500' : 'w-4 bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-8">{QUIZ[step].q}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUIZ[step].opts.map((opt, i) => {
                  let cls = 'p-5 rounded-2xl border-2 text-lg font-semibold text-left transition-all duration-300 ';
                  if (chosen === null) cls += 'border-white/5 bg-white/5 hover:border-primary-500/50 hover:bg-primary-500/5 text-slate-300';
                  else if (i === QUIZ[step].correct) cls += 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald';
                  else if (i === chosen) cls += 'border-accent-rose bg-accent-rose/10 text-accent-rose';
                  else cls += 'border-white/5 text-slate-600 opacity-50';
                  return <button key={i} onClick={() => answer(i)} className={cls}>{opt}</button>;
                })}
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6 relative z-10"
            >
              <div className="w-20 h-20 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} className="text-accent-gold" />
              </div>
              <h3 className="text-3xl font-display font-bold text-white mb-2">You're at {LEVEL_MAP[score]}!</h3>
              <p className="text-slate-400 text-lg mb-10">Based on your performance, we've tailored a custom learning path just for you.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary group">
                  Claim Your Path <ArrowRight size={20} className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button onClick={reset} className="btn-secondary">Try Again</button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function LiveDemo() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(i => (i + 1) % MODULE_PREVIEW.length), 3000);
    return () => clearInterval(id);
  }, []);

  const m = MODULE_PREVIEW[active];
  return (
    <section className="py-24 relative">
      <SectionHeader title="Intelligence in Motion" subtitle="Experience real-time AI analysis that adapts to your learning style." />
      <div className="max-w-4xl mx-auto px-6">
        <div className="glass-card p-2 md:p-3 overflow-hidden">
          <div className="bg-dark-950 rounded-[2rem] p-6 md:p-10 border border-white/5">
            <div className="flex flex-wrap gap-2 mb-10 justify-center">
              {MODULE_PREVIEW.map((mod, i) => (
                <button key={mod.label} onClick={() => setActive(i)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${i === active ? 'bg-primary-500 text-white shadow-glow' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}>
                  {mod.icon} {mod.label}
                </button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-gradient-to-br ${m.color} rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden`}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">{m.icon}</div>
                      <div>
                        <h4 className="text-xl font-bold">{m.label} Module</h4>
                        <p className="text-sm opacity-70">Personalized Learning Session</p>
                      </div>
                    </div>
                    <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest">{m.badge}</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2 uppercase tracking-wider opacity-80">
                        <span>Analysis Accuracy</span>
                        <span>{m.score}%</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${m.score}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 h-20 bg-white/10 rounded-2xl p-4 flex flex-col justify-center">
                        <div className="text-[10px] uppercase font-bold opacity-60 mb-1">Fluency</div>
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white w-3/4 rounded-full" />
                        </div>
                      </div>
                      <div className="flex-1 h-20 bg-white/10 rounded-2xl p-4 flex flex-col justify-center">
                        <div className="text-[10px] uppercase font-bold opacity-60 mb-1">Grammar</div>
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white w-5/6 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <p className="text-center mt-8 text-slate-500 text-sm font-medium">
              <Sparkles size={14} className="inline-block mr-2 text-primary-400" /> 
              Real-time Groq AI processing • 99.8% Latency Reliability
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoDemoButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="btn-secondary group flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
          <Play size={12} className="text-primary-400 fill-primary-400 ml-0.5" />
        </div>
        Watch Demo
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark-950/90 backdrop-blur-md p-4" onClick={() => setOpen(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 max-w-xl w-full text-center relative" 
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            <div className="w-24 h-24 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Play size={40} className="text-primary-500" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-4">Masterpiece in Progress</h3>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">We're meticulously recording a cinematic walkthrough of LinguaQuest. For now, experience the magic firsthand by creating your free account.</p>
            <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full block">
              Start Exploring for Free
            </Link>
          </motion.div>
        </div>
      )}
    </>
  );
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

/* ── Main Landing ── */
export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden selection:bg-primary-500/30">
      <FloatingShapes />

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center font-bold text-white shadow-glow group-hover:rotate-12 transition-transform duration-500">
            <Sparkles size={24} />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">LinguaQuest</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/login" className="text-slate-400 hover:text-white font-bold transition-colors hidden md:block">Sign In</Link>
          <Link to="/register" className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-bold border border-white/10 hover:border-white/20 transition-all shadow-xl">
            Join the Quest
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-6 py-2.5 mb-10 text-sm font-bold text-primary-400 shadow-2xl backdrop-blur-md"
        >
          <Zap size={14} className="fill-primary-400" /> Accelerated Learning with Groq AI
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-[0.9] mb-8 tracking-tighter"
        >
          Unleash Your<br />
          <span className="shimmer-text">English Potential</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
        >
          Master real-world English through immersive AI roleplay, personalized interviews, and gamified challenges designed to make fluency inevitable.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 justify-center mb-24"
        >
          <Link to="/register" className="btn-primary text-lg px-10 py-5 group shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            Start Your Journey <ArrowRight size={20} className="inline-block ml-2 group-hover:translate-x-2 transition-transform" />
          </Link>
          <VideoDemoButton />
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto pt-16 border-t border-white/5"
        >
          {rawStats.map(s => <AnimatedStat key={s.label} {...s} />)}
        </motion.div>
      </section>

      {/* Features Showcase */}
      <section className="py-32 relative overflow-hidden bg-dark-900/30">
        <SectionHeader title="Engineered for Mastery" subtitle="Every feature is meticulously designed to accelerate your progress and keep you engaged." />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div 
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:rotate-6 transition-transform`}>
                <Icon size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-4">{title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <LiveDemo />
      
      {/* Social Proof */}
      <section className="py-24 border-y border-white/5 bg-dark-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex items-center gap-2 font-display font-black text-2xl text-white"><ShieldCheck size={32} /> TRUSTED</div>
           <div className="flex items-center gap-2 font-display font-black text-2xl text-white"><Globe size={32} /> GLOBAL</div>
           <div className="flex items-center gap-2 font-display font-black text-2xl text-white"><BarChart3 size={32} /> ANALYTICS</div>
           <div className="flex items-center gap-2 font-display font-black text-2xl text-white"><Sparkles size={32} /> PREMIUM</div>
        </div>
      </section>

      <QuizTeaser />
      <Testimonials />

      {/* CTA Final */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto glass-card p-12 md:p-24 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-accent-indigo/20" />
          <div className="relative z-10">
            <Trophy size={80} className="text-accent-gold mx-auto mb-10 drop-shadow-[0_0_20px_rgba(252,211,77,0.5)]" />
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Ready to Conquer?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium">Join 50,000+ learners who have already started their quest to English mastery. 100% free, forever.</p>
            <Link to="/register" className="btn-primary py-4 md:py-6 px-8 md:px-12 text-sm md:text-xl group shadow-2xl flex items-center justify-center gap-3 w-full sm:w-auto mx-auto">
              Launch Your Quest Now 
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-white text-xs">LQ</div>
          <span className="font-display font-bold text-white tracking-tight">LinguaQuest</span>
        </div>
        <p className="text-slate-600 text-sm font-bold tracking-widest uppercase mb-4">© 2025 ALL RIGHTS RESERVED • ARTISAN CRAFTED</p>
        <div className="flex justify-center gap-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
