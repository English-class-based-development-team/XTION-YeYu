import { motion } from "motion/react";
import { Share2 } from "lucide-react";

interface EmotionSummaryCardProps {
  onClose: () => void;
  onShare: () => void;
  onStartResonance?: (tag: string, content: string) => void;
}

export function EmotionSummaryCard({ onClose, onShare, onStartResonance }: EmotionSummaryCardProps) {
  const tag = "寻求理解与支持";
  const content = "通过我们的对话，我感受到你正在面对一些挑战和困惑。你渴望被理解，希望找到内心的平静。记住，每一步成长都值得被看见，你的感受都是真实且重要的。";
  
  const handleShare = () => {
    onShare();
    if (onStartResonance) {
      onStartResonance(tag, content);
    }
  };
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Card container */}
      <motion.div
        className="relative z-10 flex flex-col items-center max-w-md w-full"
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Small emotion tag bubble above */}
        <motion.div
          className="mb-3 px-5 py-2.5 bg-gradient-to-r from-[#ff9966] to-[#ff8855] rounded-[18px] shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-white text-sm font-semibold">
            寻求理解与支持
          </span>
        </motion.div>

        {/* Main summary bubble */}
        <motion.div
          className="w-full bg-white rounded-[32px] p-8 shadow-2xl"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-[#2a1a4d] text-base leading-relaxed text-center">
            通过我们的对话，我感受到你正在面对一些挑战和困惑。你渴望被理解，希望找到内心的平静。记住，每一步成长都值得被看见，你的感受都是真实且重要的。
          </p>
        </motion.div>

        {/* Share button below */}
        <motion.button
          className="mt-5 flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#E89B6D] to-[#F3B89A] rounded-[24px] shadow-lg hover:shadow-xl transition-all active:scale-95"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5 text-white" strokeWidth={2.5} />
          <span className="text-white text-base font-semibold">
            传播这份情感
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
