import { motion } from 'framer-motion';
import { type Player } from '@/lib/gameLogic';
import { darkVariantFor } from '@/lib/playerColors';

interface PawnProps {
  player: Player;
  color: string;
  r: number;
  c: number;
  isActive: boolean;
  reducedMotion?: boolean;
}

export function Pawn({ player, color, r, c, isActive, reducedMotion = false }: PawnProps) {
  const cellPct = 9.0909;
  const gapPct = 2.2727;

  const top = `${r * (cellPct + gapPct)}%`;
  const left = `${c * (cellPct + gapPct)}%`;
  const dark = darkVariantFor(color);

  return (
    <motion.div
      initial={false}
      animate={{ top, left }}
      transition={reducedMotion ? { duration: 0.08 } : { type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute z-20 rounded-full border-[1.5px] shadow-lg"
      style={{
        width: `${cellPct * 0.7}%`,
        height: `${cellPct * 0.7}%`,
        marginTop: `${cellPct * 0.15}%`,
        marginLeft: `${cellPct * 0.15}%`,
        backgroundColor: color,
        borderColor: dark,
        boxShadow: isActive
          ? `0 0 15px ${color}cc`
          : '0 4px 6px -1px rgba(0, 0, 0, 0.6)',
      }}
      whileHover={isActive && !reducedMotion ? { scale: 1.1 } : {}}
    >
      <div className="absolute left-[15%] top-[15%] h-[30%] w-[30%] rounded-full bg-white/20" />
    </motion.div>
  );
}
