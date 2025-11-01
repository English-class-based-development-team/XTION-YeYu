import { motion } from "motion/react";

export function Sphere() {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Main sphere */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Sphere highlights */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />
        <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/30 blur-xl" />
      </motion.div>
      
      {/* Floating particles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/60"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-white/50"
        animate={{
          y: [0, 15, 0],
          x: [0, -15, 0],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
    </div>
  );
}
