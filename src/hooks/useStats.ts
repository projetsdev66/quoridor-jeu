import { useState, useCallback } from 'react';

export interface Stats {
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
}

const STORAGE_KEY = 'quoridor_stats';

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { wins: 0, losses: 0, streak: 0, bestStreak: 0, ...parsed };
    }
  } catch { /* ignore */ }
  return { wins: 0, losses: 0, streak: 0, bestStreak: 0 };
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(loadStats);

  const recordWin = useCallback(() => {
    setStats(prev => {
      const next: Stats = {
        ...prev,
        wins: prev.wins + 1,
        streak: prev.streak + 1,
        bestStreak: Math.max(prev.bestStreak, prev.streak + 1),
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const recordLoss = useCallback(() => {
    setStats(prev => {
      const next: Stats = { ...prev, losses: prev.losses + 1, streak: 0 };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { stats, recordWin, recordLoss };
}
