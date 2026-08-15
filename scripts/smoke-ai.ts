import { chooseAIMove } from '../src/lib/aiEngine';
import { applyMove, applyWall, getFreshState, getValidMoves, type Difficulty, type GameState, type MoveAction } from '../src/lib/gameLogic';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function isSame(a: { r: number; c: number }, b: { r: number; c: number }) {
  return a.r === b.r && a.c === b.c;
}

function prepareSolo(mode: GameState['mode'], difficulty: Difficulty): GameState {
  const state = getFreshState(2, mode);
  state.players = { p1: true, p2: true, p3: false, p4: false };
  state.wallsLeft = { p1: 10, p2: 10, p3: 0, p4: 0 };
  state.aiDifficulty = difficulty;
  return state;
}

function applyAiAction(state: GameState, action: MoveAction): GameState {
  if (action.type === 'move') return applyMove(state, 'p2', action.pos);
  return applyWall(state, 'p2', action.wall);
}

for (const mode of ['classic', 'blitz', 'survival'] as const) {
  for (const difficulty of ['easy', 'medium', 'hard', 'expert'] as Difficulty[]) {
    const state = prepareSolo(mode, difficulty);
    assert(state.players.p2, `${mode}/${difficulty}: p2 doit être actif`);
    const humanMoves = getValidMoves(state.pos.p1, state.pos.p2, state.walls);
    assert(humanMoves.length > 0, `${mode}/${difficulty}: aucun coup humain initial`);
    const afterHuman = applyMove(state, 'p1', humanMoves[0]);
    assert(afterHuman.turn === 'p2', `${mode}/${difficulty}: le tour ne passe pas à l'IA`);
    const action = chooseAIMove(afterHuman, 'p2', difficulty);
    const afterAi = applyAiAction(afterHuman, action);
    assert(afterAi.history.length === 2, `${mode}/${difficulty}: action IA non appliquée`);
    assert(afterAi.turn === 'p1' || afterAi.winner === 'p2', `${mode}/${difficulty}: tour IA incohérent`);
    if (action.type === 'move') {
      assert(getValidMoves(afterHuman.pos.p2, afterHuman.pos.p1, afterHuman.walls).some((pos) => isSame(pos, action.pos)), `${mode}/${difficulty}: déplacement IA illégal`);
    }
  }
}

console.log('OK: IA active et coups valides pour classic/blitz/survival, 4 difficultés');
