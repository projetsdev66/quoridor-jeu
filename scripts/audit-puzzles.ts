import { PUZZLES } from '@/lib/puzzles';
import {
  applyMove,
  bfsDistanceForPlayer,
  getFreshState,
  getGoal,
  getStartPosition,
  isGoalPosition,
  type GameState,
  type Player,
} from '@/lib/gameLogic';

const failures: string[] = [];

for (const [index, puzzle] of PUZZLES.entries()) {
  const state = getFreshState(2);
  const puzzleState: GameState = {
    ...state,
    pos: { ...state.pos, p1: { ...puzzle.p1Start }, p2: { ...puzzle.p2Start } },
    walls: puzzle.walls,
    mode: 'puzzle',
  };
  const distance = bfsDistanceForPlayer(puzzleState.pos.p1, 'p1', puzzleState.walls);

  if (!Number.isFinite(distance)) failures.push(`${puzzle.id}: aucun chemin vers l’objectif`);
  if (distance > puzzle.maxMoves) failures.push(`${puzzle.id}: chemin minimal ${distance} > limite ${puzzle.maxMoves}`);
  const invalidMove = applyMove(puzzleState, 'p1', { r: 8, c: 8 });
  if (invalidMove !== puzzleState) failures.push(`${puzzle.id}: un coup illégal a modifié l’état`);
  if (puzzleState.pos.p1.r < 0 || puzzleState.pos.p1.r > 8 || puzzleState.pos.p1.c < 0 || puzzleState.pos.p1.c > 8) {
    failures.push(`${puzzle.id}: position p1 hors plateau`);
  }
  if (puzzleState.pos.p2.r < 0 || puzzleState.pos.p2.r > 8 || puzzleState.pos.p2.c < 0 || puzzleState.pos.p2.c > 8) {
    failures.push(`${puzzle.id}: position p2 hors plateau`);
  }
  for (const wall of puzzle.walls) {
    if (wall.row < 0 || wall.row > 7 || wall.col < 0 || wall.col > 7) failures.push(`${puzzle.id}: mur hors plateau`);
  }
}

const starts: Record<Player, { r: number; c: number }> = {
  p1: getStartPosition('p1'),
  p2: getStartPosition('p2'),
  p3: getStartPosition('p3'),
  p4: getStartPosition('p4'),
};
const goals = (['p1', 'p2', 'p3', 'p4'] as Player[]).map((player) => getGoal(player));
const uniqueStarts = new Set(Object.values(starts).map(({ r, c }) => `${r},${c}`));
if (uniqueStarts.size !== 4) failures.push('les quatre positions de départ ne sont pas distinctes');
if (goals.length !== 4 || !isGoalPosition('p1', { r: 8, c: 0 }) || !isGoalPosition('p2', { r: 0, c: 8 }) || !isGoalPosition('p3', { r: 0, c: 8 }) || !isGoalPosition('p4', { r: 0, c: 0 })) {
  failures.push('objectifs multi-joueurs incohérents');
}

const centerState = getFreshState(4, 'center');
if (centerState.mode !== 'center' || centerState.pos.p1.r !== 0 || centerState.pos.p1.c !== 0 || centerState.pos.p4.r !== 8 || centerState.pos.p4.c !== 8) {
  failures.push('format centre: départs aux coins incohérents');
}
if (bfsDistanceForPlayer(centerState.pos.p1, 'p1', [], 'center') !== 8 || !isGoalPosition('p4', { r: 4, c: 4 }, 'center')) {
  failures.push('format centre: chemin ou cible commune incohérent');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`OK: ${PUZZLES.length} puzzles et objectifs 2/3/4 joueurs validés`);
