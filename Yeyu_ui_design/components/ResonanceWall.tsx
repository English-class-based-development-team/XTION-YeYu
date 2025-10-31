import { motion } from "motion/react";
import { Clock } from "lucide-react";

interface ResonanceItem {
  id: string;
  tag: string;
  content: string;
  timeAgo: string;
}

interface ResonanceWallProps {
  onComplete?: () => void;
  userTag: string;
  userContent: string;
}

// 生成共鸣数据
const generateResonanceData = (userTag: string): ResonanceItem[] => {
  const resonances = [
    { tag: "寻找平静", content: "今天感觉心里很乱，希望能找到一个安静的角落，让自己的思绪沉淀下来。", timeAgo: "2小时前" },
    { tag: "需要倾诉", content: "有些话憋在心里太久了，真想找个人好好聊聊，把这些情绪都说出来。", timeAgo: "5小时前" },
    { tag: "渴望理解", content: "总觉得没人能真正理解我的感受，这种孤独感让我很难受。", timeAgo: "1天前" },
    { tag: "寻求支持", content: "最近压力好大，需要一些鼓励和支持，让我知道我不是一个人在战斗。", timeAgo: "3小时前" },
    { tag: "情绪低落", content: "不知道为什么，就是感觉很累，什么都不想做，只想静静待着。", timeAgo: "6小时前" },
    { tag: "焦虑不安", content: "对未来感到很迷茫，不知道自己在做什么，该往哪里去。", timeAgo: "2天前" },
    { tag: "需要陪伴", content: "有时候真的很需要有人在身边，哪怕什么都不说，只是陪着也好。", timeAgo: "4小时前" },
    { tag: "寻找方向", content: "感觉自己像迷失在森林里，找不到出路，希望有人能给我一些指引。", timeAgo: "1天前" },
    { tag: "情感困惑", content: "心里有很多矛盾的感受，不知道该如何处理这些复杂的情绪。", timeAgo: "7小时前" },
    { tag: "渴望成长", content: "虽然现在很难，但我相信这些经历会让我变得更强大。", timeAgo: "3天前" },
    { tag: "自我怀疑", content: "总是在怀疑自己，觉得自己不够好，不够优秀。", timeAgo: "5小时前" },
    { tag: "寻求安慰", content: "今天真的很难过，需要一些温暖的话语来治愈我的心。", timeAgo: "8小时前" },
    { tag: "孤独感", content: "周围有很多人，但还是感觉很孤单，好像没人真正懂我。", timeAgo: "2天前" },
    { tag: "希望改变", content: "不想再这样下去了，想要做出一些改变，让生活变得更好。", timeAgo: "4天前" },
    { tag: "情绪释放", content: "今天终于把压抑已久的情绪都释放出来了，感觉轻松了很多。", timeAgo: "6小时前" },
    { tag: "寻找力量", content: "虽然很累，但我还是要继续前进，为了更好的自己。", timeAgo: "1天前" },
  ];

  return resonances.map((item, index) => ({
    ...item,
    id: `resonance-${index}`,
  }));
};

export function ResonanceWall({ onComplete, userTag, userContent }: ResonanceWallProps) {
  const resonances = generateResonanceData(userTag);
  
  // 分成两列
  const leftColumn = resonances.filter((_, i) => i % 2 === 0);
  const rightColumn = resonances.filter((_, i) => i % 2 === 1);

  return (
    <motion.div
      className="fixed inset-0 z-[70] bg-gradient-to-b from-[#fef8f3] to-[#f5e6dc] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* User's bubble floating up and disappearing */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        initial={{ scale: 1, y: 0, opacity: 1 }}
        animate={{ 
          y: -window.innerHeight,
          opacity: 0,
          scale: 0.5
        }}
        transition={{ duration: 1.2, ease: "easeIn" }}
      >
        <div className="flex flex-col items-center max-w-md w-full px-5">
          {/* User tag */}
          <div className="mb-3 px-5 py-2.5 bg-gradient-to-r from-[#ff9966] to-[#ff8855] rounded-[18px] shadow-lg">
            <span className="text-white text-sm font-semibold">
              {userTag}
            </span>
          </div>
          
          {/* User content */}
          <div className="w-full bg-white rounded-[32px] p-8 shadow-2xl">
            <p className="text-[#2a1a4d] text-base leading-relaxed text-center">
              {userContent}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        className="absolute top-8 left-0 right-0 text-center z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <h2 className="text-2xl text-[#2a1a4d] font-semibold mb-2">找到了 {resonances.length} 个共鸣</h2>
        <p className="text-[#2a1a4d]/60">你的感受被看见了</p>
      </motion.div>

      {/* Scrolling resonance cards - Two columns */}
      <motion.div
        className="absolute inset-x-0 flex gap-4 px-4"
        initial={{ y: window.innerHeight }}
        animate={{ y: -resonances.length * 160 }}
        transition={{
          delay: 1.5,
          duration: resonances.length * 2,
          ease: "linear",
        }}
      >
        {/* Left column */}
        <div className="flex-1 space-y-4">
          {leftColumn.map((item, index) => (
            <motion.div
              key={item.id}
              className="bg-white rounded-[24px] p-5 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + index * 0.1 }}
            >
              {/* Tag and time */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1.5 bg-gradient-to-r from-[#ff9966]/20 to-[#ff8855]/20 rounded-full text-xs text-[#E89B6D] font-semibold">
                  {item.tag}
                </span>
                <div className="flex items-center gap-1 text-[#2a1a4d]/40 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{item.timeAgo}</span>
                </div>
              </div>
              
              {/* Content */}
              <p className="text-[#2a1a4d] text-sm leading-relaxed">
                {item.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Right column */}
        <div className="flex-1 space-y-4 pt-12">
          {rightColumn.map((item, index) => (
            <motion.div
              key={item.id}
              className="bg-white rounded-[24px] p-5 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + index * 0.1 + 0.05 }}
            >
              {/* Tag and time */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1.5 bg-gradient-to-r from-[#ff9966]/20 to-[#ff8855]/20 rounded-full text-xs text-[#E89B6D] font-semibold">
                  {item.tag}
                </span>
                <div className="flex items-center gap-1 text-[#2a1a4d]/40 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{item.timeAgo}</span>
                </div>
              </div>
              
              {/* Content */}
              <p className="text-[#2a1a4d] text-sm leading-relaxed">
                {item.content}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Close hint */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 text-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <p className="text-[#2a1a4d]/60 text-sm">轻触任意位置返回</p>
      </motion.div>

      {/* Tap to close */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onComplete}
      />
    </motion.div>
  );
}
