import pytest
from bs4 import BeautifulSoup
from services.article_extractor import ArticleExtractor, ArticleExtractionError
from utils.helpers import is_valid_url, extract_domain_source

def test_is_valid_url():
    """Verify URL validation handles valid and invalid URLs cleanly."""
    assert is_valid_url("https://www.bbc.com/news/world-12345") is True
    assert is_valid_url("http://reuters.com/article/tech") is True
    assert is_valid_url("ftp://ftp.example.com") is False
    assert is_valid_url("not-a-valid-url") is False
    assert is_valid_url("") is False
    assert is_valid_url("   ") is False

def test_extract_domain_source():
    """Verify friendly domain source identification."""
    assert extract_domain_source("https://www.bbc.com/news/123") == "BBC News"
    assert extract_domain_source("https://reuters.com/business") == "Reuters"
    assert extract_domain_source("https://techcrunch.com/2024/01/01/startup") == "TechCrunch"
    assert extract_domain_source("https://unknownblog.org/post") == "Unknownblog"

def test_article_extractor_invalid_url():
    """Verify ArticleExtractor raises ArticleExtractionError on invalid URL."""
    extractor = ArticleExtractor()
    with pytest.raises(ArticleExtractionError) as exc_info:
        extractor.extract("invalid-url-string")
    assert "Invalid URL" in str(exc_info.value)

def test_title_extraction_opengraph():
    """Verify title parsing prioritizes OpenGraph metadata."""
    html = """
    <html>
        <head>
            <meta property="og:title" content="Meta OpenGraph Breaking Headline" />
            <title>Old HTML Title</title>
        </head>
        <body>
            <h1>Main H1 Header</h1>
            <p>Body paragraph with information.</p>
        </body>
    </html>
    """
    soup = BeautifulSoup(html, "html.parser")
    extractor = ArticleExtractor()
    title = extractor._extract_title(soup, "Example News")
    assert title == "Meta OpenGraph Breaking Headline"

def test_content_strips_noise():
    """Verify scripts, styles, and unwanted tags are eliminated."""
    html = """
    <html>
        <body>
            <script>console.log('advertisement code');</script>
            <nav><a href='/'>Home Navigation</a></nav>
            <article>
                <p>This is the first real substantive news paragraph describing the breakthrough event.</p>
                <p>This is the second substantial paragraph with key statistics and research details.</p>
            </article>
            <footer>Copyright 2024 All Rights Reserved</footer>
        </body>
    </html>
    """
    soup = BeautifulSoup(html, "html.parser")
    extractor = ArticleExtractor()
    content = extractor._extract_content(soup)
    assert "advertisement code" not in content
    assert "Home Navigation" not in content
    assert "substantive news paragraph" in content
    assert "second substantial paragraph" in content
