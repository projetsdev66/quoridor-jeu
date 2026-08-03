import { useState, useEffect, useRef } from 'react';

export const TURN_DURATION = 60; // seconds per turn

export function useTurnTimer(isActive: boolean, turnKey: number | string) {
  const [secondsLeft, setSecondsLeft] = useState(TURN_DURATION);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when the turn changes
  useEffect(() => {
    setSecondsLeft(TURN_DURATION);
  }, [turnKey]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => Math.max(0, s - 1));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const progress = secondsLeft / TURN_DURATION; // 1 → 0
  const isUrgent = secondsLeft <= 10 && isActive;

  return { secondsLeft, isUrgent, progress };
}
