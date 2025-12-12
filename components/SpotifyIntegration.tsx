'use client';

import { useState, useEffect, useRef } from 'react';
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

const trackToString = (track: any): string | null => {
  if (!track || typeof track !== 'object') return null;
  if ('reason' in track) return null;
  if (!track.name || !track.artist) return null;
  const name = typeof track.name === 'string' ? track.name : String(track.name || '');
  const artist = typeof track.artist === 'string' ? track.artist : String(track.artist || '');
  if (!name || !artist) return null;
  return `${name} - ${artist}`;
};

const isValidTrack = (track: any): track is Track => {
  if (!track || typeof track !== 'object') return false;
  if ('reason' in track) return false;
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
  const tracksSectionRef = useRef<HTMLDivElement>(null);

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
        setTimeout(() => {
          tracksSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
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
    if (!isValidTrack(track)) return;
    
    const songString = trackToString(track);
    if (!songString) return;
    
    if (selectedSongs.includes(songString)) {
      onSongsChange(selectedSongs.filter(s => s !== songString));
    } else {
      if (selectedSongs.length < maxSongs) {
        onSongsChange([...selectedSongs, songString]);
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
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Music className="w-5 h-5 text-[#1DB954]" />
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>Connect to Spotify</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Import your playlists and songs</div>
          </div>
        </div>
        <button
          onClick={handleConnect}
          style={{
            width: '100%',
            padding: '8px 16px',
            backgroundColor: '#1DB954',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Connect
        </button>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff', overflow: 'hidden', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '100%', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Select Songs</div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>{selectedSongs.length}/{maxSongs}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', maxWidth: '100%', overflowX: 'hidden' }}>
        <button
          onClick={() => setActiveTab('playlists')}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '14px',
            fontWeight: '500',
            border: 'none',
            backgroundColor: activeTab === 'playlists' ? '#f3f4f6' : '#fff',
            color: activeTab === 'playlists' ? '#1DB954' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'playlists' ? '2px solid #1DB954' : 'none',
            boxSizing: 'border-box'
          }}
        >
          Playlists
        </button>
        <button
          onClick={() => setActiveTab('search')}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '14px',
            fontWeight: '500',
            border: 'none',
            backgroundColor: activeTab === 'search' ? '#f3f4f6' : '#fff',
            color: activeTab === 'search' ? '#1DB954' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'search' ? '2px solid #1DB954' : 'none',
            boxSizing: 'border-box'
          }}
        >
          Search
        </button>
      </div>

      {/* Content */}
      <div style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden', maxWidth: '100%', boxSizing: 'border-box' }}>
        {activeTab === 'playlists' && (
          <div style={{ padding: '12px', maxWidth: '100%', boxSizing: 'border-box' }}>
            {selectedPlaylist && playlistTracks.length > 0 && (
              <div ref={tracksSectionRef} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '2px solid #1DB954' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Songs ({playlistTracks.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {playlistTracks.map((track) => {
                    if (!isValidTrack(track)) return null;
                    return (
                      <button
                        key={track.id}
                        onClick={() => handleSelectTrack(track)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          textAlign: 'left',
                          border: isTrackSelected(track) ? '1px solid #1DB954' : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          backgroundColor: isTrackSelected(track) ? '#f0fdf4' : '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          maxWidth: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ width: '28px', height: '28px', flexShrink: 0, minWidth: '28px', maxWidth: '28px' }}>
                          <TrackPlayer
                            trackId={track.id}
                            trackName={String(track.name || 'Unknown')}
                            artistName={String(track.artist || 'Unknown Artist')}
                            albumArtUrl={track.album_art_url}
                            spotifyUrl={track.external_urls?.spotify}
                            className="w-full h-full"
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {String(track.name || 'Unknown')}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {String(track.artist || 'Unknown Artist')}
                          </div>
                        </div>
                        {isTrackSelected(track) && (
                          <CheckCircle2 className="w-5 h-5 text-[#1DB954]" style={{ flexShrink: 0, minWidth: '20px' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {playlists.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280', fontSize: '14px' }}>
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div>No playlists found</div>
              </div>
            ) : (
              <div>
                {selectedPlaylist && playlistTracks.length > 0 && (
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Your Playlists
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handlePlaylistSelect(playlist.id)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        textAlign: 'left',
                        border: selectedPlaylist === playlist.id ? '1px solid #1DB954' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: selectedPlaylist === playlist.id ? '#f0fdf4' : '#fff',
                        cursor: 'pointer',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {String(playlist.name || 'Unknown')}
                      </div>
                      {playlist.tracks && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          {playlist.tracks.total} tracks
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div style={{ padding: '12px', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', maxWidth: '100%' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search songs..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  outline: 'none',
                  maxWidth: 'calc(100% - 70px)',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1DB954',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                  fontSize: '14px',
                  cursor: searching || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                  opacity: searching || !searchQuery.trim() ? 0.5 : 1,
                  minWidth: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {searchResults.map((track) => {
                  if (!isValidTrack(track)) return null;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleSelectTrack(track)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        textAlign: 'left',
                        border: isTrackSelected(track) ? '1px solid #1DB954' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: isTrackSelected(track) ? '#f0fdf4' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ width: '28px', height: '28px', flexShrink: 0, minWidth: '28px', maxWidth: '28px' }}>
                        <TrackPlayer
                          trackId={track.id}
                          trackName={String(track.name || 'Unknown')}
                          artistName={String(track.artist || 'Unknown Artist')}
                          albumArtUrl={track.album_art_url}
                          spotifyUrl={track.external_urls?.spotify}
                          className="w-full h-full"
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {String(track.name || 'Unknown')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {String(track.artist || 'Unknown Artist')}
                        </div>
                      </div>
                      {isTrackSelected(track) && (
                        <CheckCircle2 className="w-5 h-5 text-[#1DB954]" style={{ flexShrink: 0, minWidth: '20px' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
