import React, { useState } from 'react';
import { Search, Clipboard, Loader2, X } from 'lucide-react';

interface UrlInputProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onFetch, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onFetch(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative flex items-center bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2 shadow-2xl focus-within:border-red-500/50 focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-300">
        <div className="pl-4 text-slate-400">
          <Search className="w-6 h-6" />
        </div>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube video URL here (e.g. https://www.youtube.com/watch?v=...)"
          className="w-full bg-transparent px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none text-base md:text-lg"
          disabled={isLoading}
        />

        {url && (
          <button
            type="button"
            onClick={() => setUrl('')}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear input"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <button
          type="button"
          onClick={handlePaste}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors mr-2"
          title="Paste from clipboard"
        >
          <Clipboard className="w-3.5 h-3.5" />
          <span>Paste</span>
        </button>

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-red-600/25 transition-all duration-200 min-w-[150px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Fetching...</span>
            </>
          ) : (
            <span>Get Video Info</span>
          )}
        </button>
      </div>
    </form>
  );
};
