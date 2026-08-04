import { useEffect, useRef } from 'react';
import { type GameState, type Position, type Wall } from '../lib/gameLogic';
import { chooseAIMove, type Difficulty } from '../lib/aiEngine';

interface AIProps {
  gameState: GameState;
  dispatchMove: (player: 'p1' | 'p2', pos: Position) => void;
  dispatchWall: (player: 'p1' | 'p2', wall: Wall) => void;
  isAIActive: boolean;
}

export function useAI({ gameState, dispatchMove, dispatchWall, isAIActive }: AIProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAIActive || gameState.winner || gameState.turn !== 'p2' || !gameState.aiDifficulty) return;

    const computeAndPlay = () => {
      const difficulty = gameState.aiDifficulty as Difficulty;
      const action = chooseAIMove(gameState, 'p2', difficulty);

      if (action.type === 'wall') {
        dispatchWall('p2', action.wall);
      } else {
        dispatchMove('p2', action.pos);
      }
    };

    // Natural "thinking" delay so the AI doesn't feel instant/robotic
    timeoutRef.current = setTimeout(computeAndPlay, 500 + Math.random() * 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [gameState, dispatchMove, dispatchWall, isAIActive]);
}
