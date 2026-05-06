import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Writing from './pages/Writing';
import Listening from './pages/Listening';
import Reading from './pages/Reading'; // v2.0 Roadmap Ready
import Grammar from './pages/Grammar';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Vocabulary from './pages/Vocabulary';
import DailyChallenge from './pages/DailyChallenge';
import Conversation from './pages/Conversation';
import VerbalAbilityTest from './pages/VerbalAbilityTest';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 space-y-8">
      <div className="relative">
        <div className="w-24 h-24 border-[6px] border-white/5 rounded-full" />
        <div className="w-24 h-24 border-[6px] border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        <Brain size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-500 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
         <p className="text-2xl font-display font-bold text-white tracking-tight">Initializing LinguaQuest</p>
         <p className="text-slate-500 font-medium font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Neural Framework...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#030014',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '24px',
              padding: '16px 24px',
              fontSize: '14px',
              fontWeight: '600',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#030014' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#030014' } },
          }}
        />
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/writing" element={<Writing />} />
            <Route path="/listening" element={<Listening />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/grammar" element={<Grammar />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/challenge" element={<DailyChallenge />} />
            <Route path="/verbal-test" element={<VerbalAbilityTest />} />
            <Route path="/conversation" element={<Conversation />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/user/:username" element={<PublicProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
