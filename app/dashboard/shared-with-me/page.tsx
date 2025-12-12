'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, Users, Mail, Calendar, CheckCircle2, Clock, User } from 'lucide-react';

interface SharedAccount {
  contactId: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerProfilePicture: string | null;
  ownerRole: string;
  myRole: string;
  relationship: string;
  status: string;
  permissions: {
    canViewPersonalDetails: boolean;
    canViewMedicalContacts: boolean;
    canViewFuneralPreferences: boolean;
    canViewDocuments: boolean;
    canViewLetters: boolean;
  };
  invitedAt: string;
}

export default function SharedWithMePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sharedAccounts, setSharedAccounts] = useState<SharedAccount[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSharedAccounts();
  }, []);

  const loadSharedAccounts = async () => {
    try {
      const response = await fetch('/api/user/shared-with-me');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load shared accounts');
      }
      const data = await response.json();
      setSharedAccounts(data.sharedAccounts || []);
    } catch (error) {
      setError('Failed to load shared accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAccount = (account: SharedAccount) => {
    // Create a simulation session for viewing this account
    const simulationSession = {
      contact: {
        id: account.contactId,
        name: account.ownerName, // This will be the owner's name
        email: account.ownerEmail,
        role: account.myRole,
        relationship: account.relationship,
        ownerId: account.ownerId,
      },
      permissions: {
        canViewPersonalDetails: account.permissions.canViewPersonalDetails,
        canViewMedicalContacts: account.permissions.canViewMedicalContacts,
        canViewFuneralPreferences: account.permissions.canViewFuneralPreferences,
        canViewDocuments: account.permissions.canViewDocuments,
        canViewLetters: account.permissions.canViewLetters,
        // Add all the new permission keys
        canViewLegacyMessages: false,
        canViewEndOfLifeDirectives: false,
        canViewEndOfLifeChecklist: false,
        canViewBiography: false,
        canViewWillQuestionnaire: false,
        canViewAssets: false,
        canViewDigitalAccounts: false,
        canViewInsuranceFinancial: false,
        canViewHousehold: false,
        canViewChildrenWishes: false,
        canViewFamilyLegacy: false,
        canViewFinalSummary: false,
        canViewReleaseSettings: false,
      },
      isSimulation: true,
    };

    localStorage.setItem('viewer_session', JSON.stringify(simulationSession));
    router.push('/viewer/dashboard?simulation=true');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'invited':
        return <Clock className="w-4 h-4 text-yellow-600" />;
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Shared With Me</h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Accounts that have shared their information with you
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {sharedAccounts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Shared Accounts</h3>
            <p className="text-[#2C2A29] opacity-70 mb-4">
              No one has shared their information with you yet.
            </p>
            <p className="text-sm text-[#2C2A29] opacity-60">
              When someone adds you as a trusted contact and sends you an invitation, their account will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sharedAccounts.map((account) => (
              <div key={account.contactId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    {account.ownerProfilePicture ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#A5B99A] shadow-sm flex-shrink-0">
                        <img
                          src={account.ownerProfilePicture}
                          alt={account.ownerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#93B0C8] to-[#A5B99A] flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                        {account.ownerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-[#2C2A29] truncate">
                          {account.ownerName}
                        </h3>
                        {account.ownerRole && (
                          <span className="px-2 py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] rounded-full text-xs font-medium">
                            {account.ownerRole}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#2C2A29] opacity-70 mb-1">
                        {account.relationship}
                      </p>
                      <p className="text-xs text-[#2C2A29] opacity-60 mb-2">
                        Your role: {account.myRole}
                      </p>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                          {getStatusIcon(account.status)}
                          <span className="capitalize">{account.status}</span>
                        </div>
                        <span className="text-xs text-[#2C2A29] opacity-50">
                          Invited {formatDate(account.invitedAt)}
                        </span>
                      </div>
                      {(account.permissions.canViewPersonalDetails || 
                        account.permissions.canViewMedicalContacts || 
                        account.permissions.canViewFuneralPreferences || 
                        account.permissions.canViewDocuments || 
                        account.permissions.canViewLetters) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-[#2C2A29] opacity-50 mb-2">You can access:</p>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {account.permissions.canViewPersonalDetails && (
                              <span className="px-2 py-0.5 sm:py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded text-xs">
                                Personal Details
                              </span>
                            )}
                            {account.permissions.canViewMedicalContacts && (
                              <span className="px-2 py-0.5 sm:py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] rounded text-xs">
                                Medical
                              </span>
                            )}
                            {account.permissions.canViewFuneralPreferences && (
                              <span className="px-2 py-0.5 sm:py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded text-xs">
                                Funeral
                              </span>
                            )}
                            {account.permissions.canViewDocuments && (
                              <span className="px-2 py-0.5 sm:py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] rounded text-xs">
                                Documents
                              </span>
                            )}
                            {account.permissions.canViewLetters && (
                              <span className="px-2 py-0.5 sm:py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded text-xs">
                                Letters
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-end space-x-2 sm:space-x-0 sm:space-y-2 border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-4 sm:ml-4">
                    <button
                      onClick={() => handleViewAccount(account)}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 min-h-[44px] bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Account</span>
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

