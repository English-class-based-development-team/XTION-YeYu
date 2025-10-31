import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Send } from "lucide-react";

interface CreateMessageCardProps {
  onClose: () => void;
  onSubmit: (tag: string, content: string) => void;
  onStartResonance?: (tag: string, content: string) => void;
}

export function CreateMessageCard({ onClose, onSubmit, onStartResonance }: CreateMessageCardProps) {
  const [tag, setTag] = useState("我的心情");
  const [content, setContent] = useState("点击编辑你想分享的内容...");
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  
  const tagInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingTag && tagInputRef.current) {
      tagInputRef.current.focus();
      tagInputRef.current.select();
    }
  }, [isEditingTag]);

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
        {/* Small emotion tag bubble above - editable */}
        <motion.div
          className="mb-3 px-5 py-2.5 bg-gradient-to-r from-[#ff9966] to-[#ff8855] rounded-[18px] shadow-lg cursor-text"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setIsEditingTag(true)}
        >
          {isEditingTag ? (
            <input
              ref={tagInputRef}
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value.slice(0, 10))}
              onBlur={() => setIsEditingTag(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTag(false);
                }
              }}
              className="bg-transparent text-white text-sm font-semibold outline-none border-none w-full text-center"
              maxLength={10}
            />
          ) : (
            <span className="text-white text-sm font-semibold">
              {tag}
            </span>
          )}
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
