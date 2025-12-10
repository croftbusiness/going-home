'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, User, Heart, FileText, Upload, Mail, Users, Key, DollarSign, Video, CheckSquare, BookOpen, Building2, Home as HomeIcon, Baby, Shield } from 'lucide-react';

export default function FinalSummaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await fetch('/api/user/final-summary');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-[#2C2A29]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
            <div className="p-2 sm:p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl flex-shrink-0">
              <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#2C2A29]">Final Arrangements Summary</h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Complete overview of all your information and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal Details */}
          {summary?.personalDetails && (
            <SectionCard
              icon={User}
              title="Personal Details"
              color="bg-[#A5B99A]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="break-words">
                  <span className="font-medium">Full Name:</span> {summary.personalDetails.full_name}
                </div>
                {summary.personalDetails.preferred_name && (
                  <div className="break-words">
                    <span className="font-medium">Preferred Name:</span> {summary.personalDetails.preferred_name}
                  </div>
                )}
                <div className="break-words">
                  <span className="font-medium">Date of Birth:</span> {summary.personalDetails.date_of_birth}
                </div>
                <div className="break-words">
                  <span className="font-medium">Phone:</span> {summary.personalDetails.phone}
                </div>
                <div className="col-span-1 sm:col-span-2 break-words">
                  <span className="font-medium">Address:</span> {summary.personalDetails.address}, {summary.personalDetails.city}, {summary.personalDetails.state} {summary.personalDetails.zip_code}
                </div>
              </div>
            </SectionCard>
          )}

          {/* Medical Contacts */}
          {summary?.medicalContacts && (
            <SectionCard
              icon={Heart}
              title="Medical & Legal Contacts"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-2 text-sm">
                {summary.medicalContacts.physician_name && (
                  <div>
                    <span className="font-medium">Physician:</span> {summary.medicalContacts.physician_name}
                    {summary.medicalContacts.physician_phone && ` - ${summary.medicalContacts.physician_phone}`}
                  </div>
                )}
                {summary.medicalContacts.lawyer_name && (
                  <div>
                    <span className="font-medium">Lawyer:</span> {summary.medicalContacts.lawyer_name}
                    {summary.medicalContacts.lawyer_phone && ` - ${summary.medicalContacts.lawyer_phone}`}
                  </div>
                )}
                {summary.medicalContacts.medical_notes && (
                  <div className="mt-2">
                    <span className="font-medium">Notes:</span> {summary.medicalContacts.medical_notes}
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Funeral Preferences */}
          {summary?.funeralPreferences && (
            <SectionCard
              icon={FileText}
              title="Funeral Preferences"
              color="bg-[#A5B99A]"
            >
              <div className="space-y-2 text-sm">
                {summary.funeralPreferences.burial_or_cremation && (
                  <div>
                    <span className="font-medium">Preference:</span> {summary.funeralPreferences.burial_or_cremation}
                  </div>
                )}
                {summary.funeralPreferences.funeral_home && (
                  <div>
                    <span className="font-medium">Funeral Home:</span> {summary.funeralPreferences.funeral_home}
                  </div>
                )}
                {summary.funeralPreferences.service_type && (
                  <div>
                    <span className="font-medium">Service Type:</span> {summary.funeralPreferences.service_type}
                  </div>
                )}
                {summary.funeralPreferences.atmosphere_wishes && (
                  <div>
                    <span className="font-medium">Atmosphere Wishes:</span> {summary.funeralPreferences.atmosphere_wishes}
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Documents */}
          {summary?.documents && summary.documents.length > 0 && (
            <SectionCard
              icon={Upload}
              title="Documents"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-2">
                {summary.documents.map((doc: any) => (
                  <div key={doc.id} className="text-sm">
                    <span className="font-medium">{doc.document_type}:</span> {doc.file_name}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Letters */}
          {summary?.letters && summary.letters.length > 0 && (
            <SectionCard
              icon={Mail}
              title="Letters to Loved Ones"
              color="bg-[#A5B99A]"
            >
              <div className="space-y-3">
                {summary.letters.map((letter: any) => (
                  <div key={letter.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm mb-1">{letter.title || 'Untitled'}</div>
                    <div className="text-xs text-[#2C2A29] opacity-70">
                      To: {letter.recipient_relationship}
                    </div>
                    {letter.message_text && (
                      <div className="text-sm mt-2 text-[#2C2A29] opacity-80">
                        {letter.message_text.substring(0, 200)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Trusted Contacts */}
          {summary?.trustedContacts && summary.trustedContacts.length > 0 && (
            <SectionCard
              icon={Users}
              title="Trusted Contacts"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-2">
                {summary.trustedContacts.map((contact: any) => (
                  <div key={contact.id} className="text-sm">
                    <span className="font-medium">{contact.name}</span> ({contact.relationship}) - {contact.email}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Digital Accounts */}
          {summary?.digitalAccounts && summary.digitalAccounts.length > 0 && (
            <SectionCard
              icon={Key}
              title="Digital Accounts"
              color="bg-[#A5B99A]"
            >
              <div className="space-y-2">
                {summary.digitalAccounts.map((account: any) => (
                  <div key={account.id} className="text-sm">
                    <span className="font-medium">{account.account_name}</span> ({account.account_type})
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Assets */}
          {summary?.assets && summary.assets.length > 0 && (
            <SectionCard
              icon={DollarSign}
              title="Assets"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-2">
                {summary.assets.map((asset: any) => (
                  <div key={asset.id} className="text-sm">
                    <span className="font-medium">{asset.name}</span> ({asset.asset_type})
                    {asset.estimated_value && ` - ${asset.estimated_value}`}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Legacy Messages */}
          {summary?.legacyMessages && summary.legacyMessages.length > 0 && (
            <SectionCard
              icon={Video}
              title="Legacy Messages"
              color="bg-[#A5B99A]"
            >
              <div className="space-y-2">
                {summary.legacyMessages.map((msg: any) => (
                  <div key={msg.id} className="text-sm">
                    <span className="font-medium">{msg.title}</span> ({msg.message_type})
                    {msg.recipient_name && ` - For: ${msg.recipient_name}`}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* End of Life Checklist */}
          {summary?.endOfLifeChecklist && (
            <SectionCard
              icon={CheckSquare}
              title="End-of-Life Checklist"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-2 text-sm">
                {summary.endOfLifeChecklist.organ_donation_preference && (
                  <div>
                    <span className="font-medium">Organ Donation:</span> {summary.endOfLifeChecklist.organ_donation_preference}
                  </div>
                )}
                {summary.endOfLifeChecklist.last_words && (
                  <div>
                    <span className="font-medium">Last Words:</span> {summary.endOfLifeChecklist.last_words.substring(0, 200)}...
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Biography */}
          {summary?.biography && (
            <SectionCard
              icon={BookOpen}
              title="Personal Biography"
              color="bg-[#A5B99A]"
            >
              <div className="space-y-3 text-sm">
                {summary.biography.life_story && (
                  <div>
                    <span className="font-medium">Life Story:</span>
                    <p className="mt-1 text-[#2C2A29] opacity-80">{summary.biography.life_story.substring(0, 300)}...</p>
                  </div>
                )}
                {summary.biography.major_accomplishments && (
                  <div>
                    <span className="font-medium">Major Accomplishments:</span>
                    <p className="mt-1 text-[#2C2A29] opacity-80">{summary.biography.major_accomplishments.substring(0, 200)}...</p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Insurance & Financial */}
          {summary?.insuranceFinancial && summary.insuranceFinancial.length > 0 && (
            <SectionCard
              icon={Building2}
              title="Insurance & Financial Contacts"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-2">
                {summary.insuranceFinancial.map((contact: any) => (
                  <div key={contact.id} className="text-sm">
                    <span className="font-medium">{contact.company_name || contact.contact_type}</span>
                    {contact.policy_number && ` - Policy: ${contact.policy_number}`}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Household */}
          {summary?.household && (
            <SectionCard
              icon={HomeIcon}
              title="Household Information"
              color="bg-[#A5B99A]"
            >
              <div className="space-y-2 text-sm">
                {summary.household.pet_care_instructions && (
                  <div>
                    <span className="font-medium">Pet Care:</span> {summary.household.pet_care_instructions.substring(0, 200)}...
                  </div>
                )}
                {summary.household.home_access_codes && (
                  <div>
                    <span className="font-medium">Access Codes:</span> Available
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Children's Wishes */}
          {summary?.childrenWishes && summary.childrenWishes.length > 0 && (
            <SectionCard
              icon={Baby}
              title="Children's Wishes"
              color="bg-[#93B0C8]"
            >
              <div className="space-y-3">
                {summary.childrenWishes.map((wish: any) => (
                  <div key={wish.id} className="p-3 bg-gray-50 rounded-lg">
                    {wish.child_name && (
                      <div className="font-medium text-sm mb-1">{wish.child_name}</div>
                    )}
                    {wish.guardian_name && (
                      <div className="text-xs text-[#2C2A29] opacity-70">
                        Guardian: {wish.guardian_name}
                      </div>
                    )}
                    {wish.personal_message && (
                      <div className="text-sm mt-2 text-[#2C2A29] opacity-80">
                        {wish.personal_message.substring(0, 200)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Release Settings */}
          {summary?.releaseSettings && (
            <SectionCard
              icon={Shield}
              title="Release Settings"
              color="bg-[#93B0C8]"
            >
              <div className="text-sm">
                <div>
                  <span className="font-medium">Account Status:</span> {summary.releaseSettings.is_locked ? 'Locked' : 'Unlocked'}
                </div>
                {summary.releaseSettings.release_activated && (
                  <div>
                    <span className="font-medium">Release Activated:</span> Yes
                    {summary.releaseSettings.release_activated_at && ` on ${new Date(summary.releaseSettings.release_activated_at).toLocaleDateString()}`}
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: any;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-3 sm:mb-4">
        <div className={`p-2 ${color} bg-opacity-10 rounded-lg flex-shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-[#2C2A29]">{title}</h2>
      </div>
      <div className="text-[#2C2A29]">
        {children}
      </div>
    </div>
  );
}

