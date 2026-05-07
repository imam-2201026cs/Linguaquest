import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export default function WeeklyChart({ history }) {
  // Simple logic to aggregate XP by day
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  const weekData = days.map((day, i) => {
    // This is just a visual placeholder for the chart
    // Real logic would filter history by date
    const value = 20 + Math.random() * 80; 
    return { day, value, isToday: i === today };
  });

  return (
    <div className="glass-card p-6 md:p-8 border-white/5 bg-dark-900/40">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-3">
          <BarChart3 size={18} md:size={20} className="text-primary-400" /> Weekly Activity
        </h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">XP Earned</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between h-48 gap-2 md:gap-4 px-2">
        {weekData.map((d, i) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-4 group">
            <div className="w-full relative flex items-end justify-center h-full">
               <motion.div
                 initial={{ height: 0 }}
                 animate={{ height: `${d.value}%` }}
                 transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                 className={`w-full max-w-[32px] rounded-t-xl transition-all duration-500 ${d.isToday ? 'bg-gradient-to-t from-primary-600 to-primary-400 shadow-glow' : 'bg-white/5 group-hover:bg-white/10'}`}
               />
               {d.isToday && (
                  <div className="absolute -top-8 bg-primary-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-glow">
                     {Math.round(d.value * 12)}
                  </div>
               )}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${d.isToday ? 'text-primary-400' : 'text-slate-600'}`}>
              {d.day}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
         <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Average Daily</p>
            <p className="text-2xl font-black text-white">842 <span className="text-xs text-primary-400">XP</span></p>
         </div>
         <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weekly Total</p>
            <p className="text-2xl font-black text-white">5,894 <span className="text-xs text-primary-400">XP</span></p>
         </div>
      </div>
    </div>
  );
}
