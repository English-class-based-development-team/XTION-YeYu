import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";

const careMessages = [
  "你说你昨天发烧了，今天好点儿了吗？",
  "你说你最近和朋友吵架了，你们和好了吗？主动找他吧。",
  "还记得你提到的那个项目吗？进展得怎么样了？",
  "上次你说睡眠不太好，最近有改善吗？",
  "你提到想学习新技能，开始行动了吗？",
  "那个让你焦虑的考试过去了，感觉如何？",
  "你说想多运动，坚持下来了吗？为你加油！",
  "上次聊到的家人，最近有联系吗？",
];

export function ProactiveCare() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % careMessages.length);
    }, 8000); // 每8秒切换一次

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-5 mb-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex justify-start px-1"
        >
          <div className="max-w-[85%] px-5 py-4 bg-gradient-to-br from-[#ffe8d9] to-[#ffd4c0] text-[#2a1a4d] rounded-[20px] rounded-bl-md shadow-sm relative">
            {/* Small heart icon indicator */}
            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-gradient-to-br from-[#ff9966] to-[#ff8855] rounded-full flex items-center justify-center shadow-md">
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            
            <p className="text-base leading-relaxed">
              {careMessages[currentIndex]}
            </p>
            
            {/* Progress indicator dots */}
            <div className="flex gap-1.5 mt-3 justify-center">
              {careMessages.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-6 bg-[#ff9966]"
                      : "w-1.5 bg-[#ff9966]/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
