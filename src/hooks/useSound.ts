import { useCallback, useRef, useEffect } from 'react';

// Frequencies for different sounds
const SOUNDS = {
  move: { type: 'sine' as OscillatorType, freq: 520, duration: 0.08 },
  wall: { type: 'square' as OscillatorType, freq: 220, duration: 0.12 },
  error: { type: 'sawtooth' as OscillatorType, freq: 140, duration: 0.15 },
  chat: { type: 'triangle' as OscillatorType, freq: 760, duration: 0.06 },
};

export function useSound(enabled: boolean = true) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize lazily on first interaction usually, but we set up the ref here
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

  const playTone = useCallback((type: OscillatorType, freq: number, duration: number, vol = 0.1) => {
    if (!enabled || !audioCtxRef.current) return;
    
    // Resume context if suspended (browser policy)
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
  }, [enabled]);

  const playMove = useCallback(() => playTone(SOUNDS.move.type, SOUNDS.move.freq, SOUNDS.move.duration, 0.1), [playTone]);
  const playWall = useCallback(() => playTone(SOUNDS.wall.type, SOUNDS.wall.freq, SOUNDS.wall.duration, 0.05), [playTone]);
  const playError = useCallback(() => playTone(SOUNDS.error.type, SOUNDS.error.freq, SOUNDS.error.duration, 0.05), [playTone]);
  const playChat = useCallback(() => playTone(SOUNDS.chat.type, SOUNDS.chat.freq, SOUNDS.chat.duration, 0.1), [playTone]);
  
  const playVictory = useCallback(() => {
    if (!enabled || !audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }, [enabled]);

  return { playMove, playWall, playError, playChat, playVictory };
}
