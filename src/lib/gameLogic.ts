export const SIZE = 9;
export const START_WALLS = 10;

export type Player = 'p1' | 'p2';
export type Position = { r: number; c: number };
export type Wall = { row: number; col: number; orientation: 'H' | 'V' };
export type MoveAction = 
  | { type: 'move'; pos: Position } 
  | { type: 'wall'; wall: Wall };

export interface GameState {
  pos: { p1: Position; p2: Position };
  wallsLeft: { p1: number; p2: number };
  walls: Wall[];
  turn: Player;
  winner: Player | null;
  players: { p1: boolean; p2: boolean };
  names: { p1: string; p2: string };
  tokens: { p1: string | null; p2: string | null };
  history: { player: Player; action: MoveAction; time: number }[];
  chat: { sender: string; text: string; time: number }[];
  lastAction: MoveAction | null;
  aiDifficulty: 'easy' | 'medium' | 'hard' | null;
  updatedAt: number;
  roomId?: string; // For multiplayer
}

export function getFreshState(): GameState {
  return {
    pos: { p1: { r: 0, c: 4 }, p2: { r: SIZE - 1, c: 4 } },
    wallsLeft: { p1: START_WALLS, p2: START_WALLS },
    walls: [],
    turn: 'p1',
    winner: null,
    players: { p1: true, p2: false },
    names: { p1: 'Joueur 1', p2: 'Joueur 2' },
    tokens: { p1: null, p2: null },
    history: [],
    chat: [],
    lastAction: null,
    aiDifficulty: null,
    updatedAt: Date.now(),
  };
}

export function inBounds(r: number, c: number) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

export function wallBlocks(walls: Wall[], r1: number, c1: number, r2: number, c2: number): boolean {
  if (r1 === r2) {
    // horizontal movement
    const c = Math.min(c1, c2);
    return walls.some((w) => w.orientation === 'V' && w.col === c && (w.row === r1 || w.row === r1 - 1));
  } else {
    // vertical movement
    const r = Math.min(r1, r2);
    return walls.some((w) => w.orientation === 'H' && w.row === r && (w.col === c1 || w.col === c1 - 1));
  }
}

export function wallsConflict(w: Wall, walls: Wall[]): boolean {
  for (const ow of walls) {
    if (ow.orientation === w.orientation && ow.row === w.row && ow.col === w.col) return true;
    if (ow.orientation === w.orientation) {
      if (w.orientation === 'H' && ow.row === w.row && Math.abs(ow.col - w.col) === 1) return true;
      if (w.orientation === 'V' && ow.col === w.col && Math.abs(ow.row - w.row) === 1) return true;
    } else {
      if (ow.row === w.row && ow.col === w.col) return true;
    }
  }
  return false;
}

export function hasPath(pos: Position, goalRow: number, walls: Wall[]): boolean {
  return bfsDistance(pos, goalRow, walls) !== Infinity;
}

export function bfsDistance(start: Position, goalRow: number, walls: Wall[]): number {
  const queue: { r: number; c: number; dist: number }[] = [{ r: start.r, c: start.c, dist: 0 }];
  const visited = new Set<string>();
  visited.add(`${start.r},${start.c}`);

  let head = 0;
  while (head < queue.length) {
    const { r, c, dist } = queue[head++];
    if (r === goalRow) return dist;

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && !visited.has(`${nr},${nc}`) && !wallBlocks(walls, r, c, nr, nc)) {
        visited.add(`${nr},${nc}`);
        queue.push({ r: nr, c: nc, dist: dist + 1 });
      }
    }
  }
  return Infinity;
}

export function canPlaceWall(w: Wall, state: GameState): boolean {
  if (w.row < 0 || w.row > SIZE - 2 || w.col < 0 || w.col > SIZE - 2) return false;
  if (wallsConflict(w, state.walls)) return false;
  
  const trial = state.walls.concat([w]);
  if (!hasPath(state.pos.p1, SIZE - 1, trial)) return false;
  if (!hasPath(state.pos.p2, 0, trial)) return false;
  
  return true;
}

export function getValidMoves(pos: Position, opp: Position, walls: Wall[]): Position[] {
  const moves: Position[] = [];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  for (const [dr, dc] of dirs) {
    const nr = pos.r + dr;
    const nc = pos.c + dc;
    
    if (!inBounds(nr, nc)) continue;
    if (wallBlocks(walls, pos.r, pos.c, nr, nc)) continue;
    
    if (opp.r === nr && opp.c === nc) {
      // Jump over opponent
      const jr = nr + dr;
      const jc = nc + dc;
      
      if (inBounds(jr, jc) && !wallBlocks(walls, nr, nc, jr, jc)) {
        // Straight jump
        moves.push({ r: jr, c: jc });
      } else {
        // Diagonal jumps
        const perp = dr === 0 ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]];
        for (const [pdr, pdc] of perp) {
          const dr2 = nr + pdr;
          const dc2 = nc + pdc;
          if (inBounds(dr2, dc2) && !wallBlocks(walls, nr, nc, dr2, dc2)) {
            moves.push({ r: dr2, c: dc2 });
          }
        }
      }
    } else {
      moves.push({ r: nr, c: nc });
    }
  }
  return moves;
}

export function applyMove(state: GameState, player: Player, pos: Position): GameState {
  const newState = { ...state, pos: { ...state.pos, [player]: pos }, updatedAt: Date.now() };
  newState.history = [...state.history, { player, action: { type: 'move', pos }, time: Date.now() }];
  newState.lastAction = { type: 'move', pos };
  
  if ((player === 'p1' && pos.r === SIZE - 1) || (player === 'p2' && pos.r === 0)) {
    newState.winner = player;
  } else {
    newState.turn = player === 'p1' ? 'p2' : 'p1';
  }
  return newState;
}

export function applyWall(state: GameState, player: Player, wall: Wall): GameState {
  const newState = { 
    ...state, 
    walls: [...state.walls, wall],
    wallsLeft: { ...state.wallsLeft, [player]: state.wallsLeft[player] - 1 },
    updatedAt: Date.now() 
  };
  newState.history = [...state.history, { player, action: { type: 'wall', wall }, time: Date.now() }];
  newState.lastAction = { type: 'wall', wall };
  newState.turn = player === 'p1' ? 'p2' : 'p1';
  return newState;
}
