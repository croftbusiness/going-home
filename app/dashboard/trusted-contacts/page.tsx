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
  avatarUrl?: string;
  ownerProfilePictureUrl?: string;
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
          <div className="bg-[#FCFAF7] rounded-lg p-4 sm:p-6 shadow-sm mb-6">
            <h2 className="text-base sm:text-lg font-medium text-[#2C2A29] mb-2">
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
                  className="w-full sm:w-auto flex items-center justify-center sm:justify-start space-x-2 px-4 py-3 min-h-[48px] text-[#93B0C8] hover:text-[#A5B99A] hover:bg-white rounded-lg transition-colors touch-target border border-gray-200 sm:border-0"
                >
                  {showPermissions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {showPermissions ? 'Hide' : 'Show'} Access Permissions
                  </span>
                </button>
              </div>

              {showPermissions && (
                <div className="border border-gray-200 rounded-lg p-4 sm:p-5 space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-3">
                    Select which information this contact can view after release is activated
                  </p>
                  <label className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer touch-target">
                    <input
                      type="checkbox"
                      checked={formData.canViewPersonalDetails}
                      onChange={(e) => setFormData({ ...formData, canViewPersonalDetails: e.target.checked })}
                      className="w-5 h-5 sm:w-4 sm:h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] cursor-pointer"
                    />
                    <span className="text-sm sm:text-base text-[#2C2A29]">Personal Details</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer touch-target">
                    <input
                      type="checkbox"
                      checked={formData.canViewMedicalContacts}
                      onChange={(e) => setFormData({ ...formData, canViewMedicalContacts: e.target.checked })}
                      className="w-5 h-5 sm:w-4 sm:h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] cursor-pointer"
                    />
                    <span className="text-sm sm:text-base text-[#2C2A29]">Medical Contacts</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer touch-target">
                    <input
                      type="checkbox"
                      checked={formData.canViewFuneralPreferences}
                      onChange={(e) => setFormData({ ...formData, canViewFuneralPreferences: e.target.checked })}
                      className="w-5 h-5 sm:w-4 sm:h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] cursor-pointer"
                    />
                    <span className="text-sm sm:text-base text-[#2C2A29]">Life Event Preferences</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer touch-target">
                    <input
                      type="checkbox"
                      checked={formData.canViewDocuments}
                      onChange={(e) => setFormData({ ...formData, canViewDocuments: e.target.checked })}
                      className="w-5 h-5 sm:w-4 sm:h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] cursor-pointer"
                    />
                    <span className="text-sm sm:text-base text-[#2C2A29]">Documents</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer touch-target">
                    <input
                      type="checkbox"
                      checked={formData.canViewLetters}
                      onChange={(e) => setFormData({ ...formData, canViewLetters: e.target.checked })}
                      className="w-5 h-5 sm:w-4 sm:h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A] cursor-pointer"
                    />
                    <span className="text-sm sm:text-base text-[#2C2A29]">Letters</span>
                  </label>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 min-h-[48px] border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors touch-target font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 touch-target font-medium"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Contact' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        )}

        {contacts.length === 0 ? (
          <div className="bg-[#FCFAF7] rounded-lg p-8 sm:p-12 text-center">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-[#2C2A29] mb-2">No trusted contacts yet</h3>
            <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 px-4">
              Add people who should have access to your information when the time comes
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-[#FCFAF7] rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    {contact.avatarUrl ? (
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#A5B99A] shadow-sm flex-shrink-0">
                        <img
                          src={contact.avatarUrl}
                          alt={contact.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-medium text-[#2C2A29] mb-1 truncate">{contact.name}</h3>
                      <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mb-1">{contact.relationship}</p>
                      <a href={`mailto:${contact.email}`} className="text-xs sm:text-sm text-[#2C2A29] opacity-60 mb-1 block truncate hover:text-[#A5B99A] transition-colors">
                        {contact.email}
                      </a>
                      <a href={`tel:${contact.phone}`} className="text-xs sm:text-sm text-[#2C2A29] opacity-60 mb-2 block hover:text-[#A5B99A] transition-colors">
                        {contact.phone}
                      </a>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {contact.role && (
                          <span className="px-2 py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded-full text-xs font-medium">
                            {contact.role}
                          </span>
                        )}
                        {contact.status && (
                          <span className="px-2 py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] rounded-full text-xs font-medium capitalize">
                            {contact.status}
                          </span>
                        )}
                      </div>
                      {(contact.canViewPersonalDetails || contact.canViewMedicalContacts || 
                        contact.canViewFuneralPreferences || contact.canViewDocuments || contact.canViewLetters) && (
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                          <p className="text-xs text-[#2C2A29] opacity-50 mb-2">Can access:</p>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {contact.canViewPersonalDetails && (
                              <span className="px-2 py-0.5 sm:py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded text-xs">
                                Personal
                              </span>
                            )}
                            {contact.canViewMedicalContacts && (
                              <span className="px-2 py-0.5 sm:py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] rounded text-xs">
                                Medical
                              </span>
                            )}
                            {contact.canViewFuneralPreferences && (
                              <span className="px-2 py-0.5 sm:py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded text-xs">
                                Funeral
                              </span>
                            )}
                            {contact.canViewDocuments && (
                              <span className="px-2 py-0.5 sm:py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] rounded text-xs">
                                Documents
                              </span>
                            )}
                            {contact.canViewLetters && (
                              <span className="px-2 py-0.5 sm:py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded text-xs">
                                Letters
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end sm:justify-start space-x-2 sm:space-x-2 border-t sm:border-t-0 border-gray-200 pt-3 sm:pt-0">
                    <button
                      onClick={() => handleSendInvite(contact.id)}
                      disabled={sendingInvite === contact.id}
                      className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-[#A5B99A] hover:bg-white rounded-lg transition-colors disabled:opacity-50 touch-target flex items-center justify-center"
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
                      className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-[#93B0C8] hover:bg-white rounded-lg transition-colors touch-target flex items-center justify-center"
                      title="Edit contact"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-red-600 hover:bg-white rounded-lg transition-colors touch-target flex items-center justify-center"
                      title="Delete contact"
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
