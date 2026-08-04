import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  type GameState,
  type Player,
  type Position,
  type Wall,
  SIZE,
  getValidMoves,
  canPlaceWall,
  getShortestPath,
} from '@/lib/gameLogic';
import { Cell } from './Cell';
import { Pawn } from './Pawn';
import { WallRender } from './WallRender';
import { WallSlot } from './WallSlot';

interface BoardProps {
  gameState: GameState;
  localPlayer: Player;
  mode: 'move' | 'wallH' | 'wallV';
  showPath?: boolean;
  onMove: (pos: Position) => void;
  onWall: (wall: Wall) => void;
}

export function Board({ gameState, localPlayer, mode, showPath, onMove, onWall }: BoardProps) {
  const [hoveredWall, setHoveredWall] = useState<Wall | null>(null);
  const [pendingWall, setPendingWall] = useState<Wall | null>(null);

  const isMyTurn = gameState.turn === localPlayer && !gameState.winner;
  const oppPos = gameState.pos[localPlayer === 'p1' ? 'p2' : 'p1'];
  const myPos = gameState.pos[localPlayer];

  useEffect(() => {
    if (!isMyTurn || !mode.startsWith('wall')) {
      setPendingWall(null);
      setHoveredWall(null);
    }
  }, [isMyTurn, mode]);

  const validMoves = useMemo(() => {
    if (mode !== 'move' || !isMyTurn) return [];
    return getValidMoves(myPos, oppPos, gameState.walls);
  }, [mode, isMyTurn, myPos, oppPos, gameState.walls]);

  // Path hint: shortest path cells for the local player (excluding current position)
  const myGoalRow = localPlayer === 'p1' ? SIZE - 1 : 0;
  const pathHintSet = useMemo(() => {
    if (!showPath) return new Set<string>();
    const path = getShortestPath(myPos, myGoalRow, gameState.walls);
    // Skip index 0 (current position), highlight the rest
    return new Set(path.slice(1).map(p => `${p.r},${p.c}`));
  }, [showPath, myPos, myGoalRow, gameState.walls]);

  // Last move highlight (opponent's last move)
  const lastMovePos = useMemo(() => {
    if (gameState.lastAction?.type === 'move') return gameState.lastAction.pos;
    return null;
  }, [gameState.lastAction]);

  const handleCellClick = (r: number, c: number) => {
    if (mode === 'move' && isMyTurn) {
      if (validMoves.some(m => m.r === r && m.c === c)) {
        onMove({ r, c });
      }
    }
  };

  const handleWallHover = (wall: Wall) => {
    if (mode.startsWith('wall') && isMyTurn && canPlaceWall(wall, gameState)) {
      setHoveredWall(wall);
    }
  };

  const handleWallLeave = () => setHoveredWall(null);

  const handleWallClick = (wall: Wall) => {
    if (!mode.startsWith('wall') || !isMyTurn) return;
    if (!canPlaceWall(wall, gameState)) return;

    const isSame =
      pendingWall &&
      pendingWall.row === wall.row &&
      pendingWall.col === wall.col &&
      pendingWall.orientation === wall.orientation;

    if (isSame) {
      onWall(wall);
      setPendingWall(null);
      setHoveredWall(null);
    } else {
      setPendingWall(wall);
      setHoveredWall(wall);
    }
  };

  const cells = [];
  let moveIndex = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const isValid = validMoves.some(m => m.r === r && m.c === c);
      const isLastMove = lastMovePos?.r === r && lastMovePos?.c === c;
      const isPathHint = pathHintSet.has(`${r},${c}`);
      cells.push(
        <Cell
          key={`c-${r}-${c}`}
          r={r}
          c={c}
          isValidMove={isValid}
          isLastMove={isLastMove}
          isPathHint={isPathHint && !isValid}
          onClick={() => handleCellClick(r, c)}
          delayIndex={isValid ? moveIndex++ : 0}
        />,
      );
    }
  }

  const wallSlots = [];
  if (mode === 'wallH' || mode === 'wallV') {
    const orientation = mode === 'wallH' ? 'H' : 'V';
    for (let r = 0; r < SIZE - 1; r++) {
      for (let c = 0; c < SIZE - 1; c++) {
        const wall: Wall = { row: r, col: c, orientation };
        const valid = canPlaceWall(wall, gameState);
        wallSlots.push(
          <WallSlot
            key={`ws-${orientation}-${r}-${c}`}
            r={r}
            c={c}
            orientation={orientation}
            isValid={valid}
            isHovered={
              hoveredWall?.row === r &&
              hoveredWall?.col === c &&
              hoveredWall?.orientation === orientation
            }
            onHover={() => handleWallHover(wall)}
            onLeave={handleWallLeave}
            onClick={() => handleWallClick(wall)}
          />,
        );
      }
    }
  }

  const previewWall = pendingWall ?? hoveredWall;

  return (
    <div className="relative w-full max-w-[460px] lg:max-w-[520px] aspect-square mx-auto bg-[var(--color-wood-dark)] rounded-lg shadow-2xl p-[3%] overflow-visible">
      {/* Wooden Frame */}
      <div
        className={`absolute inset-0 border-[6px] rounded-lg pointer-events-none transition-colors duration-300 ${
          gameState.winner
            ? 'border-[var(--color-brass)]'
            : gameState.turn === 'p1'
            ? 'border-[var(--color-p1)]/60'
            : 'border-[var(--color-p2)]/60'
        }`}
      />

      {/* Board Surface */}
      <div className="relative w-full h-full bg-[#eadfc4] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
        {cells}

        {/* Placed Walls */}
        <AnimatePresence>
          {gameState.walls.map(w => (
            <WallRender key={`w-${w.orientation}-${w.row}-${w.col}`} r={w.row} c={w.col} orientation={w.orientation} />
          ))}
        </AnimatePresence>

        {/* Hover / Pending Wall Preview */}
        <AnimatePresence>
          {previewWall && isMyTurn && (
            <WallRender
              key={`preview-${previewWall.orientation}-${previewWall.row}-${previewWall.col}`}
              r={previewWall.row}
              c={previewWall.col}
              orientation={previewWall.orientation}
              isPreview
            />
          )}
        </AnimatePresence>

        {/* Pawns */}
        <Pawn player="p1" r={gameState.pos.p1.r} c={gameState.pos.p1.c} isActive={gameState.turn === 'p1' && !gameState.winner} />
        <Pawn player="p2" r={gameState.pos.p2.r} c={gameState.pos.p2.c} isActive={gameState.turn === 'p2' && !gameState.winner} />

        {/* Wall Interaction Slots */}
        {wallSlots}
      </div>

      {/* Mobile Confirm Button for Pending Wall */}
      <AnimatePresence>
        {pendingWall && isMyTurn && (
          <div className="absolute -bottom-16 left-0 right-0 flex justify-center z-50">
            <button
              className="bg-[var(--color-brass)] text-[#180f0a] px-6 py-2 rounded-full font-bold text-lg shadow-lg active:scale-95 transition-transform"
              onClick={() => {
                onWall(pendingWall);
                setPendingWall(null);
                setHoveredWall(null);
              }}
            >
              Confirmer le mur
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
