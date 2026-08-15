import {
  activePlayers,
  applyMove,
  applyWall,
  getFreshState,
  getGoal,
  getShortestPathForPlayer,
  isGoalPosition,
  SIZE,
  wallsForPlayerCount,
  type Player,
} from '../src/lib/gameLogic.ts';

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function activate(state: ReturnType<typeof getFreshState>, count: 3 | 4) {
  for (const player of ['p1', 'p2', 'p3', 'p4'] as const) {
    const active = Number(player.slice(1)) <= count;
    state.players[player] = active;
    state.wallsLeft[player] = active ? wallsForPlayerCount(count) : 0;
  }
  return state;
}

const state3 = activate(getFreshState(3), 3);
assert(activePlayers(state3).length === 3, 'Le mode local 3 joueurs doit activer exactement trois pions');
assert(state3.wallsLeft.p1 === 5 && state3.wallsLeft.p2 === 5 && state3.wallsLeft.p3 === 5, 'Les trois joueurs doivent commencer avec cinq murs');
assert(getGoal('p3').axis === 'col' && getGoal('p3').index === SIZE - 1, 'p3 doit viser le bord est');

const p1Move = applyMove(state3, 'p1', { r: 1, c: 4 });
const p2Move = applyMove(p1Move, 'p2', { r: 7, c: 4 });
const p3Move = applyMove(p2Move, 'p3', { r: 4, c: 1 });
assert(p3Move.turn === 'p1', 'Le tour doit revenir à p1 après un tour complet à trois');
assert(p3Move.history.length === 3, 'Les trois actions locales doivent être historisées');

const withWall = applyWall(p3Move, 'p1', { row: 3, col: 3, orientation: 'H' });
assert(withWall.walls.length === 1, 'Un mur local doit être ajouté');
assert(withWall.wallsLeft.p1 === 4, 'Le stock de murs doit diminuer pour le joueur actif');
assert(withWall.turn === 'p2', 'La pose d’un mur doit passer au joueur suivant');

const state4 = activate(getFreshState(4), 4);
assert(activePlayers(state4).length === 4, 'Le mode local 4 joueurs doit activer quatre pions');
assert(getGoal('p4').axis === 'col' && getGoal('p4').index === 0, 'p4 doit viser le bord ouest');
const p3Path = getShortestPathForPlayer(state4.pos.p3, 'p3', []);
const p4Path = getShortestPathForPlayer(state4.pos.p4, 'p4', []);
assert(p3Path.at(-1)?.c === SIZE - 1, 'Le chemin optimal de p3 doit finir sur le bord est');
assert(p4Path.at(-1)?.c === 0, 'Le chemin optimal de p4 doit finir sur le bord ouest');

const turns = [
  applyMove(state4, 'p1', { r: 1, c: 4 }),
  applyMove(applyMove(state4, 'p1', { r: 1, c: 4 }), 'p2', { r: 7, c: 4 }),
];
assert(turns[0].turn === 'p2' && turns[1].turn === 'p3', 'La rotation des tours à quatre joueurs doit rester séquentielle');

const edgeWins: Record<Player, { before: { r: number; c: number }; target: { r: number; c: number } }> = {
  p1: { before: { r: 7, c: 4 }, target: { r: 8, c: 4 } },
  p2: { before: { r: 1, c: 4 }, target: { r: 0, c: 4 } },
  p3: { before: { r: 4, c: 7 }, target: { r: 4, c: 8 } },
  p4: { before: { r: 4, c: 1 }, target: { r: 4, c: 0 } },
};
for (const [player, { before, target }] of Object.entries(edgeWins) as [Player, (typeof edgeWins)[Player]][]) {
  const winState = activate(getFreshState(4), 4);
  for (const candidate of ['p1', 'p2', 'p3', 'p4'] as Player[]) {
    winState.players[candidate] = candidate === player;
    winState.wallsLeft[candidate] = candidate === player ? 5 : 0;
  }
  winState.pos = { ...winState.pos, [player]: before };
  winState.turn = player;
  const result = applyMove(winState, player, target);
  assert(result.winner === player, `${player} doit gagner en atteignant son bord`);
  assert(result.turn === player, `Le tour ne doit pas tourner après la victoire de ${player}`);
}

const centerState = activate(getFreshState(4, 'center'), 4);
assert(centerState.mode === 'center', 'Le format centre doit être conservé dans l’état');
assert(centerState.pos.p1.r === 0 && centerState.pos.p1.c === 0, 'p1 doit démarrer dans le coin nord-ouest en format centre');
assert(centerState.pos.p4.r === 8 && centerState.pos.p4.c === 8, 'p4 doit démarrer dans le coin sud-est en format centre');
const centerPath = getShortestPathForPlayer(centerState.pos.p1, 'p1', [], 'center');
assert(centerPath.at(-1)?.r === 4 && centerPath.at(-1)?.c === 4, 'Le chemin central doit finir sur la case 4,4');
assert(isGoalPosition('p1', { r: 4, c: 4 }, 'center'), 'La case 4,4 doit être la cible commune');
assert(!isGoalPosition('p1', { r: 4, c: 5 }, 'center'), 'Une case voisine ne doit pas être considérée comme la cible centrale');

for (const player of ['p1', 'p2', 'p3', 'p4'] as Player[]) {
  const winState = activate(getFreshState(4, 'center'), 4);
  for (const candidate of ['p1', 'p2', 'p3', 'p4'] as Player[]) {
    winState.players[candidate] = candidate === player;
    winState.wallsLeft[candidate] = candidate === player ? 5 : 0;
  }
  winState.pos = { ...winState.pos, [player]: { r: 4, c: 3 } };
  winState.turn = player;
  const result = applyMove(winState, player, { r: 4, c: 4 });
  assert(result.winner === player, `${player} doit gagner en atteignant le centre`);
}

console.log('OK: smoke local 3/4 joueurs, victoires de bord et format centre');
