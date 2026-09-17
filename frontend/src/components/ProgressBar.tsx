import React from 'react';
import { Download, CheckCircle2, Loader2, HardDrive, RefreshCw } from 'lucide-react';

interface ProgressBarProps {
  percent: number;
  status: 'downloading' | 'merging' | 'completed' | 'error';
  speed?: string;
  filename?: string;
  downloadUrl?: string;
  onReset?: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  status,
  speed,
  filename,
  downloadUrl,
  onReset,
}) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'downloading':
        return 'Downloading stream...';
      case 'merging':
        return 'Merging audio & video using FFmpeg...';
      case 'completed':
        return 'Download complete ✓';
      case 'error':
        return 'Download failed';
      default:
        return 'Preparing...';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl animate-fadeIn">
      <div className="flex flex-col space-y-5">
        {/* Top Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === 'completed' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : status === 'error' ? (
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            ) : (
              <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
            )}
            <span className="text-lg font-bold text-slate-100">{getStatusMessage()}</span>
          </div>

          {speed && status === 'downloading' && (
            <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold text-slate-300">
              ⚡ {speed}
            </div>
          )}

          <div className="text-lg font-mono font-extrabold text-red-400">
            {Math.min(100, Math.max(0, percent))}%
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-slate-700/60 p-0.5 shadow-inner">
          <div
            className="bg-gradient-to-r from-red-600 via-rose-500 to-emerald-500 h-full rounded-full transition-all duration-300 shadow-md shadow-red-500/50"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* File Name & Save Button */}
        {status === 'completed' && downloadUrl && (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-3 text-slate-200 truncate max-w-full">
              <HardDrive className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold text-sm truncate" title={filename}>
                {filename || 'downloaded-video.mp4'}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={downloadUrl}
                download={filename || 'video.mp4'}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </a>

              {onReset && (
                <button
                  onClick={onReset}
                  className="p-3 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
                  title="Download another video"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
