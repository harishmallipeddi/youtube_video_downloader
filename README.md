# YouTube Video Downloader 🎬

A modern, fast, and beginner-friendly desktop web application built with **React**, **TypeScript**, **Tailwind CSS**, **Python FastAPI**, and **yt-dlp**.

It allows users to paste YouTube video URLs, validate them, preview metadata (title, thumbnail, duration, channel), select video quality (up to 1080p MP4) or audio format (MP3), and download the combined audio/video media file directly to their computer for offline playback.

---

## 🌟 Key Features

- **URL Validation**: Supports standard YouTube links (`youtube.com/watch?v=...`), short URLs (`youtu.be/...`), and YouTube Shorts (`youtube.com/shorts/...`).
- **Metadata Preview**: Automatically displays video title, thumbnail image, channel name, and exact video duration.
- **Quality & Format Selector**: Choose from available video resolutions (1080p, 720p, 480p, 360p) or extract Audio-only MP3.
- **FFmpeg Stream Merging**: Uses FFmpeg under the hood to merge separate high-definition video and audio streams into single compatible `.mp4` files.
- **Real-Time Progress**: Live visual progress bar with speed metrics (`MB/s`) and status steps ("Downloading...", "Merging with FFmpeg...", "Complete").
- **Automatic Cleanup**: Temporary download files are automatically removed after browser download completion.
- **Modern Dark UI**: Designed with glassmorphism aesthetics, responsive layouts, and clean user error messages.

---

## 📁 Project Structure

```
youtube-video-downloader/
├── frontend/                  # React + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/        # Header, UrlInput, VideoCard, ProgressBar, ErrorToast
│   │   ├── services/          # API Client (Axios)
│   │   ├── App.tsx            # Main App Layout & State
│   │   ├── main.tsx
│   │   └── index.css          # Tailwind CSS styles
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                   # Python FastAPI Backend
│   ├── main.py                # API Endpoints (video-info, download, progress, get-file)
│   ├── services/
│   │   ├── video_service.py   # yt-dlp extraction & background download runner
│   │   └── ffmpeg_service.py  # Automatic FFmpeg binary detection
│   ├── utils/
│   │   ├── sanitize.py        # OS filename sanitizer
│   │   └── url_validator.py   # Regex YouTube URL validator
│   └── downloads/             # Temporary processing directory
│
├── requirements.txt           # Python package dependencies
├── .env.example               # Environment configuration template
└── README.md                  # Instructions & setup guide
```

---

## 💻 Step-by-Step Setup Instructions for Windows Users

### 1. Prerequisites
Ensure you have the following installed on your Windows machine:
1. **Python** (version 3.10 or newer): [Download Python](https://www.python.org/downloads/) *(Make sure to check "Add python.exe to PATH" during installation)*
2. **Node.js** (version 18 or newer): [Download Node.js](https://nodejs.org/)

> 💡 **FFmpeg Note**: The application includes `imageio-ffmpeg` in `requirements.txt` which automatically installs a bundled FFmpeg executable for Windows. You do **not** need to manually install FFmpeg! (System FFmpeg will also be auto-detected if present).

---

### 2. Backend Setup & Startup

1. Open **Command Prompt (cmd)** or **PowerShell** in the `youtube-video-downloader` directory.

2. Install Python backend dependencies:
   ```cmd
   python -m pip install -r requirements.txt
   ```

3. Start the FastAPI backend server:
   ```cmd
   python -m uvicorn backend.main:app --reload --port 8000
   ```

4. You should see output indicating the backend is running:
   ```text
   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
   ```

---

### 3. Frontend Setup & Startup

1. Open a **new Command Prompt or PowerShell window** in the `youtube-video-downloader` project folder.

2. Navigate into the `frontend` directory:
   ```cmd
   cd frontend
   ```

3. Install Node packages:
   ```cmd
   npm install
   ```

4. Start the React development web server:
   ```cmd
   npm run dev
   ```

5. Open your web browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 🚀 How to Use the Application

1. **Paste URL**: Paste a permitted YouTube video or Shorts link into the input box.
2. **Fetch Metadata**: Click **Get Video Info**. The app will validate the link and show the thumbnail, title, channel, duration, and quality dropdown.
3. **Select Quality**: Select your desired quality (e.g., `1080p (MP4)`, `720p (MP4)`, or `Audio Only (MP3)`).
4. **Download**: Click **Download Video**. Watch the real-time progress bar (`[████████████░░░░] 75%`).
5. **Save to Computer**: Once complete, click **Download File** to save the `.mp4` or `.mp3` file to your Downloads folder and play it in media players like VLC or Windows Media Player!

---

## ⚠️ Legal & Permitted Use Requirement

This application is designed for downloading videos that you own, have explicit permission to download, or that YouTube otherwise makes available for offline viewing. Do not use this application to circumvent DRM or download protected content without rights.
