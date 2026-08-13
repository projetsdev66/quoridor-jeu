const KEY = 'quoridor_puzzle_progress';

/** Index (0-based) of the furthest puzzle solved so far. 0 if none yet. */
export function getPuzzleProgress(): number {
  try {
    const raw = localStorage.getItem(KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Marks a puzzle index as solved, advancing progress if it's further than before. */
export function recordPuzzleSolved(index: number): void {
  const current = getPuzzleProgress();
  if (index + 1 > current) {
    try {
      localStorage.setItem(KEY, String(index + 1));
    } catch {
      /* storage unavailable — progress just won't persist this session */
    }
  }
}
