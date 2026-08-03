import { type Player } from '@/lib/gameLogic';
import { TURN_DURATION } from '@/hooks/useTurnTimer';

interface PlayerCardProps {
  player: Player;
  name: string;
  wallsLeft: number;
  isActive: boolean;
  isLocal: boolean;
  turnSecondsLeft?: number;
  turnIsUrgent?: boolean;
}

export function PlayerCard({ player, name, wallsLeft, isActive, isLocal, turnSecondsLeft, turnIsUrgent }: PlayerCardProps) {
  const showTimer = isActive && isLocal && turnSecondsLeft !== undefined;
  const progress = turnSecondsLeft !== undefined ? turnSecondsLeft / TURN_DURATION : 1;

  return (
    <div
      className={`relative p-4 rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-[var(--color-wood-medium)] shadow-[0_0_20px_rgba(201,154,82,0.15)] scale-[1.02] border-[1px] border-[var(--color-brass)]/30'
          : 'bg-[var(--color-wood-dark)] border-[1px] border-transparent opacity-80'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full shadow-inner flex items-center justify-center font-bold text-white ${
            player === 'p1' ? 'bg-[var(--color-p1)]' : 'bg-[var(--color-p2)]'
          }`}
        >
          {isLocal ? 'Moi' : 'IA'}
        </div>
        <div className="flex-1">
          <div className="font-serif font-bold text-lg text-[var(--color-ivory)] flex items-center justify-between">
            <span>{name}</span>
            <div className="flex items-center gap-2">
              {showTimer && (
                <span
                  className={`text-sm font-mono font-bold tabular-nums transition-colors ${
                    turnIsUrgent ? 'text-red-400' : 'text-[var(--color-brass)]'
                  } ${turnIsUrgent ? 'animate-pulse' : ''}`}
                >
                  {turnSecondsLeft}s
                </span>
              )}
              {isActive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brass)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brass)]"></span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-2 rounded-sm transition-all duration-300 ${
                  i < wallsLeft ? 'bg-[#e2a868] shadow-sm' : 'bg-[#180f0a] opacity-30'
                }`}
              />
            ))}
            <span className="text-xs text-[var(--color-ivory)]/60 ml-2 font-mono">{wallsLeft}</span>
          </div>
        </div>
      </div>

      {/* Turn countdown progress bar */}
      {showTimer && (
        <div className="mt-2 h-1 bg-[#180f0a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              turnIsUrgent ? 'bg-red-400' : 'bg-[var(--color-brass)]'
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
