import React, { useState } from "react";
import { ResearchResult, Article } from "../types";
import { Loader2, ExternalLink, ChevronDown, ChevronRight, Send, AlertTriangle } from "lucide-react";

interface StreamlitMainProps {
  question: string;
  setQuestion: (q: string) => void;
  onResearch: () => void;
  isResearching: boolean;
  researchStep: string;
  articles: Article[];
  results: ResearchResult[];
  onOpenSidebar?: () => void;
}

export const StreamlitMain: React.FC<StreamlitMainProps> = ({
  question,
  setQuestion,
  onResearch,
  isResearching,
  researchStep,
  articles,
  results,
  onOpenSidebar,
}) => {
  const [expandedChunks, setExpandedChunks] = useState<Record<string, boolean>>({});

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isResearching) {
      e.preventDefault();
      onResearch();
    }
  };

  const toggleExpander = (id: string) => {
    setExpandedChunks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const latestResult = results.length > 0 ? results[0] : null;

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-10 py-8 select-text">
      {/* Title matching screenshot exactly */}
      <h1 className="text-3xl sm:text-[38px] font-bold text-[#31333F] tracking-tight mb-8 flex items-center gap-2">
        <span>News Research Tool</span>
        <span className="text-3xl sm:text-4xl" role="img" aria-label="chart">
          📈
        </span>
      </h1>

      {/* Question section matching screenshot */}
      <div className="mb-6">
        <label
          htmlFor="question-input"
          className="block text-sm font-normal text-[#31333F] mb-1.5"
        >
          Question:
        </label>

        {/* Input styled with light gray background #f0f2f6 exactly like in the screenshot */}
        <div className="relative flex items-center">
          <input
            id="question-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=""
            disabled={isResearching}
            className="w-full bg-[#f0f2f6] text-[#31333F] text-base rounded-md px-3.5 py-2.5 outline-none border border-transparent focus:border-[#ff4b4b] focus:ring-1 focus:ring-[#ff4b4b] transition-all shadow-2xs"
          />

          {/* Quick Submit button on the right */}
          <button
            onClick={onResearch}
            disabled={isResearching || !question.trim()}
            className={`absolute right-2 p-1.5 rounded-md text-slate-500 hover:text-[#ff4b4b] hover:bg-white/80 transition-colors cursor-pointer ${
              !question.trim() || isResearching ? "opacity-30 cursor-not-allowed" : ""
            }`}
            title="Submit question (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning if no articles indexed yet */}
      {articles.length === 0 && (
        <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200/80 rounded-lg text-sm text-amber-900 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">
              No news articles processed yet
            </p>
            <p className="text-amber-800 text-xs sm:text-sm mt-0.5">
              Enter 1 to 3 news article URLs in the sidebar on the left and click{" "}
              <strong>Process URLs</strong> to extract text and build the vector database.
            </p>
            {onOpenSidebar && (
              <button
                onClick={onOpenSidebar}
                className="mt-2 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Open Sidebar →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Streamlit-style Loading Spinner during research */}
      {isResearching && (
        <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 animate-in fade-in flex items-center space-x-3">
          <Loader2 className="w-5 h-5 text-[#ff4b4b] animate-spin shrink-0" />
          <div>
            <p className="font-medium text-[#31333F]">
              Searching FAISS vector index & querying model...
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{researchStep}</p>
          </div>
        </div>
      )}

      {/* Research Output (Streamlit Markdown Layout) */}
      {latestResult && !isResearching && (
        <div className="mt-8 space-y-6 animate-in fade-in">
          {/* Answer Section (### Answer in Streamlit) */}
          <div>
            <h2 className="text-xl font-bold text-[#31333F] mb-3 tracking-tight">
              Answer
            </h2>
            <div className="text-base text-[#31333F] leading-relaxed whitespace-pre-line bg-white">
              {latestResult.answer}
            </div>
          </div>

          {/* Sources Section (### Sources: in Streamlit) */}
          {latestResult.sources && latestResult.sources.length > 0 && (
            <div className="pt-2">
              <h3 className="text-lg font-bold text-[#31333F] mb-2 tracking-tight">
                Sources:
              </h3>
              <ul className="space-y-1.5 list-none pl-0 text-sm">
                {latestResult.sources.map((src, idx) => (
                  <li key={idx} className="flex items-start text-slate-700">
                    <span className="mr-2 text-slate-400">•</span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center break-all"
                    >
                      {src.title || src.url}
                      <ExternalLink className="w-3.5 h-3.5 ml-1 inline shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Streamlit Expander: View Retrieved Context Chunks */}
          {latestResult.retrievedChunks && latestResult.retrievedChunks.length > 0 && (
            <div className="mt-6 border border-slate-200 rounded-md overflow-hidden">
              <button
                onClick={() => toggleExpander(latestResult.id)}
                className="w-full px-4 py-2.5 bg-[#f0f2f6] hover:bg-[#e8ebf0] text-left text-sm font-medium text-[#31333F] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center">
                  {expandedChunks[latestResult.id] ? (
                    <ChevronDown className="w-4 h-4 mr-2 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2 text-slate-600" />
                  )}
                  View Retrieved Context Chunks ({latestResult.retrievedChunks.length})
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  Vector relevance score & source excerpts
                </span>
              </button>

              {expandedChunks[latestResult.id] && (
                <div className="p-4 bg-white space-y-3 divide-y divide-slate-100">
                  {latestResult.retrievedChunks.map((rc, i) => (
                    <div key={i} className="pt-3 first:pt-0">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">
                          {rc.chunk.source} • {rc.chunk.articleTitle}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">
                          Cosine Score: {rc.score.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                        "{rc.chunk.content}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
