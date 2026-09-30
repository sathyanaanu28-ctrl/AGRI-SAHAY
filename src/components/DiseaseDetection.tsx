import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DiseaseDetectionRecord } from '../types/farming';
import { SAMPLE_IMAGES, SampleImage } from '../utils/sampleImages';
import {
  UploadCloud,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Bug,
  Leaf,
  Calendar,
  Layers,
  ChevronRight,
  Trash2,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface DiseaseDetectionProps {
  userId: string;
}

export const DiseaseDetection: React.FC<DiseaseDetectionProps> = ({ userId }) => {
  const { language, t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<DiseaseDetectionRecord | null>(null);
  const [history, setHistory] = useState<DiseaseDetectionRecord[]>([]);

  // Camera capture states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio speech synthesis
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`agrisahay_disease_history_${userId}`);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, [userId]);

  // Clean up camera stream and speech on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const saveRecord = (record: DiseaseDetectionRecord) => {
    const updated = [record, ...history.filter((h) => h.id !== record.id)];
    setHistory(updated);
    localStorage.setItem(`agrisahay_disease_history_${userId}`, JSON.stringify(updated));
  };

  const deleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(`agrisahay_disease_history_${userId}`, JSON.stringify(updated));
    if (currentResult?.id === id) {
      setCurrentResult(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, WEBP).');
        return;
      }
      setError(null);
      setSelectedFile(file);
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to convert any SVG vector to crisp PNG raster data URL for Gemini Vision compatibility
  const rasterizeSvgToPng = (svgDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 400;
          canvas.height = img.naturalHeight || 400;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const png = canvas.toDataURL('image/png');
            resolve(png);
            return;
          }
        } catch (e) {
          console.warn('Canvas rasterization notice:', e);
        }
        resolve(svgDataUrl);
      };
      img.onerror = () => {
        resolve(svgDataUrl);
      };
      img.src = svgDataUrl;
    });
  };

  const handleSelectSample = async (sample: SampleImage) => {
    stopCamera();
    setSelectedFile(null);
    setImagePreview(sample.dataUrl);
    setMimeType('image/png');
    setError(null);

    // Rasterize immediately so imagePreview is a standard PNG base64
    try {
      const pngUrl = await rasterizeSvgToPng(sample.dataUrl);
      setImagePreview(pngUrl);
    } catch {
      // keep fallback
    }
  };

  // Camera integration
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setError('Unable to access camera. Please check camera permissions in your browser.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImagePreview(dataUrl);
      setMimeType('image/jpeg');
      setSelectedFile(null);
      stopCamera();
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setIsLoading(true);
    setError(null);
    stopAudio();

    try {
      let activeImage = imagePreview;
      let activeMime = mimeType || 'image/jpeg';

      // Ensure any SVG is rasterized to PNG
      if (activeImage.includes('image/svg') || activeImage.includes('<svg') || activeMime.includes('svg')) {
        activeImage = await rasterizeSvgToPng(activeImage);
        activeMime = 'image/png';
        setImagePreview(activeImage);
      }

      // Extract base64 representation
      let base64Data = activeImage.includes(',')
        ? activeImage.split(',')[1]
        : activeImage;

      // Handle any accidental URI encoded data
      if (base64Data.startsWith('%')) {
        try {
          const decoded = decodeURIComponent(base64Data);
          base64Data = btoa(unescape(encodeURIComponent(decoded)));
        } catch {
          // ignore
        }
      }

      const response = await fetch('/api/diagnose-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: activeMime,
          languageCode: language.code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Diagnostic server error');
      }

      const result = await response.json();

      const newRecord: DiseaseDetectionRecord = {
        ...result,
        id: 'diag_' + Date.now(),
        userId,
        imageUrl: imagePreview,
        createdAt: new Date().toISOString(),
      };

      setCurrentResult(newRecord);
      saveRecord(newRecord);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during diagnosis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    stopCamera();
    stopAudio();
    setSelectedFile(null);
    setImagePreview(null);
    setCurrentResult(null);
    setError(null);
  };

  // Text to Speech
  const toggleSpeech = () => {
    if (!currentResult) return;
    if (isSpeaking) {
      stopAudio();
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    const remediesText = currentResult.organicRemedies?.join('. ') || '';
    const preventativeText = currentResult.preventativeMeasures?.join('. ') || '';
    const fullText = `${currentResult.diseaseName}. ${currentResult.severity} severity. Remedies: ${remediesText}. Prevention: ${preventativeText}`;

    const utterance = new SpeechSynthesisUtterance(fullText);

    // Try to match language code
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
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 sm:p-8 backdrop-blur-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            AI Pathology & Organic Prescription
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('diseaseDetection')}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Upload an image of an infected leaf, stem, or fruit to receive instant pathogen identification, severity scoring, and 100% organic, locally prepared bio-remedies.
          </p>
        </div>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Analysis Area */}
      {!currentResult ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          {/* Camera View */}
          {isCameraActive ? (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/50 bg-black aspect-[4/3]">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-dashed border-emerald-400/40 m-8 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="bg-slate-950/70 text-emerald-300 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    Center leaf within frame
                  </span>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={captureCameraPhoto}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Camera className="h-4 w-4" />
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : !imagePreview ? (
            /* Upload & Sample selector */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Dropzone */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-slate-900/60 rounded-2xl p-8 cursor-pointer transition-all group">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-3">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {t('uploadPrompt')}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">{t('supportsFormats')}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>

                {/* Direct Camera Capture */}
                <div
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center border border-slate-800 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-slate-900/60 rounded-2xl p-8 cursor-pointer transition-all group"
                >
                  <div className="h-14 w-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform mb-3">
                    <Camera className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                    Use Field Camera
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Snap a leaf photo directly in real-time
                  </span>
                </div>
              </div>

              {/* Sample Presets */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t('useSample')}
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="group flex flex-col items-start p-3 rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-950/60 text-left transition-all hover:bg-slate-900/80 active:scale-95"
                    >
                      <img
                        src={sample.dataUrl}
                        alt={sample.name}
                        className="w-full h-24 object-cover rounded-lg border border-slate-800 mb-2 group-hover:border-emerald-500/40 transition-colors"
                      />
                      <span className="text-xs font-bold text-white line-clamp-1">{sample.name}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{sample.crop}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Image Preview & Submit */
            <div className="max-w-md mx-auto space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
                <img
                  src={imagePreview}
                  alt="Crop preview"
                  className="w-full h-72 object-cover"
                />
                {!isLoading && (
                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 text-xs font-semibold rounded-xl backdrop-blur-md border border-slate-700 transition-colors"
                  >
                    {t('changeImage')}
                  </button>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      {t('diagnosing')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t('runDiagnosis')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Diagnosis Request Failed</span>
                <span className="text-xs text-red-400/90">{error}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Diagnosis Results View */
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm">
          {/* Top Header Card */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative shrink-0 w-full lg:w-64 h-64 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group">
              <img
                src={currentResult.imageUrl}
                alt={currentResult.diseaseName}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-700 transition-colors"
                title={isZoomed ? 'Zoom out' : 'Magnify leaf pathology'}
              >
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </button>
              <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-700">
                {new Date(currentResult.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    {currentResult.type}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {currentResult.diseaseName}
                  </h3>
                  {currentResult.scientificName && (
                    <p className="text-xs italic text-slate-400 mt-0.5">
                      {currentResult.scientificName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Severity Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      currentResult.severity === 'High'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : currentResult.severity === 'Medium'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {currentResult.severity} {t('severity')}
                  </span>

                  {/* Print Prescription Slip */}
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Print Diagnostic Prescription Slip"
                  >
                    <Printer className="h-4 w-4" />
                  </button>

                  {/* Audio Listen Button */}
                  <button
                    onClick={toggleSpeech}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                      isSpeaking
                        ? 'bg-teal-500 text-slate-950 border-teal-400 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title="Listen to diagnosis aloud"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5" />
                        {t('stopAudio')}
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5 text-teal-400" />
                        {t('listenAudio')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Confidence & Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    {t('confidence')}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.max(10, currentResult.confidenceScore))}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      {currentResult.confidenceScore}%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    {t('category')}
                  </span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">
                    {currentResult.type}
                  </span>
                </div>

                {currentResult.pathogenType && (
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Pathogen
                    </span>
                    <span className="text-xs font-bold text-amber-300 mt-1 block truncate">
                      {currentResult.pathogenType}
                    </span>
                  </div>
                )}
              </div>

              {/* Observed Symptoms */}
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                  {t('symptoms')}
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {currentResult.symptoms.map((symptom, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Actionable Treatments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organic Remedies */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <h4 className="text-sm font-bold tracking-tight">
                  {t('organicRemedies')}
                </h4>
              </div>
              <p className="text-[11px] text-emerald-200/70">
                Zero chemical toxicity remedies using farm-derived biological inoculants.
              </p>
              <ul className="space-y-2 text-xs text-slate-200">
                {currentResult.organicRemedies.map((remedy, i) => (
                  <li key={i} className="flex items-start gap-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-emerald-500/10">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cultural & Preventative Measures */}
            <div className="bg-sky-950/20 border border-sky-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sky-400">
                <ShieldCheckIcon className="h-5 w-5" />
                <h4 className="text-sm font-bold tracking-tight">
                  {t('preventativeMeasures')}
                </h4>
              </div>
              <p className="text-[11px] text-sky-200/70">
                Agronomic field management to eliminate recurrence and protect neighbouring rows.
              </p>
              <ul className="space-y-2 text-xs text-slate-200">
                {currentResult.preventativeMeasures.map((measure, i) => (
                  <li key={i} className="flex items-start gap-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-sky-500/10">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-300">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{measure}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Spray Schedule if available */}
          {currentResult.spraySchedule && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200">
              <Calendar className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-300">{t('spraySchedule')}</span>
                <span>{currentResult.spraySchedule}</span>
              </div>
            </div>
          )}

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Diagnosis saved to your Farm Records.
            </span>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold transition-all flex items-center gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t('scanAnother')}
            </button>
          </div>
        </div>
      )}

      {/* History Log */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">{t('historyTitle')}</h3>
            <span className="text-xs text-slate-500 font-mono">({history.length})</span>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center border border-slate-800 rounded-2xl bg-slate-900/20 text-slate-500 text-sm">
            {t('noHistory')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((record) => (
              <div
                key={record.id}
                onClick={() => {
                  stopAudio();
                  setCurrentResult(record);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group relative cursor-pointer border rounded-2xl p-4 space-y-3 transition-all ${
                  currentResult?.id === record.id
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-slate-800 hover:border-emerald-500/40 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <div className="relative overflow-hidden rounded-xl border border-slate-800 aspect-video bg-slate-950">
                  <img
                    src={record.imageUrl}
                    alt={record.diseaseName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-emerald-400 backdrop-blur-sm border border-slate-700">
                    {record.confidenceScore}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm truncate group-hover:text-emerald-300 transition-colors">
                      {record.diseaseName}
                    </h4>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                    <span
                      className={`font-semibold ${
                        record.severity === 'High'
                          ? 'text-red-400'
                          : record.severity === 'Medium'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {record.severity}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    View Plan <ChevronRight className="h-3 w-3" />
                  </span>
                  <button
                    onClick={(e) => deleteRecord(record.id, e)}
                    className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete diagnosis"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper SVG icon for clean display
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}
