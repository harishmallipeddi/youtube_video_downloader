import shutil
import os
import stat

try:
    import imageio_ffmpeg
    IMAGEIO_FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    IMAGEIO_FFMPEG_PATH = None

def get_ffmpeg_binary_path() -> str | None:
    """Returns absolute path to system ffmpeg or imageio_ffmpeg fallback executable."""
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg
    if IMAGEIO_FFMPEG_PATH and os.path.exists(IMAGEIO_FFMPEG_PATH):
        try:
            # Ensure Linux/Vercel Lambda binary has executable permissions
            st = os.stat(IMAGEIO_FFMPEG_PATH)
            os.chmod(IMAGEIO_FFMPEG_PATH, st.st_mode | stat.S_IEXEC)
        except Exception:
            pass
        return IMAGEIO_FFMPEG_PATH
    return None
