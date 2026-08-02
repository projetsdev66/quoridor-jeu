import { useEffect, useRef } from 'react';
import { 
  type GameState, 
  type Position, 
  type Wall, 
  getValidMoves, 
  canPlaceWall, 
  bfsDistance, 
  SIZE 
} from '../lib/gameLogic';

interface AIProps {
  gameState: GameState;
  dispatchMove: (player: 'p1' | 'p2', pos: Position) => void;
  dispatchWall: (player: 'p1' | 'p2', wall: Wall) => void;
  isAIActive: boolean;
}

export function useAI({ gameState, dispatchMove, dispatchWall, isAIActive }: AIProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAIActive || gameState.winner || gameState.turn !== 'p2' || !gameState.aiDifficulty) return;

    const computeAndPlay = () => {
      const oppPos = gameState.pos.p1;
      const aiPos = gameState.pos.p2;
      const walls = gameState.walls;
      
      const validMoves = getValidMoves(aiPos, oppPos, walls);
      const possibleWalls: Wall[] = [];

      // Only evaluate walls if we have walls left, otherwise only evaluate moves
      if (gameState.wallsLeft.p2 > 0) {
        // AI Optimization: only check walls around the opponent to reduce search space
        const searchRadius = 3;
        const rMin = Math.max(0, oppPos.r - searchRadius);
        const rMax = Math.min(SIZE - 2, oppPos.r + searchRadius);
        const cMin = Math.max(0, oppPos.c - searchRadius);
        const cMax = Math.min(SIZE - 2, oppPos.c + searchRadius);

        for (let r = rMin; r <= rMax; r++) {
          for (let c = cMin; c <= cMax; c++) {
            const hw: Wall = { row: r, col: c, orientation: 'H' };
            const vw: Wall = { row: r, col: c, orientation: 'V' };
            if (canPlaceWall(hw, gameState)) possibleWalls.push(hw);
            if (canPlaceWall(vw, gameState)) possibleWalls.push(vw);
          }
        }
      }

      // Base distances
      const aiGoalRow = 0;
      const humGoalRow = SIZE - 1;
      const currentAiDist = bfsDistance(aiPos, aiGoalRow, walls);
      const currentHumDist = bfsDistance(oppPos, humGoalRow, walls);

      let bestMove: Position | null = null;
      let bestWall: Wall | null = null;
      let maxScore = -Infinity;

      // Evaluate moves
      for (const mv of validMoves) {
        const d = bfsDistance(mv, aiGoalRow, walls);
        // Score: we want to minimize our distance. So score is negative distance.
        const score = -d * 1.5; 
        if (score > maxScore) {
          maxScore = score;
          bestMove = mv;
          bestWall = null;
        }
      }

      // Evaluate walls depending on difficulty
      if (gameState.aiDifficulty !== 'easy' && possibleWalls.length > 0) {
        // Randomize a small subset to prevent full evaluation lag
        const subsetWalls = possibleWalls.sort(() => 0.5 - Math.random()).slice(0, gameState.aiDifficulty === 'hard' ? 40 : 15);
        
        for (const w of subsetWalls) {
          const trialWalls = walls.concat([w]);
          const newAiDist = bfsDistance(aiPos, aiGoalRow, trialWalls);
          const newHumDist = bfsDistance(oppPos, humGoalRow, trialWalls);
          
          if (newAiDist === Infinity || newHumDist === Infinity) continue;
          
          const humDistGain = newHumDist - currentHumDist;
          // Wall score: heavily weight increasing human distance, lightly weight our own distance
          const score = humDistGain * 9 - newAiDist * 1.5;
          
          if (score > maxScore) {
            maxScore = score;
            bestMove = null;
            bestWall = w;
          }
        }
      }

      // Easy: Add some randomness
      if (gameState.aiDifficulty === 'easy' && Math.random() < 0.55) {
        bestWall = null;
        bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      }

      // Execute action
      if (bestWall) {
        dispatchWall('p2', bestWall);
      } else if (bestMove) {
        dispatchMove('p2', bestMove);
      } else {
        // Fallback
        dispatchMove('p2', validMoves[0]);
      }
    };

    // Add a natural delay for AI
    timeoutRef.current = setTimeout(computeAndPlay, 800 + Math.random() * 600);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [gameState, dispatchMove, dispatchWall, isAIActive]);
}
