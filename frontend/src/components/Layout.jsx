import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PenTool, Headphones, BookOpen, Brain, Target,
  CheckSquare, Trophy, User, LogOut, Zap, Flame, Coins, MessageCircle,
  ChevronRight, Menu, X, Sparkles, Bell, Settings, Search
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Control Center' },
  { to: '/challenge', icon: Target, label: 'Daily Mission' },
  { to: '/conversation', icon: MessageCircle, label: 'Neural Chat', badge: 'AI' },
  { to: '/vocabulary', icon: Brain, label: 'Lexicon' },
  { to: '/verbal-test', icon: Sparkles, label: 'Verbal Arena', badge: 'PRO' },
  { to: '/writing', icon: PenTool, label: 'Writing Lab' },
  { to: '/listening', icon: Headphones, label: 'Audio Sync' },
  { to: '/reading', icon: BookOpen, label: 'Data Streams' },
  { to: '/grammar', icon: CheckSquare, label: 'Logic Kernel' },
  { to: '/leaderboard', icon: Trophy, label: 'Hierarchy' },
  { to: '/profile', icon: User, label: 'Linguistic ID' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const main = document.getElementById('main-content-scroll');
    const handleScroll = () => setScrolled(main.scrollTop > 20);
    main?.addEventListener('scroll', handleScroll);
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  const xpForNextLevel = (user?.level || 1) * (user?.level || 1) * 100;
  const xpProgress = user ? Math.min(100, (user.xp % xpForNextLevel) / xpForNextLevel * 100) : 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950 text-slate-100 selection:bg-primary-500/30 font-body relative">
      {/* Background Mesh */}
      <div className="fixed inset-0 bg-mesh opacity-40 pointer-events-none" />

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-dark-950/90 backdrop-blur-md lg:hidden" 
            onClick={() => setMobileOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-80 flex flex-col bg-dark-900/40 backdrop-blur-3xl border-r border-white/5
        transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:relative lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}
        ${mobileOpen ? 'shadow-[40px_0_100px_rgba(0,0,0,0.8)]' : ''}
      `}>
        {/* Logo Section */}
        <div className="p-10 pb-6">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-[1.2rem] flex items-center justify-center font-bold text-white shadow-glow group-hover:rotate-12 transition-transform duration-500">
              <Sparkles size={28} />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl text-white tracking-tighter">LinguaQuest</h1>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                 <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-black">Core Intelligence</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4">
          {/* Enhanced User Identity Card */}
          <div className="mb-10 p-1 glass-card border-white/5 bg-dark-950/40 group overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
             <div className="p-6 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-14 h-14 bg-gradient-to-br from-dark-800 to-dark-950 rounded-2xl flex items-center justify-center text-xl font-black text-white border border-white/5 shadow-inner">
                      {user?.username?.[0]?.toUpperCase()}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-lg tracking-tight truncate">{user?.username}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[8px] font-black uppercase tracking-widest text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-md border border-primary-500/20">Tier {user?.level || 1}</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-accent-rose bg-accent-rose/10 px-2 py-0.5 rounded-md border border-accent-rose/20">{user?.streak || 0}D Streak</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>Sync Progress</span>
                      <span className="text-white">{user?.xp || 0} XP</span>
                   </div>
                   <div className="h-2 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full shadow-glow"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pb-10">
            <p className="px-5 text-[9px] uppercase tracking-[0.3em] text-slate-600 font-black mb-6">Tactical Domains</p>
            {navItems.map(({ to, icon: Icon, label, badge }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, ease: "easeOut" }}
              >
                <NavLink
                  to={to}
                  className={({ isActive }) => `
                    flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative
                    ${isActive 
                      ? 'bg-primary-500 text-white shadow-glow border border-primary-400/50' 
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'}
                  `}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                  <span className="flex-1 font-bold text-sm tracking-tight">{label}</span>
                  {badge && (
                    <span className={`text-[8px] font-black px-2 py-1 rounded-md shadow-lg ${to.includes('conversation') ? 'bg-accent-rose' : 'bg-primary-400'} text-white`}>
                      {badge}
                    </span>
                  )}
                  <ChevronRight size={14} className={`transition-all duration-500 ${mobileOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-white/5 bg-dark-900/40 backdrop-blur-3xl">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-500 font-black group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors shrink-0">
              <LogOut size={20} />
            </div>
            <span className="text-xs uppercase tracking-widest">Abort Mission</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-dark-950 relative">
        {/* Cinematic Header */}
        <header className={`
          flex items-center justify-between px-8 py-6 sticky top-0 z-[40] transition-all duration-500
          ${scrolled ? 'bg-dark-950/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}
        `}>
          <div className="flex items-center gap-6">
             <button 
               onClick={() => setMobileOpen(true)} 
               className="lg:hidden w-12 h-12 rounded-[1rem] bg-white/5 flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-all"
             >
               <Menu size={24} />
             </button>
             <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-5 py-2.5 text-slate-500 hover:border-white/20 transition-all cursor-text group">
                <Search size={16} className="group-hover:text-white transition-colors" />
                <span className="text-xs font-bold">Search Nexus...</span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-6 mr-4 hidden sm:flex">
                <div className="flex flex-col items-end">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Wallet</p>
                   <div className="flex items-center gap-2">
                      <Coins size={14} className="text-accent-amber" />
                      <span className="text-sm font-black text-white">{user?.coins || 0}</span>
                   </div>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="flex flex-col items-end">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Streak</p>
                   <div className="flex items-center gap-2">
                      <Flame size={14} className="text-accent-rose" />
                      <span className="text-sm font-black text-white">{user?.streak || 0}D</span>
                   </div>
                </div>
             </div>
             
             <button className="w-12 h-12 rounded-[1rem] bg-white/5 flex items-center justify-center text-slate-400 hover:text-white border border-white/10 relative group transition-all">
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-primary-500 rounded-full border-2 border-dark-900 shadow-glow" />
             </button>
             <button 
               onClick={() => navigate('/profile')}
               className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-primary-500 to-primary-700 p-[1px] shadow-glow hover:scale-105 transition-transform"
             >
                <div className="w-full h-full bg-dark-950 rounded-[0.95rem] flex items-center justify-center font-black text-white text-sm">
                   {user?.username?.[0]?.toUpperCase()}
                </div>
             </button>
          </div>
        </header>

        {/* Page Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10" id="main-content-scroll">
          <div className="content-container min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
