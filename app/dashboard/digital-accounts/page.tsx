'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Plus, Trash2, Eye, EyeOff, Edit2, Save, X } from 'lucide-react';

interface DigitalAccount {
  id?: string;
  accountType: string;
  accountName: string;
  username?: string;
  email?: string;
  url?: string;
  notes?: string;
  passwordEncrypted?: string;
}

const ACCOUNT_TYPES = [
  { value: 'email', label: 'Email Account' },
  { value: 'banking', label: 'Banking App' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'device', label: 'Device Passcode' },
  { value: 'cloud_storage', label: 'Cloud Storage' },
  { value: 'other', label: 'Other' },
];

export default function DigitalAccountsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<DigitalAccount[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/user/digital-accounts');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load accounts');
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load digital accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (account: DigitalAccount) => {
    setSaving(true);
    setError('');

    try {
      const url = account.id 
        ? '/api/user/digital-accounts'
        : '/api/user/digital-accounts';
      
      const method = account.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save account');
      }

      await loadAccounts();
      setEditingId(null);
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      const response = await fetch(`/api/user/digital-accounts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      await loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
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
              <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl">
                <Key className="w-6 h-6 text-[#A5B99A]" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-[#2C2A29]">Digital Accounts & Passwords</h1>
                <p className="text-[#2C2A29] opacity-70 mt-1">
                  Securely store your account information
                </p>
              </div>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Account</span>
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#2C2A29]">Add New Account</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AccountForm
              account={{}}
              onSave={handleSave}
              onCancel={() => setShowAddForm(false)}
              saving={saving}
            />
          </div>
        )}

        {/* Accounts List */}
        {accounts.length === 0 && !showAddForm ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Accounts Yet</h3>
            <p className="text-[#2C2A29] opacity-70 mb-4">
              Start by adding your digital accounts and passwords
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
            >
              Add Your First Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                isEditing={editingId === account.id}
                onEdit={() => setEditingId(account.id || null)}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
                onDelete={handleDelete}
                showPassword={showPassword[account.id || ''] || false}
                onTogglePassword={() => setShowPassword({
                  ...showPassword,
                  [account.id || '']: !showPassword[account.id || '']
                })}
                saving={saving}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AccountCard({
  account,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  showPassword,
  onTogglePassword,
  saving,
}: {
  account: DigitalAccount;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (account: DigitalAccount) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  saving: boolean;
}) {
  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <AccountForm
          account={account}
          onSave={onSave}
          onCancel={onCancel}
          saving={saving}
        />
      </div>
    );
  }

  const accountTypeLabel = ACCOUNT_TYPES.find(t => t.value === account.accountType)?.label || account.accountType;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] text-sm font-medium rounded-lg">
              {accountTypeLabel}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-[#2C2A29] mb-2">{account.accountName}</h3>
          {account.username && (
            <p className="text-sm text-[#2C2A29] opacity-70 mb-1">
              <span className="font-medium">Username:</span> {account.username}
            </p>
          )}
          {account.email && (
            <p className="text-sm text-[#2C2A29] opacity-70 mb-1">
              <span className="font-medium">Email:</span> {account.email}
            </p>
          )}
          {account.url && (
            <p className="text-sm text-[#2C2A29] opacity-70 mb-1">
              <span className="font-medium">URL:</span>{' '}
              <a href={account.url} target="_blank" rel="noopener noreferrer" className="text-[#93B0C8] hover:underline">
                {account.url}
              </a>
            </p>
          )}
          {account.passwordEncrypted && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm font-medium text-[#2C2A29]">Password:</span>
              <span className="text-sm text-[#2C2A29] font-mono">
                {showPassword ? account.passwordEncrypted : '••••••••'}
              </span>
              <button
                onClick={onTogglePassword}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}
          {account.notes && (
            <p className="text-sm text-[#2C2A29] opacity-70 mt-3">
              <span className="font-medium">Notes:</span> {account.notes}
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
            onClick={() => account.id && onDelete(account.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountForm({
  account,
  onSave,
  onCancel,
  saving,
}: {
  account: DigitalAccount;
  onSave: (account: DigitalAccount) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<DigitalAccount>(account);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Account Type *
          </label>
          <select
            value={formData.accountType || ''}
            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
            required
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          >
            <option value="">Select type</option>
            {ACCOUNT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Account Name *
          </label>
          <input
            type="text"
            value={formData.accountName || ''}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            required
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            placeholder="e.g., Gmail, Chase Bank"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Username
          </label>
          <input
            type="text"
            value={formData.username || ''}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            URL/Website
          </label>
          <input
            type="url"
            value={formData.url || ''}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Password
          </label>
          <input
            type="text"
            value={formData.passwordEncrypted || ''}
            onChange={(e) => setFormData({ ...formData, passwordEncrypted: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent font-mono"
            placeholder="Enter password"
          />
          <p className="text-xs text-[#2C2A29] opacity-60 mt-1">
            Note: Passwords should be encrypted. Consider using a password manager.
          </p>
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
          placeholder="Additional notes or instructions..."
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

