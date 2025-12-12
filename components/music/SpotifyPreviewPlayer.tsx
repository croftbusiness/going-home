'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';

interface SpotifyPreviewPlayerProps {
  previewUrl: string;
  trackId?: string;
  onPlayStateChange?: (isPlaying: boolean, trackId?: string) => void;
  className?: string;
}

export default function SpotifyPreviewPlayer({
  previewUrl,
  trackId,
  onPlayStateChange,
  className = '',
}: SpotifyPreviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle play/pause
  const togglePlay = async () => {
    if (!previewUrl || error) return;

    // Pause all other audio instances globally
    window.dispatchEvent(new CustomEvent('pauseAllAudio', { detail: { except: trackId } }));

    // If this audio element exists and is playing, pause it
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        onPlayStateChange?.(false, trackId);
        return;
      }
    } else {
      // Create new audio element
      const audio = new Audio(previewUrl);
      audio.preload = 'none';
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('loadstart', () => {
        setIsLoading(true);
        setError(false);
      });

      audio.addEventListener('canplay', () => {
        setIsLoading(false);
      });

      audio.addEventListener('play', () => {
        setIsPlaying(true);
        setIsLoading(false);
        onPlayStateChange?.(true, trackId);
      });

      audio.addEventListener('pause', () => {
        setIsPlaying(false);
        onPlayStateChange?.(false, trackId);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        audioRef.current = null;
        onPlayStateChange?.(false, trackId);
      });

      audio.addEventListener('error', () => {
        setIsLoading(false);
        setIsPlaying(false);
        setError(true);
        audioRef.current = null;
        onPlayStateChange?.(false, trackId);
      });
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setIsLoading(true);
        await audioRef.current.play();
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsLoading(false);
      setError(true);
    }
  };

  // Handle external pause (when another track starts playing)
  useEffect(() => {
    const handleExternalPause = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.except === trackId) {
        return;
      }
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        onPlayStateChange?.(false, trackId);
      }
    };

    window.addEventListener('pauseAllAudio', handleExternalPause);
    return () => {
      window.removeEventListener('pauseAllAudio', handleExternalPause);
    };
  }, [isPlaying, trackId, onPlayStateChange]);

  // Error state
  if (error) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        Unable to load preview.
      </div>
    );
  }

  // Player UI - Premium minimal design
  return (
    <button
      onClick={togglePlay}
      disabled={isLoading}
      className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] p-2.5 sm:p-3 rounded-full transition-all touch-target ${
        isPlaying
          ? 'bg-[#1DB954] text-white hover:bg-[#1ed760] shadow-lg shadow-[#1DB954]/30'
          : 'text-[#1DB954] hover:bg-[#1DB954]/10 active:bg-[#1DB954]/20 border border-[#1DB954]/20'
      } ${isLoading ? 'opacity-70 cursor-wait' : ''} ${className}`}
      title={isPlaying ? 'Pause preview' : 'Play preview (30 seconds)'}
      aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <Play className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
    </button>
  );
}

