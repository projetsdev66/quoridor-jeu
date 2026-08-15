import { TURN_DURATION } from '@/hooks/useTurnTimer';
import type { Player } from '@/lib/gameLogic';

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

export function PlayerCard({
  player: _player,
  name,
  color,
  wallsLeft,
  isActive,
  isLocal,
  turnSecondsLeft,
  turnIsUrgent,
  turnDuration = TURN_DURATION,
  avatarLabel,
  wallCapacity = 10,
  finishedRank,
  compact = false,
}: PlayerCardProps) {
  const showTimer = isActive && isLocal && turnSecondsLeft !== undefined;
  const progress = turnSecondsLeft !== undefined ? Math.max(0, Math.min(1, turnSecondsLeft / turnDuration)) : 1;
  const playerLabel = avatarLabel ?? (isLocal ? 'Moi' : 'IA');

  if (compact) {
    return (
      <div
        className={`relative flex h-8 min-w-0 items-center gap-1.5 overflow-hidden rounded-md border px-1.5 transition-colors ${
          finishedRank
            ? 'border-[var(--color-brass)]/50 bg-[linear-gradient(90deg,rgba(201,154,82,0.18),rgba(201,154,82,0.05))] shadow-[0_0_10px_rgba(201,154,82,0.2)]'
            : isActive
              ? 'border-[var(--color-brass)]/45 bg-[var(--color-brass)]/10'
              : 'border-white/5 bg-[var(--color-wood-dark)]/75'
        }`}
        title={`${playerLabel} · ${name} · ${wallsLeft} murs${finishedRank ? ` · ${finishedRank}${finishedRank === 1 ? 'er' : 'e'} arrivé${finishedRank === 1 ? '' : ''}` : ''}`}
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full border border-white/20 ${finishedRank ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <span className="shrink-0 font-mono text-[9px] font-bold text-[var(--color-ivory)]/70">{playerLabel}</span>
        <span className={`min-w-0 flex-1 truncate text-[10px] font-semibold ${finishedRank ? 'text-[var(--color-brass)]' : 'text-[var(--color-ivory)]'}`}>{name}</span>
        {finishedRank ? (
          <span
            className="shrink-0 animate-in zoom-in fade-in rounded-full border px-1 text-[8px] font-bold duration-300"
            style={{ borderColor: `${color}90`, backgroundColor: `${color}30`, color }}
            aria-label={`Arrivé en ${finishedRank}${finishedRank === 1 ? 'ère' : 'e'} position`}
          >
            {finishedRank === 1 ? '★' : `#${finishedRank}`}
          </span>
        ) : isActive ? (
          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[var(--color-brass)]" aria-label="Tour actif" />
        ) : null}
        <span className="shrink-0 font-mono text-[9px] text-[var(--color-ivory)]/55" aria-label={`${wallsLeft} murs restants`}>
          {wallsLeft} murs
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-[76px] overflow-hidden rounded-2xl p-3 transition-all duration-300 sm:p-4 ${
        isActive
          ? 'border border-[var(--color-brass)]/30 bg-[linear-gradient(135deg,rgba(59,36,25,0.95),rgba(36,22,16,0.98))] shadow-[0_0_24px_rgba(201,154,82,0.14)]'
          : 'border border-transparent bg-[var(--color-wood-dark)] opacity-85'
      } ${isActive ? 'scale-[1.02]' : ''}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_45%)]" />

      <div className="relative flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-sm font-bold text-white shadow-inner"
          style={{ backgroundColor: color }}
        >
          {playerLabel}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-between gap-1.5 font-serif text-lg font-bold text-[var(--color-ivory)]">
            <span className="truncate">{name}</span>
            <div className="flex shrink-0 items-center gap-2">
              {showTimer && (
                <span
                  className={`rounded-full px-2 py-0.5 text-sm font-mono font-bold tabular-nums transition-colors ${
                    turnIsUrgent ? 'bg-red-400/10 text-red-300' : 'bg-[var(--color-brass)]/12 text-[var(--color-brass)]'
                  }`}
                >
                  {turnSecondsLeft}s
                </span>
              )}
              {finishedRank && (
                <span
                  className="rounded-full border px-2 py-0.5 text-xs font-bold"
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

          <div className="mt-2 flex items-center gap-1">
            {finishedRank && <span className="mr-1 rounded-full bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">Arrivé</span>}
            {Array.from({ length: wallCapacity }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-2 rounded-sm transition-all duration-300"
                style={i < wallsLeft ? { backgroundColor: color, boxShadow: '0 1px 2px rgba(0,0,0,0.4)' } : { backgroundColor: '#180f0a', opacity: 0.3 }}
              />
            ))}
            <span className="ml-2 text-xs font-mono text-[var(--color-ivory)]/65" aria-label={`${wallsLeft} murs restants`}>{wallsLeft} murs</span>
          </div>
        </div>
      </div>

      {showTimer && (
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-[#180f0a]">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${turnIsUrgent ? 'bg-red-400' : 'bg-[var(--color-brass)]'}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
