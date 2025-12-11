'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Plus, X, Edit2, Trash2, Upload, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

interface Heirloom {
  id: string;
  itemName: string;
  itemPhoto?: string;
  itemStory?: string;
  recipientName?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function HeirloomsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [heirlooms, setHeirlooms] = useState<Heirloom[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    itemPhoto: '',
    itemStory: '',
    recipientName: '',
    videoUrl: '',
  });

  useEffect(() => {
    loadHeirlooms();
  }, []);

  const loadHeirlooms = async () => {
    try {
      const response = await fetch('/api/user/family-legacy/heirlooms');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load heirlooms');
      }
      const data = await response.json();
      setHeirlooms(data.heirlooms || []);
    } catch (error) {
      console.error('Failed to load heirlooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'photo' | 'video') => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/family-legacy/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }
      const data = await response.json();
      return data.url;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleFileUpload(file, 'photo');
      setFormData({ ...formData, itemPhoto: url });
    } catch (error) {
      alert('Failed to upload photo. Please try again.');
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleFileUpload(file, 'video');
      setFormData({ ...formData, videoUrl: url });
    } catch (error) {
      alert('Failed to upload video. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = `/api/user/family-legacy/heirlooms`;
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save heirloom');

      await loadHeirlooms();
      resetForm();
    } catch (error) {
      alert('Failed to save heirloom. Please try again.');
    }
  };

  const handleEdit = (heirloom: Heirloom) => {
    setFormData({
      itemName: heirloom.itemName,
      itemPhoto: heirloom.itemPhoto || '',
      itemStory: heirloom.itemStory || '',
      recipientName: heirloom.recipientName || '',
      videoUrl: heirloom.videoUrl || '',
    });
    setEditingId(heirloom.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this heirloom?')) return;

    try {
      const response = await fetch(`/api/user/family-legacy/heirlooms?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete heirloom');
      await loadHeirlooms();
    } catch (error) {
      alert('Failed to delete heirloom. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      itemPhoto: '',
      itemStory: '',
      recipientName: '',
      videoUrl: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A5B99A] mx-auto mb-4"></div>
          <p className="text-[#2C2A29] opacity-70">Loading heirlooms...</p>
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
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2A29] mb-2">Heirlooms & Keepsakes</h1>
            <p className="text-[#2C2A29] opacity-70">Document special items and who they should go to</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-semibold self-start sm:self-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Heirloom</span>
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2C2A29]">
                {editingId ? 'Edit Heirloom' : 'New Heirloom'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#2C2A29]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., Grandmother's Wedding Ring"
                />
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">Photo (Optional)</label>
                {formData.itemPhoto ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.itemPhoto}
                      alt="Heirloom"
                      className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, itemPhoto: '' })}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#A5B99A] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A5B99A]"></div>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </label>
                )}
              </div>

              {/* Story */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Item Story (Optional)
                </label>
                <textarea
                  value={formData.itemStory}
                  onChange={(e) => setFormData({ ...formData, itemStory: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
                  placeholder="What makes this item special? Its history, significance..."
                />
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Who Should Receive This (Optional)
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., My daughter Sarah"
                />
              </div>

              {/* Video */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Video (Optional)
                </label>
                {formData.videoUrl ? (
                  <div className="space-y-2">
                    <video src={formData.videoUrl} controls className="w-full max-w-md rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoUrl: '' })}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      Remove Video
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#A5B99A] transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A5B99A]"></div>
                    ) : (
                      <div className="text-center">
                        <VideoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Upload video</span>
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
                  {editingId ? 'Update Heirloom' : 'Save Heirloom'}
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

        {/* Heirlooms Grid */}
        {heirlooms.length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200/50">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#2C2A29] opacity-70 mb-6">No heirlooms yet. Add your first special item.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              Add Your First Heirloom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heirlooms.map((heirloom) => (
              <div
                key={heirloom.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {heirloom.itemPhoto && (
                  <img
                    src={heirloom.itemPhoto}
                    alt={heirloom.itemName}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#2C2A29] mb-2">{heirloom.itemName}</h3>
                  {heirloom.recipientName && (
                    <p className="text-sm text-[#2C2A29] opacity-70 mb-2">
                      For: <span className="font-medium">{heirloom.recipientName}</span>
                    </p>
                  )}
                  {heirloom.itemStory && (
                    <p className="text-sm text-[#2C2A29] opacity-70 mb-4 line-clamp-3">
                      {heirloom.itemStory}
                    </p>
                  )}
                  {heirloom.videoUrl && (
                    <video src={heirloom.videoUrl} controls className="w-full rounded-lg mb-4" />
                  )}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(heirloom)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(heirloom.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
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

