import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Cpu, 
  RefreshCw, 
  Copy, 
  Check, 
  Trash2,
  Bookmark,
  Tag as TagIcon
} from "lucide-react";
import { WorkspaceItem, ChatMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";
import TagManager from "./TagManager";

interface AIAssistantProps {
  item: WorkspaceItem;
  onUpdateItem: (id: string, updates: Partial<WorkspaceItem>) => void;
}

export default function AIAssistant({ item, onUpdateItem }: AIAssistantProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTags, setShowTags] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages: ChatMessage[] = item.chatHistory || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, loading]);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    // Clear main input field if we sent from there
    if (!textToSend) setInput("");

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...messages, userMessage];

    // Optimistically update the UI chat history
    onUpdateItem(item.id, {
      chatHistory: updatedHistory,
      promptUsed: messageText,
      title: messageText.slice(0, 30) + (messageText.length > 30 ? "..." : ""),
    });

    setLoading(true);

    try {
      // Fetch response from server-side route
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          prompt: messageText,
          history: updatedHistory, // Pass history to maintain conversational context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Gemini");
      }

      const data = await response.json();

      const modelMessage: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: "model",
        text: data.text,
        timestamp: new Date().toISOString(),
      };

      onUpdateItem(item.id, {
        chatHistory: [...updatedHistory, modelMessage],
      });
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "model",
        text: "I apologize, but I encountered an error connecting to Gemini. Please verify your GEMINI_API_KEY is configured correctly in Secrets.",
        timestamp: new Date().toISOString(),
      };
      onUpdateItem(item.id, {
        chatHistory: [...updatedHistory, errorMessage],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    onUpdateItem(item.id, {
      chatHistory: [],
      title: "New Chat Thread",
      promptUsed: "",
    });
  };

  const suggestions = [
    { text: "Help me brainstorm taglines for an environment app", label: "Marketing Tagline" },
    { text: "Explain React hooks to a 10 year old with a metaphor", label: "React Explanation" },
    { text: "Suggest 5 creative prompts for high-quality landscape art", label: "Art Prompts" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-slate-950/20 h-full overflow-hidden" id={`chat-suite-${item.id}`}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-8 py-5 flex items-center justify-between" id="chat-header">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 dark:text-emerald-400 font-semibold">
            Assistant Playground
          </span>
          <h2 className="text-base font-bold text-gray-800 dark:text-slate-100 tracking-tight mt-0.5">
            {item.title || "AI Assistant Chat"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTags(!showTags)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition cursor-pointer ${
              showTags 
                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-semibold" 
                : "text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
            }`}
            id="btn-toggle-chat-tags"
            title="Manage Workspace Tags"
          >
            <TagIcon className="w-3.5 h-3.5" />
            <span>Tags {item.tags && item.tags.length > 0 ? `(${item.tags.length})` : ""}</span>
          </motion.button>

          {messages.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xs hover:bg-red-50 dark:hover:bg-red-950/25 border border-transparent hover:border-red-250 dark:hover:border-red-950 rounded-lg transition cursor-pointer"
              id="btn-clear-chat"
              title="Clear entire thread"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </motion.button>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium" id="chat-status-chip">
            <Cpu className="w-3.5 h-3.5" />
            <span>Chat Session Active</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTags && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-8 py-4 overflow-hidden"
            id="chat-tags-dropdown"
          >
            <div className="max-w-3xl mx-auto">
              <TagManager item={item} onUpdateItem={onUpdateItem} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Conversation Space */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6" id="chat-messages-container">
        {messages.length === 0 ? (
          // Intro View / Empty State
          <div className="max-w-2xl mx-auto py-12 text-center space-y-6" id="chat-intro-view">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto shadow-sm" id="chat-intro-icon">
              <MessageSquare className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
                Meet your Gemini Writing & Brainstorming Partner
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Start a conversation to research ideas, draft code explanations, brainstorm outlines, or write creative prose. Gemini handles multi-turn memories instantly.
              </p>
            </div>

            {/* Suggestions list */}
            <div className="space-y-3 pt-4" id="suggestions-container">
              <p className="text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                Select a topic to start
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((sug, idx) => (
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    key={idx}
                    onClick={() => handleSend(sug.text)}
                    className="py-2 px-3.5 bg-white dark:bg-slate-900 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/15 border border-gray-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 rounded-xl text-xs font-medium text-gray-700 dark:text-slate-300 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                    id={`sug-btn-${idx}`}
                  >
                    {sug.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Chat thread list
          <div className="max-w-3xl mx-auto space-y-5" id="chat-messages-list">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    id={`msg-row-${msg.id}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl p-4 shadow-sm relative group border ${
                        isUser
                          ? "bg-indigo-600 text-white border-transparent rounded-br-none"
                          : "bg-white dark:bg-slate-900 border-gray-150 dark:border-slate-800 text-gray-800 dark:text-slate-200 rounded-bl-none"
                      }`}
                      id={`msg-bubble-${msg.id}`}
                    >
                      <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.text}
                      </p>

                      <div
                        className={`flex items-center gap-3 mt-3 pt-2.5 border-t text-[10px] ${
                          isUser
                            ? "border-indigo-500/30 text-indigo-200"
                            : "border-gray-100 dark:border-slate-850 text-gray-400 dark:text-slate-500"
                        }`}
                        id={`msg-meta-${msg.id}`}
                      >
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {!isUser && (
                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 ml-auto flex items-center gap-1 transition cursor-pointer"
                            id={`btn-copy-msg-${msg.id}`}
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-green-500" />
                                <span className="text-green-500 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {loading && (
              <div className="flex justify-start animate-pulse" id="chat-bubble-loader">
                <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl rounded-bl-none p-4 max-w-[75%] shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium ml-1">Gemini is drafting a response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Message Area */}
      <div className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 p-5" id="chat-input-bar">
        <div className="max-w-3xl mx-auto flex items-center gap-2" id="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Ask Gemini anything..."
            className="flex-1 bg-white dark:bg-slate-950 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 focus:border-indigo-300 dark:focus:border-indigo-800 transition text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
            id="chat-text-input"
            disabled={loading}
          />
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-3 shadow hover:shadow-md transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            id="btn-send-message"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
