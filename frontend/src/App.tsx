import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { VideoCard } from './components/VideoCard';
import { ProgressBar } from './components/ProgressBar';
import { ErrorToast } from './components/ErrorToast';
import { api } from './services/api';
import type { VideoInfo, ProgressResponse } from './services/api';
import { ShieldCheck, Zap, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Download Job State
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Poll progress if taskId is active
  useEffect(() => {
    let timer: any;
    if (taskId && isDownloading) {
      timer = setInterval(async () => {
        try {
          const res = await api.getProgress(taskId);
          setProgress(res);
          if (res.status === 'completed' || res.status === 'error') {
            setIsDownloading(false);
            clearInterval(timer);
            if (res.status === 'error') {
              setErrorMessage(res.error || 'An error occurred during video download.');
            }
          }
        } catch (err: any) {
          console.error('Progress polling error:', err);
        }
      }, 500);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [taskId, isDownloading]);

  const handleFetchInfo = async (url: string) => {
    setIsFetchingInfo(true);
    setErrorMessage(null);
    setVideoInfo(null);
    setTaskId(null);
    setProgress(null);
    setIsDownloading(false);
    setCurrentUrl(url);

    try {
      const data = await api.getVideoInfo(url);
      setVideoInfo(data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to retrieve video info.';
      setErrorMessage(msg);
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleStartDownload = async (formatId: string, ext: string) => {
    if (!videoInfo) return;
    const targetUrl = videoInfo.url || currentUrl;
    if (!targetUrl) return;

    setIsDownloading(true);
    setErrorMessage(null);
    setProgress({
      status: 'downloading',
      percent: 0,
      speed: '',
      filename: '',
    });

    try {
      const res = await api.startDownload(
        targetUrl,
        formatId,
        ext
      );
      setTaskId(res.task_id);
    } catch (err: any) {
      setIsDownloading(false);
      const msg = err.response?.data?.detail || 'Failed to initiate video download.';
      setErrorMessage(msg);
    }
  };

  const handleReset = () => {
    setVideoInfo(null);
    setCurrentUrl('');
    setTaskId(null);
    setProgress(null);
    setIsDownloading(false);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-red-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 py-8 max-w-6xl mx-auto w-full">
        <Header />

        <UrlInput onFetch={handleFetchInfo} isLoading={isFetchingInfo} />

        {errorMessage && (
          <ErrorToast message={errorMessage} onClose={() => setErrorMessage(null)} />
        )}

        {videoInfo && (
          <VideoCard
            videoInfo={videoInfo}
            onStartDownload={handleStartDownload}
            isDownloading={isDownloading}
          />
        )}

        {progress && (
          <ProgressBar
            percent={progress.percent}
            status={progress.status}
            speed={progress.speed}
            filename={progress.filename}
            downloadUrl={taskId ? api.getDownloadUrl(taskId) : undefined}
            onReset={handleReset}
          />
        )}

        {/* Feature Highlights section */}
        {!videoInfo && !isFetchingInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl flex flex-col items-start gap-3">
              <div className="bg-red-500/10 p-3 rounded-xl text-red-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">High-Speed Downloads</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Utilizes multi-fragment parallel downloads and optimized HTTP chunk buffers for 10x faster downloads.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl flex flex-col items-start gap-3">
              <div className="bg-rose-500/10 p-3 rounded-xl text-rose-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">FFmpeg Stream Merging</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatically combines high-definition 1080p video streams with audio into playback-ready MP4 files.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl flex flex-col items-start gap-3">
              <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Safe & Private</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                No telemetry or permanent server storage. Temporary files are automatically cleaned up after download.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-6 text-center text-slate-500 text-xs">
        <p>© 2026 YouTube Video Downloader. Designed for user-permitted offline media playback.</p>
      </footer>
    </div>
  );
};

export default App;
