import os
import pickle
import numpy as np
from typing import List, Optional, Tuple
from config.config import Config
from models.schemas import ArticleChunk, RetrievedChunk

class VectorStoreError(Exception):
    """Exception raised for vector database operations."""
    pass

class VectorStore:
    """
    Manages vector embeddings and metadata using FAISS (IndexFlatIP for cosine similarity).
    Includes an integrated fallback to NumPy vectorized cosine similarity for environments
    where FAISS binary compilation is unavailable.
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.chunks: List[ArticleChunk] = []
        self.embeddings: Optional[np.ndarray] = None
        self._faiss_index = None
        self._use_faiss = True

        self._init_index()

    def _init_index(self):
        """Attempt to initialize FAISS IndexFlatIP."""
        try:
            import faiss
            # IndexFlatIP with normalized vectors calculates Cosine Similarity directly
            self._faiss_index = faiss.IndexFlatIP(self.dimension)
            self._use_faiss = True
        except ImportError:
            # FAISS not installed; fallback to NumPy cosine similarity
            self._faiss_index = None
            self._use_faiss = False

    def add_chunks(self, chunks: List[ArticleChunk], embeddings: np.ndarray):
        """
        Add article chunks and their corresponding embeddings to the vector store.
        """
        if not chunks or embeddings is None or len(embeddings) == 0:
            return

        if len(chunks) != len(embeddings):
            raise VectorStoreError(
                f"Mismatch: Received {len(chunks)} chunks but {len(embeddings)} embeddings."
            )

        # Store metadata
        self.chunks.extend(chunks)

        # Update embedding matrix
        if self.embeddings is None or len(self.embeddings) == 0:
            self.embeddings = embeddings.astype(np.float32)
        else:
            self.embeddings = np.vstack([self.embeddings, embeddings.astype(np.float32)])

        # Update FAISS index if available
        if self._use_faiss and self._faiss_index is not None:
            self._faiss_index.add(embeddings.astype(np.float32))

    def search(self, query_embedding: np.ndarray, top_k: int = Config.TOP_K_RESULTS) -> List[RetrievedChunk]:
        """
        Search for the most semantically relevant chunks for the given query vector.
        
        Args:
            query_embedding: Shape (1, dimension)
            top_k: Maximum number of chunks to return.
            
        Returns:
            List[RetrievedChunk]: Ranked list of chunks with similarity scores (0.0 to 1.0).
        """
        if not self.chunks or self.embeddings is None or len(self.embeddings) == 0:
            return []

        actual_k = min(top_k, len(self.chunks))

        if self._use_faiss and self._faiss_index is not None:
            # FAISS search
            scores, indices = self._faiss_index.search(query_embedding.astype(np.float32), actual_k)
            retrieved: List[RetrievedChunk] = []
            for score, idx in zip(scores[0], indices[0]):
                if idx != -1 and idx < len(self.chunks):
                    # Clamp cosine similarity to 0.0 - 1.0 range
                    sim_score = max(0.0, min(1.0, float(score)))
                    retrieved.append(RetrievedChunk(chunk=self.chunks[idx], score=sim_score))
            return retrieved
        else:
            # Pure NumPy cosine similarity fallback
            # query_embedding shape (1, D), self.embeddings shape (N, D)
            similarities = np.dot(self.embeddings, query_embedding.T).flatten()
            top_indices = np.argsort(similarities)[::-1][:actual_k]

            retrieved = []
            for idx in top_indices:
                sim_score = max(0.0, min(1.0, float(similarities[idx])))
                retrieved.append(RetrievedChunk(chunk=self.chunks[idx], score=sim_score))
            return retrieved

    def clear(self):
        """Reset the vector database and clear all stored chunks."""
        self.chunks = []
        self.embeddings = None
        self._init_index()

    def count(self) -> int:
        """Return the number of chunks currently indexed."""
        return len(self.chunks)

    def save(self, directory: str = Config.VECTOR_STORE_DIR):
        """Save the vector index and metadata to disk."""
        os.makedirs(directory, exist_ok=True)
        meta_path = os.path.join(directory, "chunks.pkl")
        with open(meta_path, "wb") as f:
            pickle.dump(self.chunks, f)

        if self._use_faiss and self._faiss_index is not None:
            import faiss
            index_path = os.path.join(directory, "index.faiss")
            faiss.write_index(self._faiss_index, index_path)
        elif self.embeddings is not None:
            emb_path = os.path.join(directory, "embeddings.npy")
            np.save(emb_path, self.embeddings)

    def load(self, directory: str = Config.VECTOR_STORE_DIR) -> bool:
        """Load vector index and metadata from disk if available."""
        meta_path = os.path.join(directory, "chunks.pkl")
        if not os.path.exists(meta_path):
            return False

        with open(meta_path, "rb") as f:
            self.chunks = pickle.load(f)

        index_path = os.path.join(directory, "index.faiss")
        if self._use_faiss and os.path.exists(index_path):
            import faiss
            self._faiss_index = faiss.read_index(index_path)
            return True

        emb_path = os.path.join(directory, "embeddings.npy")
        if os.path.exists(emb_path):
            self.embeddings = np.load(emb_path)
            return True

        return False
