import { useScroll, useTransform, motion } from "framer-motion";
import React, { useRef } from "react";

interface MacbookScrollProps {
  src: string;
  title?: string | React.ReactNode;
  badge?: React.ReactNode;
  showGradient?: boolean;
}

export const MacbookScroll: React.FC<MacbookScrollProps> = ({
  src,
  title,
  badge,
  showGradient = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full"
    >
      <motion.div
        style={{
          rotateX: rotate,
          scale: scale,
        }}
        className="relative w-full"
      >
        <div className="relative mx-auto w-full max-w-5xl">
          {/* Macbook container */}
          <div className="relative">
            {/* MacBook body - Silver/Gray */}
            <div className="bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-3xl shadow-2xl">
              {/* MacBook lid and screen bezel */}
              <div className="bg-black/90 rounded-t-3xl p-2">
                {/* Notch */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-2xl shadow-inner z-10" />

                {/* Screen content */}
                <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl overflow-hidden shadow-inner">
                  <img
                    src={src}
                    alt="MacBook Screen"
                    className="w-full h-auto object-cover"
                  />
                  {showGradient && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/5 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Keyboard area */}
              <div className="bg-gradient-to-b from-gray-300 to-gray-500 rounded-b-3xl px-4 py-2 h-16" />
            </div>

            {/* Title positioned above */}
            {title && (
              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 text-center z-20">
                <div className="text-2xl md:text-4xl font-bold text-foreground">
                  {title}
                </div>
              </div>
            )}

            {/* Badge positioned at bottom left */}
            {badge && (
              <div className="absolute -bottom-8 -left-8 z-30">
                {badge}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
