'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Edit, Download, ArrowLeft, Heart } from 'lucide-react';
import { getWillQuestionnaire, exportWillQuestionnaire } from '@/lib/api/willQuestionnaire';

export default function WillQuestionnairePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const loadQuestionnaire = async () => {
    try {
      const data = await getWillQuestionnaire();
      setQuestionnaire(data);
    } catch (err: any) {
      console.error('Error loading questionnaire:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!questionnaire?.id) return;

    setExporting(true);
    setError('');

    try {
      const blob = await exportWillQuestionnaire(questionnaire.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `will-questionnaire-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Will Questionnaire</h1>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-800">
                <strong>Legal Disclaimer:</strong> ReadyAtHand does not provide legal advice or create legally binding documents. 
                This questionnaire is for informational and planning purposes only. Please consult with a qualified attorney 
                to create a legally valid will.
              </p>
            </div>
          </div>
        </div>

        {/* Why This Helps Loved Ones */}
        <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl flex-shrink-0">
              <Heart className="w-6 h-6 text-[#A5B99A]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#2C2A29] mb-2">
                Why This Helps Your Loved Ones
              </h3>
              <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">
                Creating a will is one of the most important gifts you can give your family. By documenting your 
                wishes now, you're preventing confusion, conflict, and legal complications during an already difficult 
                time. Your family won't have to guess what you wanted or make stressful decisions about your assets. 
                This questionnaire helps you organize your thoughts and preferences, making it easier for your attorney 
                to create a will that honors your wishes exactly as you intended, giving your family peace of mind 
                and protecting what matters most to you.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {!questionnaire ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Get Started</h2>
            <p className="text-gray-600 mb-6">
              Answer guided questions about your will preferences and export the results for your attorney.
            </p>
            <Link
              href="/dashboard/will-questionnaire/edit"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-5 h-5 mr-2" />
              Start Questionnaire
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Your Questionnaire</h2>
                <p className="text-sm text-gray-600">
                  Last updated: {new Date(questionnaire.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/dashboard/will-questionnaire/edit"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Download PDF'}
                </button>
              </div>
            </div>

            {/* Summary Sections */}
            <div className="space-y-4">
              {questionnaire.personalInfo && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-sm text-gray-600">✓ Completed</p>
                </div>
              )}
              {questionnaire.executor && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Executor</h3>
                  <p className="text-sm text-gray-600">✓ Completed</p>
                </div>
              )}
              {questionnaire.guardians && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Guardianship</h3>
                  <p className="text-sm text-gray-600">✓ Completed</p>
                </div>
              )}
              {questionnaire.bequests && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Bequests</h3>
                  <p className="text-sm text-gray-600">✓ Completed</p>
                </div>
              )}
              {questionnaire.digitalAssets && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Digital Assets</h3>
                  <p className="text-sm text-gray-600">✓ Completed</p>
                </div>
              )}
              {questionnaire.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
                  <p className="text-sm text-gray-600">✓ Completed</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



