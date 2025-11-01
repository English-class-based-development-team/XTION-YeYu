import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, X, ArrowLeft } from "lucide-react";
import { ResonanceDetail } from "./ResonanceDetail";
import { EMOTION_TAGS_CN } from "../constants/emotions";

interface ResonanceItem {
  id: string;
  tag: string;
  content: string;
  timeAgo: string;
}

interface SearchResultsWallProps {
  onClose: () => void;
  searchQuery: string;
}

// 生成搜索结果数据
const generateSearchResults = (query: string): ResonanceItem[] => {
  // 根据不同的搜索词返回不同的结果
  const allResonances = [
    { tag: EMOTION_TAGS_CN['calm'], content: "今天感觉心里很乱，希望能找到一个安静的角落，让自己的思绪沉淀下来。", timeAgo: "2小时前" },
    { tag: EMOTION_TAGS_CN['sad'], content: "有些话憋在心里太久了，真想找个人好好聊聊，把这些情绪都说出来。", timeAgo: "5小时前" },
    { tag: EMOTION_TAGS_CN['lonely'], content: "总觉得没人能真正理解我的感受，这种孤独感让我很难受。", timeAgo: "1天前" },
    { tag: EMOTION_TAGS_CN['anxious'], content: "最近压力好大，需要一些鼓励和支持，让我知道我不是一个人在战斗。", timeAgo: "3小时前" },
    { tag: EMOTION_TAGS_CN['tired'], content: "不知道为什么，就是感觉很累，什么都不想做，只想静静待着。", timeAgo: "6小时前" },
    { tag: EMOTION_TAGS_CN['anxious'], content: "对未来感到很迷茫，不知道自己在做什么，该往哪里去。", timeAgo: "2天前" },
    { tag: EMOTION_TAGS_CN['lonely'], content: "有时候真的很需要有人在身边，哪怕什么都不说，只是陪着也好。", timeAgo: "4小时前" },
    { tag: EMOTION_TAGS_CN['confused'], content: "感觉自己像迷失在森林里，找不到出路，希望有人能给我一些指引。", timeAgo: "1天前" },
    { tag: EMOTION_TAGS_CN['confused'], content: "心里有很多矛盾的感受，不知道该如何处理这些复杂的情绪。", timeAgo: "7小时前" },
    { tag: EMOTION_TAGS_CN['hopeful'], content: "虽然现在很难，但我相信这些经历会让我变得更强大。", timeAgo: "3天前" },
    { tag: EMOTION_TAGS_CN['sad'], content: "总是在怀疑自己，觉得自己不够好，不够优秀。", timeAgo: "5小时前" },
    { tag: EMOTION_TAGS_CN['sad'], content: "今天真的很难过，需要一些温暖的话语来治愈我的心。", timeAgo: "8小时前" },
    { tag: EMOTION_TAGS_CN['lonely'], content: "周围有很多人，但还是感觉很孤单，好像没人真正懂我。", timeAgo: "2天前" },
    { tag: EMOTION_TAGS_CN['hopeful'], content: "不想再这样下去了，想要做出一些改变，让生活变得更好。", timeAgo: "4天前" },
    { tag: EMOTION_TAGS_CN['happy'], content: "今天终于把压抑已久的情绪都释放出来了，感觉轻松了很多。", timeAgo: "6小时前" },
    { tag: EMOTION_TAGS_CN['hopeful'], content: "虽然很累，但我还是要继续前进，为了更好的自己。", timeAgo: "1天前" },
    { tag: EMOTION_TAGS_CN['fearful'], content: "害怕未知的事情会发生，但我知道我需要勇敢面对。", timeAgo: "9小时前" },
    { tag: EMOTION_TAGS_CN['grateful'], content: "感谢生命中所有的遇见，让我成为更好的自己。", timeAgo: "1天前" },
    { tag: EMOTION_TAGS_CN['angry'], content: "有些事情真的让我很生气，但我在学着控制情绪。", timeAgo: "4小时前" },
    { tag: EMOTION_TAGS_CN['excited'], content: "对明天充满期待，感觉有很多美好的事情在等着我。", timeAgo: "3小时前" },
    { tag: EMOTION_TAGS_CN['calm'], content: "今天做了冥想，感觉内心平静了很多，思绪也清晰了。", timeAgo: "1小时前" },
    { tag: EMOTION_TAGS_CN['anxious'], content: "总是担心会出错，这种不安的感觉让我很疲惫。", timeAgo: "5小时前" },
    { tag: EMOTION_TAGS_CN['lonely'], content: "深夜里特别想念有人陪伴的感觉，这种孤独真的很难受。", timeAgo: "10小时前" },
    { tag: EMOTION_TAGS_CN['grateful'], content: "今天有人主动关心我，让我感到特别温暖和感激。", timeAgo: "2小时前" },
  ];

  // 简单的搜索匹配逻辑
  const lowerQuery = query.toLowerCase();
  const filtered = allResonances.filter(item => 
    item.content.toLowerCase().includes(lowerQuery) || 
    item.tag.toLowerCase().includes(lowerQuery)
  );

  // 如果没有匹配结果，返回所有结果
  const results = filtered.length > 0 ? filtered : allResonances;

  return results.map((item, index) => ({
    ...item,
    id: `search-result-${index}`,
  }));
};

export function SearchResultsWall({ onClose, searchQuery }: SearchResultsWallProps) {
  const [selectedResonance, setSelectedResonance] = useState<ResonanceItem | null>(null);
  const results = generateSearchResults(searchQuery);
  
  // 分成两列
  const leftColumn = results.filter((_, i) => i % 2 === 0);
  const rightColumn = results.filter((_, i) => i % 2 === 1);

  const handleResonanceClick = (item: ResonanceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedResonance(item);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] bg-gradient-to-b from-[#fef8f3] to-[#f5e6dc] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#fef8f3] to-transparent pb-4">
        <div className="pt-5 px-5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-[#2a1a4d]" strokeWidth={3} />
          </button>
          
          <div className="flex-1 text-center">
            <h2 className="text-xl text-[#2a1a4d] font-semibold">搜索结果</h2>
            <p className="text-sm text-[#2a1a4d]/60 mt-1">
              找到 {results.length} 个相关共鸣
            </p>
          </div>

          <div className="w-12" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Scrollable results - Two columns */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="flex gap-4">
          {/* Left column */}
          <div className="flex-1 space-y-4">
            {leftColumn.map((item, index) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-[24px] p-5 shadow-lg cursor-pointer hover:shadow-xl transition-shadow active:scale-98"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={(e) => handleResonanceClick(item, e)}
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
          <div className="flex-1 space-y-4 pt-8">
            {rightColumn.map((item, index) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-[24px] p-5 shadow-lg cursor-pointer hover:shadow-xl transition-shadow active:scale-98"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.025 }}
                onClick={(e) => handleResonanceClick(item, e)}
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
        </div>
      </div>

      {/* Resonance Detail Modal */}
      <AnimatePresence>
        {selectedResonance && (
          <ResonanceDetail
            tag={selectedResonance.tag}
            content={selectedResonance.content}
            timeAgo={selectedResonance.timeAgo}
            onClose={() => setSelectedResonance(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
