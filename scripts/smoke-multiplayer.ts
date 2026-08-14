import { applyMove, getFreshState, activePlayers, wallsForPlayerCount } from '../src/lib/gameLogic.ts';

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const fresh = getFreshState(4);
assert(fresh.maxPlayers === 4, 'La capacité 4 joueurs n’est pas conservée');
assert(activePlayers(fresh).length === 1 && activePlayers(fresh)[0] === 'p1', 'Une nouvelle salle doit démarrer avec le seul hôte actif');
assert(wallsForPlayerCount(4) === 5, 'Le stock multi-joueurs doit être de 5 murs');

const state = {
  ...fresh,
  players: { p1: true, p2: true, p3: true, p4: true },
  wallsLeft: { p1: 5, p2: 5, p3: 5, p4: 5 },
};

const afterP1 = applyMove(state, 'p1', { r: 1, c: 4 });
assert(afterP1.turn === 'p2', 'Le tour doit passer de p1 à p2');
const afterP2 = applyMove(afterP1, 'p2', { r: 7, c: 4 });
assert(afterP2.turn === 'p3', 'Le tour doit passer de p2 à p3');
const afterP3 = applyMove(afterP2, 'p3', { r: 4, c: 1 });
assert(afterP3.turn === 'p4', 'Le tour doit passer de p3 à p4');
const afterP4 = applyMove(afterP3, 'p4', { r: 4, c: 7 });
assert(afterP4.turn === 'p1', 'Le tour doit revenir de p4 à p1');
assert(afterP4.history.length === 4, 'Les quatre coups doivent être historisés');

console.log('OK: smoke multiplayer 2/3/4 joueurs');
