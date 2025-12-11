'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, X, Edit2, Trash2, Upload, Image as ImageIcon, Mic } from 'lucide-react';

interface Story {
  id: string;
  storyTitle: string;
  storyText: string;
  audioUrl?: string;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export default function StoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    storyTitle: '',
    storyText: '',
    audioUrl: '',
    photoUrls: [] as string[],
  });

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await fetch('/api/user/family-legacy/stories');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load stories');
      }
      const data = await response.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'photo' | 'audio') => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const urls = await Promise.all(
        Array.from(files).map(file => handleFileUpload(file, 'photo'))
      );
      setFormData({ ...formData, photoUrls: [...formData.photoUrls, ...urls] });
    } catch (error) {
      alert('Failed to upload photos. Please try again.');
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleFileUpload(file, 'audio');
      setFormData({ ...formData, audioUrl: url });
    } catch (error) {
      alert('Failed to upload audio. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/user/family-legacy/stories` : `/api/user/family-legacy/stories`;
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save story');

      await loadStories();
      resetForm();
    } catch (error) {
      alert('Failed to save story. Please try again.');
    }
  };

  const handleEdit = (story: Story) => {
    setFormData({
      storyTitle: story.storyTitle,
      storyText: story.storyText,
      audioUrl: story.audioUrl || '',
      photoUrls: story.photoUrls || [],
    });
    setEditingId(story.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      const response = await fetch(`/api/user/family-legacy/stories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete story');
      await loadStories();
    } catch (error) {
      alert('Failed to delete story. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      storyTitle: '',
      storyText: '',
      audioUrl: '',
      photoUrls: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A5B99A] mx-auto mb-4"></div>
          <p className="text-[#2C2A29] opacity-70">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2A29] mb-2">Family Stories</h1>
            <p className="text-[#2C2A29] opacity-70">Preserve your favorite memories and family tales</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-semibold self-start sm:self-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Story</span>
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2C2A29]">
                {editingId ? 'Edit Story' : 'New Story'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#2C2A29]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  value={formData.storyTitle}
                  onChange={(e) => setFormData({ ...formData, storyTitle: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., Our First Christmas Together"
                />
              </div>

              {/* Story Text */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Story *
                </label>
                <textarea
                  value={formData.storyText}
                  onChange={(e) => setFormData({ ...formData, storyText: e.target.value })}
                  required
                  rows={12}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
                  placeholder="Tell your story..."
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Photos (Optional)
                </label>
                <div className="flex flex-wrap gap-4 mb-4">
                  {formData.photoUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            photoUrls: formData.photoUrls.filter((_, i) => i !== index),
                          });
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#A5B99A] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A5B99A]"></div>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </label>
                </div>
              </div>

              {/* Audio */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Audio Recording (Optional)
                </label>
                {formData.audioUrl ? (
                  <div className="flex items-center space-x-4">
                    <audio src={formData.audioUrl} controls className="flex-1" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, audioUrl: '' })}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#A5B99A] transition-colors">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A5B99A]"></div>
                    ) : (
                      <div className="text-center">
                        <Mic className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Upload audio recording</span>
                      </div>
                    )}
                  </label>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  {editingId ? 'Update Story' : 'Save Story'}
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

        {/* Stories List */}
        {stories.length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200/50">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#2C2A29] opacity-70 mb-6">No stories yet. Add your first story to preserve your memories.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              Add Your First Story
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-semibold text-[#2C2A29] flex-1">{story.storyTitle}</h3>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(story)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5 text-[#2C2A29]" />
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>

                {story.photoUrls && story.photoUrls.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    {story.photoUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Story photo ${index + 1}`}
                        className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                      />
                    ))}
                  </div>
                )}

                {story.audioUrl && (
                  <div className="mb-4">
                    <audio src={story.audioUrl} controls className="w-full" />
                  </div>
                )}

                <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                  {story.storyText}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

