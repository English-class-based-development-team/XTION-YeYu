import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: Message) => void;
}

export function ChatInterface({ messages, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    };

    onSendMessage(newMessage);
    setInput("");
  };

  // Only show last 2 messages in preview
  const previewMessages = messages.slice(-2);

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pb-8">
      {/* Messages Preview */}
      <div className="mb-4 space-y-3 max-h-48 overflow-hidden px-1">
        <AnimatePresence>
          {previewMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-5 py-4 text-base ${
                  message.isUser
                    ? "bg-[#ff9966] text-white rounded-[20px] rounded-br-md"
                    : "bg-[#ffe8d9] text-[#2a1a4d] rounded-[20px] rounded-bl-md"
                }`}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 bg-white rounded-[24px] px-5 py-4 shadow-sm border border-gray-100">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Message"
          className="flex-1 bg-transparent outline-none placeholder:text-[#2a1a4d]/30 text-base"
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full bg-[#ff9966] text-white flex items-center justify-center hover:bg-[#ff8855] transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          disabled={!input.trim()}
        >
          <Send className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
