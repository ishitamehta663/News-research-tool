# 📰 LLM News Research Assistant

A complete, beginner-friendly **Retrieval-Augmented Generation (RAG)** application to analyze multiple news articles and answer questions with grounded source citations using **100% free, local AI tools** (Ollama + Sentence Transformers + FAISS + Streamlit).

> 💰 **Zero Paid API Keys Required:** This application runs entirely on your local machine using open-source models via Ollama. No OpenAI API key or paid subscription is needed.

---

## 📑 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Architecture & Workflow](#3-architecture--workflow)
4. [Technologies Used](#4-technologies-used)
5. [Prerequisites & Requirements](#5-prerequisites--requirements)
6. [Step-by-Step Installation (Windows & Mac/Linux)](#6-step-by-step-installation)
7. [Ollama Installation & Model Setup](#7-ollama-installation--model-setup)
8. [Running the Application](#8-running-the-application)
9. [How to Use the Application](#9-how-to-use-the-application)
10. [Project Directory Structure](#10-project-directory-structure)
11. [RAG Pipeline Deep Dive](#11-rag-pipeline-deep-dive)
12. [Running Automated Tests](#12-running-automated-tests)
13. [How to Change or Upgrade the LLM](#13-how-to-change-or-upgrade-the-llm)
14. [Troubleshooting & Common Errors](#14-troubleshooting--common-errors)
15. [Deployment Options](#15-deployment-options)

---

## 1. Project Overview

The **LLM News Research Assistant** allows journalists, researchers, students, and curious readers to enter up to **3 news article URLs**, extract their text, split them into semantic chunks, index them in a local vector database, and ask natural language questions.

Unlike simple search engines or keyword finders, this tool performs **true semantic similarity retrieval** and synthesizes comprehensive answers using a local Large Language Model while citing the exact source article for every claim.

---

## 2. Key Features

- 📥 **Multi-Article Extraction:** Automatically fetches and cleans article text from 1 to 3 live URLs.
- 🧹 **Intelligent Preprocessing:** Strips ads, navigation menus, cookie notices, and HTML boilerplate.
- 🧩 **Semantic Chunking:** Splits articles into overlapping passages while attaching traceability metadata (`article_id`, `title`, `source`, `url`).
- ⚡ **Local Embeddings:** Generates vector embeddings locally with `sentence-transformers/all-MiniLM-L6-v2`.
- 🔍 **FAISS Vector Search:** Rapidly retrieves the most relevant passages based on cosine similarity.
- 🦙 **Local LLM Reasoning (Ollama):** Synthesizes grounded answers using lightweight local models like `llama3.2` or `mistral`.
- 🛡️ **Anti-Hallucination Guardrails:** Explicitly tells you when information is missing from the articles rather than inventing facts.
- 📚 **Verifiable Citations:** Displays publisher name, headline, and link for all articles used in the answer.
- 🔄 **Multi-Turn Research:** Ask unlimited questions about the loaded articles without re-downloading them.

---

## 3. Architecture & Workflow

```text
User enters 1–3 article URLs
              │
              ▼
   [ Article Extraction ]       (Requests + BeautifulSoup4)
              │
              ▼
    [ Text Preprocessing ]      (Whitespace normalization, strip boilerplate)
              │
              ▼
     [ Semantic Chunking ]      (Chunk size: 600, overlap: 100 + metadata)
              │
              ▼
     [ Local Embeddings ]       (sentence-transformers/all-MiniLM-L6-v2)
              │
              ▼
    [ FAISS Vector Store ]      (Cosine similarity index with metadata)
              │
              ▼
      User Question
              │
              ▼
   [ Similarity Search ]        (Top-K retrieval of relevant passages)
              │
              ▼
     [ Prompt Synthesis ]       (Strict factual grounding template)
              │
              ▼
      [ Local Ollama LLM ]      (llama3.2 / mistral)
              │
              ▼
 Grounded Answer + Source Links
```

---

## 4. Technologies Used

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | [Streamlit](https://streamlit.io/) | Interactive web UI with reactive state |
| **Scraping** | [BeautifulSoup4](https://www.crummy.com/software/BeautifulSoup/) + [Requests](https://requests.readthedocs.io/) | Clean HTML body text extraction |
| **Embeddings** | [Sentence Transformers](https://www.sbert.net/) (`all-MiniLM-L6-v2`) | High-speed local vector embeddings |
| **Vector DB** | [FAISS](https://github.com/facebookresearch/faiss) | Blazing fast vector similarity search |
| **Local LLM** | [Ollama](https://ollama.com/) (`llama3.2`) | Local, private AI inference |
| **Language** | Python 3.10+ | Clean, object-oriented modular code |

---

## 5. Prerequisites & Requirements

- **Operating System:** Windows 10/11, macOS, or Linux.
- **Python:** Version **3.10, 3.11, or 3.12** installed (ensure `Add Python to PATH` was checked during installation).
- **RAM:** Minimum 8 GB RAM (16 GB recommended for running local LLMs smoothly).
- **Disk Space:** ~4 GB free disk space (for the Python packages and Ollama `llama3.2` model).

---

## 6. Step-by-Step Installation

### Step 1: Open Your Terminal / Command Prompt

- On **Windows:** Press `Win + R`, type `cmd`, and press Enter. Navigate to where you unzipped the project:
  ```cmd
  cd path\to\news-research-tool
  ```

- On **macOS / Linux:** Open Terminal and navigate to the folder:
  ```bash
  cd path/to/news-research-tool
  ```

---

### Step 2: Create a Python Virtual Environment

Creating an isolated virtual environment keeps your system Python clean.

**On Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```
*(You should now see `(venv)` at the beginning of your command line).*

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

---

### Step 3: Install Required Dependencies

Upgrade pip and install all required packages:
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## 7. Ollama Installation & Model Setup

Ollama runs the local AI model on your computer for **100% free offline inference**.

1. **Download Ollama:**
   - Go to [https://ollama.com/download](https://ollama.com/download)
   - Download the installer for Windows, Mac, or Linux.
   - Run the installer and finish setup.

2. **Download the recommended model (`llama3.2`):**
   Open a new command prompt or terminal window and run:
   ```cmd
   ollama pull llama3.2
   ```
   *Note: `llama3.2` is Meta's newest lightweight, ultra-fast model (~2.0 GB download). It runs smoothly even on standard laptops.*

3. **Verify Ollama is Running:**
   By default, Ollama starts automatically as a background tray icon. You can verify it by opening your browser to:
   `http://localhost:11434`
   *(It should display: `Ollama is running`)*

---

## 8. Running the Application

With your virtual environment activated:

```cmd
streamlit run app.py
```

Your web browser will automatically open to:
```
http://localhost:8501
```

---

## 9. How to Use the Application

1. **Enter URLs:** In the **"1. Enter News Article URLs"** section, paste 1, 2, or 3 article URLs (e.g. from BBC, Reuters, TechCrunch, The Verge).
   - *Tip:* You can also click one of the quick sample buttons in the left sidebar (e.g., "🤖 AI & Technology") to pre-fill test articles.
2. **Click `📥 Load Articles`:**
   - The app downloads each page, cleans the HTML, splits it into semantic chunks, and builds the FAISS vector index.
   - Visual cards will appear displaying the extracted headline, publisher, and word count.
3. **Ask a Question:**
   - Click one of the example question chips or type your own question into the search box.
4. **Click `🔍 Research`:**
   - The system retrieves the most relevant passages from your articles and prompts the local LLM.
   - You will see a grounded answer, bulleted evidence points, and exact source references.
   - Click **"🔍 Inspect Retrieved Vector Chunks"** to view the exact text excerpts and similarity scores used!
5. **Ask Follow-Up Questions:**
   - You can ask as many questions as you like without re-scraping the articles!

---

## 10. Project Directory Structure

```text
news-research-tool/
│
├── app.py                          # Streamlit interactive UI application
├── requirements.txt                # Python package dependencies
├── README.md                       # Comprehensive guide and documentation
├── .env.example                    # Sample environment variables
├── .gitignore                      # Git exclusion rules
│
├── config/
│   ├── __init__.py
│   └── config.py                   # Central configuration & hyperparameters
│
├── services/
│   ├── __init__.py
│   ├── article_extractor.py        # Web scraping & HTML noise stripping
│   ├── text_processor.py           # Recursive chunking & metadata preservation
│   ├── embeddings.py               # Local SentenceTransformers embedding service
│   ├── vector_store.py             # FAISS index & similarity search engine
│   ├── llm_service.py              # Ollama local LLM integration & prompt logic
│   └── news_research.py            # End-to-end RAG orchestrator pipeline
│
├── models/
│   ├── __init__.py
│   └── schemas.py                  # Dataclasses for Article, Chunk, and Results
│
├── utils/
│   ├── __init__.py
│   └── helpers.py                  # URL validation, string formatting, citations
│
├── tests/
│   ├── __init__.py
│   ├── test_article_extractor.py   # Extraction unit tests
│   ├── test_text_processor.py      # Chunking & metadata unit tests
│   └── test_vector_store.py        # Vector similarity unit tests
│
└── data/
    └── .gitkeep                    # Directory for vector cache persistence
```

---

## 11. RAG Pipeline Deep Dive

### 1. Extraction (`services/article_extractor.py`)
Uses `requests` with standard browser headers and a 12-second timeout. `BeautifulSoup4` strips scripts, stylesheets, navigation bars, ads, and footers, extracting clean paragraph text and metadata.

### 2. Chunking (`services/text_processor.py`)
Articles are split into chunks of ~600 characters with 100 characters of overlap. Each chunk carries full provenance:
```python
ArticleChunk(
    chunk_id="art_1_c0",
    article_id="art_1",
    article_title="Headline...",
    article_url="https://...",
    source="Reuters",
    content="...",
    chunk_index=0
)
```

### 3. Local Embedding (`services/embeddings.py`)
Embeds text into 384-dimensional dense vectors using `sentence-transformers/all-MiniLM-L6-v2`. Normalized cosine similarity ensures high-accuracy semantic matching.

### 4. Vector Storage (`services/vector_store.py`)
Stores vectors in FAISS `IndexFlatIP`. If FAISS is not compiled for your architecture, an automatic vectorized NumPy cosine similarity fallback takes over seamlessly.

### 5. Grounded Prompting (`services/llm_service.py`)
Sends the retrieved passages to Ollama with a strict factual constraint prompt to eliminate hallucinations:
```text
You are a News Research Assistant.
Answer the user's question using ONLY the information in the retrieved context.
Do not invent facts.
If the answer cannot be determined, clearly state that information is not available.
```

---

## 12. Running Automated Tests

To run the built-in automated test suite:

```bash
pytest tests/
```

All unit tests for URL validation, HTML extraction, recursive chunking, and vector similarity will run and verify project integrity without needing any external API or internet access.

---

## 13. How to Change or Upgrade the LLM

You can switch the local model at any time!

1. Pull another model using Ollama:
   ```cmd
   ollama pull mistral
   # or for smaller footprint:
   ollama pull phi3
   ```
2. In the Streamlit sidebar under **⚙️ Settings**, change the model dropdown to your desired model name (e.g. `mistral` or `phi3`).
3. Or set it in your `.env` file:
   ```env
   OLLAMA_MODEL="mistral"
   ```

---

## 14. Troubleshooting & Common Errors

### Q1: `Could not connect to Ollama at http://localhost:11434`
- **Cause:** The Ollama service is not running.
- **Solution:** Search for "Ollama" in your Windows Start Menu and launch it, or run `ollama serve` in a terminal window.

### Q2: `Model 'llama3.2' not found`
- **Cause:** The model has not been downloaded yet.
- **Solution:** In your command prompt, run:
  ```cmd
  ollama pull llama3.2
  ```

### Q3: `Access denied (HTTP 403) by website`
- **Cause:** Some paywalled publishers (like Bloomberg or WSJ) block automated web requests.
- **Solution:** Try open news sources such as BBC, Reuters, AP News, TechCrunch, The Verge, or Ars Technica.

### Q4: `FAISS import error on Windows`
- **Cause:** Missing MSVC C++ runtime.
- **Solution:** `pip install faiss-cpu`. If issues persist, our codebase automatically falls back to NumPy vector cosine similarity without any disruption!

---

## 15. Deployment Options

- **Local Network Sharing:** Run with `streamlit run app.py --server.address=0.0.0.0 --server.port=8501` to access from other devices on your home or office Wi-Fi.
- **Docker:** You can containerize this application with a simple `python:3.10-slim` image and link it to an Ollama container via Docker Compose.

---

## 📄 License
This project is open-source and released under the MIT License.
