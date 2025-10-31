import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { DriftBottle } from "./components/DriftBottle";
import { ChatInterface } from "./components/ChatInterface";
import { FullscreenChat } from "./components/FullscreenChat";
import { CreateMessageCard } from "./components/CreateMessageCard";
import { ResonanceWall } from "./components/ResonanceWall";
import { User, Search } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCreateMessageOpen, setIsCreateMessageOpen] = useState(false);
  const [showResonanceWall, setShowResonanceWall] = useState(false);
  const [resonanceData, setResonanceData] = useState({ tag: "", content: "" });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your personal psychology agent. How can I help you today?",
      isUser: false,
    },
  ]);

  const handleSendMessage = (newMessage: Message) => {
    setMessages([...messages, newMessage]);
    setIsChatOpen(true);
  };

  const handleCreateMessage = (tag: string, content: string) => {
    console.log("Creating message with tag:", tag, "and content:", content);
    // TODO: Handle the message creation (e.g., send to backend, add to list, etc.)
  };

  const handleStartResonance = (tag: string, content: string) => {
    setResonanceData({ tag, content });
    setIsCreateMessageOpen(false);
    setIsChatOpen(false);
    setShowResonanceWall(true);
  };

  const handleResonanceComplete = () => {
    setShowResonanceWall(false);
  };

  return (
    <div className="min-h-screen bg-[#fef8f3] flex flex-col">
      {/* Top Navigation Buttons */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-10">
        {/* Profile Button - Left */}
        <button className="w-14 h-14 rounded-[18px] bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95">
          <User className="w-6 h-6 text-[#2a1a4d]" strokeWidth={3} />
        </button>
        
        {/* Search Button - Right */}
        <button className="w-14 h-14 rounded-[18px] bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95">
          <Search className="w-6 h-6 text-[#2a1a4d]" strokeWidth={3} />
        </button>
      </div>

      {/* Header */}
      <div className="pt-24 pb-6 px-6 text-left">
        <h1 className="text-[#2a1a4d] mb-1 text-4xl">Psychology Agent</h1>
        <p className="text-[#2a1a4d]/60 text-lg">Your personal wellness companion</p>
      </div>

      {/* Drift Bottle - centered and takes up main space */}
      <div className="flex-1 flex items-center justify-center">
        <DriftBottle onClick={() => setIsCreateMessageOpen(true)} />
      </div>

      {/* Chat Interface - fixed at bottom */}
      <div className="pb-safe">
        <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
      </div>

      {/* Fullscreen Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <FullscreenChat
            initialMessages={messages}
            onClose={() => setIsChatOpen(false)}
            onStartResonance={handleStartResonance}
          />
        )}
      </AnimatePresence>

      {/* Create Message Card Modal */}
      <AnimatePresence>
        {isCreateMessageOpen && (
          <CreateMessageCard
            onClose={() => setIsCreateMessageOpen(false)}
            onSubmit={handleCreateMessage}
            onStartResonance={handleStartResonance}
          />
        )}
      </AnimatePresence>

      {/* Resonance Wall */}
      <AnimatePresence>
        {showResonanceWall && (
          <ResonanceWall
            userTag={resonanceData.tag}
            userContent={resonanceData.content}
            onComplete={handleResonanceComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
