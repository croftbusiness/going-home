'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Heart,
  FileText,
  Shield,
  Phone,
  Mail,
  AlertCircle,
  Building2,
  FileCheck,
  Info,
  ChevronDown,
  Stethoscope,
  Home,
  Plane,
} from 'lucide-react';

type Situation = 'medical-emergency' | 'hospitalization' | 'incapacitated' | 'traveling' | 'death';

interface PreparednessData {
  trustedContacts: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
  medicalInfo: {
    physicianName?: string;
    physicianPhone?: string;
    medicalNotes?: string;
  } | null;
  insuranceInfo: Array<{
    contactType: string;
    companyName?: string;
    policyNumber?: string;
  }>;
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    note?: string;
  }>;
  criticalInstructions: Array<{
    type: string;
    content: string;
  }>;
}

const situations: Array<{ value: Situation; label: string; icon: any; subtle?: boolean }> = [
  { value: 'medical-emergency', label: 'Medical Emergency', icon: Stethoscope },
  { value: 'hospitalization', label: 'Hospitalization', icon: Heart },
  { value: 'incapacitated', label: 'Incapacitated', icon: AlertCircle },
  { value: 'traveling', label: 'Traveling', icon: Plane },
  { value: 'death', label: 'Death', icon: Home, subtle: true },
];

export default function IfSomethingHappensPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedSituation, setSelectedSituation] = useState<Situation>('medical-emergency');
  const [showSituationDropdown, setShowSituationDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PreparednessData>({
    trustedContacts: [],
    medicalInfo: null,
    insuranceInfo: [],
    documents: [],
    criticalInstructions: [],
  });

  useEffect(() => {
    loadPreparednessData();
  }, []);

  const loadPreparednessData = async () => {
    try {
      // Try to load from cache first (for offline support)
      const cachedData = localStorage.getItem('preparedness_snapshot');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          // Only use cache if it's less than 1 hour old
          if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
            setData(parsed.data);
            setLoading(false);
          }
        } catch (e) {
          // Invalid cache, continue to fetch
        }
      }

      const [contactsRes, medicalRes, insuranceRes, documentsRes, personalRes] = await Promise.all([
        fetch('/api/user/trusted-contacts').catch(() => ({ ok: false })),
        fetch('/api/user/medical-contacts').catch(() => ({ ok: false })),
        fetch('/api/user/insurance-financial').catch(() => ({ ok: false })),
        fetch('/api/user/documents').catch(() => ({ ok: false })),
        fetch('/api/user/personal-details').catch(() => ({ ok: false })),
      ]);

      const trustedContacts = contactsRes.ok ? (await contactsRes.json()).trustedContacts || [] : [];
      const medicalInfo = medicalRes.ok ? (await medicalRes.json()).medicalContacts : null;
      const insuranceData = insuranceRes.ok ? (await insuranceRes.json()).contacts || [] : [];
      const documentsData = documentsRes.ok ? (await documentsRes.json()).documents || [] : [];
      const personalData = personalRes.ok ? (await personalRes.json()).personalDetails : null;

      // Build critical instructions from various sources
      const criticalInstructions: Array<{ type: string; content: string }> = [];
      
      if (personalData?.emergencyContactName) {
        criticalInstructions.push({
          type: 'Emergency Contact',
          content: `Primary emergency contact: ${personalData.emergencyContactName} (${personalData.emergencyContactPhone})`,
        });
      }

      if (medicalInfo?.medicalNotes) {
        criticalInstructions.push({
          type: 'Medical Notes',
          content: medicalInfo.medicalNotes,
        });
      }

      const newData = {
        trustedContacts: trustedContacts.map((tc: any) => ({
          id: tc.id,
          name: tc.name,
          email: tc.email,
          phone: tc.phone,
          relationship: tc.relationship,
        })),
        medicalInfo,
        insuranceInfo: insuranceData.map((ins: any) => ({
          contactType: ins.contactType,
          companyName: ins.companyName,
          policyNumber: ins.policyNumber,
        })),
        documents: documentsData.map((doc: any) => ({
          id: doc.id,
          documentType: doc.documentType,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          note: doc.note,
        })),
        criticalInstructions,
      };

      setData(newData);
      setError(null);

      // Cache the data for offline access
      try {
        localStorage.setItem('preparedness_snapshot', JSON.stringify({
          data: newData,
          timestamp: Date.now(),
        }));
      } catch (e) {
        // Ignore localStorage errors
      }
    } catch (error) {
      console.error('Error loading preparedness data:', error);
      setError('Unable to load some information. Showing last available data.');
      // Try to load from cache as fallback
      const cachedData = localStorage.getItem('preparedness_snapshot');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setData(parsed.data);
        } catch (e) {
          // Invalid cache
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getEmphasizedSections = () => {
    switch (selectedSituation) {
      case 'medical-emergency':
        return ['medical', 'contacts'];
      case 'hospitalization':
        return ['medical', 'contacts', 'insurance'];
      case 'incapacitated':
        return ['contacts', 'documents', 'instructions'];
      case 'traveling':
        return ['documents', 'insurance', 'contacts'];
      case 'death':
        return ['contacts', 'documents', 'instructions'];
      default:
        return [];
    }
  };

  const emphasizedSections = getEmphasizedSections();
  const selectedSituationData = situations.find(s => s.value === selectedSituation);
  const SituationIcon = selectedSituationData?.icon || Info;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A5B99A]"></div>
          <p className="text-[#2C2A29] opacity-60">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A5B99A]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#93B0C8]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2A29] mb-3">
            If Something Happens
          </h1>
          <p className="text-base sm:text-lg text-[#2C2A29] opacity-70 font-light">
            Essential information when you need it most
          </p>
        </div>

        {/* Situation Selector */}
        <div className="mb-8 relative">
          <label className="block text-sm font-medium text-[#2C2A29] opacity-70 mb-2">
            Situation
          </label>
          <div className="relative">
            <button
              onClick={() => setShowSituationDropdown(!showSituationDropdown)}
              className="w-full bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-[#A5B99A] transition-all duration-200 flex items-center justify-between group"
              aria-label="Select situation"
              aria-expanded={showSituationDropdown}
              aria-haspopup="listbox"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#A5B99A]/10 rounded-lg">
                  <SituationIcon className="w-5 h-5 text-[#A5B99A]" />
                </div>
                <span className="text-[#2C2A29] font-medium">
                  {selectedSituationData?.label || 'Select a situation'}
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-[#2C2A29] opacity-50 transition-transform duration-200 ${
                  showSituationDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showSituationDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSituationDropdown(false)}
                />
                <div 
                  className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-lg rounded-xl border border-gray-200/50 shadow-xl overflow-hidden"
                  role="listbox"
                >
                  {situations.map((situation) => {
                    const Icon = situation.icon;
                    return (
                      <button
                        key={situation.value}
                        onClick={() => {
                          setSelectedSituation(situation.value);
                          setShowSituationDropdown(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-[#A5B99A]/5 transition-colors ${
                          selectedSituation === situation.value ? 'bg-[#A5B99A]/10' : ''
                        } ${situation.subtle ? 'opacity-70' : ''}`}
                        role="option"
                        aria-selected={selectedSituation === situation.value}
                      >
                        <Icon className={`w-5 h-5 ${situation.subtle ? 'text-[#2C2A29] opacity-50' : 'text-[#A5B99A]'}`} />
                        <span className={`text-[#2C2A29] font-medium ${situation.subtle ? 'opacity-70' : ''}`}>
                          {situation.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Banner (if network issues) */}
        {error && (
          <div className="mb-6 p-4 bg-[#EBD9B5]/20 border border-[#EBD9B5]/30 rounded-xl">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-[#EBD9B5] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#2C2A29] opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Preparedness Snapshot */}
        <div className="space-y-6">
          {/* Emergency & Trusted Contacts */}
          {(emphasizedSections.includes('contacts') || data.trustedContacts.length > 0) && (
            <section
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border ${
                emphasizedSections.includes('contacts')
                  ? 'border-[#A5B99A] shadow-lg'
                  : 'border-gray-200/50'
              } transition-all duration-300`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-[#93B0C8]/10 rounded-xl">
                  <Users className="w-6 h-6 text-[#93B0C8]" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C2A29]">Emergency & Trusted Contacts</h2>
              </div>
              {data.trustedContacts.length > 0 ? (
                <div className="space-y-4">
                  {data.trustedContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 bg-[#FAF9F7] rounded-xl border border-gray-200/30"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#2C2A29] mb-1">{contact.name}</h3>
                          <p className="text-sm text-[#2C2A29] opacity-70 mb-2">
                            {contact.relationship}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 text-sm">
                            {contact.phone && (
                              <div className="flex items-center space-x-2 text-[#2C2A29] opacity-80">
                                <Phone className="w-4 h-4" />
                                <a href={`tel:${contact.phone}`} className="hover:text-[#93B0C8]">
                                  {contact.phone}
                                </a>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center space-x-2 text-[#2C2A29] opacity-80">
                                <Mail className="w-4 h-4" />
                                <a href={`mailto:${contact.email}`} className="hover:text-[#93B0C8]">
                                  {contact.email}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#2C2A29] opacity-60 mb-2">No contacts available</p>
                  <Link
                    href="/dashboard/trusted-contacts"
                    className="text-sm text-[#93B0C8] hover:text-[#A5B99A] transition-colors"
                  >
                    Add contacts →
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Medical Summary */}
          {(emphasizedSections.includes('medical') || data.medicalInfo) && (
            <section
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border ${
                emphasizedSections.includes('medical')
                  ? 'border-[#A5B99A] shadow-lg'
                  : 'border-gray-200/50'
              } transition-all duration-300`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-[#A5B99A]/10 rounded-xl">
                  <Heart className="w-6 h-6 text-[#A5B99A]" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C2A29]">Medical Summary</h2>
              </div>
              {data.medicalInfo ? (
                <div className="space-y-4">
                  {data.medicalInfo.physicianName && (
                    <div className="p-4 bg-[#FAF9F7] rounded-xl border border-gray-200/30">
                      <h3 className="font-semibold text-[#2C2A29] mb-1">Primary Physician</h3>
                      <p className="text-[#2C2A29] opacity-80">{data.medicalInfo.physicianName}</p>
                      {data.medicalInfo.physicianPhone && (
                        <div className="flex items-center space-x-2 mt-2 text-sm text-[#2C2A29] opacity-70">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${data.medicalInfo.physicianPhone}`} className="hover:text-[#A5B99A]">
                            {data.medicalInfo.physicianPhone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {data.medicalInfo.medicalNotes && (
                    <div className="p-4 bg-[#FAF9F7] rounded-xl border border-gray-200/30">
                      <h3 className="font-semibold text-[#2C2A29] mb-2">Medical Information</h3>
                      <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap">
                        {data.medicalInfo.medicalNotes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#2C2A29] opacity-60 mb-2">No medical information available</p>
                  <Link
                    href="/dashboard/medical-contacts"
                    className="text-sm text-[#93B0C8] hover:text-[#A5B99A] transition-colors"
                  >
                    Add medical information →
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Insurance Overview */}
          {(emphasizedSections.includes('insurance') || data.insuranceInfo.length > 0) && (
            <section
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border ${
                emphasizedSections.includes('insurance')
                  ? 'border-[#A5B99A] shadow-lg'
                  : 'border-gray-200/50'
              } transition-all duration-300`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-[#93B0C8]/10 rounded-xl">
                  <Building2 className="w-6 h-6 text-[#93B0C8]" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C2A29]">Insurance Overview</h2>
              </div>
              {data.insuranceInfo.length > 0 ? (
                <div className="space-y-4">
                  {data.insuranceInfo.map((insurance, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[#FAF9F7] rounded-xl border border-gray-200/30"
                    >
                      <h3 className="font-semibold text-[#2C2A29] mb-1">
                        {insurance.contactType || 'Insurance'}
                      </h3>
                      {insurance.companyName && (
                        <p className="text-[#2C2A29] opacity-80 mb-1">{insurance.companyName}</p>
                      )}
                      {insurance.policyNumber && (
                        <p className="text-sm text-[#2C2A29] opacity-70">
                          Policy: {insurance.policyNumber}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#2C2A29] opacity-60 mb-2">No insurance information available</p>
                  <Link
                    href="/dashboard/insurance-financial"
                    className="text-sm text-[#93B0C8] hover:text-[#A5B99A] transition-colors"
                  >
                    Add insurance information →
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Important Documents */}
          {(emphasizedSections.includes('documents') || data.documents.length > 0) && (
            <section
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border ${
                emphasizedSections.includes('documents')
                  ? 'border-[#A5B99A] shadow-lg'
                  : 'border-gray-200/50'
              } transition-all duration-300`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-[#A5B99A]/10 rounded-xl">
                  <FileText className="w-6 h-6 text-[#A5B99A]" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C2A29]">Important Documents</h2>
              </div>
              {data.documents.length > 0 ? (
                <div className="space-y-4">
                  {data.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 bg-[#FAF9F7] rounded-xl border border-gray-200/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#2C2A29] mb-1 capitalize">
                            {doc.documentType}
                          </h3>
                          <p className="text-sm text-[#2C2A29] opacity-70 mb-2">{doc.fileName}</p>
                          {doc.note && (
                            <p className="text-sm text-[#2C2A29] opacity-60 italic">{doc.note}</p>
                          )}
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 p-2 text-[#93B0C8] hover:bg-[#93B0C8]/10 rounded-lg transition-colors"
                        >
                          <FileCheck className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#2C2A29] opacity-60 mb-2">No documents available</p>
                  <Link
                    href="/dashboard/documents"
                    className="text-sm text-[#93B0C8] hover:text-[#A5B99A] transition-colors"
                  >
                    Upload documents →
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Critical Instructions */}
          {(emphasizedSections.includes('instructions') || data.criticalInstructions.length > 0) && (
            <section
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border ${
                emphasizedSections.includes('instructions')
                  ? 'border-[#A5B99A] shadow-lg'
                  : 'border-gray-200/50'
              } transition-all duration-300`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-[#93B0C8]/10 rounded-xl">
                  <Info className="w-6 h-6 text-[#93B0C8]" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C2A29]">Critical Instructions</h2>
              </div>
              {data.criticalInstructions.length > 0 ? (
                <div className="space-y-4">
                  {data.criticalInstructions.map((instruction, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[#FAF9F7] rounded-xl border border-gray-200/30"
                    >
                      <h3 className="font-semibold text-[#2C2A29] mb-2">{instruction.type}</h3>
                      <p className="text-[#2C2A29] opacity-80 whitespace-pre-wrap">
                        {instruction.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#2C2A29] opacity-60 mb-2">No critical instructions available</p>
                  <p className="text-xs text-[#2C2A29] opacity-50">
                    Instructions will appear here when you add emergency contacts or medical notes
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/30">
          <p className="text-sm text-[#2C2A29] opacity-60 text-center">
            This is a read-only view. To update information, visit the respective sections in your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

