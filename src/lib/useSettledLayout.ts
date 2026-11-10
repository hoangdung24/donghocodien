import { useEffect, useRef, useState } from 'react';

const SETTLE_FRAMES = 2;

export function useSettledLayout<T>(value: T): T {
  const [settled, setSettled] = useState<T>(value);
  const frameIds = useRef<number[]>([]);

  useEffect(() => {
    if (settled === value) return;
    let cancelled = false;
    let remaining = SETTLE_FRAMES;
    const step = () => {
      remaining -= 1;
      if (cancelled) return;
      if (remaining > 0) {
        frameIds.current.push(requestAnimationFrame(step));
        return;
      }
      setSettled(value);
    };
    frameIds.current.push(requestAnimationFrame(step));
    return () => {
      cancelled = true;
      frameIds.current.forEach((frameId) => cancelAnimationFrame(frameId));
      frameIds.current = [];
    };
  }, [value, settled]);

  return settled;
}
