import React from 'react';
import { Video, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-8 px-4 max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full text-red-400 mb-6 text-sm font-medium animate-pulse">
        <Sparkles className="w-4 h-4" />
        <span>Fast, Free & High-Quality Offline Playback</span>
      </div>

      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="bg-gradient-to-tr from-red-600 to-rose-500 p-3 rounded-2xl shadow-lg shadow-red-500/20">
          <Video className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          YouTube Video Downloader
        </h1>
      </div>

      <p className="text-slate-400 text-lg max-w-2xl mx-auto font-normal leading-relaxed">
        Paste a YouTube video URL and download the video for offline playback on your computer.
      </p>
    </header>
  );
};
