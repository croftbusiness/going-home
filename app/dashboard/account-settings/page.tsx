'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, User, Upload, Trash2, AlertTriangle } from 'lucide-react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    role: 'User',
    preferredName: '',
    fullName: '',
    email: '',
    avatarUrl: '',
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [personalRes, statusRes] = await Promise.all([
        fetch('/api/user/personal-details'),
        fetch('/api/user/status'),
      ]);

      if (personalRes.ok) {
        const personalData = await personalRes.json();
        if (personalData.personalDetails) {
          setFormData({
            role: personalData.personalDetails.role || 'User',
            preferredName: personalData.personalDetails.preferredName || '',
            fullName: personalData.personalDetails.fullName || '',
            email: personalData.personalDetails.email || '',
            avatarUrl: personalData.personalDetails.profilePictureUrl || '',
          });
          setProfilePictureUrl(personalData.personalDetails.profilePictureUrl || null);
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const newUrl = data.url || '';
      setProfilePictureUrl(newUrl);
      setFormData(prev => ({ ...prev, avatarUrl: newUrl }));
    } catch (error) {
      setError('Failed to upload profile picture');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // Update personal details with role
      const response = await fetch('/api/user/personal-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profilePictureUrl: profilePictureUrl || formData.avatarUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    if (!confirm('Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      // Clear local storage and redirect to home
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to home page with a message
      router.push('/?account_deleted=true');
    } catch (error: any) {
      setError(error.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
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
      <header className="bg-[#FCFAF7] border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Account Settings</h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Manage your profile and role
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#2C2A29] mb-4">Profile Picture</h2>
            <div className="flex items-center space-x-6">
              {profilePictureUrl ? (
                <Image
                  src={profilePictureUrl}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] flex items-center justify-center text-white text-3xl font-semibold">
                  {formData.preferredName?.charAt(0) || formData.fullName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <label className="inline-flex items-center px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 5MB</p>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#2C2A29] mb-4">Your Role</h2>
            <p className="text-sm text-[#2C2A29] opacity-70 mb-4">
              Your role affects how you appear to trusted contacts and viewers.
            </p>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-[#2C2A29] mb-2">
                Select Your Role
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              >
                <option value="User">User</option>
                <option value="Executor">Executor</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Attorney">Attorney</option>
                <option value="Custom">Custom</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                This will be displayed to trusted contacts as "{formData.preferredName || formData.fullName || 'You'} – {formData.role}"
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#2C2A29] mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="preferredName" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Preferred Name
                </label>
                <input
                  type="text"
                  id="preferredName"
                  value={formData.preferredName}
                  onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="How you'd like to be addressed"
                />
              </div>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Delete Account Section */}
        <div className="mt-12 bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-900 mb-2">Delete Account</h2>
              <p className="text-sm text-red-800 mb-4">
                Once you delete your account, there is no going back. This will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm text-red-800 mb-4 space-y-1">
                <li>All your personal information and data</li>
                <li>All documents, letters, and files you've uploaded</li>
                <li>All trusted contacts and viewer access</li>
                <li>All funeral preferences and planning data</li>
                <li>All legacy messages and biography content</li>
                <li>Your account and all associated data</li>
              </ul>
              
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete My Account</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-red-900 mb-2">
                      Type <strong>DELETE</strong> to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE' || deleting}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {deleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Permanently Delete Account</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                      disabled={deleting}
                      className="px-6 py-2 border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

