import { useCallback, useRef } from 'react';

// Simple sound generation using Web Audio API
export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTypingSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext]);

  const playResponseSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      // Pleasant two-tone chime
      const playTone = (freq: number, delay: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + delay + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.3);
        
        oscillator.start(ctx.currentTime + delay);
        oscillator.stop(ctx.currentTime + delay + 0.3);
      };
      
      playTone(523.25, 0); // C5
      playTone(659.25, 0.1); // E5
      playTone(783.99, 0.2); // G5
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext]);

  return { playTypingSound, playResponseSound };
}