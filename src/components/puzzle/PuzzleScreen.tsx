import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { getFreshState, applyMove, applyWall, isGoalPosition, type GameState, type Position, type Wall } from '@/lib/gameLogic';
import { PUZZLES, type Puzzle } from '@/lib/puzzles';
import { recordPuzzleSolved } from '@/lib/puzzleProgress';
import { useSound } from '@/hooks/useSound';
import { useSettings } from '@/hooks/useSettings';
import { Board } from '@/components/game/Board';

interface PuzzleScreenProps {
  onHome: () => void;
  startIndex?: number;
}

function stateFromPuzzle(puzzle: Puzzle): GameState {
  const state = getFreshState();
  state.pos = { ...state.pos, p1: { ...puzzle.p1Start }, p2: { ...puzzle.p2Start } };
  state.walls = puzzle.walls;
  state.turn = 'p1';
  state.mode = 'puzzle';
  state.names = { ...state.names, p1: 'Vous', p2: 'Obstacle' };
  return state;
}

export function PuzzleScreen({ onHome, startIndex = 0 }: PuzzleScreenProps) {
  const [index, setIndex] = useState(() => Math.min(Math.max(startIndex, 0), PUZZLES.length - 1));
  const puzzle = PUZZLES[index];
  const [state, setState] = useState<GameState>(() => stateFromPuzzle(puzzle));
  const [movesUsed, setMovesUsed] = useState(0);
  const [boardMode, setBoardMode] = useState<'move' | 'wallH' | 'wallV'>('move');
  const [feedback, setFeedback] = useState('');
  const { settings } = useSettings();
  const { playMove, playWall, playError, playVictory } = useSound(settings.soundEnabled);

  const solved = isGoalPosition('p1', state.pos.p1, state.mode);
  const failed = !solved && movesUsed >= puzzle.maxMoves;
  const remainingMoves = Math.max(0, puzzle.maxMoves - movesUsed);

  useEffect(() => {
    if (solved) {
      recordPuzzleSolved(index);
      playVictory();
    } else if (failed) {
      playError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, failed]);

  const reset = (p: Puzzle = puzzle) => {
    setState(stateFromPuzzle(p));
    setMovesUsed(0);
    setBoardMode('move');
    setFeedback('');
  };

  const goToPuzzle = (i: number) => {
    const p = PUZZLES[i];
    setIndex(i);
    reset(p);
  };

  const handleMove = (pos: Position) => {
    if (solved || failed) return;
    const next = applyMove(state, 'p1', pos);
    if (next === state) {
      setFeedback('Coup impossible : choisissez une case voisine libre.');
      playError();
      return;
    }

    next.turn = 'p1'; // single-player puzzle: it's always "your" turn
    next.winner = isGoalPosition('p1', next.pos.p1, next.mode) ? 'p1' : null;
    setState(next);
    setFeedback('');
    setMovesUsed((value) => value + 1);
    playMove();
  };

  const handleWall = (wall: Wall) => {
    if (solved || failed) return;
    const next = applyWall(state, 'p1', wall);
    if (next === state) {
      setFeedback('Mur impossible : il doit rester un chemin vers la cible.');
      playError();
      return;
    }

    next.turn = 'p1';
    setState(next);
    setFeedback('');
    setMovesUsed((value) => value + 1);
    playWall();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--color-wood-dark)]">
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 max-w-5xl mx-auto w-full">
        <button onClick={onHome} aria-label="Retourner au menu" className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-[var(--color-ivory)]/70 transition-colors hover:text-[var(--color-ivory)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)]">
          <ArrowLeft className="w-4 h-4" /> Menu
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => index > 0 && goToPuzzle(index - 1)}
            disabled={index === 0}
            aria-label="Puzzle précédent"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3b2419] text-[var(--color-ivory)]/70 transition-colors hover:border-[var(--color-brass)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[7rem] text-center text-xs font-bold uppercase tracking-wide text-[var(--color-ivory)]/60">
            Puzzle {index + 1} / {PUZZLES.length}
          </span>
          <button
            onClick={() => index < PUZZLES.length - 1 && goToPuzzle(index + 1)}
            disabled={index === PUZZLES.length - 1}
            aria-label="Puzzle suivant"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3b2419] text-[var(--color-ivory)]/70 transition-colors hover:border-[var(--color-brass)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-24 max-w-5xl mx-auto w-full gap-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-serif font-bold text-[var(--color-brass)]">{puzzle.title}</h2>
          <p className="text-sm text-[var(--color-ivory)]/60 mt-1">{puzzle.description}</p>
          <p className="mt-2 rounded-lg border border-[var(--color-brass)]/20 bg-[var(--color-brass)]/5 px-3 py-2 text-left text-xs text-[var(--color-ivory)]/60"><strong className="text-[var(--color-brass)]">Conseil :</strong> {puzzle.hint}</p>
          <p className="text-xs text-[var(--color-ivory)]/50 mt-2 font-mono" aria-live="polite">
            Coups utilisés : {movesUsed} / {puzzle.maxMoves} · {remainingMoves} restant{remainingMoves > 1 ? 's' : ''}
          </p>
          {!solved && !failed && <p className="mt-2 text-xs text-[var(--color-ivory)]/45">Choisissez Déplacer pour avancer, ou un type de mur pour préparer votre détour.</p>}
          {feedback && <p className="mt-2 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-200" role="alert">{feedback}</p>}
        </div>

        <Board
          gameState={state}
          localPlayer="p1"
          mode={boardMode}
          showPath={false}
          confirmWalls={settings.confirmWalls}
          reducedMotion={settings.reducedMotion}
          onMove={handleMove}
          onWall={handleWall}
          onInvalidAction={() => {
            playError();
            setFeedback(boardMode === 'move' ? 'Action impossible avec ce pion.' : 'Ce mur ne peut pas être posé ici.');
          }}
        />

        {!solved && !failed && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#3b2419] bg-[var(--color-wood-dark)]/95 p-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur">
            <div className="mx-auto flex max-w-[460px] justify-center gap-2">
              <button
                onClick={() => setBoardMode('move')}
                aria-pressed={boardMode === 'move'}
                className={`min-h-11 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${boardMode === 'move' ? 'bg-[var(--color-brass)]/20 border-[var(--color-brass)]/60 text-[var(--color-brass)]' : 'border-[#3b2419] text-[var(--color-ivory)]/65'}`}
              >
                Déplacer
              </button>
              <button
                onClick={() => setBoardMode('wallH')}
                aria-pressed={boardMode === 'wallH'}
                className={`min-h-11 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${boardMode === 'wallH' ? 'bg-[var(--color-brass)]/20 border-[var(--color-brass)]/60 text-[var(--color-brass)]' : 'border-[#3b2419] text-[var(--color-ivory)]/65'}`}
              >
                Mur horizontal
              </button>
              <button
                onClick={() => setBoardMode('wallV')}
                aria-pressed={boardMode === 'wallV'}
                className={`min-h-11 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${boardMode === 'wallV' ? 'bg-[var(--color-brass)]/20 border-[var(--color-brass)]/60 text-[var(--color-brass)]' : 'border-[#3b2419] text-[var(--color-ivory)]/65'}`}
              >
                Mur vertical
              </button>
            </div>
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
                  <p className="font-bold text-[var(--color-ivory)]">Puzzle résolu en {movesUsed} coup{movesUsed > 1 ? 's' : ''} !</p>
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
                    className="flex-1 flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[var(--color-brass)] px-3 py-2 text-sm font-bold text-[#180f0a]"
                  >
                    Suivant <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {solved && index === PUZZLES.length - 1 && (
                  <button
                    onClick={onHome}
                    className="flex-1 min-h-11 rounded-lg bg-[var(--color-brass)] px-3 py-2 text-sm font-bold text-[#180f0a]"
                  >
                    Terminer les puzzles
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
