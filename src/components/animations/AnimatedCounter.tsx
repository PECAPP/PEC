import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}
 /** Animated counter that counts up when scrolled into view
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 2,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
}) => {
  const counterRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!counterRef.current || hasAnimated) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (counterRef.current) {
        counterRef.current.textContent = `${prefix}${end.toFixed(decimals)}${suffix}`;
      }
      return;
    }

    const counter = { value: 0 };

    const animation = gsap.to(counter, {
      value: end,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = `${prefix}${counter.value.toFixed(decimals)}${suffix}`;
        }
      },
      scrollTrigger: {
        trigger: counterRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => setHasAnimated(true),
      },
    });

    return () => {
      animation.kill();
    };
  }, [end, duration, suffix, prefix, decimals, hasAnimated]);

  return (
    <span ref={counterRef} className={className}>
      {prefix}0{suffix}
    </span>
  );
};

export default AnimatedCounter;
