import { motion } from 'framer-motion';
import { Loader2, Share2, LogOut, Users } from 'lucide-react';
import type { PlayerCount } from '@/lib/gameLogic';

interface WaitingOverlayProps {
  roomId: string;
  maxPlayers: PlayerCount;
  joinedPlayers: number;
  onQuit: () => void;
}

export function WaitingOverlay({ roomId, maxPlayers, joinedPlayers, onQuit }: WaitingOverlayProps) {
  const remaining = Math.max(0, maxPlayers - joinedPlayers);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-2xl border-2 border-[var(--color-brass)] bg-[var(--color-wood-dark)] p-7 text-center shadow-2xl"
      >
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[var(--color-brass)]" />
        <h2 className="font-serif text-2xl font-bold text-[var(--color-ivory)]">Salle en préparation</h2>
        <p className="mt-2 text-sm text-[var(--color-ivory)]/60">
          Partagez ce code avec {remaining === 1 ? 'un autre joueur' : `${remaining} autres joueurs`}.
        </p>

        <div className="my-5 flex items-center justify-center gap-2 rounded-xl border border-[#3b2419] bg-[#180f0a] px-4 py-3">
          <Share2 className="h-4 w-4 text-[var(--color-brass)]" />
          <span className="font-mono text-2xl font-bold tracking-[0.3em] text-[var(--color-ivory)]">{roomId}</span>
        </div>

        <div className="mb-5 flex items-center justify-center gap-2 text-sm font-semibold text-[var(--color-brass)]">
          <Users className="h-4 w-4" />
          {joinedPlayers}/{maxPlayers} joueurs présents
        </div>

        <button
          onClick={onQuit}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#5c3a24] bg-[var(--color-wood-medium)] py-2.5 text-sm font-bold text-[var(--color-ivory)] transition-colors hover:bg-[#4a2e1b]"
        >
          <LogOut className="h-4 w-4" />
          Annuler
        </button>
      </motion.div>
    </div>
  );
}
