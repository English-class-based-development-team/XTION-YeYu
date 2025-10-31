import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { DriftBottle } from "./components/DriftBottle";
import { ChatInterface } from "./components/ChatInterface";
import { FullscreenChat } from "./components/FullscreenChat";
import { CreateMessageCard } from "./components/CreateMessageCard";
import { ResonanceWall } from "./components/ResonanceWall";
import { ProactiveCare } from "./components/ProactiveCare";
import { SearchModal } from "./components/SearchModal";
import { SearchResultsWall } from "./components/SearchResultsWall";
import { ProfilePage } from "./components/ProfilePage";
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
  const [showProactiveCare, setShowProactiveCare] = useState(true);
  const [showChatPreview, setShowChatPreview] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [resonanceData, setResonanceData] = useState({ tag: "", content: "" });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your personal psychology agent. How can I help you today?",
      isUser: false,
    },
  ]);
  
  const careTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = (newMessage: Message) => {
    setMessages([...messages, newMessage]);
    setIsChatOpen(true);
    setShowProactiveCare(false);
    setShowChatPreview(true);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(false);
    setShowSearchResults(true);
  };

  const handleSearchClose = () => {
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setShowChatPreview(false);
    
    // Clear any existing timer
    if (careTimerRef.current) {
      clearTimeout(careTimerRef.current);
    }
    
    // After 5 seconds of closing the chat, show proactive care again
    careTimerRef.current = setTimeout(() => {
      setShowProactiveCare(true);
    }, 5000);
  };

  // Auto-return to ProactiveCare when idle on main screen
  useEffect(() => {
    // Clear any existing idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Only start idle timer when on main screen with chat preview showing
    const isOnMainScreen = !isChatOpen && !isCreateMessageOpen && !showResonanceWall && !isSearchOpen && !showSearchResults && !showProfile;
    
    if (isOnMainScreen && showChatPreview) {
      // After 30 seconds of inactivity on main screen, return to ProactiveCare
      idleTimerRef.current = setTimeout(() => {
        setShowChatPreview(false);
        setShowProactiveCare(true);
      }, 30000); // 30 seconds
    }

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isChatOpen, isCreateMessageOpen, showResonanceWall, isSearchOpen, showSearchResults, showProfile, showChatPreview]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (careTimerRef.current) {
        clearTimeout(careTimerRef.current);
      }
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fef8f3] flex flex-col">
      {/* Top Navigation Buttons */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-10">
        {/* Profile Button - Left */}
        <button 
          className="w-14 h-14 rounded-[18px] bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
          onClick={() => setShowProfile(true)}
        >
          <User className="w-6 h-6 text-[#2a1a4d]" strokeWidth={3} />
        </button>
        
        {/* Search Button - Right */}
        <button 
          className="w-14 h-14 rounded-[18px] bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
          onClick={() => setIsSearchOpen(true)}
        >
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
        {/* Proactive Care Messages - show based on state */}
        {showProactiveCare && <ProactiveCare />}
        
        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage}
          showMessages={showChatPreview}
        />
      </div>

      {/* Fullscreen Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <FullscreenChat
            initialMessages={messages}
            onClose={handleChatClose}
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

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchModal
            onClose={() => setIsSearchOpen(false)}
            onSearch={handleSearch}
          />
        )}
      </AnimatePresence>

      {/* Search Results Wall */}
      <AnimatePresence>
        {showSearchResults && (
          <SearchResultsWall
            searchQuery={searchQuery}
            onClose={handleSearchClose}
          />
        )}
      </AnimatePresence>

      {/* Profile Page */}
      <AnimatePresence>
        {showProfile && (
          <ProfilePage onClose={() => setShowProfile(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
