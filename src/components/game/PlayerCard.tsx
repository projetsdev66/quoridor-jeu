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
}

export function PlayerCard({ player, name, color, wallsLeft, isActive, isLocal, turnSecondsLeft, turnIsUrgent, turnDuration = TURN_DURATION, avatarLabel }: PlayerCardProps) {
  const showTimer = isActive && isLocal && turnSecondsLeft !== undefined;
  const progress = turnSecondsLeft !== undefined ? Math.max(0, Math.min(1, turnSecondsLeft / turnDuration)) : 1;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
        isActive
          ? 'border border-[var(--color-brass)]/30 bg-[linear-gradient(135deg,rgba(59,36,25,0.95),rgba(36,22,16,0.98))] shadow-[0_0_24px_rgba(201,154,82,0.14)] scale-[1.02]'
          : 'border border-transparent bg-[var(--color-wood-dark)] opacity-85'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_45%)]" />

      <div className="relative flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 font-bold text-white shadow-inner"
          style={{ backgroundColor: color }}
        >
          {avatarLabel ?? (isLocal ? 'Moi' : 'IA')}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 font-serif text-lg font-bold text-[var(--color-ivory)]">
            <span className="truncate">{name}</span>
            <div className="flex items-center gap-2">
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
              {isActive && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brass)] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-brass)]" />
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-2 rounded-sm transition-all duration-300"
                style={i < wallsLeft ? { backgroundColor: color, boxShadow: '0 1px 2px rgba(0,0,0,0.4)' } : { backgroundColor: '#180f0a', opacity: 0.3 }}
              />
            ))}
            <span className="ml-2 font-mono text-xs text-[var(--color-ivory)]/65">{wallsLeft} murs</span>
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
