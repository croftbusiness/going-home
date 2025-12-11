'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Plus, X, Edit2, Trash2, Calendar } from 'lucide-react';

interface Letter {
  id: string;
  recipientName: string;
  message: string;
  scheduledReleaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function LegacyLettersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    recipientName: '',
    message: '',
    scheduledReleaseDate: '',
  });

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    try {
      const response = await fetch('/api/user/family-legacy/letters');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load letters');
      }
      const data = await response.json();
      setLetters(data.letters || []);
    } catch (error) {
      console.error('Failed to load letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = `/api/user/family-legacy/letters`;
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save letter');

      await loadLetters();
      resetForm();
    } catch (error) {
      alert('Failed to save letter. Please try again.');
    }
  };

  const handleEdit = (letter: Letter) => {
    setFormData({
      recipientName: letter.recipientName,
      message: letter.message,
      scheduledReleaseDate: letter.scheduledReleaseDate || '',
    });
    setEditingId(letter.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this letter?')) return;

    try {
      const response = await fetch(`/api/user/family-legacy/letters?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete letter');
      await loadLetters();
    } catch (error) {
      alert('Failed to delete letter. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      recipientName: '',
      message: '',
      scheduledReleaseDate: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A5B99A] mx-auto mb-4"></div>
          <p className="text-[#2C2A29] opacity-70">Loading letters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2A29] mb-2">Letters to Loved Ones</h1>
            <p className="text-[#2C2A29] opacity-70">Write personal letters to family and friends</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-semibold self-start sm:self-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Write Letter</span>
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2C2A29]">
                {editingId ? 'Edit Letter' : 'New Letter'}
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
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">Recipient Name *</label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., My dear Sarah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">Your Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={12}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
                  placeholder="Write from your heart..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Scheduled Release Date (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.scheduledReleaseDate}
                    onChange={(e) => setFormData({ ...formData, scheduledReleaseDate: e.target.value })}
                    className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-[#2C2A29] opacity-60 mt-1">
                  If set, this letter will be scheduled for release on this date
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  {editingId ? 'Update Letter' : 'Save Letter'}
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

        {letters.length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200/50">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#2C2A29] opacity-70 mb-6">No letters yet. Write your first letter to a loved one.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              Write Your First Letter
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {letters.map((letter) => (
              <div
                key={letter.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-[#EBD9B5] bg-opacity-20">
                        <Heart className="w-5 h-5 text-[#EBD9B5]" fill="currentColor" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#2C2A29]">To: {letter.recipientName}</h3>
                    </div>
                    {letter.scheduledReleaseDate && (
                      <div className="flex items-center gap-2 mb-3 text-sm text-[#2C2A29] opacity-70">
                        <Calendar className="w-4 h-4" />
                        <span>Scheduled for: {new Date(letter.scheduledReleaseDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="bg-[#FAF9F7] rounded-xl p-6 border-l-4 border-[#A5B99A]">
                      <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap leading-relaxed">
                        {letter.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(letter)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5 text-[#2C2A29]" />
                    </button>
                    <button
                      onClick={() => handleDelete(letter.id)}
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

