import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Send, Clock } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  content: string;
  timeAgo: string;
}

interface ResonanceDetailProps {
  tag: string;
  content: string;
  timeAgo: string;
  onClose: () => void;
}

// 生成模拟评论数据
const generateComments = (): Comment[] => {
  return [
    { id: "1", author: "匿名用户A", content: "我也有同样的感受，你不是一个人。", timeAgo: "1小时前" },
    { id: "2", author: "匿名用户B", content: "抱抱你，一切都会好起来的。", timeAgo: "2小时前" },
    { id: "3", author: "匿名用户C", content: "感同身受，有时候真的需要被理解。", timeAgo: "3小时前" },
    { id: "4", author: "匿名用户D", content: "加油！时间会治愈一切的。", timeAgo: "5小时前" },
    { id: "5", author: "匿名用户E", content: "看到这个感觉很温暖，我们都在一起努力。", timeAgo: "6小时前" },
  ];
};

export function ResonanceDetail({ tag, content, timeAgo, onClose }: ResonanceDetailProps) {
  const [empathyCount, setEmpathyCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [hasEmpathized, setHasEmpathized] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<Comment[]>(generateComments());

  const handleEmpathy = () => {
    if (!hasEmpathized) {
      setEmpathyCount(empathyCount + 1);
      setHasEmpathized(true);
    }
  };

  const handleSendComment = () => {
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: "我",
      content: commentInput,
      timeAgo: "刚刚",
    };

    setComments([newComment, ...comments]);
    setCommentInput("");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-[#fef8f3] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center z-50 hover:bg-gray-50 transition-colors active:scale-95"
      >
        <X className="w-6 h-6 text-[#2a1a4d]" strokeWidth={3} />
      </button>

      {/* Scrollable content */}
      <div className="h-full overflow-y-auto pb-32 pt-20">
        <div className="max-w-2xl mx-auto px-5 space-y-5">
          {/* Tag bubble - small, above main content */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex items-start"
          >
            <div className="px-5 py-2.5 bg-gradient-to-r from-[#ff9966] to-[#ff8855] rounded-[18px] shadow-md">
              <span className="text-white font-semibold">
                {tag}
              </span>
            </div>
          </motion.div>

          {/* Main content bubble - large rounded rectangle */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-white rounded-[32px] p-8 shadow-lg"
          >
            <p className="text-[#2a1a4d] text-lg leading-relaxed">
              {content}
            </p>
            
            {/* Time indicator */}
            <div className="flex items-center gap-1.5 text-[#2a1a4d]/40 text-sm mt-5">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </motion.div>

          {/* Empathy bubble */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <button
              onClick={handleEmpathy}
              className={`w-full bg-white rounded-[24px] px-6 py-4 shadow-md flex items-center justify-between transition-all active:scale-98 ${
                hasEmpathized 
                  ? "bg-gradient-to-r from-[#ffe8d9] to-[#ffd4c0]" 
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  hasEmpathized 
                    ? "bg-gradient-to-br from-[#ff9966] to-[#ff8855]" 
                    : "bg-gray-100"
                }`}>
                  <Heart 
                    className={`w-6 h-6 transition-all ${
                      hasEmpathized 
                        ? "text-white fill-white" 
                        : "text-[#2a1a4d]/40"
                    }`} 
                  />
                </div>
                <span className={`text-lg font-semibold ${
                  hasEmpathized ? "text-[#ff9966]" : "text-[#2a1a4d]"
                }`}>
                  共情
                </span>
              </div>
              <span className={`text-2xl font-bold ${
                hasEmpathized ? "text-[#ff9966]" : "text-[#2a1a4d]/60"
              }`}>
                {empathyCount}
              </span>
            </button>
          </motion.div>

          {/* Comments section */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-white rounded-[32px] p-6 shadow-lg"
          >
            {/* Comments header */}
            <h3 className="text-[#2a1a4d] font-semibold mb-4 text-lg">
              评论 {comments.length}
            </h3>

            {/* Comment input */}
            <div className="flex items-center gap-3 bg-[#fef8f3] rounded-[20px] px-5 py-3 mb-6">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
                placeholder="写下你的评论..."
                className="flex-1 bg-transparent outline-none placeholder:text-[#2a1a4d]/30"
              />
              <button
                onClick={handleSendComment}
                className="w-9 h-9 rounded-full bg-[#ff9966] text-white flex items-center justify-center hover:bg-[#ff8855] transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                disabled={!commentInput.trim()}
              >
                <Send className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>

            {/* Comments list */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="pb-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[#2a1a4d] font-semibold">
                        {comment.author}
                      </span>
                      <span className="text-[#2a1a4d]/40 text-xs">
                        {comment.timeAgo}
                      </span>
                    </div>
                    <p className="text-[#2a1a4d]/80 leading-relaxed">
                      {comment.content}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
