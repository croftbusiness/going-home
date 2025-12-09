'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Shield, Users, FileText } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      // User not logged in, stay on home page
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Hero Section */}
      <header className="bg-[#FCFAF7] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-[#A5B99A]" />
              <h1 className="text-2xl font-semibold text-[#2C2A29]">Going Home</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm text-[#2C2A29] hover:text-[#93B0C8] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Banner */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-[#2C2A29] mb-6 leading-tight">
            A peaceful place to organize
            <br />
            what matters most
          </h2>
          <p className="text-xl text-[#2C2A29] opacity-70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Securely store your end-of-life preferences, important documents, and personal messages
            for loved ones—all in one simple, private space.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors text-lg font-medium"
          >
            Start Planning Today
          </Link>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Simple Forms"
              description="Fill out easy-to-understand forms for your personal details and preferences"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Secure Storage"
              description="Your information is encrypted and protected with industry-leading security"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Trusted Contacts"
              description="Choose who can access your information and control what they see"
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Personal Messages"
              description="Write heartfelt letters to loved ones to be shared when the time comes"
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-[#FCFAF7] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-semibold text-[#2C2A29] text-center mb-12">
              How It Works
            </h3>
            <div className="space-y-8">
              <Step
                number="1"
                title="Create Your Account"
                description="Sign up with email and set up two-factor authentication for security"
              />
              <Step
                number="2"
                title="Add Your Information"
                description="Fill out simple forms with your personal details, preferences, and upload important documents"
              />
              <Step
                number="3"
                title="Choose Trusted Contacts"
                description="Designate who can access your information and what they can view"
              />
              <Step
                number="4"
                title="Secure & Share"
                description="Lock your plan and share the release code with your executor"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h3 className="text-3xl font-semibold text-[#2C2A29] mb-6">
            Give your loved ones peace of mind
          </h3>
          <p className="text-lg text-[#2C2A29] opacity-70 mb-8 max-w-2xl mx-auto">
            Start organizing your end-of-life information today. It's simple, secure, and completely free.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-[#A5B99A] text-white rounded-lg hover:bg-[#93B0C8] transition-colors text-lg font-medium"
          >
            Get Started Now
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#FCFAF7] border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-[#2C2A29] opacity-60">
            <p>© 2024 Going Home. Built with care for those who plan ahead.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#FCFAF7] rounded-lg p-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-lg mb-4 text-[#A5B99A]">
        {icon}
      </div>
      <h4 className="text-lg font-medium text-[#2C2A29] mb-2">{title}</h4>
      <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start space-x-6">
      <div className="flex-shrink-0 w-12 h-12 bg-[#A5B99A] text-white rounded-full flex items-center justify-center text-xl font-semibold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="text-xl font-medium text-[#2C2A29] mb-2">{title}</h4>
        <p className="text-[#2C2A29] opacity-70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
