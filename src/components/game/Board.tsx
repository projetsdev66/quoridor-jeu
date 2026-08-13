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
  confirmWalls?: boolean;
  reducedMotion?: boolean;
  onMove: (pos: Position) => void;
  onWall: (wall: Wall) => void;
  onInvalidAction?: () => void;
}

export function Board({ gameState, localPlayer, mode, showPath, confirmWalls = true, reducedMotion = false, onMove, onWall, onInvalidAction }: BoardProps) {
  const [hoveredWall, setHoveredWall] = useState<Wall | null>(null);
  const [pendingWall, setPendingWall] = useState<Wall | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const triggerInvalid = () => {
    onInvalidAction?.();
    if (!reducedMotion) setIsShaking(true);
  };

  const isMyTurn = gameState.turn === localPlayer && !gameState.winner;
  const oppPos = gameState.pos[localPlayer === 'p1' ? 'p2' : 'p1'];
  const myPos = gameState.pos[localPlayer];

  useEffect(() => {
    if (!isMyTurn || !mode.startsWith('wall')) {
      setPendingWall(null);
      setHoveredWall(null);
    }
  }, [isMyTurn, mode]);

  useEffect(() => {
    if (!confirmWalls) {
      setPendingWall(null);
    }
  }, [confirmWalls]);

  const validMoves = useMemo(() => {
    if (mode !== 'move' || !isMyTurn) return [];
    return getValidMoves(myPos, oppPos, gameState.walls);
  }, [mode, isMyTurn, myPos, oppPos, gameState.walls]);

  const myGoalRow = localPlayer === 'p1' ? SIZE - 1 : 0;
  const pathHintSet = useMemo(() => {
    if (!showPath) return new Set<string>();
    const path = getShortestPath(myPos, myGoalRow, gameState.walls);
    return new Set(path.slice(1).map((p) => `${p.r},${p.c}`));
  }, [showPath, myPos, myGoalRow, gameState.walls]);

  const lastMovePos = useMemo(() => {
    if (gameState.lastAction?.type === 'move') return gameState.lastAction.pos;
    return null;
  }, [gameState.lastAction]);

  const handleCellClick = (r: number, c: number) => {
    if (mode !== 'move' || !isMyTurn) return;
    if (validMoves.some((m) => m.r === r && m.c === c)) {
      onMove({ r, c });
    } else {
      triggerInvalid();
    }
  };

  const handleWallHover = (wall: Wall) => {
    if (mode.startsWith('wall') && isMyTurn && canPlaceWall(wall, gameState)) {
      setHoveredWall(wall);
    }
  };

  const handleWallLeave = () => setHoveredWall(null);

  const placeWall = (wall: Wall) => {
    onWall(wall);
    setPendingWall(null);
    setHoveredWall(null);
  };

  const handleWallClick = (wall: Wall) => {
    if (!mode.startsWith('wall') || !isMyTurn) return;
    if (!canPlaceWall(wall, gameState)) {
      triggerInvalid();
      return;
    }

    if (!confirmWalls) {
      placeWall(wall);
      return;
    }

    const isSame =
      pendingWall &&
      pendingWall.row === wall.row &&
      pendingWall.col === wall.col &&
      pendingWall.orientation === wall.orientation;

    if (isSame) {
      placeWall(wall);
    } else {
      setPendingWall(wall);
      setHoveredWall(wall);
    }
  };

  const cells = [];
  let moveIndex = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const isValid = validMoves.some((m) => m.r === r && m.c === c);
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
          reducedMotion={reducedMotion}
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
    <div
      className={`relative mx-auto aspect-square w-full max-w-[460px] overflow-visible rounded-[26px] bg-[var(--color-wood-dark)] p-[3%] shadow-[0_24px_70px_rgba(0,0,0,0.42)] lg:max-w-[520px] ${isShaking ? 'animate-board-shake' : ''}`}
      onAnimationEnd={() => setIsShaking(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[26px] border-[6px] transition-colors duration-300"
        style={{
          borderColor: gameState.winner
            ? 'var(--color-brass)'
            : `${gameState.colors?.[gameState.turn] ?? 'var(--color-brass)'}99`,
        }}
      />

      <div className="pointer-events-none absolute inset-3 rounded-[20px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_30%)]" />

      <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[#eadfc4] shadow-[inset_0_0_24px_rgba(0,0,0,0.45)]">
        {cells}

        <AnimatePresence>
          {gameState.walls.map((w) => (
            <WallRender
              key={`w-${w.orientation}-${w.row}-${w.col}`}
              r={w.row}
              c={w.col}
              orientation={w.orientation}
              reducedMotion={reducedMotion}
              color={w.owner ? gameState.colors?.[w.owner] : undefined}
            />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {previewWall && isMyTurn && (
            <WallRender
              key={`preview-${previewWall.orientation}-${previewWall.row}-${previewWall.col}`}
              r={previewWall.row}
              c={previewWall.col}
              orientation={previewWall.orientation}
              isPreview
              reducedMotion={reducedMotion}
            />
          )}
        </AnimatePresence>

        <Pawn player="p1" color={gameState.colors?.p1 ?? '#c0392b'} r={gameState.pos.p1.r} c={gameState.pos.p1.c} isActive={gameState.turn === 'p1' && !gameState.winner} reducedMotion={reducedMotion} />
        <Pawn player="p2" color={gameState.colors?.p2 ?? '#3a6ea8'} r={gameState.pos.p2.r} c={gameState.pos.p2.c} isActive={gameState.turn === 'p2' && !gameState.winner} reducedMotion={reducedMotion} />

        {wallSlots}
      </div>

      <AnimatePresence>
        {pendingWall && isMyTurn && confirmWalls && (
          <div className="absolute -bottom-16 left-0 right-0 z-50 flex justify-center">
            <button
              className="rounded-full bg-[var(--color-brass)] px-6 py-2 text-base font-bold text-[#180f0a] shadow-lg transition-transform active:scale-95"
              onClick={() => placeWall(pendingWall)}
            >
              Confirmer le mur
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
