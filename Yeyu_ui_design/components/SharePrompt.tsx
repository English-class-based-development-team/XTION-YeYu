import { motion } from "motion/react";

interface SharePromptProps {
  onClick: () => void;
}

export function SharePrompt({ onClick }: SharePromptProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
      onClick={onClick}
      className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#E89B6D] to-[#F3B89A] rounded-[20px] shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
    >
      {/* Bottle icon */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="bottleIconGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="100%" stopColor="white" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        
        {/* Cork */}
        <rect
          x="10"
          y="4"
          width="8"
          height="4"
          rx="2"
          fill="#8B5A3C"
        />
        
        {/* Bottle neck */}
        <rect
          x="11"
          y="7"
          width="6"
          height="5"
          rx="1"
          fill="url(#bottleIconGrad)"
        />
        
        {/* Main bottle body */}
        <rect
          x="7"
          y="11"
          width="14"
          height="12"
          rx="4"
          fill="url(#bottleIconGrad)"
        />
        
        {/* Shine effect */}
        <ellipse
          cx="11"
          cy="15"
          rx="3"
          ry="4"
          fill="white"
          opacity="0.5"
        />
      </svg>

      {/* Text */}
      <span className="text-white text-base font-semibold tracking-wide">
        传播你的共鸣!
      </span>
    </motion.button>
  );
}
