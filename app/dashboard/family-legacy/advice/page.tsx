'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Plus, X, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Advice {
  id: string;
  category: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: 'marriage', label: 'Marriage' },
  { value: 'parenting', label: 'Parenting' },
  { value: 'faith', label: 'Faith' },
  { value: 'money', label: 'Money' },
  { value: 'work', label: 'Work' },
  { value: 'life', label: 'Life' },
  { value: 'other', label: 'Other' },
];

export default function AdvicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState<Advice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    category: 'life',
    message: '',
  });

  useEffect(() => {
    loadAdvice();
  }, []);

  const loadAdvice = async () => {
    try {
      const response = await fetch('/api/user/family-legacy/advice');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load advice');
      }
      const data = await response.json();
      setAdvice(data.advice || []);
      // Expand all categories by default
      const categories = new Set<string>(data.advice?.map((a: Advice) => a.category) || []);
      setExpandedCategories(categories);
    } catch (error) {
      console.error('Failed to load advice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = `/api/user/family-legacy/advice`;
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save advice');

      await loadAdvice();
      resetForm();
    } catch (error) {
      alert('Failed to save advice. Please try again.');
    }
  };

  const handleEdit = (item: Advice) => {
    setFormData({
      category: item.category,
      message: item.message,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advice?')) return;

    try {
      const response = await fetch(`/api/user/family-legacy/advice?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete advice');
      await loadAdvice();
    } catch (error) {
      alert('Failed to delete advice. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'life',
      message: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const adviceByCategory = advice.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Advice[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A5B99A] mx-auto mb-4"></div>
          <p className="text-[#2C2A29] opacity-70">Loading advice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2A29] mb-2">Life Advice</h1>
            <p className="text-[#2C2A29] opacity-70">Share wisdom on marriage, parenting, faith, and more</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-semibold self-start sm:self-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Advice</span>
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2C2A29]">
                {editingId ? 'Edit Advice' : 'New Advice'}
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
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">Your Advice *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={8}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
                  placeholder="Share your wisdom..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  {editingId ? 'Update Advice' : 'Save Advice'}
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

        {advice.length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200/50">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#2C2A29] opacity-70 mb-6">No advice yet. Share your first piece of wisdom.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              Add Your First Advice
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {CATEGORIES.map((category) => {
              const items = adviceByCategory[category.value] || [];
              if (items.length === 0) return null;

              const isExpanded = expandedCategories.has(category.value);

              return (
                <div
                  key={category.value}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleCategory(category.value)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-[#A5B99A]" />
                      <h2 className="text-lg font-semibold text-[#2C2A29]">
                        {category.label} ({items.length})
                      </h2>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#2C2A29] opacity-70" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#2C2A29] opacity-70" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="pt-4 border-b border-gray-100 last:border-0 last:pb-0"
                        >
                          <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap mb-3">
                            {item.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="px-3 py-1.5 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

