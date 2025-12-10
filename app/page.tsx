'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, 
  Shield, 
  Users, 
  FileText, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  FolderLock,
  MessageSquare,
  User
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-[#FAF9F7] to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Heart className="w-8 h-8 text-[#A5B99A] group-hover:text-[#93B0C8] transition-colors" fill="currentColor" />
                <Sparkles className="w-3 h-3 text-[#93B0C8] absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2C2A29]">Going Home</h1>
                <p className="text-xs text-[#2C2A29] opacity-50 -mt-0.5">Secure Planning</p>
              </div>
            </Link>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-[#2C2A29] hover:text-[#93B0C8] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A5B99A]/5 via-transparent to-[#93B0C8]/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-[#FCFAF7] border border-[#A5B99A]/20 rounded-full px-4 py-2 mb-8">
              <Shield className="w-4 h-4 text-[#A5B99A]" />
              <span className="text-sm font-medium text-[#2C2A29]">Enterprise-Grade Security</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#2C2A29] mb-6 leading-tight">
              A peaceful place to organize
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] mt-2">
                what matters most
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-[#2C2A29]/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Securely store your end-of-life preferences, important documents, and personal messages
              for loved ones—all in one simple, private space.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-xl transition-all text-lg font-semibold transform hover:scale-105"
              >
                <span>Start Planning Today</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 bg-white border-2 border-[#A5B99A] text-[#2C2A29] rounded-lg hover:bg-[#FCFAF7] transition-colors text-lg font-semibold"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-[#2C2A29]/60">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />
                <span>Bank-Level Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#A5B99A]" />
                <span>No Credit Card</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#2C2A29] mb-4">
              Everything you need in one place
            </h2>
            <p className="text-xl text-[#2C2A29]/70 max-w-2xl mx-auto">
              Comprehensive tools to organize, secure, and share what matters most
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Comprehensive Forms"
              description="Easy-to-use forms for personal details, medical contacts, funeral preferences, and more. Everything organized and accessible."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Bank-Level Security"
              description="Your information is encrypted with industry-leading security. We use enterprise-grade encryption to protect your data."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Trusted Contacts"
              description="Choose who can access your information with granular permissions. Control exactly what each contact can view."
            />
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="Personal Letters"
              description="Write heartfelt letters to loved ones with AI assistance. Share your thoughts, memories, and final messages."
            />
            <FeatureCard
              icon={<FolderLock className="w-6 h-6" />}
              title="Secure Documents"
              description="Upload and store important documents securely. Wills, insurance policies, deeds, and more—all in one place."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI-Powered Tools"
              description="Get personalized guidance with AI-assisted planning. Checklists, letter writing, and preference suggestions."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-[#FCFAF7] to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#2C2A29] mb-4">
              Simple, secure, and stress-free
            </h2>
            <p className="text-xl text-[#2C2A29]/70 max-w-2xl mx-auto">
              Get started in minutes. Your information stays private until you decide to share it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              number="01"
              title="Create Account"
              description="Sign up with email and enable two-factor authentication for maximum security."
              icon={<User className="w-8 h-8" />}
            />
            <StepCard
              number="02"
              title="Add Information"
              description="Fill out simple forms at your own pace. Your data is saved automatically."
              icon={<FileText className="w-8 h-8" />}
            />
            <StepCard
              number="03"
              title="Choose Contacts"
              description="Designate trusted contacts and control what information they can access."
              icon={<Users className="w-8 h-8" />}
            />
            <StepCard
              number="04"
              title="Secure & Share"
              description="Lock your plan with a release code. Share access only when ready."
              icon={<Lock className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-[#2C2A29] mb-6">
                Give your loved ones peace of mind
              </h2>
              <p className="text-lg text-[#2C2A29]/70 mb-8 leading-relaxed">
                Planning ahead isn't about dwelling on the future—it's about giving yourself and your family
                the gift of clarity and peace of mind. When the time comes, your loved ones will have
                everything they need, exactly as you wanted it.
              </p>
              <ul className="space-y-4 mb-8">
                <BenefitItem text="Reduce stress and confusion during difficult times" />
                <BenefitItem text="Ensure your wishes are known and respected" />
                <BenefitItem text="Protect your digital legacy and accounts" />
                <BenefitItem text="Leave meaningful messages for those you love" />
              </ul>
              <Link
                href="/auth/signup"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-lg hover:shadow-xl transition-all text-lg font-semibold transform hover:scale-105"
              >
                <span>Start Your Plan Today</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#FCFAF7] to-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                <div className="space-y-6">
                  <FeatureHighlight icon={<CheckCircle2 />} text="Will Questionnaire Planning" />
                  <FeatureHighlight icon={<CheckCircle2 />} text="Funeral Planning & Preferences" />
                  <FeatureHighlight icon={<CheckCircle2 />} text="Digital Account Management" />
                  <FeatureHighlight icon={<CheckCircle2 />} text="Asset Documentation" />
                  <FeatureHighlight icon={<CheckCircle2 />} text="Legacy Messages & Letters" />
                  <FeatureHighlight icon={<CheckCircle2 />} text="Medical & Legal Contacts" />
                  <FeatureHighlight icon={<CheckCircle2 />} text="Trusted Contact Management" />
                  <FeatureHighlight icon={<CheckCircle2 />} text="AI-Powered Assistance" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of families who have found peace of mind through thoughtful planning.
            It's free, secure, and takes just minutes to begin.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center space-x-2 px-10 py-5 bg-white text-[#2C2A29] rounded-lg hover:shadow-2xl transition-all text-lg font-bold transform hover:scale-105"
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-white/80">
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C2A29] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-6 h-6 text-[#A5B99A]" fill="currentColor" />
                <h3 className="text-xl font-bold">Going Home</h3>
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                A peaceful place to organize what matters most. Secure, simple, and designed with care
                for those who plan ahead.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Security</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="cursor-default">Bank-Level Encryption</span></li>
                <li><span className="cursor-default">Two-Factor Authentication</span></li>
                <li><span className="cursor-default">Privacy First</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Going Home. Built with care for those who plan ahead.</p>
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
    <div className="group bg-white border border-gray-100 rounded-xl p-6 hover:shadow-xl hover:border-[#A5B99A] transition-all duration-300">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-lg mb-4 text-white group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-xl font-semibold text-[#2C2A29] mb-2">{title}</h4>
      <p className="text-[#2C2A29]/70 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all h-full">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-lg flex items-center justify-center text-white">
              {icon}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-4xl font-bold text-[#A5B99A] opacity-20 mb-2">{number}</div>
            <h4 className="text-lg font-semibold text-[#2C2A29] mb-2">{title}</h4>
            <p className="text-sm text-[#2C2A29]/70 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-start space-x-3">
      <CheckCircle2 className="w-6 h-6 text-[#A5B99A] flex-shrink-0 mt-0.5" />
      <span className="text-[#2C2A29]/80">{text}</span>
    </li>
  );
}

function FeatureHighlight({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="text-[#A5B99A]">{icon}</div>
      <span className="text-[#2C2A29] font-medium">{text}</span>
    </div>
  );
}