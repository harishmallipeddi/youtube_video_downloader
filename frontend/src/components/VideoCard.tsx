import React, { useState, useEffect } from 'react';
import type { VideoInfo, AvailableFormat } from '../services/api';
import { Download, Clock, User, Film, Music, ExternalLink } from 'lucide-react';

interface VideoCardProps {
  videoInfo: VideoInfo;
  onStartDownload: (formatId: string, ext: string) => void;
  isDownloading: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  videoInfo,
  onStartDownload,
  isDownloading,
}) => {
  const [selectedQuality, setSelectedQuality] = useState<AvailableFormat>(
    videoInfo.available_formats[0] || {
      quality: 'Best',
      format_id: 'bestvideo+bestaudio/best',
      ext: 'mp4',
      label: 'Best Quality (MP4)',
    }
  );

  const [selectedExt, setSelectedExt] = useState<string>('mp4');

  useEffect(() => {
    if (videoInfo.available_formats.length > 0) {
      setSelectedQuality(videoInfo.available_formats[0]);
      if (videoInfo.available_formats[0].quality === 'Audio Only') {
        setSelectedExt('mp3');
      } else {
        setSelectedExt('mp4');
      }
    }
  }, [videoInfo]);

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = videoInfo.available_formats.find((f) => f.format_id === e.target.value);
    if (found) {
      setSelectedQuality(found);
      if (found.quality === 'Audio Only') {
        setSelectedExt('mp3');
      } else {
        setSelectedExt('mp4');
      }
    }
  };

  const handleDownloadClick = () => {
    // If a direct stream URL exists, trigger instant browser download/open
    if (selectedQuality.direct_url) {
      const a = document.createElement('a');
      a.href = selectedQuality.direct_url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = `${videoInfo.title}.${selectedExt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    onStartDownload(selectedQuality.format_id, selectedExt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800/60 backdrop-blur-xl border border-slate-700/70 rounded-3xl p-6 md:p-8 shadow-2xl transition-all animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Thumbnail Preview */}
        <div className="md:col-span-5 relative group overflow-hidden rounded-2xl border border-slate-700/80 shadow-lg">
          <img
            src={videoInfo.thumbnail}
            alt={videoInfo.title}
            className="w-full h-48 md:h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60" />
          
          <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-700 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-md">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>{videoInfo.duration}</span>
          </div>
        </div>

        {/* Video Info & Controls */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug line-clamp-2 mb-3">
              {videoInfo.title}
            </h2>
            
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <User className="w-4 h-4 text-slate-500" />
              <span>{videoInfo.channel}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50">
            {/* Quality Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-red-400" />
                <span>Quality</span>
              </label>
              <select
                value={selectedQuality.format_id}
                onChange={handleQualityChange}
                disabled={isDownloading}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-red-500/50 focus:outline-none font-medium cursor-pointer"
              >
                {videoInfo.available_formats.map((fmt) => (
                  <option key={fmt.format_id} value={fmt.format_id}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-rose-400" />
                <span>Format</span>
              </label>
              <select
                value={selectedExt}
                onChange={(e) => setSelectedExt(e.target.value)}
                disabled={isDownloading || selectedQuality.quality === 'Audio Only'}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-red-500/50 focus:outline-none font-medium cursor-pointer"
              >
                {selectedQuality.quality === 'Audio Only' ? (
                  <option value="mp3">MP3 (Audio)</option>
                ) : (
                  <>
                    <option value="mp4">MP4 (Video + Audio)</option>
                    <option value="webm">WEBM (Video + Audio)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-red-600/30 transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              <Download className="w-5 h-5" />
              <span>{isDownloading ? 'Processing Download...' : 'Download Video'}</span>
            </button>

            {selectedQuality.direct_url && (
              <a
                href={selectedQuality.direct_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-4 px-5 rounded-2xl border border-slate-600 transition-colors text-sm whitespace-nowrap"
                title="Direct Media Stream"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>Direct Stream</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
