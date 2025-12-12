'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Music, Loader2, Plus, X, Heart, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import SpotifyIntegration from '@/components/SpotifyIntegration';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function PlaylistPageContent() {
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
    
    // Add global error handler
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      if (mountedRef.current) {
        setError(`An error occurred: ${event.error?.message || 'Unknown error'}`);
      }
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      if (mountedRef.current) {
        setError(`An error occurred: ${event.reason?.message || 'Unknown error'}`);
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    loadPlaylist();
    
    return () => {
      mountedRef.current = false;
      setMounted(false);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
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
          // Ensure all songs are strings - filter out any objects or invalid values
          const validSongs = data.playlist.songs
            .map((song: any) => {
              // If it's already a string, use it
              if (typeof song === 'string' && song.trim()) {
                return song.trim();
              }
              // If it's an object with name and artist, convert to string
              if (song && typeof song === 'object' && song.name && song.artist) {
                return `${String(song.name)} - ${String(song.artist)}`;
              }
              // Skip invalid entries
              return null;
            })
            .filter((song: string | null): song is string => song !== null && typeof song === 'string');
          setSongs(validSongs);
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
                const songStrings = savedData.songs
                  .map((song: any) => {
                    // Ensure we only create strings from valid song objects
                    if (song && typeof song === 'object' && song.name && song.artist) {
                      const name = typeof song.name === 'string' ? song.name : String(song.name || 'Unknown');
                      const artist = typeof song.artist === 'string' ? song.artist : String(song.artist || 'Unknown');
                      return `${name} - ${artist}`;
                    }
                    return null;
                  })
                  .filter((str: string | null): str is string => str !== null && typeof str === 'string');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7]">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] rounded-full blur-xl opacity-20 animate-pulse" />
            <Loader2 className="relative w-8 h-8 animate-spin text-[#93B0C8]" />
          </div>
          <p className="mt-4 text-sm text-[#2C2A29] opacity-70">Loading your playlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7]" style={{ overflowX: 'hidden' }}>
      {/* Premium Header with Backdrop Blur */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-20 shadow-sm shadow-gray-200/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/dashboard/funeral-planning"
              className="p-2.5 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gradient-to-br hover:from-[#A5B99A]/10 hover:to-[#93B0C8]/10 rounded-xl transition-all duration-200 flex-shrink-0 group"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29] group-hover:scale-110 transition-transform" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-xl blur-md opacity-30 animate-pulse" />
                  <div className="relative p-2.5 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-xl border border-[#A5B99A]/30">
                    <Music className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2C2A29] bg-gradient-to-r from-[#2C2A29] to-[#2C2A29]/80 bg-clip-text">
                  Music Playlist
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 ml-[52px] sm:ml-[60px]">
                Curate music for your ceremony, slideshow, and reception
              </p>
            </div>
          </div>
        </div>
      </header>

      <main 
        className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10" 
        style={{ maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}
      >
        {/* Premium Intro Card */}
        <div className="relative bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-gray-200/30 border border-gray-100/50 mb-6 sm:mb-8 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#A5B99A]/5 to-[#93B0C8]/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#93B0C8]/5 to-[#A5B99A]/5 rounded-full blur-3xl -ml-24 -mb-24" />
          
          <div className="relative flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-2xl blur-lg opacity-40 animate-pulse" />
              <div className="relative p-4 sm:p-5 bg-gradient-to-br from-[#A5B99A]/20 via-[#A5B99A]/15 to-[#93B0C8]/20 rounded-2xl border border-[#A5B99A]/30 shadow-lg">
                <Music className="w-6 h-6 sm:w-8 sm:h-8 text-[#A5B99A]" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2C2A29] mb-3 bg-gradient-to-r from-[#2C2A29] to-[#2C2A29]/80 bg-clip-text">
                Create your perfect soundtrack
              </h2>
              <p className="text-sm sm:text-base text-[#2C2A29] opacity-75 leading-relaxed mb-4 sm:mb-6">
                Add your favorite songs from Spotify or enter them manually to create your personalized music playlist 
                for your ceremony, photo slideshow, and reception gathering.
              </p>
              
              {/* Why This Helps Loved Ones - Premium Card */}
              <div className="relative mt-4 sm:mt-6 p-4 sm:p-5 bg-gradient-to-br from-[#A5B99A]/10 via-[#A5B99A]/8 to-[#93B0C8]/10 rounded-xl border border-[#A5B99A]/20 shadow-md backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-xl" />
                <div className="relative flex items-start space-x-3 sm:space-x-4">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-[#A5B99A]/20 rounded-full blur-md" />
                    <div className="relative p-2 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-full">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#A5B99A]" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-[#2C2A29] mb-2">
                      Why This Helps Your Loved Ones
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2C2A29] opacity-80 leading-relaxed">
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

        {/* Premium Error/Success Messages */}
        {error && (
          <div className="relative mb-6 bg-gradient-to-r from-red-50 to-red-50/50 border-l-4 border-red-500 text-red-800 px-4 sm:px-5 py-3 sm:py-4 rounded-xl shadow-lg shadow-red-100/50 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base font-medium flex-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="relative mb-6 bg-gradient-to-r from-green-50 to-emerald-50/50 border-l-4 border-green-500 text-green-800 px-4 sm:px-5 py-3 sm:py-4 rounded-xl shadow-lg shadow-green-100/50 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm sm:text-base font-medium">Playlist saved successfully!</p>
            </div>
          </div>
        )}

        {/* Premium Form Card */}
        <div className="relative bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-gray-200/30 border border-gray-100/50 mb-6 sm:mb-8 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#A5B99A]/3 to-[#93B0C8]/3 rounded-full blur-3xl -mr-48 -mt-48" />
          
          <div className="relative space-y-6 sm:space-y-8">
            {/* Favorite Songs */}
            <div>
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#A5B99A]/30 to-transparent" />
                <label className="text-base sm:text-lg font-bold text-[#2C2A29] whitespace-nowrap">
                  Your Music Playlist
                </label>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#A5B99A]/30 to-transparent" />
              </div>
              
              {/* Spotify Integration - FIXED WRAPPER */}
              <div 
                className="mb-6 w-full rounded-xl" 
                style={{ 
                  maxWidth: '100%', 
                  overflowX: 'hidden',
                  boxSizing: 'border-box'
                }}
              >
                {mounted && (
                  <SpotifyIntegration
                    selectedSongs={Array.isArray(songs) ? songs : []}
                    onSongsChange={(newSongs) => {
                      try {
                        if (mounted && Array.isArray(newSongs)) {
                          // Ensure all songs are strings - never allow objects
                          const validSongs = newSongs
                            .map((song: any) => {
                              if (typeof song === 'string' && song.trim()) {
                                return song.trim();
                              }
                              // If it's an object, convert to string
                              if (song && typeof song === 'object') {
                                if (song.name && song.artist) {
                                  return `${String(song.name)} - ${String(song.artist)}`;
                                }
                                // Skip error objects or invalid objects
                                return null;
                              }
                              return null;
                            })
                            .filter((song: string | null): song is string => song !== null && typeof song === 'string');
                          setSongs(validSongs);
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

              {/* Manual Entry - Premium Design */}
              <div className="relative border-t-2 border-gradient-to-r from-[#A5B99A]/20 via-[#93B0C8]/20 to-[#A5B99A]/20 pt-6 mt-6">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="px-4 py-1 bg-white rounded-full border-2 border-[#A5B99A]/30 shadow-sm">
                    <p className="text-xs sm:text-sm font-semibold text-[#2C2A29] opacity-70">
                      Or add songs manually
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#A5B99A]/10 to-[#93B0C8]/10 rounded-xl blur-sm" />
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
                      placeholder="e.g., Amazing Grace - Traditional..."
                      className="relative w-full px-4 sm:px-5 py-3.5 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] bg-white/80 backdrop-blur-sm transition-all shadow-sm hover:shadow-md"
                    />
                  </div>
                  <button
                    onClick={handleAddSong}
                    className="relative px-5 sm:px-6 py-3.5 sm:py-4 min-h-[52px] sm:min-h-[auto] bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:from-[#93B0C8] hover:to-[#A5B99A] active:scale-95 transition-all flex items-center justify-center shadow-lg hover:shadow-xl font-medium"
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                {songs.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-4">
                    {songs.map((song, idx) => {
                      // Double-check that song is a string before rendering
                      const songString = typeof song === 'string' ? song : String(song || 'Unknown');
                      return (
                        <span
                          key={idx}
                          className="group inline-flex items-center px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#A5B99A]/10 to-[#93B0C8]/10 text-[#2C2A29] rounded-full text-xs sm:text-sm max-w-full border border-[#A5B99A]/20 shadow-sm hover:shadow-md transition-all"
                        >
                          <span className="truncate max-w-[180px] sm:max-w-[250px] md:max-w-none font-medium">{songString}</span>
                          <button
                            onClick={() => handleRemoveSong(idx)}
                            className="ml-2 min-w-[24px] min-h-[24px] flex items-center justify-center hover:text-red-600 active:text-red-700 flex-shrink-0 transition-colors rounded-full hover:bg-red-50 p-0.5"
                            aria-label="Remove song"
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Premium Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || songs.length === 0}
              className="relative w-full px-6 sm:px-8 py-4 sm:py-5 min-h-[56px] sm:min-h-[64px] text-base sm:text-lg bg-gradient-to-r from-[#A5B99A] via-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:from-[#93B0C8] hover:via-[#A5B99A] hover:to-[#93B0C8] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold shadow-xl hover:shadow-2xl hover:shadow-[#A5B99A]/30 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {saving ? (
                <>
                  <Loader2 className="relative w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  <span className="relative">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="relative w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="relative">Save Playlist</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Premium Saved Songs List */}
        {songs.length > 0 && (
          <div className="relative bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-gray-200/30 border border-gray-100/50 overflow-hidden">
            {/* Decorative background */}
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#93B0C8]/3 to-[#A5B99A]/3 rounded-full blur-3xl -ml-40 -mb-40" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-xl blur-md opacity-30" />
                    <div className="relative p-2.5 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-xl border border-[#A5B99A]/30">
                      <Music className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C2A29]">
                      Your Playlist
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2C2A29] opacity-60 mt-0.5">
                      {songs.length} {songs.length === 1 ? 'song' : 'songs'} selected
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2.5 sm:space-y-3">
                {songs.map((song, idx) => {
                  // Double-check that song is a string before rendering
                  const songString = typeof song === 'string' ? song : String(song || 'Unknown');
                  return (
                    <div 
                      key={idx} 
                      className="group relative p-4 sm:p-5 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 rounded-xl flex items-center justify-between gap-4 border border-gray-100/50 hover:border-[#A5B99A]/30 hover:shadow-md transition-all backdrop-blur-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#A5B99A]/0 via-[#A5B99A]/5 to-[#93B0C8]/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 flex items-center justify-center border border-[#A5B99A]/20">
                          <span className="text-xs sm:text-sm font-bold text-[#A5B99A]">{idx + 1}</span>
                        </div>
                        <span className="text-sm sm:text-base text-[#2C2A29] flex-1 min-w-0 truncate font-medium">
                          {songString}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSong(idx)}
                        className="relative z-10 text-gray-400 hover:text-red-600 active:text-red-700 min-w-[40px] min-h-[40px] flex items-center justify-center flex-shrink-0 rounded-lg hover:bg-red-50 transition-all group/btn"
                        aria-label="Remove song"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PlaylistPage() {
  return (
    <ErrorBoundary>
      <PlaylistPageContent />
    </ErrorBoundary>
  );
}



