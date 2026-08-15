import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Link2, Loader2, LogOut, Share2, Users, Wifi } from 'lucide-react';
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
  const [shared, setShared] = useState(false);
  const [shareError, setShareError] = useState(false);

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

  const shareRoom = async () => {
    setShareError(false);
    try {
      if (typeof navigator.share !== 'function') {
        await copyRoomCode();
        return;
      }
      await navigator.share({
        title: 'Rejoignez ma partie de Quoridor',
        text: `Rejoignez ma salle Quoridor avec le code ${roomId}.`,
        url: window.location.href,
      });
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto overscroll-contain bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="waiting-room-title"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-[var(--color-brass)]/60 bg-[var(--color-wood-dark)] p-4 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-brass)]/35 bg-[var(--color-brass)]/10">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-brass)]" aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-wood-dark)] bg-emerald-400" aria-label="Connexion active" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="waiting-room-title" className="font-serif text-xl font-bold text-[var(--color-ivory)] sm:text-2xl">Salle en préparation</h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                <Wifi className="h-3 w-3" aria-hidden="true" /> En ligne
              </span>
            </div>
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
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={copyRoomCode}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#5c3a24] px-3 py-2 text-xs font-bold text-[var(--color-ivory)]/80 transition-colors hover:border-[var(--color-brass)] hover:text-[var(--color-ivory)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)]"
                aria-live="polite"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? 'Copié' : 'Copier'}
              </button>
              <button
                type="button"
                onClick={shareRoom}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--color-brass)]/35 bg-[var(--color-brass)]/10 px-3 py-2 text-xs font-bold text-[var(--color-brass)] transition-colors hover:bg-[var(--color-brass)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)]"
              >
                {shared ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
                {shared ? 'Partagé' : 'Partager'}
              </button>
            </div>
          </div>
          {(copyError || shareError) && <p className="mt-2 text-xs text-amber-300">Le partage automatique est indisponible. Envoyez le code {roomId} manuellement.</p>}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-brass)]">
            <Users className="h-4 w-4" aria-hidden="true" />
            <span>{joinedPlayers}/{maxPlayers} joueurs présents</span>
          </div>
          <span className="text-xs text-[var(--color-ivory)]/45">{remaining ? `Encore ${remaining} place${remaining > 1 ? 's' : ''}` : 'Prête'}</span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2" aria-label="Places de la salle">
          <AnimatePresence initial={false}>
            {PLAYER_IDS.slice(0, maxPlayers).map((player, index) => (
              <motion.div
                key={player}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: index * 0.04 }}
                className={`flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 ${players[player] ? 'border-[var(--color-brass)]/35 bg-[var(--color-brass)]/10' : 'border-[#3b2419] bg-[#180f0a]/60'}`}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${players[player] ? 'ring-2 ring-[var(--color-brass)]/25' : 'opacity-45'}`} style={{ backgroundColor: colors[player] }} aria-hidden="true" />
                <span className="min-w-0 truncate text-xs font-semibold text-[var(--color-ivory)]/80">{players[player] ? names[player] : `Place ${player.slice(1)}`}</span>
                <span className={`ml-auto shrink-0 text-[10px] ${players[player] ? 'text-emerald-300' : 'text-[var(--color-ivory)]/45'}`}>{players[player] ? 'Prêt' : 'Libre'}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-brass)]/15 bg-[var(--color-brass)]/[0.05] px-3 py-2.5 text-xs leading-5 text-[var(--color-ivory)]/55">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brass)]/15 text-[var(--color-brass)]">{remaining || '✓'}</span>
          <p>{remaining ? 'La partie démarrera automatiquement dès que les joueurs manquants auront rejoint la salle.' : 'Tous les joueurs sont présents. La partie va démarrer.'}</p>
        </div>

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
