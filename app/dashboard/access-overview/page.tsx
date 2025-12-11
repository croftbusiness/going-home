'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit, Trash2, Mail, Eye, RefreshCw, User, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface TrustedContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  role: string;
  status: string;
  canViewPersonalDetails: boolean;
  canViewMedicalContacts: boolean;
  canViewFuneralPreferences: boolean;
  canViewDocuments: boolean;
  canViewLetters: boolean;
  avatarUrl?: string;
}

export default function AccessOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/user/trusted-contacts');
      if (!response.ok) throw new Error('Failed to load contacts');
      const data = await response.json();
      setContacts(data.trustedContacts || []);
    } catch (error) {
      setError('Failed to load trusted contacts');
    } finally {
      setLoading(false);
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

      if (!response.ok) {
        const data = await response.json();
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

  const handleViewAs = (contact: TrustedContact) => {
    // Store simulation session
    const simulationSession = {
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        role: contact.role,
        relationship: contact.relationship,
        ownerId: '', // Will be set on viewer dashboard
      },
      permissions: {
        personalDetails: contact.canViewPersonalDetails,
        medicalContacts: contact.canViewMedicalContacts,
        funeralPreferences: contact.canViewFuneralPreferences,
        documents: contact.canViewDocuments,
        letters: contact.canViewLetters,
      },
      isSimulation: true,
    };

    localStorage.setItem('viewer_session', JSON.stringify(simulationSession));
    router.push('/viewer/dashboard?simulation=true');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'invited':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'removed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'invited':
        return 'bg-yellow-100 text-yellow-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Who Has Access</h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Manage trusted viewers and their permissions
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No trusted contacts yet</p>
                      <Link
                        href="/dashboard/trusted-contacts"
                        className="mt-4 inline-block text-[#A5B99A] hover:text-[#93B0C8]"
                      >
                        Add your first trusted contact
                      </Link>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {contact.avatarUrl ? (
                            <Image
                              src={contact.avatarUrl}
                              alt={contact.name}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] flex items-center justify-center text-white font-semibold">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-[#2C2A29]">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                            <div className="text-xs text-gray-400">{contact.relationship}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-[#2C2A29]">{contact.role}</div>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                            {getStatusIcon(contact.status)}
                            <span className="capitalize">{contact.status}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.canViewPersonalDetails && (
                            <span className="px-2 py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded text-xs">
                              Personal
                            </span>
                          )}
                          {contact.canViewMedicalContacts && (
                            <span className="px-2 py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] rounded text-xs">
                              Medical
                            </span>
                          )}
                          {contact.canViewFuneralPreferences && (
                            <span className="px-2 py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded text-xs">
                              Funeral
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
                          {!contact.canViewPersonalDetails && 
                           !contact.canViewMedicalContacts && 
                           !contact.canViewFuneralPreferences && 
                           !contact.canViewDocuments && 
                           !contact.canViewLetters && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                              No access
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewAs(contact)}
                            className="p-2 text-[#93B0C8] hover:bg-gray-100 rounded-lg transition-colors"
                            title="View as this viewer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendInvite(contact.id)}
                            disabled={sendingInvite === contact.id}
                            className="p-2 text-[#A5B99A] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Resend invitation"
                          >
                            {sendingInvite === contact.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            href={`/dashboard/trusted-contacts?edit=${contact.id}`}
                            className="p-2 text-[#93B0C8] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit permissions"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="p-2 text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Remove access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href="/dashboard/trusted-contacts"
            className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
          >
            Manage Trusted Contacts
          </Link>
        </div>
      </main>
    </div>
  );
}


