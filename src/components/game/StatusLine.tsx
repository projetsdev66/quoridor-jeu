import { motion, AnimatePresence } from 'framer-motion';

interface StatusLineProps {
  isMyTurn: boolean;
  winner: string | null;
  opponentName: string;
}

export function StatusLine({ isMyTurn, winner, opponentName }: StatusLineProps) {
  return (
    <div className="text-center font-serif text-lg py-2 flex items-center justify-center gap-2 h-10 overflow-hidden">
      <AnimatePresence mode="wait">
        {winner ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-[var(--color-brass)]"
          >
            Partie terminée
          </motion.span>
        ) : isMyTurn ? (
          <motion.span
            key="myturn"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-[var(--color-ivory)]"
          >
            C'est à vous de jouer
          </motion.span>
        ) : (
          <motion.span
            key="waiting"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-[var(--color-ivory)]/60"
          >
            {opponentName} réfléchit
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="inline-block w-1.5 h-1.5 bg-[var(--color-ivory)]/40 rounded-full"
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
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
