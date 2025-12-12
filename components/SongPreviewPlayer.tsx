'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';

interface SongPreviewPlayerProps {
  previewUrl: string | null | undefined;
  trackId?: string; // Optional: for tracking which track is playing
  onPlayStateChange?: (isPlaying: boolean, trackId?: string) => void; // Callback for global audio management
  className?: string;
}

export default function SongPreviewPlayer({
  previewUrl,
  trackId,
  onPlayStateChange,
  className = '',
}: SongPreviewPlayerProps) {
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
      // Don't pause if this is the track that triggered the pause
      if (customEvent.detail?.except === trackId) {
        return;
      }
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        onPlayStateChange?.(false, trackId);
      }
    };

    // Listen for custom pause event
    window.addEventListener('pauseAllAudio', handleExternalPause);
    return () => {
      window.removeEventListener('pauseAllAudio', handleExternalPause);
    };
  }, [isPlaying, trackId, onPlayStateChange]);

  // No preview available
  if (!previewUrl) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        This track does not have a preview available.
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        Unable to load preview.
      </div>
    );
  }

  // Player UI - Enhanced Premium Design
  return (
    <button
      onClick={togglePlay}
      disabled={isLoading}
      className={`relative inline-flex items-center justify-center min-w-[52px] min-h-[52px] sm:min-w-[56px] sm:min-h-[56px] p-3 rounded-full transition-all duration-200 touch-target ${
        isPlaying
          ? 'bg-gradient-to-br from-[#1DB954] to-[#1ed760] text-white hover:from-[#1ed760] hover:to-[#1DB954] shadow-lg shadow-[#1DB954]/30 hover:shadow-xl hover:shadow-[#1DB954]/40 hover:scale-110 active:scale-105'
          : 'text-[#1DB954] hover:bg-gradient-to-br hover:from-[#1DB954]/10 hover:to-[#1ed760]/10 active:bg-[#1DB954]/20 border-2 border-[#1DB954]/30 hover:border-[#1DB954]/50 hover:shadow-md'
      } ${isLoading ? 'opacity-70 cursor-wait' : ''} ${className}`}
      title={isPlaying ? 'Pause preview' : 'Play preview (30 seconds)'}
      aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
    >
      {isPlaying && (
        <div className="absolute inset-0 bg-[#1DB954] rounded-full blur-md opacity-50 animate-pulse" />
      )}
      <span className="relative z-10">
        {isLoading ? (
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <Play className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </span>
    </button>
  );
}

