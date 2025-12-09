'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Heart, Calendar, Users, Lock, LogOut } from 'lucide-react';

interface ExecutorData {
  personalDetails?: any;
  medicalContacts?: any;
  funeralPreferences?: any;
  documents?: any[];
  letters?: any[];
  permissions: {
    canViewPersonalDetails: boolean;
    canViewMedicalContacts: boolean;
    canViewFuneralPreferences: boolean;
    canViewDocuments: boolean;
    canViewLetters: boolean;
  };
}

export default function ExecutorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ExecutorData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('executor_token');
    if (!token) {
      router.push('/executor/access');
      return;
    }

    try {
      const response = await fetch('/api/executor/data', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('executor_token');
          localStorage.removeItem('executor_user_id');
          router.push('/executor/access');
          return;
        }
        throw new Error('Failed to load data');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('executor_token');
    localStorage.removeItem('executor_user_id');
    router.push('/executor/access');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-[#2C2A29]">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load data'}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg"
          >
            Return to Access Page
          </button>
        </div>
      </div>
    );
  }

  const hasAnyPermission = Object.values(data.permissions).some(p => p);

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <header className="bg-[#FCFAF7] border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#A5B99A] rounded-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#2C2A29]">Executor Access</h1>
                <p className="text-sm text-[#2C2A29] opacity-70">View permitted information</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-[#2C2A29] hover:bg-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasAnyPermission ? (
          <div className="bg-[#FCFAF7] rounded-lg p-12 text-center">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Access Permissions</h3>
            <p className="text-[#2C2A29] opacity-70">
              You have been granted access, but no specific viewing permissions have been set.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal Details */}
            {data.permissions.canViewPersonalDetails && data.personalDetails && (
              <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-5 h-5 text-[#A5B99A]" />
                  <h2 className="text-lg font-medium text-[#2C2A29]">Personal Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#2C2A29] opacity-70">Full Name</p>
                    <p className="text-[#2C2A29] font-medium">{data.personalDetails.fullName}</p>
                  </div>
                  {data.personalDetails.preferredName && (
                    <div>
                      <p className="text-sm text-[#2C2A29] opacity-70">Preferred Name</p>
                      <p className="text-[#2C2A29] font-medium">{data.personalDetails.preferredName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-[#2C2A29] opacity-70">Date of Birth</p>
                    <p className="text-[#2C2A29] font-medium">{data.personalDetails.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#2C2A29] opacity-70">Email</p>
                    <p className="text-[#2C2A29] font-medium">{data.personalDetails.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#2C2A29] opacity-70">Phone</p>
                    <p className="text-[#2C2A29] font-medium">{data.personalDetails.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#2C2A29] opacity-70">Address</p>
                    <p className="text-[#2C2A29] font-medium">
                      {data.personalDetails.address}, {data.personalDetails.city}, {data.personalDetails.state} {data.personalDetails.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Contacts */}
            {data.permissions.canViewMedicalContacts && data.medicalContacts && (
              <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-5 h-5 text-[#93B0C8]" />
                  <h2 className="text-lg font-medium text-[#2C2A29]">Medical & Legal Contacts</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.medicalContacts.physicianName && (
                    <div>
                      <p className="text-sm text-[#2C2A29] opacity-70">Physician</p>
                      <p className="text-[#2C2A29] font-medium">{data.medicalContacts.physicianName}</p>
                      {data.medicalContacts.physicianPhone && (
                        <p className="text-sm text-[#2C2A29] opacity-60">{data.medicalContacts.physicianPhone}</p>
                      )}
                    </div>
                  )}
                  {data.medicalContacts.lawyerName && (
                    <div>
                      <p className="text-sm text-[#2C2A29] opacity-70">Lawyer</p>
                      <p className="text-[#2C2A29] font-medium">{data.medicalContacts.lawyerName}</p>
                      {data.medicalContacts.lawyerPhone && (
                        <p className="text-sm text-[#2C2A29] opacity-60">{data.medicalContacts.lawyerPhone}</p>
                      )}
                    </div>
                  )}
                  {data.medicalContacts.medicalNotes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-[#2C2A29] opacity-70">Medical Notes</p>
                      <p className="text-[#2C2A29]">{data.medicalContacts.medicalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Funeral Preferences */}
            {data.permissions.canViewFuneralPreferences && data.funeralPreferences && (
              <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="w-5 h-5 text-[#A5B99A]" />
                  <h2 className="text-lg font-medium text-[#2C2A29]">Funeral Preferences</h2>
                </div>
                <div className="space-y-4">
                  {data.funeralPreferences.burialOrCremation && (
                    <div>
                      <p className="text-sm text-[#2C2A29] opacity-70">Preference</p>
                      <p className="text-[#2C2A29] font-medium capitalize">{data.funeralPreferences.burialOrCremation}</p>
                    </div>
                  )}
                  {data.funeralPreferences.funeralHome && (
                    <div>
                      <p className="text-sm text-[#2C2A29] opacity-70">Funeral Home</p>
                      <p className="text-[#2C2A29] font-medium">{data.funeralPreferences.funeralHome}</p>
                    </div>
                  )}
                  {data.funeralPreferences.atmosphereWishes && (
                    <div>
                      <p className="text-sm text-[#2C2A29] opacity-70">Atmosphere & Wishes</p>
                      <p className="text-[#2C2A29]">{data.funeralPreferences.atmosphereWishes}</p>
                    </div>
                  )}
                  {(data.funeralPreferences.song1 || data.funeralPreferences.song2 || data.funeralPreferences.song3) && (
                    <div>
                      <p className="text-sm text-[#2C2A29] opacity-70 mb-2">Song Choices</p>
                      <ul className="list-disc list-inside space-y-1">
                        {data.funeralPreferences.song1 && <li className="text-[#2C2A29]">{data.funeralPreferences.song1}</li>}
                        {data.funeralPreferences.song2 && <li className="text-[#2C2A29]">{data.funeralPreferences.song2}</li>}
                        {data.funeralPreferences.song3 && <li className="text-[#2C2A29]">{data.funeralPreferences.song3}</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            {data.permissions.canViewDocuments && data.documents && data.documents.length > 0 && (
              <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-5 h-5 text-[#93B0C8]" />
                  <h2 className="text-lg font-medium text-[#2C2A29]">Documents</h2>
                </div>
                <div className="space-y-3">
                  {data.documents.map((doc: any) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-medium text-[#2C2A29]">{doc.document_type}</p>
                      {doc.note && <p className="text-sm text-[#2C2A29] opacity-70 mt-1">{doc.note}</p>}
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#93B0C8] hover:underline mt-2 inline-block"
                        >
                          View Document →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Letters */}
            {data.permissions.canViewLetters && data.letters && data.letters.length > 0 && (
              <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="w-5 h-5 text-[#A5B99A]" />
                  <h2 className="text-lg font-medium text-[#2C2A29]">Personal Letters</h2>
                </div>
                <div className="space-y-4">
                  {data.letters.map((letter: any) => (
                    <div key={letter.id} className="border border-gray-200 rounded-lg p-4">
                      {letter.title && (
                        <h3 className="font-medium text-[#2C2A29] mb-2">{letter.title}</h3>
                      )}
                      {letter.message_text && (
                        <p className="text-[#2C2A29] whitespace-pre-wrap">{letter.message_text}</p>
                      )}
                      {letter.file_url && (
                        <a
                          href={letter.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#93B0C8] hover:underline mt-2 inline-block"
                        >
                          View Attachment →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

