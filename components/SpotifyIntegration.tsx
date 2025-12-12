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
  onTrackSave?: (track: Track) => void; // Optional callback to save full track data
}

export default function SpotifyIntegration({ selectedSongs, onSongsChange, maxSongs = 3, onTrackSave }: SpotifyIntegrationProps) {
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
        // Only set disconnected if it's not an auth error (401)
        // Auth errors might be temporary session issues, don't treat as disconnected
        if (response.status === 401) {
          // Check if it's an auth error (user not logged in) vs not connected to Spotify
          const data = await response.json().catch(() => ({}));
          if (data.error === 'Not connected to Spotify') {
            setIsConnected(false);
          }
          // If it's a session/auth error, don't change connection state
          // This prevents redirects when session is temporarily unavailable
        } else {
          setIsConnected(false);
        }
      }
    } catch (error) {
      // Network errors shouldn't change connection state
      console.error('Error checking Spotify connection:', error);
      // Don't set isConnected to false on network errors
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      // Get current page URL to return to after auth
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
        setPlaylistTracks(data.tracks || []);
      } else if (response.status === 401) {
        // Handle auth errors gracefully without redirecting
        const data = await response.json().catch(() => ({}));
        console.error('Authentication error:', data.error || 'Unauthorized');
        // Don't redirect, just show error state
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to load playlist tracks:', error);
      // Don't redirect on network errors
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
        setSearchResults(data.tracks || []);
      } else if (response.status === 401) {
        // Handle auth errors gracefully without redirecting
        const data = await response.json().catch(() => ({}));
        console.error('Authentication error:', data.error || 'Unauthorized');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Don't redirect on network errors
    } finally {
      setSearching(false);
    }
  };

  const handleSelectTrack = async (track: Track) => {
    const songString = `${track.name} - ${track.artist}`;
    if (selectedSongs.includes(songString)) {
      // Remove if already selected
      onSongsChange(selectedSongs.filter(s => s !== songString));
    } else {
      // Add if not at max
      if (selectedSongs.length < maxSongs) {
        onSongsChange([...selectedSongs, songString]);
        // Save full track data if callback provided
        if (onTrackSave) {
          onTrackSave(track);
        }
      }
    }
  };

  const isTrackSelected = (track: Track) => {
    const songString = `${track.name} - ${track.artist}`;
    return selectedSongs.includes(songString);
  };

  const handlePlayPreview = (track: Track) => {
    // Stop any currently playing track
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (!track.preview_url) {
      return; // No preview available
    }

    // If clicking the same track, stop it
    if (playingTrackId === track.id && audioElement) {
      setPlayingTrackId(null);
      audioElement.pause();
      audioElement.currentTime = 0;
      setAudioElement(null);
      return;
    }

    // Play new track
    const audio = new Audio(track.preview_url);
    audio.play();
    setAudioElement(audio);
    setPlayingTrackId(track.id);

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

  // Cleanup audio on unmount
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
      <div className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Music className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Connect to Spotify</h3>
              <p className="text-sm opacity-90">Import your playlists and favorite songs</p>
            </div>
          </div>
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-white text-[#1DB954] rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-[#1DB954]" />
          <h3 className="font-semibold text-[#2C2A29]">Select Songs from Spotify</h3>
        </div>
        <div className="text-xs text-gray-500">
          {selectedSongs.length} / {maxSongs} selected
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('playlists')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'playlists'
              ? 'text-[#93B0C8] border-b-2 border-[#93B0C8]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Playlists
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-[#93B0C8] border-b-2 border-[#93B0C8]'
              : 'text-gray-500 hover:text-gray-700'
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
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handlePlaylistSelect(playlist.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPlaylist === playlist.id
                      ? 'border-[#93B0C8] bg-[#93B0C8]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-[#2C2A29]">{playlist.name}</div>
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
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-[#2C2A29]">Select songs:</div>
                <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <Play className="w-3 h-3" />
                  <span>Click play icon to preview</span>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {playlistTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isTrackSelected(track)
                        ? 'border-[#A5B99A] bg-[#A5B99A]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#2C2A29] truncate">{track.name}</div>
                        <div className="text-sm text-gray-500 truncate">{track.artist}</div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {track.preview_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayPreview(track);
                            }}
                            className={`p-2 rounded-full transition-colors ${
                              playingTrackId === track.id
                                ? 'bg-[#1DB954] text-white'
                                : 'text-[#1DB954] hover:bg-[#1DB954]/10'
                            }`}
                            title={playingTrackId === track.id ? 'Stop preview' : 'Play preview'}
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
                            className="text-[#1DB954] hover:text-[#1ed760] p-2"
                            title="Open in Spotify (click play button in Spotify)"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for songs..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-4 py-2 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors disabled:opacity-50 flex items-center space-x-2"
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
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isTrackSelected(track)
                        ? 'border-[#A5B99A] bg-[#A5B99A]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#2C2A29] truncate">{track.name}</div>
                        <div className="text-sm text-gray-500 truncate">{track.artist}</div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {track.preview_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayPreview(track);
                            }}
                            className={`p-2 rounded-full transition-colors ${
                              playingTrackId === track.id
                                ? 'bg-[#1DB954] text-white'
                                : 'text-[#1DB954] hover:bg-[#1DB954]/10'
                            }`}
                            title={playingTrackId === track.id ? 'Stop preview' : 'Play preview'}
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
                            className="text-[#1DB954] hover:text-[#1ed760] p-2"
                            title="Open in Spotify (click play button in Spotify)"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

