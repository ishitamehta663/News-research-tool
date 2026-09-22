import React from "react";
import { Search, Loader2, Sparkles, HelpCircle } from "lucide-react";

interface QuestionSectionProps {
  question: string;
  setQuestion: (q: string) => void;
  onResearch: () => void;
  isResearching: boolean;
  researchStep: string;
  hasArticles: boolean;
}

export const QuestionSection: React.FC<QuestionSectionProps> = ({
  question,
  setQuestion,
  onResearch,
  isResearching,
  researchStep,
  hasArticles,
}) => {
  const EXAMPLE_QUESTIONS = [
    "What are the main points discussed in these articles?",
    "What are the key findings?",
    "How are the articles related?",
    "What differences exist between the articles?",
    "What are the different perspectives presented?",
    "What evidence is provided?",
    "What are the major conclusions?",
    "Which article discusses this issue?",
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onResearch();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mr-2">
              2
            </span>
            🤔 Ask a question about these articles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            The RAG pipeline retrieves the most semantically relevant text passages and generates a factually grounded answer.
          </p>
        </div>

        {!hasArticles && (
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            ⚠️ Load articles above first
          </span>
        )}
      </div>

      {/* Quick Example Question Chips */}
      <div className="my-4">
        <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center">
          <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Quick Example Questions (Click to select):
        </label>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setQuestion(q)}
              disabled={isResearching}
              className="text-xs bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors text-left cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Box */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="relative flex-1">
          <input
            id="question-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. What are the main points discussed in these articles?"
            className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-all text-slate-900"
            disabled={isResearching}
          />
        </div>

        <button
          id="research-submit-btn"
          onClick={onResearch}
          disabled={isResearching || !hasArticles || !question.trim()}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer shrink-0"
        >
          {isResearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Reasoning...
            </>
          ) : (
            <>
              <span className="mr-2">🔍</span>
              Research
            </>
          )}
        </button>
      </div>

      {/* Progress feedback */}
      {isResearching && (
        <div className="mt-4 flex items-center space-x-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
          <span>{researchStep || "Synthesizing answer..."}</span>
        </div>
      )}
    </div>
  );
};
