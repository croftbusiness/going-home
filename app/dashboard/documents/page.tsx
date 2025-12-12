'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, Trash2, Eye, Sparkles } from 'lucide-react';
import Link from 'next/link';
import DocumentAnalyzer from '@/components/ai/DocumentAnalyzer';

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
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const newDoc = await response.json();
      
      if (!newDoc.document) {
        throw new Error('Invalid response from server');
      }
      
      setDocuments([...documents, newDoc.document]);
      setSuccess(true);
      setShowUploadForm(false);
      setUploadData({ documentType: '', note: '' });
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
      // Reload documents to ensure consistency
      await loadDocuments();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload document');
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <Link href="/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0">
                <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">Important Documents</h1>
                <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                  Upload essential paperwork and files
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadForm(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm sm:text-base">{error}</div>
        )}
        {success && (
          <div className="bg-[#EBD9B5] text-[#2C2A29] px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm sm:text-base">
            Operation completed successfully
          </div>
        )}

        {showUploadForm && (
          <div className="bg-[#FCFAF7] rounded-lg p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-medium text-[#2C2A29]">Upload New Document</h2>
              <button
                onClick={() => setShowUploadForm(false)}
                className="p-2 text-gray-500 hover:text-gray-700 sm:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Document Type *
                </label>
                <select
                  value={uploadData.documentType}
                  onChange={(e) => setUploadData({ ...uploadData, documentType: e.target.value })}
                  className="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent touch-target"
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
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={uploadData.note}
                  onChange={(e) => setUploadData({ ...uploadData, note: e.target.value })}
                  placeholder="Add any additional information about this document"
                  className="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  File (PDF, JPG, PNG, DOCX) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#A5B99A] file:text-white hover:file:bg-[#93B0C8] touch-target"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-2">
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-[#2C2A29] rounded-lg hover:bg-gray-50 transition-colors font-medium touch-target"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="bg-[#FCFAF7] rounded-lg p-8 sm:p-12 text-center">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-[#A5B99A] mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-[#2C2A29] mb-2">No documents yet</h3>
            <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 mb-6">
              Upload important documents to keep them secure in one place
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="px-6 py-3 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors font-medium text-base touch-target"
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="space-y-3 sm:space-y-4">
                <div className="bg-[#FCFAF7] rounded-lg p-4 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-[#A5B99A] mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base sm:text-lg text-[#2C2A29] break-words">{doc.fileName}</h3>
                        <p className="text-sm text-[#2C2A29] opacity-70 mt-1 capitalize">
                          {doc.documentType.replace('_', ' ')}
                        </p>
                        {doc.note && (
                          <p className="text-sm text-[#2C2A29] opacity-70 mt-2 break-words">{doc.note}</p>
                        )}
                        <p className="text-xs text-[#2C2A29] opacity-50 mt-2">
                          {new Date(doc.createdAt).toLocaleDateString()} • {(doc.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end sm:justify-start space-x-2 sm:space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                      <button
                        onClick={() => setAnalyzingDocId(analyzingDocId === doc.id ? null : doc.id)}
                        className={`px-3 py-2.5 sm:p-2 rounded-lg transition-colors flex items-center space-x-1.5 sm:space-x-1 touch-target ${
                          analyzingDocId === doc.id
                            ? 'bg-[#93B0C8] text-white'
                            : 'text-[#93B0C8] hover:bg-white border border-[#93B0C8] sm:border-0'
                        }`}
                        title="Analyze with AI"
                      >
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm font-medium sm:hidden">AI Analyze</span>
                        <span className="text-sm hidden sm:inline">AI</span>
                      </button>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 sm:p-2 text-[#93B0C8] hover:bg-white rounded-lg transition-colors border border-[#93B0C8] sm:border-0 touch-target flex items-center space-x-1.5 sm:space-x-0"
                        title="View document"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm font-medium sm:hidden">View</span>
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="px-3 py-2.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-300 sm:border-0 touch-target flex items-center space-x-1.5 sm:space-x-0"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm font-medium sm:hidden">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
                {analyzingDocId === doc.id && (
                  <div className="ml-0 sm:ml-4">
                    <DocumentAnalyzer
                      documentId={doc.id}
                      onAnalyzeComplete={(summary) => {
                        console.log('Analysis complete:', summary);
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
