import React from "react";
import { Globe, Link2, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface UrlInputSectionProps {
  urls: [string, string, string];
  setUrls: (urls: [string, string, string]) => void;
  onLoadArticles: () => void;
  isLoading: boolean;
  loadingStep: string;
  errorMessage: string | null;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  urls,
  setUrls,
  onLoadArticles,
  isLoading,
  loadingStep,
  errorMessage,
}) => {
  const PRESET_TOPICS = [
    {
      title: "🤖 Frontier AI Breakthroughs",
      desc: "TechCrunch, The Verge, Ars Technica",
      links: [
        "https://techcrunch.com/2024/07/23/meta-releases-llama-3-1-open-source-ai-model/",
        "https://www.theverge.com/2024/5/13/24155493/openai-gpt-4o-flagship-multimodal-ai-model-free",
        "https://arstechnica.com/information-technology/2024/06/apple-intelligence-ai-features/",
      ] as [string, string, string],
    },
    {
      title: "🌍 Global Climate & Clean Energy",
      desc: "Reuters, BBC News, Nature Journal",
      links: [
        "https://www.reuters.com/business/environment/renewable-energy-growth-record-2023-2024-01-11/",
        "https://www.bbc.com/news/science-environment-58130705",
        "https://www.nature.com/articles/d41586-024-00123-x",
      ] as [string, string, string],
    },
  ];

  const handleUrlChange = (index: number, val: string) => {
    const updated: [string, string, string] = [...urls];
    updated[index] = val;
    setUrls(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mr-2">
              1
            </span>
            Enter News Article URLs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Provide 1 to 3 URLs of news articles to extract, clean, and vectorize into semantic chunks.
          </p>
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Quick Presets:</span>
          {PRESET_TOPICS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUrls(preset.links)}
              className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer"
              title={preset.desc}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* URL Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
            <Link2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Article URL 1 <span className="text-blue-600 ml-1 font-normal">(Required)</span>
          </label>
          <input
            id="url-input-1"
            type="url"
            value={urls[0]}
            onChange={(e) => handleUrlChange(0, e.target.value)}
            placeholder="https://www.bbc.com/news/..."
            className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 hover:bg-white transition-all text-slate-800"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
            <Link2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Article URL 2 <span className="text-slate-400 ml-1 font-normal">(Optional)</span>
          </label>
          <input
            id="url-input-2"
            type="url"
            value={urls[1]}
            onChange={(e) => handleUrlChange(1, e.target.value)}
            placeholder="https://www.reuters.com/..."
            className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 hover:bg-white transition-all text-slate-800"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
            <Link2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Article URL 3 <span className="text-slate-400 ml-1 font-normal">(Optional)</span>
          </label>
          <input
            id="url-input-3"
            type="url"
            value={urls[2]}
            onChange={(e) => handleUrlChange(2, e.target.value)}
            placeholder="https://techcrunch.com/..."
            className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 hover:bg-white transition-all text-slate-800"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <button
          id="load-articles-btn"
          onClick={onLoadArticles}
          disabled={isLoading || (!urls[0] && !urls[1] && !urls[2])}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-400" />
              Processing Pipeline...
            </>
          ) : (
            <>
              <span className="mr-2">📥</span>
              Load Articles
            </>
          )}
        </button>

        {/* Loading Indicator Pill */}
        {isLoading && (
          <div className="flex items-center space-x-2 bg-blue-50 text-blue-800 border border-blue-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
            <span>{loadingStep || "Processing..."}</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-xs sm:text-sm text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Article Processing Notice</p>
            <p className="mt-0.5 text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
