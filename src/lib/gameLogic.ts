export const SIZE = 9;
export const START_WALLS = 10;
export const MULTI_PLAYER_WALLS = 5;

import { DEFAULT_P1_COLOR, DEFAULT_P2_COLOR, PLAYER_COLORS } from './playerColors';

export type Player = 'p1' | 'p2' | 'p3' | 'p4';
export const PLAYER_IDS: Player[] = ['p1', 'p2', 'p3', 'p4'];
export type Position = { r: number; c: number };
export type Wall = { row: number; col: number; orientation: 'H' | 'V'; owner?: Player };
export type MoveAction =
  | { type: 'move'; pos: Position }
  | { type: 'wall'; wall: Wall };
export type PlayerCount = 2 | 3 | 4;
export type GameMode = 'classic' | 'blitz' | 'survival' | 'duo' | 'center';
export type Goal = { axis: 'row' | 'col'; index: number } | { axis: 'center' };

export interface GameState {
  pos: Record<Player, Position>;
  wallsLeft: Record<Player, number>;
  walls: Wall[];
  turn: Player;
  winner: Player | null;
  /** Ordered finishers. The first finisher is kept in winner for backward compatibility. */
  ranking: Player[];
  players: Record<Player, boolean>;
  names: Record<Player, string>;
  colors: Record<Player, string>;
  history: { player: Player; action: MoveAction; time: number }[];
  chat: { sender: string; text: string; time: number }[];
  lastAction: MoveAction | null;
  aiDifficulty: 'easy' | 'medium' | 'hard' | 'expert' | null;
  updatedAt: number;
  roomId?: string;
  mode?: GameMode;
  maxPlayers: PlayerCount;
}

export function wallsForPlayerCount(maxPlayers: PlayerCount): number {
  return maxPlayers === 2 ? START_WALLS : MULTI_PLAYER_WALLS;
}

export function isCenterMode(mode?: GameMode): boolean {
  return mode === 'center';
}

export function getGoal(player: Player, mode?: GameMode): Goal {
  if (isCenterMode(mode)) return { axis: 'center' };

  switch (player) {
    case 'p1': return { axis: 'row', index: SIZE - 1 };
    case 'p2': return { axis: 'row', index: 0 };
    case 'p3': return { axis: 'col', index: SIZE - 1 };
    case 'p4': return { axis: 'col', index: 0 };
  }
}

export function getStartPosition(player: Player, mode?: GameMode): Position {
  const center = Math.floor(SIZE / 2);
  if (isCenterMode(mode)) {
    switch (player) {
      case 'p1': return { r: 0, c: 0 };
      case 'p2': return { r: 0, c: SIZE - 1 };
      case 'p3': return { r: SIZE - 1, c: 0 };
      case 'p4': return { r: SIZE - 1, c: SIZE - 1 };
    }
  }

  switch (player) {
    case 'p1': return { r: 0, c: center };
    case 'p2': return { r: SIZE - 1, c: center };
    case 'p3': return { r: center, c: 0 };
    case 'p4': return { r: center, c: SIZE - 1 };
  }
}

export function isGoalPosition(player: Player, pos: Position, mode?: GameMode): boolean {
  const goal = getGoal(player, mode);
  if (goal.axis === 'center') {
    const center = Math.floor(SIZE / 2);
    return pos.r === center && pos.c === center;
  }
  return goal.axis === 'row' ? pos.r === goal.index : pos.c === goal.index;
}

export function getFreshState(maxPlayers: PlayerCount = 2, mode: GameMode = 'classic'): GameState {
  const normalizedMode: GameMode = mode === 'center' && maxPlayers !== 4 ? 'classic' : mode;
  const walls = wallsForPlayerCount(maxPlayers);
  const active = Object.fromEntries(PLAYER_IDS.map((player) => [player, player === 'p1'])) as Record<Player, boolean>;

  const names = Object.fromEntries(PLAYER_IDS.map((player, index) => [player, `Joueur ${index + 1}`])) as Record<Player, string>;
  const colors = Object.fromEntries(PLAYER_IDS.map((player, index) => [player, PLAYER_COLORS[index].hex])) as Record<Player, string>;
  const pos = Object.fromEntries(PLAYER_IDS.map((player) => [player, getStartPosition(player, normalizedMode)])) as Record<Player, Position>;
  const wallsLeft = Object.fromEntries(PLAYER_IDS.map((player) => [player, active[player] ? walls : 0])) as Record<Player, number>;

  return {
    pos,
    wallsLeft,
    walls: [],
    turn: 'p1',
    winner: null,
    ranking: [],
    players: active,
    names: { ...names, p1: 'Joueur 1', p2: 'Joueur 2' },
    colors: { ...colors, p1: DEFAULT_P1_COLOR, p2: DEFAULT_P2_COLOR },
    history: [],
    chat: [],
    lastAction: null,
    aiDifficulty: null,
    updatedAt: Date.now(),
    mode: normalizedMode,
    maxPlayers,
  };
}

export function normalizeGameState(data?: Partial<GameState> | null): GameState {
  const raw = (data ?? {}) as Partial<GameState>;
  const maxPlayers: PlayerCount = raw.maxPlayers === 3 || raw.maxPlayers === 4 ? raw.maxPlayers : 2;
  const requestedMode = raw.mode;
  const requestedGameMode: GameMode = requestedMode === 'blitz' || requestedMode === 'survival' || requestedMode === 'duo' || requestedMode === 'center'
    ? requestedMode
    : 'classic';
  const mode: GameMode = requestedGameMode === 'center' && maxPlayers !== 4 ? 'classic' : requestedGameMode;
  const fresh = getFreshState(maxPlayers, mode);
  const players = { ...fresh.players, ...(raw.players ?? {}) } as Record<Player, boolean>;
  for (const player of PLAYER_IDS) players[player] = PLAYER_IDS.indexOf(player) < maxPlayers && Boolean(players[player]);
  players.p1 = true;

  const wallsDefault = wallsForPlayerCount(maxPlayers);
  const wallsLeft = { ...fresh.wallsLeft, ...(raw.wallsLeft ?? {}) } as Record<Player, number>;
  for (const player of PLAYER_IDS) wallsLeft[player] = players[player] ? Math.max(0, Number(wallsLeft[player] ?? wallsDefault)) : 0;

  const pos = { ...fresh.pos, ...(raw.pos ?? {}) } as Record<Player, Position>;
  const names = { ...fresh.names, ...(raw.names ?? {}) } as Record<Player, string>;
  const colors = { ...fresh.colors, ...(raw.colors ?? {}) } as Record<Player, string>;
  const legacyWinner = players[raw.winner as Player] ? raw.winner as Player : null;
  const ranking = Array.from(new Set(
    (Array.isArray(raw.ranking) ? raw.ranking : legacyWinner ? [legacyWinner] : [])
      .filter((player): player is Player => players[player]),
  ));

  return {
    ...fresh,
    ...raw,
    maxPlayers,
    mode,
    pos,
    wallsLeft,
    players,
    names,
    colors,
    ranking,
    walls: Array.isArray(raw.walls) ? raw.walls : [],
    history: Array.isArray(raw.history) ? raw.history : [],
    chat: Array.isArray(raw.chat) ? raw.chat : [],
    turn: players[raw.turn as Player] && !ranking.includes(raw.turn as Player) ? raw.turn as Player : nextPlayer({ players, maxPlayers, ranking }, ranking[ranking.length - 1] ?? 'p1'),
    winner: ranking[0] ?? null,
    updatedAt: Number(raw.updatedAt ?? Date.now()),
  };
}

export function activePlayers(state: Pick<GameState, 'players' | 'maxPlayers'>): Player[] {
  return PLAYER_IDS.slice(0, state.maxPlayers).filter((player) => state.players[player]);
}

export function finishTarget(maxPlayers: PlayerCount): number {
  return maxPlayers === 2 ? 1 : maxPlayers - 1;
}

export function isGameOver(state: Pick<GameState, 'maxPlayers' | 'ranking'>): boolean {
  return state.ranking.length >= finishTarget(state.maxPlayers);
}

export function inBounds(r: number, c: number) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

export function wallBlocks(walls: Wall[], r1: number, c1: number, r2: number, c2: number): boolean {
  if (r1 === r2) {
    const c = Math.min(c1, c2);
    return walls.some((w) => w.orientation === 'V' && w.col === c && (w.row === r1 || w.row === r1 - 1));
  }
  const r = Math.min(r1, r2);
  return walls.some((w) => w.orientation === 'H' && w.row === r && (w.col === c1 || w.col === c1 - 1));
}

export function wallsConflict(w: Wall, walls: Wall[]): boolean {
  for (const other of walls) {
    if (other.orientation === w.orientation && other.row === w.row && other.col === w.col) return true;
    if (other.orientation === w.orientation) {
      if (w.orientation === 'H' && other.row === w.row && Math.abs(other.col - w.col) === 1) return true;
      if (w.orientation === 'V' && other.col === w.col && Math.abs(other.row - w.row) === 1) return true;
    } else if (other.row === w.row && other.col === w.col) {
      return true;
    }
  }
  return false;
}

function bfs(start: Position, goal: (pos: Position) => boolean, walls: Wall[]): { distance: number; parent: Map<string, string | null>; goalKey: string | null } {
  const keyOf = (r: number, c: number) => `${r},${c}`;
  const parent = new Map<string, string | null>();
  const startKey = keyOf(start.r, start.c);
  parent.set(startKey, null);
  const queue: Position[] = [start];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];
    const currentKey = keyOf(current.r, current.c);
    if (goal(current)) return { distance: head - 1 === 0 ? 0 : queue.indexOf(current), parent, goalKey: currentKey };
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = current.r + dr;
      const nc = current.c + dc;
      const nextKey = keyOf(nr, nc);
      if (inBounds(nr, nc) && !parent.has(nextKey) && !wallBlocks(walls, current.r, current.c, nr, nc)) {
        parent.set(nextKey, currentKey);
        queue.push({ r: nr, c: nc });
      }
    }
  }
  return { distance: Infinity, parent, goalKey: null };
}

function bfsDistanceInternal(start: Position, goal: (pos: Position) => boolean, walls: Wall[]): number {
  const queue: Array<{ pos: Position; distance: number }> = [{ pos: start, distance: 0 }];
  const visited = new Set([`${start.r},${start.c}`]);
  let head = 0;
  while (head < queue.length) {
    const { pos, distance } = queue[head++];
    if (goal(pos)) return distance;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = pos.r + dr;
      const nc = pos.c + dc;
      const key = `${nr},${nc}`;
      if (inBounds(nr, nc) && !visited.has(key) && !wallBlocks(walls, pos.r, pos.c, nr, nc)) {
        visited.add(key);
        queue.push({ pos: { r: nr, c: nc }, distance: distance + 1 });
      }
    }
  }
  return Infinity;
}

export function hasPath(pos: Position, goalRow: number, walls: Wall[]): boolean {
  return bfsDistance(pos, goalRow, walls) !== Infinity;
}

export function getShortestPath(start: Position, goalRow: number, walls: Wall[]): Position[] {
  const result = bfs(start, (pos) => pos.r === goalRow, walls);
  if (!result.goalKey) return [];
  const path: Position[] = [];
  let current: string | null = result.goalKey;
  while (current !== null) {
    const [r, c] = current.split(',').map(Number);
    path.unshift({ r, c });
    current = result.parent.get(current) ?? null;
  }
  return path;
}

export function getShortestPathForPlayer(start: Position, player: Player, walls: Wall[], mode?: GameMode): Position[] {
  const result = bfs(start, (pos) => isGoalPosition(player, pos, mode), walls);
  if (!result.goalKey) return [];
  const path: Position[] = [];
  let current: string | null = result.goalKey;
  while (current !== null) {
    const [r, c] = current.split(',').map(Number);
    path.unshift({ r, c });
    current = result.parent.get(current) ?? null;
  }
  return path;
}

export function bfsDistance(start: Position, goalRow: number, walls: Wall[]): number {
  return bfsDistanceInternal(start, (pos) => pos.r === goalRow, walls);
}

export function bfsDistanceForPlayer(start: Position, player: Player, walls: Wall[], mode?: GameMode): number {
  return bfsDistanceInternal(start, (pos) => isGoalPosition(player, pos, mode), walls);
}

export function canPlaceWall(w: Wall, state: GameState): boolean {
  if (isGameOver(state) || state.ranking.includes(state.turn) || state.wallsLeft[state.turn] <= 0) return false;
  if (w.row < 0 || w.row > SIZE - 2 || w.col < 0 || w.col > SIZE - 2) return false;
  if (wallsConflict(w, state.walls)) return false;
  const trial = state.walls.concat([w]);
  return activePlayers(state).every((player) => hasPathToPlayerGoal(state.pos[player], player, trial, state.mode));
}

function hasPathToPlayerGoal(pos: Position, player: Player, walls: Wall[], mode?: GameMode): boolean {
  return bfsDistanceForPlayer(pos, player, walls, mode) !== Infinity;
}

export function getValidMoves(pos: Position, opponents: Position | Position[], walls: Wall[]): Position[] {
  const occupied = Array.isArray(opponents) ? opponents : [opponents];
  const moves: Position[] = [];
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nr = pos.r + dr;
    const nc = pos.c + dc;
    if (!inBounds(nr, nc) || wallBlocks(walls, pos.r, pos.c, nr, nc)) continue;
    const opponent = occupied.find((candidate) => candidate.r === nr && candidate.c === nc);
    if (!opponent) {
      moves.push({ r: nr, c: nc });
      continue;
    }

    const jr = nr + dr;
    const jc = nc + dc;
    if (inBounds(jr, jc) && !wallBlocks(walls, nr, nc, jr, jc) && !occupied.some((candidate) => candidate.r === jr && candidate.c === jc)) {
      moves.push({ r: jr, c: jc });
      continue;
    }

    const perpendicular = dr === 0 ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]];
    for (const [pdr, pdc] of perpendicular) {
      const diagonalR = nr + pdr;
      const diagonalC = nc + pdc;
      if (
        inBounds(diagonalR, diagonalC) &&
        !wallBlocks(walls, nr, nc, diagonalR, diagonalC) &&
        !occupied.some((candidate) => candidate.r === diagonalR && candidate.c === diagonalC)
      ) {
        moves.push({ r: diagonalR, c: diagonalC });
      }
    }
  }
  return moves;
}

export function nextPlayer(state: Pick<GameState, 'players' | 'maxPlayers'> & { ranking?: Player[] }, current: Player): Player {
  const ranked = state.ranking ?? [];
  const players = activePlayers(state).filter((player) => !ranked.includes(player));
  if (players.length === 0) return 'p1';
  const currentIndex = players.indexOf(current);
  for (let offset = 1; offset <= players.length; offset++) {
    const candidate = players[(currentIndex + offset + players.length) % players.length];
    if (candidate) return candidate;
  }
  return players[0] ?? 'p1';
}

function samePosition(a: Position, b: Position): boolean {
  return a.r === b.r && a.c === b.c;
}

export function applyMove(state: GameState, player: Player, pos: Position): GameState {
  if (isGameOver(state) || state.turn !== player || !state.players[player] || state.ranking.includes(player)) return state;
  // Players who already reached their goal stay parked on the board but must not block
  // movement for everyone else — otherwise the first arrival in "Centre" mode would
  // permanently occupy the shared target cell and no one else could ever finish.
  const opponents = activePlayers(state)
    .filter((candidate) => candidate !== player && !state.ranking.includes(candidate))
    .map((candidate) => state.pos[candidate]);
  const valid = getValidMoves(state.pos[player], opponents, state.walls).some((candidate) => samePosition(candidate, pos));
  if (!valid) return state;

  const now = Date.now();
  const newState: GameState = {
    ...state,
    pos: { ...state.pos, [player]: pos },
    history: [...state.history, { player, action: { type: 'move', pos }, time: now }],
    lastAction: { type: 'move', pos },
    updatedAt: now,
  };
  const ranking = isGoalPosition(player, pos, state.mode) && !state.ranking.includes(player)
    ? [...state.ranking, player]
    : [...state.ranking];
  newState.ranking = ranking;
  newState.winner = ranking[0] ?? null;
  if (!isGameOver(newState)) newState.turn = nextPlayer(newState, player);
  return newState;
}

export function applyWall(state: GameState, player: Player, wall: Wall): GameState {
  if (isGameOver(state) || state.turn !== player || !state.players[player] || state.ranking.includes(player) || state.wallsLeft[player] <= 0 || !canPlaceWall(wall, state)) return state;
  const now = Date.now();
  const ownedWall: Wall = { ...wall, owner: player };
  return {
    ...state,
    walls: [...state.walls, ownedWall],
    wallsLeft: { ...state.wallsLeft, [player]: state.wallsLeft[player] - 1 },
    history: [...state.history, { player, action: { type: 'wall', wall: ownedWall }, time: now }],
    lastAction: { type: 'wall', wall: ownedWall },
    turn: nextPlayer(state, player),
    updatedAt: now,
  };
}
