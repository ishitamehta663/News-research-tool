import React, { useState, useRef, useEffect } from "react";
import { Download, Terminal, Code2, Layers, RefreshCw, MoreVertical, Menu } from "lucide-react";

interface StreamlitHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onDownloadZip: () => void;
  onOpenGuide: () => void;
  onOpenCode: () => void;
  onOpenArch: () => void;
  onReset: () => void;
}

export const StreamlitHeader: React.FC<StreamlitHeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onDownloadZip,
  onOpenGuide,
  onOpenCode,
  onOpenArch,
  onReset,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-12 w-full flex items-center justify-between px-4 bg-white border-b border-transparent relative z-30 select-none">
      {/* Left side: Show toggle if sidebar is collapsed */}
      <div className="flex items-center">
        {!isSidebarOpen && (
          <button
            id="open-sidebar-btn"
            onClick={onToggleSidebar}
            className="p-1.5 rounded text-[#31333F] hover:bg-[#f0f2f6] transition-colors cursor-pointer"
            title="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right side: Deploy and 3-dots menu matching Streamlit */}
      <div className="flex items-center space-x-2 relative" ref={menuRef}>
        {/* Streamlit Deploy Button */}
        <button
          id="streamlit-deploy-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center px-3 py-1 text-sm font-medium text-[#31333F] bg-white hover:bg-[#f0f2f6] border border-[#d6d9dc] rounded-md transition-all cursor-pointer shadow-2xs"
        >
          <span className="mr-1.5 text-xs text-slate-500">☁️</span>
          Deploy
        </button>

        {/* 3-dots Menu Button */}
        <button
          id="streamlit-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded text-[#31333F] hover:bg-[#f0f2f6] transition-colors cursor-pointer"
          title="More options"
        >
          <MoreVertical className="w-5 h-5 text-slate-700" />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 top-10 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 text-sm z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Project Actions
            </div>

            <button
              onClick={() => {
                onDownloadZip();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-[#f0f2f6] text-[#31333F] flex items-center transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2.5 text-blue-600" />
              Download Python (.ZIP)
            </button>

            <button
              onClick={() => {
                onOpenGuide();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-[#f0f2f6] text-[#31333F] flex items-center transition-colors cursor-pointer"
            >
              <Terminal className="w-4 h-4 mr-2.5 text-emerald-600" />
              Windows Setup Guide
            </button>

            <button
              onClick={() => {
                onOpenCode();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-[#f0f2f6] text-[#31333F] flex items-center transition-colors cursor-pointer"
            >
              <Code2 className="w-4 h-4 mr-2.5 text-indigo-600" />
              View Python Source Code
            </button>

            <button
              onClick={() => {
                onOpenArch();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-[#f0f2f6] text-[#31333F] flex items-center transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 mr-2.5 text-purple-600" />
              RAG Architecture
            </button>

            <div className="border-t border-slate-100 my-1"></div>

            <button
              onClick={() => {
                onReset();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2.5" />
              Rerun / Reset App
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
