import { useCallback, useEffect, useRef, useState } from "react";
export interface JokerHintState {
  hintActive: boolean;
  hintCardId: number | null;
  hintPhase: 0 | 1 | 2 | 3;
  resetHint: (cardId?: number) => void;
  startHintTimer: (cardId: number) => void;
}
export function useJokerHint(
  isPaused: boolean,
  isMissionActive: boolean,
  completedIds: number[],
  activeCardId: number | null,
): JokerHintState {
  const [target, setTarget] = useState<number | null>(null);
  const targetRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const resetHint = useCallback(() => {
    targetRef.current = null;
    setTarget(null);
    setElapsed(0);
  }, []);
  const startHintTimer = useCallback((id: number) => {
    if (targetRef.current === id) return;
    targetRef.current = id;
    setElapsed(0);
    setTarget(id);
  }, []);
  useEffect(() => {
    if (
      !isMissionActive ||
      isPaused ||
      target === null ||
      activeCardId !== null
    )
      return;
    let last = performance.now();
    const t = setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      setElapsed((e) => e + delta);
    }, 500);
    return () => clearInterval(t);
  }, [isPaused, isMissionActive, target, activeCardId]);
  useEffect(() => {
    if (!isMissionActive || (target !== null && completedIds.includes(target)))
      resetHint();
  }, [isMissionActive, completedIds, target, resetHint]);
  const phase =
    elapsed >= 100000 ? 3 : elapsed >= 80000 ? 2 : elapsed >= 60000 ? 1 : 0;
  return {
    hintActive: phase > 0,
    hintCardId: phase > 0 ? target : null,
    hintPhase: phase,
    resetHint,
    startHintTimer,
  };
}
