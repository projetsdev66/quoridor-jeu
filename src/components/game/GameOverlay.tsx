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
}: GameOverlayProps) {
  if (!winner) return null;

  const isWin = winner === localPlayer;

  // Deterministic particle positions — no Math.random() needed
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
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Particles — only on win */}
      {isWin &&
        particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
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
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[var(--color-wood-dark)] border-2 border-[var(--color-brass)] p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center relative z-10"
      >
        {/* Icon */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.15, damping: 15, stiffness: 250 }}
        >
          {isSurvival ? (
            <Shield className={`w-20 h-20 ${isWin ? 'text-[var(--color-brass)]' : 'text-[var(--color-ivory)]/40'}`} />
          ) : isWin ? (
            <Trophy className="w-20 h-20 text-[var(--color-brass)]" />
          ) : (
            <Frown className="w-20 h-20 text-[var(--color-ivory)]/40" />
          )}
        </motion.div>

        <motion.h2
          className="text-3xl font-serif font-bold text-[var(--color-ivory)] mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="text-[var(--color-ivory)]/70 mb-6 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {subtitle}
        </motion.p>

        {/* Survival record block — shown on loss */}
        {isSurvival && !isWin && (
          <motion.div
            className="mb-6 py-3 px-4 rounded-xl bg-[#180f0a] border border-[#3b2419] flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[var(--color-brass)] font-bold text-xl">
                <Award className="w-4 h-4" />
                {bestRound ?? 0}
              </div>
              <div className="text-[var(--color-ivory)]/50 text-xs">Record</div>
            </div>
            {isNewRecord && (
              <span className="text-xs font-bold text-[var(--color-brass)] bg-[var(--color-brass)]/15 border border-[var(--color-brass)]/40 px-2 py-1 rounded-full">
                Nouveau record !
              </span>
            )}
          </motion.div>
        )}

        {/* Regular stats bar — only for non-survival games */}
        {!isSurvival && stats && (
          <motion.div
            className="flex items-center justify-center gap-4 mb-6 py-3 px-4 rounded-xl bg-[#180f0a] border border-[#3b2419]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="text-center">
              <div className="text-[var(--color-brass)] font-bold text-xl">{stats.wins}</div>
              <div className="text-[var(--color-ivory)]/50 text-xs">Victoires</div>
            </div>
            <div className="h-8 w-px bg-[#3b2419]" />
            <div className="text-center">
              <div className="text-[var(--color-ivory)]/70 font-bold text-xl">{stats.losses}</div>
              <div className="text-[var(--color-ivory)]/50 text-xs">Défaites</div>
            </div>
            {stats.streak > 1 && (
              <>
                <div className="h-8 w-px bg-[#3b2419]" />
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-1 text-orange-400 font-bold text-xl">
                    <Flame className="w-4 h-4" />
                    {stats.streak}
                  </div>
                  <div className="text-[var(--color-ivory)]/50 text-xs">Série</div>
                </div>
              </>
            )}
            {stats.bestStreak >= 3 && stats.streak <= 1 && (
              <>
                <div className="h-8 w-px bg-[#3b2419]" />
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[var(--color-brass)] font-bold text-xl">
                    <Star className="w-4 h-4" />
                    {stats.bestStreak}
                  </div>
                  <div className="text-[var(--color-ivory)]/50 text-xs">Record</div>
                </div>
              </>
            )}
          </motion.div>
        )}

        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isSurvival && isWin ? (
            <button
              onClick={onContinueSurvival}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-brass)] text-[#180f0a] font-bold py-3 rounded-lg hover:bg-[#e2a868] transition-colors"
            >
              Manche suivante
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : isSurvival && !isWin ? (
            <button
              onClick={onRestartSurvival}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-brass)] text-[#180f0a] font-bold py-3 rounded-lg hover:bg-[#e2a868] transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Retenter la Survie
            </button>
          ) : (
            <button
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-brass)] text-[#180f0a] font-bold py-3 rounded-lg hover:bg-[#e2a868] transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Rejouer
            </button>
          )}

          <button
            onClick={onHome}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-wood-medium)] text-[var(--color-ivory)] font-bold py-3 rounded-lg hover:bg-[#4a2e1b] transition-colors border border-[#5c3a24]"
          >
            <Home className="w-5 h-5" />
            Menu Principal
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
