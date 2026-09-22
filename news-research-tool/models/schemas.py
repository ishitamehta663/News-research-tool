from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class Article:
    """Represents an extracted news article."""
    article_id: str
    url: str
    title: str
    source: str
    content: str
    word_count: int = 0
    published_date: Optional[str] = None

@dataclass
class ArticleChunk:
    """Represents a chunk of text with traceable metadata for source citation."""
    chunk_id: str
    article_id: str
    article_title: str
    article_url: str
    source: str
    content: str
    chunk_index: int

@dataclass
class RetrievedChunk:
    """Represents a retrieved chunk with its vector similarity score."""
    chunk: ArticleChunk
    score: float

@dataclass
class SourceReference:
    """Represents a clean source reference for citation in the answer."""
    article_id: str
    title: str
    source: str
    url: str

@dataclass
class ResearchResult:
    """Represents the final answer produced by the RAG pipeline."""
    question: str
    answer: str
    sources: List[SourceReference] = field(default_factory=list)
    retrieved_chunks: List[RetrievedChunk] = field(default_factory=list)
    model_used: str = "llama3.2"
    has_sufficient_context: bool = True
