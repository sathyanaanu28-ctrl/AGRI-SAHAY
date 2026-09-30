import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  MessageSquareQuote,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  Mic,
  MicOff,
  BookOpen,
  FlaskConical,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface FarmAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_QUESTIONS = [
  'How to prepare Jeevamrutha (200 Litres) for 1 acre soil aeration?',
  'What is the exact recipe for Neemastra against whiteflies and aphids?',
  'How to do Beejamrutha seed priming to prevent seedling rot?',
  'How to use sour buttermilk (Chhach) spray to treat powdery mildew?',
  'How to naturally manage pink bollworm in organic cotton without synthetic chemicals?',
];

interface StaticRecipe {
  name: string;
  hindiName: string;
  category: string;
  dosage: string;
  target: string;
  ingredients: string[];
  steps: string[];
}

const TRADITIONAL_RECIPES: StaticRecipe[] = [
  {
    name: 'Jeevamrutha (Liquid Bio-Culture)',
    hindiName: 'जीवामृत (तरल जैविक खाद)',
    category: 'Bio-Fertilizer & Soil Inoculant',
    dosage: '200 Litres / acre via irrigation water or spray twice monthly',
    target: 'Enhances beneficial mycorrhizae, bacteria, and earthworm activity',
    ingredients: [
      'Fresh Desi Cow Dung: 10 kg',
      'Desi Cow Urine: 5 to 10 Litres',
      'Jaggery (Gud) or sugarcane juice: 1 to 2 kg',
      'Pulse / Besan Flour (Gram/pigeon pea): 1 to 2 kg',
      'Virgin soil from farm boundary/banyan tree: 1 handful (100g)',
      'Water: 200 Litres (Chlorine-free)',
    ],
    steps: [
      'Mix cow dung and cow urine well in a 200-litre plastic barrel with water.',
      'Dissolve jaggery and pulse flour in water separately and stir into barrel.',
      'Add the handful of virgin undisturbed soil containing indigenous soil microbes.',
      'Stir clockwise with a wooden stick for 2 minutes, cover with jute bag in shade.',
      'Stir twice daily for 48 to 72 hours. Apply to field within 7 days of maturation.',
    ],
  },
  {
    name: 'Neemastra (Botanical Insecticide)',
    hindiName: 'नीमास्त्र (कीटनाशक घोल)',
    category: 'Natural Pest Repellent',
    dosage: 'Dilute 100L in 200L water / acre, or spray undiluted on heavy infestation',
    target: 'Whiteflies, aphids, jassids, mealybugs, and small chewing caterpillars',
    ingredients: [
      'Crushed Neem Leaves / Tender twigs: 5 kg',
      'Fresh Desi Cow Dung: 2 kg',
      'Desi Cow Urine: 5 Litres',
      'Water: 100 Litres',
    ],
    steps: [
      'Mix 2kg cow dung and 5L cow urine in 100L water in a drum.',
      'Crush or pound 5kg neem leaves into coarse paste and add to drum.',
      'Stir clockwise with wooden stick; cover with mesh/cloth in shade.',
      'Ferment for 48 hours, stirring twice a day.',
      'Filter with fine cloth and spray directly on foliage early morning.',
    ],
  },
  {
    name: 'Beejamrutha (Seed Treatment Primer)',
    hindiName: 'बीजामृत (बीज संस्कार)',
    category: 'Seed Protector',
    dosage: 'Coat seeds evenly with hands, shade dry for 30 minutes before sowing',
    target: 'Prevents seedling root rot, damping off, and seed-borne fungal blights',
    ingredients: [
      'Desi Cow Dung: 5 kg (tied in cloth bundle and hung in 50L water overnight)',
      'Desi Cow Urine: 5 Litres',
      'Slaked Lime (Chuna): 50 grams',
      'Handful of virgin soil from bund: 100g',
      'Water: 20 Litres',
    ],
    steps: [
      'Squeeze the dung bundle in water repeatedly to extract microbial essence.',
      'Add cow urine, slaked lime dissolved in water, and bund soil.',
      'Stir well. Spread seeds on plastic sheet, sprinkle Beejamrutha, rub gently.',
      'Shade dry for 30-45 minutes before sowing in moist seedbed.',
    ],
  },
  {
    name: 'Agniastra (Potent Caterpillar Destroyer)',
    hindiName: 'अग्निअस्त्र (इल्ली नाशक)',
    category: 'Intensive Pest Control',
    dosage: '6 to 8 Litres Agniastra mixed in 200 Litres water per acre',
    target: 'Bollworms, fruit borers, stem borers, and leaf rollers',
    ingredients: [
      'Desi Cow Urine: 20 Litres',
      'Neem leaf paste: 5 kg',
      'Crushed Tobacco powder / leaves: 500 grams',
      'Hot Green Chili paste: 500 grams',
      'Garlic paste: 250 grams',
    ],
    steps: [
      'In a clay or copper/iron pot, mix all ingredients in cow urine.',
      'Boil on slow flame for 4 to 5 boils, stirring carefully with wooden rod.',
      'Allow to cool in shade for 48 hours, stirring twice daily.',
      'Filter through double-folded cotton cloth. Store up to 3 months in opaque jugs.',
    ],
  },
  {
    name: 'Sour Buttermilk Spray (Khatti Chhach)',
    hindiName: 'खट्टी छाछ फफूंदनाशक',
    category: 'Natural Bio-Fungicide',
    dosage: '5 Litres strained sour buttermilk in 100 Litres water per acre',
    target: 'Powdery mildew, downy mildew, leaf curl, and blossom end rot',
    ingredients: [
      'Sour Buttermilk (5-7 days old): 5 Litres',
      'Clean Copper wire or copper coin: 1 piece',
      'Water: 100 Litres',
    ],
    steps: [
      'Store fresh buttermilk in clay or plastic pot with a clean copper piece for 5-7 days.',
      'The liquid will turn greenish due to copper chelation with lactic acid.',
      'Strain through cloth, mix into 100L water, and spray during early blight symptoms.',
    ],
  },
];

export const FarmAdvisorModal: React.FC<FarmAdvisorModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'advisor' | 'handbook'>('advisor');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Speech recognition
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  if (!isOpen) return null;

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        pa: 'pa-IN',
      };
      recognition.lang = langMap[language.code] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuestion(transcript);
          handleAsk(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleAsk = async (qText?: string) => {
    const promptText = qText || question;
    if (!promptText.trim()) return;

    setIsLoading(true);
    setError(null);
    stopAudio();

    try {
      const response = await fetch('/api/farm-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: promptText,
          languageCode: language.code,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get advisory answer');
      }

      const data = await response.json();
      setAnswer(data.answer);
      if (qText) setQuestion(qText);
    } catch (err: any) {
      setError(err.message || 'Error communicating with advisory service');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (!answer) return;
    if (isSpeaking) {
      stopAudio();
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(answer);
    const langMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      pa: 'pa-IN',
    };
    utterance.lang = langMap[language.code] || 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-5">
        {/* Close Button */}
        <button
          onClick={() => {
            stopAudio();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <MessageSquareQuote className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">
              Organic Agronomy & Recipe Advisor
            </h3>
            <p className="text-xs text-slate-400">
              Verified Vedic and modern bio-remedies, non-toxic formulations, and voice advice.
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('advisor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'advisor'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Agronomist Chat
          </button>
          <button
            onClick={() => setActiveTab('handbook')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'handbook'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Bio-Formulations Handbook (5 Recipes)
          </button>
        </div>

        {activeTab === 'advisor' ? (
          <>
            {/* Quick questions chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                Popular Bio-Remedy Inquiries:
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAsk(q)}
                    className="text-left px-3 py-1.5 rounded-xl border border-slate-800 hover:border-emerald-500/40 bg-slate-950/60 hover:bg-slate-800/80 text-[11px] text-slate-300 hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Form with Mic */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="space-y-3"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask any organic farming, bio-control, or soil question..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3 pl-4 pr-24 text-xs text-white outline-none focus:border-emerald-500"
                />

                <div className="absolute right-2 flex items-center gap-1.5">
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={startVoiceInput}
                      className={`p-2 rounded-xl transition-all ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400'
                      }`}
                      title={isListening ? 'Listening...' : 'Speak Question'}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !question.trim()}
                    className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Advisory Response Display */}
            {isLoading && (
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 flex items-center justify-center gap-3 text-xs text-emerald-400">
                <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                Consulting Organic Bio-Advisor...
              </div>
            )}

            {answer && !isLoading && (
              <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/80 p-5 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    Agronomist Guidance
                  </span>

                  <button
                    onClick={toggleSpeech}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      isSpeaking
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5" />
                        Stop Voice
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                        Listen Aloud
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {answer}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Handbook Tab */
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Direct access to proven on-farm biological formulations tested by certified regenerative farmers:
            </p>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {TRADITIONAL_RECIPES.map((recipe, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div>
                      <h4 className="font-bold text-white text-sm">{recipe.name}</h4>
                      <span className="text-[11px] text-emerald-400">{recipe.hindiName}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                      {recipe.category}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-400">Target Purpose:</strong> {recipe.target}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ingredients:</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-300">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-amber-300 uppercase">Preparation Steps:</span>
                    <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-300">
                      {recipe.steps.map((st, i) => (
                        <li key={i} className="leading-relaxed">{st}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="text-[11px] text-emerald-200/90 pt-1 font-mono">
                    Dosage: {recipe.dosage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
