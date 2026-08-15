import { Copy, Crosshair, HelpCircle, LogOut, Settings2, Volume2, VolumeX } from 'lucide-react';

interface TopBarProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  onQuit: () => void;
  onRules: () => void;
  onSettings: () => void;
  onCopyRoom?: () => void;
  roomId?: string;
  gameTime?: string;
  modeLabel?: string;
  centerTarget?: boolean;
}

function IconButton({ title, onClick, children, danger }: { title: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)] sm:h-11 sm:w-11 ${
        danger
          ? 'text-red-400 hover:bg-red-400/10 hover:text-red-300'
          : 'text-[var(--color-ivory)]/70 hover:bg-[var(--color-wood-medium)] hover:text-[var(--color-brass)]'
      }`}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

export function TopBar({ soundEnabled, toggleSound, onQuit, onRules, onSettings, onCopyRoom, roomId, gameTime, modeLabel, centerTarget = false }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#3b2419] bg-[var(--color-wood-dark)]/95 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-2">
          <h1 className="min-w-0 truncate font-serif text-base font-bold uppercase tracking-[0.18em] text-[var(--color-brass)] sm:text-xl sm:tracking-widest">QUORIDOR</h1>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <IconButton title="Son" onClick={toggleSound}>
              {soundEnabled ? <Volume2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" /> : <VolumeX className="h-4.5 w-4.5 sm:h-5 sm:w-5" />}
            </IconButton>
            <IconButton title="Paramètres" onClick={onSettings}>
              <Settings2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </IconButton>
            <IconButton title="Règles" onClick={onRules}>
              <HelpCircle className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </IconButton>
            <IconButton title="Quitter" onClick={onQuit} danger>
              <LogOut className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </IconButton>
          </div>
        </div>

        {(gameTime || modeLabel || roomId) && (
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
            {gameTime && (
              <div className="rounded-full border border-[#3b2419] bg-[#180f0a] px-2.5 py-1 font-mono text-xs text-[var(--color-ivory)]/75 sm:text-sm">
                {gameTime}
              </div>
            )}
            {modeLabel && (
              <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-[var(--color-brass)]/35 bg-[var(--color-brass)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-brass)]" aria-label={centerTarget ? 'Format Centre : la case centrale est la cible' : `Format ${modeLabel}`}>
                {centerTarget && <Crosshair className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                <span className="truncate">{modeLabel}</span>
              </div>
            )}
            {roomId && (
              <div className="flex min-w-0 max-w-full items-center gap-1 rounded-full border border-[#3b2419] bg-[#180f0a] px-2 py-1 text-xs sm:text-sm">
                <span className="shrink-0 text-[var(--color-ivory)]/45">Salle</span>
                <span className="max-w-[9rem] truncate font-mono tracking-[0.2em] text-[var(--color-ivory)]">{roomId}</span>
                {onCopyRoom && (
                  <button
                    type="button"
                    onClick={onCopyRoom}
                    className="ml-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--color-ivory)]/60 transition-colors hover:bg-[var(--color-wood-medium)] hover:text-[var(--color-brass)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)]"
                    title="Copier le code"
                    aria-label="Copier le code de la salle"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
