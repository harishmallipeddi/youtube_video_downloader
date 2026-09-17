import re

YOUTUBE_URL_REGEX = re.compile(
    r'^(https?://)?(www\.)?(youtube\.com/(watch\?v=|shorts/|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})(\S*)?$'
)

def validate_youtube_url(url: str) -> bool:
    """Check if the provided URL matches a standard YouTube video/shorts link."""
    if not url or not isinstance(url, str):
        return False
    return bool(YOUTUBE_URL_REGEX.match(url.strip()))
