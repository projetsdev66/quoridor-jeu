import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Loader2, LogOut, Share2, Users } from 'lucide-react';
import type { Player, PlayerCount } from '@/lib/gameLogic';
import { PLAYER_IDS } from '@/lib/gameLogic';

interface WaitingOverlayProps {
  roomId: string;
  maxPlayers: PlayerCount;
  joinedPlayers: number;
  players: Record<Player, boolean>;
  names: Record<Player, string>;
  colors: Record<Player, string>;
  onQuit: () => void;
  centerTarget?: boolean;
}

export function WaitingOverlay({
  roomId,
  maxPlayers,
  joinedPlayers,
  players,
  names,
  colors,
  onQuit,
  centerTarget = false,
}: WaitingOverlayProps) {
  const remaining = Math.max(0, maxPlayers - joinedPlayers);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const copyRoomCode = async () => {
    setCopyError(false);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(roomId);
      } else {
        const helper = document.createElement('textarea');
        helper.value = roomId;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        const copiedWithFallback = document.execCommand('copy');
        helper.remove();
        if (!copiedWithFallback) throw new Error('COPY_FAILED');
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="waiting-room-title"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="my-auto w-full max-w-md rounded-2xl border border-[var(--color-brass)]/60 bg-[var(--color-wood-dark)] p-4 shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-brass)]/35 bg-[var(--color-brass)]/10">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-brass)]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 id="waiting-room-title" className="font-serif text-xl font-bold text-[var(--color-ivory)] sm:text-2xl">Salle en préparation</h2>
            <p className="mt-1 text-sm leading-5 text-[var(--color-ivory)]/65">
              {centerTarget ? 'Format Centre : le premier joueur qui atteint la case centrale gagne.' : 'Format Bords : chaque joueur doit rejoindre son côté cible.'}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#3b2419] bg-[#180f0a] p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Share2 className="h-4 w-4 shrink-0 text-[var(--color-brass)]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ivory)]/45">Code à partager</p>
                <p className="truncate font-mono text-2xl font-bold tracking-[0.24em] text-[var(--color-ivory)]" aria-label={`Code de salle ${roomId}`}>{roomId}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={copyRoomCode}
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-[#5c3a24] px-3 py-2 text-xs font-bold text-[var(--color-ivory)]/80 transition-colors hover:border-[var(--color-brass)] hover:text-[var(--color-ivory)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)]"
              aria-live="polite"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
          {copyError && <p className="mt-2 text-xs text-amber-300">Copie automatique indisponible. Maintenez le code appuyé pour le copier.</p>}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-brass)]">
            <Users className="h-4 w-4" aria-hidden="true" />
            <span>{joinedPlayers}/{maxPlayers} joueurs présents</span>
          </div>
          <span className="text-xs text-[var(--color-ivory)]/45">{remaining ? `Encore ${remaining} place${remaining > 1 ? 's' : ''}` : 'Prête'}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2" aria-label="Places de la salle">
          {PLAYER_IDS.slice(0, maxPlayers).map((player) => (
            <div key={player} className={`flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 ${players[player] ? 'border-[var(--color-brass)]/35 bg-[var(--color-brass)]/10' : 'border-[#3b2419] bg-[#180f0a]/60'}`}>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[player] }} aria-hidden="true" />
              <span className="min-w-0 truncate text-xs font-semibold text-[var(--color-ivory)]/80">{players[player] ? names[player] : `Place ${player.slice(1)}`}</span>
              <span className="ml-auto shrink-0 text-[10px] text-[var(--color-ivory)]/45">{players[player] ? 'Prêt' : 'Libre'}</span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-center text-xs leading-5 text-[var(--color-ivory)]/50">La partie démarre automatiquement lorsque toutes les places sont occupées.</p>

        <button
          type="button"
          onClick={onQuit}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#5c3a24] bg-[var(--color-wood-medium)] py-2.5 text-sm font-bold text-[var(--color-ivory)] transition-colors hover:bg-[#4a2e1b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)]"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Quitter la salle
        </button>
      </motion.div>
    </div>
  );
}
