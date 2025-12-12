'use client';

import { useState, useEffect } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import SpotifyFullPlayer from './SpotifyFullPlayer';

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
  albumArtUrl,
  spotifyUrl,
  className = '',
}: TrackPlayerProps) {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      // Check premium status and get access token in parallel
      const [premiumResponse, tokenResponse] = await Promise.all([
        fetch('/api/spotify/premium-status'),
        fetch('/api/spotify/access-token'),
      ]);

      if (premiumResponse.status === 401 || tokenResponse.status === 401) {
        // Not connected to Spotify - show redirect button
        setIsPremium(false);
        setLoading(false);
        return;
      }

      if (!premiumResponse.ok || !tokenResponse.ok) {
        // Assume free user if we can't check
        setIsPremium(false);
        setLoading(false);
        return;
      }

      const premiumData = await premiumResponse.json();
      const tokenData = await tokenResponse.json();

      setIsPremium(premiumData.isPremium || false);
      setAccessToken(tokenData.accessToken || null);
    } catch (err: any) {
      console.error('Error checking premium status:', err);
      // On error, assume free user
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-2 ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-[#93B0C8]" />
      </div>
    );
  }

  // Premium user - use full player
  if (isPremium && accessToken) {
    return (
      <SpotifyFullPlayer
        trackId={trackId}
        trackName={trackName}
        artistName={artistName}
        albumArtUrl={albumArtUrl}
        accessToken={accessToken}
        className={className}
      />
    );
  }

  // Free user - redirect to Spotify
  const fallbackUrl = spotifyUrl || `https://open.spotify.com/track/${trackId}`;
  return (
    <a
      href={fallbackUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 min-h-[48px] bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-white rounded-xl hover:from-[#1ed760] hover:to-[#1DB954] active:scale-95 transition-all shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base ${className}`}
    >
      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
      <span>Open in Spotify</span>
    </a>
  );
}

