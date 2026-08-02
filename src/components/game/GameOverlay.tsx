import { motion } from 'framer-motion';
import { Trophy, Frown, RotateCcw, Home } from 'lucide-react';
import { type Player } from '@/lib/gameLogic';

interface GameOverlayProps {
  winner: Player | null;
  localPlayer: Player;
  onRestart: () => void;
  onHome: () => void;
}

export function GameOverlay({ winner, localPlayer, onRestart, onHome }: GameOverlayProps) {
  if (!winner) return null;

  const isWin = winner === localPlayer;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[var(--color-wood-dark)] border-2 border-[var(--color-brass)] p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center"
      >
        <div className="flex justify-center mb-6">
          {isWin ? (
            <Trophy className="w-20 h-20 text-[var(--color-brass)]" />
          ) : (
            <Frown className="w-20 h-20 text-[var(--color-ivory)]/40" />
          )}
        </div>
        
        <h2 className="text-3xl font-serif font-bold text-[var(--color-ivory)] mb-2">
          {isWin ? 'Victoire !' : 'Défaite'}
        </h2>
        <p className="text-[var(--color-ivory)]/70 mb-8">
          {isWin ? 'Vous avez brillamment atteint le côté opposé.' : 'Votre adversaire a été plus rusé cette fois-ci.'}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-brass)] text-[#180f0a] font-bold py-3 rounded-lg hover:bg-[#e2a868] transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Rejouer
          </button>
          
          <button 
            onClick={onHome}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-wood-medium)] text-[var(--color-ivory)] font-bold py-3 rounded-lg hover:bg-[#4a2e1b] transition-colors border border-[#5c3a24]"
          >
            <Home className="w-5 h-5" />
            Menu Principal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
