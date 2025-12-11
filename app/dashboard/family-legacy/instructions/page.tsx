'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Save } from 'lucide-react';

interface Instructions {
  id?: string;
  whatToDoFirst?: string;
  whereThingsAreLocated?: string;
  importantContacts?: string;
  homeQuirks?: string;
  petCare?: string;
}

export default function InstructionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Instructions>({
    whatToDoFirst: '',
    whereThingsAreLocated: '',
    importantContacts: '',
    homeQuirks: '',
    petCare: '',
  });

  useEffect(() => {
    loadInstructions();
  }, []);

  const loadInstructions = async () => {
    try {
      const response = await fetch('/api/user/family-legacy/instructions');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load instructions');
      }
      const data = await response.json();
      if (data.instructions) {
        setFormData({
          whatToDoFirst: data.instructions.whatToDoFirst || '',
          whereThingsAreLocated: data.instructions.whereThingsAreLocated || '',
          importantContacts: data.instructions.importantContacts || '',
          homeQuirks: data.instructions.homeQuirks || '',
          petCare: data.instructions.petCare || '',
        });
      }
    } catch (error) {
      console.error('Failed to load instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/family-legacy/instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save instructions');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save instructions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A5B99A] mx-auto mb-4"></div>
          <p className="text-[#2C2A29] opacity-70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2A29] mb-2">Important Instructions</h1>
          <p className="text-[#2C2A29] opacity-70">Leave helpful guidance for handling your affairs</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg">
            Saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8 space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This is like a "cheat sheet" for your loved ones. Be clear and practical.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              What to Do First (Optional)
            </label>
            <textarea
              name="whatToDoFirst"
              value={formData.whatToDoFirst}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
              placeholder="Immediate steps: notify family, call attorney, contact funeral home..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Where Things Are Located (Optional)
            </label>
            <textarea
              name="whereThingsAreLocated"
              value={formData.whereThingsAreLocated}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
              placeholder="Important documents: file cabinet, top drawer, safe...&#10;Keys: kitchen drawer, key hook...&#10;Passwords: password manager, notebook..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Important Contacts (Optional)
            </label>
            <textarea
              name="importantContacts"
              value={formData.importantContacts}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
              placeholder="Attorney: John Smith, (555) 123-4567&#10;Financial Advisor: Jane Doe, (555) 987-6543&#10;Pastor: Rev. Johnson, (555) 456-7890..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Home Quirks & Important Info (Optional)
            </label>
            <textarea
              name="homeQuirks"
              value={formData.homeQuirks}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
              placeholder="The front door sticks in winter, the breaker box is in the garage, water shutoff is in the basement..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Pet Care Instructions (Optional)
            </label>
            <textarea
              name="petCare"
              value={formData.petCare}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
              placeholder="Feeding schedule: twice daily, 1 cup each&#10;Medications: heartworm prevention on the 1st, flea treatment monthly&#10;Vet: Dr. Brown at Animal Hospital, (555) 234-5678&#10;Special needs: Max needs daily walks, avoid loud noises..."
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Instructions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



