import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair } from 'lucide-react';

interface CellProps {
  r: number;
  c: number;
  isValidMove: boolean;
  isLastMove?: boolean;
  isPathHint?: boolean;
  isCenterTarget?: boolean;
  reducedMotion?: boolean;
  onClick: () => void;
  delayIndex: number;
}

export function Cell({ r, c, isValidMove, isLastMove, isPathHint, isCenterTarget = false, reducedMotion = false, onClick, delayIndex }: CellProps) {
  const cellPct = 9.0909;
  const gapPct = 2.2727;

  const top = `${r * (cellPct + gapPct)}%`;
  const left = `${c * (cellPct + gapPct)}%`;

  return (
    <div
      className="absolute rounded-sm border-b border-r border-[#3b2419] bg-[#5c3a24] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
      style={{
        top,
        left,
        width: `${cellPct}%`,
        height: `${cellPct}%`,
      }}
    >
      {isCenterTarget && (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-sm border-2 border-[#d9a441] bg-[#d9a441]/25 shadow-[inset_0_0_12px_rgba(217,164,65,0.55)]"
          aria-label="Cible centrale"
          title="Cible centrale"
        >
          <Crosshair className="h-1/2 w-1/2 text-[#ffe5a3] drop-shadow-[0_0_5px_rgba(217,164,65,0.85)]" strokeWidth={2.5} />
        </div>
      )}

      {isLastMove && (
        <div
          className="pointer-events-none absolute inset-0 rounded-sm"
          style={{ background: 'rgba(201,154,82,0.18)', boxShadow: 'inset 0 0 0 1px rgba(201,154,82,0.35)' }}
        />
      )}

      {isPathHint && !isValidMove && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full"
            style={{
              width: '28%',
              height: '28%',
              background: 'rgba(201,154,82,0.28)',
              boxShadow: '0 0 6px rgba(201,154,82,0.3)',
            }}
          />
        </div>
      )}

      <AnimatePresence>
        {isValidMove && (
          <motion.div
            key="valid"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
            transition={{ delay: reducedMotion ? 0 : delayIndex * 0.02, duration: reducedMotion ? 0.1 : 0.2 }}
            className="absolute inset-0 z-30 flex cursor-pointer touch-manipulation items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe5a3]"
            role="button"
            tabIndex={0}
            aria-label={`Déplacer vers la ligne ${r + 1}, colonne ${c + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onClick();
              }
            }}
          >
            <div className="h-1/3 w-1/3 rounded-full bg-[var(--color-brass)]/60 shadow-[0_0_8px_rgba(201,154,82,0.5)] transition-colors hover:bg-[var(--color-brass)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
