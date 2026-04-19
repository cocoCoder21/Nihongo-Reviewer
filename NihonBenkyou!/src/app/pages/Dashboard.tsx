import { Flame, Play, ArrowRight, BrainCircuit, Type, FileType2, Calendar, Target, Zap, BookOpen } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const weeklyData = [
  { day: 'Mon', xp: 45 },
  { day: 'Tue', xp: 50 },
  { day: 'Wed', xp: 30 },
  { day: 'Thu', xp: 60 },
  { day: 'Fri', xp: 40 },
  { day: 'Sat', xp: 0 },
  { day: 'Sun', xp: 20 },
];

export const Dashboard = () => {
  const { user, stats, progress } = useAppStore();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 pb-32 md:pb-8">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Okaeri, {user.name}</h1>
          <p className="text-slate-500 font-medium mt-1">Ready to master JLPT {user.level}?</p>
        </div>

        <div className="flex items-center space-x-6 bg-white p-4 rounded-3xl shadow-sm border border-brand-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-none">{stats.streak}</p>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Day Streak</p>
            </div>
          </div>
          
          <div className="w-px h-10 bg-brand-200"></div>

          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-brand-100 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-brand-500 stroke-current" strokeDasharray={`${(stats.xp / stats.xpGoal) * 100}, 100`} strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-none">{stats.xp}<span className="text-sm text-slate-400">/{stats.xpGoal}</span></p>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Daily XP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Action Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-brand-700 text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800/40 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-500/40 rounded-full blur-3xl -ml-24 -mb-24"></div>
            
            <div className="relative z-10 flex flex-col items-start max-w-sm mb-6 md:mb-0">
              <div className="flex space-x-2 mb-4">
                <span className="px-3 py-1 bg-red-500/20 text-red-100 text-xs font-bold rounded-full border border-red-500/30 backdrop-blur-sm">15 Kanji</span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-100 text-xs font-bold rounded-full border border-emerald-500/30 backdrop-blur-sm">30 Vocab</span>
              </div>
              
              <h2 className="text-3xl font-black tracking-tight mb-2">You have {stats.reviewsDue} reviews due.</h2>
              <p className="text-brand-100/90 font-medium text-sm">Spaced repetition keeps your memory fresh. Don't break the streak!</p>
            </div>

            <button 
              onClick={() => navigate('/practice')}
              className="relative z-10 w-full md:w-auto bg-white text-brand-700 hover:bg-brand-50 active:scale-95 transition-all font-bold py-4 px-8 rounded-2xl flex justify-center items-center space-x-3 shadow-xl flex-shrink-0"
            >
              <span>Start Review</span>
              <Play className="w-5 h-5 fill-current" />
            </button>
          </motion.div>

          {/* Activity Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-200/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-brand-500" />
                This Week's Activity
              </h3>
              <span className="text-sm font-bold text-brand-600 bg-brand-100 px-3 py-1 rounded-full">{stats.xp} XP Today</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="xp" radius={[4, 4, 4, 4]}>
                    {weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.xp > 0 ? (entry.day === 'Sun' ? '#f43f5e' : '#f97316') : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Daily Quests */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-200/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
              <Target className="w-5 h-5 mr-2 text-brand-500" />
              Daily Quests
            </h3>
            <div className="space-y-4">
              <QuestItem title="Earn 50 XP" current={stats.xp} max={stats.xpGoal} reward={10} icon={<Zap className="w-4 h-4 text-yellow-500" />} />
              <QuestItem title="Learn 5 New Kanji" current={2} max={5} reward={15} icon={<BrainCircuit className="w-4 h-4 text-red-500" />} />
              <QuestItem title="Complete a Lesson" current={0} max={1} reward={20} icon={<BookOpen className="w-4 h-4 text-blue-500" />} />
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-200/50">
            <h3 className="text-lg font-bold text-slate-800 mb-6">JLPT {user.level} Progress</h3>
            
            <div className="space-y-5">
              <SkillProgress 
                label="Vocabulary" 
                current={progress.vocabulary.current} 
                max={progress.vocabulary.max} 
                color="bg-emerald-500" 
                bgColor="bg-emerald-100" 
                icon={<FileType2 className="w-4 h-4 text-emerald-600" />}
              />
              <SkillProgress 
                label="Grammar" 
                current={progress.grammar.current} 
                max={progress.grammar.max} 
                color="bg-blue-500" 
                bgColor="bg-blue-100" 
                icon={<Type className="w-4 h-4 text-blue-600" />}
              />
              <SkillProgress 
                label="Kanji" 
                current={progress.kanji.current} 
                max={progress.kanji.max} 
                color="bg-red-500" 
                bgColor="bg-red-100" 
                icon={<BrainCircuit className="w-4 h-4 text-red-600" />}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const SkillProgress = ({ label, current, max, color, bgColor, icon }: { label: string, current: number, max: number, color: string, bgColor: string, icon: React.ReactNode }) => {
  const percentage = Math.round((current / max) * 100);
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center text-sm font-semibold">
        <div className="flex items-center space-x-2 text-slate-700">
          <div className={`p-1.5 rounded-lg ${bgColor}`}>
            {icon}
          </div>
          <span>{label}</span>
        </div>
        <span className="text-slate-400">{current} / {max} <span className="text-slate-300 font-normal">({percentage}%)</span></span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`} 
        />
      </div>
    </div>
  );
};

const QuestItem = ({ title, current, max, reward, icon }: { title: string, current: number, max: number, reward: number, icon: React.ReactNode }) => {
  const isComplete = current >= max;
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className={`p-3 rounded-2xl border ${isComplete ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-100'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-1 rounded shadow-sm">
            {icon}
          </div>
          <p className={`text-sm font-bold ${isComplete ? 'text-brand-800' : 'text-slate-700'}`}>{title}</p>
        </div>
        <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">+{reward} XP</span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${isComplete ? 'bg-brand-500' : 'bg-slate-400'}`} style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-500">{current}/{max}</span>
      </div>
    </div>
  );
};