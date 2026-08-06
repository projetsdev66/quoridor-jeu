const KEY = 'quoridor_survival_best';

export function getBestSurvivalRound(): number {
  try {
    const raw = localStorage.getItem(KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** Saves the round count if it beats the current record. Returns the (possibly updated) best and whether this run set a new record. */
export function recordSurvivalRound(roundsSurvived: number): { best: number; isNewRecord: boolean } {
  const current = getBestSurvivalRound();
  if (roundsSurvived > current) {
    try {
      localStorage.setItem(KEY, String(roundsSurvived));
    } catch {
      /* storage unavailable — the record just won't persist this session */
    }
    return { best: roundsSurvived, isNewRecord: roundsSurvived > 0 };
  }
  return { best: current, isNewRecord: false };
}
