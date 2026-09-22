import re
import uuid
import requests
from bs4 import BeautifulSoup
from typing import Optional, Dict
from config.config import Config
from models.schemas import Article
from utils.helpers import is_valid_url, clean_url, extract_domain_source

class ArticleExtractionError(Exception):
    """Custom exception raised when an article cannot be extracted."""
    pass

class ArticleExtractor:
    """
    Service responsible for fetching web pages and extracting clean
    article metadata (title, body content, source, url).
    """

    def __init__(self, timeout: int = Config.REQUEST_TIMEOUT):
        self.timeout = timeout
        self.headers = {
            "User-Agent": Config.USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "DNT": "1",
            "Connection": "close",
        }

    def extract(self, url: str, article_id: Optional[str] = None) -> Article:
        """
        Fetch and parse a news article from the specified URL.
        
        Args:
            url: The HTTP/HTTPS web address of the news article.
            article_id: Optional unique identifier. If not provided, a UUID is generated.
            
        Returns:
            Article: Standardized article object with title, source, and clean text.
            
        Raises:
            ArticleExtractionError: If the URL is invalid, unreachable, or returns no text.
        """
        cleaned_url = clean_url(url)
        if not is_valid_url(cleaned_url):
            raise ArticleExtractionError(f"Invalid URL format: '{url}'. Please enter a valid http:// or https:// URL.")

        article_id = article_id or f"art_{uuid.uuid4().hex[:8]}"
        source_name = extract_domain_source(cleaned_url)

        try:
            response = requests.get(
                cleaned_url,
                headers=self.headers,
                timeout=self.timeout,
                allow_redirects=True,
            )
        except requests.exceptions.Timeout:
            raise ArticleExtractionError(f"Connection timed out while loading {cleaned_url}. The website took too long to respond.")
        except requests.exceptions.ConnectionError:
            raise ArticleExtractionError(f"Could not connect to {cleaned_url}. Please check your internet connection or URL spelling.")
        except requests.exceptions.RequestException as e:
            raise ArticleExtractionError(f"Network error while fetching {cleaned_url}: {str(e)}")

        if response.status_code == 403:
            raise ArticleExtractionError(
                f"Access denied (HTTP 403) by {source_name}. The website blocks automated crawlers. Try another news article URL."
            )
        elif response.status_code == 404:
            raise ArticleExtractionError(f"Article not found (HTTP 404) at {cleaned_url}.")
        elif response.status_code >= 400:
            raise ArticleExtractionError(f"Failed to fetch article (HTTP status {response.status_code}).")

        # Check response content type
        content_type = response.headers.get("Content-Type", "")
        if "text/html" not in content_type and "application/xhtml" not in content_type:
            raise ArticleExtractionError(f"The URL does not point to an HTML webpage (Content-Type: {content_type}).")

        html_text = response.text
        if not html_text or len(html_text.strip()) < 100:
            raise ArticleExtractionError("The target webpage returned an empty or nearly blank page.")

        # Parse HTML
        soup = BeautifulSoup(html_text, "html.parser")

        # 1. Extract Title
        title = self._extract_title(soup, source_name)

        # 2. Extract Body Text
        content = self._extract_content(soup)

        if not content or len(content.split()) < 30:
            raise ArticleExtractionError(
                f"Could not extract sufficient readable text from {cleaned_url}. The page might require JavaScript or a login/subscription."
            )

        word_count = len(content.split())

        return Article(
            article_id=article_id,
            url=cleaned_url,
            title=title,
            source=source_name,
            content=content,
            word_count=word_count,
        )

    def _extract_title(self, soup: BeautifulSoup, fallback_source: str) -> str:
        """Extract the most accurate headline/title from HTML metadata or tags."""
        # 1. OpenGraph title
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            title = og_title["content"].strip()
            if len(title) > 5:
                return title

        # 2. Twitter title
        tw_title = soup.find("meta", attrs={"name": "twitter:title"})
        if tw_title and tw_title.get("content"):
            title = tw_title["content"].strip()
            if len(title) > 5:
                return title

        # 3. HTML <title> tag
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
            # Clean off website branding after dash or pipe e.g. "Headline | BBC News"
            cleaned_title = re.split(r"[\s\-\|]+(?=" + re.escape(fallback_source) + r"|$)", title)[0]
            if len(cleaned_title) > 5:
                return cleaned_title
            return title

        # 4. First <h1> tag
        h1 = soup.find("h1")
        if h1 and h1.get_text():
            title = h1.get_text().strip()
            if len(title) > 5:
                return title

        return f"News Article from {fallback_source}"

    def _extract_content(self, soup: BeautifulSoup) -> str:
        """Strip boilerplate elements and extract coherent article paragraphs."""
        # Remove non-content tags
        unwanted_tags = [
            "script", "style", "nav", "header", "footer", "aside",
            "form", "button", "iframe", "noscript", "svg", "figure",
            "figcaption", "time"
        ]
        for tag in soup.find_all(unwanted_tags):
            tag.decompose()

        # Remove elements by common noise classes or IDs
        noise_pattern = re.compile(
            r"comment|share|social|newsletter|cookie|banner|advert|ad-|promo|sidebar|related|widget|footer",
            re.I
        )
        for noise_elem in soup.find_all(attrs={"class": noise_pattern}):
            noise_elem.decompose()
        for noise_elem in soup.find_all(attrs={"id": noise_pattern}):
            noise_elem.decompose()

        # Prioritize main article container if present
        article_elem = soup.find("article") or soup.find("main") or soup.find(attrs={"role": "main"})
        target_container = article_elem if article_elem else soup.body or soup

        # Extract paragraphs
        paragraphs = []
        for p in target_container.find_all(["p", "h2", "h3", "li"]):
            text = p.get_text(separator=" ", strip=True)
            # Filter out very short lines, copyright notices, or button labels
            if len(text) > 35 and not re.search(r"^(cookie|sign up|subscribe|read more|all rights reserved)", text, re.I):
                paragraphs.append(text)

        # If paragraph collection is small, fall back to clean text extraction
        if len(paragraphs) < 3:
            raw_text = target_container.get_text(separator="\n", strip=True)
            lines = [line.strip() for line in raw_text.splitlines() if len(line.strip()) > 35]
            return "\n\n".join(lines)

        return "\n\n".join(paragraphs)
