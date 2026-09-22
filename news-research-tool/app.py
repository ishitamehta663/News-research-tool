"""
📈 News Research Tool
Streamlit Web Application - Pixel Matched UI
"""

import sys
import os
import streamlit as st

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from config.config import Config
from models.schemas import Article, ResearchResult
from services.news_research import NewsResearchPipeline

st.set_page_config(
    page_title="News Research Tool",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS to match the web application styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap');

    html, body, [class*="css"], .stMarkdown {
        font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, sans-serif !important;
        color: #31333F !important;
    }

    .block-container {
        padding-top: 1rem !important;
        padding-bottom: 2.5rem !important;
        max-width: 900px !important;
    }

    .main-title {
        font-size: 2.35rem !important;
        font-weight: 700 !important;
        color: #31333F !important;
        letter-spacing: -0.02em;
        margin-top: 0 !important;
        margin-bottom: 1.8rem !important;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    div[data-testid="stTextInput"] > div > div > input {
        background-color: #f0f2f6 !important;
        border: 1px solid transparent !important;
        border-radius: 6px !important;
        color: #31333F !important;
        font-size: 1rem !important;
        padding: 0.65rem 0.9rem !important;
    }
    div[data-testid="stTextInput"] > div > div > input:focus {
        border-color: #ff4b4b !important;
        background-color: #ffffff !important;
        box-shadow: 0 0 0 1px #ff4b4b !important;
    }

    [data-testid="stSidebar"] {
        background-color: #f0f2f6 !important;
        border-right: 1px solid #dcdfe4 !important;
    }
    [data-testid="stSidebar"] h1, [data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3 {
        color: #31333F !important;
        font-weight: 700 !important;
        font-size: 1.35rem !important;
    }
    [data-testid="stSidebar"] .stTextInput input {
        background-color: #ffffff !important;
        border: 1px solid #dcdfe4 !important;
        border-radius: 6px !important;
        color: #31333F !important;
    }

    [data-testid="stSidebar"] div.stButton > button {
        background-color: #ffffff !important;
        color: #31333F !important;
        border: 1px solid #d6d9dc !important;
        border-radius: 6px !important;
        font-weight: 500 !important;
        padding: 0.45rem 1rem !important;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04) !important;
    }
    [data-testid="stSidebar"] div.stButton > button:hover {
        border-color: #ff4b4b !important;
        color: #ff4b4b !important;
    }

    .answer-heading {
        font-size: 1.35rem;
        font-weight: 700;
        color: #31333F;
        margin-top: 1.8rem;
        margin-bottom: 0.75rem;
    }
    .answer-body {
        font-size: 1rem;
        line-height: 1.6;
        color: #31333F;
        margin-bottom: 1.5rem;
    }
    .sources-heading {
        font-size: 1.15rem;
        font-weight: 700;
        color: #31333F;
        margin-top: 1.2rem;
        margin-bottom: 0.6rem;
    }
    .source-item {
        font-size: 0.92rem;
        color: #31333F;
        margin-bottom: 0.4rem;
    }
    .source-link {
        color: #2563eb !important;
        text-decoration: none;
        font-weight: 500;
    }
    .source-link:hover {
        text-decoration: underline;
    }

    .chunk-badge {
        background: #eff6ff;
        color: #1d4ed8;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-family: monospace;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

def set_sample_ai():
    st.session_state["url_1"] = "https://techcrunch.com/2024/07/23/meta-releases-llama-3-1-open-source-ai-model/"
    st.session_state["url_2"] = "https://www.theverge.com/2024/5/13/24155493/openai-gpt-4o-flagship-multimodal-ai-model-free"
    st.session_state["url_3"] = "https://arstechnica.com/information-technology/2024/06/apple-intelligence-ai-features/"

def set_sample_climate():
    st.session_state["url_1"] = "https://www.nature.com/articles/d41586-024-00123-x"
    st.session_state["url_2"] = "https://www.bbc.com/news/science-environment-58130705"
    st.session_state["url_3"] = "https://www.reuters.com/business/environment/renewable-energy-growth-record-2023-2024-01-11/"

def clear_all_urls():
    st.session_state["url_1"] = ""
    st.session_state["url_2"] = ""
    st.session_state["url_3"] = ""

if "pipeline" not in st.session_state:
    st.session_state.pipeline = NewsResearchPipeline()

if "articles_processed" not in st.session_state:
    st.session_state.articles_processed = False

for key in ["url_1", "url_2", "url_3"]:
    if key not in st.session_state:
        st.session_state[key] = ""

st.sidebar.markdown("## News Article URLs")

urls = []
for i in range(3):
    url = st.sidebar.text_input(
        f"URL {i+1}",
        key=f"url_{i+1}",
        placeholder="https://..."
    )
    urls.append(url)

process_url_clicked = st.sidebar.button("Process URLs")

with st.sidebar.expander("💡 Load Sample URLs", expanded=False):
    st.button("AI News (Meta, OpenAI, Apple)", on_click=set_sample_ai)
    st.button("Climate & Energy", on_click=set_sample_climate)
    st.button("Clear All", on_click=clear_all_urls)

with st.sidebar.expander("⚙️ Model Settings", expanded=False):
    ollama_model = st.selectbox(
        "Local LLM Model",
        options=["llama3.2", "llama3", "mistral", "phi3", "gemma2"],
        index=0
    )
    st.session_state.pipeline.llm_service.model = ollama_model
    top_k = st.slider("Top Chunks to Retrieve", 1, 6, 4)

st.markdown('<h1 class="main-title">News Research Tool 📈</h1>', unsafe_allow_html=True)

query = st.text_input(
    "Question:",
    key="main_question_input",
    placeholder=""
)

status_placeholder = st.sidebar.empty()

if process_url_clicked:
    valid_urls = [u.strip() for u in urls if u and u.strip()]
    if not valid_urls:
        status_placeholder.error("Please enter at least one URL.")
    else:
        progress_bar = st.sidebar.progress(0)
        
        def update_progress(msg: str, pct: int):
            status_placeholder.info(f"⏳ {msg}")
            progress_bar.progress(pct)

        try:
            with st.spinner("Processing articles..."):
                res = st.session_state.pipeline.process_articles(
                    valid_urls,
                    progress_callback=update_progress
                )
            progress_bar.progress(100)
            status_placeholder.success(f"✅ Successfully processed {len(res['articles'])} articles!")
            st.session_state.articles_processed = True
        except Exception as e:
            status_placeholder.error(f"Error processing URLs: {str(e)}")

if query:
    if not st.session_state.articles_processed:
        st.warning("⚠️ Please process news article URLs using the sidebar first.")
    else:
        with st.spinner("Searching vector index and analyzing with LLM..."):
            try:
                result = st.session_state.pipeline.ask(query, top_k=4)
                
                st.markdown('<div class="answer-heading">Answer</div>', unsafe_allow_html=True)
                st.markdown(f'<div class="answer-body">{result.answer}</div>', unsafe_allow_html=True)

                if result.sources:
                    st.markdown('<div class="sources-heading">Sources:</div>', unsafe_allow_html=True)
                    for src in result.sources:
                        st.markdown(
                            f'<div class="source-item">• <a class="source-link" href="{src.url}" target="_blank">{src.title}</a> ({src.source})</div>',
                            unsafe_allow_html=True
                        )

                with st.expander("🔍 View Retrieved Context Chunks", expanded=False):
                    for idx, chunk_score in enumerate(result.retrieved_chunks):
                        c = chunk_score.chunk
                        st.markdown(
                            f"**Chunk #{idx+1}** <span class=\"chunk-badge\">Cosine Score: {chunk_score.score:.2f}</span> from *{c.article_title}*",
                            unsafe_allow_html=True
                        )
                        st.info(f'"{c.content}"')
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")