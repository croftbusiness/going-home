'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Mail, Edit, Trash2, Sparkles, Wand2 } from 'lucide-react';
import Link from 'next/link';
import AILetterGenerator from '@/components/ai/AILetterGenerator';
import LegacyMessageCoach from '@/components/ai/LegacyMessageCoach';

interface Letter {
  id: string;
  recipientId: string;
  recipientName?: string;
  recipientRelationship: string;
  title: string;
  messageText: string;
  visibleAfterDeath: boolean;
  releaseType?: 'after_death' | 'on_date' | 'on_milestone' | 'immediate';
  releaseDate?: string;
  milestoneType?: 'birthday' | 'graduation' | 'wedding' | 'first_child' | 'anniversary' | 'custom';
  milestoneDate?: string;
  milestoneDescription?: string;
  letterCategory?: 'in_case_i_pass' | 'birthday' | 'milestone' | 'encouragement' | 'final_words' | 'love_letter' | 'other';
  createdAt: string;
}

interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
}

export default function LettersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    recipientId: '',
    recipientRelationship: '',
    title: '',
    messageText: '',
    visibleAfterDeath: true,
    releaseType: 'after_death' as 'after_death' | 'on_date' | 'on_milestone' | 'immediate',
    releaseDate: '',
    milestoneType: 'birthday' as 'birthday' | 'graduation' | 'wedding' | 'first_child' | 'anniversary' | 'custom' | '',
    milestoneDate: '',
    milestoneDescription: '',
    letterCategory: 'other' as 'in_case_i_pass' | 'birthday' | 'milestone' | 'encouragement' | 'final_words' | 'love_letter' | 'other',
    autoEmailEnabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [lettersRes, contactsRes] = await Promise.all([
        fetch('/api/user/letters'),
        fetch('/api/user/trusted-contacts')
      ]);

      if (!lettersRes.ok || !contactsRes.ok) {
        if (lettersRes.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load data');
      }

      const lettersData = await lettersRes.json();
      const contactsData = await contactsRes.json();
      
      setLetters(lettersData.letters || []);
      // Handle both possible response structures
      const contactsList = contactsData.contacts || contactsData.trustedContacts || [];
      setContacts(contactsList);
    } catch (error) {
      setError('Failed to load letters');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingId ? `/api/user/letters?id=${editingId}` : '/api/user/letters';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save letter');

      await loadData();
      setSuccess(true);
      setShowForm(false);
      setEditingId(null);
      setFormData({
        recipientId: '',
        recipientRelationship: '',
        title: '',
        messageText: '',
        visibleAfterDeath: true,
        releaseType: 'after_death' as const,
        releaseDate: '',
        milestoneType: 'birthday' as const,
        milestoneDate: '',
        milestoneDescription: '',
        letterCategory: 'other' as const,
        autoEmailEnabled: true,
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to save letter');
    }
  };

  const handleEdit = (letter: Letter) => {
    setFormData({
      recipientId: letter.recipientId || '',
      recipientRelationship: letter.recipientRelationship,
      title: letter.title || '',
      messageText: letter.messageText || '',
      visibleAfterDeath: letter.visibleAfterDeath ?? true,
      releaseType: letter.releaseType || 'after_death',
      releaseDate: letter.releaseDate || '',
      milestoneType: (letter.milestoneType || 'birthday') as any,
        milestoneDate: letter.milestoneDate || '',
        milestoneDescription: letter.milestoneDescription || '',
        letterCategory: (letter.letterCategory || 'other') as any,
        autoEmailEnabled: letter.autoEmailEnabled ?? true,
    });
    setEditingId(letter.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this letter?')) return;

    try {
      const response = await fetch(`/api/user/letters?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');

      setLetters(letters.filter(l => l.id !== id));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to delete letter');
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <Link href="/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0">
                <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Personal Letters</h1>
                <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                  Messages for your trusted contacts (separate from funeral ceremony letters)
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setShowAIGenerator(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Sparkles className="w-4 h-4" />
                  <span>AI Generate</span>
                </button>
                <Link
                  href="/dashboard/funeral-planning/letters"
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#EBD9B5] text-[#2C2A29] rounded-lg hover:bg-[#D4C19A] transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base touch-target"
                >
                  <Mail className="w-4 h-4" />
                  <span>Funeral Ceremony Letters →</span>
                </Link>
                <button
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setFormData({
                    recipientId: '',
                    recipientRelationship: '',
                    title: '',
                    messageText: '',
                    visibleAfterDeath: true,
                    releaseType: 'after_death' as const,
                    releaseDate: '',
                    milestoneType: 'birthday' as const,
                    milestoneDate: '',
                    milestoneDescription: '',
                    letterCategory: 'other' as const,
                  });
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Write Letter</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-[#EBD9B5] text-[#2C2A29] px-4 py-3 rounded-lg mb-4">
            Letter saved successfully
          </div>
        )}

        {showAIGenerator && (
          <div className="mb-6">
            <AILetterGenerator
              onSave={(draftText) => {
                setFormData({
                  ...formData,
                  messageText: draftText,
                });
                setShowAIGenerator(false);
                setShowForm(true);
              }}
              onClose={() => setShowAIGenerator(false)}
            />
          </div>
        )}

        {contacts.length === 0 && !showForm && !showAIGenerator && (
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm mb-6">
            <p className="text-[#2C2A29] opacity-70">
              You need to add trusted contacts before creating letters. 
              <Link href="/dashboard/trusted-contacts" className="text-[#93B0C8] hover:underline ml-1">
                Add contacts here
              </Link>
            </p>
          </div>
        )}

        {showForm && (
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">
              {editingId ? 'Edit Letter' : 'Write a New Letter'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                  Recipient *
                </label>
                {contacts.length === 0 ? (
                  <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-[#2C2A29] opacity-70 text-sm">
                    No trusted contacts available. <Link href="/dashboard/trusted-contacts" className="text-[#93B0C8] hover:underline font-medium">Add contacts first</Link> to create a letter.
                  </div>
                ) : (
                  <select
                    value={formData.recipientId}
                    onChange={(e) => {
                      const contact = contacts.find(c => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        recipientId: e.target.value,
                        recipientRelationship: contact?.relationship || '',
                      });
                    }}
                    required
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent cursor-pointer"
                  >
                    <option value="">Select recipient</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.relationship})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                  Letter Type *
                </label>
                <select
                  value={formData.letterCategory}
                  onChange={(e) => setFormData({ ...formData, letterCategory: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent mb-4"
                >
                  <option value="in_case_i_pass">In Case I Pass Unexpectedly</option>
                  <option value="birthday">Birthday Letter</option>
                  <option value="milestone">Milestone Letter (Graduation, Wedding, etc.)</option>
                  <option value="encouragement">Words of Encouragement</option>
                  <option value="final_words">Final Words</option>
                  <option value="love_letter">Love Letter</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., A Message for My Daughter"
                  className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                  When Should This Letter Be Released? *
                </label>
                <select
                  value={formData.releaseType}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    releaseType: e.target.value as any,
                    releaseDate: e.target.value !== 'on_date' ? '' : formData.releaseDate,
                    milestoneType: e.target.value !== 'on_milestone' ? 'birthday' : formData.milestoneType,
                    milestoneDate: e.target.value !== 'on_milestone' ? '' : formData.milestoneDate,
                  })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  <option value="after_death">After I Pass Away</option>
                  <option value="on_date">On a Specific Date</option>
                  <option value="on_milestone">On a Life Milestone</option>
                  <option value="immediate">Immediately (they can read now)</option>
                </select>
              </div>

              {formData.releaseType === 'on_date' && (
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                    Release Date *
                  </label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  />
                </div>
              )}

              {formData.releaseType === 'on_milestone' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                      Milestone Type *
                    </label>
                    <select
                      value={formData.milestoneType}
                      onChange={(e) => setFormData({ ...formData, milestoneType: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent mb-4"
                    >
                      <option value="birthday">Birthday</option>
                      <option value="graduation">Graduation</option>
                      <option value="wedding">Wedding</option>
                      <option value="first_child">First Child</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="custom">Custom Milestone</option>
                    </select>
                  </div>
                  {formData.milestoneType === 'custom' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                        Describe the Milestone
                      </label>
                      <input
                        type="text"
                        value={formData.milestoneDescription}
                        onChange={(e) => setFormData({ ...formData, milestoneDescription: e.target.value })}
                        placeholder="e.g., When you turn 25"
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                      Milestone Date (if known)
                    </label>
                    <input
                      type="date"
                      value={formData.milestoneDate}
                      onChange={(e) => setFormData({ ...formData, milestoneDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                    />
                    <p className="text-xs text-[#2C2A29] opacity-60 mt-1">
                      Leave blank if the date is unknown
                    </p>
                  </div>
                </>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#2C2A29]">
                    Your Message *
                  </label>
                  <div className="text-xs text-[#2C2A29] opacity-60">
                    Use AI Coach below to improve your message
                  </div>
                </div>
                <textarea
                  value={formData.messageText}
                  onChange={(e) => setFormData({ ...formData, messageText: e.target.value })}
                  required
                  rows={8}
                  placeholder="Write your heartfelt message here..."
                  className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent mb-4 touch-target resize-y"
                />
                <LegacyMessageCoach
                  initialText={formData.messageText}
                  onSave={(improvedText, title) => {
                    setFormData({
                      ...formData,
                      messageText: improvedText,
                      title: title || formData.title,
                    });
                  }}
                />
              </div>

              {formData.releaseType === 'after_death' && (
                <div className="flex items-center p-3 bg-[#EBD9B5] bg-opacity-30 rounded-lg">
                  <input
                    type="checkbox"
                    id="visibleAfterDeath"
                    checked={formData.visibleAfterDeath}
                    onChange={(e) => setFormData({ ...formData, visibleAfterDeath: e.target.checked })}
                    className="w-4 h-4 text-[#A5B99A] border-gray-300 rounded focus:ring-[#A5B99A]"
                  />
                  <label htmlFor="visibleAfterDeath" className="ml-2 text-sm text-[#2C2A29]">
                    This letter will be released when your executor activates your account release
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
                >
                  {editingId ? 'Update Letter' : 'Save Letter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {letters.length === 0 && !showForm ? (
          <div className="bg-[#FCFAF7] rounded-lg p-12 text-center">
            <Mail className="w-12 h-12 text-[#A5B99A] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No letters yet</h3>
            <p className="text-[#2C2A29] opacity-70 mb-4">
              Write heartfelt messages to your loved ones
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {letters.map((letter) => (
              <div key={letter.id} className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="w-5 h-5 text-[#A5B99A]" />
                      <h3 className="font-medium text-[#2C2A29]">{letter.title}</h3>
                    </div>
                    <p className="text-sm text-[#2C2A29] opacity-70 mb-2">
                      To: {letter.recipientName || 'Unknown'} ({letter.recipientRelationship})
                    </p>
                    <p className="text-sm text-[#2C2A29] line-clamp-3">{letter.messageText}</p>
                    <p className="text-xs text-[#2C2A29] opacity-50 mt-3">
                      {new Date(letter.createdAt).toLocaleDateString()}
                      {letter.visibleAfterDeath && ' • Only visible after death'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(letter)}
                      className="p-2 text-[#93B0C8] hover:bg-white rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(letter.id)}
                      className="p-2 text-red-500 hover:bg-white rounded-lg transition-colors"
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
