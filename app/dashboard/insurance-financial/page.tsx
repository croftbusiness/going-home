'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Building2, Save, Shield, CreditCard, Heart, Car, Home, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface InsuranceFinancial {
  id?: string;
  contactType: string;
  companyName?: string;
  policyNumber?: string;
  accountNumber?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  notes?: string;
}

const CONTACT_TYPES = [
  { value: 'health_insurance', label: 'Health Insurance', icon: Heart },
  { value: 'life_insurance', label: 'Life Insurance', icon: Shield },
  { value: 'auto_insurance', label: 'Auto Insurance', icon: Car },
  { value: 'home_insurance', label: 'Home Insurance', icon: Home },
  { value: 'burial_insurance', label: 'Burial Insurance', icon: Shield },
  { value: 'disability_insurance', label: 'Disability Insurance', icon: Shield },
  { value: 'retirement_account', label: 'Retirement Account', icon: CreditCard },
  { value: 'employer_benefits', label: 'Employer Benefits', icon: Briefcase },
  { value: 'financial_advisor', label: 'Financial Advisor', icon: Briefcase },
  { value: 'other', label: 'Other', icon: Building2 },
];

export default function InsuranceFinancialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contacts, setContacts] = useState<InsuranceFinancial[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/user/insurance-financial');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load contacts');
      }

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (contact: InsuranceFinancial) => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const method = contact.id ? 'PUT' : 'POST';
      const response = await fetch('/api/user/insurance-financial', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save contact');
      }

      await loadContacts();
      setEditingId(null);
      setShowAddForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this insurance/financial contact?')) return;

    try {
      const response = await fetch(`/api/user/insurance-financial?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete contact');
      await loadContacts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete contact');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A5B99A]"></div>
          <p className="text-[#2C2A29] opacity-60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/dashboard"
              className="p-1.5 sm:p-2 hover:bg-[#FAF9F7] rounded-lg transition-colors flex-shrink-0 touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#2C2A29] leading-tight">
                Insurance & Financial
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-0.5">
                All your insurance policies and financial accounts
              </p>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="p-2 sm:px-4 sm:py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center space-x-1.5 sm:space-x-2 touch-target"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-4" />
                <span className="hidden sm:inline text-sm sm:text-base font-medium">Add</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 sm:mb-6 bg-[#EBD9B5]/30 border border-[#EBD9B5] text-[#2C2A29] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base">
            Insurance information saved successfully
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-4 sm:mb-6 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#2C2A29]">Add New Insurance/Financial Account</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              >
                <X className="w-5 h-5 text-[#2C2A29]" />
              </button>
            </div>
            <ContactForm
              contact={{ contactType: '' }}
              onSave={handleSave}
              onCancel={() => setShowAddForm(false)}
              saving={saving}
            />
          </div>
        )}

        {/* Contacts List */}
        {contacts.length === 0 && !showAddForm ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center border border-gray-200/50">
            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-[#2C2A29] mb-2">No Insurance Information Yet</h3>
            <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 mb-4">
              Start by adding your insurance policies and financial accounts
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2.5 sm:py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors touch-target text-sm sm:text-base font-medium"
            >
              Add Your First Account
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                isEditing={editingId === contact.id}
                onEdit={() => setEditingId(contact.id || null)}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
                onDelete={handleDelete}
                saving={saving}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ContactCard({
  contact,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  saving,
}: {
  contact: InsuranceFinancial;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (contact: InsuranceFinancial) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  saving: boolean;
}) {
  if (isEditing) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50">
        <ContactForm
          contact={contact}
          onSave={onSave}
          onCancel={onCancel}
          saving={saving}
        />
      </div>
    );
  }

  const contactTypeData = CONTACT_TYPES.find(t => t.value === contact.contactType);
  const Icon = contactTypeData?.icon || Building2;
  const contactTypeLabel = contactTypeData?.label || contact.contactType;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
            <div className="p-1.5 sm:p-2 bg-[#93B0C8]/10 rounded-lg flex-shrink-0">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#93B0C8]" />
            </div>
            <span className="px-2 sm:px-3 py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap">
              {contactTypeLabel}
            </span>
          </div>
          {contact.companyName && (
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-[#2C2A29] mb-2 sm:mb-3 break-words">
              {contact.companyName}
            </h3>
          )}
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[#2C2A29] opacity-70">
            {contact.policyNumber && (
              <p className="break-words">
                <span className="font-medium">Policy #:</span> {contact.policyNumber}
              </p>
            )}
            {contact.accountNumber && (
              <p className="break-words">
                <span className="font-medium">Account #:</span> {contact.accountNumber}
              </p>
            )}
            {contact.contactName && (
              <p className="break-words">
                <span className="font-medium">Contact:</span> {contact.contactName}
              </p>
            )}
            {contact.contactPhone && (
              <p>
                <span className="font-medium">Phone:</span>{' '}
                <a href={`tel:${contact.contactPhone}`} className="text-[#93B0C8] hover:text-[#A5B99A]">
                  {contact.contactPhone}
                </a>
              </p>
            )}
            {contact.contactEmail && (
              <p className="break-words">
                <span className="font-medium">Email:</span>{' '}
                <a href={`mailto:${contact.contactEmail}`} className="text-[#93B0C8] hover:text-[#A5B99A] break-all">
                  {contact.contactEmail}
                </a>
              </p>
            )}
            {contact.contactAddress && (
              <p className="break-words">
                <span className="font-medium">Address:</span> {contact.contactAddress}
              </p>
            )}
          </div>
          {contact.notes && (
            <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-3 pt-3 border-t border-gray-200/50 break-words">
              <span className="font-medium">Notes:</span> {contact.notes}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            aria-label="Edit"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C2A29]" />
          </button>
          <button
            onClick={() => contact.id && onDelete(contact.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors touch-target"
            aria-label="Delete"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactForm({
  contact,
  onSave,
  onCancel,
  saving,
}: {
  contact: InsuranceFinancial;
  onSave: (contact: InsuranceFinancial) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<InsuranceFinancial>(contact);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const selectedType = CONTACT_TYPES.find(t => t.value === formData.contactType);
  const TypeIcon = selectedType?.icon || Building2;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#2C2A29] mb-2">
          Type *
        </label>
        <div className="relative">
          <select
            value={formData.contactType || ''}
            onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
            required
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base appearance-none pr-10"
          >
            <option value="">Select type</option>
            {CONTACT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {selectedType && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <TypeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#93B0C8]" />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#2C2A29] mb-2">
          Company Name
        </label>
        <input
          type="text"
          value={formData.companyName || ''}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          placeholder="Insurance company or financial institution"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#2C2A29] mb-2">
            Policy Number
          </label>
          <input
            type="text"
            value={formData.policyNumber || ''}
            onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
            placeholder="Policy or account number"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#2C2A29] mb-2">
            Account Number
          </label>
          <input
            type="text"
            value={formData.accountNumber || ''}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="Account number (if different)"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#2C2A29] mb-2">
          Contact Person Name
        </label>
        <input
          type="text"
          value={formData.contactName || ''}
          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          placeholder="Agent or representative name"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#2C2A29] mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            value={formData.contactPhone || ''}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            placeholder="Phone number"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#2C2A29] mb-2">
            Contact Email
          </label>
          <input
            type="email"
            value={formData.contactEmail || ''}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            placeholder="Email address"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#2C2A29] mb-2">
          Contact Address
        </label>
        <input
          type="text"
          value={formData.contactAddress || ''}
          onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
          placeholder="Company or agent address"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#2C2A29] mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Additional notes, coverage details, or important information..."
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent text-sm sm:text-base resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2 sm:pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-[#2C2A29] hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base font-medium touch-target"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base font-medium touch-target"
        >
          <Save className="w-4 h-4 sm:w-5 sm:h-4" />
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </form>
  );
}
