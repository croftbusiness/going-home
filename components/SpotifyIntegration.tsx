'use client';

import { useState, useEffect } from 'react';
import { Music, Search, Play, X, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';

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
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

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
      } else if (response.status === 401) {
        const data = await response.json().catch(() => ({}));
        console.error('Authentication error:', data.error || 'Unauthorized');
        setSearchResults([]);
        setIsConnected(false);
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

  const handlePlayPreview = (track: Track) => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (!track.preview_url) {
      return;
    }

    if (playingTrackId === track.id && audioElement) {
      setPlayingTrackId(null);
      audioElement.pause();
      audioElement.currentTime = 0;
      setAudioElement(null);
      return;
    }

    const audio = new Audio(track.preview_url);
    audio.play();
    setAudioElement(audio);
    setPlayingTrackId(track.id);

    audio.addEventListener('ended', () => {
      setPlayingTrackId(null);
      setAudioElement(null);
    });

    audio.addEventListener('error', () => {
      setPlayingTrackId(null);
      setAudioElement(null);
    });
  };

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);

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
      <div className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] rounded-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <Music className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base sm:text-lg">Connect to Spotify</h3>
              <p className="text-xs sm:text-sm opacity-90">Import your playlists and favorite songs</p>
            </div>
          </div>
          <button
            onClick={handleConnect}
            className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 min-h-[44px] bg-white text-[#1DB954] rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors font-medium text-base sm:text-sm"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
        <div className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-[#1DB954] flex-shrink-0" />
          <h3 className="font-semibold text-base sm:text-lg text-[#2C2A29]">Select Songs from Spotify</h3>
        </div>
        <div className="text-xs sm:text-xs text-gray-500">
          {selectedSongs.length} / {maxSongs} selected
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 sm:space-x-2 mb-4 border-b border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-2 text-sm font-medium transition-colors min-h-[44px] sm:min-h-[auto] ${
            activeTab === 'playlists'
              ? 'text-[#93B0C8] border-b-2 border-[#93B0C8]'
              : 'text-gray-500 hover:text-gray-700 active:text-gray-900'
          }`}
        >
          My Playlists
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-2 text-sm font-medium transition-colors min-h-[44px] sm:min-h-[auto] ${
            activeTab === 'search'
              ? 'text-[#93B0C8] border-b-2 border-[#93B0C8]'
              : 'text-gray-500 hover:text-gray-700 active:text-gray-900'
          }`}
        >
          Search Songs
        </button>
      </div>

      {/* Playlists Tab */}
      {activeTab === 'playlists' && (
        <div>
          {playlists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No playlists found</p>
            </div>
          ) : (
            <div className={`space-y-2 overflow-y-auto ${selectedPlaylist && playlistTracks.length > 0 ? 'max-h-32 sm:max-h-40' : 'max-h-64 sm:max-h-80'}`}>
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handlePlaylistSelect(playlist.id)}
                  className={`w-full text-left p-3 sm:p-3 min-h-[48px] rounded-lg border transition-colors active:scale-[0.98] ${
                    selectedPlaylist === playlist.id
                      ? 'border-[#93B0C8] bg-[#93B0C8]/10'
                      : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm sm:text-base text-[#2C2A29] truncate">{String(playlist.name || 'Unknown Playlist')}</div>
                  {playlist.tracks && (
                    <div className="text-xs text-gray-500 mt-1">
                      {playlist.tracks.total} tracks
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Playlist Tracks */}
          {selectedPlaylist && playlistTracks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <div className="text-sm font-medium text-[#2C2A29]">Select songs:</div>
                <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <Play className="w-3 h-3" />
                  <span className="hidden sm:inline">Click play icon to preview</span>
                  <span className="sm:hidden">Tap play to preview</span>
                </div>
              </div>
              <div className="space-y-2 max-h-[40vh] sm:max-h-64 md:max-h-80 overflow-y-auto">
                {playlistTracks.map((track) => {
                  if (!isValidTrack(track)) return null;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleSelectTrack(track)}
                      className={`w-full text-left p-3 sm:p-3 min-h-[56px] rounded-lg border transition-colors active:scale-[0.98] ${
                        isTrackSelected(track)
                          ? 'border-[#A5B99A] bg-[#A5B99A]/10'
                          : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 sm:gap-0">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-medium text-sm sm:text-base text-[#2C2A29] truncate">
                            {String(track.name || 'Unknown')}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">
                            {String(track.artist || 'Unknown Artist')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          {track.preview_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPreview(track);
                              }}
                              className={`p-2 sm:p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full transition-colors ${
                                playingTrackId === track.id
                                  ? 'bg-[#1DB954] text-white'
                                  : 'text-[#1DB954] hover:bg-[#1DB954]/10 active:bg-[#1DB954]/20'
                              }`}
                              title={playingTrackId === track.id ? 'Stop preview' : 'Play preview'}
                              aria-label={playingTrackId === track.id ? 'Stop preview' : 'Play preview'}
                            >
                              {playingTrackId === track.id ? (
                                <X className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {isTrackSelected(track) && (
                            <CheckCircle2 className="w-5 h-5 text-[#A5B99A] flex-shrink-0" />
                          )}
                          {track.id && (
                            <a
                              href={track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#1DB954] hover:text-[#1ed760] active:text-[#1ed760] p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Open in Spotify"
                              aria-label="Open in Spotify"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
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

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for songs..."
              className="flex-1 px-4 py-3 sm:py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-[auto] bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] active:bg-[#A5B99A]/90 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 font-medium"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Search</span>
            </button>
          </div>

          {searchResults.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-3 flex items-center space-x-1">
                <Play className="w-3 h-3" />
                <span>Click play icon to preview songs (30-second previews)</span>
              </div>
              <div className="space-y-2 max-h-[40vh] sm:max-h-96 overflow-y-auto">
                {searchResults.map((track) => {
                  if (!isValidTrack(track)) return null;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleSelectTrack(track)}
                      className={`w-full text-left p-3 sm:p-3 min-h-[56px] rounded-lg border transition-colors active:scale-[0.98] ${
                        isTrackSelected(track)
                          ? 'border-[#A5B99A] bg-[#A5B99A]/10'
                          : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 sm:gap-0">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-medium text-sm sm:text-base text-[#2C2A29] truncate">
                            {String(track.name || 'Unknown')}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">
                            {String(track.artist || 'Unknown Artist')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          {track.preview_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPreview(track);
                              }}
                              className={`p-2 sm:p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full transition-colors ${
                                playingTrackId === track.id
                                  ? 'bg-[#1DB954] text-white'
                                  : 'text-[#1DB954] hover:bg-[#1DB954]/10 active:bg-[#1DB954]/20'
                              }`}
                              title={playingTrackId === track.id ? 'Stop preview' : 'Play preview'}
                              aria-label={playingTrackId === track.id ? 'Stop preview' : 'Play preview'}
                            >
                              {playingTrackId === track.id ? (
                                <X className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {isTrackSelected(track) && (
                            <CheckCircle2 className="w-5 h-5 text-[#A5B99A] flex-shrink-0" />
                          )}
                          {track.id && (
                            <a
                              href={track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#1DB954] hover:text-[#1ed760] active:text-[#1ed760] p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Open in Spotify"
                              aria-label="Open in Spotify"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
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
  );
}
