'use client';

import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // em milissegundos
  formatFn?: (val: number) => string;
}

export function AnimatedCounter({ value, duration = 1000, formatFn = (v) => v.toString() }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing function: easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * value));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <span>{formatFn(count)}</span>;
}
