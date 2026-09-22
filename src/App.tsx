import React, { useState } from "react";
import { StreamlitHeader } from "./components/StreamlitHeader";
import { StreamlitSidebar } from "./components/StreamlitSidebar";
import { StreamlitMain } from "./components/StreamlitMain";
import { ModalDialog } from "./components/ModalDialog";
import { CodeExplorer } from "./components/CodeExplorer";
import { ArchitectureView } from "./components/ArchitectureView";
import { WindowsGuide } from "./components/WindowsGuide";
import { Article, ResearchResult } from "./types";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // URLs state - default with real tech/AI articles ready for instant 1-click test
  const [urls, setUrls] = useState<[string, string, string]>([
    "https://techcrunch.com/2024/07/23/meta-releases-llama-3-1-open-source-ai-model/",
    "https://www.theverge.com/2024/5/13/24155493/openai-gpt-4o-flagship-multimodal-ai-model-free",
    "https://arstechnica.com/information-technology/2024/06/apple-intelligence-ai-features/",
  ]);

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Question & RAG Results state
  const [question, setQuestion] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [researchStep, setResearchStep] = useState("");
  const [results, setResults] = useState<ResearchResult[]>([]);

  // Modals state for advanced tools
  const [activeModal, setActiveModal] = useState<"code" | "arch" | "guide" | null>(null);

  // Trigger browser download for the complete python zip package
  const handleDownloadZip = () => {
    const link = document.createElement("a");
    link.href = "/api/download-zip";
    link.setAttribute("download", "news-research-tool.zip");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process URLs (Extract, Chunk, Vectorize)
  const handleProcessUrls = async () => {
    const validUrls = urls.filter((u) => u && u.trim().length > 0);
    if (validUrls.length === 0) {
      setErrorMessage("Please enter at least 1 valid article URL.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      setLoadingStep("Extracting articles from web...");
      await new Promise((r) => setTimeout(r, 350));

      const resp = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: validUrls }),
      });

      setLoadingStep("Cleaning HTML noise & splitting text chunks...");
      await new Promise((r) => setTimeout(r, 350));

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || `Server error (status ${resp.status})`);
      }

      const data = await resp.json();

      setLoadingStep("Generating vector embeddings (all-MiniLM-L6-v2)...");
      await new Promise((r) => setTimeout(r, 350));

      setLoadingStep("Building index in FAISS vector store...");
      await new Promise((r) => setTimeout(r, 300));

      setArticles(data.articles || []);

      if (data.errors && data.errors.length > 0) {
        setErrorMessage(data.errors.join(" • "));
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to extract articles. Please check the URLs.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  // Grounded RAG Query
  const handleResearch = async () => {
    if (!question.trim()) return;

    if (articles.length === 0) {
      setErrorMessage("Please process article URLs using the sidebar first.");
      if (!isSidebarOpen) setIsSidebarOpen(true);
      return;
    }

    setIsResearching(true);

    try {
      setResearchStep("Searching relevant passages in FAISS index...");
      await new Promise((r) => setTimeout(r, 400));

      setResearchStep("Querying model with retrieved context chunks...");

      const resp = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          articles,
          topK: 4,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Failed to generate answer.");
      }

      const data = await resp.json();

      const newResult: ResearchResult = {
        id: `res_${Date.now()}`,
        question: question.trim(),
        answer: data.answer,
        sources: data.sources || [],
        retrievedChunks: data.retrievedChunks || [],
        modelUsed: data.modelUsed || "Local RAG (Ollama Llama 3.2)",
        hasSufficientContext: data.hasSufficientContext ?? true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setResults([newResult]);
    } catch (err: any) {
      setErrorMessage(`Research error: ${err.message}`);
    } finally {
      setIsResearching(false);
      setResearchStep("");
    }
  };

  // Reset state
  const handleReset = () => {
    setArticles([]);
    setResults([]);
    setQuestion("");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-white text-[#31333F] flex flex-row overflow-x-hidden antialiased">
      {/* Streamlit Sidebar */}
      <StreamlitSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        urls={urls}
        setUrls={setUrls}
        onProcessUrls={handleProcessUrls}
        isLoading={isLoading}
        loadingStep={loadingStep}
        errorMessage={errorMessage}
        articlesCount={articles.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Streamlit Top Header Bar */}
        <StreamlitHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onDownloadZip={handleDownloadZip}
          onOpenGuide={() => setActiveModal("guide")}
          onOpenCode={() => setActiveModal("code")}
          onOpenArch={() => setActiveModal("arch")}
          onReset={handleReset}
        />

        {/* Main View matching user screenshot */}
        <main className="flex-1 flex flex-col">
          <StreamlitMain
            question={question}
            setQuestion={setQuestion}
            onResearch={handleResearch}
            isResearching={isResearching}
            researchStep={researchStep}
            articles={articles}
            results={results}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        </main>
      </div>

      {/* Advanced Tools Modals */}
      <ModalDialog
        isOpen={activeModal === "guide"}
        onClose={() => setActiveModal(null)}
        title="💻 Windows Beginner Setup Guide"
      >
        <WindowsGuide onDownloadZip={handleDownloadZip} />
      </ModalDialog>

      <ModalDialog
        isOpen={activeModal === "code"}
        onClose={() => setActiveModal(null)}
        title="🐍 Standalone Python Project Source Code"
        maxWidth="max-w-5xl"
      >
        <CodeExplorer onDownloadZip={handleDownloadZip} />
      </ModalDialog>

      <ModalDialog
        isOpen={activeModal === "arch"}
        onClose={() => setActiveModal(null)}
        title="📐 RAG Pipeline Architecture & Data Flow"
      >
        <ArchitectureView />
      </ModalDialog>
    </div>
  );
}
