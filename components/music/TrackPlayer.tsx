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
  // Simple icon-only button that always fits in container
  const fallbackUrl = spotifyUrl || `https://open.spotify.com/track/${trackId}`;

  return (
    <a
      href={fallbackUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] active:scale-95 transition-all rounded-full shadow-lg hover:shadow-xl ${className}`}
      aria-label={`Play ${trackName} by ${artistName} on Spotify`}
    >
      <Play className="w-6 h-6 text-white fill-white" />
    </a>
  );
}

