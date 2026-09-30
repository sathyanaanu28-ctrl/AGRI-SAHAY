import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CropRotationResult } from '../types/farming';
import {
  RotateCcw,
  Sparkles,
  Leaf,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
} from 'lucide-react';

const COMMON_ROTATION_PRESETS = [
  {
    title: 'Post-Paddy (Rice) Recovery',
    currentCrop: 'Paddy / Rice (Oryza sativa)',
    soilCondition: 'Waterlogged aftermath, low residual nitrogen, hardpan layer',
    season: 'Rabi (Winter)',
  },
  {
    title: 'Cotton Pest & Wilt Breaker',
    currentCrop: 'Bt / Desi Cotton (Gossypium)',
    soilCondition: 'Deep nutrient exhaustion, bollworm & wilt risk',
    season: 'Kharif (Monsoon)',
  },
  {
    title: 'Tomato / Solanaceae Reset',
    currentCrop: 'Tomato / Brinjal / Chilli (Solanaceae)',
    soilCondition: 'Root-knot nematode build-up, bacterial wilt susceptibility',
    season: 'Zaid / Summer',
  },
  {
    title: 'Sugarcane Soil Restoration',
    currentCrop: 'Sugarcane (Saccharum)',
    soilCondition: 'Severe micronutrient depletion, heavy compaction',
    season: 'Year-Round',
  },
];

export const CropRotationPlanner: React.FC = () => {
  const { language, t } = useLanguage();

  const [currentCrop, setCurrentCrop] = useState<string>('Tomato / Solanaceae (Solanum lycopersicum)');
  const [soilCondition, setSoilCondition] = useState<string>(
    'Root-knot nematode build-up, bacterial wilt susceptibility'
  );
  const [season, setSeason] = useState<string>('Upcoming Rabi (Winter)');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CropRotationResult | null>(null);

  const handleApplyPreset = (preset: typeof COMMON_ROTATION_PRESETS[0]) => {
    setCurrentCrop(preset.currentCrop);
    setSoilCondition(preset.soilCondition);
    setSeason(preset.season);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plan-rotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCrop,
          soilCondition,
          season,
          languageCode: language.code,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate crop rotation strategy');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Crop rotation planning failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/30 p-6 sm:p-8 backdrop-blur-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-3">
            <RotateCcw className="h-3.5 w-3.5" />
            Bio-Diverse Succession Planning
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('rotationTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {t('rotationSubtitle')}
          </p>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Common Rotation Challenges:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {COMMON_ROTATION_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="p-3 text-left rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-900/50 hover:bg-slate-900 text-xs transition-all active:scale-95 group"
            >
              <span className="font-bold text-white group-hover:text-emerald-300 block mb-1">
                {preset.title}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                {preset.currentCrop}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Inputs */}
      <form onSubmit={handleGenerate} className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Current Crop */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {t('currentCropLabel')}
            </label>
            <input
              type="text"
              value={currentCrop}
              onChange={(e) => setCurrentCrop(e.target.value)}
              placeholder="e.g. Paddy / Rice, Tomato, Cotton"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Soil Condition */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {t('soilConditionLabel')}
            </label>
            <input
              type="text"
              value={soilCondition}
              onChange={(e) => setSoilCondition(e.target.value)}
              placeholder="e.g. Nitrogen depleted, high nematode pressure"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Target Season */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {t('targetSeasonLabel')}
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="Upcoming Rabi (Winter: Oct - Mar)">Upcoming Rabi (Winter: Oct - Mar)</option>
              <option value="Upcoming Kharif (Monsoon: Jun - Oct)">Upcoming Kharif (Monsoon: Jun - Oct)</option>
              <option value="Upcoming Zaid (Summer: Mar - Jun)">Upcoming Zaid (Summer: Mar - Jun)</option>
              <option value="Immediate Short Cover Crop (45-60 Days)">Short Green Manure Cover Crop (45-60 Days)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                {t('generatingRotation')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t('generateRotation')}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Strategy */}
      {result && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-8 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="border-b border-slate-800 pb-5">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              Ecological Succession Formulated
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Rotation Plan for: {result.currentCrop}
            </h3>
          </div>

          {/* 3 Sequential Crop Recommendations */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-400" />
              {t('nextCrops')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {result.nextCropRecommendations.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3 hover:border-emerald-500/40 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h5 className="font-extrabold text-white text-base">
                        {item.crop}
                      </h5>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                        {idx + 1}
                      </span>
                    </div>

                    {item.botanicalFamily && (
                      <span className="inline-block text-[10px] font-mono text-emerald-400/90 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {item.botanicalFamily}
                      </span>
                    )}

                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-bold text-slate-300 uppercase block">
                        Ecological Benefit:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.benefit}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-1">
                    <span className="text-[11px] font-bold text-sky-400 uppercase block">
                      Soil Impact:
                    </span>
                    <p className="text-xs text-slate-400">
                      {item.soilImpact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Season Rotation Calendar Visualizer if available */}
          {result.rotationCycleSeasons && result.rotationCycleSeasons.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-emerald-400" />
                3-Season Succession Timeline
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {result.rotationCycleSeasons.map((seasonItem, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 relative space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400">{seasonItem.seasonName}</span>
                      {i < result.rotationCycleSeasons!.length - 1 && (
                        <ArrowRight className="hidden sm:block h-3.5 w-3.5 text-slate-600 absolute -right-2 top-1/2 -translate-y-1/2 z-10" />
                      )}
                    </div>
                    <div className="font-extrabold text-white text-sm">{seasonItem.cropName}</div>
                    <div className="text-[11px] text-slate-400">{seasonItem.purpose}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intercropping & Soil Restoration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intercropping */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 space-y-3">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                {t('intercropping')}
              </h4>
              <p className="text-[11px] text-emerald-200/70">
                Companion planting combinations that repel pests, provide shade, or fix nitrogen simultaneously.
              </p>
              <ul className="space-y-2 text-xs text-slate-200">
                {result.intercroppingOptions.map((opt, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-emerald-500/10">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Soil Health Restoration Strategy */}
            <div className="rounded-2xl border border-teal-500/20 bg-teal-950/20 p-5 space-y-3">
              <h4 className="text-sm font-bold text-teal-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                {t('soilRestoration')}
              </h4>
              <p className="text-[11px] text-teal-200/70">
                Regenerating beneficial mycorrhizal fungi, earthworms, and humic matter.
              </p>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-teal-500/10 text-xs text-slate-200 leading-relaxed">
                {result.soilHealthStrategy}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
