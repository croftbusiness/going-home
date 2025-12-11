'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Users, Trash2, Edit, Eye, EyeOff, Mail, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface TrustedContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  accessLevel: string;
  canViewPersonalDetails: boolean;
  canViewMedicalContacts: boolean;
  canViewFuneralPreferences: boolean;
  canViewDocuments: boolean;
    canViewLetters: boolean;
    role?: string;
    status?: string;
}

export default function TrustedContactsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [personalDetails, setPersonalDetails] = useState<any>(null);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    role: 'Custom',
    accessLevel: 'view',
    canViewPersonalDetails: false,
    canViewMedicalContacts: false,
    canViewFuneralPreferences: false,
    canViewDocuments: false,
    canViewLetters: false,
  });

  useEffect(() => {
    loadContacts();
    loadPersonalDetails(); // Load personal details for auto-population
  }, []);

  const loadPersonalDetails = async () => {
    try {
      const response = await fetch('/api/user/personal-details');
      if (response.ok) {
        const data = await response.json();
        if (data.personalDetails) {
          setPersonalDetails(data.personalDetails);
        }
      }
    } catch (error) {
      // Silently fail - not critical
    }
  };

  const handleAddContact = () => {
    // Pre-fill with emergency contact if available
    if (personalDetails?.emergencyContactName && !editingId) {
      setFormData({
        name: personalDetails.emergencyContactName || '',
        email: '',
        phone: personalDetails.emergencyContactPhone || '',
        relationship: personalDetails.emergencyContactRelationship || '',
        role: 'Custom',
        accessLevel: 'view',
        canViewPersonalDetails: false,
        canViewMedicalContacts: false,
        canViewFuneralPreferences: false,
        canViewDocuments: false,
        canViewLetters: false,
      });
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/user/trusted-contacts');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load contacts');
      }
      const data = await response.json();
      setContacts(data.trustedContacts || []);
    } catch (error) {
      setError('Failed to load trusted contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editingId ? `/api/user/trusted-contacts?id=${editingId}` : '/api/user/trusted-contacts';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save contact');

      await loadContacts();
      resetForm();
    } catch (error) {
      setError('Failed to save trusted contact');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (contact: TrustedContact) => {
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      relationship: contact.relationship,
      role: contact.role || 'Custom',
      accessLevel: contact.accessLevel,
      canViewPersonalDetails: contact.canViewPersonalDetails,
      canViewMedicalContacts: contact.canViewMedicalContacts,
      canViewFuneralPreferences: contact.canViewFuneralPreferences,
      canViewDocuments: contact.canViewDocuments,
      canViewLetters: contact.canViewLetters,
    });
    setEditingId(contact.id);
    setShowForm(true);
    setShowPermissions(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this contact?')) return;

    try {
      const response = await fetch(`/api/user/trusted-contacts?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      await loadContacts();
    } catch (error) {
      setError('Failed to delete contact');
    }
  };

  const handleSendInvite = async (contactId: string) => {
    setSendingInvite(contactId);
    setError('');

    try {
      const response = await fetch('/api/viewer/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      alert('Invitation sent successfully!');
      await loadContacts();
    } catch (error: any) {
      setError(error.message || 'Failed to send invitation');
    } finally {
      setSendingInvite(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      accessLevel: 'view',
      canViewPersonalDetails: false,
      canViewMedicalContacts: false,
      canViewFuneralPreferences: false,
      canViewDocuments: false,
      canViewLetters: false,
      role: 'Custom',
    });
    setShowForm(false);
    setShowPermissions(false);
    setEditingId(null);
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <Link href="/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 touch-target">
                <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Trusted Contacts</h1>
                <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                  Manage who can access your information
                </p>
              </div>
            </div>
            <button
              onClick={handleAddContact}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[48px] text-base bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center justify-center space-x-2 touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {showForm && (
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-2">
              {editingId ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            {!editingId && personalDetails?.emergencyContactName && formData.name === personalDetails.emergencyContactName && (
              <p className="text-sm text-[#93B0C8] mb-4 flex items-center">
                <span className="mr-2">✨</span>
                Pre-filled from your emergency contact. You can edit any fields as needed.
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#2C2A29] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                  />
                </div>
                <div>
                  <label htmlFor="relationship" className="block text-sm font-medium text-[#2C2A29] mb-1">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    required
                    placeholder="e.g., Spouse, Child, Friend"
                    className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-[#2C2A29] mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                >
                  <option value="Custom">Custom</option>
                  <option value="Executor">Executor</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Attorney">Attorney</option>
                  <option value="Family">Family</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#2C2A29] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#2C2A29] mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="flex items-center space-x-2 text-[#93B0C8] hover:text-[#A5B99A] transition-colors"
                >
                  {showPermissions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {showPermissions ? 'Hide' : 'Show'} Access Permissions
                  </span>
                </button>
              </div>

              {showPermissions && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-[#2C2A29] opacity-70 mb-3">
                    Select which information this contact can view after release is activated
                  </p>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.canViewPersonalDetails}
                      onChange={(e) => setFormData({ ...formData, canViewPersonalDetails: e.target.checked })}
                      className="w-4 h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A]"
                    />
                    <span className="text-sm text-[#2C2A29]">Personal Details</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.canViewMedicalContacts}
                      onChange={(e) => setFormData({ ...formData, canViewMedicalContacts: e.target.checked })}
                      className="w-4 h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A]"
                    />
                    <span className="text-sm text-[#2C2A29]">Medical Contacts</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.canViewFuneralPreferences}
                      onChange={(e) => setFormData({ ...formData, canViewFuneralPreferences: e.target.checked })}
                      className="w-4 h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A]"
                    />
                    <span className="text-sm text-[#2C2A29]">Funeral Preferences</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.canViewDocuments}
                      onChange={(e) => setFormData({ ...formData, canViewDocuments: e.target.checked })}
                      className="w-4 h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A]"
                    />
                    <span className="text-sm text-[#2C2A29]">Documents</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.canViewLetters}
                      onChange={(e) => setFormData({ ...formData, canViewLetters: e.target.checked })}
                      className="w-4 h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A]"
                    />
                    <span className="text-sm text-[#2C2A29]">Letters</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Contact' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        )}

        {contacts.length === 0 ? (
          <div className="bg-[#FCFAF7] rounded-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No trusted contacts yet</h3>
            <p className="text-[#2C2A29] opacity-70">
              Add people who should have access to your information when the time comes
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-white rounded-lg">
                      <Users className="w-6 h-6 text-[#A5B99A]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-[#2C2A29] mb-1">{contact.name}</h3>
                      <p className="text-sm text-[#2C2A29] opacity-70 mb-1">{contact.relationship}</p>
                      <p className="text-sm text-[#2C2A29] opacity-60 mb-1">{contact.email}</p>
                      <p className="text-sm text-[#2C2A29] opacity-60 mb-2">{contact.phone}</p>
                      {contact.role && (
                        <p className="text-xs text-[#A5B99A] font-medium mb-2">Role: {contact.role}</p>
                      )}
                      {contact.status && (
                        <p className="text-xs text-[#93B0C8] mb-2">
                          Status: <span className="capitalize">{contact.status}</span>
                        </p>
                      )}
                      {(contact.canViewPersonalDetails || contact.canViewMedicalContacts || 
                        contact.canViewFuneralPreferences || contact.canViewDocuments || contact.canViewLetters) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-[#2C2A29] opacity-50 mb-2">Can access:</p>
                          <div className="flex flex-wrap gap-2">
                            {contact.canViewPersonalDetails && (
                              <span className="px-2 py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded text-xs">
                                Personal Details
                              </span>
                            )}
                            {contact.canViewMedicalContacts && (
                              <span className="px-2 py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] rounded text-xs">
                                Medical
                              </span>
                            )}
                            {contact.canViewFuneralPreferences && (
                              <span className="px-2 py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded text-xs">
                                Funeral Prefs
                              </span>
                            )}
                            {contact.canViewDocuments && (
                              <span className="px-2 py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] rounded text-xs">
                                Documents
                              </span>
                            )}
                            {contact.canViewLetters && (
                              <span className="px-2 py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded text-xs">
                                Letters
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSendInvite(contact.id)}
                      disabled={sendingInvite === contact.id}
                      className="p-2 text-[#A5B99A] hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                      title="Send invitation email"
                    >
                      {sendingInvite === contact.id ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Mail className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-2 text-[#93B0C8] hover:bg-white rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
