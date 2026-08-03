import { useCallback, useRef, useEffect } from 'react';

export function useSound(enabled: boolean = true) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(console.error);
      }
    };
  }, []);

  const playTone = useCallback(
    (type: OscillatorType, freq: number, duration: number, vol = 0.1) => {
      if (!enabled || !audioCtxRef.current) return;
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
      gain.gain.setValueAtTime(vol, ctx.currentTime + duration - 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    },
    [enabled],
  );

  // Satisfying woody "thock" for pawn moves
  const playMove = useCallback(
    () => {
      if (!enabled || !audioCtxRef.current) return;
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    },
    [enabled],
  );

  // Solid "clunk" for wall placement
  const playWall = useCallback(
    () => {
      if (!enabled || !audioCtxRef.current) return;
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    },
    [enabled],
  );

  const playError = useCallback(
    () => playTone('sawtooth', 140, 0.15, 0.05),
    [playTone],
  );

  const playChat = useCallback(
    () => playTone('triangle', 760, 0.06, 0.1),
    [playTone],
  );

  // Ascending arpeggio: C5-E5-G5-C6
  const playVictory = useCallback(
    () => {
      if (!enabled || !audioCtxRef.current) return;
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      const ctx = audioCtxRef.current;
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + i * 0.13;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
        gain.gain.linearRampToValueAtTime(0, t + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    },
    [enabled],
  );

  return { playMove, playWall, playError, playChat, playVictory };
}
