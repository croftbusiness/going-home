'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Music, Sparkles, Loader2, CheckCircle, Plus, X, Heart } from 'lucide-react';
import { getPlaylist, generatePlaylist } from '@/lib/api/funeral';
import type { PlaylistInput } from '@/types/funeral';
import SpotifyIntegration from '@/components/SpotifyIntegration';

export default function PlaylistPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<PlaylistInput>({
    favoriteSongs: [],
    genres: [],
    mood: '',
    era: '',
  });
  const [currentSong, setCurrentSong] = useState('');
  const [currentGenre, setCurrentGenre] = useState('');
  const [aiOutput, setAiOutput] = useState<any>(null);
  const [existingPlaylist, setExistingPlaylist] = useState<any>(null);

  useEffect(() => {
    loadExistingPlaylist();
  }, []);

  const loadExistingPlaylist = async () => {
    try {
      const playlist = await getPlaylist();
      if (playlist) {
        setExistingPlaylist(playlist);
        // Note: The database doesn't store input fields, only output
        // So we just load the AI output
        setAiOutput({
          ceremonyMusic: playlist.ceremony_music,
          slideshowSongs: playlist.slideshow_songs,
          receptionPlaylist: playlist.reception_playlist,
          explanations: playlist.personalized_explanations,
        });
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = () => {
    if (currentSong.trim()) {
      setFormData(prev => ({
        ...prev,
        favoriteSongs: [...(prev.favoriteSongs || []), currentSong.trim()],
      }));
      setCurrentSong('');
    }
  };

  const handleRemoveSong = (index: number) => {
    setFormData(prev => ({
      ...prev,
      favoriteSongs: prev.favoriteSongs?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleAddGenre = () => {
    if (currentGenre.trim()) {
      setFormData(prev => ({
        ...prev,
        genres: [...(prev.genres || []), currentGenre.trim()],
      }));
      setCurrentGenre('');
    }
  };

  const handleRemoveGenre = (index: number) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const result = await generatePlaylist(formData);
      setAiOutput(result.aiOutput);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate playlist');
    } finally {
      setGenerating(false);
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
                Share your favorite songs, genres, and musical preferences. We'll create personalized playlists 
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
            Your playlist has been generated successfully!
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200 mb-6">
          <div className="space-y-6">
            {/* Favorite Songs */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-3">
                Favorite Songs <span className="text-gray-400">(Optional)</span>
              </label>
              
              {/* Spotify Integration */}
              <div className="mb-4">
                <SpotifyIntegration
                  selectedSongs={formData.favoriteSongs || []}
                  onSongsChange={(songs) => {
                    setFormData(prev => ({
                      ...prev,
                      favoriteSongs: songs,
                    }));
                  }}
                  maxSongs={50}
                  onTrackSave={async (track) => {
                    // Save full track data to saved_songs
                    try {
                      await fetch('/api/user/saved-songs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          spotify_id: track.id,
                          name: track.name,
                          artist: track.artist,
                          album: track.album,
                          preview_url: track.preview_url,
                          spotify_url: track.external_urls?.spotify,
                          album_art_url: track.album_art_url,
                          duration_ms: track.duration_ms,
                        }),
                      });
                    } catch (error) {
                      console.error('Failed to save track:', error);
                    }
                  }}
                />
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
                    placeholder="e.g., Amazing Grace, Over the Rainbow..."
                    className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                  />
                  <button
                    onClick={handleAddSong}
                    className="px-4 py-3 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors touch-target"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {formData.favoriteSongs && formData.favoriteSongs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.favoriteSongs.map((song, idx) => (
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

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Music Genres <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentGenre}
                  onChange={(e) => setCurrentGenre(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGenre();
                    }
                  }}
                  placeholder="e.g., Classical, Jazz, Gospel, Rock..."
                  className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                />
                <button
                  onClick={handleAddGenre}
                  className="px-4 py-3 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors touch-target"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {formData.genres && formData.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.genres.map((genre, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 bg-[#93B0C8] bg-opacity-10 text-[#2C2A29] rounded-full text-sm"
                    >
                      {genre}
                      <button
                        onClick={() => handleRemoveGenre(idx)}
                        className="ml-2 hover:text-red-600 touch-target"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Desired Mood <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.mood || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                placeholder="e.g., Reflective and peaceful, celebratory and joyful..."
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
              />
            </div>

            {/* Era */}
            <div>
              <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                Musical Era Preference <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.era || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, era: e.target.value }))}
                placeholder="e.g., 1960s-70s, Contemporary, Timeless classics..."
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full px-6 py-4 min-h-[56px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating your playlists...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Playlists
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {aiOutput && (
          <div className="space-y-6">
            {/* Overall Explanation */}
            {aiOutput.explanations && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">About Your Playlists</h3>
                <p className="text-sm sm:text-base text-[#2C2A29] opacity-80 leading-relaxed whitespace-pre-wrap">
                  {aiOutput.explanations}
                </p>
              </div>
            )}

            {/* Ceremony Music */}
            {aiOutput.ceremonyMusic && Array.isArray(aiOutput.ceremonyMusic) && aiOutput.ceremonyMusic.length > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Ceremony Music</h3>
                <div className="space-y-4">
                  {aiOutput.ceremonyMusic.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-medium text-[#2C2A29] mb-1">
                        {item.song} {item.artist && `- ${item.artist}`}
                      </div>
                      {item.timing && (
                        <div className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-1">
                          Timing: {item.timing}
                        </div>
                      )}
                      {item.reason && (
                        <div className="text-xs sm:text-sm text-[#2C2A29] opacity-60">
                          {item.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slideshow Songs */}
            {aiOutput.slideshowSongs && Array.isArray(aiOutput.slideshowSongs) && aiOutput.slideshowSongs.length > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Slideshow Songs</h3>
                <div className="space-y-4">
                  {aiOutput.slideshowSongs.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-medium text-[#2C2A29] mb-1">
                        {item.song} {item.artist && `- ${item.artist}`}
                      </div>
                      {item.reason && (
                        <div className="text-xs sm:text-sm text-[#2C2A29] opacity-60">
                          {item.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reception Playlist */}
            {aiOutput.receptionPlaylist && Array.isArray(aiOutput.receptionPlaylist) && aiOutput.receptionPlaylist.length > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">Reception Playlist</h3>
                <div className="space-y-4">
                  {aiOutput.receptionPlaylist.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-medium text-[#2C2A29] mb-1">
                        {item.song} {item.artist && `- ${item.artist}`}
                      </div>
                      {item.mood && (
                        <div className="text-xs sm:text-sm text-[#2C2A29] opacity-60">
                          Mood: {item.mood}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regenerate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full px-6 py-3 min-h-[48px] text-base bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors touch-target disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Regenerate Playlists
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}



