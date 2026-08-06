import { useRef, useEffect } from 'react';
import { Move, RectangleHorizontal, RectangleVertical } from 'lucide-react';
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
        className="flex-1 overflow-y-auto p-2 flex flex-col gap-1"
      >
        {history.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[var(--color-ivory)]/30 text-sm italic">
            Aucun coup joué
          </div>
        ) : (
          history.map((h, i) => {
            const Icon = h.action.type === 'move' ? Move : h.action.wall.orientation === 'H' ? RectangleHorizontal : RectangleVertical;
            return (
              <div key={i} className="flex items-center gap-2 text-sm px-1.5 py-1 rounded-md odd:bg-black/10">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    h.player === 'p1' ? 'bg-[var(--color-p1)]/20' : 'bg-[var(--color-p2)]/20'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${h.player === 'p1' ? 'text-[var(--color-p1)]' : 'text-[var(--color-p2)]'}`} />
                </div>
                <span className={`font-bold shrink-0 ${h.player === 'p1' ? 'text-[var(--color-p1)]' : 'text-[var(--color-p2)]'}`}>
                  {names[h.player]}
                </span>
                <span className="text-[var(--color-ivory)]/60 text-xs truncate">
                  {h.action.type === 'move'
                    ? `case (${h.action.pos.r + 1}, ${h.action.pos.c + 1})`
                    : `mur ${h.action.wall.orientation === 'H' ? 'horizontal' : 'vertical'}`}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
