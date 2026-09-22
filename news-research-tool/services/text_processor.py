import re
from typing import List
from config.config import Config
from models.schemas import Article, ArticleChunk

class TextProcessor:
    """
    Cleans extracted article text and segments it into overlapping chunks
    while preserving complete metadata for source provenance.
    """

    def __init__(self, chunk_size: int = Config.CHUNK_SIZE, chunk_overlap: int = Config.CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def clean_text(self, text: str) -> str:
        """
        Normalize whitespace, unicode characters, and line breaks.
        """
        if not text:
            return ""

        # Normalize non-breaking spaces and exotic unicode spaces
        text = text.replace("\xa0", " ").replace("\u200b", "")

        # Normalize curly quotes and dashes
        text = text.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
        text = text.replace("—", " - ").replace("–", " - ")

        # Collapse excessive newlines into double newlines
        text = re.sub(r"\n{3,}", "\n\n", text)

        # Collapse multiple spaces or tabs into a single space
        text = re.sub(r"[ \t]{2,}", " ", text)

        return text.strip()

    def split_article(self, article: Article) -> List[ArticleChunk]:
        """
        Split an Article into chunks with metadata attached to every chunk.
        Uses a recursive text splitting strategy (paragraphs -> sentences -> words).
        """
        cleaned_text = self.clean_text(article.content)
        if not cleaned_text:
            return []

        raw_chunks = self._recursive_split(
            text=cleaned_text,
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap
        )

        chunks: List[ArticleChunk] = []
        for idx, chunk_text in enumerate(raw_chunks):
            if not chunk_text.strip():
                continue
            chunk_id = f"{article.article_id}_c{idx}"
            chunk = ArticleChunk(
                chunk_id=chunk_id,
                article_id=article.article_id,
                article_title=article.title,
                article_url=article.url,
                source=article.source,
                content=chunk_text.strip(),
                chunk_index=idx
            )
            chunks.append(chunk)

        return chunks

    def _recursive_split(self, text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
        """
        Break text along logical boundaries (paragraphs, sentences, words)
        to prevent breaking words or phrases mid-sentence.
        """
        if len(text) <= chunk_size:
            return [text]

        separators = ["\n\n", "\n", ". ", "? ", "! ", " ", ""]
        return self._split_by_separators(text, separators, chunk_size, chunk_overlap)

    def _split_by_separators(self, text: str, separators: List[str], chunk_size: int, chunk_overlap: int) -> List[str]:
        final_chunks: List[str] = []
        separator = separators[-1]

        # Find the most natural separator that appears in this text
        for sep in separators:
            if sep == "" or sep in text:
                separator = sep
                break

        splits = text.split(separator) if separator != "" else list(text)

        current_chunk = []
        current_len = 0

        for segment in splits:
            seg_len = len(segment) + len(separator)
            if current_len + seg_len > chunk_size and current_chunk:
                combined = separator.join(current_chunk)
                final_chunks.append(combined)

                # Overlap handling: retain the end of the previous chunk
                overlap_text = []
                overlap_len = 0
                for prev in reversed(current_chunk):
                    if overlap_len + len(prev) <= chunk_overlap:
                        overlap_text.insert(0, prev)
                        overlap_len += len(prev) + len(separator)
                    else:
                        break

                current_chunk = overlap_text
                current_len = overlap_len

            current_chunk.append(segment)
            current_len += seg_len

        if current_chunk:
            final_chunks.append(separator.join(current_chunk))

        return final_chunks
