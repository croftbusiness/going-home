'use client';

import { useState } from 'react';
import { FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import type { DocumentSummary } from '@/types/ai';

interface DocumentAnalyzerProps {
  documentId?: string;
  fileUrl?: string;
  mimeType?: string;
  onAnalyzeComplete?: (summary: DocumentSummary) => void;
}

export default function DocumentAnalyzer({
  documentId,
  fileUrl,
  mimeType,
  onAnalyzeComplete,
}: DocumentAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<DocumentSummary | null>(null);

  const handleAnalyze = async () => {
    if (!documentId && !fileUrl) {
      setError('Document ID or file URL is required');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const response = await fetch('/api/ai/document-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          fileUrl,
          mimeType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze document');
      }

      const data: DocumentSummary = await response.json();
      setSummary(data);
      if (onAnalyzeComplete) {
        onAnalyzeComplete(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#93B0C8] bg-opacity-10 rounded-lg">
            <FileText className="w-5 h-5 text-[#93B0C8]" />
          </div>
          <h3 className="text-lg font-semibold text-[#2C2A29]">AI Document Analyzer</h3>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || (!documentId && !fileUrl)}
          className="px-4 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze Document</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {summary && (
        <div className="space-y-4 mt-4">
          {summary.documentType && (
            <div>
              <span className="inline-block px-3 py-1 bg-[#93B0C8] bg-opacity-10 text-[#93B0C8] rounded-full text-sm font-medium">
                {summary.documentType}
              </span>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-[#2C2A29] mb-2">Summary</h4>
            <p className="text-[#2C2A29] opacity-80 leading-relaxed">{summary.summary}</p>
          </div>

          {summary.keyPoints && summary.keyPoints.length > 0 && (
            <div>
              <h4 className="font-semibold text-[#2C2A29] mb-2">Key Points</h4>
              <ul className="space-y-1">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2 text-[#2C2A29] opacity-80">
                    <span className="text-[#93B0C8] mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.missingInformation && summary.missingInformation.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-[#2C2A29] mb-2">Missing Information</h4>
                  <ul className="space-y-1">
                    {summary.missingInformation.map((info, index) => (
                      <li key={index} className="text-sm text-[#2C2A29] opacity-80">
                        • {info}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {summary.suggestedTags && summary.suggestedTags.length > 0 && (
            <div>
              <h4 className="font-semibold text-[#2C2A29] mb-2">Suggested Tags</h4>
              <div className="flex flex-wrap gap-2">
                {summary.suggestedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}




