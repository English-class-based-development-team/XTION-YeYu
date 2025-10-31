import { useState } from "react";
import { motion } from "motion/react";
import { Search, X } from "lucide-react";

interface SearchModalProps {
  onClose: () => void;
  onSearch: (query: string) => void;
}

export function SearchModal({ onClose, onSearch }: SearchModalProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-start justify-center px-5 pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Search box */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ scale: 0.9, y: -20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: -20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-[24px] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#2a1a4d] font-semibold text-lg">搜索情绪共鸣</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors active:scale-95"
            >
              <X className="w-5 h-5 text-[#2a1a4d]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Search input */}
          <div className="p-6">
            <div className="flex items-center gap-3 bg-gray-50 rounded-[18px] px-5 py-4">
              <Search className="w-5 h-5 text-[#2a1a4d]/40" strokeWidth={2.5} />
              <input
                type="text"
                placeholder="描述你的情绪..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-[#2a1a4d] placeholder:text-[#2a1a4d]/40"
                autoFocus
              />
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="w-full mt-4 py-4 bg-gradient-to-r from-[#E89B6D] to-[#F3B89A] rounded-[18px] shadow-lg hover:shadow-xl transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span className="text-white font-semibold">
                搜索共鸣
              </span>
            </button>

            {/* Example searches */}
            <div className="mt-6">
              <p className="text-[#2a1a4d]/60 text-sm mb-3">试试这些：</p>
              <div className="flex flex-wrap gap-2">
                {["孤独", "焦虑", "需要陪伴", "寻找平静"].map((example) => (
                  <button
                    key={example}
                    onClick={() => {
                      setQuery(example);
                      onSearch(example);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#ff9966]/10 to-[#ff8855]/10 rounded-full text-sm text-[#E89B6D] hover:from-[#ff9966]/20 hover:to-[#ff8855]/20 transition-colors active:scale-95"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
