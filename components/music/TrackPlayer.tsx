'use client';

import { Play } from 'lucide-react';

interface TrackPlayerProps {
  trackId: string;
  trackName: string;
  artistName: string;
  albumArtUrl?: string;
  spotifyUrl?: string;
  className?: string;
}

export default function TrackPlayer({
  trackId,
  trackName,
  artistName,
  spotifyUrl,
  className = '',
}: TrackPlayerProps) {
  const fallbackUrl = spotifyUrl || `https://open.spotify.com/track/${trackId}`;

  return (
    <a
      href={fallbackUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`w-full h-full flex items-center justify-center bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 transition-colors rounded-full ${className}`}
      style={{ maxWidth: '100%', maxHeight: '100%', boxSizing: 'border-box' }}
      aria-label={`Play ${trackName} by ${artistName} on Spotify`}
    >
      <Play className="w-3.5 h-3.5 text-white fill-white" style={{ maxWidth: '100%', maxHeight: '100%' }} />
    </a>
  );
}

