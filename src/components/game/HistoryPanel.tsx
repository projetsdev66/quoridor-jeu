import { useRef, useEffect } from 'react';
import { Move, RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { type GameState } from '@/lib/gameLogic';

interface HistoryPanelProps {
  history: GameState['history'];
  names: GameState['names'];
  colors?: GameState['colors'];
}

export function HistoryPanel({ history, names, colors }: HistoryPanelProps) {
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
            const playerColor = colors?.[h.player] ?? (h.player === 'p1' ? '#c0392b' : h.player === 'p2' ? '#3a6ea8' : h.player === 'p3' ? '#3f9142' : '#8659b5');
            return (
              <div key={i} className="flex items-center gap-2 text-sm px-1.5 py-1 rounded-md odd:bg-black/10">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${playerColor}33` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: playerColor }} />
                </div>
                <span className="shrink-0 font-bold" style={{ color: playerColor }}>
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
