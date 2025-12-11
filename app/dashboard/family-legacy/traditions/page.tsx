'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, X, Edit2, Trash2 } from 'lucide-react';

interface Tradition {
  id: string;
  traditionName: string;
  description: string;
  whenItOccurs?: string;
  personalMeaning?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TraditionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [traditions, setTraditions] = useState<Tradition[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    traditionName: '',
    description: '',
    whenItOccurs: '',
    personalMeaning: '',
  });

  useEffect(() => {
    loadTraditions();
  }, []);

  const loadTraditions = async () => {
    try {
      const response = await fetch('/api/user/family-legacy/traditions');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load traditions');
      }
      const data = await response.json();
      setTraditions(data.traditions || []);
    } catch (error) {
      console.error('Failed to load traditions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = `/api/user/family-legacy/traditions`;
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save tradition');

      await loadTraditions();
      resetForm();
    } catch (error) {
      alert('Failed to save tradition. Please try again.');
    }
  };

  const handleEdit = (tradition: Tradition) => {
    setFormData({
      traditionName: tradition.traditionName,
      description: tradition.description,
      whenItOccurs: tradition.whenItOccurs || '',
      personalMeaning: tradition.personalMeaning || '',
    });
    setEditingId(tradition.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tradition?')) return;

    try {
      const response = await fetch(`/api/user/family-legacy/traditions?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete tradition');
      await loadTraditions();
    } catch (error) {
      alert('Failed to delete tradition. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      traditionName: '',
      description: '',
      whenItOccurs: '',
      personalMeaning: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A5B99A] mx-auto mb-4"></div>
          <p className="text-[#2C2A29] opacity-70">Loading traditions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2A29] mb-2">Traditions to Continue</h1>
            <p className="text-[#2C2A29] opacity-70">Keep your family traditions alive for future generations</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-semibold self-start sm:self-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Tradition</span>
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2C2A29]">
                {editingId ? 'Edit Tradition' : 'New Tradition'}
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
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">Tradition Name *</label>
                <input
                  type="text"
                  value={formData.traditionName}
                  onChange={(e) => setFormData({ ...formData, traditionName: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., Christmas Cookie Baking Day"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
                  placeholder="Describe the tradition in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">When It Occurs (Optional)</label>
                <input
                  type="text"
                  value={formData.whenItOccurs}
                  onChange={(e) => setFormData({ ...formData, whenItOccurs: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., Every Christmas Eve, On birthdays"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">Personal Meaning (Optional)</label>
                <textarea
                  value={formData.personalMeaning}
                  onChange={(e) => setFormData({ ...formData, personalMeaning: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
                  placeholder="What makes this tradition special to you?"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  {editingId ? 'Update Tradition' : 'Save Tradition'}
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

        {traditions.length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200/50">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#2C2A29] opacity-70 mb-6">No traditions yet. Add your first tradition.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              Add Your First Tradition
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {traditions.map((tradition) => (
              <div
                key={tradition.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#A5B99A] bg-opacity-10">
                        <Sparkles className="w-5 h-5 text-[#A5B99A]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#2C2A29]">{tradition.traditionName}</h3>
                    </div>
                    {tradition.whenItOccurs && (
                      <p className="text-sm text-[#2C2A29] opacity-70 mb-3">
                        <span className="font-medium">When:</span> {tradition.whenItOccurs}
                      </p>
                    )}
                    <p className="text-[#2C2A29] opacity-80 mb-3 whitespace-pre-wrap">{tradition.description}</p>
                    {tradition.personalMeaning && (
                      <p className="text-sm text-[#2C2A29] opacity-70 italic border-l-4 border-[#A5B99A] pl-4">
                        {tradition.personalMeaning}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(tradition)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5 text-[#2C2A29]" />
                    </button>
                    <button
                      onClick={() => handleDelete(tradition.id)}
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


