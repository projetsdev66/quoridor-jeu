import { useState } from 'react';
import { type GameState, type Player, getFreshState } from '@/lib/gameLogic';
import { MainMenu } from '@/components/menu/MainMenu';
import { GameCore } from '@/components/game/GameCore';

export function GamePage() {
  const [activeGame, setActiveGame] = useState<{ state: GameState; roomId?: string; localPlayer: Player } | null>(null);

  const handleStartSolo = (difficulty: 'easy' | 'medium' | 'hard', playerName: string) => {
    const state = getFreshState();
    state.aiDifficulty = difficulty;
    state.names.p1 = playerName || 'Vous';
    state.names.p2 =
      'IA ' + (difficulty === 'easy' ? '(Facile)' : difficulty === 'medium' ? '(Moyen)' : '(Difficile)');

    setActiveGame({ state, localPlayer: 'p1' });
  };

  const handleRoomCreated = (roomId: string, state: GameState) => {
    setActiveGame({ state, roomId, localPlayer: 'p1' });
  };

  const handleRoomJoined = (roomId: string, state: GameState) => {
    setActiveGame({ state, roomId, localPlayer: 'p2' });
  };

  if (activeGame) {
    return (
      <GameCore
        key={activeGame.roomId || 'local'}
        initialState={activeGame.state}
        roomId={activeGame.roomId}
        localPlayerId={activeGame.localPlayer}
        onHome={() => setActiveGame(null)}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden bg-cover bg-center">
      {/* Decorative background board elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] opacity-20 transform rotate-12 blur-sm pointer-events-none">
        <div className="w-full h-full border-[20px] border-[#5c3a24] rounded-xl grid grid-cols-3 gap-2 p-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-[#5c3a24] rounded-sm" />
          ))}
        </div>
      </div>

      <MainMenu
        onStartSolo={handleStartSolo}
        onRoomCreated={handleRoomCreated}
        onRoomJoined={handleRoomJoined}
      />
    </div>
  );
}
