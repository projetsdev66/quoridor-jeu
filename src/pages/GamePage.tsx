import { useState } from 'react';
import { type GameState, type Player, getFreshState } from '@/lib/gameLogic';
import { type Difficulty } from '@/lib/aiEngine';
import { MainMenu } from '@/components/menu/MainMenu';
import { OnboardingScreen } from '@/components/menu/OnboardingScreen';
import { GameCore } from '@/components/game/GameCore';
import { PuzzleScreen } from '@/components/puzzle/PuzzleScreen';

type View = 'onboarding' | 'menu' | 'game' | 'puzzles';

function hasOnboarded(): boolean {
  try {
    return localStorage.getItem('quoridor_onboarded') === '1';
  } catch {
    return true; // if storage is unavailable, don't block the menu
  }
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
  expert: 'Expert',
};

function survivalDifficultyForRound(round: number): Difficulty {
  if (round <= 2) return 'easy';
  if (round <= 4) return 'medium';
  if (round <= 6) return 'hard';
  return 'expert';
}

export function GamePage() {
  const [view, setView] = useState<View>(() => (hasOnboarded() ? 'menu' : 'onboarding'));
  const [activeGame, setActiveGame] = useState<{
    state: GameState;
    roomId?: string;
    localPlayer: Player;
    survivalRound?: number;
  } | null>(null);
  const [playerName, setPlayerName] = useState('Vous');
  const [survivalActive, setSurvivalActive] = useState(false);

  const buildSoloState = (difficulty: Difficulty, name: string, mode: 'classic' | 'blitz' | 'survival', round?: number): GameState => {
    const state = getFreshState();
    state.aiDifficulty = difficulty;
    state.mode = mode;
    state.names.p1 = name || 'Vous';
    state.names.p2 = round
      ? `IA · Manche ${round} · ${DIFFICULTY_LABEL[difficulty]}`
      : `IA (${DIFFICULTY_LABEL[difficulty]})`;
    return state;
  };

  const handleStartSolo = (difficulty: Difficulty, name: string, mode: 'classic' | 'blitz') => {
    setPlayerName(name || 'Vous');
    setSurvivalActive(false);
    setActiveGame({ state: buildSoloState(difficulty, name, mode), localPlayer: 'p1' });
    setView('game');
  };

  const handleStartDuo = (name: string) => {
    const state = getFreshState();
    state.mode = 'duo';
    state.names.p1 = name || 'Joueur 1';
    state.names.p2 = 'Joueur 2';
    setPlayerName(name || 'Joueur 1');
    setSurvivalActive(false);
    setActiveGame({ state, localPlayer: 'p1' });
    setView('game');
  };

  const handleStartSurvival = (name: string) => {
    setPlayerName(name || 'Vous');
    setSurvivalActive(true);
    const round = 1;
    setActiveGame({
      state: buildSoloState('easy', name, 'survival', round),
      localPlayer: 'p1',
      survivalRound: round,
    });
    setView('game');
  };

  const handleSurvivalResult = (won: boolean) => {
    if (!survivalActive) return;
    if (!won) {
      // Run over — GameCore already recorded the best-round locally for display.
      setSurvivalActive(false);
      return;
    }
    setActiveGame((prev) => {
      const nextRound = (prev?.survivalRound ?? 1) + 1;
      const difficulty = survivalDifficultyForRound(nextRound);
      return {
        state: buildSoloState(difficulty, playerName, 'survival', nextRound),
        localPlayer: 'p1',
        survivalRound: nextRound,
      };
    });
  };

  const handleRoomCreated = (roomId: string, state: GameState) => {
    setSurvivalActive(false);
    setActiveGame({ state, roomId, localPlayer: 'p1' });
    setView('game');
  };

  const handleRoomJoined = (roomId: string, state: GameState) => {
    setSurvivalActive(false);
    setActiveGame({ state, roomId, localPlayer: 'p2' });
    setView('game');
  };

  const goHome = () => {
    setActiveGame(null);
    setSurvivalActive(false);
    setView('menu');
  };

  const handleOnboardingDone = (name: string) => {
    if (name) {
      setPlayerName(name);
      try { localStorage.setItem('quoridor_name', name); } catch { /* ignore */ }
    }
    try { localStorage.setItem('quoridor_onboarded', '1'); } catch { /* ignore */ }
    setView('menu');
  };

  if (view === 'onboarding') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-4">
        <OnboardingScreen onDone={handleOnboardingDone} />
      </div>
    );
  }

  if (view === 'game' && activeGame) {
    return (
      <GameCore
        key={activeGame.roomId || `local-${activeGame.survivalRound ?? 0}`}
        initialState={activeGame.state}
        roomId={activeGame.roomId}
        localPlayerId={activeGame.localPlayer}
        onHome={goHome}
        onSurvivalResult={survivalActive ? handleSurvivalResult : undefined}
        survivalRound={activeGame.survivalRound}
        onRestartSurvivalRun={survivalActive ? () => handleStartSurvival(playerName) : undefined}
      />
    );
  }

  if (view === 'puzzles') {
    return <PuzzleScreen onHome={goHome} />;
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
        onStartDuo={handleStartDuo}
        onStartSurvival={handleStartSurvival}
        onOpenPuzzles={() => setView('puzzles')}
        onRoomCreated={handleRoomCreated}
        onRoomJoined={handleRoomJoined}
      />
    </div>
  );
}
