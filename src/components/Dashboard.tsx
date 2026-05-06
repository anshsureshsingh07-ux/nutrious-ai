import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Droplets, Footprints, TrendingUp, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserProfile } from '../lib/firebase';
import { AnimatedCounter } from './AnimatedCounter';
import { WaterTracker } from './WaterTracker';
import { cn } from '../lib/utils';

// Mock data for the chart if no real data yet
const mockChartData = [
  { name: 'Mon', calories: 1800, water: 1500, steps: 8000 },
  { name: 'Tue', calories: 2100, water: 2000, steps: 12000 },
  { name: 'Wed', calories: 1900, water: 1800, steps: 7500 },
  { name: 'Thu', calories: 2300, water: 2500, steps: 11000 },
  { name: 'Fri', calories: 1700, water: 2200, steps: 9000 },
  { name: 'Sat', calories: 2500, water: 3000, steps: 15000 },
  { name: 'Sun', calories: 2000, water: 2000, steps: 10000 },
];

export default function Dashboard({ user, profile }: { user: any, profile: UserProfile }) {
  const today = new Date().toISOString().split('T')[0];
  const [todayStats, setTodayStats] = useState({
    caloriesConsumed: 1250,
    caloriesBurned: 350,
    waterIntake: 1500,
    steps: 6420,
    date: today,
    updatedAt: new Date()
  });

  const updateWater = (val: number) => {
    setTodayStats(prev => ({
      ...prev,
      waterIntake: val,
      updatedAt: new Date()
    }));
  };

  if (!user || !profile) return null;

  if (!todayStats) return (
    <div className="h-40 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-bold text-white"
          >
            Hi, {profile.displayName?.split(' ')[0] || 'User'}! 🌸
          </motion.h2>
          <p className="text-gray-400">Miyamura and the gang are rooting for you today!</p>
        </div>
        <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2 text-sm text-gray-300">
          <Calendar className="w-4 h-4 text-purple-400" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calories Card */}
        <StatCard 
          icon={<Flame className="text-blue-500" />}
          label="Calories"
          value={todayStats.caloriesConsumed}
          goal={profile.calorieGoal}
          unit="kcal"
          color="blue"
          loading={!todayStats}
        />
        
        {/* Steps Card */}
        <StatCard 
          icon={<Footprints className="text-sky-500" />}
          label="Steps"
          value={todayStats.steps}
          goal={profile.stepGoal}
          unit="steps"
          color="sky"
          loading={!todayStats}
        />

        {/* Burned Card */}
        <StatCard 
          icon={<TrendingUp className="text-indigo-500" />}
          label="Burned"
          value={todayStats.caloriesBurned}
          goal={500} // Custom goal
          unit="kcal"
          color="indigo"
          loading={!todayStats}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Weekly Performance
              </h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" /> Intake
                </span>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff40" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff40" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `${val/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 15, 25, 0.95)', 
                      borderRadius: '16px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCal)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Diet Plans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold">Recommended Plans</h3>
              <div className="flex gap-2">
                <div className="w-8 h-1 bg-white/20 rounded-full" />
                <div className="w-4 h-1 bg-white/5 rounded-full" />
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              <DietPlanCard 
                title="Mediterranean Blast" 
                calories={650} 
                protein="25g" 
                image="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400"
                tags={['Balanced', 'Fresh']}
              />
              <DietPlanCard 
                title="High Protein Keto" 
                calories={520} 
                protein="40g" 
                image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"
                tags={['Keto', 'Protein']}
              />
              <DietPlanCard 
                title="Vegan Vitality" 
                calories={480} 
                protein="18g" 
                image="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400"
                tags={['Vegan', 'Zero Carb']}
              />
            </div>
          </div>

          {/* Quick Stats Grid (moved from previous position) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">

            <div className="glass-card hover:border-indigo-500/50 cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Flame className="w-5 h-5 text-indigo-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <h4 className="font-bold mb-1">Keto Lunch Plan</h4>
              <p className="text-sm text-gray-400">High protein, low carb meal recommendations for today.</p>
            </div>
            <div className="glass-card hover:border-blue-500/50 cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <h4 className="font-bold mb-1">Morning Workout</h4>
              <p className="text-sm text-gray-400">Burn 300 kcal with your custom 15-min cardio routine.</p>
            </div>
          </div>
        </div>

        {/* Water & Habits Column */}
        <div className="lg:col-span-2 space-y-6">
          <WaterTracker 
            current={todayStats.waterIntake} 
            goal={profile.waterGoal} 
            onUpdate={updateWater} 
          />

          <div className="glass-card">
            <h3 className="font-display font-bold mb-6">Habit Checklist</h3>
            <div className="space-y-4">
              <HabitItem label="No sugar challenge" completed={true} />
              <HabitItem label="Morning run" completed={false} />
              <HabitItem label="Meditation" completed={true} />
              <HabitItem label="Early bed" completed={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, goal, unit, color, loading }: any) {
  const percentage = Math.min((value / goal) * 100, 100);
  
  const colors: any = {
    blue: "from-blue-500 to-indigo-600 text-blue-400",
    sky: "from-sky-400 to-blue-500 text-sky-400",
    indigo: "from-indigo-500 to-indigo-700 text-indigo-400"
  };

  return (
    <div className="glass-card relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/5 rounded-xl">
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{label}</span>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <div className="text-4xl font-display font-bold">
          <AnimatedCounter value={value} />
        </div>
        <span className="text-gray-500 font-medium">{unit}</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-gray-400">
          <span>{Math.round(percentage)}% of goal</span>
          <span>{goal} {unit}</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={cn("h-full bg-gradient-to-r", colors[color].split(' text-')[0])}
          />
        </div>
      </div>
      
      {/* Background decoration */}
      <div className={cn("absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 transition-opacity group-hover:opacity-30", colors[color].split(' text-')[0])} />
    </div>
  );
}

function HabitItem({ label, completed }: { label: string, completed: boolean }) {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className="flex items-center gap-3 group cursor-pointer"
    >
      <div className={cn(
        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
        completed ? "bg-indigo-500 border-indigo-500" : "border-white/10 group-hover:border-indigo-500/50"
      )}>
        {completed && (
          <motion.svg 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-4 h-4 text-white" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        )}
      </div>
      <span className={cn(
        "text-sm font-medium transition-colors",
        completed ? "text-gray-500 line-through" : "text-gray-300 group-hover:text-white"
      )}>
        {label}
      </span>
    </motion.div>
  );
}

function DietPlanCard({ title, calories, protein, image, tags }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-0 overflow-hidden min-w-[280px] snap-center group border-white/5 hover:border-indigo-500/30"
    >
      <div className="h-40 relative">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
          {tags.map((tag: string) => (
            <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
      <div className="p-5 space-y-4">
        <h4 className="font-display font-bold text-lg">{title}</h4>
        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            {calories} kcal
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            {protein} protein
          </div>
        </div>
      </div>
    </motion.div>
  );
}

