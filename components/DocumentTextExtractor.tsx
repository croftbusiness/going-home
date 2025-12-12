'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface DocumentTextExtractorProps {
  onTextExtracted: (text: string) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
  label?: string;
  description?: string;
}

export default function DocumentTextExtractor({
  onTextExtracted,
  acceptedFileTypes = '.pdf,.doc,.docx,.txt',
  maxFileSize = 10,
  label = 'Upload Document',
  description = 'Upload a PDF, Word document, or text file to extract text',
}: DocumentTextExtractorProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      setError(`File size exceeds ${maxFileSize}MB limit. Please choose a smaller file.`);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = acceptedFileTypes.split(',').map(t => t.trim().toLowerCase());
    const fileType = file.type.toLowerCase();
    const isValidType = 
      acceptedTypes.some(type => file.name.toLowerCase().endsWith(type)) ||
      fileType.includes('pdf') ||
      fileType.includes('msword') ||
      fileType.includes('wordprocessingml') ||
      fileType.includes('text/plain');

    if (!isValidType) {
      setError(`Unsupported file type. Please upload a PDF, Word document (.docx, .doc), or text file (.txt)`);
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);
    setExtractedText(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/documents/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to extract text');
      }

      const data = await response.json();
      setExtractedText(data.text);
      setSuccess(true);
      
      // Automatically apply the text
      onTextExtracted(data.text);
    } catch (err: any) {
      console.error('Text extraction error:', err);
      setError(err.message || 'Failed to extract text from document');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    setExtractedText(null);
    setFileName(null);
    setSuccess(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#93B0C8] bg-opacity-10 rounded-lg">
            <FileText className="w-5 h-5 text-[#93B0C8]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#2C2A29]">{label}</h3>
            {description && (
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && extractedText && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Text extracted successfully!</p>
            <p className="text-xs mt-1 opacity-80">
              {extractedText.length.toLocaleString()} characters, {extractedText.split(/\s+/).filter(w => w.length > 0).length.toLocaleString()} words
            </p>
            {fileName && (
              <p className="text-xs mt-1 opacity-60">From: {fileName}</p>
            )}
          </div>
          <button
            onClick={handleClear}
            className="text-green-700 hover:text-green-800 flex-shrink-0"
            title="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        <label className="block">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 touch-target"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                </>
              )}
            </button>
            <span className="text-xs sm:text-sm text-[#2C2A29] opacity-70">
              Max {maxFileSize}MB • PDF, Word, or Text files
            </span>
          </div>
        </label>

        {extractedText && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-[#2C2A29]">Extracted Text Preview</h4>
              <button
                onClick={() => {
                  onTextExtracted(extractedText);
                  setSuccess(true);
                }}
                className="text-xs text-[#93B0C8] hover:text-[#A5B99A] font-medium"
              >
                Apply to Field
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-[#2C2A29] whitespace-pre-wrap">
                {extractedText.length > 500 
                  ? extractedText.substring(0, 500) + '...' 
                  : extractedText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

