'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Baby, Plus, Trash2, Edit2, Save, X, Heart } from 'lucide-react';

interface ChildrenWish {
  id?: string;
  childName?: string;
  guardianPreferences?: string;
  guardianName?: string;
  guardianContact?: string;
  milestoneMessages?: Array<{ milestone: string; message: string }>;
  importantPrinciples?: string;
  personalMessage?: string;
}

export default function ChildrenWishesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wishes, setWishes] = useState<ChildrenWish[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadWishes();
  }, []);

  const loadWishes = async () => {
    try {
      const response = await fetch('/api/user/children-wishes');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load wishes');
      }

      const data = await response.json();
      setWishes(data.wishes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load wishes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (wish: ChildrenWish) => {
    setSaving(true);
    setError('');

    try {
      const method = wish.id ? 'PUT' : 'POST';
      const response = await fetch('/api/user/children-wishes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wish),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save wish');
      }

      await loadWishes();
      setEditingId(null);
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save wish');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wish?')) return;

    try {
      const response = await fetch(`/api/user/children-wishes?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete wish');
      await loadWishes();
    } catch (err: any) {
      setError(err.message || 'Failed to delete wish');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-[#2C2A29]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#93B0C8] bg-opacity-10 rounded-xl">
                <Baby className="w-6 h-6 text-[#93B0C8]" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-[#2C2A29]">Children's Wishes</h1>
                <p className="text-[#2C2A29] opacity-70 mt-1">
                  Messages and guardian preferences for your children
                </p>
              </div>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Wish</span>
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}
          
          {/* Why This Helps Loved Ones */}
          <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl flex-shrink-0">
                <Heart className="w-6 h-6 text-[#A5B99A]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-2">
                  Why This Helps Your Loved Ones
                </h3>
                <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">
                  Your children will carry your words with them throughout their lives. By writing messages 
                  for milestones, sharing your values, and documenting guardian preferences now, you're 
                  giving them a lasting connection to you. These messages become treasured keepsakes that 
                  provide comfort, guidance, and love when they need it most—on birthdays, graduations, 
                  weddings, and other important moments. Your words will help them feel your presence and 
                  know how deeply you loved them, even when you're not physically there.
                </p>
              </div>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#2C2A29]">Add New Wish</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <WishForm
              wish={{}}
              onSave={handleSave}
              onCancel={() => setShowAddForm(false)}
              saving={saving}
            />
          </div>
        )}

        {wishes.length === 0 && !showAddForm ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Baby className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Wishes Yet</h3>
            <p className="text-[#2C2A29] opacity-70 mb-4">
              Add messages and guardian preferences for your children
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
            >
              Add Your First Wish
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishes.map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                isEditing={editingId === wish.id}
                onEdit={() => setEditingId(wish.id || null)}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
                onDelete={handleDelete}
                saving={saving}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WishCard({
  wish,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  saving,
}: {
  wish: ChildrenWish;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (wish: ChildrenWish) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  saving: boolean;
}) {
  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <WishForm
          wish={wish}
          onSave={onSave}
          onCancel={onCancel}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {wish.childName && (
            <h3 className="text-xl font-semibold text-[#2C2A29] mb-2">{wish.childName}</h3>
          )}
          {wish.guardianName && (
            <p className="text-sm text-[#2C2A29] opacity-70 mb-2">
              <span className="font-medium">Guardian:</span> {wish.guardianName}
              {wish.guardianContact && ` (${wish.guardianContact})`}
            </p>
          )}
          {wish.guardianPreferences && (
            <p className="text-sm text-[#2C2A29] opacity-70 mb-2">
              <span className="font-medium">Guardian Preferences:</span> {wish.guardianPreferences}
            </p>
          )}
          {wish.importantPrinciples && (
            <p className="text-sm text-[#2C2A29] opacity-70 mb-2">
              <span className="font-medium">Important Principles:</span> {wish.importantPrinciples}
            </p>
          )}
          {wish.personalMessage && (
            <div className="mt-3 p-3 bg-[#A5B99A] bg-opacity-5 rounded-lg">
              <p className="text-sm font-medium text-[#2C2A29] mb-1">Personal Message:</p>
              <p className="text-sm text-[#2C2A29] opacity-80">{wish.personalMessage}</p>
            </div>
          )}
          {wish.milestoneMessages && wish.milestoneMessages.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-[#2C2A29] mb-2">Milestone Messages:</p>
              <div className="space-y-2">
                {wish.milestoneMessages.map((msg, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-[#2C2A29]">{msg.milestone}</p>
                    <p className="text-xs text-[#2C2A29] opacity-70">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-[#2C2A29]" />
          </button>
          <button
            onClick={() => wish.id && onDelete(wish.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function WishForm({
  wish,
  onSave,
  onCancel,
  saving,
}: {
  wish: ChildrenWish;
  onSave: (wish: ChildrenWish) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<ChildrenWish>(wish);
  const [newMilestone, setNewMilestone] = useState({ milestone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addMilestone = () => {
    if (newMilestone.milestone.trim() && newMilestone.message.trim()) {
      setFormData({
        ...formData,
        milestoneMessages: [...(formData.milestoneMessages || []), { ...newMilestone }],
      });
      setNewMilestone({ milestone: '', message: '' });
    }
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestoneMessages: formData.milestoneMessages?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Child's Name
          </label>
          <input
            type="text"
            value={formData.childName || ''}
            onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Guardian Name
          </label>
          <input
            type="text"
            value={formData.guardianName || ''}
            onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Guardian Contact
          </label>
          <input
            type="text"
            value={formData.guardianContact || ''}
            onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2C2A29] mb-2">
          Guardian Preferences
        </label>
        <textarea
          value={formData.guardianPreferences || ''}
          onChange={(e) => setFormData({ ...formData, guardianPreferences: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          placeholder="Your preferences for guardianship..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2C2A29] mb-2">
          Important Principles
        </label>
        <textarea
          value={formData.importantPrinciples || ''}
          onChange={(e) => setFormData({ ...formData, importantPrinciples: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          placeholder="Principles you want taught to your children..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2C2A29] mb-2">
          Personal Message
        </label>
        <textarea
          value={formData.personalMessage || ''}
          onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          placeholder="A personal message for your child..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2C2A29] mb-2">
          Milestone Messages
        </label>
        <div className="space-y-2 mb-2">
          {formData.milestoneMessages?.map((msg, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#2C2A29]">{msg.milestone}</p>
                <p className="text-xs text-[#2C2A29] opacity-70">{msg.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeMilestone(index)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={newMilestone.milestone}
            onChange={(e) => setNewMilestone({ ...newMilestone, milestone: e.target.value })}
            placeholder="Milestone (e.g., 18th Birthday)"
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
          <input
            type="text"
            value={newMilestone.message}
            onChange={(e) => setNewMilestone({ ...newMilestone, message: e.target.value })}
            placeholder="Message"
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
          <button
            type="button"
            onClick={addMilestone}
            className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-[#2C2A29] hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </form>
  );
}

