import { BookCheck } from 'lucide-react';
import { useFamiliarityStore, type FamiliarityContentType } from '../store/useFamiliarityStore';

interface FamiliarityButtonProps {
  contentType: FamiliarityContentType;
  contentId: string;
}

export const FamiliarityButton = ({ contentType, contentId }: FamiliarityButtonProps) => {
  const setFamiliar = useFamiliarityStore((s) => s.setFamiliar);
  const familiar = useFamiliarityStore((s) => s.isFamiliar(contentType, contentId));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (familiar) return; // One-way: once familiar, stays familiar
    setFamiliar(contentType, contentId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={familiar}
      title={familiar ? 'Familiarized — added to your review queue' : 'Mark as familiarized'}
      aria-label={familiar ? 'Already familiarized' : 'Mark as familiarized'}
      aria-pressed={familiar}
      className={`p-2.5 rounded-xl transition-all active:scale-95 ${
        familiar
          ? 'bg-emerald-100 text-emerald-600 border border-emerald-300 shadow-sm cursor-default'
          : 'bg-orange-100 text-orange-500 border border-orange-300 shadow-sm hover:bg-orange-200'
      }`}
    >
      <BookCheck className="w-5 h-5" />
    </button>
  );
};
