import React, { useState } from "react";
import { ExternalLink, BookOpen, Layers, CheckCircle2, ShieldCheck, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { ResearchResult } from "../types";

interface ResearchResultsProps {
  results: ResearchResult[];
  onClearHistory: () => void;
}

export const ResearchResults: React.FC<ResearchResultsProps> = ({ results, onClearHistory }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedChunks, setExpandedChunks] = useState<Record<string, boolean>>({});

  if (results.length === 0) return null;

  const toggleChunks = (id: string) => {
    setExpandedChunks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyAnswer = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center">
          <BookOpen className="w-4 h-4 text-indigo-600 mr-2" />
          Research Findings & Grounded Answers ({results.length})
        </h3>
        {results.length > 1 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-500 hover:text-slate-700 underline font-medium cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      {results.map((res, index) => {
        const isLatest = index === 0;
        const areChunksOpen = expandedChunks[res.id] ?? isLatest;

        return (
          <article
            key={res.id}
            className={`bg-white rounded-2xl border transition-all shadow-xs p-6 ${
              isLatest ? "border-indigo-200 ring-1 ring-indigo-500/10" : "border-slate-200"
            }`}
          >
            {/* Question Title & Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-start space-x-2.5">
                <span className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  Q
                </span>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {res.question}
                </h4>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400 self-end sm:self-auto">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                  {res.modelUsed}
                </span>
                <button
                  onClick={() => copyAnswer(res.id, res.answer)}
                  className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Copy answer"
                >
                  {copiedId === res.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Answer Body */}
            <div className="py-4 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-3 whitespace-pre-line">
              <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-indigo-700 flex items-center mb-1">
                <ShieldCheck className="w-4 h-4 mr-1 text-indigo-600" />
                Verified Answer:
              </div>
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 font-normal">
                {res.answer}
              </div>
            </div>

            {/* Source Citations Section */}
            {res.sources && res.sources.length > 0 && (
              <div className="mt-2 pt-4 border-t border-slate-100">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                  📚 Sources Supporting This Answer:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {res.sources.map((src, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                            {src.source}
                          </span>
                          <span className="text-[10px] text-slate-400">Source #{sIdx + 1}</span>
                        </div>
                        <p className="font-semibold text-slate-800 line-clamp-2">{src.title}</p>
                      </div>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center mt-2 text-[11px]"
                      >
                        Visit Article <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Retrieved Chunks Vector Inspector Accordion */}
            {res.retrievedChunks && res.retrievedChunks.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => toggleChunks(res.id)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 py-1 cursor-pointer"
                >
                  <span className="flex items-center">
                    <Layers className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                    Inspect Retrieved Vector Chunks ({res.retrievedChunks.length} passages matched)
                  </span>
                  {areChunksOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {areChunksOpen && (
                  <div className="mt-3 space-y-2.5">
                    {res.retrievedChunks.map((rc, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5 font-mono text-[11px]">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-700">Chunk #{cIdx + 1}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-blue-700 font-semibold">{rc.chunk.source}</span>
                            <span className="text-slate-500 font-sans text-[11px] truncate max-w-[200px]">
                              ({rc.chunk.articleTitle})
                            </span>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                            Similarity: {(rc.score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-slate-700 font-sans text-xs leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                          {rc.chunk.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};
