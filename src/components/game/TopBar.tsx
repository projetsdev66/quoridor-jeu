import { Volume2, VolumeX, HelpCircle, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';

interface TopBarProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  onQuit: () => void;
  onRules: () => void;
  roomId?: string;
  gameTime?: string;
}

export function TopBar({ soundEnabled, toggleSound, onQuit, onRules, roomId, gameTime }: TopBarProps) {
  return (
    <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-[var(--color-wood-dark)] border-b border-[#3b2419] gap-2">
      <div className="flex items-center flex-wrap gap-2 sm:gap-4 min-w-0">
        <h1 className="font-serif font-bold text-lg sm:text-xl text-[var(--color-brass)] tracking-widest uppercase shrink-0">
          QUORIDOR
        </h1>
        {gameTime && (
          <div className="font-mono text-[var(--color-ivory)]/70 text-sm shrink-0">
            {gameTime}
          </div>
        )}
        {roomId && (
          <div className="flex items-center bg-[#180f0a] px-3 py-1 rounded border border-[#3b2419] shrink-0">
            <span className="text-[var(--color-ivory)]/50 text-xs mr-2">Salle</span>
            <span className="font-mono text-sm text-[var(--color-ivory)] tracking-widest">{roomId}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1 shrink-0">
        <button 
          onClick={toggleSound}
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-[var(--color-ivory)]/70 hover:text-[var(--color-brass)] transition-colors rounded-full hover:bg-[var(--color-wood-medium)]"
          title="Son"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
        <button 
          onClick={onRules}
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-[var(--color-ivory)]/70 hover:text-[var(--color-brass)] transition-colors rounded-full hover:bg-[var(--color-wood-medium)]"
          title="Règles"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button 
          onClick={onQuit}
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors rounded-full hover:bg-red-400/10"
          title="Quitter"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
