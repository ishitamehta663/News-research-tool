import json
import logging
import re
import requests
from typing import List, Dict, Any, Optional
from config.config import Config
from models.schemas import ArticleChunk, RetrievedChunk, SourceReference

logger = logging.getLogger(__name__)

class LLMServiceError(Exception):
    """Exception raised when LLM generation fails."""
    pass

class LLMService:
    """
    Interfaces with a local LLM via Ollama (free, zero-paid API).
    Enforces strict RAG prompt engineering to eliminate hallucinations
    and generate verifiable source citations.
    """

    SYSTEM_PROMPT = (
        "You are a professional News Research Assistant.\n\n"
        "Instructions:\n"
        "1. Answer the user's question using ONLY the factual information contained in the provided Retrieved Article Context.\n"
        "2. Do NOT invent facts, assume unstated details, or extrapolate beyond the text.\n"
        "3. If the answer cannot be determined from the supplied articles, you MUST clearly state: "
        "'I could not find enough information about this question in the provided articles.'\n"
        "4. Compare and synthesize information from different articles when multiple sources are relevant.\n"
        "5. Structure your output clearly into:\n"
        "   - **Direct Answer**\n"
        "   - **Key Supporting Points** (bullet points with citations like [Article 1] or [Article 2])\n"
        "   - **Source References** (explicitly name the article title and publisher)"
    )

    def __init__(
        self,
        base_url: str = Config.OLLAMA_BASE_URL,
        model: str = Config.OLLAMA_MODEL,
        temperature: float = Config.LLM_TEMPERATURE
    ):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.temperature = temperature

    def check_connection(self) -> Dict[str, Any]:
        """
        Check if the local Ollama server is running and which models are installed.
        Returns a dict: {'available': bool, 'models': List[str], 'message': str}
        """
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=3)
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name") for m in data.get("models", [])]
                return {
                    "available": True,
                    "models": models,
                    "message": f"Ollama is running. Installed models: {', '.join(models) if models else 'None'}"
                }
            return {
                "available": False,
                "models": [],
                "message": f"Ollama responded with HTTP {resp.status_code}."
            }
        except requests.exceptions.RequestException:
            return {
                "available": False,
                "models": [],
                "message": (
                    f"Could not connect to Ollama at {self.base_url}. "
                    "Make sure Ollama is installed and running (`ollama serve` or Ollama desktop app)."
                )
            }

    def generate_answer(
        self,
        question: str,
        retrieved_chunks: List[RetrievedChunk]
    ) -> str:
        """
        Generate an answer using the retrieved article context and local Ollama LLM.
        """
        if not retrieved_chunks:
            return "I could not find enough information about this question in the provided articles."

        # Format context with numbered article identifiers
        context_blocks = []
        seen_articles = {}
        art_counter = 1

        for r_chunk in retrieved_chunks:
            chunk = r_chunk.chunk
            if chunk.article_id not in seen_articles:
                seen_articles[chunk.article_id] = art_counter
                art_counter += 1

            num = seen_articles[chunk.article_id]
            context_blocks.append(
                f"[Article {num}: '{chunk.article_title}' | Source: {chunk.source}]\n{chunk.content}"
            )

        formatted_context = "\n\n---\n\n".join(context_blocks)

        user_prompt = (
            f"Question:\n{question}\n\n"
            f"Retrieved Article Context:\n{formatted_context}\n\n"
            "Provide:\n"
            "1. A clear answer.\n"
            "2. Important supporting points.\n"
            "3. Source/article references.\n\n"
            "Remember: If the answer is not in the text above, state that the information is not available."
        )

        try:
            payload = {
                "model": self.model,
                "prompt": user_prompt,
                "system": self.SYSTEM_PROMPT,
                "stream": False,
                "options": {
                    "temperature": self.temperature,
                    "num_ctx": 4096,
                }
            }

            resp = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=120
            )

            if resp.status_code == 200:
                data = resp.json()
                return data.get("response", "").strip()
            elif resp.status_code == 404:
                raise LLMServiceError(
                    f"Model '{self.model}' was not found in Ollama. "
                    f"Please run `ollama pull {self.model}` in your terminal first."
                )
            else:
                raise LLMServiceError(
                    f"Ollama server returned error code {resp.status_code}: {resp.text}"
                )

        except requests.exceptions.ConnectionError:
            logger.info("Ollama is not running locally. Using smart extractive synthesis fallback.")
            return self._extractive_fallback_answer(question, retrieved_chunks)
        except requests.exceptions.Timeout:
            logger.warning("Ollama timed out. Falling back to extractive synthesis.")
            return self._extractive_fallback_answer(question, retrieved_chunks)
        except Exception as e:
            if isinstance(e, LLMServiceError):
                logger.warning(f"Ollama error: {e}. Falling back to extractive synthesis.")
                return self._extractive_fallback_answer(question, retrieved_chunks)
            raise LLMServiceError(f"Unexpected error during LLM generation: {str(e)}")

    def _extractive_fallback_answer(self, question: str, retrieved_chunks: List[RetrievedChunk]) -> str:
        """
        Extractive synthesis engine when local Ollama is not running.
        Extracts key sentences and structures them with bullet points and source attribution.
        """
        if not retrieved_chunks:
            return "I could not find enough information about this question in the provided articles."

        lines = []
        lines.append("### Key Findings from Retrieved Articles:\n")

        q_terms = set(re.findall(r"\w{3,}", question.lower()))

        for idx, item in enumerate(retrieved_chunks[:3], 1):
            c = item.chunk
            # Split into sentences
            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", c.content) if len(s.strip()) > 20]
            
            # Score sentences by term overlap
            scored_sentences = []
            for s in sentences:
                s_lower = s.lower()
                matches = sum(1 for t in q_terms if t in s_lower)
                scored_sentences.append((matches, s))
            
            scored_sentences.sort(key=lambda x: x[0], reverse=True)
            top_sentence = scored_sentences[0][1] if scored_sentences else (sentences[0] if sentences else c.content[:200])

            lines.append(f"- **{c.article_title}** ({c.source}):")
            lines.append(f"  > \"{top_sentence}\"")

        lines.append("\n---\n*💡 **Tip**: To enable full conversational generative synthesis, start Ollama (`ollama run llama3.2`) in your terminal.*")
        return "\n".join(lines)
