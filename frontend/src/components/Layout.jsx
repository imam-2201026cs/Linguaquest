import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PenTool, Headphones, BookOpen, Brain, Target,
  CheckSquare, Trophy, User, LogOut, Zap, Flame, Coins, MessageCircle,
  ChevronRight, Menu, X, Sparkles
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/challenge', icon: Target, label: 'Daily Challenge' },
  { to: '/conversation', icon: MessageCircle, label: 'AI Conversation', badge: 'NEW' },
  { to: '/vocabulary', icon: Brain, label: 'Vocabulary' },
  { to: '/verbal-test', icon: CheckSquare, label: 'Verbal Ability', badge: 'PRO' },
  { to: '/writing', icon: PenTool, label: 'Writing' },
  { to: '/listening', icon: Headphones, label: 'Listening' },
  { to: '/reading', icon: BookOpen, label: 'Reading' },
  { to: '/grammar', icon: CheckSquare, label: 'Grammar' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const xpForNextLevel = (user?.level || 1) * (user?.level || 1) * 100;
  const xpProgress = user ? Math.min(100, (user.xp % xpForNextLevel) / xpForNextLevel * 100) : 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950 text-slate-100 selection:bg-primary-500/30 max-w-[2000px] mx-auto relative border-x border-white/5 shadow-2xl">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-dark-950/80 backdrop-blur-sm lg:hidden" 
            onClick={() => setMobileOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-dark-900/50 backdrop-blur-3xl border-r border-white/5
        transform transition-all duration-500 ease-in-out lg:relative lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}
        ${mobileOpen ? 'shadow-[0_0_50px_rgba(0,0,0,0.5)]' : ''}
      `}>
        {/* Logo */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center font-bold text-white shadow-glow group-hover:rotate-12 transition-transform duration-500">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-white tracking-tight">LinguaQuest</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Personal Tutor</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4">
          {/* User Progress Card */}
          <div className="mb-8 p-6 glass-card border-white/10 bg-gradient-to-br from-primary-500/10 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-lg">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-base truncate">{user?.username}</p>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                   <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Level {user?.level || 1}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-6 relative z-10">
              <div className="bg-dark-950/50 rounded-xl px-3 py-1.5 flex items-center gap-1.5 border border-white/5">
                <Zap size={12} className="text-primary-400" />
                <span className="text-xs font-black text-white">{user?.xp || 0}</span>
              </div>
              <div className="bg-dark-950/50 rounded-xl px-3 py-1.5 flex items-center gap-1.5 border border-white/5">
                <Flame size={12} className="text-accent-rose" />
                <span className="text-xs font-black text-white">{user?.streak || 0}</span>
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                <span>Next Milestone</span>
                <span className="text-primary-400">{user?.xp || 0} / {xpForNextLevel}</span>
              </div>
              <div className="h-2 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5 pb-8">
            <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 font-black mb-4">Training Grounds</p>
            {navItems.map(({ to, icon: Icon, label, badge }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <NavLink
                  to={to}
                  className={({ isActive }) => `
                    flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                    ${isActive 
                      ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-glow' 
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'}
                  `}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={20} className={`${to === '/dashboard' ? 'text-primary-400' : ''}`} />
                  <span className="flex-1 font-bold text-sm tracking-tight">{label}</span>
                  {badge && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-primary-500 text-white shadow-glow">
                      {badge}
                    </span>
                  )}
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transition-transform" />
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-6 border-t border-white/5 bg-dark-900/80 backdrop-blur-xl">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 font-bold text-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
              <LogOut size={20} />
            </div>
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-dark-950 relative overflow-hidden">
        {/* Ambient Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-indigo/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl sticky top-0 z-30">
          <button 
            onClick={() => setMobileOpen(true)} 
            className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/10"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-white text-xs">LQ</div>
            <span className="font-display font-bold text-white text-lg">LinguaQuest</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20">
            <Zap size={18} />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
          <div className="content-container">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
