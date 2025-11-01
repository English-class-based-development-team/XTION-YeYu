import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X } from "lucide-react";
import { SharePrompt } from "./SharePrompt";
import { EmotionSummaryCard } from "./EmotionSummaryCard";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface FullscreenChatProps {
  initialMessages: Message[];
  onClose: () => void;
  onStartResonance?: (tag: string, content: string) => void;
}

export function FullscreenChat({ initialMessages, onClose, onStartResonance }: FullscreenChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [showEmotionCard, setShowEmotionCard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate agent response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand. Let me help you with that. How are you feeling about this situation?",
        isUser: false,
      };
      setMessages((prev) => [...prev, response]);
    }, 1500);
  };

  const handleShare = () => {
    // Handle share action
    console.log("Sharing emotion...");
    setShowEmotionCard(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Blurred background with glassmorphism effect */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#2a1a4d]/10">
          <div>
            <h2 className="text-[#2a1a4d] text-2xl">Conversation</h2>
            <p className="text-[#2a1a4d]/50 text-sm">Psychology Agent</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
          >
            <X className="w-6 h-6 text-[#2a1a4d]" strokeWidth={3} />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-6 py-4 text-base ${
                      message.isUser
                        ? "bg-[#ff9966] text-white rounded-[24px] rounded-br-lg shadow-md"
                        : "bg-[#ffe8d9] text-[#2a1a4d] rounded-[24px] rounded-bl-lg shadow-sm"
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="px-5 py-6 border-t border-[#2a1a4d]/10 bg-white/50 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Share prompt - shows when there are more than 3 messages */}
            {messages.length > 3 && (
              <div className="flex justify-center">
                <SharePrompt onClick={() => setShowEmotionCard(true)} />
              </div>
            )}
            
            {/* Input box */}
            <div className="flex items-center gap-3 bg-white rounded-[26px] px-6 py-4 shadow-md border border-gray-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent outline-none placeholder:text-[#2a1a4d]/30 text-base"
              autoFocus
            />
            <button
              onClick={handleSend}
              className="w-11 h-11 rounded-full bg-[#ff9966] text-white flex items-center justify-center hover:bg-[#ff8855] transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              disabled={!input.trim()}
            >
              <Send className="w-5 h-5" strokeWidth={3} />
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emotion Summary Card Modal */}
      <AnimatePresence>
        {showEmotionCard && (
          <EmotionSummaryCard
            onClose={() => setShowEmotionCard(false)}
            onShare={handleShare}
            onStartResonance={onStartResonance}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
