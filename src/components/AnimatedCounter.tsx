import { useEffect, useState } from "react";
import { useMotionValue, useSpring, motion, useTransform } from "motion/react";

export function AnimatedCounter({ value, duration = 2 }: { value: number, duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let totalFrames = duration * 60;
    let frame = 0;
    
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const current = Math.floor(end * progress);
      
      setDisplayValue(current);
      
      if (frame === totalFrames) {
        clearInterval(counter);
        setDisplayValue(end);
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
}
