'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Plus, Trash2, Play, Upload } from 'lucide-react';

interface LegacyMessage {
  id?: string;
  messageType: string;
  title: string;
  recipientType?: string;
  recipientId?: string;
  recipientName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  durationSeconds?: number;
  description?: string;
  playOnDate?: string;
}

const MESSAGE_TYPES = [
  { value: 'video', label: 'Video Message' },
  { value: 'audio', label: 'Audio Message' },
];

const RECIPIENT_TYPES = [
  { value: 'family', label: 'Family' },
  { value: 'children', label: 'Children' },
  { value: 'specific_person', label: 'Specific Person' },
  { value: 'general', label: 'General' },
];

export default function LegacyMessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<LegacyMessage[]>([]);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<LegacyMessage>({
    messageType: 'video',
    title: '',
    recipientType: 'family',
    recipientName: '',
    description: '',
    playOnDate: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/user/legacy-messages');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect message type from file
      if (file.type.startsWith('video/')) {
        setFormData({ ...formData, messageType: 'video' });
      } else if (file.type.startsWith('audio/')) {
        setFormData({ ...formData, messageType: 'audio' });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.title.trim()) {
      setError('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Upload file
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/user/legacy-messages/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json();
        throw new Error(data.error || 'Failed to upload file');
      }

      const uploadData = await uploadResponse.json();

      // Save message record
      const messageData = {
        ...formData,
        fileUrl: uploadData.fileUrl,
        fileSize: uploadData.fileSize,
        mimeType: uploadData.mimeType,
      };

      const saveResponse = await fetch('/api/user/legacy-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save message');
      }

      await loadMessages();
      setShowAddForm(false);
      setFormData({
        messageType: 'video',
        title: '',
        recipientType: 'family',
        recipientName: '',
        description: '',
        playOnDate: '',
      });
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload message');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/user/legacy-messages?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete message');
      await loadMessages();
    } catch (err: any) {
      setError(err.message || 'Failed to delete message');
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
              <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl">
                <Video className="w-6 h-6 text-[#A5B99A]" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-[#2C2A29]">Legacy Messages</h1>
                <p className="text-[#2C2A29] opacity-70 mt-1">
                  Video and audio messages for your loved ones
                </p>
              </div>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Message</span>
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-[#2C2A29] mb-4">Upload New Message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Message Type
                </label>
                <select
                  value={formData.messageType}
                  onChange={(e) => setFormData({ ...formData, messageType: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  {MESSAGE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., Message for my children"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Recipient Type
                </label>
                <select
                  value={formData.recipientType}
                  onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  {RECIPIENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.recipientType === 'specific_person' && (
                <div>
                  <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  File *
                </label>
                <input
                  type="file"
                  accept={formData.messageType === 'video' ? 'video/*' : 'audio/*'}
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                />
                {selectedFile && (
                  <p className="text-sm text-[#2C2A29] opacity-70 mt-2">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-[#2C2A29] opacity-60 mt-1">
                  Maximum file size: 100MB
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !formData.title.trim()}
                  className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload & Save'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      messageType: 'video',
                      title: '',
                      recipientType: 'family',
                      recipientName: '',
                      description: '',
                      playOnDate: '',
                    });
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 text-[#2C2A29] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && !showAddForm ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No Messages Yet</h3>
            <p className="text-[#2C2A29] opacity-70 mb-4">
              Create video or audio messages for your loved ones
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
            >
              Add Your First Message
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {messages.map((message) => (
              <div key={message.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Video className="w-5 h-5 text-[#A5B99A]" />
                    <span className="text-sm font-medium text-[#2C2A29] capitalize">
                      {message.messageType}
                    </span>
                  </div>
                  <button
                    onClick={() => message.id && handleDelete(message.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-2">{message.title}</h3>
                {message.description && (
                  <p className="text-sm text-[#2C2A29] opacity-70 mb-4">{message.description}</p>
                )}
                {message.fileUrl && (
                  <div className="mt-4">
                    {message.messageType === 'video' ? (
                      <video
                        src={message.fileUrl}
                        controls
                        className="w-full rounded-lg"
                        style={{ maxHeight: '300px' }}
                      />
                    ) : (
                      <audio src={message.fileUrl} controls className="w-full" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

