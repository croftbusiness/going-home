'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Sparkles, ArrowRight, CheckCircle2, User, Users } from 'lucide-react';

interface OnboardingData {
  preferredName: string;
  hasFamily: boolean;
  hasChildren: boolean;
  primaryGoal: string;
  legacyMessage?: string;
  mostImportantValue?: string;
  favoriteMemory?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'questionnaire' | 'complete'>('intro');
  const [introAnimation, setIntroAnimation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<OnboardingData>({
    preferredName: '',
    hasFamily: false,
    hasChildren: false,
    primaryGoal: '',
    legacyMessage: '',
    mostImportantValue: '',
    favoriteMemory: '',
  });

  useEffect(() => {
    // Check if onboarding is already complete
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/user/onboarding/complete');
        if (response.ok) {
          const data = await response.json();
          if (data.onboardingComplete) {
            // Already completed, redirect to dashboard
            router.push('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Continue with onboarding if check fails (for new users)
      } finally {
        setChecking(false);
      }
    };
    
    checkOnboardingStatus();
  }, [router]);

  useEffect(() => {
    // Animated intro sequence
    if (step === 'intro' && !checking) {
      const timers = [
        setTimeout(() => setIntroAnimation(1), 300),
        setTimeout(() => setIntroAnimation(2), 800),
        setTimeout(() => setIntroAnimation(3), 1500),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [step, checking]);

  const handleStartQuestionnaire = () => {
    setStep('questionnaire');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Save onboarding questionnaire data
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save onboarding data' }));
        throw new Error(errorData.error || 'Failed to save onboarding data');
      }

      // Mark onboarding as complete
      const completeResponse = await fetch('/api/user/onboarding/complete', {
        method: 'POST',
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json().catch(() => ({ error: 'Failed to mark onboarding complete' }));
        throw new Error(errorData.error || 'Failed to mark onboarding complete');
      }

      setStep('complete');
      
      // Redirect to dashboard after a moment
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Onboarding submission error:', error);
      setError(error.message || 'Failed to save. Please try again.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A5B99A] mx-auto mb-4"></div>
          <p className="text-[#2C2A29] opacity-70">Loading...</p>
        </div>
      </div>
    );
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          {/* Animated Logo */}
          <div className={`mb-8 transition-all duration-700 ${
            introAnimation >= 1 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-50 translate-y-10'
          }`}>
            <div className="relative inline-block">
              <div className="relative w-24 h-24 mx-auto">
                <Image
                  src="/logo.png"
                  alt="Going Home Logo"
                  width={96}
                  height={96}
                  className="object-contain animate-pulse"
                  priority
                />
              </div>
              <Sparkles 
                className={`w-8 h-8 text-[#93B0C8] absolute -top-2 -right-2 transition-all duration-500 ${
                  introAnimation >= 2 ? 'opacity-100 scale-100 rotate-12' : 'opacity-0 scale-0'
                }`}
              />
            </div>
          </div>

          {/* Welcome Message */}
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold text-[#2C2A29] mb-6 transition-all duration-700 ${
            introAnimation >= 2 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}>
            Welcome to Going Home
          </h1>

          <p className={`text-xl sm:text-2xl text-[#2C2A29] opacity-70 mb-8 transition-all duration-700 delay-200 ${
            introAnimation >= 3 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}>
            Your secure place to organize what matters most
          </p>

          {/* CTA Button */}
          <button
            onClick={handleStartQuestionnaire}
            className={`px-8 py-4 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center space-x-3 mx-auto font-semibold text-lg transform hover:scale-105 ${
              introAnimation >= 3 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
            style={{ transitionDelay: introAnimation >= 3 ? '0.3s' : '0s' }}
          >
            <span>Let's Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'questionnaire') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2A29] mb-2">
              Let's Get to Know You
            </h1>
            <p className="text-[#2C2A29] opacity-70">
              Help us personalize your experience with a few quick questions
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Questionnaire Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            {/* Preferred Name */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                What should we call you? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.preferredName}
                onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                required
                placeholder="Your preferred name or nickname"
                className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
              />
            </div>

            {/* Family Status */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2A29] mb-3">
                Do you have immediate family? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasFamily: true })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.hasFamily
                      ? 'border-[#A5B99A] bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className={`w-6 h-6 mx-auto mb-2 ${formData.hasFamily ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${formData.hasFamily ? 'text-[#2C2A29]' : 'text-gray-600'}`}>
                    Yes
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasFamily: false, hasChildren: false })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    !formData.hasFamily
                      ? 'border-[#A5B99A] bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className={`w-6 h-6 mx-auto mb-2 ${!formData.hasFamily ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${!formData.hasFamily ? 'text-[#2C2A29]' : 'text-gray-600'}`}>
                    No
                  </span>
                </button>
              </div>
            </div>

            {/* Children */}
            {formData.hasFamily && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-semibold text-[#2C2A29] mb-3">
                  Do you have children?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasChildren: true })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.hasChildren
                        ? 'border-[#A5B99A] bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-sm font-medium ${formData.hasChildren ? 'text-[#2C2A29]' : 'text-gray-600'}`}>
                      Yes
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasChildren: false })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      !formData.hasChildren
                        ? 'border-[#A5B99A] bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-sm font-medium ${!formData.hasChildren ? 'text-[#2C2A29]' : 'text-gray-600'}`}>
                      No
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Primary Goal */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                What's your main goal with Going Home? <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.primaryGoal}
                onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                required
                className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
              >
                <option value="">Select your main goal...</option>
                <option value="organize_documents">Organize important documents</option>
                <option value="legacy_messages">Leave messages for loved ones</option>
                <option value="funeral_planning">Plan funeral preferences</option>
                <option value="financial_planning">Organize financial information</option>
                <option value="peace_of_mind">Peace of mind for my family</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Legacy Message */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                <Heart className="w-4 h-4 inline mr-2 text-[#A5B99A]" />
                What's one thing you want your loved ones to always remember about you?
              </label>
              <textarea
                value={formData.legacyMessage}
                onChange={(e) => setFormData({ ...formData, legacyMessage: e.target.value })}
                placeholder="Share something meaningful - a value, a memory, or words of wisdom..."
                rows={4}
                className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
              />
              <p className="text-xs text-[#2C2A29] opacity-60 mt-1">
                This will help us personalize your experience and create meaningful content for you.
              </p>
            </div>

            {/* Most Important Value */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                What matters most to you in life?
              </label>
              <input
                type="text"
                value={formData.mostImportantValue}
                onChange={(e) => setFormData({ ...formData, mostImportantValue: e.target.value })}
                placeholder="e.g., Family, Faith, Helping Others, Creativity..."
                className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
              />
              <p className="text-xs text-[#2C2A29] opacity-60 mt-1">
                This helps us understand what's truly important to you.
              </p>
            </div>

            {/* Favorite Memory */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                Share a favorite memory you'd want to preserve (optional)
              </label>
              <textarea
                value={formData.favoriteMemory}
                onChange={(e) => setFormData({ ...formData, favoriteMemory: e.target.value })}
                placeholder="A moment with family, an accomplishment, a simple joy..."
                rows={3}
                className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
              />
              <p className="text-xs text-[#2C2A29] opacity-60 mt-1">
                These memories help create a richer legacy for your loved ones.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 font-semibold text-lg transform hover:scale-105 disabled:transform-none"
              >
                <span>{loading ? 'Saving...' : 'Continue to Dashboard'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8 animate-bounce">
            <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#2C2A29] mb-4">
            You're All Set!
          </h1>
          <p className="text-xl text-[#2C2A29] opacity-70 mb-8">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return null;
}

