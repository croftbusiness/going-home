'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Music, Loader2, Plus, X, Heart, Save } from 'lucide-react';
import SpotifyIntegration from '@/components/SpotifyIntegration';

export default function PlaylistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [songs, setSongs] = useState<string[]>([]);
  const [currentSong, setCurrentSong] = useState('');
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setMounted(true);
    loadPlaylist();
    
    return () => {
      mountedRef.current = false;
      setMounted(false);
    };
  }, []);

  const loadPlaylist = async () => {
    try {
      // Load playlist from funeral_playlists table
      const response = await fetch('/api/user/playlist');
      
      if (!mountedRef.current) return;
      
      if (response.status === 401) {
        // Redirect to login if unauthorized
        router.push('/auth/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        if (!mountedRef.current) return;
        
        if (data.playlist && data.playlist.songs && Array.isArray(data.playlist.songs)) {
          setSongs(data.playlist.songs);
        } else {
          // Fallback: Load from saved_songs if no playlist exists
          try {
            const savedResponse = await fetch('/api/user/saved-songs');
            
            if (!mountedRef.current) return;
            
            if (savedResponse.status === 401) {
              router.push('/auth/login');
              return;
            }
            
            if (savedResponse.ok) {
              const savedData = await savedResponse.json();
              if (!mountedRef.current) return;
              
              if (savedData.songs && Array.isArray(savedData.songs)) {
                const songStrings = savedData.songs.map((song: any) => {
                  if (song && typeof song === 'object' && song.name && song.artist) {
                    return `${song.name} - ${song.artist}`;
                  }
                  return null;
                }).filter((str: string | null) => str !== null) as string[];
                setSongs(songStrings);
              }
            }
          } catch (savedError) {
            console.error('Error loading saved songs:', savedError);
            // Continue without saved songs - not critical
          }
        }
      } else {
        // Handle other error responses
        const errorData = await response.json().catch(() => ({ error: 'Failed to load playlist' }));
        console.error('Failed to load playlist:', errorData.error);
        if (mountedRef.current) {
          setError('Failed to load playlist. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      if (mountedRef.current) {
        setError('Failed to load playlist. Please refresh the page.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (songs.length === 0) {
      setError('Please add at least one song to your playlist');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);
    
    try {
      const response = await fetch('/api/user/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs }),
      });

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save playlist');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save playlist');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSong = () => {
    if (currentSong.trim() && Array.isArray(songs) && !songs.includes(currentSong.trim())) {
      setSongs([...songs, currentSong.trim()]);
      setCurrentSong('');
    }
  };

  const handleRemoveSong = (index: number) => {
    if (Array.isArray(songs) && index >= 0 && index < songs.length) {
      setSongs(songs.filter((_, i) => i !== index));
    }
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
              href="/dashboard/funeral-planning"
              className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">
                Music Playlist
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Curate music for your ceremony, slideshow, and reception
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Intro */}
        <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl flex-shrink-0">
              <Music className="w-6 h-6 text-[#A5B99A]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#2C2A29] mb-2">
                Create your perfect soundtrack
              </h2>
              <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 leading-relaxed mb-4">
                Add your favorite songs from Spotify or enter them manually to create your personalized music playlist 
                for your ceremony, photo slideshow, and reception gathering.
              </p>
              
              {/* Why This Helps Loved Ones */}
              <div className="mt-4 p-4 bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10 rounded-lg border border-[#A5B99A]/20">
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-[#A5B99A] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#2C2A29] mb-1">
                      Why This Helps Your Loved Ones
                    </h3>
                    <p className="text-xs text-[#2C2A29] opacity-80 leading-relaxed">
                      Music has the power to comfort, celebrate, and connect. By choosing your songs now, you're 
                      ensuring the music played honors your memory exactly as you'd want. Your family won't have 
                      to guess what songs were meaningful to you or worry about choosing the wrong music. Every 
                      song becomes a tribute to your life and a source of comfort for those who gather to remember you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">{error}</div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
            Playlist saved successfully!
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200 mb-6">
          <div className="space-y-6">
            {/* Favorite Songs */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-3">
                Your Music Playlist
              </label>
              
              {/* Spotify Integration */}
              <div className="mb-4">
                {mounted && (
                  <SpotifyIntegration
                    selectedSongs={Array.isArray(songs) ? songs : []}
                    onSongsChange={(newSongs) => {
                      try {
                        if (mounted && Array.isArray(newSongs)) {
                          setSongs(newSongs);
                        }
                      } catch (error) {
                        console.error('Error updating songs:', error);
                      }
                    }}
                    maxSongs={100}
                    onTrackSave={async (track) => {
                      // Save full track data to saved_songs
                      try {
                        if (!track || !track.id || !track.name || !track.artist) {
                          console.warn('Invalid track data, skipping save');
                          return;
                        }
                        
                        const response = await fetch('/api/user/saved-songs', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            spotify_id: track.id,
                            name: track.name,
                            artist: track.artist,
                            album: track.album || null,
                            preview_url: track.preview_url || null,
                            spotify_url: track.external_urls?.spotify || null,
                            album_art_url: track.album_art_url || null,
                            duration_ms: track.duration_ms || null,
                          }),
                        });
                        
                        if (!response.ok && response.status !== 409) {
                          // 409 is OK - song already exists
                          console.error('Failed to save track:', response.status);
                        }
                      } catch (error) {
                        console.error('Failed to save track:', error);
                        // Don't throw - this is a non-critical operation
                      }
                    }}
                  />
                )}
              </div>

              {/* Manual Entry */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-[#2C2A29] opacity-70 mb-3">
                  Or add songs manually:
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentSong}
                    onChange={(e) => setCurrentSong(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSong();
                      }
                    }}
                    placeholder="e.g., Amazing Grace - Traditional, Over the Rainbow - Judy Garland..."
                    className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                  />
                  <button
                    onClick={handleAddSong}
                    className="px-4 py-3 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors touch-target"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {songs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {songs.map((song, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 bg-[#A5B99A] bg-opacity-10 text-[#2C2A29] rounded-full text-sm"
                      >
                        {song}
                        <button
                          onClick={() => handleRemoveSong(idx)}
                          className="ml-2 hover:text-red-600 touch-target"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || songs.length === 0}
              className="w-full px-6 py-4 min-h-[56px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Playlist
                </>
              )}
            </button>
          </div>
        </div>

        {/* Saved Songs List */}
        {songs.length > 0 && (
          <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Your Playlist ({songs.length} songs)</h3>
            <div className="space-y-2">
              {songs.map((song, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="text-[#2C2A29]">{song}</span>
                  <button
                    onClick={() => handleRemoveSong(idx)}
                    className="text-red-600 hover:text-red-800 touch-target"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}



