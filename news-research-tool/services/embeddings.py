import logging
import re
import math
import numpy as np
from typing import List, Optional
from config.config import Config

logger = logging.getLogger(__name__)

class EmbeddingService:
    """
    Service for generating vector embeddings locally.
    Primary engine: SentenceTransformers (all-MiniLM-L6-v2)
    Fallback engine: Built-in normalized Term Frequency / Semantic Vectorizer
    (ensures zero crash on Python 3.13 or environments without PyTorch/C compilers).
    """

    def __init__(self, model_name: str = Config.EMBEDDING_MODEL_NAME):
        self.model_name = model_name
        self._model = None
        self._use_fallback = False

    def _get_model(self):
        """Lazy load the sentence-transformer model on first demand."""
        if self._model is None and not self._use_fallback:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading local embedding model: {self.model_name}")
                self._model = SentenceTransformer(self.model_name)
            except Exception as e:
                logger.warning(
                    f"SentenceTransformers not available ({str(e)}). "
                    "Using high-performance local vectorizer fallback."
                )
                self._use_fallback = True
        return self._model

    def _fallback_vectorize(self, text: str, vocab_size: int = 384) -> np.ndarray:
        """
        Fast, zero-dependency feature hashing vectorizer with L2 normalization.
        Produces a 384-dimensional normalized vector compatible with cosine similarity.
        """
        vec = np.zeros(vocab_size, dtype=np.float32)
        words = re.findall(r"\b\w{2,}\b", text.lower())
        if not words:
            return vec

        for word in words:
            # Deterministic hash bucket
            h = hash(word) % vocab_size
            vec[h] += 1.0

        # L2 normalization
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """
        Generate normalized embeddings for a list of article chunks.
        """
        if not texts:
            return np.empty((0, 384), dtype=np.float32)

        model = self._get_model()
        if model is not None and not self._use_fallback:
            try:
                embeddings = model.encode(
                    texts,
                    show_progress_bar=False,
                    convert_to_numpy=True,
                    normalize_embeddings=True
                )
                return embeddings.astype(np.float32)
            except Exception as e:
                logger.warning(f"Error during transformer encoding: {e}. Falling back.")
                self._use_fallback = True

        # Fallback vectorization
        vectors = [self._fallback_vectorize(t, vocab_size=384) for t in texts]
        return np.array(vectors, dtype=np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        """
        Generate normalized embedding vector for a user's search query.
        """
        if not query or not query.strip():
            raise ValueError("Query string cannot be empty.")

        model = self._get_model()
        if model is not None and not self._use_fallback:
            try:
                embedding = model.encode(
                    [query.strip()],
                    show_progress_bar=False,
                    convert_to_numpy=True,
                    normalize_embeddings=True
                )
                return embedding.astype(np.float32)
            except Exception as e:
                logger.warning(f"Error during transformer query encoding: {e}. Falling back.")
                self._use_fallback = True

        vec = self._fallback_vectorize(query.strip(), vocab_size=384)
        return np.array([vec], dtype=np.float32)
