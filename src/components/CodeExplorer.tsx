import React, { useState, useEffect } from "react";
import { Folder, FileCode, Copy, Check, Download, ChevronRight, FileText } from "lucide-react";
import { ProjectFile } from "../types";

interface CodeExplorerProps {
  onDownloadZip: () => void;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ onDownloadZip }) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>("app.py");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/project-files")
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setFiles(data.files);
          // Default to app.py if present
          const hasApp = data.files.some((f: ProjectFile) => f.path === "app.py");
          if (hasApp) setSelectedPath("app.py");
          else if (data.files.length > 0) setSelectedPath(data.files[0].path);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load project files", err);
        setLoading(false);
      });
  }, []);

  const currentFile = files.find((f) => f.path === selectedPath);

  const handleCopy = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Group files by top-level category
  const groups: Record<string, ProjectFile[]> = {
    "Application & Config": [],
    "Services & AI Pipeline": [],
    "Data Models & Utils": [],
    "Automated Tests": [],
    Documentation: [],
  };

  files.forEach((f) => {
    if (f.path.startsWith("services/")) groups["Services & AI Pipeline"].push(f);
    else if (f.path.startsWith("models/") || f.path.startsWith("utils/")) groups["Data Models & Utils"].push(f);
    else if (f.path.startsWith("tests/")) groups["Automated Tests"].push(f);
    else if (f.name.endsWith(".md") || f.name.endsWith(".txt") || f.name.startsWith("."))
      groups["Documentation"].push(f);
    else groups["Application & Config"].push(f);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center">
            <FileCode className="w-5 h-5 mr-2 text-indigo-400" />
            Complete Python & Streamlit Project Codebase
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Browse all production files including RAG services, FAISS vector store, Ollama connector, and test suite.
          </p>
        </div>

        <button
          onClick={onDownloadZip}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Download All as .ZIP
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* File Tree Navigator */}
        <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/70 p-4 overflow-y-auto max-h-[650px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
            Project Directory
          </h3>

          {loading ? (
            <div className="p-4 text-xs text-slate-500">Loading project files...</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groups).map(([groupTitle, groupFiles]) => {
                if (groupFiles.length === 0) return null;
                return (
                  <div key={groupTitle}>
                    <div className="text-[11px] font-bold text-slate-500 uppercase px-2 py-1 flex items-center">
                      <Folder className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {groupTitle}
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {groupFiles.map((file) => {
                        const isSelected = file.path === selectedPath;
                        return (
                          <button
                            key={file.path}
                            onClick={() => setSelectedPath(file.path)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                                : "text-slate-700 hover:bg-slate-200/60"
                            }`}
                          >
                            <span className="truncate flex items-center">
                              <span className="mr-1.5 opacity-60">
                                {file.name.endsWith(".py") ? "🐍" : "📄"}
                              </span>
                              {file.path}
                            </span>
                            {isSelected && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Code Content Viewer */}
        <div className="md:col-span-8 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
          {/* Header Bar */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 font-mono text-xs text-slate-300">
              <span className="text-indigo-400 font-bold">news-research-tool/</span>
              <span>{selectedPath}</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg transition-colors cursor-pointer border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Code
                </>
              )}
            </button>
          </div>

          {/* Code Text Body */}
          <div className="p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed max-h-[600px] select-text">
            {currentFile ? (
              <pre className="whitespace-pre font-mono">
                <code>{currentFile.content}</code>
              </pre>
            ) : (
              <div className="p-8 text-slate-500 text-center">Select a file on the left to inspect code.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
