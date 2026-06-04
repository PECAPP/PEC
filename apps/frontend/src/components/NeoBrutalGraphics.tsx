import { motion } from "framer-motion";

export const NeoBrutalGraphics = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0">
      {/* Top Left Star - Vibrant Yellow/Black */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[15%] left-[5%] text-accent w-20 h-20 opacity-100 dark:text-accent"
        style={{ filter: "drop-shadow(4px 4px 0px rgba(0,0,0,1))" }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth="1">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </motion.div>

      {/* Hero Right Squiggle - Gold/Black */}
      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[10%] text-yellow-200 w-32 h-32 opacity-100"
        style={{ filter: "drop-shadow(4px 4px 0px rgba(0,0,0,1))" }}
      >
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="square">
          <path d="M10 50 Q 25 25 50 50 T 90 50" />
        </svg>
      </motion.div>

      {/* Center Left Burst - Amber/Black */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[45%] left-[-2%] text-amber-500 w-40 h-40 opacity-100"
        style={{ filter: "drop-shadow(4px 4px 0px rgba(0,0,0,1))" }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth="0.5">
          <path d="M12 2L15 9L22 9L16 14L18 21L12 17L6 21L8 14L2 9L9 9L12 2Z" />
        </svg>
      </motion.div>

      {/* Bottom Right Shape - Geometric - Gold/Black */}
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[20%] right-[5%] text-yellow-400 w-24 h-24 opacity-100"
        style={{ filter: "drop-shadow(4px 4px 0px rgba(0,0,0,1))" }}
      >
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="0" fill="currentColor" stroke="black" />
          <path d="M2 2L22 22M22 2L2 22" stroke="black" strokeWidth="2" />
        </svg>
      </motion.div>
    </div>
  );
};
