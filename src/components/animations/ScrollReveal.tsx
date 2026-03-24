import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  stagger?: number;
  once?: boolean;
}
 /** Reusable scroll reveal component with GSAP ScrollTrigger */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 50,
  className = '',
  stagger = 0,
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const element = ref.current;
    const children = stagger > 0 ? element.children : element;

    // Initial state based on direction
    const initialState: gsap.TweenVars = {
      opacity: 0,
    };

    switch (direction) {
      case 'up':
        initialState.y = distance;
        break;
      case 'down':
        initialState.y = -distance;
        break;
      case 'left':
        initialState.x = distance;
        break;
      case 'right':
        initialState.x = -distance;
        break;
      case 'scale':
        initialState.scale = 0.8;
        break;
      case 'fade':
        // Only opacity
        break;
    }

    gsap.set(children, initialState);

    // Animate on scroll
    const animation = gsap.to(children, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration,
      delay,
      stagger: stagger > 0 ? stagger : 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: once ? 'play none none none' : 'play none none reverse',
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [direction, delay, duration, distance, stagger, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;
