import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: string;
  label: string;
  icon?: string;
}

export function AnimatedCounter({ value, label }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");
  
  // Extract number and suffix/prefix
  const numericMatch = value.match(/(\d+)/);
  const targetNumber = numericMatch ? parseInt(numericMatch[0], 10) : 0;
  const prefix = value.substring(0, numericMatch ? value.indexOf(numericMatch[0]) : 0);
  const suffix = numericMatch ? value.substring(value.indexOf(numericMatch[0]) + numericMatch[0].length) : value;

  useEffect(() => {
    if (!isInView || targetNumber === 0) return;

    let startTime: number;
    const duration = 2000; // 2 seconds
    let animationFrame: number;

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const easedProgress = easeOutExpo(progress);
      const currentNumber = Math.floor(easedProgress * targetNumber);
      
      setDisplayValue(`${prefix}${currentNumber}${suffix}`);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value); // Ensure exact final value
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isInView, targetNumber, prefix, suffix, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-bold ht-gradient-text mb-2 tracking-tight">
        {displayValue}
      </div>
      <div className="text-slate-400 text-sm md:text-base font-medium">
        {label}
      </div>
    </div>
  );
}
export default AnimatedCounter;
