'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Plus, X, Edit2, Trash2, ExternalLink } from 'lucide-react';

interface Playlist {
  id: string;
  songTitle: string;
  artist?: string;
  link?: string;
  emotionalMeaning?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PlaylistsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    songTitle: '',
    artist: '',
    link: '',
    emotionalMeaning: '',
  });

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const response = await fetch('/api/user/family-legacy/playlists');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load playlists');
      }
      const data = await response.json();
      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = `/api/user/family-legacy/playlists`;
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save song');

      await loadPlaylists();
      resetForm();
    } catch (error) {
      alert('Failed to save song. Please try again.');
    }
  };

  const handleEdit = (song: Playlist) => {
    setFormData({
      songTitle: song.songTitle,
      artist: song.artist || '',
      link: song.link || '',
      emotionalMeaning: song.emotionalMeaning || '',
    });
    setEditingId(song.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      const response = await fetch(`/api/user/family-legacy/playlists?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete song');
      await loadPlaylists();
    } catch (error) {
      alert('Failed to delete song. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      songTitle: '',
      artist: '',
      link: '',
      emotionalMeaning: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A5B99A] mx-auto mb-4"></div>
          <p className="text-[#2C2A29] opacity-70">Loading songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2A29] mb-2">Favorite Music & Playlists</h1>
            <p className="text-[#2C2A29] opacity-70">Share the songs that mean the most to you</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-semibold self-start sm:self-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Song</span>
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2C2A29]">
                {editingId ? 'Edit Song' : 'New Song'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#2C2A29]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">Song Title *</label>
                <input
                  type="text"
                  value={formData.songTitle}
                  onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., Amazing Grace"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">Artist (Optional)</label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., Aretha Franklin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Link (Spotify/YouTube) (Optional)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Emotional Meaning (Optional)
                </label>
                <textarea
                  value={formData.emotionalMeaning}
                  onChange={(e) => setFormData({ ...formData, emotionalMeaning: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
                  placeholder="Why does this song mean so much to you?"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  {editingId ? 'Update Song' : 'Add Song'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-[#2C2A29] rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {playlists.length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200/50">
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#2C2A29] opacity-70 mb-6">No songs yet. Add your first favorite song.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              Add Your First Song
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {playlists.map((song) => (
              <div
                key={song.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#A5B99A] bg-opacity-10">
                        <Music className="w-5 h-5 text-[#A5B99A]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#2C2A29]">{song.songTitle}</h3>
                        {song.artist && (
                          <p className="text-sm text-[#2C2A29] opacity-70">{song.artist}</p>
                        )}
                      </div>
                    </div>
                    {song.emotionalMeaning && (
                      <p className="text-sm text-[#2C2A29] opacity-80 ml-11 mb-3">
                        {song.emotionalMeaning}
                      </p>
                    )}
                    {song.link && (
                      <a
                        href={song.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-11 inline-flex items-center gap-2 text-sm text-[#93B0C8] hover:text-[#A5B99A] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Listen
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(song)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5 text-[#2C2A29]" />
                    </button>
                    <button
                      onClick={() => handleDelete(song.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

