import {
  type GameState,
  type Player,
  type Position,
  type Wall,
  type MoveAction,
  SIZE,
  getValidMoves,
  canPlaceWall,
  bfsDistance,
  normalizeGameState,
} from './gameLogic';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
type AIPlayer = 'p1' | 'p2';

interface SearchState {
  pos: { p1: Position; p2: Position };
  wallsLeft: { p1: number; p2: number };
  walls: Wall[];
  turn: AIPlayer;
}

interface DifficultyConfig {
  maxDepth: number;
  timeBudgetMs: number;
  wallCandidates: number;
  allowWalls: boolean;
  randomness: number; // 0..1 chance of picking a weaker move instead of the best one
}

const CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { maxDepth: 1, timeBudgetMs: 150, wallCandidates: 0, allowWalls: false, randomness: 0.45 },
  medium: { maxDepth: 2, timeBudgetMs: 350, wallCandidates: 6, allowWalls: true, randomness: 0.18 },
  hard: { maxDepth: 3, timeBudgetMs: 700, wallCandidates: 12, allowWalls: true, randomness: 0 },
  expert: { maxDepth: 4, timeBudgetMs: 1200, wallCandidates: 16, allowWalls: true, randomness: 0 },
};

const WIN_SCORE = 100000;

function otherPlayer(p: AIPlayer): AIPlayer {
  return p === 'p1' ? 'p2' : 'p1';
}

function goalRowOf(p: AIPlayer): number {
  return p === 'p1' ? SIZE - 1 : 0;
}

function toSearchState(state: GameState): SearchState {
  return {
    pos: { p1: { ...state.pos.p1 }, p2: { ...state.pos.p2 } },
    wallsLeft: { ...state.wallsLeft },
    walls: state.walls,
    turn: state.turn === 'p2' ? 'p2' : 'p1',
  };
}

function checkWinner(s: SearchState): AIPlayer | null {
  if (s.pos.p1.r === SIZE - 1) return 'p1';
  if (s.pos.p2.r === 0) return 'p2';
  return null;
}

function evaluate(s: SearchState, aiPlayer: AIPlayer): number {
  const opp = otherPlayer(aiPlayer);
  const aiDist = bfsDistance(s.pos[aiPlayer], goalRowOf(aiPlayer), s.walls);
  const oppDist = bfsDistance(s.pos[opp], goalRowOf(opp), s.walls);
  const distScore = (oppDist - aiDist) * 12;
  const wallScore = (s.wallsLeft[aiPlayer] - s.wallsLeft[opp]) * 2.5;
  return distScore + wallScore;
}

/** Cheap geometric candidate list — cells within reach of either pawn — reused across the whole search. */
function candidateWallCells(aiPos: Position, oppPos: Position): { row: number; col: number }[] {
  const cells = new Map<string, { row: number; col: number }>();
  const addAround = (pos: Position, radius: number) => {
    for (let r = pos.r - radius; r <= pos.r + radius; r++) {
      for (let c = pos.c - radius; c <= pos.c + radius; c++) {
        if (r < 0 || r > SIZE - 2 || c < 0 || c > SIZE - 2) continue;
        cells.set(`${r},${c}`, { row: r, col: c });
      }
    }
  };
  addAround(aiPos, 2);
  addAround(oppPos, 2);
  return Array.from(cells.values());
}

function orderedWallCandidates(
  s: SearchState,
  cells: { row: number; col: number }[],
  opp: Position,
  oppGoalRow: number,
  maxCount: number,
): Wall[] {
  if (maxCount <= 0) return [];
  const scored = cells.flatMap(({ row, col }) => {
    const towardOpp = -(Math.abs(row - opp.r) + Math.abs(col - opp.c));
    return [
      { wall: { row, col, orientation: 'H' as const }, score: towardOpp },
      { wall: { row, col, orientation: 'V' as const }, score: towardOpp },
    ];
  });
  scored.sort((a, b) => b.score - a.score);

  const out: Wall[] = [];
  for (const { wall } of scored) {
    if (out.length >= maxCount) break;
    // canPlaceWall expects a GameState-shaped object for path validation
    if (canPlaceWall(wall, normalizeGameState({ pos: s.pos, walls: s.walls, wallsLeft: s.wallsLeft, turn: s.turn, players: { p1: true, p2: true }, maxPlayers: 2 } as Partial<GameState>))) {
      out.push(wall);
    }
  }
  return out;
}

function applyAction(s: SearchState, action: MoveAction): SearchState {
  if (action.type === 'move') {
    return {
      ...s,
      pos: { ...s.pos, [s.turn]: action.pos },
      turn: otherPlayer(s.turn),
    };
  }
  return {
    ...s,
    walls: s.walls.concat([action.wall]),
    wallsLeft: { ...s.wallsLeft, [s.turn]: s.wallsLeft[s.turn] - 1 },
    turn: otherPlayer(s.turn),
  };
}

function generateActions(
  s: SearchState,
  aiPlayer: AIPlayer,
  cellPool: { row: number; col: number }[],
  wallCandidateCount: number,
  allowWalls: boolean,
): MoveAction[] {
  const me = s.turn;
  const opp = otherPlayer(me);
  const moves = getValidMoves(s.pos[me], s.pos[opp], s.walls).map((pos) => ({ type: 'move' as const, pos }));

  const actions: MoveAction[] = [...moves];

  if (allowWalls && s.wallsLeft[me] > 0) {
    const walls = orderedWallCandidates(s, cellPool, s.pos[opp], goalRowOf(opp), wallCandidateCount);
    for (const wall of walls) actions.push({ type: 'wall', wall });
  }

  return actions;
}

function minimax(
  s: SearchState,
  depth: number,
  alpha: number,
  beta: number,
  aiPlayer: AIPlayer,
  cellPool: { row: number; col: number }[],
  cfg: DifficultyConfig,
  deadline: number,
): number {
  const winner = checkWinner(s);
  if (winner) return winner === aiPlayer ? WIN_SCORE + depth : -(WIN_SCORE + depth);
  if (depth === 0 || Date.now() > deadline) return evaluate(s, aiPlayer);

  const actions = generateActions(s, aiPlayer, cellPool, cfg.wallCandidates, cfg.allowWalls);
  if (actions.length === 0) return evaluate(s, aiPlayer);

  const maximizing = s.turn === aiPlayer;
  let best = maximizing ? -Infinity : Infinity;

  for (const action of actions) {
    const child = applyAction(s, action);
    const val = minimax(child, depth - 1, alpha, beta, aiPlayer, cellPool, cfg, deadline);
    if (maximizing) {
      if (val > best) best = val;
      if (best > alpha) alpha = best;
    } else {
      if (val < best) best = val;
      if (best < beta) beta = best;
    }
    if (beta <= alpha) break;
    if (Date.now() > deadline) break;
  }

  return best;
}

interface EngineResult {
  action: MoveAction;
  score: number;
}

function search(state: GameState, forPlayer: AIPlayer, cfg: DifficultyConfig): EngineResult {
  const root = toSearchState(state);
  root.turn = forPlayer; // evaluate as if it's this player's turn to act
  const cellPool = candidateWallCells(root.pos.p1, root.pos.p2);
  const deadline = Date.now() + cfg.timeBudgetMs;

  const rootActions = generateActions(root, forPlayer, cellPool, cfg.wallCandidates, cfg.allowWalls);
  if (rootActions.length === 0) {
    // Should not happen (a legal move always exists), but guard anyway
    return { action: { type: 'move', pos: root.pos[forPlayer] }, score: 0 };
  }

  let bestAction = rootActions[0];
  let bestScore = -Infinity;

  for (let depth = 1; depth <= cfg.maxDepth; depth++) {
    let depthBestAction = bestAction;
    let depthBestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;
    let abortedMidDepth = false;

    for (const action of rootActions) {
      const child = applyAction(root, action);
      const val = minimax(child, depth - 1, alpha, beta, forPlayer, cellPool, cfg, deadline);
      if (val > depthBestScore) {
        depthBestScore = val;
        depthBestAction = action;
      }
      if (depthBestScore > alpha) alpha = depthBestScore;
      if (Date.now() > deadline) {
        abortedMidDepth = true;
        break;
      }
    }

    if (!abortedMidDepth) {
      bestAction = depthBestAction;
      bestScore = depthBestScore;
    }
    if (Date.now() > deadline) break;
  }

  return { action: bestAction, score: bestScore };
}

/** Picks the AI's move for the given difficulty. */
export function chooseAIMove(state: GameState, aiPlayer: AIPlayer, difficulty: Difficulty, boost = 0): MoveAction {
  const base = CONFIG[difficulty];
  const cfg: DifficultyConfig = boost > 0
    ? {
        ...base,
        maxDepth: base.maxDepth + boost,
        timeBudgetMs: Math.round(base.timeBudgetMs * (1 + boost * 0.4)),
        wallCandidates: Math.min(20, base.wallCandidates + boost * 2),
        randomness: Math.max(0, base.randomness - boost * 0.1),
      }
    : base;
  const result = search(state, aiPlayer, cfg);

  if (cfg.randomness > 0 && Math.random() < cfg.randomness) {
    const root = toSearchState(state);
    root.turn = aiPlayer;
    const cellPool = candidateWallCells(root.pos.p1, root.pos.p2);
    const alt = generateActions(root, aiPlayer, cellPool, cfg.wallCandidates, cfg.allowWalls);
    const moveOnly = alt.filter((a) => a.type === 'move');
    if (moveOnly.length > 0) {
      return moveOnly[Math.floor(Math.random() * moveOnly.length)];
    }
  }

  return result.action;
}
