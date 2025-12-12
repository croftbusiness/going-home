'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  User,
  Calculator,
  BookOpen,
  Music,
  Gift,
  Home as HomeIcon,
  Baby,
  Building2,
  Key,
  DollarSign,
  Video,
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
      {/* Navigation - Simplified */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center group flex-shrink-0">
              <div className="relative h-7 sm:h-8 w-auto">
                <Image
                  src="/logo.svg"
                  alt="ReadyAtHand Logo"
                  width={180}
                  height={45}
                  className="object-contain h-7 sm:h-8 w-auto"
                  priority
                />
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/auth/login"
                className="p-2.5 sm:p-3 rounded-full hover:bg-[#FCFAF7] transition-all duration-200 group touch-target"
                title="Sign in to your account"
                aria-label="Sign in"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#2C2A29] group-hover:text-[#93B0C8] transition-colors" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-full hover:shadow-lg transition-all duration-200 text-sm sm:text-base font-semibold transform hover:scale-105 active:scale-95 touch-target"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-24 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A5B99A]/5 via-transparent to-[#93B0C8]/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#FCFAF7] border border-[#A5B99A]/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A5B99A]" />
              <span className="text-xs sm:text-sm font-medium text-[#2C2A29]">Enterprise-Grade Security</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#2C2A29] mb-4 sm:mb-6 leading-tight px-2">
              Calm preparedness for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] mt-1 sm:mt-2">
                life's unexpected moments
              </span>
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-[#2C2A29]/70 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
              ReadyAtHand helps you organize the information your loved ones may need — calmly, securely, and ahead of time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Link
                href="/auth/signup"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-full hover:shadow-xl transition-all text-base sm:text-lg font-semibold transform hover:scale-105 active:scale-95 touch-target"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white border-2 border-[#A5B99A] text-[#2C2A29] rounded-full hover:bg-[#FCFAF7] transition-colors text-base sm:text-lg font-semibold touch-target"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 sm:gap-8 text-xs sm:text-sm text-[#2C2A29]/60 px-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#A5B99A] flex-shrink-0" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#A5B99A] flex-shrink-0" />
                <span>Bank-Level Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#A5B99A] flex-shrink-0" />
                <span>No Credit Card</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Mobile Optimized */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#2C2A29] mb-3 sm:mb-4 px-4">
              Everything you need in one place
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-[#2C2A29]/70 max-w-2xl mx-auto px-4">
              This helps the people you love know what to do. Prepared without panic.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <FeatureCard
              icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Personal Information"
              description="Store personal details, medical contacts, household information, and emergency contacts securely."
            />
            <FeatureCard
              icon={<Heart className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Life Event Preferences"
              description="Document your care preferences and wishes for unexpected moments with guided forms."
            />
            <FeatureCard
              icon={<Music className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Life Event Planning"
              description="Plan for when you can't be there—medical emergencies, accidents, hospitalization, and memorial services."
            />
            <FeatureCard
              icon={<Calculator className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Cost Calculator"
              description="Estimate expenses with our comprehensive cost calculator for burial or cremation."
            />
            <FeatureCard
              icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Personal Biography"
              description="Preserve your life story, accomplishments, family history, and lessons learned with AI assistance."
            />
            <FeatureCard
              icon={<MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Messages & Guidance"
              description="Write heartfelt messages to loved ones with AI assistance. Share your thoughts and guidance."
            />
            <FeatureCard
              icon={<Baby className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Children's Wishes"
              description="Leave special messages and wishes for your children to be shared at meaningful moments."
            />
            <FeatureCard
              icon={<Gift className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Family Legacy"
              description="Preserve family traditions, recipes, stories, heirlooms, and memories for future generations."
            />
            <FeatureCard
              icon={<FolderLock className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Important Documents"
              description="Upload and store important documents securely. Wills, insurance policies, deeds, and more."
            />
            <FeatureCard
              icon={<Key className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Digital Accounts"
              description="Securely store account information, passwords, and access details for your digital life."
            />
            <FeatureCard
              icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Assets & Financial"
              description="Document your assets, insurance policies, financial accounts, and important contacts."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Bank-Level Security"
              description="Your information is encrypted with industry-leading security. Enterprise-grade protection."
            />
            <FeatureCard
              icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Emergency & Trusted Contacts"
              description="Choose who can access your information with granular permissions. Control exactly what each contact can view."
            />
            <FeatureCard
              icon={<Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="AI-Powered Tools"
              description="Get personalized guidance with AI-assisted planning, writing, and preference suggestions."
            />
            <FeatureCard
              icon={<Lock className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Access Rules"
              description="Control when and how your information is shared. Set executor codes and release mechanisms."
            />
          </div>
        </div>
      </section>

      {/* How It Works - Mobile Optimized */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#FCFAF7] to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#2C2A29] mb-3 sm:mb-4 px-4">
              Simple, secure, and stress-free
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-[#2C2A29]/70 max-w-2xl mx-auto px-4">
              Get started in minutes. Your information stays private until you decide to share it.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <StepCard
              number="01"
              title="Create Account"
              description="Sign up with email and enable two-factor authentication for maximum security."
              icon={<User className="w-6 h-6 sm:w-8 sm:h-8" />}
            />
            <StepCard
              number="02"
              title="Add Information"
              description="Fill out simple forms at your own pace. Your data is saved automatically."
              icon={<FileText className="w-6 h-6 sm:w-8 sm:h-8" />}
            />
            <StepCard
              number="03"
              title="Choose Contacts"
              description="Designate trusted contacts and control what information they can access."
              icon={<Users className="w-6 h-6 sm:w-8 sm:h-8" />}
            />
            <StepCard
              number="04"
              title="Secure & Share"
              description="Lock your plan with a release code. Share access only when ready."
              icon={<Lock className="w-6 h-6 sm:w-8 sm:h-8" />}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#2C2A29] mb-4 sm:mb-6">
                Calm readiness, whenever it's needed
              </h2>
              <p className="text-base sm:text-lg text-[#2C2A29]/70 mb-6 sm:mb-8 leading-relaxed">
                Being prepared isn't about worry—it's about clarity and peace of mind. If something happens, 
                your loved ones will have everything they need, exactly as you wanted it.
              </p>
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <BenefitItem text="Reduce stress and confusion during unexpected moments" />
                <BenefitItem text="Ensure your wishes are known and respected" />
                <BenefitItem text="Protect your digital legacy and accounts" />
                <BenefitItem text="Leave meaningful messages for those you love" />
                <BenefitItem text="Plan life events exactly as you envision them" />
                <BenefitItem text="Preserve your life story for future generations" />
              </ul>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-full hover:shadow-xl transition-all text-base sm:text-lg font-semibold transform hover:scale-105 active:scale-95 touch-target"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="bg-gradient-to-br from-[#FCFAF7] to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl sm:shadow-2xl border border-gray-100">
                <div className="space-y-3 sm:space-y-4">
                  <FeatureHighlight icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />} text="Life Event Preferences & Directives" />
                  <FeatureHighlight icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />} text="Life Event Planning for Emergencies & Memorials" />
                  <FeatureHighlight icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />} text="Personal Biography with AI Assistance" />
                  <FeatureHighlight icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />} text="Visual Planning Boards & Moodboards" />
                  <FeatureHighlight icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />} text="Messages & Guidance" />
                  <FeatureHighlight icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />} text="Children's Wishes & Family Legacy" />
                  <FeatureHighlight icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />} text="Digital Accounts & Assets" />
                  <FeatureHighlight icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />} text="Will Questionnaire & Legal Planning" />
                  <FeatureHighlight icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />} text="Emergency & Trusted Contact Management" />
                  <FeatureHighlight icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />} text="Secure Document Storage" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Mobile Optimized */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to get started?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
            You don't need to finish everything at once. Start organizing what matters most, 
            calmly and at your own pace.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 sm:px-10 py-4 sm:py-5 bg-white text-[#2C2A29] rounded-full hover:shadow-2xl transition-all text-base sm:text-lg font-bold transform hover:scale-105 active:scale-95 touch-target"
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <p className="mt-6 text-xs sm:text-sm text-white/80 px-4">
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-[#2C2A29] text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center mb-4">
                <div className="relative h-6 sm:h-7 w-auto">
                  <Image
                    src="/logo.svg"
                    alt="ReadyAtHand Logo"
                    width={140}
                    height={35}
                    className="object-contain h-6 sm:h-7 w-auto"
                  />
                </div>
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                Calm preparedness for life's unexpected moments. Secure, simple, and designed with care.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Security</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="cursor-default">Bank-Level Encryption</span></li>
                <li><span className="cursor-default">Two-Factor Authentication</span></li>
                <li><span className="cursor-default">Privacy First</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>© {new Date().getFullYear()} ReadyAtHand. Calm preparedness for life's unexpected moments.</p>
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
    <div className="group bg-white border border-gray-100 rounded-xl p-5 sm:p-6 hover:shadow-xl hover:border-[#A5B99A] transition-all duration-300 h-full">
      <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-lg mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-lg sm:text-xl font-semibold text-[#2C2A29] mb-2">{title}</h4>
      <p className="text-sm sm:text-base text-[#2C2A29]/70 leading-relaxed">{description}</p>
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
      <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 hover:shadow-lg transition-all h-full">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-lg flex items-center justify-center text-white">
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-3xl sm:text-4xl font-bold text-[#A5B99A] opacity-20 mb-1 sm:mb-2">{number}</div>
            <h4 className="text-base sm:text-lg font-semibold text-[#2C2A29] mb-1 sm:mb-2">{title}</h4>
            <p className="text-xs sm:text-sm text-[#2C2A29]/70 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 sm:gap-3">
      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#A5B99A] flex-shrink-0 mt-0.5" />
      <span className="text-sm sm:text-base text-[#2C2A29]/80">{text}</span>
    </li>
  );
}

function FeatureHighlight({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="text-[#A5B99A] flex-shrink-0">{icon}</div>
      <span className="text-sm sm:text-base text-[#2C2A29] font-medium">{text}</span>
    </div>
  );
}
