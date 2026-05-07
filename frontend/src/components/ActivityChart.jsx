import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export default function ActivityChart({ history }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  const weekData = days.map((day, i) => ({ day, value: 20 + Math.random() * 80, isToday: i === today }));

  return (
    <div className="glass-card p-6 md:p-8 border-white/5 bg-dark-900/40">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-3">
          <BarChart3 size={20} className="text-primary-400" /> Weekly Activity
        </h2>
      </div>

      <div className="flex items-end justify-between h-48 gap-2 md:gap-4 px-2">
        {weekData.map((d, i) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-4 group">
            <div className="w-full relative flex items-end justify-center h-full">
               <motion.div
                 initial={{ height: 0 }}
                 animate={{ height: `${d.value}%` }}
                 className={`w-full max-w-[32px] rounded-t-xl transition-all duration-500 ${d.isToday ? 'bg-gradient-to-t from-primary-600 to-primary-400 shadow-glow' : 'bg-white/5 group-hover:bg-white/10'}`}
               />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${d.isToday ? 'text-primary-400' : 'text-slate-600'}`}>
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
