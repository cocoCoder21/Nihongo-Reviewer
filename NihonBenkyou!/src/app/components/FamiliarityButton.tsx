import { BookCheck } from 'lucide-react';
import { useFamiliarityStore, type FamiliarityContentType } from '../store/useFamiliarityStore';

interface FamiliarityButtonProps {
  contentType: FamiliarityContentType;
  contentId: string;
}

export const FamiliarityButton = ({ contentType, contentId }: FamiliarityButtonProps) => {
  const toggleFamiliar = useFamiliarityStore((s) => s.toggleFamiliar);
  const familiar = useFamiliarityStore((s) => s.isFamiliar(contentType, contentId));

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFamiliar(contentType, contentId);
      }}
      title="Completed & Familiarized"
      className={`p-2.5 rounded-xl transition-all active:scale-95 ${
        familiar
          ? 'bg-emerald-100 text-emerald-600 border border-emerald-300 shadow-sm'
          : 'bg-orange-100 text-orange-500 border border-orange-300 shadow-sm'
      }`}
    >
      <BookCheck className="w-5 h-5" />
    </button>
  );
};
