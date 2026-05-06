import { motion } from "motion/react";
import { Droplets, Plus, Minus } from "lucide-react";

interface WaterTrackerProps {
  current: number;
  goal: number;
  onUpdate: (val: number) => void;
}

export function WaterTracker({ current, goal, onUpdate }: WaterTrackerProps) {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div className="glass-card flex flex-col items-center justify-center gap-6 py-10 relative overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-2 text-blue-400">
        <Droplets className="w-5 h-5" />
        <span className="font-display font-semibold">Water</span>
      </div>

      <div className="relative w-32 h-48 border-4 border-white/20 rounded-b-[40px] rounded-t-xl sm:w-40 sm:h-56">
        {/* Water fill animation */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          className="absolute bottom-0 left-0 right-0 bg-blue-500/60 transition-all duration-1000 ease-out flex items-center justify-center overflow-hidden"
          style={{ borderRadius: percentage > 90 ? '0 0 36px 36px' : '0 0 36px 36px' }}
        >
          {/* Wave effect */}
          <motion.div 
            animate={{ x: [-20, 20, -20] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-0 w-[200%] h-4 bg-blue-400/30 blur-sm"
          />
        </motion.div>
        
        {/* Goal line */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <span className="text-3xl font-display font-bold leading-none">{current}</span>
          <span className="text-xs text-blue-200 mt-1 uppercase tracking-widest font-medium opacity-70">ml</span>
        </div>
      </div>

      <div className="flex items-center gap-8 z-10">
        <button 
          onClick={() => onUpdate(Math.max(0, current - 250))}
          className="p-3 glass rounded-2xl hover:bg-white/10 transition-all text-blue-300"
        >
          <Minus className="w-6 h-6" />
        </button>
        <div className="text-center">
          <div className="text-sm font-medium text-blue-200/60 uppercase">Goal</div>
          <div className="font-bold">{goal} ml</div>
        </div>
        <button 
          onClick={() => onUpdate(current + 250)}
          className="p-3 glass rounded-2xl hover:bg-white/10 transition-all text-blue-400 glow"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
