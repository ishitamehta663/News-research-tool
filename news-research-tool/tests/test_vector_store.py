import numpy as np
from models.schemas import ArticleChunk
from services.vector_store import VectorStore

def test_vector_store_add_and_search():
    """Verify storing embeddings and searching by similarity returns ranked results."""
    store = VectorStore(dimension=4)

    # 3 dummy chunks
    chunks = [
        ArticleChunk("c1", "a1", "Article 1", "https://a1.com", "News1", "AI advancements", 0),
        ArticleChunk("c2", "a1", "Article 1", "https://a1.com", "News1", "Climate change policy", 1),
        ArticleChunk("c3", "a2", "Article 2", "https://a2.com", "News2", "Stock market updates", 0),
    ]

    # Create dummy normalized 4D embeddings
    emb1 = np.array([1.0, 0.0, 0.0, 0.0], dtype=np.float32)
    emb2 = np.array([0.0, 1.0, 0.0, 0.0], dtype=np.float32)
    emb3 = np.array([0.0, 0.0, 1.0, 0.0], dtype=np.float32)
    embeddings = np.vstack([emb1, emb2, emb3])

    store.add_chunks(chunks, embeddings)
    assert store.count() == 3

    # Query vector close to emb1
    query_emb = np.array([[0.95, 0.05, 0.0, 0.0]], dtype=np.float32)
    # normalize
    query_emb = query_emb / np.linalg.norm(query_emb)

    results = store.search(query_emb, top_k=2)
    assert len(results) == 2
    # First result should be chunk c1 with highest similarity
    assert results[0].chunk.chunk_id == "c1"
    assert results[0].score > 0.9

def test_vector_store_empty_search():
    """Verify empty store returns empty search results gracefully."""
    store = VectorStore(dimension=4)
    query_emb = np.array([[1.0, 0.0, 0.0, 0.0]], dtype=np.float32)
    results = store.search(query_emb, top_k=3)
    assert results == []

def test_vector_store_clear():
    """Verify clearing vector store empties all items."""
    store = VectorStore(dimension=4)
    chunks = [ArticleChunk("c1", "a1", "Title", "https://a.com", "Src", "Content", 0)]
    embs = np.array([[1.0, 0.0, 0.0, 0.0]], dtype=np.float32)
    store.add_chunks(chunks, embs)
    assert store.count() == 1

    store.clear()
    assert store.count() == 0
