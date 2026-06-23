import React, { useState } from "react";
import { Tag, Plus, X } from "lucide-react";
import { WorkspaceItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface TagManagerProps {
  item: WorkspaceItem;
  onUpdateItem: (id: string, updates: Partial<WorkspaceItem>) => void;
}

export default function TagManager({ item, onUpdateItem }: TagManagerProps) {
  const [newTag, setNewTag] = useState("");
  const tags = item.tags || [];

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const formattedTag = newTag.trim().toLowerCase();
    
    if (!formattedTag) return;
    if (tags.includes(formattedTag)) {
      setNewTag("");
      return; // No duplicate tags
    }

    onUpdateItem(item.id, {
      tags: [...tags, formattedTag],
    });
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateItem(item.id, {
      tags: tags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl" id={`tag-manager-${item.id}`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-slate-300" id="tag-manager-title">
        <Tag className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
        <span>Workspace Tags</span>
      </div>

      {/* Tags List */}
      <div className="flex flex-wrap gap-1.5 py-1 min-h-[32px]" id="tags-list">
        <AnimatePresence initial={false}>
          {tags.length === 0 ? (
            <motion.span
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-gray-400 dark:text-slate-500 italic"
            >
              No tags added yet. Organize your workspace by adding a tag below!
            </motion.span>
          ) : (
            tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-100/80 dark:border-indigo-900/40"
                id={`tag-badge-${tag}`}
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-full p-0.5 text-indigo-500 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors cursor-pointer"
                  id={`btn-remove-tag-${tag}`}
                  title={`Remove tag ${tag}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </motion.span>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddTag} className="flex items-center gap-2 mt-1.5" id="add-tag-form">
        <input
          type="text"
          placeholder="New tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          maxLength={20}
          className="flex-1 min-w-0 h-8 px-3 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 font-sans"
          id="tag-input-field"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!newTag.trim()}
          className="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex-shrink-0 shadow-sm"
          id="btn-add-tag-submit"
          title="Add tag"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </motion.button>
      </form>
    </div>
  );
}
