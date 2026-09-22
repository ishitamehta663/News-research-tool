import React, { useState } from "react";
import { X, Loader2, CheckCircle2, AlertCircle, Sparkles, Trash2 } from "lucide-react";

interface StreamlitSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  urls: [string, string, string];
  setUrls: React.Dispatch<React.SetStateAction<[string, string, string]>>;
  onProcessUrls: () => void;
  isLoading: boolean;
  loadingStep: string;
  errorMessage: string | null;
  articlesCount: number;
}

export const StreamlitSidebar: React.FC<StreamlitSidebarProps> = ({
  isOpen,
  onClose,
  urls,
  setUrls,
  onProcessUrls,
  isLoading,
  loadingStep,
  errorMessage,
  articlesCount,
}) => {
  const [showPresets, setShowPresets] = useState(false);

  const handleUrlChange = (index: number, val: string) => {
    const updated: [string, string, string] = [...urls] as [string, string, string];
    updated[index] = val;
    setUrls(updated);
  };

  const handleLoadSample = (sample: [string, string, string]) => {
    setUrls(sample);
  };

  const handleClear = () => {
    setUrls(["", "", ""]);
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 md:w-88 shrink-0 bg-[#f0f2f6] border-r border-[#dcdfe4]/60 flex flex-col h-full min-h-screen relative select-none">
      {/* Top Bar with Close Button */}
      <div className="flex items-center justify-end px-4 pt-3 pb-1">
        <button
          id="close-sidebar-btn"
          onClick={onClose}
          className="p-1 rounded text-slate-500 hover:text-[#31333F] hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Sidebar Content */}
      <div className="px-6 py-2 flex-1 overflow-y-auto">
        {/* Title matching screenshot */}
        <h2 className="text-xl md:text-[22px] font-bold text-[#31333F] mb-5 tracking-tight">
          News Article URLs
        </h2>

        {/* URL Inputs 1, 2, 3 */}
        <div className="space-y-4 mb-5">
          {/* URL 1 */}
          <div>
            <label className="block text-sm font-normal text-[#31333F] mb-1.5">
              URL 1
            </label>
            <input
              id="url-input-1"
              type="url"
              value={urls[0]}
              onChange={(e) => handleUrlChange(0, e.target.value)}
              placeholder="https://..."
              className="w-full bg-white border border-[#dcdfe4] text-[#31333F] text-sm rounded-md px-3 py-2 outline-none focus:border-[#ff4b4b] focus:ring-1 focus:ring-[#ff4b4b] transition-all shadow-2xs placeholder-slate-300"
            />
          </div>

          {/* URL 2 */}
          <div>
            <label className="block text-sm font-normal text-[#31333F] mb-1.5">
              URL 2
            </label>
            <input
              id="url-input-2"
              type="url"
              value={urls[1]}
              onChange={(e) => handleUrlChange(1, e.target.value)}
              placeholder="https://..."
              className="w-full bg-white border border-[#dcdfe4] text-[#31333F] text-sm rounded-md px-3 py-2 outline-none focus:border-[#ff4b4b] focus:ring-1 focus:ring-[#ff4b4b] transition-all shadow-2xs placeholder-slate-300"
            />
          </div>

          {/* URL 3 */}
          <div>
            <label className="block text-sm font-normal text-[#31333F] mb-1.5">
              URL 3
            </label>
            <input
              id="url-input-3"
              type="url"
              value={urls[2]}
              onChange={(e) => handleUrlChange(2, e.target.value)}
              placeholder="https://..."
              className="w-full bg-white border border-[#dcdfe4] text-[#31333F] text-sm rounded-md px-3 py-2 outline-none focus:border-[#ff4b4b] focus:ring-1 focus:ring-[#ff4b4b] transition-all shadow-2xs placeholder-slate-300"
            />
          </div>
        </div>

        {/* Process URLs Button matching screenshot */}
        <div className="mb-5">
          <button
            id="process-urls-btn"
            onClick={onProcessUrls}
            disabled={isLoading}
            className={`w-auto px-4 py-2 bg-white text-[#31333F] text-sm font-medium border border-[#d6d9dc] rounded-md transition-all cursor-pointer shadow-2xs hover:border-[#ff4b4b] hover:text-[#ff4b4b] active:scale-98 ${
              isLoading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-[#ff4b4b]" />
                Processing...
              </span>
            ) : (
              "Process URLs"
            )}
          </button>
        </div>

        {/* Streamlit-style loading status and progress */}
        {isLoading && (
          <div className="mb-4 p-3 bg-white/80 border border-slate-200 rounded-lg text-xs text-slate-700 animate-in fade-in">
            <div className="flex items-center text-[#ff4b4b] font-medium mb-1">
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              <span>Running pipeline...</span>
            </div>
            <p className="text-slate-600">{loadingStep || "Analyzing articles..."}</p>
          </div>
        )}

        {/* Streamlit-style error box */}
        {errorMessage && !isLoading && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="break-words">{errorMessage}</p>
          </div>
        )}

        {/* Streamlit-style success alert */}
        {articlesCount > 0 && !isLoading && !errorMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Articles Indexed!</p>
              <p className="text-emerald-700 mt-0.5">
                {articlesCount} articles successfully parsed & vectorized in FAISS.
              </p>
            </div>
          </div>
        )}

        {/* Quick Sample Presets (Streamlit helper) */}
        <div className="pt-3 border-t border-[#dcdfe4]/60">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Quick Presets:</span>
            <button
              onClick={handleClear}
              className="hover:text-red-500 transition-colors flex items-center cursor-pointer"
              title="Clear all URLs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() =>
                handleLoadSample([
                  "https://techcrunch.com/2024/07/23/meta-releases-llama-3-1-open-source-ai-model/",
                  "https://www.theverge.com/2024/5/13/24155493/openai-gpt-4o-flagship-multimodal-ai-model-free",
                  "https://arstechnica.com/information-technology/2024/06/apple-intelligence-ai-features/",
                ])
              }
              className="text-left text-xs px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded transition-colors cursor-pointer flex items-center"
            >
              <Sparkles className="w-3 h-3 mr-1.5 text-blue-500" />
              Load AI Tech Sample URLs
            </button>

            <button
              onClick={() =>
                handleLoadSample([
                  "https://www.nature.com/articles/d41586-024-00123-x",
                  "https://www.bbc.com/news/science-environment-58130705",
                  "https://www.reuters.com/business/environment/renewable-energy-growth-record-2023-2024-01-11/",
                ])
              }
              className="text-left text-xs px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded transition-colors cursor-pointer flex items-center"
            >
              <Sparkles className="w-3 h-3 mr-1.5 text-emerald-500" />
              Load Climate & Science URLs
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
