import { useEffect, useRef, MutableRefObject } from 'react';
import gsap from 'gsap';

type GSAPCallback = (context: gsap.Context) => void | (() => void);
 /**
  * Custom hook for GSAP animations with React 18 compatibility
  * Provides proper cleanup and context management
  */
export const useGSAP = (
  callback: GSAPCallback,
  dependencies: any[] = []
): MutableRefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    // Create GSAP context for scoped animations
    const ctx = gsap.context(() => {
      if (ref.current) {
        const cleanup = callback(contextRef.current!);
        return cleanup;
      }
    }, ref);

    contextRef.current = ctx;

    // Cleanup function
    return () => {
      ctx.revert();
    };
  }, dependencies);

  return ref;
};

export default useGSAP;
