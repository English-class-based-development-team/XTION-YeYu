import { motion } from "motion/react";

interface DriftBottleProps {
  onClick?: () => void;
}

export function DriftBottle({ onClick }: DriftBottleProps) {
  return (
    <div 
      className="relative w-72 h-96 flex items-center justify-center cursor-pointer"
      onClick={onClick}
    >
      {/* Bottom wave ripple effect */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-80 h-24"
        animate={{
          scaleX: [1, 1.15, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 320 96" className="w-full h-full">
          <path
            d="M0,48 Q40,20 80,48 T160,48 T240,48 T320,48"
            fill="none"
            stroke="#E89B6D"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M0,64 Q40,36 80,64 T160,64 T240,64 T320,64"
            fill="none"
            stroke="#F8E6D0"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.25"
          />
        </svg>
      </motion.div>

      {/* Bottle container with gentle floating animation */}
      <motion.div
        className="relative w-48 h-72"
        animate={{
          y: [0, -12, 0],
          rotate: [-1.5, 1.5, -1.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Cork - simplified */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-14 h-7 bg-gradient-to-b from-[#8B5A3C] to-[#6B4A2C] rounded-t-[16px] shadow-md">
          <div className="absolute inset-x-3 top-1.5 h-1.5 bg-[#A0633D]/40 rounded-full" />
        </div>

        {/* Bottle neck - gradient glass */}
        <div className="absolute top-13 left-1/2 -translate-x-1/2 w-11 h-16">
          <div className="absolute inset-0 bg-gradient-to-b from-[#E89B6D]/70 to-[#F3B89A]/80 rounded-t-[18px] backdrop-blur-sm">
            <div className="absolute inset-1 bg-gradient-to-br from-white/50 to-transparent rounded-t-[16px]" />
          </div>
        </div>

        {/* Main bottle body - soft gradient with transparency */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-36 h-40 rounded-[32px] overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E89B6D]/85 via-[#F3B89A]/75 to-[#F8E6D0]/70 backdrop-blur-sm" />
          
          {/* Flowing light effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent"
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Top left glass shine */}
          <div className="absolute top-3 left-3 w-16 h-20 bg-gradient-to-br from-white/70 to-transparent rounded-full blur-xl" />
          
          {/* Message paper inside */}
          <motion.div
            className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-28 bg-gradient-to-br from-[#fff5eb] to-[#ffe8d5] rounded-[14px] shadow-lg"
            style={{ transform: "rotate(-4deg) translateX(-50%)" }}
            animate={{
              rotate: [-4, -2, -4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Paper fold effect */}
            <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-bl from-[#f5d5b8] to-transparent rounded-tl-full" />
            
            {/* Text lines and plus icon */}
            <div className="absolute inset-0 p-3 flex flex-col items-center justify-center">
              {/* Plus icon in circle */}
              <div className="w-12 h-12 rounded-full bg-[#E89B6D]/20 flex items-center justify-center mb-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="#E89B6D"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              
              {/* Decorative lines */}
              <div className="w-full space-y-1.5">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-[#E89B6D]/25 to-transparent rounded-full w-3/4 mx-auto" />
                <div className="h-0.5 bg-gradient-to-r from-transparent via-[#E89B6D]/25 to-transparent rounded-full w-full" />
                <div className="h-0.5 bg-gradient-to-r from-transparent via-[#E89B6D]/25 to-transparent rounded-full w-2/3 mx-auto" />
              </div>
            </div>
          </motion.div>

          {/* Bottom light glow */}
          <div className="absolute bottom-2 inset-x-3 h-10 bg-white/40 rounded-full blur-lg" />
        </div>

        {/* Bottle bottom - rounded */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-10 bg-gradient-to-b from-[#E89B6D]/80 to-[#D88A5D]/70 rounded-b-[32px] shadow-lg" />

        {/* Soft shadow underneath */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-3 bg-[#E89B6D]/20 rounded-full blur-md" />
      </motion.div>

      {/* Gentle floating light particles */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#F8E6D0] to-[#E89B6D]/50 shadow-lg"
        animate={{
          y: [0, -40, -80],
          x: [0, 8, -4],
          opacity: [0.7, 0.3, 0],
          scale: [1, 1.3, 0.7],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-gradient-to-br from-[#FFE8D5] to-[#E89B6D]/40 shadow-md"
        animate={{
          y: [0, -50, -100],
          x: [0, -6, 6],
          opacity: [0.6, 0.2, 0],
          scale: [1, 1.4, 0.6],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1.5,
        }}
      />
      <motion.div
        className="absolute top-2/3 left-1/3 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-white to-[#F3B89A]/50"
        animate={{
          y: [0, -35, -70],
          x: [0, -4, 8],
          opacity: [0.5, 0.15, 0],
          scale: [1, 1.2, 0.5],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 3,
        }}
      />
    </div>
  );
}
