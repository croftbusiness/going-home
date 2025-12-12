'use client';

import { ExternalLink } from 'lucide-react';

interface SpotifyFallbackProps {
  spotifyUrl: string;
  className?: string;
}

export default function SpotifyFallback({ spotifyUrl, className = '' }: SpotifyFallbackProps) {
  return (
    <div className={`flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/60 ${className}`}>
      <div className="text-center">
        <p className="text-sm sm:text-base text-[#2C2A29] font-medium mb-1.5">
          This song cannot be played inside the app without Spotify Premium.
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          Open in Spotify to listen to the full track
        </p>
      </div>
      <a
        href={spotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 min-h-[44px] bg-[#1DB954] text-white rounded-lg hover:bg-[#1ed760] active:bg-[#1ed760]/90 transition-all shadow-sm hover:shadow-md font-medium text-sm sm:text-base touch-target"
      >
        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Open in Spotify</span>
      </a>
    </div>
  );
}

