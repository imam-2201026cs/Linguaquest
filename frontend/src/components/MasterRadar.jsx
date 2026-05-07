import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function MasterRadar({ stats }) {
  const data = [
    { label: 'Grammar', value: stats?.grammar || 75 },
    { label: 'Vocab', value: stats?.vocabulary || 80 },
    { label: 'Listening', value: stats?.listening || 65 },
    { label: 'Writing', value: stats?.writing || 70 },
    { label: 'Fluency', value: stats?.fluency || 85 },
  ];

  const size = 280;
  const center = size / 2;
  const radius = center * 0.7;
  const angleStep = (Math.PI * 2) / data.length;

  const points = data.map((d, i) => {
    const r = (d.value / 100) * radius;
    const x = center + r * Math.sin(i * angleStep);
    const y = center - r * Math.cos(i * angleStep);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="glass-card p-6 md:p-8 border-white/5 bg-dark-900/40 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-white flex items-center gap-3">
          <Target size={18} className="text-primary-400" /> Neural Profile
        </h3>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Skill Matrix</span>
      </div>

      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {[0.2, 0.4, 0.6, 0.8, 1].map((lvl, i) => (
            <polygon
              key={i}
              points={data.map((_, idx) => {
                const r = radius * lvl;
                const x = center + r * Math.sin(idx * angleStep);
                const y = center - r * Math.cos(idx * angleStep);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}
          <motion.polygon
            points={points}
            fill="rgba(139, 92, 246, 0.2)"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinejoin="round"
            className="shadow-glow"
          />
          {data.map((d, i) => {
            const labelRadius = radius + 25;
            const x = center + labelRadius * Math.sin(i * angleStep);
            const y = center - labelRadius * Math.cos(i * angleStep);
            return (
              <text key={i} x={x} y={y} fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="900" textAnchor="middle" className="uppercase tracking-widest">
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
