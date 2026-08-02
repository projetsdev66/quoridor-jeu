import { type Player } from '@/lib/gameLogic';

interface PlayerCardProps {
  player: Player;
  name: string;
  wallsLeft: number;
  isActive: boolean;
  isLocal: boolean;
}

export function PlayerCard({ player, name, wallsLeft, isActive, isLocal }: PlayerCardProps) {
  return (
    <div 
      className={`relative p-4 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-[var(--color-wood-medium)] shadow-[0_0_20px_rgba(201,154,82,0.15)] scale-[1.02] border-[1px] border-[var(--color-brass)]/30' 
          : 'bg-[var(--color-wood-dark)] border-[1px] border-transparent opacity-80'
      }`}
    >
      <div className="flex items-center gap-3">
        <div 
          className={`w-10 h-10 rounded-full shadow-inner flex items-center justify-center font-bold text-white ${
            player === 'p1' ? 'bg-[var(--color-p1)]' : 'bg-[var(--color-p2)]'
          }`}
        >
          {isLocal ? 'Moi' : 'IA'}
        </div>
        <div className="flex-1">
          <div className="font-serif font-bold text-lg text-[var(--color-ivory)] flex items-center justify-between">
            <span>{name}</span>
            {isActive && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brass)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brass)]"></span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className={`h-3 w-2 rounded-sm ${
                  i < wallsLeft ? 'bg-[#e2a868] shadow-sm' : 'bg-[#180f0a] opacity-30'
                }`} 
              />
            ))}
            <span className="text-xs text-[var(--color-ivory)]/60 ml-2 font-mono">{wallsLeft}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
