import { useRef, useEffect } from 'react';
import { type GameState } from '@/lib/gameLogic';

interface HistoryPanelProps {
  history: GameState['history'];
  names: GameState['names'];
}

export function HistoryPanel({ history, names }: HistoryPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="w-full bg-[var(--color-wood-dark)] border border-[#3b2419] rounded-xl flex flex-col h-48 overflow-hidden shadow-inner">
      <div className="bg-[#180f0a]/50 p-2 border-b border-[#3b2419]">
        <h3 className="text-xs font-bold text-[var(--color-ivory)]/70 uppercase tracking-wider text-center">
          Historique
        </h3>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-2"
      >
        {history.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[var(--color-ivory)]/30 text-sm italic">
            Aucun coup joué
          </div>
        ) : (
          history.map((h, i) => (
            <div key={i} className="text-sm border-b border-[#3b2419]/50 pb-1">
              <span className={`font-bold mr-2 ${h.player === 'p1' ? 'text-[var(--color-p1)]' : 'text-[var(--color-p2)]'}`}>
                {names[h.player]}:
              </span>
              <span className="text-[var(--color-ivory)]/80">
                {h.action.type === 'move' 
                  ? `Déplacement en (${h.action.pos.r + 1}, ${h.action.pos.c + 1})` 
                  : `Mur ${h.action.wall.orientation} en (${h.action.wall.row + 1}, ${h.action.wall.col + 1})`}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
