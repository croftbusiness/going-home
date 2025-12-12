'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import SpotifyFullPlayer from './SpotifyFullPlayer';
import SpotifyPreviewPlayer from './SpotifyPreviewPlayer';
import SpotifyFallback from './SpotifyFallback';

interface TrackPlayerProps {
  trackId: string;
  trackName: string;
  artistName: string;
  albumArtUrl?: string;
  previewUrl?: string | null;
  spotifyUrl?: string;
  className?: string;
}

export default function TrackPlayer({
  trackId,
  trackName,
  artistName,
  albumArtUrl,
  previewUrl,
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
        setError('Not connected to Spotify');
        setIsPremium(false);
        setLoading(false);
        return;
      }

      if (!premiumResponse.ok || !tokenResponse.ok) {
        throw new Error('Failed to check Spotify status');
      }

      const premiumData = await premiumResponse.json();
      const tokenData = await tokenResponse.json();

      setIsPremium(premiumData.isPremium || false);
      setAccessToken(tokenData.accessToken || null);
    } catch (err: any) {
      console.error('Error checking premium status:', err);
      setError(err.message || 'Failed to check premium status');
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-[#93B0C8]" />
      </div>
    );
  }

  if (error && !isPremium) {
    // If there's an error and we can't verify premium, fall back to preview/fallback
    // Continue with the logic below
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

  // Free user with preview - use preview player
  if (previewUrl) {
    return (
      <SpotifyPreviewPlayer
        previewUrl={previewUrl}
        trackId={trackId}
        className={className}
      />
    );
  }

  // Free user without preview - show fallback
  const fallbackUrl = spotifyUrl || `https://open.spotify.com/track/${trackId}`;
  return (
    <SpotifyFallback
      spotifyUrl={fallbackUrl}
      className={className}
    />
  );
}

