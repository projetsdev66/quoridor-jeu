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
    <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-wood-dark)] border-b border-[#3b2419]">
      <div className="flex items-center gap-4">
        <h1 className="font-serif font-bold text-xl text-[var(--color-brass)] tracking-widest uppercase">
          QUORIDOR
        </h1>
        {gameTime && (
          <div className="font-mono text-[var(--color-ivory)]/70 text-sm hidden sm:block">
            {gameTime}
          </div>
        )}
        {roomId && (
          <div className="hidden sm:flex items-center bg-[#180f0a] px-3 py-1 rounded border border-[#3b2419]">
            <span className="text-[var(--color-ivory)]/50 text-xs mr-2">Salle</span>
            <span className="font-mono text-sm text-[var(--color-ivory)] tracking-widest">{roomId}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleSound}
          className="p-2 text-[var(--color-ivory)]/70 hover:text-[var(--color-brass)] transition-colors rounded-full hover:bg-[var(--color-wood-medium)]"
          title="Son"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
        <button 
          onClick={onRules}
          className="p-2 text-[var(--color-ivory)]/70 hover:text-[var(--color-brass)] transition-colors rounded-full hover:bg-[var(--color-wood-medium)]"
          title="Règles"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button 
          onClick={onQuit}
          className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-full hover:bg-red-400/10 ml-2"
          title="Quitter"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
