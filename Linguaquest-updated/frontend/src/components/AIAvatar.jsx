import React from 'react';

export default function AIAvatar({ isThinking, isSpeaking, avatarUrl }) {
  return (
    <div className="relative group">
      {/* Outer Glow Ring */}
      <div className={`
        absolute -inset-4 rounded-full opacity-20 blur-2xl transition-all duration-1000
        ${isSpeaking ? 'bg-primary-500 scale-110 opacity-40 animate-pulse' : 
          isThinking ? 'bg-accent-purple animate-ping opacity-30' : 'bg-primary-400 opacity-10'}
      `} />

      {/* Name Tag */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
        <div className={`
          flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500 backdrop-blur-md
          ${isSpeaking ? 'bg-primary-500/20 border-primary-500/50 text-primary-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-dark-800/80 border-white/10 text-slate-500'}
        `}>
          <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-primary-400 animate-pulse' : isThinking ? 'bg-accent-purple animate-ping' : 'bg-slate-600'}`} />
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase">
            {isThinking ? 'Processing...' : isSpeaking ? 'Transmitting' : 'Link Stable'}
          </span>
        </div>
      </div>

      {/* Main Avatar Container */}
      <div className={`
        relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 transition-all duration-500 z-10
        ${isSpeaking ? 'border-primary-400 shadow-[0_0_40px_rgba(59,130,246,0.4)] scale-105' : 
          isThinking ? 'border-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-white/10 shadow-2xl'}
      `}>
        {/* The AI Face Image */}
        <img 
          src={avatarUrl || "/ai-avatar-placeholder.png"} 
          alt="AI Face" 
          className={`w-full h-full object-cover transition-transform duration-700 ${isSpeaking ? 'scale-110' : 'scale-100'}`}
        />

        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1/2 w-full animate-scanline pointer-events-none" />
      </div>

      {/* Voice Visualizer (only when speaking) */}
      {isSpeaking && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-1.5 h-10 px-4 z-20">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="w-1.5 bg-primary-400 rounded-full animate-voice-bar shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ 
                height: `${30 + Math.random() * 70}%`,
                animationDelay: `${i * 0.12}s`,
                animationDuration: `${0.4 + Math.random() * 0.3}s`
              }} 
            />
          ))}
        </div>
      )}

      {/* Holographic Base / Floor */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-primary-500/20 blur-xl rounded-full transition-all duration-500" 
           style={{ transform: `translateX(-50%) scale(${isSpeaking ? 1.5 : 1})`, opacity: isThinking || isSpeaking ? 0.6 : 0.2 }} />
      
      <div className={`
        absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 border-b border-primary-500/40 blur-[1px] transition-all duration-500
        ${isSpeaking ? 'opacity-100 scale-125' : 'opacity-0 scale-50'}
      `} />
    </div>
  );
}
