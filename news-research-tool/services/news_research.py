import logging
from typing import List, Dict, Any, Optional
from config.config import Config
from models.schemas import Article, ArticleChunk, RetrievedChunk, SourceReference, ResearchResult
from services.article_extractor import ArticleExtractor, ArticleExtractionError
from services.text_processor import TextProcessor
from services.embeddings import EmbeddingService
from services.vector_store import VectorStore
from services.llm_service import LLMService, LLMServiceError
from utils.helpers import is_valid_url, clean_url

logger = logging.getLogger(__name__)

class NewsResearchPipeline:
    """
    End-to-end RAG orchestrator for the News Research Tool.
    Coordinates extraction, text splitting, vector indexing, similarity retrieval,
    and LLM grounded answer generation.
    """

    def __init__(
        self,
        extractor: Optional[ArticleExtractor] = None,
        processor: Optional[TextProcessor] = None,
        embedding_service: Optional[EmbeddingService] = None,
        vector_store: Optional[VectorStore] = None,
        llm_service: Optional[LLMService] = None
    ):
        self.extractor = extractor or ArticleExtractor()
        self.processor = processor or TextProcessor()
        self.embedding_service = embedding_service or EmbeddingService()
        self.vector_store = vector_store or VectorStore()
        self.llm_service = llm_service or LLMService()

        self.articles: List[Article] = []
        self.chunks: List[ArticleChunk] = []

    def process_articles(self, urls: List[str], progress_callback=None) -> Dict[str, Any]:
        """
        Extract, clean, chunk, embed, and index 1-3 news articles.
        
        Args:
            urls: List of web URLs.
            progress_callback: Optional callable for Streamlit progress updates e.g. cb(step_text, percentage)
        """
        def update_progress(msg: str, pct: int):
            if progress_callback:
                progress_callback(msg, pct)

        # 1. Validate URLs
        valid_urls = [clean_url(u) for u in urls if is_valid_url(u)]
        if not valid_urls:
            raise ValueError("No valid HTTP/HTTPS URLs provided. Please enter at least 1 valid news article URL.")

        # Remove duplicates while preserving order
        unique_urls = list(dict.fromkeys(valid_urls))[:3]

        # Reset existing store
        self.clear()

        # 2. Extract Articles
        extracted_articles: List[Article] = []
        extraction_errors: List[str] = []

        update_progress("Extracting articles from URLs...", 20)
        for idx, url in enumerate(unique_urls, start=1):
            try:
                article = self.extractor.extract(url, article_id=f"art_{idx}")
                extracted_articles.append(article)
            except ArticleExtractionError as e:
                extraction_errors.append(str(e))
            except Exception as e:
                extraction_errors.append(f"Unexpected error loading {url}: {str(e)}")

        if not extracted_articles:
            error_details = "\n".join(f"• {err}" for err in extraction_errors)
            raise RuntimeError(f"Failed to extract any articles:\n{error_details}")

        self.articles = extracted_articles

        # 3. Clean and Chunk
        update_progress("Cleaning text and creating semantic chunks...", 45)
        all_chunks: List[ArticleChunk] = []
        for article in extracted_articles:
            chunks = self.processor.split_article(article)
            all_chunks.extend(chunks)

        if not all_chunks:
            raise RuntimeError("Articles contained no usable text paragraphs to build vector embeddings.")

        self.chunks = all_chunks

        # 4. Generate Embeddings
        update_progress("Generating local vector embeddings (all-MiniLM-L6-v2)...", 70)
        chunk_texts = [c.content for c in all_chunks]
        embeddings = self.embedding_service.embed_texts(chunk_texts)

        # 5. Index into Vector Store
        update_progress("Building FAISS vector search index...", 90)
        self.vector_store.add_chunks(all_chunks, embeddings)

        update_progress("Vector index ready!", 100)

        return {
            "articles_count": len(self.articles),
            "chunks_count": len(self.chunks),
            "articles": self.articles,
            "errors": extraction_errors
        }

    def ask(self, question: str, top_k: int = Config.TOP_K_RESULTS) -> ResearchResult:
        """
        Answer a natural language question using semantic search + local LLM.
        """
        if not question or not question.strip():
            raise ValueError("Please provide a question to research.")

        if not self.articles or self.vector_store.count() == 0:
            raise RuntimeError("No articles have been loaded yet. Please enter URLs and click 'Load Articles' first.")

        # 1. Embed user query
        query_embedding = self.embedding_service.embed_query(question.strip())

        # 2. Retrieve top-k semantically relevant chunks
        retrieved = self.vector_store.search(query_embedding, top_k=top_k)

        # 3. Check for relevance threshold
        # If best similarity score is below threshold, prevent hallucination early
        max_score = retrieved[0].score if retrieved else 0.0
        if not retrieved or max_score < Config.SIMILARITY_THRESHOLD:
            # Not enough relevant context found in articles
            return ResearchResult(
                question=question,
                answer=(
                    "I could not find enough information about this question in the provided articles. "
                    "The retrieved content does not sufficiently match your question."
                ),
                sources=[],
                retrieved_chunks=retrieved,
                model_used=self.llm_service.model,
                has_sufficient_context=False
            )

        # 4. Send to LLM
        answer_text = self.llm_service.generate_answer(question=question, retrieved_chunks=retrieved)

        # 5. Collect unique source references used in retrieval
        source_map: Dict[str, SourceReference] = {}
        for item in retrieved:
            chunk = item.chunk
            if chunk.article_id not in source_map:
                source_map[chunk.article_id] = SourceReference(
                    article_id=chunk.article_id,
                    title=chunk.article_title,
                    source=chunk.source,
                    url=chunk.article_url
                )

        sources = list(source_map.values())

        return ResearchResult(
            question=question,
            answer=answer_text,
            sources=sources,
            retrieved_chunks=retrieved,
            model_used=self.llm_service.model,
            has_sufficient_context=True
        )

    # Alias for flexibility
    research_question = ask

    def clear(self):
        """Clear loaded articles, chunks, and vector store."""
        self.articles = []
        self.chunks = []
        self.vector_store.clear()
