import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Edit2, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';

export const Profile = () => {
  const { user, stats, settings, updateSettings, resetProgress } = useAppStore();
  const navigate = useNavigate();

  const dailyGoalLabels: Record<number, string> = { 20: 'Relaxed', 50: 'Casual', 100: 'Serious', 200: 'Intense' };
  const dailyGoalOptions = [20, 50, 100, 200];

  const cycleDailyGoal = () => {
    const idx = dailyGoalOptions.indexOf(settings.dailyGoal);
    const next = dailyGoalOptions[(idx + 1) % dailyGoalOptions.length];
    updateSettings({ dailyGoal: next });
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-4 md:p-8 space-y-8 pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="p-3 bg-white text-slate-400 hover:text-brand-700 rounded-full shadow-sm border border-brand-200/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Profile</h1>
        <div className="w-10" />
      </div>

      {/* Avatar Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-200/50 flex flex-col items-center text-center relative">
        <button className="absolute top-4 right-4 p-2 text-slate-400 hover:text-brand-700 transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        
        <div className="w-24 h-24 rounded-full bg-brand-500 text-white flex items-center justify-center text-4xl font-black shadow-lg mb-4 ring-4 ring-brand-100">
          {user.name.charAt(0)}
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
        <p className="text-slate-500 font-medium mt-1">Joined {user.joined}</p>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        
        {/* Goals */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Learning Goals</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-brand-200/50 overflow-hidden divide-y divide-brand-100">
            <div 
              onClick={() => navigate('/levels')}
              className="flex items-center justify-between p-4 hover:bg-brand-50/50 cursor-pointer transition-colors group"
            >
              <span className="font-semibold text-slate-700">Target Level</span>
              <div className="flex items-center space-x-2 text-slate-500 group-hover:text-brand-700">
                <span className="font-medium">JLPT {user.level}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div 
              onClick={cycleDailyGoal}
              className="flex items-center justify-between p-4 hover:bg-brand-50/50 cursor-pointer transition-colors group"
            >
              <span className="font-semibold text-slate-700">Daily Goal (XP)</span>
              <div className="flex items-center space-x-2 text-slate-500 group-hover:text-brand-700">
                <span className="font-medium">{settings.dailyGoal} ({dailyGoalLabels[settings.dailyGoal] ?? 'Custom'})</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* Audio & Visuals */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Audio & Visuals</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-brand-200/50 overflow-hidden divide-y divide-brand-100">
            <ToggleRow label="Auto-play pronunciation audio" active={settings.autoPlayAudio} onToggle={() => updateSettings({ autoPlayAudio: !settings.autoPlayAudio })} />
            <ToggleRow label="Show Romaji alongside Kanji" active={settings.showRomaji} onToggle={() => updateSettings({ showRomaji: !settings.showRomaji })} />
            <ToggleRow label="Enable Dark Mode" active={settings.darkMode} onToggle={() => updateSettings({ darkMode: !settings.darkMode })} />
          </div>
        </section>

        {/* Stats */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Statistics</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-brand-200/50 p-6 grid grid-cols-2 gap-6">
            <StatBox label="Total Study Time" value={`${stats.totalStudyHours}h`} />
            <StatBox label="Cards Mastered" value={stats.cardsMastered.toString()} />
            <StatBox label="Longest Streak" value={`${stats.streak} Days`} />
            <StatBox label="Current Level" value={user.level} />
          </div>
        </section>

        {/* Danger Zone */}
        <div className="pt-4 flex flex-col space-y-3">
          <button className="w-full py-4 rounded-2xl bg-white text-slate-600 font-bold border border-brand-200/50 hover:bg-brand-50 transition-colors flex items-center justify-center space-x-2">
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
          <button 
            onClick={resetProgress}
            className="w-full py-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 transition-colors"
          >
            Reset Progress
          </button>
        </div>

      </div>

    </div>
  );
};

const ToggleRow = ({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) => (
  <div onClick={onToggle} className="flex items-center justify-between p-4 hover:bg-brand-50/50 cursor-pointer transition-colors">
    <span className="font-semibold text-slate-700">{label}</span>
    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${active ? 'bg-brand-500' : 'bg-slate-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  </div>
);

const StatBox = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
    <p className="text-sm font-semibold text-slate-400 mt-1">{label}</p>
  </div>
);