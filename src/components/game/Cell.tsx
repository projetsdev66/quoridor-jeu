import { motion, AnimatePresence } from 'framer-motion';

interface CellProps {
  r: number;
  c: number;
  isValidMove: boolean;
  onClick: () => void;
  delayIndex: number;
}

export function Cell({ r, c, isValidMove, onClick, delayIndex }: CellProps) {
  const cellPct = 9.0909;
  const gapPct = 2.2727;

  const top = `${r * (cellPct + gapPct)}%`;
  const left = `${c * (cellPct + gapPct)}%`;

  return (
    <div
      className="absolute bg-[#5c3a24] rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border-b border-r border-[#3b2419]"
      style={{
        top,
        left,
        width: `${cellPct}%`,
        height: `${cellPct}%`,
      }}
    >
      <AnimatePresence>
        {isValidMove && (
          <motion.div
            key="valid"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ delay: delayIndex * 0.02, duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-30 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <div className="w-1/3 h-1/3 rounded-full bg-[var(--color-brass)]/60 hover:bg-[var(--color-brass)] transition-colors shadow-[0_0_8px_rgba(201,154,82,0.5)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
