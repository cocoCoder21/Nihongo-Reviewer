import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Type, Pencil, Headphones, Mic, BookOpen } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const LearnHub = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 pb-32">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Learning Hub</h1>
        <p className="text-slate-500 font-medium mt-1">JLPT {user.level} - What would you like to practice today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <SkillCard 
          title="Vocabulary"
          description="Build your word bank with flashcards and example sentences."
          icon={<BookOpen className="w-8 h-8 text-emerald-600" />}
          color="bg-emerald-50 border-emerald-200"
          hoverColor="hover:bg-emerald-100 hover:border-emerald-300"
          onClick={() => navigate('/learn/vocabulary')}
        />
        
        <SkillCard 
          title="Grammar & Reading"
          description="Learn new sentence structures and vocabulary in context."
          icon={<Type className="w-8 h-8 text-blue-600" />}
          color="bg-blue-50 border-blue-200"
          hoverColor="hover:bg-blue-100 hover:border-blue-300"
          onClick={() => navigate('/learn/grammar')}
        />

        <SkillCard 
          title="Writing & Kanji"
          description="Practice stroke order and memorize Kanji meanings."
          icon={<Pencil className="w-8 h-8 text-red-600" />}
          color="bg-red-50 border-red-200"
          hoverColor="hover:bg-red-100 hover:border-red-300"
          onClick={() => navigate('/learn/writing')}
        />

        <SkillCard 
          title="Listening Comprehension"
          description="Train your ear with native audio clips and dialogues."
          icon={<Headphones className="w-8 h-8 text-emerald-600" />}
          color="bg-emerald-50 border-emerald-200"
          hoverColor="hover:bg-emerald-100 hover:border-emerald-300"
          onClick={() => navigate('/learn/listening')}
        />

        <SkillCard 
          title="Speaking & Shadowing"
          description="Record yourself and match native pronunciation."
          icon={<Mic className="w-8 h-8 text-purple-600" />}
          color="bg-purple-50 border-purple-200"
          hoverColor="hover:bg-purple-100 hover:border-purple-300"
          onClick={() => navigate('/learn/speaking')}
        />

      </div>

    </div>
  );
};

const SkillCard = ({ title, description, icon, color, hoverColor, onClick }: { title: string, description: string, icon: React.ReactNode, color: string, hoverColor: string, onClick: () => void }) => {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`text-left p-6 md:p-8 rounded-3xl border-2 transition-all shadow-sm ${color} ${hoverColor} flex flex-col justify-between min-h-[200px] group`}
    >
      <div className="bg-white/80 p-4 rounded-2xl w-max shadow-sm group-hover:shadow transition-shadow">
        {icon}
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 font-medium text-sm leading-relaxed">{description}</p>
      </div>
    </motion.button>
  );
};