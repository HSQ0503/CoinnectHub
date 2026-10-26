import { useEffect, useRef, useState } from "react";

export function useCountUp(value: number, start = value, duration = 650) {
  const [shown, setShown] = useState(start);
  const current = useRef(start);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = current.current;
    const began = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const progress = reduced ? 1 : Math.min(1, (now - began) / duration);
      current.current = from + (value - from) * (1 - (1 - progress) ** 3);
      setShown(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return shown;
}
