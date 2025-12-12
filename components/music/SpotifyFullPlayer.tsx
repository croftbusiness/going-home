'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface SpotifyFullPlayerProps {
  trackId: string;
  trackName: string;
  artistName: string;
  albumArtUrl?: string;
  accessToken: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export default function SpotifyFullPlayer({
  trackId,
  trackName,
  artistName,
  albumArtUrl,
  accessToken,
  onPlayStateChange,
  className = '',
}: SpotifyFullPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load SDK script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script already exists
    if (document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
      if (window.Spotify) {
        initializePlayer();
      }
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    // Initialize when SDK is ready
    window.onSpotifyWebPlaybackSDKReady = () => {
      initializePlayer();
    };

    return () => {
      // Cleanup
      if (player) {
        player.disconnect();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [accessToken]);

  const initializePlayer = () => {
    if (!window.Spotify || !accessToken) return;

    const spotifyPlayer = new window.Spotify.Player({
      name: 'Going Home Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken);
      },
      volume: volume,
    });

    setPlayer(spotifyPlayer);

    // Ready event
    spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id);
      setDeviceId(device_id);
      playTrack();
    });

    // Not ready event
    spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
      setError('Player went offline');
    });

    // Player state changed
    spotifyPlayer.addListener('player_state_changed', (state: any) => {
      if (!state) return;

      setIsPlaying(!state.paused);
      setPosition(state.position);
      setDuration(state.duration);
      onPlayStateChange?.(!state.paused);
    });

    // Errors
    spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('Authentication error:', message);
      setError('Authentication failed');
    });

    spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
      console.error('Account error:', message);
      setError('Account error: ' + message);
    });

    spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
      console.error('Playback error:', message);
      setError('Playback error: ' + message);
    });

    // Connect
    spotifyPlayer.connect().catch((err: Error) => {
      console.error('Failed to connect player:', err);
      setError('Failed to connect player');
    });

    // Update position periodically
    intervalRef.current = setInterval(() => {
      spotifyPlayer.getCurrentState().then((state: any) => {
        if (state) {
          setPosition(state.position);
        }
      });
    }, 1000);
  };

  const playTrack = async () => {
    if (!deviceId || !accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to play track');
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Error playing track:', err);
      setError(err.message || 'Failed to play track');
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!player) return;

    try {
      const state = await player.getCurrentState();
      if (state) {
        if (state.paused) {
          await player.resume();
        } else {
          await player.pause();
        }
      }
    } catch (err) {
      console.error('Error toggling play/pause:', err);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!player) return;
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    setIsMuted(clampedVolume === 0);
    player.setVolume(clampedVolume);
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(0.5);
    } else {
      handleVolumeChange(0);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={`text-xs text-red-500 ${className}`}>
        {error}
      </div>
    );
  }

  if (!deviceId && !isLoading) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        Initializing player...
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 sm:gap-4 ${className}`}>
      {/* Track Info & Album Art */}
      <div className="flex items-center gap-3 sm:gap-4">
        {albumArtUrl && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
            <img
              src={albumArtUrl}
              alt={`${trackName} album art`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm sm:text-base text-[#2C2A29] truncate">
            {trackName}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
            {artistName}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="space-y-1">
          <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-[#1DB954] rounded-full transition-all"
              style={{ width: `${(position / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {/* Play/Pause */}
        <button
          onClick={togglePlayPause}
          disabled={isLoading || !deviceId}
          className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1DB954] text-white hover:bg-[#1ed760] active:bg-[#1ed760]/90 transition-all shadow-lg shadow-[#1DB954]/30 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors touch-target"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-20 sm:w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
          />
        </div>
      </div>
    </div>
  );
}

