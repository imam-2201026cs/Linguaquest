// Premium Landing Overhaul - Cinematic Experience
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Trophy, BookOpen, Headphones, PenTool, CheckSquare, 
  ArrowRight, Star, Play, X, ChevronLeft, ChevronRight as ChevronRightIcon, 
  MessageCircle, Brain, Target, ShieldCheck, Sparkles, Globe, 
  BarChart3, Activity, Command, Cpu, Terminal
} from 'lucide-react';

/* ── Data ── */
const features = [
  { icon: MessageCircle, title: 'AI Mock Interviews', desc: 'Simulate high-stakes vocal interaction with real-time feedback and resume-specific scenarios.', color: 'from-primary-500 to-accent-indigo' },
  { icon: Brain,        title: 'Neural Vocab Lab',  desc: 'Master new words with our spaced-repetition logic tailored to your specific cognitive patterns.', color: 'from-accent-rose to-primary-500' },
  { icon: Target,       title: 'Daily Operations',     desc: 'Test your knowledge daily with AI-generated tactical challenges across all difficulty levels.', color: 'from-accent-amber to-accent-gold' },
  { icon: PenTool,      title: 'Writing Matrix',    desc: 'Get instant high-fidelity feedback with detailed scoring, logical corrections, and highlights.', color: 'from-primary-400 to-accent-indigo'     },
  { icon: CheckSquare,  title: 'Logic Kernel',      desc: 'Master grammar, idioms, and vocabulary with targeted practice tests designed for efficiency.', color: 'from-accent-amber to-primary-600' },
  { icon: Headphones,   title: 'Audio Sync',  desc: 'Train your neural pathways with AI-generated audio passages and complex comprehension.', color: 'from-primary-600 to-accent-rose'   },
];

const rawStats = [
  { target: 50, suffix: 'K+', divisor: 1, label: 'Elite Operatives'      },
  { target: 12, suffix: 'M+', divisor: 1, label: 'Syncs Completed' },
  { target: 4.9,   suffix: '★',  divisor: 1,    label: 'Global Rating'         },
  { target: 99,    suffix: '%',  divisor: 1,    label: 'Fluency Threshold'   },
];

const testimonials = [
  { name: 'Dr. Sarah Vance', role: 'Language Researcher', avatar: 'SV', stars: 5, text: 'LinguaQuest has redefined the boundaries of AI-assisted learning. The feedback loops are unprecedented in their precision.' },
  { name: 'Marcus Thorne', role: 'Lead Developer', avatar: 'MT', stars: 5, text: 'The gamification logic is addictive, but it\'s the actual linguistic growth that kept me here. My professional fluency soared.' },
  { name: 'Elena Rossi', role: 'Business Strategist', avatar: 'ER', stars: 5, text: 'A masterclass in modern UI and AI integration. It doesn\'t just teach English; it synchronizes your mind with the language.' },
];

const QUIZ = [
  { q: 'She __ to school every day.', opts: ['go', 'goes', 'going', 'gone'], correct: 1 },
  { q: 'Which sentence is logically correct?', opts: ['He don\'t like it.', 'He doesn\'t likes it.', 'He doesn\'t like it.', 'He not like it.'], correct: 2 },
  { q: 'Choose the most precise synonym for "profound".', opts: ['Shallow', 'Deep', 'Light', 'Obvious'], correct: 1 },
];

const LEVEL_MAP = { 0: 'A1 Initiate', 1: 'A2 Associate', 2: 'B1 Specialist', 3: 'B2 Operative' };

const MODULE_PREVIEW = [
  { label: 'Interviews', icon: '🗣️', score: 92, badge: 'SYNCED', color: 'from-primary-600 to-accent-indigo' },
  { label: 'Writing', icon: '✍️', score: 87, badge: 'ANALYZED', color: 'from-primary-500 to-primary-700' },
  { label: 'Vocabulary', icon: '🧠', score: 98, badge: 'MASTERED', color: 'from-accent-rose to-primary-600' },
  { label: 'Daily Quiz', icon: '🎯', score: 100, badge: 'PERFECT', color: 'from-accent-amber to-accent-gold' },
];

/* ── Components ── */

function SectionHeader({ title, subtitle, centered = true, tag = "CORE CAPABILITIES" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mb-20 ${centered ? 'text-center' : ''}`}
    >
      <div className={`flex items-center gap-3 mb-6 ${centered ? 'justify-center' : ''}`}>
         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400">{tag}</span>
         <div className="h-px w-10 bg-primary-500/30" />
      </div>
      <h2 className="text-4xl sm:text-5xl md:text-7xl font-display font-black text-white mb-6 tracking-tighter leading-none">
        {title}
      </h2>
      {subtitle && <p className="text-slate-400 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">{subtitle}</p>}
    </motion.div>
  );
}

function AnimatedStat({ target, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2500;
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

  return (
    <div ref={ref} className="text-center group p-8">
      <div className="text-4xl md:text-6xl font-display font-black text-white mb-3 group-hover:text-primary-400 transition-colors tracking-tighter">
        {count.toFixed(target % 1 !== 0 ? 1 : 0)}{suffix}
      </div>
      <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black group-hover:text-slate-400 transition-colors">{label}</div>
    </div>
  );
}

/* ── Main Landing ── */
export default function Landing() {
  const [activeMod, setActiveMod] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveMod(i => (i + 1) % MODULE_PREVIEW.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden selection:bg-primary-500/30 font-sans">
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-600/10 rounded-full blur-[150px] opacity-40 animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-indigo/10 rounded-full blur-[150px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 md:px-16 py-10 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center font-bold text-white shadow-glow group-hover:scale-110 transition-transform duration-500 border border-white/10">
            <Sparkles size={28} />
          </div>
          <span className="font-display font-black text-3xl text-white tracking-tighter uppercase">Lingua<span className="shimmer-text">Quest</span></span>
        </div>
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/login" className="text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest transition-colors hidden md:block">Login Protocol</Link>
          <Link to="/register" className="glass-card px-8 py-4 bg-white/5 hover:bg-primary-500 text-white text-xs font-black uppercase tracking-widest border border-white/10 hover:border-primary-400 transition-all shadow-premium group">
            Initiate Quest <ArrowRight size={14} className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-8 pt-24 pb-40 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-8 py-3 mb-12 text-[10px] font-black text-primary-400 shadow-premium backdrop-blur-xl uppercase tracking-[0.2em]"
        >
          <Cpu size={14} className="animate-pulse" /> Neural Processing: Active • High Fidelity Mode
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-6xl sm:text-8xl md:text-[11rem] font-black text-white leading-[0.85] mb-12 tracking-tighter"
        >
          SYNC YOUR<br />
          <span className="shimmer-text">POTENTIAL</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-xl md:text-3xl text-slate-400 max-w-4xl mx-auto mb-16 font-medium leading-relaxed"
        >
          Master the global language through immersive AI operations, neural feedback loops, and tactical linguistic challenges.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-8 justify-center items-center"
        >
          <Link to="/register" className="btn-primary text-sm font-black uppercase tracking-widest px-12 py-6 group shadow-premium scale-110">
            Join the Hierarchy <ArrowRight size={18} className="inline-block ml-3 group-hover:translate-x-2 transition-transform" />
          </Link>
          <button className="flex items-center gap-4 text-white font-black text-xs uppercase tracking-[0.3em] group hover:text-primary-400 transition-colors">
            <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary-500/10 transition-all">
               <Play size={20} className="fill-white group-hover:fill-primary-400" />
            </div>
            Watch Intelligence Demo
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-6xl mx-auto mt-40 pt-20 border-t border-white/5"
        >
          {rawStats.map(s => <AnimatedStat key={s.label} {...s} />)}
        </motion.div>
      </section>

      {/* Features Showcase */}
      <section className="py-40 relative z-10">
        <SectionHeader 
          title="Architected for Mastery" 
          subtitle="Every module is engineered to synchronize your cognitive pathways with linguistic excellence."
          tag="TACTICAL CAPABILITIES"
        />
        <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div 
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-12 group hover:scale-[1.03] transition-all duration-700 relative overflow-hidden bg-dark-900/20 border-white/5"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
              <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-3xl flex items-center justify-center mb-10 shadow-premium group-hover:rotate-12 transition-transform duration-500`}>
                <Icon size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-display font-black text-white mb-6 tracking-tight uppercase">{title}</h3>
              <p className="text-slate-500 text-lg leading-relaxed font-medium group-hover:text-slate-400 transition-colors">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Intelligence Visualization */}
      <section className="py-40 relative z-10 bg-dark-900/10">
        <div className="max-w-[1400px] mx-auto px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                 <SectionHeader 
                   title="Neural Loop Analysis" 
                   subtitle="Experience real-time intelligence that adapts to your unique linguistic signature."
                   centered={false}
                   tag="INTELLIGENCE CORE"
                 />
                 <div className="space-y-8">
                    {MODULE_PREVIEW.map((mod, i) => (
                       <button 
                         key={mod.label} 
                         onClick={() => setActiveMod(i)}
                         className={`w-full flex items-center justify-between p-8 rounded-[2rem] border transition-all duration-500 ${activeMod === i ? 'bg-primary-500/10 border-primary-500/30' : 'bg-white/2 bg-transparent border-white/5 hover:border-white/10'}`}
                       >
                          <div className="flex items-center gap-6">
                             <div className={`w-12 h-12 rounded-xl bg-dark-950 flex items-center justify-center text-2xl shadow-inner`}>{mod.icon}</div>
                             <span className={`text-xl font-black uppercase tracking-widest ${activeMod === i ? 'text-white' : 'text-slate-500'}`}>{mod.label}</span>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] ${activeMod === i ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-700'}`}>
                             {mod.badge}
                          </div>
                       </button>
                    ))}
                 </div>
              </div>

              <div className="relative group">
                 <div className="absolute inset-0 bg-primary-500/20 blur-[120px] rounded-full group-hover:scale-110 transition-transform duration-1000" />
                 <div className="glass-card p-2 bg-gradient-to-br from-primary-500/20 to-transparent border-white/5 overflow-hidden shadow-premium">
                    <div className="bg-dark-950/80 backdrop-blur-3xl rounded-[2.8rem] p-12 aspect-square flex flex-col justify-between">
                       <div className="flex items-center justify-between mb-12">
                          <div className="flex items-center gap-4">
                             <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse shadow-glow" />
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Interface v2.0</span>
                          </div>
                          <Terminal size={20} className="text-primary-500" />
                       </div>

                       <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10">
                          <AnimatePresence mode="wait">
                             <motion.div 
                               key={activeMod}
                               initial={{ opacity: 0, scale: 0.9 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0, scale: 1.1 }}
                               className="space-y-8"
                             >
                                <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-[10px] border-white/5 flex items-center justify-center relative mx-auto`}>
                                   <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.1]" viewBox="0 0 160 160">
                                      <motion.circle 
                                        initial={{ strokeDasharray: "0, 440" }}
                                        animate={{ strokeDasharray: `${(MODULE_PREVIEW[activeMod].score / 100) * 440}, 440` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" 
                                        className="text-primary-500 shadow-glow" strokeLinecap="round" 
                                      />
                                   </svg>
                                   <span className="text-5xl md:text-7xl font-display font-black text-white">{MODULE_PREVIEW[activeMod].score}%</span>
                                </div>
                                <h4 className="text-2xl font-display font-black text-white uppercase tracking-[0.4em]">{MODULE_PREVIEW[activeMod].label} SYNC</h4>
                             </motion.div>
                          </AnimatePresence>
                       </div>

                       <div className="grid grid-cols-2 gap-6 mt-12">
                          <div className="p-6 rounded-2xl bg-white/2 border border-white/5">
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Fluency Threshold</p>
                             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div animate={{ width: '85%' }} className="h-full bg-primary-500 shadow-glow" />
                             </div>
                          </div>
                          <div className="p-6 rounded-2xl bg-white/2 border border-white/5">
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Cognitive Load</p>
                             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div animate={{ width: '40%' }} className="h-full bg-accent-emerald shadow-glow" />
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Trust & Testimonials */}
      <section className="py-40 relative z-10 border-y border-white/5">
         <SectionHeader 
           title="The Elite Opinion" 
           subtitle="Join a global community of specialists achieving peak linguistic performance."
           tag="SYNC LOGS"
         />
         <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((t, i) => (
               <motion.div 
                 key={t.name}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="glass-card p-12 bg-dark-900/10 border-white/5 flex flex-col justify-between hover:bg-dark-900/30 transition-all duration-700"
               >
                  <div className="space-y-8">
                     <div className="flex gap-2">
                        {[...Array(t.stars)].map((_, j) => <Star key={j} size={16} className="text-accent-amber fill-accent-amber drop-shadow-glow" />)}
                     </div>
                     <p className="text-xl text-slate-300 italic leading-relaxed font-medium">"{t.text}"</p>
                  </div>
                  <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/5">
                     <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center font-black text-white text-xl shadow-premium">{t.avatar}</div>
                     <div>
                        <h4 className="text-white font-black text-lg uppercase tracking-widest">{t.name}</h4>
                        <p className="text-primary-400 font-black text-[10px] uppercase tracking-[0.2em] mt-1">{t.role}</p>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </section>

      {/* Global Reach Bar */}
      <section className="py-24 bg-dark-950 overflow-hidden">
         <div className="flex whitespace-nowrap gap-24 animate-scroll opacity-20 hover:opacity-50 transition-opacity">
            {[...Array(10)].map((_, i) => (
               <div key={i} className="flex items-center gap-24 font-display font-black text-6xl text-white tracking-tighter uppercase">
                  <span>Elite Hierarchy</span>
                  <div className="w-4 h-4 bg-primary-500 rounded-full" />
                  <span>Neural Mastery</span>
                  <div className="w-4 h-4 bg-primary-500 rounded-full" />
                  <span>Global Synchronization</span>
                  <div className="w-4 h-4 bg-primary-500 rounded-full" />
               </div>
            ))}
         </div>
      </section>

      {/* CTA Final Protocol */}
      <section className="py-60 relative z-10 px-8">
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="max-w-6xl mx-auto glass-card p-24 text-center relative overflow-hidden bg-gradient-to-br from-primary-600/10 to-accent-indigo/10 border-white/10"
         >
           <div className="absolute inset-0 bg-mesh opacity-10" />
           <div className="relative z-10 space-y-12">
             <Trophy size={100} className="text-accent-amber mx-auto drop-shadow-glow animate-bounce" />
             <h2 className="text-5xl sm:text-7xl md:text-9xl font-display font-black text-white tracking-tighter uppercase leading-none">Ready for<br /><span className="shimmer-text">Synchronization?</span></h2>
             <p className="text-xl md:text-3xl text-slate-400 max-w-3xl mx-auto font-medium">Join 50,000+ operatives already optimizing their linguistic performance. The quest begins now.</p>
             <Link to="/register" className="btn-primary py-8 px-16 text-xs font-black uppercase tracking-[0.4em] group shadow-premium inline-flex items-center gap-6 scale-125 hover:scale-[1.3] transition-transform">
               Initiate Deployment 
               <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
             </Link>
           </div>
         </motion.div>
      </section>

      {/* Footer System */}
      <footer className="py-24 border-t border-white/5 relative z-10">
         <div className="max-w-[1600px] mx-auto px-16 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-premium">LQ</div>
              <span className="font-display font-black text-2xl text-white tracking-tight uppercase">LinguaQuest</span>
            </div>
            <p className="text-slate-600 text-[10px] font-black tracking-[0.4em] uppercase">© 2026 ARCHITECTED FOR EXCELLENCE • ALL SYSTEMS OPERATIONAL</p>
            <div className="flex gap-12 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              <a href="#" className="hover:text-primary-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Protocol</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Intelligence</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
