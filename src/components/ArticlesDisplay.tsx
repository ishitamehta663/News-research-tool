import React, { useState } from "react";
import { ExternalLink, FileText, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Article } from "../types";

interface ArticlesDisplayProps {
  articles: Article[];
}

export const ArticlesDisplay: React.FC<ArticlesDisplayProps> = ({ articles }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (articles.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
          Indexed Articles ({articles.length})
        </h3>
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Ready for Semantic Search
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((article, index) => {
          const isExpanded = expandedId === article.id;
          return (
            <div
              key={article.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded border border-blue-100">
                    {article.source}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Article {index + 1}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2">
                  {article.title}
                </h4>

                <p className="text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-slate-700">{article.wordCount}</span> words • Cleaned
                  and split into vector passages
                </p>

                {isExpanded && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/60 max-h-48 overflow-y-auto mb-3 whitespace-pre-line leading-relaxed">
                    {article.content}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : article.id)}
                  className="text-slate-600 hover:text-slate-900 font-medium flex items-center cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      Hide Text <ChevronUp className="w-3.5 h-3.5 ml-1" />
                    </>
                  ) : (
                    <>
                      Read Extract <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  Source <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
