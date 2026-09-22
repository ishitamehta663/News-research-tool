import React from "react";
import { ArrowDown, CheckCircle2, ShieldCheck, Database, Cpu, FileText, Search } from "lucide-react";

export const ArchitectureView: React.FC = () => {
  const PIPELINE_STEPS = [
    {
      num: "01",
      title: "Article Extraction",
      tech: "Requests + BeautifulSoup4",
      desc: "Fetches live webpage HTML from 1–3 URLs. Strips advertising banners, navigation headers, footers, scripts, and cookie popups. Extracts clean headline, source domain, and body text.",
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      tag: "Scraping & Cleaning",
    },
    {
      num: "02",
      title: "Semantic Chunking",
      tech: "Recursive Character Splitter",
      desc: "Segments long article text into manageable chunks (~600 chars with 100 char overlap) along natural punctuation boundaries. Preserves metadata: article_id, title, url, source, and chunk_id.",
      icon: <Database className="w-5 h-5 text-indigo-600" />,
      tag: "Preprocessing & Provenance",
    },
    {
      num: "03",
      title: "Local Vector Embeddings",
      tech: "sentence-transformers/all-MiniLM-L6-v2",
      desc: "Transforms each chunk into a 384-dimensional dense semantic vector. Runs 100% locally on CPU/GPU without calling any paid embedding API.",
      icon: <Cpu className="w-5 h-5 text-purple-600" />,
      tag: "Zero-Cost Vectors",
    },
    {
      num: "04",
      title: "FAISS Vector Store",
      tech: "FAISS (IndexFlatIP) + NumPy Fallback",
      desc: "Indexes chunk vectors for rapid inner product cosine similarity search. When a user asks a question, converts the query to a vector and retrieves the Top-K most relevant chunks.",
      icon: <Search className="w-5 h-5 text-emerald-600" />,
      tag: "Fast Similarity Index",
    },
    {
      num: "05",
      title: "Grounded LLM Reasoning",
      tech: "Ollama (Llama 3.2 / Mistral)",
      desc: "Injects the retrieved text chunks into a constrained system prompt instructing the model to answer using ONLY the provided facts and cite sources. Prevents hallucinations when info is missing.",
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
      tag: "Anti-Hallucination Inference",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mt-6">
      <div className="max-w-3xl mb-8">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Cpu className="w-6 h-6 mr-2 text-indigo-600" />
          RAG (Retrieval-Augmented Generation) Architecture
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          The diagram below illustrates the exact end-to-end flow of data in this application—from the moment you enter news URLs to the final LLM response with verifiable citations.
        </p>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8 pb-4">
        {PIPELINE_STEPS.map((step, idx) => (
          <div key={idx} className="relative group">
            {/* Step marker */}
            <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-xs font-bold text-indigo-600 shadow-xs">
              {step.num}
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-5 hover:border-indigo-300 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    {step.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">{step.title}</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                  {step.tech}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200/70 text-xs sm:text-sm text-slate-700">
        <h4 className="font-bold text-slate-900 flex items-center mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
          Key Guarantee: Zero Paid APIs & Privacy Preserved
        </h4>
        <p className="text-slate-600 leading-relaxed">
          Because Sentence Transformers and Ollama run entirely locally on your CPU/GPU, your articles and queries are never sent to third-party billing providers or paid APIs. You can run unlimited analyses with zero cost.
        </p>
      </div>
    </div>
  );
};
