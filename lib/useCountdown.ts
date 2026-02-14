import { useState, useEffect, useRef, useCallback } from 'react';

interface CountdownResult {
  remaining: number;
  progress: number;
  formatted: string;
  isComplete: boolean;
}

export function useCountdown(totalSeconds: number): CountdownResult {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(totalSeconds);
    setIsComplete(false);

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [totalSeconds]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  return { remaining, progress, formatted, isComplete };
}
