import { motion } from 'framer-motion';

interface WallRenderProps {
  r: number;
  c: number;
  orientation: 'H' | 'V';
  isPreview?: boolean;
  reducedMotion?: boolean;
}

export function WallRender({ r, c, orientation, isPreview = false, reducedMotion = false }: WallRenderProps) {
  const cellPct = 9.0909;
  const gapPct = 2.2727;

  const lengthPct = cellPct * 2 + gapPct;
  const widthPct = gapPct;

  const top = orientation === 'H'
    ? `${r * (cellPct + gapPct) + cellPct}%`
    : `${r * (cellPct + gapPct)}%`;

  const left = orientation === 'V'
    ? `${c * (cellPct + gapPct) + cellPct}%`
    : `${c * (cellPct + gapPct)}%`;

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { scale: 1.35, opacity: 0 }}
      animate={reducedMotion ? { opacity: isPreview ? 0.6 : 1 } : { scale: 1, opacity: isPreview ? 0.6 : 1 }}
      exit={reducedMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
      transition={reducedMotion ? { duration: 0.08 } : { duration: 0.22, ease: [0.3, 1.5, 0.4, 1] }}
      className={`absolute z-10 ${isPreview ? 'rounded-[2px] bg-[var(--color-brass)]/80' : 'rounded-[2px] border border-[#8a5b28] bg-[#e2a868] shadow-md shadow-black/60'}`}
      style={{
        top,
        left,
        width: orientation === 'H' ? `${lengthPct}%` : `${widthPct}%`,
        height: orientation === 'H' ? `${widthPct}%` : `${lengthPct}%`,
        ...(isPreview ? { pointerEvents: 'none', border: '1px dashed #fff' } : {}),
      }}
    />
  );
}
