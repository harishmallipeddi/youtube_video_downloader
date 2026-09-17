import os
import shutil
from fastapi import FastAPI, HTTPException
from starlette.background import BackgroundTask
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from backend.utils.url_validator import validate_youtube_url
from backend.services.video_service import (
    extract_video_metadata,
    create_download_job,
    get_job_status,
    DOWNLOAD_JOBS,
    JOBS_LOCK
)
from backend.services.ffmpeg_service import get_ffmpeg_binary_path

app = FastAPI(title="YouTube Video Downloader API", version="1.0.0")

# Enable CORS for frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VideoInfoRequest(BaseModel):
    url: str


class DownloadRequest(BaseModel):
    url: str
    format_id: str
    ext: str = "mp4"


def cleanup_temp_file(file_path: str, task_id: str):
    """Background cleanup task to delete temporary download file after browser download."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass
    with JOBS_LOCK:
        if task_id in DOWNLOAD_JOBS:
            del DOWNLOAD_JOBS[task_id]


@app.get("/api/health")
def health_check():
    ffmpeg_path = get_ffmpeg_binary_path()
    return {
        "status": "healthy",
        "ffmpeg_available": bool(ffmpeg_path),
        "ffmpeg_path": ffmpeg_path or "Not found"
    }


@app.post("/api/video-info")
def get_video_info(req: VideoInfoRequest):
    url = req.url.strip()
    if not validate_youtube_url(url):
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL. Please enter a valid video or Shorts link (e.g. youtube.com/watch?v=... or youtu.be/...)."
        )

    try:
        metadata = extract_video_metadata(url)
        return metadata
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while fetching video details."
        )


@app.post("/api/download")
def start_download(req: DownloadRequest):
    url = req.url.strip()
    if not validate_youtube_url(url):
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL provided."
        )

    try:
        task_id = create_download_job(url, req.format_id, req.ext)
        return {"task_id": task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start download: {str(e)}")


@app.get("/api/progress/{task_id}")
def check_progress(task_id: str):
    job = get_job_status(task_id)
    return job


@app.get("/api/get-file/{task_id}")
def get_file(task_id: str):
    job = get_job_status(task_id)
    if job.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Download is not completed yet.")

    file_path = job.get("file_path")
    filename = job.get("filename")

    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Downloaded file was not found on server.")

    # Stream file to browser and schedule background file removal
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream",
        background=BackgroundTask(cleanup_temp_file, file_path, task_id)
    )

# Mount React production build static files if present
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
