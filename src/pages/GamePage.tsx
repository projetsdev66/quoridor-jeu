import { useState } from 'react';
import { type GameState, type Player, type PlayerCount, PLAYER_IDS, getFreshState, wallsForPlayerCount } from '@/lib/gameLogic';
import { type Difficulty } from '@/lib/aiEngine';
import { DEFAULT_P1_COLOR, DEFAULT_P2_COLOR, PLAYER_COLORS } from '@/lib/playerColors';
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
  if (round <= 5) return 'medium';
  if (round <= 8) return 'hard';
  return 'expert';
}

/** A little extra search depth/time for the AI as rounds climb, on top of the difficulty tier bump above. */
function survivalSearchBoost(round: number): number {
  return Math.min(3, Math.floor(round / 3));
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
  const [puzzleStartIndex, setPuzzleStartIndex] = useState(0);

  const opponentColorFor = (myColor: string) => (myColor === DEFAULT_P1_COLOR ? DEFAULT_P2_COLOR : DEFAULT_P1_COLOR);

  const buildSoloState = (
    difficulty: Difficulty,
    name: string,
    mode: 'classic' | 'blitz' | 'survival',
    myColor: string,
    round?: number,
  ): GameState => {
    const state = getFreshState(2, mode);
    const wallCapacity = wallsForPlayerCount(2);
    state.players = { p1: true, p2: true, p3: false, p4: false };
    state.wallsLeft = { p1: wallCapacity, p2: wallCapacity, p3: 0, p4: 0 };
    state.aiDifficulty = difficulty;
    state.mode = mode;
    state.names.p1 = name || 'Vous';
    state.names.p2 = round
      ? `IA · Manche ${round} · ${DIFFICULTY_LABEL[difficulty]}`
      : `IA (${DIFFICULTY_LABEL[difficulty]})`;
    state.colors = { ...state.colors, p1: myColor, p2: opponentColorFor(myColor) };
    return state;
  };

  const handleStartSolo = (difficulty: Difficulty, name: string, mode: 'classic' | 'blitz', myColor: string) => {
    setPlayerName(name || 'Vous');
    setSurvivalActive(false);
    setActiveGame({ state: buildSoloState(difficulty, name, mode, myColor), localPlayer: 'p1' });
    setView('game');
  };

  const handleStartDuo = (name: string, myColor: string, playerCount: PlayerCount, gameMode: 'duo' | 'center' = 'duo') => {
    const state = getFreshState(playerCount, gameMode);
    const wallCapacity = wallsForPlayerCount(playerCount);
    const usedColors = new Set<string>();

    PLAYER_IDS.forEach((player, index) => {
      const active = index < playerCount;
      state.players[player] = active;
      state.wallsLeft[player] = active ? wallCapacity : 0;
      state.names[player] = index === 0 ? (name || 'Joueur 1') : `Joueur ${index + 1}`;

      const preferred = index === 0 ? myColor : undefined;
      const nextColor = preferred && !usedColors.has(preferred)
        ? preferred
        : PLAYER_COLORS.find((color) => !usedColors.has(color.hex))?.hex ?? state.colors[player];
      state.colors[player] = nextColor;
      usedColors.add(nextColor);
    });

    state.mode = gameMode;
    setPlayerName(name || 'Joueur 1');
    setSurvivalActive(false);
    setActiveGame({ state, localPlayer: 'p1' });
    setView('game');
  };

  const handleStartSurvival = (name: string, myColor: string, startRound?: number) => {
    setPlayerName(name || 'Vous');
    setSurvivalActive(true);
    const round = startRound && startRound > 0 ? startRound : 1;
    const difficulty = survivalDifficultyForRound(round);
    setActiveGame({
      state: buildSoloState(difficulty, name, 'survival', myColor, round),
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
      const myColor = prev?.state.colors?.p1 ?? DEFAULT_P1_COLOR;
      return {
        state: buildSoloState(difficulty, playerName, 'survival', myColor, nextRound),
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

  const handleRoomJoined = (roomId: string, state: GameState, playerId: Player) => {
    setSurvivalActive(false);
    setActiveGame({ state, roomId, localPlayer: playerId });
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
        key={activeGame.roomId || `local-${activeGame.state.mode ?? 'classic'}-${activeGame.state.maxPlayers}-${activeGame.survivalRound ?? 0}`}
        initialState={activeGame.state}
        roomId={activeGame.roomId}
        localPlayerId={activeGame.localPlayer}
        onHome={goHome}
        onSurvivalResult={survivalActive ? handleSurvivalResult : undefined}
        survivalRound={activeGame.survivalRound}
        survivalSearchBoost={activeGame.survivalRound ? survivalSearchBoost(activeGame.survivalRound) : 0}
        onRestartSurvivalRun={
          survivalActive
            ? () => handleStartSurvival(playerName, activeGame.state.colors?.p1 ?? DEFAULT_P1_COLOR, 1)
            : undefined
        }
      />
    );
  }

  if (view === 'puzzles') {
    return <PuzzleScreen onHome={goHome} startIndex={puzzleStartIndex} />;
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
        onOpenPuzzles={(startIndex) => {
          setPuzzleStartIndex(startIndex ?? 0);
          setView('puzzles');
        }}
        onRoomCreated={handleRoomCreated}
        onRoomJoined={handleRoomJoined}
      />
    </div>
  );
}
