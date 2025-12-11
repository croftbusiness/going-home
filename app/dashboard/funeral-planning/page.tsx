'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Music, Palette, FileText, Mail, Sparkles, Image, Lightbulb, CheckCircle } from 'lucide-react';

interface FuneralPlanningStatus {
  story: boolean;
  moodboard: boolean;
  eulogy: boolean;
  script: boolean;
  playlist: boolean;
  letters: boolean;
  themes: boolean;
}

export default function FuneralPlanningPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<FuneralPlanningStatus>({
    story: false,
    moodboard: false,
    eulogy: false,
    script: false,
    playlist: false,
    letters: false,
    themes: false,
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // Check which features have data
      const [storyRes, moodboardRes, scriptRes, playlistRes, lettersRes, themesRes] = await Promise.all([
        fetch('/api/funeral/story'),
        fetch('/api/funeral/moodboard'),
        fetch('/api/funeral/script'),
        fetch('/api/funeral/playlist'),
        fetch('/api/funeral/letter'),
        fetch('/api/funeral/life-themes'),
      ]);

      setStatus({
        story: storyRes.ok && (await storyRes.json()).story !== null,
        moodboard: moodboardRes.ok && (await moodboardRes.json()).moodboard !== null,
        eulogy: false, // Check from story
        script: scriptRes.ok && (await scriptRes.json()).script !== null,
        playlist: playlistRes.ok && (await playlistRes.json()).playlist !== null,
        letters: lettersRes.ok && (await lettersRes.json()).letters?.length > 0,
        themes: themesRes.ok && (await themesRes.json()).themes !== null,
      });
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      id: 'story',
      title: 'Your Funeral Story',
      description: 'Create a meaningful ceremony plan that reflects your wishes',
      icon: Heart,
      href: '/dashboard/funeral-planning/story',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      completed: status.story,
    },
    {
      id: 'themes',
      title: 'Life Themes',
      description: 'Discover your core values and themes from your memories',
      icon: Lightbulb,
      href: '/dashboard/funeral-planning/themes',
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
      completed: status.themes,
    },
    {
      id: 'moodboard',
      title: 'Visual Moodboard',
      description: 'Design the atmosphere, colors, and aesthetic of your service',
      icon: Palette,
      href: '/dashboard/funeral-planning/moodboard',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      completed: status.moodboard,
    },
    {
      id: 'eulogy',
      title: 'Eulogy Writer',
      description: 'AI helps craft a beautiful eulogy from your life story',
      icon: FileText,
      href: '/dashboard/funeral-planning/eulogy',
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
      completed: status.eulogy,
    },
    {
      id: 'script',
      title: 'Ceremony Script',
      description: 'Generate opening words, readings, and closing blessings',
      icon: FileText,
      href: '/dashboard/funeral-planning/script',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      completed: status.script,
    },
    {
      id: 'playlist',
      title: 'Music Playlist',
      description: 'Create ceremony, slideshow, and reception playlists',
      icon: Music,
      href: '/dashboard/funeral-planning/playlist',
      color: 'bg-[#93B0C8]',
      bgColor: 'bg-[#93B0C8] bg-opacity-5',
      completed: status.playlist,
    },
    {
      id: 'letters',
      title: 'Letters to Be Read',
      description: 'Write letters to loved ones to be read at your service',
      icon: Mail,
      href: '/dashboard/funeral-planning/letters',
      color: 'bg-[#A5B99A]',
      bgColor: 'bg-[#A5B99A] bg-opacity-5',
      completed: status.letters,
    },
  ];

  const completedCount = Object.values(status).filter(Boolean).length;
  const progress = (completedCount / 7) * 100;

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
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#2C2A29]">
                Funeral Planning
              </h1>
              <p className="text-xs sm:text-sm text-[#2C2A29] opacity-70 mt-1">
                Create a meaningful and beautiful ceremony that reflects who you are
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6 sm:mb-10">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#A5B99A] bg-opacity-10 rounded-xl flex-shrink-0">
              <Heart className="w-6 h-6 text-[#A5B99A]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#2C2A29] mb-2">
                Let's create something beautiful together
              </h2>
              <p className="text-sm sm:text-base text-[#2C2A29] opacity-70 leading-relaxed">
                This guided journey helps you express your wishes for a meaningful ceremony. 
                Each step is designed to be gentle, supportive, and reflective of who you are. 
                Take your time, and know that every choice you make helps create something beautiful for your loved ones.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6 sm:mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2C2A29]">Your Progress</h3>
            <span className="text-sm text-[#2C2A29] opacity-70">
              {completedCount} of {features.length} completed
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#A5B99A] via-[#93B0C8] to-[#A5B99A] h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.id}
                href={feature.href}
                className="group bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:border-[#A5B99A] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${feature.bgColor} rounded-xl flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${feature.color.replace('bg-', 'text-')}`} />
                  </div>
                  {feature.completed && (
                    <CheckCircle className="w-5 h-5 text-[#A5B99A] flex-shrink-0" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-[#2C2A29] mb-2 group-hover:text-[#93B0C8] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-sm text-[#A5B99A] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {feature.completed ? 'Review →' : 'Get Started →'}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Helpful Note */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-[#2C2A29] mb-1">AI-Assisted Planning</h4>
              <p className="text-sm text-[#2C2A29] opacity-70">
                Our AI features help guide you through each step, offering suggestions and helping you express 
                your wishes in a way that feels authentic and meaningful. You're always in control, and you can 
                edit or refine everything we create together.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


