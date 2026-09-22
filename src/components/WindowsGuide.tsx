import React, { useState } from "react";
import { Terminal, Copy, Check, Download, ExternalLink, AlertTriangle, Play } from "lucide-react";

interface WindowsGuideProps {
  onDownloadZip: () => void;
}

export const WindowsGuide: React.FC<WindowsGuideProps> = ({ onDownloadZip }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const STEPS = [
    {
      step: "1",
      title: "Download and Extract the ZIP Project",
      content:
        "Click the 'Download ZIP' button below or at the top of this page. Extract the downloaded `news-research-tool.zip` file into a folder on your computer (e.g. `C:\\Users\\YourName\\news-research-tool`).",
      button: (
        <button
          onClick={onDownloadZip}
          className="inline-flex items-center px-4 py-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Download news-research-tool.zip
        </button>
      ),
    },
    {
      step: "2",
      title: "Open Command Prompt (Windows)",
      content: "Press Win + R, type cmd, and hit Enter. Navigate to the extracted folder:",
      code: "cd C:\\path\\to\\news-research-tool",
    },
    {
      step: "3",
      title: "Create and Activate Virtual Environment",
      content: "Create an isolated Python environment to install dependencies safely without conflicts:",
      code: "python -m venv venv\nvenv\\Scripts\\activate",
    },
    {
      step: "4",
      title: "Install Dependencies",
      content: "Install Streamlit, BeautifulSoup4, SentenceTransformers, FAISS, and requests:",
      code: "pip install -r requirements.txt",
    },
    {
      step: "5",
      title: "Install Ollama and Download Llama 3.2",
      content: (
        <span>
          Download Ollama from{" "}
          <a
            href="https://ollama.com/download"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline font-semibold"
          >
            ollama.com/download
          </a>
          . Install and run it, then in your command prompt execute:
        </span>
      ),
      code: "ollama pull llama3.2",
    },
    {
      step: "6",
      title: "Launch the Streamlit Web App",
      content: "Start the local application. Your web browser will immediately open to http://localhost:8501:",
      code: "streamlit run app.py",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mt-6">
      <div className="mb-6">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2">
          <Terminal className="w-3.5 h-3.5 mr-1" />
          Tested on Windows 10 & 11
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Windows Beginner Setup Guide
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Follow these 6 simple steps to run the complete Streamlit + Ollama RAG application locally on your Windows machine with zero paid APIs.
        </p>
      </div>

      <div className="space-y-6">
        {STEPS.map((s) => (
          <div key={s.step} className="bg-slate-50 rounded-xl border border-slate-200/80 p-5">
            <div className="flex items-center space-x-3 mb-2">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {s.step}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">{s.title}</h3>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 pl-10 mb-3">{s.content}</div>

            {s.button && <div className="pl-10 mb-2">{s.button}</div>}

            {s.code && (
              <div className="pl-10">
                <div className="relative bg-slate-950 rounded-xl p-3.5 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                  <pre className="whitespace-pre">{s.code}</pre>
                  <button
                    onClick={() => copyToClipboard(s.code!)}
                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-[11px] font-sans flex items-center transition-colors cursor-pointer"
                  >
                    {copiedCmd === s.code ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Windows Tip: 'python' vs 'py'</h4>
          <p className="mt-1 text-amber-800 leading-relaxed">
            If typing <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-xs">python</code> opens the Windows Microsoft Store, type <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-xs">py -m venv venv</code> instead, or check 'Add python.exe to PATH' when running the official Python installer.
          </p>
        </div>
      </div>
    </div>
  );
};
