import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import { type Player } from '@/lib/gameLogic';

interface PassDeviceOverlayProps {
  nextPlayer: Player;
  nextPlayerLabel: string;
  nextPlayerName: string;
  onReady: () => void;
}

export function PassDeviceOverlay({ nextPlayer, nextPlayerLabel, nextPlayerName, onReady }: PassDeviceOverlayProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="bg-[var(--color-wood-dark)] border-2 border-[var(--color-brass)] p-8 rounded-2xl shadow-2xl w-full max-w-xs text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex justify-center mb-4"
        >
          <Smartphone className="w-14 h-14 text-[var(--color-brass)]" />
        </motion.div>

        <div
          className={`w-12 h-12 rounded-full mx-auto mb-3 shadow-inner flex items-center justify-center font-bold text-white ${
            nextPlayer === 'p1' ? 'bg-[var(--color-p1)]' : 'bg-[var(--color-p2)]'
          }`}
        >
          {nextPlayerLabel}
        </div>

        <p className="text-[var(--color-ivory)]/60 text-sm mb-1">Au tour de</p>
        <h3 className="text-2xl font-serif font-bold text-[var(--color-ivory)] mb-6">{nextPlayerName}</h3>

        <button
          onClick={onReady}
          className="w-full py-3 bg-[var(--color-brass)] text-[#180f0a] font-bold rounded-xl hover:bg-[#e2a868] transition-colors"
        >
          Passez l'appareil — Je suis prêt
        </button>
      </motion.div>
    </div>
  );
}
