import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, PenTool, Headphones, BookOpen, Brain, Target,
  CheckSquare, Trophy, User, LogOut, Zap, Flame, Coins, MessageCircle
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
    <div className="flex h-screen overflow-hidden bg-dark-900">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col glass-card rounded-none border-r border-white/5
        transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-purple rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-primary-500/30">
                LQ
              </div>
              <div>
                <h1 className="font-display font-bold text-white text-lg leading-none">LinguaQuest</h1>
                <p className="text-xs text-slate-500 mt-0.5">Master English</p>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="p-4 mx-3 mt-3 glass-card bg-gradient-to-br from-primary-500/10 to-accent-purple/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-purple rounded-full flex items-center justify-center text-sm font-bold text-white">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{user?.username}</p>
                <p className="text-xs text-slate-400">Level {user?.level || 1}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="xp-badge"><Zap size={10} />{user?.xp || 0} XP</span>
              <span className="streak-badge"><Flame size={10} />{user?.streak || 0}</span>
              <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                <Coins size={10} />{user?.coins || 0}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>XP Progress</span>
                <span>{user?.xp || 0}/{xpForNextLevel}</span>
              </div>
              <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-purple rounded-full progress-bar"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="p-3 flex flex-col gap-1 mt-2">
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} relative`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="text-xs bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-white/5 shrink-0 bg-dark-900/50">
          <button
            onClick={handleLogout}
            className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-dark-800/80 backdrop-blur sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white" />
          </button>
          <span className="font-display font-bold text-white">LinguaQuest</span>
          <div className="xp-badge"><Zap size={12} />{user?.xp || 0}</div>
        </div>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
