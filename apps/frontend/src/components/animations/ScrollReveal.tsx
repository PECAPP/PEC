import { motion } from 'framer-motion';
import { ReactNode } from 'react';

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

/** 
 * Modular ScrollReveal using Framer Motion. 
 * Provides declarative scroll-triggered animations.
 */
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
  const getVariants = () => {
    const initial: any = { opacity: 0 };
    switch (direction) {
      case 'up': initial.y = distance; break;
      case 'down': initial.y = -distance; break;
      case 'left': initial.x = distance; break;
      case 'right': initial.x = -distance; break;
      case 'scale': initial.scale = 0.8; break;
    }
    return {
      hidden: initial,
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
          delay,
          duration,
          ease: "easeInOut" as const,
          staggerChildren: stagger,
        }
      }
    };
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-100px" }}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
