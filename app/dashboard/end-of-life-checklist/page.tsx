'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, Save } from 'lucide-react';

interface EndOfLifeChecklist {
  organDonationPreference?: string;
  organDonationDetails?: string;
  lastWords?: string;
  finalNotes?: string;
  prayers?: string;
  scriptures?: string;
  songs?: string;
  poems?: string;
  readings?: string;
  immediateNotifications?: string[];
  doNotDoList?: string;
  specialInstructions?: string;
}

export default function EndOfLifeChecklistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<EndOfLifeChecklist>({
    organDonationPreference: '',
    organDonationDetails: '',
    lastWords: '',
    finalNotes: '',
    prayers: '',
    scriptures: '',
    songs: '',
    poems: '',
    readings: '',
    immediateNotifications: [],
    doNotDoList: '',
    specialInstructions: '',
  });
  const [notificationInput, setNotificationInput] = useState('');

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      const response = await fetch('/api/user/end-of-life-checklist');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load data');
      }

      const data = await response.json();
      if (data.checklist) {
        setFormData({
          organDonationPreference: data.checklist.organDonationPreference || '',
          organDonationDetails: data.checklist.organDonationDetails || '',
          lastWords: data.checklist.lastWords || '',
          finalNotes: data.checklist.finalNotes || '',
          prayers: data.checklist.prayers || '',
          scriptures: data.checklist.scriptures || '',
          songs: data.checklist.songs || '',
          poems: data.checklist.poems || '',
          readings: data.checklist.readings || '',
          immediateNotifications: data.checklist.immediateNotifications || [],
          doNotDoList: data.checklist.doNotDoList || '',
          specialInstructions: data.checklist.specialInstructions || '',
        });
      }
    } catch (error) {
      setError('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/user/end-of-life-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save data');

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      setError('Failed to save checklist');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addNotification = () => {
    if (notificationInput.trim()) {
      setFormData({
        ...formData,
        immediateNotifications: [...(formData.immediateNotifications || []), notificationInput.trim()],
      });
      setNotificationInput('');
    }
  };

  const removeNotification = (index: number) => {
    setFormData({
      ...formData,
      immediateNotifications: formData.immediateNotifications?.filter((_, i) => i !== index) || [],
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
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-[#93B0C8] bg-opacity-10 rounded-xl">
              <CheckSquare className="w-6 h-6 text-[#93B0C8]" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-[#2C2A29]">End-of-Life Checklist</h1>
              <p className="text-[#2C2A29] opacity-70 mt-1">
                Your preferences, wishes, and final instructions
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">
              Checklist saved successfully!
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 space-y-8">
          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Organ Donation Preference
            </label>
            <select
              name="organDonationPreference"
              value={formData.organDonationPreference}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            >
              <option value="">Select preference</option>
              <option value="yes">Yes, I want to donate</option>
              <option value="no">No, I do not want to donate</option>
              <option value="unsure">Unsure / Let family decide</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Organ Donation Details
            </label>
            <textarea
              name="organDonationDetails"
              value={formData.organDonationDetails}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Any specific details about organ donation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Last Words / Final Message
            </label>
            <textarea
              name="lastWords"
              value={formData.lastWords}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Your final words to loved ones..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Final Notes
            </label>
            <textarea
              name="finalNotes"
              value={formData.finalNotes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Any final notes or thoughts..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Prayers
            </label>
            <textarea
              name="prayers"
              value={formData.prayers}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Prayers you'd like included..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Scriptures / Religious Texts
            </label>
            <textarea
              name="scriptures"
              value={formData.scriptures}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Scriptures or religious texts you'd like shared..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Songs / Music
            </label>
            <textarea
              name="songs"
              value={formData.songs}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Songs or music you'd like played..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Poems
            </label>
            <textarea
              name="poems"
              value={formData.poems}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Poems you'd like read..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Readings
            </label>
            <textarea
              name="readings"
              value={formData.readings}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Other readings or passages..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Who Should Be Notified Immediately
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={notificationInput}
                onChange={(e) => setNotificationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNotification())}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                placeholder="Enter name or contact"
              />
              <button
                type="button"
                onClick={addNotification}
                className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.immediateNotifications?.map((notification, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-[#A5B99A] bg-opacity-10 text-[#A5B99A] rounded-lg text-sm"
                >
                  {notification}
                  <button
                    type="button"
                    onClick={() => removeNotification(index)}
                    className="ml-2 text-[#A5B99A] hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              What Should NOT Be Done
            </label>
            <textarea
              name="doNotDoList"
              value={formData.doNotDoList}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Things you specifically do NOT want done..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2A29] mb-2">
              Special Instructions
            </label>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
              placeholder="Any other special instructions or wishes..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Checklist'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

