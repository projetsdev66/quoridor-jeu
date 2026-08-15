import { useState, useEffect, useRef } from 'react';

export const TURN_DURATION = 60; // seconds per turn

export function useTurnTimer(isActive: boolean, turnKey: number | string, duration: number = TURN_DURATION) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when the turn changes or the configured duration changes
  useEffect(() => {
    setSecondsLeft(duration);
  }, [turnKey, duration]);

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

  const progress = secondsLeft / duration; // 1 → 0
  const isUrgent = secondsLeft <= Math.min(10, Math.ceil(duration / 3)) && isActive;

  return { secondsLeft, isUrgent, progress };
}
