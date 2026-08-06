import { Copy, HelpCircle, LogOut, Settings2, Volume2, VolumeX } from 'lucide-react';

interface TopBarProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  onQuit: () => void;
  onRules: () => void;
  onSettings: () => void;
  onCopyRoom?: () => void;
  roomId?: string;
  gameTime?: string;
}

function IconButton({ title, onClick, children, danger }: { title: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-full transition-colors ${
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

export function TopBar({ soundEnabled, toggleSound, onQuit, onRules, onSettings, onCopyRoom, roomId, gameTime }: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 border-b border-[#3b2419] bg-[var(--color-wood-dark)]/92 px-3 py-3 backdrop-blur sm:px-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="shrink-0 font-serif text-lg font-bold uppercase tracking-widest text-[var(--color-brass)] sm:text-xl">
              QUORIDOR
            </h1>

            {gameTime && (
              <div className="rounded-full border border-[#3b2419] bg-[#180f0a] px-2.5 py-1 font-mono text-xs text-[var(--color-ivory)]/75 sm:text-sm">
                {gameTime}
              </div>
            )}

            {roomId && (
              <div className="flex items-center gap-1 rounded-full border border-[#3b2419] bg-[#180f0a] px-2 py-1 text-xs sm:text-sm">
                <span className="text-[var(--color-ivory)]/45">Salle</span>
                <span className="font-mono tracking-[0.25em] text-[var(--color-ivory)]">{roomId}</span>
                {onCopyRoom && (
                  <button
                    onClick={onCopyRoom}
                    className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-ivory)]/60 transition-colors hover:bg-[var(--color-wood-medium)] hover:text-[var(--color-brass)]"
                    title="Copier le code"
                    aria-label="Copier le code de la salle"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton title="Son" onClick={toggleSound}>
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </IconButton>
          <IconButton title="Paramètres" onClick={onSettings}>
            <Settings2 className="h-5 w-5" />
          </IconButton>
          <IconButton title="Règles" onClick={onRules}>
            <HelpCircle className="h-5 w-5" />
          </IconButton>
          <IconButton title="Quitter" onClick={onQuit} danger>
            <LogOut className="h-5 w-5" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
