import { AnimatePresence, motion } from 'framer-motion';

interface StatusLineProps {
  isMyTurn: boolean;
  winner: string | null;
  winnerName?: string;
  lastFinisherName?: string;
  finishedCount?: number;
  finishTarget?: number;
  gameOver?: boolean;
  opponentName: string;
  passAndPlay?: boolean;
  reducedMotion?: boolean;
}

export function StatusLine({
  isMyTurn,
  winner,
  winnerName,
  lastFinisherName,
  finishedCount = 0,
  finishTarget = 1,
  gameOver = Boolean(winner),
  opponentName,
  passAndPlay = false,
  reducedMotion = false,
}: StatusLineProps) {
  const transition = reducedMotion ? { duration: 0.1 } : { duration: 0.2 };
  const animationProps = reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  const initialProps = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 };
  const exitProps = reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 };
  const remaining = Math.max(0, finishTarget - finishedCount);

  return (
    <div className="flex min-h-10 items-center justify-center overflow-hidden px-2 py-2 text-center font-serif text-base sm:text-lg">
      <AnimatePresence mode="wait">
        {gameOver ? (
          <motion.span
            key="done"
            initial={initialProps}
            animate={animationProps}
            exit={exitProps}
            transition={transition}
            className="text-[var(--color-brass)]"
          >
            {winnerName ? `${winnerName} termine la partie` : 'Partie terminée'}
          </motion.span>
        ) : finishedCount > 0 ? (
          <motion.span
            key={`ranking-${finishedCount}`}
            initial={initialProps}
            animate={animationProps}
            exit={exitProps}
            transition={transition}
            className="text-[var(--color-brass)]"
          >
            {lastFinisherName ? `${lastFinisherName} arrive #${finishedCount}` : `Classement : ${finishedCount} arrivée${finishedCount > 1 ? 's' : ''}`}
            <span className="ml-2 text-sm text-[var(--color-ivory)]/60">
              Encore {remaining} arrivée{remaining > 1 ? 's' : ''} avant la fin
            </span>
          </motion.span>
        ) : passAndPlay ? (
          <motion.span
            key="pass-and-play"
            initial={initialProps}
            animate={animationProps}
            exit={exitProps}
            transition={transition}
            className="text-[var(--color-ivory)]"
          >
            Au tour de {opponentName}
          </motion.span>
        ) : isMyTurn ? (
          <motion.span
            key="myturn"
            initial={initialProps}
            animate={animationProps}
            exit={exitProps}
            transition={transition}
            className="text-[var(--color-ivory)]"
          >
            C&apos;est à vous de jouer
          </motion.span>
        ) : (
          <motion.span
            key="waiting"
            initial={initialProps}
            animate={animationProps}
            exit={exitProps}
            transition={transition}
            className="flex items-center gap-2 text-[var(--color-ivory)]/60"
          >
            {opponentName} réfléchit
            {!reducedMotion && (
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-ivory)]/40"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  />
                ))}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
