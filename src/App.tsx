import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  MessageSquare, 
  Sparkles, 
  Layout, 
  Compass, 
  ArrowRight,
  Cpu,
  Bookmark
} from "lucide-react";
import { WorkspaceItem, ItemType, ChatMessage } from "./types";
import HistorySidebar from "./components/HistorySidebar";
import PromptWorkspace from "./components/PromptWorkspace";
import AIAssistant from "./components/AIAssistant";
import { motion, AnimatePresence } from "motion/react";

// Pre-populated default items to make the workspace feel professional and ready to use
const DEFAULT_ITEMS: WorkspaceItem[] = [
  {
    id: "welcome-note-1",
    title: "Welcome to AI Assistant Workspace",
    type: "note",
    content: "Welcome to your AI Writing & Design Assistant Workspace!\n\nThis is a fully-featured, high-contrast, production-ready creative studio powered by Google's Gemini models.\n\nOn this page, you can:\n1. Refine, polish, and transform your notes using specific editorial styles on the left pane.\n2. Generate stunning, professional AI images using the Image creation tool.\n3. Brainstorm or research subjects interactively using the multi-turn conversational chat assistant.\n\nSelect an item from the history panel to view or edit, or click one of the 'Create New' cards above to start a fresh project!",
    promptUsed: "System onboarding introduction note",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    tags: ["onboarding", "guide"],
  },
  {
    id: "welcome-chat-1",
    title: "Writing Assistant Chatbot",
    type: "chat",
    content: "",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    chatHistory: [
      {
        id: "msg-init-1",
        role: "model",
        text: "Hello! I am your interactive Gemini brainstorm assistant. How can I assist you with your creative process, research, or outlines today?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    tags: ["chat", "brainstorm"],
  },
];

export default function App() {
  const [items, setItems] = useState<WorkspaceItem[]>(() => {
    try {
      const stored = localStorage.getItem("gemini_workspace_items");
      return stored ? JSON.parse(stored) : DEFAULT_ITEMS;
    } catch (e) {
      return DEFAULT_ITEMS;
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("gemini_workspace_dark_mode");
      return stored ? JSON.parse(stored) : false;
    } catch (e) {
      return false;
    }
  });

  // Toggle document root dark class on change
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("gemini_workspace_dark_mode", JSON.stringify(darkMode));
  }, [darkMode]);

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return DEFAULT_ITEMS[0]?.id || null;
  });

  const [serverStatus, setServerStatus] = useState<"connecting" | "healthy" | "error">("connecting");

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("gemini_workspace_items", JSON.stringify(items));
  }, [items]);

  // Check backend server health on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => {
        if (res.ok) setServerStatus("healthy");
        else setServerStatus("error");
      })
      .catch(() => setServerStatus("error"));
  }, []);

  const handleSelectItem = (id: string) => {
    setSelectedId(id);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);

    if (selectedId === id) {
      setSelectedId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleNewItem = (type: ItemType) => {
    const defaultTitle = 
      type === "note" 
        ? "New Writing Document" 
        : type === "image" 
        ? "New AI Image Design" 
        : "Interactive Chat Thread";

    const newItem: WorkspaceItem = {
      id: `item-${Date.now()}`,
      title: defaultTitle,
      type,
      content: "",
      promptUsed: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chatHistory: type === "chat" ? [
        {
          id: `msg-${Date.now()}-welcome`,
          role: "model",
          text: "Hi! How can I help you brainstorm, code, or design today?",
          timestamp: new Date().toISOString(),
        }
      ] : undefined,
    };

    setItems((prev) => [newItem, ...prev]);
    setSelectedId(newItem.id);
  };

  const handleUpdateItem = (id: string, updates: Partial<WorkspaceItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const selectedItem = items.find((item) => item.id === selectedId);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 overflow-hidden transition-colors duration-200" id="main-app-frame">
      {/* Sidebar Controller */}
      <HistorySidebar
        items={items}
        selectedId={selectedId}
        onSelectItem={handleSelectItem}
        onDeleteItem={handleDeleteItem}
        onNewItem={handleNewItem}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 h-full flex flex-col overflow-hidden" id="workspace-main-area">
        {selectedItem ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedItem.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex-1 h-full overflow-hidden flex flex-col"
              id={`workspace-wrapper-${selectedItem.id}`}
            >
              {selectedItem.type === "chat" ? (
                <AIAssistant item={selectedItem} onUpdateItem={handleUpdateItem} />
              ) : (
                <PromptWorkspace item={selectedItem} onUpdateItem={handleUpdateItem} />
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          // General welcome screen if no items exist
          <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 transition-colors duration-200" id="dashboard-empty-state">
            <div className="max-w-md text-center space-y-6" id="dashboard-intro-wrapper">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto shadow-sm" id="dashboard-icon">
                <Sparkles className="w-6 h-6" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 tracking-tight">
                  No active project selected
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  Start your creative design process immediately. Select one of the creator panels below to write custom editorial pieces, generate stunning artwork, or ask Gemini conversational questions.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3" id="quick-create-actions">
                <button
                  onClick={() => handleNewItem("note")}
                  className="flex flex-col items-center p-4 border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 rounded-xl hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition cursor-pointer text-xs font-semibold text-gray-700 dark:text-slate-300 gap-1.5"
                  id="dashboard-btn-note"
                >
                  <FileText className="w-5 h-5 text-amber-500" />
                  <span>Document</span>
                </button>
                <button
                  onClick={() => handleNewItem("image")}
                  className="flex flex-col items-center p-4 border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 rounded-xl hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition cursor-pointer text-xs font-semibold text-gray-700 dark:text-slate-300 gap-1.5"
                  id="dashboard-btn-image"
                >
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  <span>AI Image</span>
                </button>
                <button
                  onClick={() => handleNewItem("chat")}
                  className="flex flex-col items-center p-4 border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 rounded-xl hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition cursor-pointer text-xs font-semibold text-gray-700 dark:text-slate-300 gap-1.5"
                  id="dashboard-btn-chat"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  <span>AI Chat</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backend API status bar */}
      <div className="absolute bottom-4 right-4 z-40 text-[10px] bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-full px-3 py-1 shadow-sm flex items-center gap-1.5" id="health-indicator-container">
        <span className={`w-2 h-2 rounded-full ${
          serverStatus === "healthy" ? "bg-green-500" : serverStatus === "connecting" ? "bg-amber-400 animate-pulse" : "bg-red-500"
        }`} id="health-dot" />
        <span className="text-gray-400 dark:text-slate-500 font-medium">
          API State: <span className="text-gray-600 dark:text-slate-300 font-semibold uppercase">{serverStatus === "connecting" ? "Checking..." : serverStatus}</span>
        </span>
      </div>
    </div>
  );
}
