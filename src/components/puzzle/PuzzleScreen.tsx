import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { getFreshState, applyMove, applyWall, type GameState, type Position, type Wall } from '@/lib/gameLogic';
import { PUZZLES, type Puzzle } from '@/lib/puzzles';
import { recordPuzzleSolved } from '@/lib/puzzleProgress';
import { Board } from '@/components/game/Board';

interface PuzzleScreenProps {
  onHome: () => void;
  startIndex?: number;
}

function stateFromPuzzle(puzzle: Puzzle): GameState {
  const state = getFreshState();
  state.pos = { p1: { ...puzzle.p1Start }, p2: { ...puzzle.p2Start } };
  state.walls = puzzle.walls;
  state.turn = 'p1';
  state.mode = 'puzzle';
  state.names = { p1: 'Vous', p2: 'Obstacle' };
  return state;
}

export function PuzzleScreen({ onHome, startIndex = 0 }: PuzzleScreenProps) {
  const [index, setIndex] = useState(() => Math.min(Math.max(startIndex, 0), PUZZLES.length - 1));
  const puzzle = PUZZLES[index];
  const [state, setState] = useState<GameState>(() => stateFromPuzzle(puzzle));
  const [movesUsed, setMovesUsed] = useState(0);
  const [wallsUsed, setWallsUsed] = useState(0);
  const [boardMode, setBoardMode] = useState<'move' | 'wallH' | 'wallV'>('move');

  const solved = state.pos.p1.r === 8;
  const failed = !solved && movesUsed >= puzzle.maxMoves;

  useEffect(() => {
    if (solved) recordPuzzleSolved(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  const reset = (p: Puzzle = puzzle) => {
    setState(stateFromPuzzle(p));
    setMovesUsed(0);
    setWallsUsed(0);
    setBoardMode('move');
  };

  const goToPuzzle = (i: number) => {
    const p = PUZZLES[i];
    setIndex(i);
    reset(p);
  };

  const handleMove = (pos: Position) => {
    if (solved || failed) return;
    setState((s) => {
      const next = applyMove(s, 'p1', pos);
      next.turn = 'p1'; // single-player puzzle: it's always "your" turn
      next.winner = null; // solved state is derived from position, not the win field
      return next;
    });
    setMovesUsed((m) => m + 1);
  };

  const handleWall = (wall: Wall) => {
    if (solved || failed) return;
    setState((s) => {
      const next = applyWall(s, 'p1', wall);
      next.turn = 'p1';
      return next;
    });
    setMovesUsed((m) => m + 1);
    setWallsUsed((w) => w + 1);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--color-wood-dark)]">
      <div className="flex items-center justify-between p-4 max-w-5xl mx-auto w-full">
        <button onClick={onHome} className="flex items-center gap-2 text-[var(--color-ivory)]/60 hover:text-[var(--color-ivory)]">
          <ArrowLeft className="w-4 h-4" /> Menu
        </button>
        <span className="text-xs font-bold text-[var(--color-ivory)]/40 uppercase tracking-wide">
          Puzzle {index + 1} / {PUZZLES.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-5xl mx-auto w-full gap-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-serif font-bold text-[var(--color-brass)]">{puzzle.title}</h2>
          <p className="text-sm text-[var(--color-ivory)]/60 mt-1">{puzzle.description}</p>
          <p className="text-xs text-[var(--color-ivory)]/40 mt-2 font-mono">
            Coups utilisés : {movesUsed} / {puzzle.maxMoves}
          </p>
        </div>

        <Board
          gameState={state}
          localPlayer="p1"
          mode={boardMode}
          showPath={false}
          onMove={handleMove}
          onWall={handleWall}
        />

        {!solved && !failed && (
          <div className="flex gap-2">
            <button
              onClick={() => setBoardMode('move')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${boardMode === 'move' ? 'bg-[var(--color-brass)]/20 border-[var(--color-brass)]/60 text-[var(--color-brass)]' : 'border-[#3b2419] text-[var(--color-ivory)]/40'}`}
            >
              Déplacer
            </button>
            <button
              onClick={() => setBoardMode('wallH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${boardMode === 'wallH' ? 'bg-[var(--color-brass)]/20 border-[var(--color-brass)]/60 text-[var(--color-brass)]' : 'border-[#3b2419] text-[var(--color-ivory)]/40'}`}
            >
              Mur horizontal
            </button>
            <button
              onClick={() => setBoardMode('wallV')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${boardMode === 'wallV' ? 'bg-[var(--color-brass)]/20 border-[var(--color-brass)]/60 text-[var(--color-brass)]' : 'border-[#3b2419] text-[var(--color-ivory)]/40'}`}
            >
              Mur vertical
            </button>
          </div>
        )}

        <AnimatePresence>
          {(solved || failed) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 bg-[#180f0a] border border-[#3b2419] rounded-xl p-5 max-w-sm w-full text-center"
            >
              {solved ? (
                <>
                  <CheckCircle2 className="w-10 h-10 text-[var(--color-brass)]" />
                  <p className="font-bold text-[var(--color-ivory)]">Puzzle résolu !</p>
                </>
              ) : (
                <>
                  <XCircle className="w-10 h-10 text-red-400" />
                  <p className="font-bold text-[var(--color-ivory)]">Trop de coups utilisés</p>
                </>
              )}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => reset()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--color-wood-medium)] text-[var(--color-ivory)] text-sm font-bold border border-[#5c3a24]"
                >
                  <RotateCcw className="w-4 h-4" /> Réessayer
                </button>
                {solved && index < PUZZLES.length - 1 && (
                  <button
                    onClick={() => goToPuzzle(index + 1)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--color-brass)] text-[#180f0a] text-sm font-bold"
                  >
                    Suivant <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
