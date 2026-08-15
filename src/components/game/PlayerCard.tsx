import { type Player } from '@/lib/gameLogic';
import { TURN_DURATION } from '@/hooks/useTurnTimer';

interface PlayerCardProps {
  player: Player;
  name: string;
  color: string;
  wallsLeft: number;
  isActive: boolean;
  isLocal: boolean;
  turnSecondsLeft?: number;
  turnIsUrgent?: boolean;
  turnDuration?: number;
  avatarLabel?: string;
  wallCapacity?: number;
  finishedRank?: number;
  compact?: boolean;
}

export function PlayerCard({ player, name, color, wallsLeft, isActive, isLocal, turnSecondsLeft, turnIsUrgent, turnDuration = TURN_DURATION, avatarLabel, wallCapacity = 10, finishedRank, compact = false }: PlayerCardProps) {
  const showTimer = isActive && isLocal && turnSecondsLeft !== undefined;
  const progress = turnSecondsLeft !== undefined ? Math.max(0, Math.min(1, turnSecondsLeft / turnDuration)) : 1;

  return (
    <div
      className={`relative ${compact ? 'min-h-[42px] rounded-lg px-2 py-1.5' : 'min-h-[76px] rounded-2xl p-3 sm:p-4'} overflow-hidden transition-all duration-300 ${
        isActive
          ? 'border border-[var(--color-brass)]/30 bg-[linear-gradient(135deg,rgba(59,36,25,0.95),rgba(36,22,16,0.98))] shadow-[0_0_24px_rgba(201,154,82,0.14)]'
          : 'border border-transparent bg-[var(--color-wood-dark)] opacity-85'
      } ${isActive ? (compact ? 'scale-[1.01]' : 'scale-[1.02]') : ''}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_45%)]" />

      <div className={`relative flex items-center ${compact ? 'gap-1.5' : 'gap-3'}`}>
        <div
          className={`${compact ? 'flex h-6 w-6 text-[9px]' : 'flex h-11 w-11 text-sm'} shrink-0 items-center justify-center rounded-full border border-white/10 font-bold text-white shadow-inner`}
          style={{ backgroundColor: color }}
        >
          {avatarLabel ?? (isLocal ? 'Moi' : 'IA')}
        </div>

        <div className={`min-w-0 flex-1 ${compact ? 'flex items-center gap-1.5' : ''}`}>
          <div className={`flex min-w-0 items-center justify-between gap-1.5 font-serif font-bold text-[var(--color-ivory)] ${compact ? 'flex-1 text-xs' : 'text-lg'}`}>
            <span className="truncate">{name}</span>
            <div className={`flex shrink-0 items-center ${compact ? 'gap-1' : 'gap-2'}`}>
              {showTimer && (
                <span
                  className={`rounded-full px-2 py-0.5 text-sm font-mono font-bold tabular-nums transition-colors ${
                    turnIsUrgent
                      ? 'bg-red-400/10 text-red-300'
                      : 'bg-[var(--color-brass)]/12 text-[var(--color-brass)]'
                  }`}
                >
                  {turnSecondsLeft}s
                </span>
              )}
              {finishedRank && (
                <span
                  className={`${compact ? 'px-1.5 py-0 text-[9px]' : 'px-2 py-0.5 text-xs'} rounded-full border font-bold`}

                  style={{ borderColor: `${color}80`, backgroundColor: `${color}20`, color }}
                  aria-label={`Arrivé en ${finishedRank}${finishedRank === 1 ? 'ère' : 'e'} position`}
                >
                  #{finishedRank}
                </span>
              )}
              {isActive && !finishedRank && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brass)] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-brass)]" />
                </span>
              )}
            </div>
          </div>

          <div className={`${compact ? 'mt-0 shrink-0 gap-0.5' : 'mt-2 gap-1'} flex items-center`}>
            {finishedRank && !compact && <span className="mr-1 rounded-full bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">Arrivé</span>}
            {Array.from({ length: wallCapacity }).map((_, i) => (
              <div
                key={i}
                className={`${compact ? 'h-2 w-1' : 'h-3 w-2'} rounded-sm transition-all duration-300`}
                style={i < wallsLeft ? { backgroundColor: color, boxShadow: '0 1px 2px rgba(0,0,0,0.4)' } : { backgroundColor: '#180f0a', opacity: 0.3 }}
              />
            ))}
            <span className={`${compact ? 'ml-1 text-[9px]' : 'ml-2 text-xs'} font-mono text-[var(--color-ivory)]/65`} aria-label={`${wallsLeft} murs restants`}>{compact ? wallsLeft : `${wallsLeft} murs`}</span>
          </div>
        </div>
      </div>

      {showTimer && (
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-[#180f0a]">
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
