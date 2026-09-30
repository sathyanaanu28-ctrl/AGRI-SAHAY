import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../types/farming';
import {
  Sprout,
  Globe,
  MessageSquareQuote,
  ShieldCheck,
  Sun,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onOpenAdvisor: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdvisor, onOpenProfile }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isGuest } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-500/20 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Sprout className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                {t('appTitle')}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" />
                Regenerative AI
              </span>
            </div>
            <p className="text-[10px] font-semibold tracking-wider text-emerald-400/80">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Season Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
            <Sun className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span className="text-[11px] font-medium">{t('activeSeason')}</span>
          </div>

          {/* Bio Advisor CTA */}
          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all active:scale-95"
            title="Ask Organic Formulation & Remedy Advisor"
          >
            <MessageSquareQuote className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">{t('advisor')}</span>
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-2.5 flex items-center text-slate-400">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <select
              value={language.code}
              onChange={(e) => {
                const selected = LANGUAGES.find((l) => l.code === e.target.value);
                if (selected) setLanguage(selected);
              }}
              className="appearance-none rounded-xl border border-slate-700 bg-slate-900/90 py-1.5 pl-8 pr-7 text-xs font-semibold text-slate-200 outline-none transition-colors hover:border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              aria-label="Select Application Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 text-slate-400 text-[10px]">
              ▼
            </div>
          </div>

          {/* Authenticated Farmer Profile & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors group"
                title="View & Edit Farmer Profile"
              >
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                </div>
                <div className="hidden md:block max-w-[110px]">
                  <span className="text-xs font-bold text-white block truncate group-hover:text-emerald-300">
                    {user.name || (isGuest ? 'Guest' : 'Farmer')}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {isGuest ? 'Guest Mode' : user.district || user.state || 'My Farm'}
                  </span>
                </div>
                <ChevronDown className="hidden md:block h-3 w-3 text-slate-500" />
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold transition-all active:scale-95"
                title="Logout from AgriSahay"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
