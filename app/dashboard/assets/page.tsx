'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface Asset {
  id?: string;
  assetType: string;
  name: string;
  description?: string;
  location?: string;
  accountNumber?: string;
  institutionName?: string;
  contactInfo?: string;
  estimatedValue?: string;
  notes?: string;
}

const ASSET_TYPES = [
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'property', label: 'Property' },
  { value: 'bank_account', label: 'Bank Account' },
  { value: 'insurance', label: 'Insurance Policy' },
  { value: 'investment', label: 'Investment' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
];

export default function AssetsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const response = await fetch('/api/user/assets');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load assets');
      }

      const data = await response.json();
      setAssets(data.assets || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (asset: Asset) => {
    setSaving(true);
    setError('');

    try {
      const method = asset.id ? 'PUT' : 'POST';
      const response = await fetch('/api/user/assets', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save asset');
      }

      await loadAssets();
      setEditingId(null);
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(`/api/user/assets?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete asset');
      await loadAssets();
    } catch (err: any) {
      setError(err.message || 'Failed to delete asset');
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
                <DollarSign className="w-6 h-6 text-[#93B0C8]" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-[#2C2A29]">Asset Overview</h1>
                <p className="text-[#2C2A29] opacity-70 mt-1">
                  Keep a simple list of your assets and accounts
                </p>
              </div>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Asset</span>
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#2C2A29]">Add New Asset</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AssetForm
              asset={{}}
              onSave={handleSave}
              onCancel={() => setShowAddForm(false)}
              saving={saving}
            />
          </div>
        )}

        {assets.length === 0 && !showAddForm ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Assets Yet</h3>
            <p className="text-[#2C2A29] opacity-70 mb-4">
              Start by adding your assets and accounts
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
            >
              Add Your First Asset
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isEditing={editingId === asset.id}
                onEdit={() => setEditingId(asset.id || null)}
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

function AssetCard({
  asset,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  saving,
}: {
  asset: Asset;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (asset: Asset) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  saving: boolean;
}) {
  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <AssetForm
          asset={asset}
          onSave={onSave}
          onCancel={onCancel}
          saving={saving}
        />
      </div>
    );
  }

  const assetTypeLabel = ASSET_TYPES.find(t => t.value === asset.assetType)?.label || asset.assetType;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] text-sm font-medium rounded-lg">
              {assetTypeLabel}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-[#2C2A29] mb-2">{asset.name}</h3>
          {asset.description && (
            <p className="text-sm text-[#2C2A29] opacity-70 mb-2">{asset.description}</p>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm text-[#2C2A29] opacity-70">
            {asset.location && (
              <p><span className="font-medium">Location:</span> {asset.location}</p>
            )}
            {asset.institutionName && (
              <p><span className="font-medium">Institution:</span> {asset.institutionName}</p>
            )}
            {asset.accountNumber && (
              <p><span className="font-medium">Account #:</span> {asset.accountNumber}</p>
            )}
            {asset.estimatedValue && (
              <p><span className="font-medium">Value:</span> {asset.estimatedValue}</p>
            )}
            {asset.contactInfo && (
              <p><span className="font-medium">Contact:</span> {asset.contactInfo}</p>
            )}
          </div>
          {asset.notes && (
            <p className="text-sm text-[#2C2A29] opacity-70 mt-3">
              <span className="font-medium">Notes:</span> {asset.notes}
            </p>
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
            onClick={() => asset.id && onDelete(asset.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AssetForm({
  asset,
  onSave,
  onCancel,
  saving,
}: {
  asset: Asset;
  onSave: (asset: Asset) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<Asset>(asset);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Asset Type *
          </label>
          <select
            value={formData.assetType || ''}
            onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
            required
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          >
            <option value="">Select type</option>
            {ASSET_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Name *
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            placeholder="e.g., 2020 Toyota Camry"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Institution Name
          </label>
          <input
            type="text"
            value={formData.institutionName || ''}
            onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Account Number
          </label>
          <input
            type="text"
            value={formData.accountNumber || ''}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Contact Info
          </label>
          <input
            type="text"
            value={formData.contactInfo || ''}
            onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Estimated Value
          </label>
          <input
            type="text"
            value={formData.estimatedValue || ''}
            onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            placeholder="e.g., $50,000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2C2A29] mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          placeholder="Additional notes..."
        />
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

