import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Frown, RotateCcw, Home, Flame, Star, ArrowRight, Shield, Award, Crown, Crosshair, Sparkles } from 'lucide-react';
import { type Player } from '@/lib/gameLogic';
import { type Stats } from '@/hooks/useStats';

interface GameOverlayProps {
  winner: Player | null;
  ranking?: Player[];
  participants?: Player[];
  names?: Partial<Record<Player, string>>;
  colors?: Partial<Record<Player, string>>;
  localPlayer: Player;
  winnerName?: string;
  winnerColor?: string;
  centerTarget?: boolean;
  passAndPlay?: boolean;
  stats?: Stats;
  onRestart: () => void;
  onHome: () => void;
  isSurvival?: boolean;
  survivalRoundNumber?: number;
  roundsSurvived?: number;
  bestRound?: number;
  isNewRecord?: boolean;
  onContinueSurvival?: () => void;
  onRestartSurvival?: () => void;
  reducedMotion?: boolean;
}

export function GameOverlay({
  winner,
  ranking = winner ? [winner] : [],
  participants = [],
  names = {},
  colors = {},
  localPlayer,
  winnerName,
  winnerColor = 'var(--color-brass)',
  centerTarget = false,
  passAndPlay = false,
  stats,
  onRestart,
  onHome,
  isSurvival,
  survivalRoundNumber,
  roundsSurvived,
  bestRound,
  isNewRecord,
  onContinueSurvival,
  onRestartSurvival,
  reducedMotion = false,
}: GameOverlayProps) {
  const isWin = Boolean(winner) && !passAndPlay && ranking.includes(localPlayer);
  const isWinnerPresentation = passAndPlay || isWin;
  const isMultiFinish = ranking.length > 1;
  const orderedPlayers = [...ranking, ...participants.filter((player) => !ranking.includes(player))];
  const resolvedNames = orderedPlayers.map((player) => ({ player, name: names[player] || player, color: colors[player] || winnerColor, ranked: ranking.includes(player) }));
  const resolvedWinnerName = winnerName || winner || 'Le gagnant';
  const WinnerIcon = winner ? ({ p1: Trophy, p2: Crown, p3: Crosshair, p4: Sparkles } satisfies Record<Player, typeof Trophy>)[winner] : Trophy;

  const particles = useMemo(() => {
    // Three staggered bursts (center, then left, then right) instead of one flat burst — more "alive".
    const waves: { originX: string; originY: string; baseDelay: number; count: number; spread: number }[] = [
      { originX: '50%', originY: '45%', baseDelay: 0, count: 16, spread: 80 },
      { originX: '15%', originY: '55%', baseDelay: 0.25, count: 10, spread: 60 },
      { originX: '85%', originY: '55%', baseDelay: 0.42, count: 10, spread: 60 },
    ];
    const colors = [winnerColor, '#e2a868', '#f0d090', '#fff8e0'];
    let idCounter = 0;
    return waves.flatMap((wave) =>
      Array.from({ length: wave.count }, (_, i) => {
        const id = idCounter++;
        return {
          id,
          originX: wave.originX,
          originY: wave.originY,
          angle: (i * (360 / wave.count) + id * 11) % 360,
          distance: wave.spread * 0.6 + ((id * 23) % wave.spread),
          delay: wave.baseDelay + (i % 6) * 0.05,
          size: 4 + (id % 3) * 3,
          color: colors[id % colors.length],
        };
      }),
    );
  }, [winnerColor]);

  if (!winner) return null;

  const title = isSurvival
    ? isWin
      ? `Manche ${survivalRoundNumber ?? ''} remportée !`
      : 'Série terminée'
    : isMultiFinish
      ? 'Classement final'
      : passAndPlay
        ? `${resolvedWinnerName} gagne !`
        : isWin
          ? 'Victoire !'
          : 'Défaite';

  const subtitle = isSurvival
    ? isWin
      ? "Préparez-vous, l’IA devient plus forte."
      : `Vous avez survécu à ${roundsSurvived ?? 0} manche${(roundsSurvived ?? 0) > 1 ? 's' : ''}.`
    : isMultiFinish
      ? `${ranking.length} joueur${ranking.length > 1 ? 's' : ''} classé${ranking.length > 1 ? 's' : ''}. Chaque arrivée a été annoncée.`
      : passAndPlay
        ? centerTarget ? `${resolvedWinnerName} a atteint la case centrale.` : `${resolvedWinnerName} a atteint son objectif.`
        : isWin
          ? centerTarget ? 'Vous avez atteint la case centrale avant les autres.' : 'Vous avez brillamment atteint le côté opposé.'
          : 'Les autres joueurs ont été plus rusés cette fois-ci.';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="game-over-title">
      {isWinnerPresentation && !reducedMotion &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              top: p.originY,
              left: p.originX,
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
              y: Math.sin((p.angle * Math.PI) / 180) * p.distance - 40,
              scale: [0, 1, 1, 0],
            }}
            transition={{ duration: 1.3, delay: p.delay, ease: 'easeOut' }}
          />
        ))}

      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.9 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={reducedMotion ? { duration: 0.12 } : { type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border-2 bg-[var(--color-wood-dark)] p-8 text-center shadow-2xl"
        style={{ borderColor: isWinnerPresentation ? winnerColor : 'var(--color-brass)' }}
      >
        <motion.div
          className="mb-4 flex justify-center"
          initial={reducedMotion ? { opacity: 0 } : { scale: 0, rotate: -30 }}
          animate={reducedMotion ? { opacity: 1 } : { scale: 1, rotate: 0 }}
          transition={reducedMotion ? { duration: 0.12 } : { type: 'spring', delay: 0.15, damping: 15, stiffness: 250 }}
        >
          {isSurvival ? (
            <Shield className="h-20 w-20" style={{ color: isWin ? winnerColor : 'rgba(245,240,224,0.4)' }} />
          ) : isWinnerPresentation ? (
            <WinnerIcon className="h-20 w-20" style={{ color: winnerColor }} />
          ) : (
            <Frown className="h-20 w-20 text-[var(--color-ivory)]/40" />
          )}
        </motion.div>

        <motion.h2
          id="game-over-title"
          className="mb-1 text-3xl font-serif font-bold text-[var(--color-ivory)]"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="mb-6 text-sm text-[var(--color-ivory)]/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {subtitle}
        </motion.p>

        {isMultiFinish && !isSurvival && (
          <motion.div
            className="mb-6 rounded-xl border border-[#3b2419] bg-[#180f0a] p-3 text-left"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-[var(--color-brass)]">
              <span>Classement final</span>
              <span className="text-[var(--color-ivory)]/45">{ranking.length} arrivées</span>
            </div>
            <ol className="space-y-2">
              {resolvedNames.map(({ player, name, color, ranked }, index) => (
                <li key={player} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${ranked ? 'bg-[var(--color-wood-medium)]/50' : 'bg-black/10 opacity-60'}`}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#180f0a]" style={{ backgroundColor: ranked ? color : 'rgba(243,234,212,0.35)' }}>
                    {ranked ? index + 1 : '—'}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-[var(--color-ivory)]">{name}</span>
                  <span className="text-[10px] uppercase tracking-wide text-[var(--color-ivory)]/50">{player === localPlayer ? 'Vous' : ranked ? 'Classé' : 'Non classé'}</span>
                </li>
              ))}
            </ol>
            {isMultiFinish && ranking.length < orderedPlayers.length && (
              <p className="mt-2 text-xs text-[var(--color-ivory)]/45">Les joueurs non classés n’ont pas atteint leur cible avant la fin.</p>
            )}
          </motion.div>
        )}

        {isSurvival && !isWin && (
          <motion.div
            className="mb-6 flex items-center justify-center gap-4 rounded-xl border border-[#3b2419] bg-[#180f0a] px-4 py-3"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xl font-bold text-[var(--color-brass)]">
                <Award className="h-4 w-4" />
                {bestRound ?? 0}
              </div>
              <div className="text-xs text-[var(--color-ivory)]/50">Record</div>
            </div>
            {isNewRecord && (
              <span className="rounded-full border border-[var(--color-brass)]/40 bg-[var(--color-brass)]/15 px-2 py-1 text-xs font-bold text-[var(--color-brass)]">
                Nouveau record !
              </span>
            )}
          </motion.div>
        )}

        {isWinnerPresentation && !isSurvival && !isMultiFinish && stats && (
          <motion.div
            className="mb-6 flex items-center justify-center gap-4 rounded-xl border border-[#3b2419] bg-[#180f0a] px-4 py-3"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--color-brass)]">{stats.wins}</div>
              <div className="text-xs text-[var(--color-ivory)]/50">Victoires</div>
            </div>
            <div className="h-8 w-px bg-[#3b2419]" />
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--color-ivory)]/70">{stats.losses}</div>
              <div className="text-xs text-[var(--color-ivory)]/50">Défaites</div>
            </div>
            {stats.streak > 1 && (
              <>
                <div className="h-8 w-px bg-[#3b2419]" />
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-1 text-xl font-bold text-orange-400">
                    <Flame className="h-4 w-4" />
                    {stats.streak}
                  </div>
                  <div className="text-xs text-[var(--color-ivory)]/50">Série</div>
                </div>
              </>
            )}
            {stats.bestStreak >= 3 && stats.streak <= 1 && (
              <>
                <div className="h-8 w-px bg-[#3b2419]" />
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-1 text-xl font-bold text-[var(--color-brass)]">
                    <Star className="h-4 w-4" />
                    {stats.bestStreak}
                  </div>
                  <div className="text-xs text-[var(--color-ivory)]/50">Record</div>
                </div>
              </>
            )}
          </motion.div>
        )}

        <motion.div
          className="flex flex-col gap-3"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isSurvival && isWin ? (
            <button
              onClick={onContinueSurvival}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brass)] py-3 font-bold text-[#180f0a] transition-colors hover:bg-[#e2a868] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ivory)]"
            >
              Manche suivante
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : isSurvival && !isWin ? (
            <button
              onClick={onRestartSurvival}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brass)] py-3 font-bold text-[#180f0a] transition-colors hover:bg-[#e2a868] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ivory)]"
            >
              <RotateCcw className="h-5 w-5" />
              Retenter la Survie
            </button>
          ) : (
            <button
              onClick={onRestart}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brass)] py-3 font-bold text-[#180f0a] transition-colors hover:bg-[#e2a868] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ivory)]"
            >
              <RotateCcw className="h-5 w-5" />
              Rejouer
            </button>
          )}

          <button
            onClick={onHome}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#5c3a24] bg-[var(--color-wood-medium)] py-3 font-bold text-[var(--color-ivory)] transition-colors hover:bg-[#4a2e1b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)]"
          >
            <Home className="h-5 w-5" />
            Menu Principal
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
