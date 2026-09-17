import os
import uuid
import threading
import time
from typing import Dict, Any, List
import yt_dlp
from backend.services.ffmpeg_service import get_ffmpeg_binary_path
from backend.utils.sanitize import sanitize_filename

# Download jobs state tracking
DOWNLOAD_JOBS: Dict[str, Dict[str, Any]] = {}
JOBS_LOCK = threading.Lock()

DOWNLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "downloads")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


def format_duration(seconds: float | int | None) -> str:
    """Format duration in seconds to HH:MM:SS or MM:SS."""
    if not seconds:
        return "Unknown"
    secs = int(seconds)
    hours = secs // 3600
    minutes = (secs % 3600) // 60
    remaining_secs = secs % 60
    if hours > 0:
        return f"{hours}:{minutes:02d}:{remaining_secs:02d}"
    return f"{minutes}:{remaining_secs:02d}"


def extract_video_metadata(url: str) -> Dict[str, Any]:
    """Fetch video metadata and parse distinct available resolutions and qualities."""
    ffmpeg_path = get_ffmpeg_binary_path()
    ydl_opts: Dict[str, Any] = {
        'skip_download': True,
        'quiet': True,
        'no_warnings': True,
    }
    if ffmpeg_path:
        ydl_opts['ffmpeg_location'] = ffmpeg_path

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if not info:
                raise ValueError("Could not extract video details from URL.")

            title = info.get('title', 'YouTube Video')
            thumbnail = info.get('thumbnail') or (info.get('thumbnails')[-1]['url'] if info.get('thumbnails') else '')
            duration = format_duration(info.get('duration'))
            channel = info.get('uploader') or info.get('channel') or 'Unknown Channel'
            webpage_url = info.get('webpage_url') or url

            raw_formats = info.get('formats', [])
            quality_map: Dict[str, Dict[str, Any]] = {}
            has_audio = False

            for f in raw_formats:
                vcodec = f.get('vcodec', 'none')
                acodec = f.get('acodec', 'none')
                height = f.get('height')
                ext = f.get('ext', 'mp4')
                format_id = f.get('format_id')
                
                if acodec != 'none':
                    has_audio = True

                if vcodec != 'none' and height and isinstance(height, int):
                    res_label = f"{height}p"
                    filesize = f.get('filesize') or f.get('filesize_approx')
                    size_str = f" (~{round(filesize / (1024*1024), 1)} MB)" if filesize else ""
                    
                    if res_label not in quality_map or (ext == 'mp4' and quality_map[res_label]['ext'] != 'mp4'):
                        quality_map[res_label] = {
                            "quality": res_label,
                            "format_id": f"bestvideo[height<={height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<={height}]+bestaudio/best[height<={height}]/best",
                            "ext": "mp4",
                            "height": height,
                            "label": f"{res_label} (MP4){size_str}"
                        }

            # Sort qualities high-to-low (1080p -> 720p -> 480p -> 360p)
            sorted_qualities = sorted(quality_map.values(), key=lambda x: x['height'], reverse=True)
            
            available_formats = [
                {
                    "quality": q["quality"],
                    "format_id": q["format_id"],
                    "ext": q["ext"],
                    "label": q["label"]
                }
                for q in sorted_qualities
            ]

            if not available_formats:
                available_formats.append({
                    "quality": "Best Available",
                    "format_id": "bestvideo+bestaudio/best",
                    "ext": "mp4",
                    "label": "Best Quality (MP4)"
                })

            if has_audio:
                available_formats.append({
                    "quality": "Audio Only",
                    "format_id": "bestaudio/best",
                    "ext": "mp3",
                    "label": "Audio Only (MP3)"
                })

            return {
                "title": title,
                "thumbnail": thumbnail,
                "duration": duration,
                "channel": channel,
                "url": webpage_url,
                "available_formats": available_formats
            }
    except yt_dlp.utils.DownloadError as e:
        err_msg = str(e)
        if "Private video" in err_msg:
            raise ValueError("This YouTube video is private.")
        elif "Sign in to confirm your age" in err_msg or "age-restricted" in err_msg:
            raise ValueError("This video is age-restricted and requires sign-in.")
        elif "Video unavailable" in err_msg:
            raise ValueError("This YouTube video is unavailable.")
        else:
            raise ValueError("Failed to fetch video information. Please check the URL.")
    except Exception as e:
        raise ValueError(f"Error fetching video info: {str(e)}")


def _run_download_thread(task_id: str, url: str, format_id: str, requested_ext: str):
    ffmpeg_path = get_ffmpeg_binary_path()
    
    def hook(d):
        with JOBS_LOCK:
            if d['status'] == 'downloading':
                total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
                downloaded = d.get('downloaded_bytes', 0)
                percent = round((downloaded / total) * 100, 1) if total > 0 else 0.0
                speed_bytes = d.get('speed') or 0
                speed_mb = round(speed_bytes / (1024 * 1024), 2) if speed_bytes else 0.0
                speed_str = f"{speed_mb} MB/s" if speed_mb > 0 else ""
                
                DOWNLOAD_JOBS[task_id]["status"] = "downloading"
                DOWNLOAD_JOBS[task_id]["percent"] = percent
                DOWNLOAD_JOBS[task_id]["speed"] = speed_str
            elif d['status'] == 'finished':
                DOWNLOAD_JOBS[task_id]["status"] = "merging"
                DOWNLOAD_JOBS[task_id]["percent"] = 99.0

    output_template = os.path.join(DOWNLOAD_DIR, f"{task_id}_%(title)s.%(ext)s")
    
    # Highly optimized yt-dlp options for maximum download speed
    ydl_opts: Dict[str, Any] = {
        'format': format_id if format_id else 'bestvideo+bestaudio/best',
        'outtmpl': output_template,
        'progress_hooks': [hook],
        'quiet': True,
        'no_warnings': True,
        'concurrent_fragment_downloads': 8,  # Downloads fragments in parallel (5x-10x speedup!)
        'buffersize': 1024 * 1024,
        'http_chunk_size': 10485760,
        'nocheckcertificate': True,
        'merge_output_format': 'mp4' if requested_ext == 'mp4' else requested_ext,
    }

    if ffmpeg_path:
        ydl_opts['ffmpeg_location'] = ffmpeg_path

    if requested_ext == 'mp3':
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            raw_title = info.get('title', 'video') if info else 'video'
            sanitized_title = sanitize_filename(raw_title)

            downloaded_file = None
            for filename in os.listdir(DOWNLOAD_DIR):
                if filename.startswith(task_id):
                    downloaded_file = os.path.join(DOWNLOAD_DIR, filename)
                    break

            if downloaded_file and os.path.exists(downloaded_file):
                final_filename = f"{sanitized_title}.{requested_ext if requested_ext else 'mp4'}"
                final_filepath = os.path.join(DOWNLOAD_DIR, f"{task_id}_{final_filename}")
                
                if downloaded_file != final_filepath:
                    os.rename(downloaded_file, final_filepath)

                with JOBS_LOCK:
                    DOWNLOAD_JOBS[task_id]["status"] = "completed"
                    DOWNLOAD_JOBS[task_id]["percent"] = 100.0
                    DOWNLOAD_JOBS[task_id]["filename"] = final_filename
                    DOWNLOAD_JOBS[task_id]["file_path"] = final_filepath
            else:
                raise FileNotFoundError("Downloaded video file could not be found.")

    except Exception as e:
        with JOBS_LOCK:
            DOWNLOAD_JOBS[task_id]["status"] = "error"
            DOWNLOAD_JOBS[task_id]["error"] = str(e)


def create_download_job(url: str, format_id: str, ext: str) -> str:
    """Initialize a non-blocking background download task."""
    task_id = str(uuid.uuid4())
    with JOBS_LOCK:
        DOWNLOAD_JOBS[task_id] = {
            "status": "downloading",
            "percent": 0.0,
            "speed": "",
            "filename": "",
            "file_path": "",
            "error": ""
        }
    
    t = threading.Thread(target=_run_download_thread, args=(task_id, url, format_id, ext), daemon=True)
    t.start()
    return task_id


def get_job_status(task_id: str) -> Dict[str, Any]:
    """Get current status of a download job."""
    with JOBS_LOCK:
        job = DOWNLOAD_JOBS.get(task_id)
        if not job:
            return {"status": "error", "error": "Job task ID not found"}
        return dict(job)
