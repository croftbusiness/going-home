'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, CheckCircle2, User } from 'lucide-react';

interface OnboardingData {
  fullName: string;
  preferredName?: string;
  dateOfBirth: string;
  phoneNumber: string;
  email?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'questionnaire' | 'complete'>('intro');
  const [introAnimation, setIntroAnimation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: '',
    preferredName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
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
              Basic Profile Information
            </h1>
            <p className="text-[#2C2A29] opacity-70">
              Let's start with your basic information
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
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                placeholder="Enter your full legal name"
                className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
              />
            </div>

            {/* Preferred Name */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                Preferred Name <span className="text-[#2C2A29] opacity-50 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.preferredName}
                onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                placeholder="What you'd like to be called"
                className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
                className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                Primary Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                Email Address <span className="text-[#2C2A29] opacity-50 text-xs">(Optional)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all"
              />
              <p className="text-xs text-[#2C2A29] opacity-60 mt-1">
                Your account email is already on file. You can add a different email here if needed.
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

