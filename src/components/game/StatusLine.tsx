import { motion, AnimatePresence } from 'framer-motion';

interface StatusLineProps {
  isMyTurn: boolean;
  winner: string | null;
  opponentName: string;
  passAndPlay?: boolean;
  reducedMotion?: boolean;
}

export function StatusLine({ isMyTurn, winner, opponentName, passAndPlay = false, reducedMotion = false }: StatusLineProps) {
  const transition = reducedMotion ? { duration: 0.1 } : { duration: 0.2 };
  const animationProps = reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  const initialProps = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 };
  const exitProps = reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 };

  return (
    <div className="flex h-10 items-center justify-center gap-2 overflow-hidden py-2 text-center font-serif text-lg">
      <AnimatePresence mode="wait">
        {winner ? (
          <motion.span
            key="done"
            initial={initialProps}
            animate={animationProps}
            exit={exitProps}
            transition={transition}
            className="text-[var(--color-brass)]"
          >
            Partie terminée
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
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
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
