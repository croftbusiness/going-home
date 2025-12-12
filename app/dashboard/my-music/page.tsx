'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Music, Loader2, Trash2 } from 'lucide-react';
import TrackPlayer from '@/components/music/TrackPlayer';

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
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Cleanup audio on unmount

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
                Your saved Spotify songs - Premium users can play in-app
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
                <div className="flex items-center gap-4 sm:gap-5">
                  {/* Album Art - Enhanced */}
                  {song.album_art_url ? (
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/20 to-[#1ed760]/20 rounded-xl blur-lg group-hover:blur-xl transition-all" />
                      <img
                        src={song.album_art_url}
                        alt={song.album || 'Album cover'}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shadow-lg border-2 border-white/50"
                      />
                    </div>
                  ) : (
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-xl blur-lg opacity-50" />
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] flex items-center justify-center shadow-lg border-2 border-white/50">
                        <Music className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  )}

                  {/* Song Info - Enhanced */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#2C2A29] truncate text-base sm:text-lg mb-1 bg-gradient-to-r from-[#2C2A29] to-[#2C2A29]/80 bg-clip-text">
                      {song.name}
                    </h3>
                    <p className="text-sm sm:text-base text-[#2C2A29] opacity-75 truncate font-medium mb-1">
                      {song.artist}
                    </p>
                    {song.album && (
                      <p className="text-xs sm:text-sm text-gray-500 truncate font-medium mb-1">
                        {song.album}
                      </p>
                    )}
                    {song.duration_ms && (
                      <p className="text-xs text-gray-400 font-semibold">
                        {formatDuration(song.duration_ms)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                    {/* Track Player */}
                    <TrackPlayer
                      trackId={song.spotify_id}
                      trackName={song.name}
                      artistName={song.artist}
                      albumArtUrl={song.album_art_url}
                      spotifyUrl={song.spotify_url}
                    />

                    {/* Delete - Enhanced */}
                    <button
                      onClick={() => handleDelete(song.id)}
                      disabled={deletingId === song.id}
                      className="relative p-3 min-w-[52px] min-h-[52px] sm:min-w-[56px] sm:min-h-[56px] flex items-center justify-center text-red-600 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100/50 active:scale-95 rounded-full transition-all duration-200 disabled:opacity-50 touch-target border-2 border-red-200/40 hover:border-red-300/60 hover:shadow-md"
                      title="Remove song"
                      aria-label="Remove song"
                    >
                      {deletingId === song.id ? (
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

