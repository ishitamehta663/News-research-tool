import React from "react";
import { Download, Terminal, Layers, Code2, Sparkles, BookOpen } from "lucide-react";

interface HeaderProps {
  activeTab: "app" | "code" | "arch" | "guide";
  setActiveTab: (tab: "app" | "code" | "arch" | "guide") => void;
  onDownloadZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onDownloadZip }) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              <span className="text-xl">📰</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  LLM News Research Assistant
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                  100% Free / Local RAG
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">
                Analyze multiple news articles and ask questions using AI-powered semantic search and LLM reasoning.
              </p>
            </div>
          </div>

          {/* Action & Nav Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs sm:text-sm">
              <button
                onClick={() => setActiveTab("app")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === "app"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Live RAG Tool
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === "code"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Code2 className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                Python Source Code
              </button>
              <button
                onClick={() => setActiveTab("arch")}
                className={`flex items-center px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === "arch"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5 mr-1 text-blue-600" />
                RAG Pipeline
              </button>
              <button
                onClick={() => setActiveTab("guide")}
                className={`flex items-center px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === "guide"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Windows Setup
              </button>
            </nav>

            <button
              id="download-zip-btn"
              onClick={onDownloadZip}
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
              title="Download standalone Python + Streamlit project (.ZIP)"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download ZIP
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
