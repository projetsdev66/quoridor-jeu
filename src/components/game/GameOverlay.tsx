import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Frown, RotateCcw, Home, Flame, Star, ArrowRight, Shield, Award } from 'lucide-react';
import { type Player } from '@/lib/gameLogic';
import { type Stats } from '@/hooks/useStats';

interface GameOverlayProps {
  winner: Player | null;
  localPlayer: Player;
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
  localPlayer,
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
  if (!winner) return null;

  const isWin = winner === localPlayer;

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        angle: (i * 137.5) % 360,
        distance: 60 + ((i * 23) % 80),
        delay: (i % 6) * 0.07,
        size: 4 + (i % 3) * 3,
        color: ['#c99a52', '#e2a868', '#f0d090', '#fff8e0'][i % 4],
      })),
    [],
  );

  const title = isSurvival
    ? isWin
      ? `Manche ${survivalRoundNumber ?? ''} remportée !`
      : 'Série terminée'
    : isWin
      ? 'Victoire !'
      : 'Défaite';

  const subtitle = isSurvival
    ? isWin
      ? "Préparez-vous, l'IA devient plus forte."
      : `Vous avez survécu à ${roundsSurvived ?? 0} manche${(roundsSurvived ?? 0) > 1 ? 's' : ''}.`
    : isWin
      ? 'Vous avez brillamment atteint le côté opposé.'
      : 'Votre adversaire a été plus rusé cette fois-ci.';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      {isWin && !reducedMotion &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              top: '45%',
              left: '50%',
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
              y: Math.sin((p.angle * Math.PI) / 180) * p.distance - 40,
              scale: [0, 1, 1, 0],
            }}
            transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut' }}
          />
        ))}

      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.9 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={reducedMotion ? { duration: 0.12 } : { type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border-2 border-[var(--color-brass)] bg-[var(--color-wood-dark)] p-8 text-center shadow-2xl"
      >
        <motion.div
          className="mb-4 flex justify-center"
          initial={reducedMotion ? { opacity: 0 } : { scale: 0, rotate: -30 }}
          animate={reducedMotion ? { opacity: 1 } : { scale: 1, rotate: 0 }}
          transition={reducedMotion ? { duration: 0.12 } : { type: 'spring', delay: 0.15, damping: 15, stiffness: 250 }}
        >
          {isSurvival ? (
            <Shield className={`h-20 w-20 ${isWin ? 'text-[var(--color-brass)]' : 'text-[var(--color-ivory)]/40'}`} />
          ) : isWin ? (
            <Trophy className="h-20 w-20 text-[var(--color-brass)]" />
          ) : (
            <Frown className="h-20 w-20 text-[var(--color-ivory)]/40" />
          )}
        </motion.div>

        <motion.h2
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

        {!isSurvival && stats && (
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
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brass)] py-3 font-bold text-[#180f0a] transition-colors hover:bg-[#e2a868]"
            >
              Manche suivante
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : isSurvival && !isWin ? (
            <button
              onClick={onRestartSurvival}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brass)] py-3 font-bold text-[#180f0a] transition-colors hover:bg-[#e2a868]"
            >
              <RotateCcw className="h-5 w-5" />
              Retenter la Survie
            </button>
          ) : (
            <button
              onClick={onRestart}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brass)] py-3 font-bold text-[#180f0a] transition-colors hover:bg-[#e2a868]"
            >
              <RotateCcw className="h-5 w-5" />
              Rejouer
            </button>
          )}

          <button
            onClick={onHome}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#5c3a24] bg-[var(--color-wood-medium)] py-3 font-bold text-[var(--color-ivory)] transition-colors hover:bg-[#4a2e1b]"
          >
            <Home className="h-5 w-5" />
            Menu Principal
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
