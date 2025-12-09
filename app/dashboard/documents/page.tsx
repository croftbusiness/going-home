'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  note: string;
  createdAt: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    documentType: '',
    note: '',
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/user/documents');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load documents');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!uploadData.documentType) {
      setError('Please select a document type');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', uploadData.documentType);
      formData.append('note', uploadData.note);

      const response = await fetch('/api/user/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const newDoc = await response.json();
      setDocuments([...documents, newDoc.document]);
      setSuccess(true);
      setShowUploadForm(false);
      setUploadData({ documentType: '', note: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/user/documents?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      setDocuments(documents.filter(doc => doc.id !== id));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to delete document');
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-[#2C2A29]">Important Documents</h1>
                <p className="text-sm text-[#2C2A29] opacity-70 mt-1">
                  Upload essential paperwork and files
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadForm(true)}
              className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-[#EBD9B5] text-[#2C2A29] px-4 py-3 rounded-lg mb-4">
            Operation completed successfully
          </div>
        )}

        {showUploadForm && (
          <div className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-lg font-medium text-[#2C2A29] mb-4">Upload New Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                  Document Type *
                </label>
                <select
                  value={uploadData.documentType}
                  onChange={(e) => setUploadData({ ...uploadData, documentType: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="will">Will</option>
                  <option value="id">ID / Passport</option>
                  <option value="insurance">Insurance</option>
                  <option value="deed">Property Deed</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={uploadData.note}
                  onChange={(e) => setUploadData({ ...uploadData, note: e.target.value })}
                  placeholder="Add any additional information about this document"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-1">
                  File (PDF, JPG, PNG, DOCX) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 border border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="bg-[#FCFAF7] rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 text-[#A5B99A] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2C2A29] mb-2">No documents yet</h3>
            <p className="text-[#2C2A29] opacity-70 mb-4">
              Upload important documents to keep them secure in one place
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="px-6 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors"
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-[#FCFAF7] rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <FileText className="w-6 h-6 text-[#A5B99A] mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-[#2C2A29]">{doc.fileName}</h3>
                      <p className="text-sm text-[#2C2A29] opacity-70 mt-1 capitalize">
                        {doc.documentType.replace('_', ' ')}
                      </p>
                      {doc.note && (
                        <p className="text-sm text-[#2C2A29] opacity-70 mt-2">{doc.note}</p>
                      )}
                      <p className="text-xs text-[#2C2A29] opacity-50 mt-2">
                        {new Date(doc.createdAt).toLocaleDateString()} • {(doc.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-[#93B0C8] hover:bg-white rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
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
