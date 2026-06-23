import React, { useState } from "react";
import { 
  Plus, 
  MessageSquare, 
  Image as ImageIcon, 
  FileText, 
  Trash2, 
  Search, 
  Sparkles,
  Layers,
  Tag,
  Sun,
  Moon
} from "lucide-react";
import { WorkspaceItem, ItemType } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HistorySidebarProps {
  items: WorkspaceItem[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
  onNewItem: (type: ItemType) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function HistorySidebar({
  items,
  selectedId,
  onSelectItem,
  onDeleteItem,
  onNewItem,
  darkMode,
  onToggleDarkMode,
}: HistorySidebarProps) {
  const [filter, setFilter] = useState<ItemType | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(items.flatMap((item) => item.tags || []))
  ).sort();

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "all" || item.type === filter;
    const matchesTag = !selectedTagFilter || (item.tags && item.tags.includes(selectedTagFilter));
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.promptUsed && item.promptUsed.toLowerCase().includes(search.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(search.toLowerCase())) ||
      (item.chatHistory && item.chatHistory.some(msg => msg.text.toLowerCase().includes(search.toLowerCase()))) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
    return matchesFilter && matchesTag && matchesSearch;
  });

  const getIcon = (type: ItemType) => {
    switch (type) {
      case "chat":
        return <MessageSquare className="w-4 h-4 text-emerald-500" id="icon-chat-item" />;
      case "image":
        return <ImageIcon className="w-4 h-4 text-blue-500" id="icon-image-item" />;
      case "note":
        return <FileText className="w-4 h-4 text-amber-500" id="icon-note-item" />;
    }
  };

  return (
    <div className="w-80 border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col flex-shrink-0 transition-colors duration-200" id="sidebar-container">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between" id="sidebar-header">
        <div className="flex items-center gap-2" id="brand-logo-container">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg" id="brand-icon">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-semibold text-gray-800 dark:text-slate-200 tracking-tight text-sm" id="brand-title">
            Creative Playground
          </span>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.08, rotate: 12 }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggleDarkMode}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
            id="btn-toggle-dark-mode"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={darkMode ? "dark" : "light"}
                initial={{ y: -8, opacity: 0, rotate: -30 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 8, opacity: 0, rotate: 30 }}
                transition={{ duration: 0.15 }}
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Global Search Bar (at the top) */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800" id="sidebar-top-search-container">
        <div className="relative" id="sidebar-search-box">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search titles & contents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800/80 rounded-lg text-xs focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-950/50 focus:border-indigo-300 dark:focus:border-indigo-800 focus:bg-white dark:focus:bg-slate-900 outline-none transition text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 font-sans"
            id="sidebar-search-input"
          />
        </div>
      </div>

      {/* Primary Actions */}
      <div className="p-4 space-y-2 border-b border-gray-100 dark:border-slate-800" id="sidebar-creation-actions">
        <p className="text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider px-1">
          Create New
        </p>
        <div className="grid grid-cols-3 gap-2" id="new-item-buttons-grid">
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNewItem("note")}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition text-xs font-medium text-gray-700 dark:text-slate-350 gap-1.5 group cursor-pointer"
            id="btn-new-note"
            title="Create Writing Doc"
          >
            <FileText className="w-4 h-4 text-amber-500 group-hover:scale-110 transition" />
            <span>Doc</span>
          </motion.button>
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNewItem("image")}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition text-xs font-medium text-gray-700 dark:text-slate-350 gap-1.5 group cursor-pointer"
            id="btn-new-image"
            title="Generate AI Image"
          >
            <ImageIcon className="w-4 h-4 text-blue-500 group-hover:scale-110 transition" />
            <span>Image</span>
          </motion.button>
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNewItem("chat")}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition text-xs font-medium text-gray-700 dark:text-slate-350 gap-1.5 group cursor-pointer"
            id="btn-new-chat"
            title="Start Chat Assistant"
          >
            <MessageSquare className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition" />
            <span>Chat</span>
          </motion.button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pt-3 pb-2 space-y-2" id="sidebar-filters-container">
        <div className="flex gap-1 p-0.5 bg-gray-50 dark:bg-slate-800/60 rounded-lg text-[11px] relative z-0" id="filter-tabs-group">
          {(["all", "note", "image", "chat"] as const).map((type) => {
            const isActive = filter === type;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`relative flex-1 py-1 rounded-md text-center font-medium capitalize transition-colors duration-200 cursor-pointer outline-none ${
                  isActive
                    ? "text-gray-800 dark:text-slate-100 font-semibold"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-250"
                }`}
                id={`filter-tab-${type}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-filter-tab"
                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{type === "all" ? "All" : type}</span>
              </button>
            );
          })}
        </div>

        {allTags.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-1.5" id="sidebar-tag-filters">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3 text-indigo-500" />
              <span>Filter by tag</span>
            </span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1" id="tag-filters-group">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedTagFilter(null)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer ${
                  selectedTagFilter === null
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
                id="tag-filter-all"
              >
                All
              </motion.button>
              {allTags.map((tag) => (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  key={tag}
                  onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer border ${
                    selectedTagFilter === tag
                      ? "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-sm"
                      : "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/40 dark:hover:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/40"
                  }`}
                  id={`tag-filter-${tag}`}
                >
                  #{tag}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1" id="sidebar-items-list">
        <p className="text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1.5">
          History
        </p>
        <AnimatePresence initial={false}>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 px-4" id="empty-history-indicator">
              <Layers className="w-8 h-8 text-gray-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">No items found</p>
              <p className="text-[11px] text-gray-300 dark:text-slate-600 mt-0.5">Create something amazing above!</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onSelectItem(item.id)}
                  className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition border ${
                    isSelected
                      ? "bg-indigo-50/30 dark:bg-indigo-950/10 text-gray-900 dark:text-slate-100 border-indigo-100 dark:border-indigo-900/50"
                      : "hover:bg-gray-50/40 dark:hover:bg-slate-800/30 text-gray-700 dark:text-slate-400 border-transparent"
                  }`}
                  id={`history-item-${item.id}`}
                >
                  <div className="mt-0.5" id={`history-item-icon-${item.id}`}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6" id={`history-item-info-${item.id}`}>
                    <h4 className="text-xs font-semibold truncate text-gray-800 dark:text-slate-200" id={`history-item-title-${item.id}`}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 truncate" id={`history-item-subtitle-${item.id}`}>
                      {item.promptUsed || (item.type === "note" ? "Draft document" : "AI conversation")}
                    </p>
                    <span className="text-[9px] text-gray-400 dark:text-slate-500 font-mono mt-1 block" id={`history-item-time-${item.id}`}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5" id={`history-item-tags-${item.id}`}>
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-1.5 py-0.5 rounded bg-indigo-50/50 dark:bg-indigo-950/20 text-[9px] text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-100/30 dark:border-indigo-900/30"
                            id={`history-item-tag-${item.id}-${tag}`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => onDeleteItem(item.id, e)}
                    className="absolute right-2 top-3 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                    id={`btn-delete-${item.id}`}
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
