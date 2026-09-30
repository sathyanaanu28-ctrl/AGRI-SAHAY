import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { ProfileModal } from './components/ProfileModal';
import { DiseaseDetection } from './components/DiseaseDetection';
import { EcoPlanGenerator } from './components/EcoPlanGenerator';
import { CompostPlanner } from './components/CompostPlanner';
import { CropRotationPlanner } from './components/CropRotationPlanner';
import { FarmJournal } from './components/FarmJournal';
import { ResourceNetwork } from './components/ResourceNetwork';
import { FarmMarketplace } from './components/marketplace/FarmMarketplace';
import { FarmWorkspaceHub } from './components/workspace/FarmWorkspaceHub';
import { FarmAdvisorModal } from './components/FarmAdvisorModal';
import {
  Sprout,
  ScanLine,
  Flame,
  RotateCcw,
  BookOpen,
  ShieldCheck,
  HeartHandshake,
  UserCheck,
  AlertCircle,
  Tractor,
  CalendarDays,
} from 'lucide-react';

type TabId = 'diseaseDetection' | 'ecoPlan' | 'compost' | 'rotation' | 'journal' | 'share' | 'marketplace' | 'workspace';

function DashboardView() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isGuest, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>('diseaseDetection');
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  // If user profile is not completed and not guest, prompt them
  useEffect(() => {
    if (user && !user.profileComplete && !user.isGuest) {
      setIsProfileModalOpen(true);
    }
  }, [user]);

  // If not authenticated, route to Login Page
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const tabs: { id: TabId; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'diseaseDetection', labelKey: 'diseaseDetection', icon: ScanLine },
    { id: 'ecoPlan', labelKey: 'ecoPlan', icon: Sprout },
    { id: 'compost', labelKey: 'compost', icon: Flame },
    { id: 'rotation', labelKey: 'rotation', icon: RotateCcw },
    { id: 'journal', labelKey: 'journal', icon: BookOpen },
    { id: 'share', labelKey: 'share', icon: HeartHandshake },
    { id: 'marketplace', labelKey: 'marketplace', icon: Tractor },
    { id: 'workspace', labelKey: 'workspace', icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      <div>
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        <Header
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Guest Notification Banner */}
        {isGuest && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Guest Mode Active:</strong> You can explore all diagnostic and planning tools. Sign in with mobile OTP or Google to permanently store farm logs and records.
                </span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shrink-0"
              >
                Sign In Now
              </button>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{t(tab.labelKey)}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Views */}
          <div className="animate-in fade-in duration-200">
            {activeTab === 'diseaseDetection' && <DiseaseDetection userId={user.id} />}
            {activeTab === 'ecoPlan' && <EcoPlanGenerator />}
            {activeTab === 'compost' && <CompostPlanner />}
            {activeTab === 'rotation' && <CropRotationPlanner />}
            {activeTab === 'journal' && <FarmJournal userId={user.id} />}
            {activeTab === 'share' && <ResourceNetwork />}
            {activeTab === 'marketplace' && <FarmMarketplace currentUser={user} />}
            {activeTab === 'workspace' && <FarmWorkspaceHub />}
          </div>
        </main>
      </div>

      {/* Floating Advisor Button */}
      <button
        onClick={() => setIsAdvisorOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
        title="Open Organic Agronomy Advisor"
      >
        <Sprout className="h-5 w-5" />
        <span className="hidden sm:inline">Ask Bio-Advisor</span>
      </button>

      {/* Advisor Modal */}
      <FarmAdvisorModal isOpen={isAdvisorOpen} onClose={() => setIsAdvisorOpen(false)} />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        isInitialSetup={!user.profileComplete}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500/60" />
            <span className="font-semibold text-slate-400">
              {t('footerText', { year: new Date().getFullYear() })}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Non-Toxic Agronomy</span>
            <span>•</span>
            <span>Microbiome Friendly</span>
            <span>•</span>
            <span>Farmer Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAys3f7gHRjRtbA3P3ODVzhjtAHTFJa25A';

  return (
    <APIProvider apiKey={mapsApiKey} libraries={['places', 'marker', 'geometry']}>
      <LanguageProvider>
        <AuthProvider>
          <DashboardView />
        </AuthProvider>
      </LanguageProvider>
    </APIProvider>
  );
}

