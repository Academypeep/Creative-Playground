import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Sparkles, 
  Cpu, 
  Copy, 
  Check, 
  Download, 
  Image as ImageIcon, 
  Compass, 
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Maximize2
} from "lucide-react";
import { WorkspaceItem, RefineOptions, ImageOptions, ItemType } from "../types";
import { motion, AnimatePresence } from "motion/react";
import TagManager from "./TagManager";

interface PromptWorkspaceProps {
  item: WorkspaceItem;
  onUpdateItem: (id: string, updates: Partial<WorkspaceItem>) => void;
}

export default function PromptWorkspace({ item, onUpdateItem }: PromptWorkspaceProps) {
  // Refine text states
  const [refinePrompt, setRefinePrompt] = useState(item.promptUsed || "");
  const [refineStyle, setRefineStyle] = useState<"professional" | "academic" | "casual" | "summarize" | "expand">("professional");
  const [isRefining, setIsRefining] = useState(false);
  const [textOutput, setTextOutput] = useState(item.content || "");

  // Image states
  const [imagePrompt, setImagePrompt] = useState(item.promptUsed || "");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3" | "16:9" | "9:16">((item.aspectRatio as any) || "1:1");
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState(item.content || "");

  // Shared states
  const [copied, setCopied] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if selected item changes
  useEffect(() => {
    setError(null);
    if (item.type === "note") {
      setRefinePrompt(item.promptUsed || "");
      setTextOutput(item.content || "");
    } else if (item.type === "image") {
      setImagePrompt(item.promptUsed || "");
      setGeneratedImgUrl(item.content || "");
      setAspectRatio((item.aspectRatio as any) || "1:1");
    }
  }, [item.id, item.type]);

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImgUrl) return;
    const link = document.createElement("a");
    link.href = generatedImgUrl;
    link.download = `gemini-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportText = (format: "txt" | "md") => {
    if (!textOutput) return;
    const element = document.createElement("a");
    const file = new Blob([textOutput], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    const sanitizedTitle = (item.title || "refined-draft").replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    element.download = `${sanitizedTitle}.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setShowExportDropdown(false);
  };

  const handleRefine = async () => {
    if (!refinePrompt.trim()) {
      setError("Please write or paste some text first.");
      return;
    }
    setIsRefining(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "refine",
          prompt: refinePrompt,
          template: refineStyle,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Refining failed");
      }

      const data = await response.json();
      setTextOutput(data.text);
      onUpdateItem(item.id, {
        content: data.text,
        promptUsed: refinePrompt,
        title: refinePrompt.slice(0, 30) + (refinePrompt.length > 30 ? "..." : ""),
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during refinement.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setError("Please enter a descriptive prompt for the image.");
      return;
    }
    setIsGeneratingImg(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Image generation failed");
      }

      const data = await response.json();
      setGeneratedImgUrl(data.imageUrl);
      onUpdateItem(item.id, {
        content: data.imageUrl,
        promptUsed: imagePrompt,
        aspectRatio,
        title: imagePrompt.slice(0, 30) + (imagePrompt.length > 30 ? "..." : ""),
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during image generation.");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const getCharCount = (text: string) => {
    return text ? text.length : 0;
  };

  const sampleTexts = [
    {
      label: "Meeting Notes",
      text: "Draft: Discussed Q3 product plans. Sarah to finalize designs by Friday. Dave will check database compatibility. Launch set for late September. Need to test with select customers first. Overall good progress.",
    },
    {
      label: "Raw Idea",
      text: "Idea: Build a web application that helps creators generate writing ideas and custom images in one single screen. Use Gemini API. Must have nice layouts, clear states, and responsive design.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-slate-950/20 h-full overflow-hidden" id={`workspace-container-${item.id}`}>
      {/* Workspace Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-8 py-5 flex items-center justify-between" id="workspace-header">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-500 dark:text-indigo-400 font-semibold">
            {item.type === "note" ? "Writing & Editorial Suite" : "AI Art Studio"}
          </span>
          <h2 className="text-base font-bold text-gray-800 dark:text-slate-100 tracking-tight mt-0.5">
            {item.title || "Untitled Creation"}
          </h2>
        </div>

        <div className="flex items-center gap-3" id="workspace-header-actions">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium" id="status-chip">
            <Cpu className="w-3.5 h-3.5" />
            <span>Gemini 3.5 Active</span>
          </div>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="flex-1 flex overflow-hidden" id="workspace-split-content">
        {/* Left Pane - Inputs / Parameter Panel */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-100 dark:border-slate-800 flex flex-col space-y-6 bg-white dark:bg-slate-900" id="workspace-left-pane">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5 animate-fadeIn" id="workspace-error-box">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Operation failed</p>
                <p className="mt-0.5 text-red-500">{error}</p>
              </div>
            </div>
          )}

          {item.type === "note" ? (
            // WRITING PANEL
            <>
              <div className="space-y-2.5" id="writing-prompt-section">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Source Text or Ideas</label>
                  <div className="flex gap-2">
                    {sampleTexts.map((sample, idx) => (
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        key={idx}
                        onClick={() => {
                          setRefinePrompt(sample.text);
                          setError(null);
                        }}
                        className="text-[10px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 px-2 py-0.5 rounded cursor-pointer transition-colors border border-indigo-100/50 dark:border-indigo-900/30"
                        id={`btn-sample-${idx}`}
                      >
                        + {sample.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={refinePrompt}
                  onChange={(e) => {
                    setRefinePrompt(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleRefine();
                    }
                  }}
                  placeholder="Paste your drafts, bullet points, or paragraphs here..."
                  className="w-full h-44 p-3.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-xl text-xs text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 focus:border-indigo-300 dark:focus:border-indigo-800 hover:border-gray-300 dark:hover:border-slate-700 transition placeholder-gray-400 dark:placeholder-slate-500 font-sans"
                  id="writing-prompt-textarea"
                />
              </div>

              <div className="space-y-3" id="writing-style-section">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block">Editorial Style Template</label>
                <div className="grid grid-cols-2 gap-2" id="style-chips-grid">
                  {[
                    { id: "professional", label: "Professional", desc: "Polish grammar & clear business tone" },
                    { id: "academic", label: "Academic", desc: "Scientific phrasing & structure" },
                    { id: "casual", label: "Casual", desc: "Warm, highly engaging tone" },
                    { id: "summarize", label: "Summarize", desc: "Key facts & key action items" },
                    { id: "expand", label: "Expand & Elaborate", desc: "Add details, depth, & prose" },
                  ].map((style) => {
                    const active = refineStyle === style.id;
                    return (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        key={style.id}
                        onClick={() => setRefineStyle(style.id as any)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
                          active
                            ? "bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/80 text-indigo-700 dark:text-indigo-400 shadow-sm"
                            : "bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700/80 hover:bg-gray-50/50 dark:hover:bg-slate-800/40"
                        }`}
                        id={`style-chip-${style.id}`}
                      >
                        <p className="text-xs font-semibold capitalize text-gray-800 dark:text-slate-200">{style.label}</p>
                        <p className={`text-[10px] mt-0.5 ${active ? "text-indigo-500/80 dark:text-indigo-400/80" : "text-gray-400 dark:text-slate-500"}`}>
                          {style.desc}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4" id="writing-refine-action">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRefine}
                  disabled={isRefining}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:from-indigo-700 hover:to-indigo-600 transition disabled:opacity-50 cursor-pointer disabled:pointer-events-none"
                  id="btn-trigger-refine"
                >
                  {isRefining ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Refining Draft with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-4 h-4" />
                      <span>Refine with Gemini AI</span>
                    </>
                  )
                  }
                </motion.button>
              </div>
            </>
          ) : (
            // IMAGE PANEL
            <>
              <div className="space-y-2.5" id="image-prompt-section">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Image Description & Concept</label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => {
                    setImagePrompt(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleGenerateImage();
                    }
                  }}
                  placeholder="Describe your scene, art style, details, lighting, and composition (e.g., 'Minimalist vaporwave illustration of a computer setup with neon pink lighting, digital art, high contrast')..."
                  className="w-full h-44 p-3.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-xl text-xs text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 focus:border-indigo-300 dark:focus:border-indigo-800 hover:border-gray-300 dark:hover:border-slate-700 transition placeholder-gray-400 dark:placeholder-slate-500 font-sans"
                  id="image-prompt-textarea"
                />
              </div>

              <div className="space-y-3" id="image-aspect-section">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-2" id="aspect-ratio-buttons">
                  {(["1:1", "4:3", "16:9", "9:16"] as const).map((ratio) => {
                    const active = aspectRatio === ratio;
                    return (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-2 px-3 rounded-lg border text-center transition cursor-pointer text-xs font-medium ${
                          active
                            ? "bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/80 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-700/80 hover:bg-gray-50/50 dark:hover:bg-slate-800/40"
                        }`}
                        id={`ratio-btn-${ratio.replace(":", "-")}`}
                      >
                        <span className="block text-[11px] text-gray-400 dark:text-slate-500 mb-0.5">
                          {ratio === "1:1" ? "Square" : ratio === "16:9" ? "Landscape" : ratio === "9:16" ? "Portrait" : "Standard"}
                        </span>
                        {ratio}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4" id="image-generate-action">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImg}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:from-indigo-700 hover:to-indigo-600 transition disabled:opacity-50 cursor-pointer disabled:pointer-events-none"
                  id="btn-trigger-generate-image"
                >
                  {isGeneratingImg ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Art with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-4 h-4" />
                      <span>Generate Image with Gemini AI</span>
                    </>
                  )}
                </motion.button>
              </div>
            </>
          )}
          
          <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-6" id="workspace-tags-section">
            <TagManager item={item} onUpdateItem={onUpdateItem} />
          </div>
        </div>

        {/* Right Pane - Outputs / Visual Preview */}
        <div className="w-1/2 p-6 overflow-y-auto flex flex-col bg-gray-50/30 dark:bg-slate-950/10" id="workspace-right-pane">
          {item.type === "note" ? (
            // WRITING DISPLAY
            <div className="flex-1 flex flex-col h-full space-y-4" id="writing-display-container">
              <div className="flex items-center justify-between text-xs" id="writing-display-actions">
                <span className="font-medium text-gray-400 dark:text-slate-500">Refined Output</span>
                {textOutput && (
                  <div className="flex items-center gap-2 relative z-10" id="writing-actions-btn-group">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCopy(textOutput)}
                      className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-colors"
                      id="btn-copy-doc-output"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Draft</span>
                        </>
                      )}
                    </motion.button>

                    <div className="relative">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-colors"
                        id="btn-export-doc"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export</span>
                      </motion.button>

                      <AnimatePresence>
                        {showExportDropdown && (
                          <>
                            {/* Backdrop to close the dropdown when clicking outside */}
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setShowExportDropdown(false)} 
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-20"
                              id="export-dropdown-menu"
                            >
                              <button
                                onClick={() => handleExportText("txt")}
                                className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 cursor-pointer"
                                id="btn-export-txt"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Download as .txt
                              </button>
                              <button
                                onClick={() => handleExportText("md")}
                                className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 cursor-pointer"
                                id="btn-export-md"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                Download as .md
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm min-h-[300px] flex flex-col justify-between" id="writing-output-box">
                <div className="prose max-w-none text-xs text-gray-700 dark:text-slate-200 leading-relaxed overflow-y-auto max-h-[460px] whitespace-pre-wrap font-sans" id="refined-text-display">
                  {isRefining ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-3" id="text-loader">
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-100 dark:border-indigo-950 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
                      <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Drafting response...</p>
                    </div>
                  ) : textOutput ? (
                    textOutput
                  ) : (
                    <div className="text-center py-24 text-gray-300 dark:text-slate-600 space-y-2" id="text-empty-state">
                      <FileText className="w-12 h-12 mx-auto stroke-[1.2]" />
                      <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Your refined draft will appear here</p>
                    </div>
                  )}
                </div>

                {textOutput && !isRefining && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500 font-mono" id="refined-text-metrics">
                    <span>Metrics</span>
                    <div className="flex gap-4">
                      <span>{getWordCount(textOutput)} words</span>
                      <span>{getCharCount(textOutput)} characters</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // IMAGE DISPLAY
            <div className="flex-1 flex flex-col h-full space-y-4" id="image-display-container">
              <div className="flex items-center justify-between text-xs" id="image-display-actions">
                <span className="font-medium text-gray-400 dark:text-slate-500">Generated Art</span>
                {generatedImgUrl && (
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCopy(generatedImgUrl)}
                      className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-slate-200 font-semibold bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition"
                      id="btn-copy-image-base64"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span>Copied Link</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadImage}
                      className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition"
                      id="btn-download-image"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-sm min-h-[300px] flex items-center justify-center p-6 overflow-hidden relative" id="image-output-box">
                {isGeneratingImg ? (
                  <div className="flex flex-col items-center justify-center space-y-4 text-center z-10" id="image-loader">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-100 dark:border-indigo-950 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">Dreaming up your art...</p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Usually takes 4-7 seconds</p>
                    </div>
                  </div>
                ) : generatedImgUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center" id="img-display-wrapper">
                    <img
                      src={generatedImgUrl}
                      alt={item.title || "AI Art"}
                      referrerPolicy="no-referrer"
                      className="max-h-[440px] max-w-full rounded-lg shadow-md object-contain"
                      id="generated-image"
                    />
                  </div>
                ) : (
                  <div className="text-center py-24 text-gray-300 dark:text-slate-600 space-y-2" id="image-empty-state">
                    <ImageIcon className="w-12 h-12 mx-auto stroke-[1.2]" />
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Your generated art will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
