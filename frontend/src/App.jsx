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

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-body">Loading LinguaQuest...</p>
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
              background: '#141d35',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#141d35' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#141d35' } },
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
