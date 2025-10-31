import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, ChevronDown } from "lucide-react";
import { EMOTION_TAGS_CN } from "../constants/emotions";

interface CreateMessageCardProps {
  onClose: () => void;
  onSubmit: (tag: string, content: string) => void;
  onStartResonance?: (tag: string, content: string) => void;
}

export function CreateMessageCard({ onClose, onSubmit, onStartResonance }: CreateMessageCardProps) {
  const [tag, setTag] = useState("calm");
  const [content, setContent] = useState("点击编辑你想分享的内容...");
  const [isSelectingTag, setIsSelectingTag] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const emotionTags = Object.entries(EMOTION_TAGS_CN);

  useEffect(() => {
    if (isEditingContent && contentTextareaRef.current) {
      contentTextareaRef.current.focus();
      contentTextareaRef.current.select();
    }
  }, [isEditingContent]);

  const handleSubmit = () => {
    if (tag.trim() && content.trim() && content !== "点击编辑你想分享的内容...") {
      onSubmit(tag, content);
      if (onStartResonance) {
        onStartResonance(tag, content);
      }
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
        {/* Small emotion tag bubble above - clickable selector */}
        <motion.div
          className="mb-3 relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            className="px-5 py-2.5 bg-gradient-to-r from-[#ff9966] to-[#ff8855] rounded-[18px] shadow-lg flex items-center gap-2 hover:shadow-xl transition-shadow active:scale-98"
            onClick={() => setIsSelectingTag(!isSelectingTag)}
          >
            <span className="text-white font-semibold">
              {EMOTION_TAGS_CN[tag]}
            </span>
            <ChevronDown className={`w-4 h-4 text-white transition-transform ${isSelectingTag ? 'rotate-180' : ''}`} />
          </button>

          {/* Emotion tag dropdown */}
          <AnimatePresence>
            {isSelectingTag && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[20px] shadow-xl overflow-hidden z-20"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="max-h-60 overflow-y-auto">
                  {emotionTags.map(([key, label]) => (
                    <button
                      key={key}
                      className={`w-full px-5 py-3 text-left transition-colors ${
                        tag === key 
                          ? 'bg-gradient-to-r from-[#ff9966]/20 to-[#ff8855]/20 text-[#ff9966]' 
                          : 'hover:bg-gray-50 text-[#2a1a4d]'
                      }`}
                      onClick={() => {
                        setTag(key);
                        setIsSelectingTag(false);
                      }}
                    >
                      <span className="font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main content bubble - editable */}
        <motion.div
          className="w-full bg-white rounded-[32px] p-8 shadow-2xl cursor-text min-h-[180px]"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setIsEditingContent(true)}
        >
          {isEditingContent ? (
            <textarea
              ref={contentTextareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => setIsEditingContent(false)}
              className="w-full h-full text-[#2a1a4d] text-base leading-relaxed text-center outline-none border-none resize-none min-h-[120px]"
              placeholder="写下你的感受..."
            />
          ) : (
            <p className={`text-base leading-relaxed text-center ${
              content === "点击编辑你想分享的内容..." 
                ? "text-[#2a1a4d]/40" 
                : "text-[#2a1a4d]"
            }`}>
              {content}
            </p>
          )}
        </motion.div>

        {/* Submit button below */}
        <motion.button
          className="mt-5 flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#E89B6D] to-[#F3B89A] rounded-[24px] shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleSubmit}
          disabled={!tag.trim() || !content.trim() || content === "点击编辑你想分享的内容..."}
        >
          <Send className="w-5 h-5 text-white" strokeWidth={2.5} />
          <span className="text-white text-base font-semibold">
            发送到漂流瓶
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
