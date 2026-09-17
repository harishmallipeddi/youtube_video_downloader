import re

def sanitize_filename(filename: str) -> str:
    """Removes invalid filesystem characters from filenames to prevent OS errors."""
    if not filename:
        return "youtube_video"
    # Replace illegal filesystem characters with empty string
    sanitized = re.sub(r'[\\/*?:"<>|]', "", filename)
    # Remove ASCII control characters
    sanitized = re.sub(r'[\x00-\x1f\x7f]', "", sanitized)
    # Strip dots/spaces at ends
    sanitized = sanitized.strip(". ")
    return sanitized if sanitized else "youtube_video"
