import re
from urllib.parse import urlparse
from typing import List
from models.schemas import SourceReference

def is_valid_url(url: str) -> bool:
    """Validate whether the given string is a valid HTTP/HTTPS URL."""
    if not url or not isinstance(url, str):
        return False
    url = url.strip()
    try:
        parsed = urlparse(url)
        return bool(parsed.scheme in ("http", "https") and parsed.netloc)
    except Exception:
        return False

def clean_url(url: str) -> str:
    """Strip whitespace and tracking query params if needed."""
    if not url:
        return ""
    return url.strip()

def extract_domain_source(url: str) -> str:
    """Extract a friendly news source name from a URL domain."""
    try:
        domain = urlparse(url).netloc.lower()
        # Remove common prefixes
        if domain.startswith("www."):
            domain = domain[4:]
        if domain.startswith("m."):
            domain = domain[2:]
        
        # Well-known mappings
        domain_map = {
            "bbc.com": "BBC News",
            "bbc.co.uk": "BBC News",
            "reuters.com": "Reuters",
            "apnews.com": "Associated Press",
            "bloomberg.com": "Bloomberg",
            "techcrunch.com": "TechCrunch",
            "theverge.com": "The Verge",
            "nytimes.com": "The New York Times",
            "wsj.com": "The Wall Street Journal",
            "theguardian.com": "The Guardian",
            "cnn.com": "CNN",
            "nature.com": "Nature Journal",
            "wired.com": "Wired",
            "arstechnica.com": "Ars Technica",
            "forbes.com": "Forbes",
            "cnbc.com": "CNBC"
        }
        
        for key, name in domain_map.items():
            if key in domain:
                return name
                
        # Fallback: title case domain name (e.g. bbc.com -> Bbc)
        parts = domain.split(".")
        if len(parts) >= 2:
            return parts[-2].capitalize()
        return domain.capitalize()
    except Exception:
        return "Web News"

def format_sources_markdown(sources: List[SourceReference]) -> str:
    """Format source citations into a clean Markdown block."""
    if not sources:
        return ""
    
    lines = ["\n### 📚 Sources Consulted\n"]
    for idx, src in enumerate(sources, start=1):
        lines.append(f"{idx}. **{src.title}**")
        lines.append(f"   - **Source:** {src.source}")
        lines.append(f"   - **URL:** [{src.url}]({src.url})")
    
    return "\n".join(lines)

def truncate_text(text: str, max_chars: int = 150) -> str:
    """Truncate text cleanly at word boundaries with ellipsis."""
    if not text or len(text) <= max_chars:
        return text or ""
    truncated = text[:max_chars].rsplit(" ", 1)[0]
    return f"{truncated}..."
