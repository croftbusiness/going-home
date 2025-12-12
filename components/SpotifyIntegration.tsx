'use client';

import { useState, useEffect } from 'react';
import { Music, Search, Loader2, CheckCircle2 } from 'lucide-react';
import TrackPlayer from './music/TrackPlayer';

interface Track {
  id: string;
  name: string;
  artist: string;
  album?: string;
  preview_url?: string;
  external_urls?: {
    spotify: string;
  };
  album_art_url?: string;
  duration_ms?: number;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  images?: Array<{ url: string }>;
  tracks?: {
    total: number;
  };
}

interface SpotifyIntegrationProps {
  selectedSongs: string[];
  onSongsChange: (songs: string[]) => void;
  maxSongs?: number;
  onTrackSave?: (track: Track) => void;
}

// Helper function to safely convert track to string
const trackToString = (track: any): string | null => {
  if (!track || typeof track !== 'object') return null;
  
  // Check if it's an error object (has reason property)
  if ('reason' in track) return null;
  
  // Must have name and artist
  if (!track.name || !track.artist) return null;
  
  // Ensure name and artist are strings
  const name = typeof track.name === 'string' ? track.name : String(track.name || '');
  const artist = typeof track.artist === 'string' ? track.artist : String(track.artist || '');
  
  if (!name || !artist) return null;
  
  return `${name} - ${artist}`;
};

// Helper to validate track object
const isValidTrack = (track: any): track is Track => {
  if (!track || typeof track !== 'object') return false;
  if ('reason' in track) return false; // Error object
  if (!track.id || !track.name || !track.artist) return false;
  if (typeof track.id !== 'string' || typeof track.name !== 'string' || typeof track.artist !== 'string') return false;
  return true;
};

export default function SpotifyIntegration({ selectedSongs, onSongsChange, maxSongs = 100, onTrackSave }: SpotifyIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'playlists' | 'search'>('playlists');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/spotify/playlists');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        setPlaylists(data.playlists || []);
      } else {
        if (response.status === 401) {
          const data = await response.json().catch(() => ({}));
          if (data.error === 'Not connected to Spotify') {
            setIsConnected(false);
          }
        } else {
          setIsConnected(false);
        }
      }
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const returnUrl = window.location.pathname + window.location.search;
      const response = await fetch(`/api/spotify/auth?action=authorize&returnUrl=${encodeURIComponent(returnUrl)}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error) {
          alert(`Spotify connection error: ${data.error}\n\n${data.details || 'Please check your Spotify app configuration.'}`);
        } else {
          alert('Failed to connect to Spotify. Please try again.');
        }
        return;
      }
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        alert('Failed to get Spotify authorization URL. Please try again.');
      }
    } catch (error) {
      console.error('Failed to connect to Spotify:', error);
      alert('Failed to connect to Spotify. Please check your internet connection and try again.');
    }
  };

  const handlePlaylistSelect = async (playlistId: string) => {
    setSelectedPlaylist(playlistId);
    setLoading(true);
    try {
      const response = await fetch(`/api/spotify/playlist-tracks?playlistId=${playlistId}`);
      if (response.ok) {
        const data = await response.json();
        // Filter and validate all tracks
        const validTracks = (data.tracks || [])
          .filter(isValidTrack)
          .map((track: any) => ({
            id: String(track.id),
            name: String(track.name || 'Unknown'),
            artist: String(track.artist || 'Unknown Artist'),
            album: track.album ? String(track.album) : undefined,
            preview_url: track.preview_url ? String(track.preview_url) : undefined,
            external_urls: track.external_urls || undefined,
            album_art_url: track.album_art_url ? String(track.album_art_url) : undefined,
            duration_ms: typeof track.duration_ms === 'number' ? track.duration_ms : undefined,
          }));
        setPlaylistTracks(validTracks);
      } else if (response.status === 401) {
        const data = await response.json().catch(() => ({}));
        console.error('Authentication error:', data.error || 'Unauthorized');
        setPlaylistTracks([]);
        setIsConnected(false);
      } else {
        setPlaylistTracks([]);
      }
    } catch (error) {
      console.error('Failed to load playlist tracks:', error);
      setPlaylistTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        // Filter and validate all tracks
        const validTracks = (data.tracks || [])
          .filter(isValidTrack)
          .map((track: any) => ({
            id: String(track.id),
            name: String(track.name || 'Unknown'),
            artist: String(track.artist || 'Unknown Artist'),
            album: track.album ? String(track.album) : undefined,
            preview_url: track.preview_url ? String(track.preview_url) : undefined,
            external_urls: track.external_urls || undefined,
            album_art_url: track.album_art_url ? String(track.album_art_url) : undefined,
            duration_ms: typeof track.duration_ms === 'number' ? track.duration_ms : undefined,
          }));
        setSearchResults(validTracks);
      } else if (response.status === 503) {
        const data = await response.json().catch(() => ({}));
        console.error('Service unavailable:', data.error || 'Spotify service unavailable');
        setSearchResults([]);
        // Show error message but don't change connection status
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectTrack = async (track: Track) => {
    if (!isValidTrack(track)) {
      console.error('Invalid track selected');
      return;
    }
    
    const songString = trackToString(track);
    if (!songString) {
      console.error('Could not convert track to string');
      return;
    }
    
    if (selectedSongs.includes(songString)) {
      // Remove if already selected
      const newSongs = selectedSongs.filter(s => s !== songString);
      onSongsChange(newSongs);
    } else {
      // Add if not at max
      if (selectedSongs.length < maxSongs) {
        const newSongs = [...selectedSongs, songString];
        onSongsChange(newSongs);
        // Save full track data if callback provided
        if (onTrackSave) {
          onTrackSave(track);
        }
      }
    }
  };

  const isTrackSelected = (track: Track) => {
    if (!isValidTrack(track)) return false;
    const songString = trackToString(track);
    return songString ? selectedSongs.includes(songString) : false;
  };


  if (loading && !isConnected) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#93B0C8]" />
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1DB954] via-[#1ed760] to-[#1DB954] rounded-2xl p-6 sm:p-8 text-white shadow-2xl shadow-[#1DB954]/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg animate-pulse" />
              <div className="relative p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Music className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 drop-shadow-lg" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg sm:text-xl mb-1 drop-shadow-md">Connect to Spotify</h3>
              <p className="text-sm sm:text-base opacity-95">Import your playlists and favorite songs</p>
            </div>
          </div>
          <button
            onClick={handleConnect}
            className="w-full sm:w-auto px-8 py-4 sm:px-6 sm:py-3 min-h-[52px] bg-white text-[#1DB954] rounded-xl hover:bg-gray-50 active:scale-95 transition-all font-bold text-base sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-[#FAF9F7] to-white rounded-2xl border border-gray-200/40 shadow-xl shadow-gray-200/20 backdrop-blur-sm flex flex-col max-h-[85vh] w-full box-border" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 border-b border-gray-200/40 w-full box-border" style={{ maxWidth: '100%' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 w-full box-border" style={{ maxWidth: '100%' }}>
          <div className="flex items-center space-x-4 min-w-0 flex-shrink" style={{ maxWidth: 'calc(100% - 120px)' }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-xl blur-md opacity-30 animate-pulse" />
              <div className="relative p-3 bg-gradient-to-br from-[#1DB954]/20 to-[#1ed760]/20 rounded-xl border border-[#1DB954]/30">
                <Music className="w-6 h-6 sm:w-7 sm:h-7 text-[#1DB954] flex-shrink-0" />
              </div>
            </div>
            <div className="min-w-0 overflow-hidden" style={{ maxWidth: '100%' }}>
              <h3 className="font-bold text-lg sm:text-xl text-[#2C2A29] bg-gradient-to-r from-[#2C2A29] to-[#2C2A29]/80 bg-clip-text truncate">
                Select Songs from Spotify
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">Browse your playlists or search for songs</p>
            </div>
          </div>
          <div className="px-3 py-2 bg-gradient-to-r from-[#A5B99A]/15 to-[#93B0C8]/15 rounded-full text-xs font-semibold text-[#2C2A29] border border-[#A5B99A]/30 shadow-sm whitespace-nowrap flex-shrink-0">
            {selectedSongs.length} / {maxSongs}
          </div>
        </div>
      </div>

      {/* Tabs - Fixed at top */}
      <div className="flex-shrink-0 flex space-x-2 border-b-2 border-gray-200/40 px-4 sm:px-6 lg:px-8 w-full box-border" style={{ maxWidth: '100%' }}>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-semibold transition-all duration-200 min-h-[48px] sm:min-h-[auto] relative ${
            activeTab === 'playlists'
              ? 'text-[#93B0C8]'
              : 'text-gray-500 hover:text-gray-700 active:text-gray-900'
          }`}
        >
          <span className="relative z-10">My Playlists</span>
          {activeTab === 'playlists' && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#93B0C8] to-[#A5B99A] rounded-t-full" />
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#93B0C8] rounded-t-full opacity-50 blur-sm" />
            </>
          )}
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-semibold transition-all duration-200 min-h-[48px] sm:min-h-[auto] relative ${
            activeTab === 'search'
              ? 'text-[#93B0C8]'
              : 'text-gray-500 hover:text-gray-700 active:text-gray-900'
          }`}
        >
          <span className="relative z-10">Search Songs</span>
          {activeTab === 'search' && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#93B0C8] to-[#A5B99A] rounded-t-full" />
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#93B0C8] rounded-t-full opacity-50 blur-sm" />
            </>
          )}
        </button>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full box-border" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <div className="h-full flex flex-col">
            {playlists.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No playlists found</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 w-full box-border" style={{ maxWidth: '100%' }}>
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handlePlaylistSelect(playlist.id)}
                      className={`group w-full max-w-full text-left p-4 sm:p-5 min-h-[60px] rounded-xl border-2 transition-all duration-200 active:scale-[0.97] ${
                        selectedPlaylist === playlist.id
                          ? 'border-[#93B0C8] bg-gradient-to-r from-[#93B0C8]/15 via-[#A5B99A]/10 to-[#93B0C8]/15 shadow-lg shadow-[#93B0C8]/20 scale-[1.02]'
                          : 'border-gray-200/60 hover:border-[#93B0C8]/40 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-50/50 hover:shadow-md active:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-sm sm:text-base text-[#2C2A29] truncate mb-1">{String(playlist.name || 'Unknown Playlist')}</div>
                      {playlist.tracks && (
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">
                          {playlist.tracks.total} {playlist.tracks.total === 1 ? 'track' : 'tracks'}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Playlist Tracks */}
                {selectedPlaylist && playlistTracks.length > 0 && (
                  <div className="pt-6 border-t-2 border-gray-200/40">
                    <div className="mb-5">
                      <div className="text-base sm:text-lg font-bold text-[#2C2A29] bg-gradient-to-r from-[#2C2A29] to-[#2C2A29]/80 bg-clip-text">
                        Select songs from this playlist
                      </div>
                    </div>
                    <div className="space-y-3 w-full box-border" style={{ maxWidth: '100%' }}>
                      {playlistTracks.map((track) => {
                        if (!isValidTrack(track)) return null;
                        return (
                          <button
                            key={track.id}
                            onClick={() => handleSelectTrack(track)}
                            className={`group w-full max-w-full text-left p-3 sm:p-5 min-h-[72px] rounded-xl border-2 transition-all duration-200 active:scale-[0.97] overflow-hidden ${
                              isTrackSelected(track)
                                ? 'border-[#A5B99A] bg-gradient-to-r from-[#A5B99A]/20 via-[#A5B99A]/10 to-[#A5B99A]/20 shadow-lg shadow-[#A5B99A]/20'
                                : 'border-gray-200/60 hover:border-[#A5B99A]/40 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-50/50 hover:shadow-md active:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 sm:gap-5 min-w-0 max-w-full">
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="font-semibold text-sm sm:text-base text-[#2C2A29] truncate mb-1">
                                  {String(track.name || 'Unknown')}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 truncate font-medium">
                                  {String(track.artist || 'Unknown Artist')}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="relative w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] flex-shrink-0"
                                >
                                  <div className="absolute inset-0 w-full h-full max-w-full max-h-full overflow-hidden rounded-full">
                                    <TrackPlayer
                                      trackId={track.id}
                                      trackName={String(track.name || 'Unknown')}
                                      artistName={String(track.artist || 'Unknown Artist')}
                                      albumArtUrl={track.album_art_url}
                                      spotifyUrl={track.external_urls?.spotify}
                                      className="w-full h-full max-w-full max-h-full"
                                    />
                                  </div>
                                </div>
                                {isTrackSelected(track) && (
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-[#A5B99A]/30 rounded-full blur-md animate-pulse" />
                                    <CheckCircle2 className="relative w-6 h-6 sm:w-7 sm:h-7 text-[#A5B99A] flex-shrink-0 drop-shadow-md" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-shrink-0">
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-xl blur-md opacity-50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for songs..."
                  className="relative w-full px-5 py-4 sm:py-3 text-base border-2 border-gray-200/60 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] bg-white/80 backdrop-blur-sm transition-all shadow-sm hover:shadow-md"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="px-6 py-4 sm:px-6 sm:py-3 min-h-[52px] sm:min-h-[auto] bg-gradient-to-r from-[#93B0C8] to-[#A5B99A] text-white rounded-xl hover:from-[#A5B99A] hover:to-[#93B0C8] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-bold text-base shadow-lg hover:shadow-xl hover:scale-105"
              >
                {searching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>Search</span>
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="flex-1 min-h-0">
                <div className="space-y-3 w-full box-border" style={{ maxWidth: '100%' }}>
                  {searchResults.map((track) => {
                    if (!isValidTrack(track)) return null;
                    return (
                      <button
                        key={track.id}
                        onClick={() => handleSelectTrack(track)}
                        className={`group w-full max-w-full text-left p-3 sm:p-5 min-h-[72px] rounded-xl border-2 transition-all duration-200 active:scale-[0.97] overflow-hidden ${
                          isTrackSelected(track)
                            ? 'border-[#A5B99A] bg-gradient-to-r from-[#A5B99A]/20 via-[#A5B99A]/10 to-[#A5B99A]/20 shadow-lg shadow-[#A5B99A]/20'
                            : 'border-gray-200/60 hover:border-[#A5B99A]/40 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-50/50 hover:shadow-md active:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 sm:gap-5 min-w-0 max-w-full">
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-semibold text-sm sm:text-base text-[#2C2A29] truncate mb-1">
                              {String(track.name || 'Unknown')}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 truncate font-medium">
                              {String(track.artist || 'Unknown Artist')}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="relative w-[56px] h-[56px] flex-shrink-0"
                            >
                              <div className="absolute inset-0 w-full h-full max-w-full max-h-full overflow-hidden rounded-full">
                                <TrackPlayer
                                  trackId={track.id}
                                  trackName={String(track.name || 'Unknown')}
                                  artistName={String(track.artist || 'Unknown Artist')}
                                  albumArtUrl={track.album_art_url}
                                  spotifyUrl={track.external_urls?.spotify}
                                  className="w-full h-full max-w-full max-h-full"
                                />
                              </div>
                            </div>
                            {isTrackSelected(track) && (
                              <div className="relative">
                                <div className="absolute inset-0 bg-[#A5B99A]/30 rounded-full blur-md animate-pulse" />
                                <CheckCircle2 className="relative w-6 h-6 sm:w-7 sm:h-7 text-[#A5B99A] flex-shrink-0 drop-shadow-md" />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
