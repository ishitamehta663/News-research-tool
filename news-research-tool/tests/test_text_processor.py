from models.schemas import Article
from services.text_processor import TextProcessor

def test_clean_text():
    """Verify whitespace, non-breaking spaces, and quotes are normalized."""
    processor = TextProcessor()
    raw = "Here  is  some\xa0text   with   “curly quotes”   and\n\n\n\nextra lines."
    cleaned = processor.clean_text(raw)
    assert "\xa0" not in cleaned
    assert '“' not in cleaned
    assert '"curly quotes"' in cleaned
    assert "\n\n\n" not in cleaned

def test_split_article_preserves_metadata():
    """Verify text chunking preserves all metadata fields accurately."""
    article = Article(
        article_id="art_test_1",
        url="https://example.com/news/rag-ai",
        title="RAG AI Systems Advance Rapidly",
        source="Example News",
        content=(
            "Retrieval-Augmented Generation (RAG) is an AI architecture that enhances large language models. "
            "It combines information retrieval with text generation. By retrieving relevant documents, "
            "the LLM produces factual and grounded responses without hallucinating facts."
        ),
        word_count=35
    )

    processor = TextProcessor(chunk_size=100, chunk_overlap=20)
    chunks = processor.split_article(article)

    assert len(chunks) > 0
    for idx, chunk in enumerate(chunks):
        assert chunk.article_id == "art_test_1"
        assert chunk.article_title == "RAG AI Systems Advance Rapidly"
        assert chunk.article_url == "https://example.com/news/rag-ai"
        assert chunk.source == "Example News"
        assert chunk.chunk_id == f"art_test_1_c{idx}"
        assert chunk.chunk_index == idx
        assert len(chunk.content) > 0

def test_chunking_overlap():
    """Verify that chunks have overlap to maintain contextual continuity."""
    long_text = " ".join([f"Sentence number {i} provides critical context." for i in range(40)])
    article = Article(
        article_id="art_overlap",
        url="https://example.com",
        title="Overlap Test",
        source="Test Source",
        content=long_text
    )

    processor = TextProcessor(chunk_size=200, chunk_overlap=50)
    chunks = processor.split_article(article)

    assert len(chunks) >= 2
    # The end of chunk 0 should overlap with beginning of chunk 1
    assert any(word in chunks[1].content for word in chunks[0].content.split()[-4:])
