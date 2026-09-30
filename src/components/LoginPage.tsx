import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../types/farming';
import {
  Sprout,
  Phone,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Globe,
  AlertCircle,
  ScanLine,
  Leaf,
  Layers,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+91', country: 'India (भारत)', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
];

export const LoginPage: React.FC = () => {
  const {
    sendOtp,
    verifyOtp,
    loginWithGoogle,
    loginAsGuest,
    isLoading,
    pendingPhone,
    activeDemoOtp,
    resendCountdown,
  } = useAuth();

  const { language, setLanguage, t } = useLanguage();

  // Mobile login states
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [smsNotification, setSmsNotification] = useState<string | null>(null);

  // Google Login modal simulation
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('farmer.kisan@gmail.com');
  const [googleName, setGoogleName] = useState('Kisan Patil');

  // OTP inputs refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP box on entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const fullPhone = `${countryCode} ${phoneNumber.trim()}`;

    const res = await sendOtp(fullPhone);
    if (res.success) {
      setStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      if (res.demoOtp) {
        setSmsNotification(`AgriSahay Verification Code: ${res.demoOtp} (Expires in 10 mins)`);
      }
    } else {
      setError(res.error || 'Failed to send OTP');
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    const fullPhone = pendingPhone || `${countryCode} ${phoneNumber.trim()}`;
    const res = await sendOtp(fullPhone);
    if (res.success && res.demoOtp) {
      setSmsNotification(`New AgriSahay Code: ${res.demoOtp}`);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 filled
    const completeCode = newDigits.join('');
    if (completeCode.length === 6 && !newDigits.includes('')) {
      handleVerify(completeCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split('');
      setOtpDigits(newDigits);
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeOverride?: string) => {
    setError(null);
    const code = codeOverride || otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }

    const fullPhone = pendingPhone || `${countryCode} ${phoneNumber.trim()}`;
    const res = await verifyOtp(fullPhone, code);
    if (!res.success) {
      setError(res.error || 'Verification failed. Please try again.');
    }
  };

  const handleFillDemoOtp = () => {
    if (activeDemoOtp && activeDemoOtp.length === 6) {
      const digits = activeDemoOtp.split('');
      setOtpDigits(digits);
      handleVerify(activeDemoOtp);
    }
  };

  const handleGoogleSubmit = async () => {
    setError(null);
    const res = await loginWithGoogle();
    if (!res.success) {
      setError(res.error || 'Google login failed');
    }
    setIsGoogleModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <nav className="border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 shadow-md">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">AgriSahay</h1>
            <p className="text-[10px] font-semibold tracking-wider text-emerald-400">SMART ECO-FARMING</p>
          </div>
        </div>

        {/* Language selector on Login Screen */}
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={language.code}
            onChange={(e) => {
              const selected = LANGUAGES.find((l) => l.code === e.target.value);
              if (selected) setLanguage(selected);
            }}
            className="rounded-xl border border-slate-700 bg-slate-900 py-1 px-2.5 text-xs font-semibold text-slate-200 outline-none focus:border-emerald-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Brand Panel (Hidden on mobile or stacked) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trusted by Organic Farmers Across India
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Welcome to <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">AgriSahay</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Smart assistance for smarter farming. Empowering smallholder and progressive farmers with AI crop diagnostics, customized organic eco-plans, and community resource networks.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0 text-left pt-2">
              <div className="p-3 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-start gap-2.5">
                <ScanLine className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Instant Leaf Disease Scan</h4>
                  <p className="text-[11px] text-slate-400">Identify pathogens & get zero-chemical bio-remedies.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-start gap-2.5">
                <Leaf className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Custom Eco-Farming Plan</h4>
                  <p className="text-[11px] text-slate-400">Yield forecasts & regenerative soil growth roadmap.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-start gap-2.5">
                <Layers className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Smart Compost Calculator</h4>
                  <p className="text-[11px] text-slate-400">Scientific C:N balance & thermal curing roadmaps.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-start gap-2.5">
                <HeartHandshake className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Community Sharing</h4>
                  <p className="text-[11px] text-slate-400">Rent tools & barter indigenous heritage seeds.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Dedicated Auth Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            {/* Simulated SMS Notification Toast */}
            {smsNotification && (
              <div className="mb-4 p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/90 backdrop-blur-md shadow-xl text-xs text-emerald-200 animate-in fade-in slide-in-from-top-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💬</span>
                  <div>
                    <span className="font-bold text-emerald-300 block">SMS Message Received</span>
                    <span className="font-mono text-emerald-100">{smsNotification}</span>
                  </div>
                </div>
                {step === 'otp' && (
                  <button
                    onClick={handleFillDemoOtp}
                    className="shrink-0 px-2 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] hover:bg-emerald-400"
                  >
                    Auto-Fill
                  </button>
                )}
              </div>
            )}

            <div className="rounded-3xl border border-emerald-500/20 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
              {/* Card Header */}
              <div className="text-center space-y-1">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-md mb-2">
                  <Sprout className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Welcome to AgriSahay
                </h3>
                <p className="text-xs text-slate-400">
                  Smart assistance for smarter farming
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step A: Phone Number Input */}
              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Mobile Number Login
                    </label>
                    <div className="flex items-center gap-2">
                      {/* Country Code Select */}
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2.5 text-xs font-semibold text-slate-200 outline-none focus:border-emerald-500"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>

                      {/* Phone Number Input */}
                      <div className="relative flex-1">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="tel"
                          placeholder="e.g. 98220 12345"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          maxLength={12}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-xs font-mono text-white outline-none focus:border-emerald-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      We will send a 6-digit one-time password (OTP) via SMS.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phoneNumber.replace(/\D/g, '').length < 8}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step A2: OTP Verification Screen */
                <div className="space-y-5 animate-in fade-in">
                  <div className="text-center space-y-1">
                    <span className="text-xs text-slate-400">
                      Enter the 6-digit code sent to
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {pendingPhone || `${countryCode} ${phoneNumber}`}
                      </span>
                      <button
                        onClick={() => {
                          setStep('phone');
                          setError(null);
                        }}
                        className="text-[11px] text-slate-400 hover:text-white underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* 6-Digit OTP Box Grid */}
                  <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`w-10 sm:w-12 h-12 text-center text-lg font-black font-mono rounded-xl border bg-slate-950 text-white outline-none transition-all ${
                          digit
                            ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                            : 'border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Verify Action */}
                  <button
                    onClick={() => handleVerify()}
                    disabled={isLoading || otpDigits.join('').length < 6}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Verifying OTP...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Verify & Access Dashboard
                      </>
                    )}
                  </button>

                  {/* Resend Countdown */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Didn't receive code?</span>
                    {resendCountdown > 0 ? (
                      <span className="font-mono text-slate-500">
                        Resend in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  OR CONTINUE WITH
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              {/* Option B: Continue with Google */}
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  const res = await loginWithGoogle();
                  if (!res.success && res.error) {
                    setError(res.error);
                  }
                }}
                disabled={isLoading}
                className="w-full py-3 rounded-2xl border border-slate-700 hover:border-slate-500 bg-slate-950 hover:bg-slate-900/90 text-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 shadow-md active:scale-98 disabled:opacity-60"
              >
                {/* Google Colored Logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Option C: Continue as Guest */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={loginAsGuest}
                  className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Continue as Guest
                </button>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Explore full features; history is kept for this browser session.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Google Login Dialog */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h4 className="font-bold text-white text-sm">Sign in with Google</h4>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select or confirm your Google Farmer Account to sign in to AgriSahay:
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Google Email</label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleGoogleSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md"
              >
                Confirm & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AgriSahay. Empowering sustainable agricultural practices worldwide.
      </footer>
    </div>
  );
};
