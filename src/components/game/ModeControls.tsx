import { Move, Grid2X2, RectangleHorizontal, RectangleVertical } from 'lucide-react';

interface ModeControlsProps {
  mode: 'move' | 'wallH' | 'wallV';
  setMode: (mode: 'move' | 'wallH' | 'wallV') => void;
  wallsLeft: number;
  isMyTurn: boolean;
}

export function ModeControls({ mode, setMode, wallsLeft, isMyTurn }: ModeControlsProps) {
  return (
    <div className="flex gap-2 p-2 bg-[var(--color-wood-dark)] rounded-xl shadow-inner border border-[#3b2419]">
      <button
        onClick={() => setMode('move')}
        disabled={!isMyTurn}
        className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg transition-all ${
          mode === 'move'
            ? 'bg-[var(--color-wood-medium)] text-[var(--color-brass)] shadow-md border border-[#5c3a24]'
            : 'text-[var(--color-ivory)]/60 hover:text-[var(--color-ivory)] hover:bg-[var(--color-wood-medium)]/50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Move className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Déplacer</span>
      </button>

      <button
        onClick={() => setMode('wallH')}
        disabled={!isMyTurn || wallsLeft === 0}
        className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg transition-all ${
          mode === 'wallH'
            ? 'bg-[var(--color-wood-medium)] text-[var(--color-brass)] shadow-md border border-[#5c3a24]'
            : 'text-[var(--color-ivory)]/60 hover:text-[var(--color-ivory)] hover:bg-[var(--color-wood-medium)]/50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <RectangleHorizontal className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Mur H</span>
      </button>

      <button
        onClick={() => setMode('wallV')}
        disabled={!isMyTurn || wallsLeft === 0}
        className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg transition-all ${
          mode === 'wallV'
            ? 'bg-[var(--color-wood-medium)] text-[var(--color-brass)] shadow-md border border-[#5c3a24]'
            : 'text-[var(--color-ivory)]/60 hover:text-[var(--color-ivory)] hover:bg-[var(--color-wood-medium)]/50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <RectangleVertical className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Mur V</span>
      </button>
    </div>
  );
}
