'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Music, Play, X, Loader2, ExternalLink, Trash2 } from 'lucide-react';

interface SavedSong {
  id: string;
  spotify_id: string;
  name: string;
  artist: string;
  album?: string;
  preview_url?: string;
  spotify_url?: string;
  album_art_url?: string;
  duration_ms?: number;
  created_at: string;
}

export default function MyMusicPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<SavedSong[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const response = await fetch('/api/user/saved-songs');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load songs');
      }
      const data = await response.json();
      setSongs(data.songs || []);
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPreview = (song: SavedSong) => {
    // Stop any currently playing track
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (!song.preview_url) {
      alert('No preview available for this song');
      return;
    }

    // If clicking the same track, stop it
    if (playingTrackId === song.id && audioElement) {
      setPlayingTrackId(null);
      audioElement.pause();
      audioElement.currentTime = 0;
      setAudioElement(null);
      return;
    }

    // Play new track
    const audio = new Audio(song.preview_url);
    audio.play();
    setAudioElement(audio);
    setPlayingTrackId(song.id);

    // Clean up when track ends
    audio.addEventListener('ended', () => {
      setPlayingTrackId(null);
      setAudioElement(null);
    });

    // Clean up on error
    audio.addEventListener('error', () => {
      setPlayingTrackId(null);
      setAudioElement(null);
    });
  };

  const handleDelete = async (songId: string) => {
    if (!confirm('Are you sure you want to remove this song from your saved music?')) {
      return;
    }

    setDeletingId(songId);
    try {
      const response = await fetch(`/api/user/saved-songs?id=${songId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete song');
      }

      // Remove from local state
      setSongs(songs.filter(s => s.id !== songId));
      
      // Stop playback if this song was playing
      if (playingTrackId === songId && audioElement) {
        audioElement.pause();
        setPlayingTrackId(null);
        setAudioElement(null);
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <Loader2 className="w-6 h-6 animate-spin text-[#93B0C8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <header className="bg-[#FCFAF7] border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">
                My Music
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Your saved Spotify songs with preview playback
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {songs.length === 0 ? (
          <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm border border-gray-200 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-[#2C2A29] mb-2">No saved songs yet</h2>
            <p className="text-sm text-[#2C2A29] opacity-70 mb-6">
              Start adding songs from your funeral preferences or music playlist pages.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/funeral-preferences"
                className="px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
              >
                Go to Funeral Preferences
              </Link>
              <Link
                href="/dashboard/funeral-planning/playlist"
                className="px-6 py-3 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors"
              >
                Go to Music Playlist
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {songs.map((song) => (
              <div
                key={song.id}
                className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* Album Art */}
                  {song.album_art_url ? (
                    <img
                      src={song.album_art_url}
                      alt={song.album || 'Album cover'}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] flex items-center justify-center flex-shrink-0">
                      <Music className="w-8 h-8 text-white" />
                    </div>
                  )}

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#2C2A29] truncate text-base sm:text-lg">
                      {song.name}
                    </h3>
                    <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 truncate">
                      {song.artist}
                    </p>
                    {song.album && (
                      <p className="text-xs sm:text-sm text-[#2C2A29] opacity-60 truncate mt-1">
                        {song.album}
                      </p>
                    )}
                    {song.duration_ms && (
                      <p className="text-xs text-[#2C2A29] opacity-50 mt-1">
                        {formatDuration(song.duration_ms)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Play Preview */}
                    {song.preview_url && (
                      <button
                        onClick={() => handlePlayPreview(song)}
                        className={`p-3 rounded-full transition-colors touch-target ${
                          playingTrackId === song.id
                            ? 'bg-[#1DB954] text-white'
                            : 'text-[#1DB954] hover:bg-[#1DB954]/10'
                        }`}
                        title={playingTrackId === song.id ? 'Stop preview' : 'Play preview'}
                      >
                        {playingTrackId === song.id ? (
                          <X className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                    )}

                    {/* Spotify Link */}
                    {song.spotify_url && (
                      <a
                        href={song.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 text-[#1DB954] hover:bg-[#1DB954]/10 rounded-full transition-colors touch-target"
                        title="Open in Spotify"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(song.id)}
                      disabled={deletingId === song.id}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-full transition-colors touch-target disabled:opacity-50"
                      title="Remove song"
                    >
                      {deletingId === song.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Note about preview */}
                {!song.preview_url && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      No preview available for this song. Click the Spotify icon to listen on Spotify.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

