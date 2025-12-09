'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

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
  { value: 'life_insurance', label: 'Life Insurance' },
  { value: 'burial_insurance', label: 'Burial Insurance' },
  { value: 'retirement_account', label: 'Retirement Account' },
  { value: 'employer_benefits', label: 'Employer Benefits' },
  { value: 'financial_advisor', label: 'Financial Advisor' },
  { value: 'other', label: 'Other' },
];

export default function InsuranceFinancialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contacts, setContacts] = useState<InsuranceFinancial[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
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
    } catch (err: any) {
      setError(err.message || 'Failed to save contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

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
              <div className="p-3 bg-[#93B0C8] bg-opacity-10 rounded-xl">
                <Building2 className="w-6 h-6 text-[#93B0C8]" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-[#2C2A29]">Insurance & Financial Contacts</h1>
                <p className="text-[#2C2A29] opacity-70 mt-1">
                  Important financial and insurance information
                </p>
              </div>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#2C2A29]">Add New Contact</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ContactForm
              contact={{}}
              onSave={handleSave}
              onCancel={() => setShowAddForm(false)}
              saving={saving}
            />
          </div>
        )}

        {contacts.length === 0 && !showAddForm ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Contacts Yet</h3>
            <p className="text-[#2C2A29] opacity-70 mb-4">
              Start by adding your insurance and financial contacts
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
            >
              Add Your First Contact
            </button>
          </div>
        ) : (
          <div className="space-y-4">
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
      </div>
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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <ContactForm
          contact={contact}
          onSave={onSave}
          onCancel={onCancel}
          saving={saving}
        />
      </div>
    );
  }

  const contactTypeLabel = CONTACT_TYPES.find(t => t.value === contact.contactType)?.label || contact.contactType;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] text-sm font-medium rounded-lg">
              {contactTypeLabel}
            </span>
          </div>
          {contact.companyName && (
            <h3 className="text-xl font-semibold text-[#2C2A29] mb-2">{contact.companyName}</h3>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm text-[#2C2A29] opacity-70">
            {contact.contactName && (
              <p><span className="font-medium">Contact:</span> {contact.contactName}</p>
            )}
            {contact.contactPhone && (
              <p><span className="font-medium">Phone:</span> {contact.contactPhone}</p>
            )}
            {contact.contactEmail && (
              <p><span className="font-medium">Email:</span> {contact.contactEmail}</p>
            )}
            {contact.policyNumber && (
              <p><span className="font-medium">Policy #:</span> {contact.policyNumber}</p>
            )}
            {contact.accountNumber && (
              <p><span className="font-medium">Account #:</span> {contact.accountNumber}</p>
            )}
            {contact.contactAddress && (
              <p className="col-span-2"><span className="font-medium">Address:</span> {contact.contactAddress}</p>
            )}
          </div>
          {contact.notes && (
            <p className="text-sm text-[#2C2A29] opacity-70 mt-3">
              <span className="font-medium">Notes:</span> {contact.notes}
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
            onClick={() => contact.id && onDelete(contact.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Contact Type *
          </label>
          <select
            value={formData.contactType || ''}
            onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
            required
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          >
            <option value="">Select type</option>
            {CONTACT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={formData.companyName || ''}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Policy Number
          </label>
          <input
            type="text"
            value={formData.policyNumber || ''}
            onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Account Number
          </label>
          <input
            type="text"
            value={formData.accountNumber || ''}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Contact Name
          </label>
          <input
            type="text"
            value={formData.contactName || ''}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            value={formData.contactPhone || ''}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Contact Email
          </label>
          <input
            type="email"
            value={formData.contactEmail || ''}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2A29] mb-2">
            Contact Address
          </label>
          <input
            type="text"
            value={formData.contactAddress || ''}
            onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
          />
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
          placeholder="Additional notes..."
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

