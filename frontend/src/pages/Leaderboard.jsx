import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trophy, Zap, Flame, Crown, Medal, Star, TrendingUp, TrendingDown, Swords, Minus, Calendar, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PERIODS = [
  { id: 'all', label: 'All Time' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' }
];

const MODULES = [
  { id: 'all', label: 'Overall' },
  { id: 'writing', label: 'Writing' },
  { id: 'listening', label: 'Listening' },
  { id: 'reading', label: 'Reading' },
  { id: 'grammar', label: 'Grammar' }
];

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [module, setModule] = useState('all');
  const [challenging, setChallenging] = useState(null);
  
  const { user } = useAuth();
  const myRowRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, module]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: res } = await axios.get(`/api/leaderboard?period=${period}&module=${module}`);
      setData(res);
      
      // Auto-scroll logic if user is found and not at the top
      setTimeout(() => {
        if (myRowRef.current) {
          const rect = myRowRef.current.getBoundingClientRect();
          if (rect.top > window.innerHeight) {
            myRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 500);
    } catch {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = async (opponent) => {
    if (challenging) return;
    setChallenging(opponent.userId);
    try {
      await axios.post(`/api/leaderboard/challenge/${opponent.userId}`);
      toast.success(`Challenge sent to ${opponent.username}! ⚔️`);
    } catch {
      toast.error('Failed to send challenge');
    } finally {
      setChallenging(null);
    }
  };

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown size={18} className="text-yellow-400" />;
    if (rank === 2) return <Medal size={18} className="text-slate-300" />;
    if (rank === 3) return <Medal size={18} className="text-amber-600" />;
    return <span className="text-sm font-bold text-slate-500">#{rank}</span>;
  };

  const rankBg = (rank, isCurrent) => {
    if (isCurrent) return 'border-primary-500/40 bg-primary-500/5';
    if (rank === 1) return 'border-yellow-500/30 bg-yellow-500/5';
    if (rank === 2) return 'border-slate-400/30 bg-slate-400/5';
    if (rank === 3) return 'border-amber-600/30 bg-amber-600/5';
    return 'border-white/5';
  };

  const RankChangeIcon = ({ change }) => {
    if (change > 0) return <span className="flex items-center text-xs font-bold text-green-400"><TrendingUp size={12} className="mr-0.5" />{change}</span>;
    if (change < 0) return <span className="flex items-center text-xs font-bold text-red-400"><TrendingDown size={12} className="mr-0.5" />{Math.abs(change)}</span>;
    return <span className="flex items-center text-xs text-slate-600"><Minus size={12} /></span>;
  };

  const myRank = data.find(u => u.isCurrentUser);
  const hallOfFame = data.filter(u => u.level >= 10);

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
          <Trophy size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Global Leaderboard</h1>
          <p className="text-slate-400 text-sm">Compete with top English learners worldwide</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-8 space-y-4">
        <div>
          <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider flex items-center gap-1.5"><Calendar size={12} /> Time Period</p>
          <div className="flex bg-dark-700/50 p-1 rounded-xl">
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${period === p.id ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider flex items-center gap-1.5"><LayoutGrid size={12} /> Practice Module</p>
          <div className="flex flex-wrap gap-2">
            {MODULES.map(m => (
              <button key={m.id} onClick={() => setModule(m.id)}
                className={`flex-1 min-w-[80px] py-2 px-3 text-xs rounded-xl border transition-all ${module === m.id ? 'bg-primary-500/20 border-primary-500/40 text-primary-400 font-bold' : 'border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/5'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hall of Fame */}
      {period === 'all' && module === 'all' && hallOfFame.length > 0 && !loading && (
        <div className="mb-8">
          <h2 className="text-lg font-display font-bold text-yellow-500 mb-3 flex items-center gap-2"><Crown size={18} /> Hall of Fame (Level 10+)</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {hallOfFame.map(u => (
              <div key={u.username} className="glass-card p-3 min-w-[120px] flex flex-col items-center border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-sm font-bold text-white mb-2 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                  {u.username[0]?.toUpperCase()}
                </div>
                <p className="text-xs font-bold text-white max-w-[100px] truncate">{u.country} {u.username}</p>
                <p className="text-[10px] text-yellow-400 font-bold mt-1">LVL {u.level}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your Rank Highlight */}
      {myRank && (
        <div className="glass-card p-4 mb-6 bg-gradient-to-r from-primary-500/10 to-accent-purple/10 border-primary-500/30 sticky top-4 z-20 backdrop-blur-xl shadow-2xl">
          <p className="text-[10px] uppercase font-bold tracking-wider text-primary-400 mb-2">Your Current Position</p>
          <div className="flex items-center gap-3">
            <div className="w-8 flex items-center justify-center shrink-0">{rankIcon(myRank.rank)}</div>
            <div className="flex-1">
              <span className="font-bold text-white flex items-center gap-1.5">{myRank.country} {myRank.username}</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-400">Rank #{myRank.rank}</span>
                <RankChangeIcon change={myRank.rankChange} />
              </div>
            </div>
            <div className="flex gap-2 text-sm shrink-0">
              <span className="xp-badge"><Zap size={10} />{myRank.xp}</span>
            </div>
          </div>
        </div>
      )}

      {/* Full List */}
      {loading ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-400 animate-pulse">Computing global rankings...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map(user => {
            const isMe = user.isCurrentUser;
            return (
              <div
                key={user.username}
                ref={isMe ? myRowRef : null}
                className={`glass-card p-4 flex items-center gap-3 transition-all group ${rankBg(user.rank, isMe)} ${isMe ? 'ring-1 ring-primary-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'hover:border-white/20'}`}
              >
                {/* Rank & Change */}
                <div className="w-10 flex flex-col items-center justify-center shrink-0 gap-1">
                  {rankIcon(user.rank)}
                  <RankChangeIcon change={user.rankChange} />
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : user.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : user.rank === 3 ? 'bg-gradient-to-br from-amber-500 to-amber-700' : 'bg-gradient-to-br from-primary-500 to-accent-purple'}`}>
                  {user.username[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm truncate">{user.country} {user.username}</span>
                    {isMe && <span className="text-[10px] text-primary-400 bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">You</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">Lv {user.level}</span>
                    <span className="text-xs text-slate-500">{user.totalActivities} {module !== 'all' ? module : 'total'} exercises</span>
                    {user.streak > 0 && (
                      <span className="text-xs font-bold text-orange-400 flex items-center gap-0.5 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20"><Flame size={10} />{user.streak}</span>
                    )}
                  </div>
                </div>

                {/* Challenge Button (Hover) */}
                {!isMe && (
                  <button onClick={() => handleChallenge(user)} disabled={challenging === user.userId}
                    className="opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0"
                    title={`Challenge ${user.username}`}>
                    {challenging === user.userId ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Swords size={14} />}
                  </button>
                )}

                {/* XP */}
                <div className="text-right shrink-0 ml-2">
                  <div className="xp-badge text-sm font-bold shadow-lg"><Zap size={14} />{user.xp}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data.length === 0 && !loading && (
        <div className="glass-card p-12 text-center">
          <Trophy size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2">No rankings found</h3>
          <p className="text-slate-400 text-sm">Be the first to earn XP in this category!</p>
        </div>
      )}
    </div>
  );
}
