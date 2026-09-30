import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FarmingInput, ReportData } from '../types/farming';
import {
  Sprout,
  Compass,
  TrendingUp,
  AlertTriangle,
  Droplets,
  Calendar,
  CheckCircle,
  Sparkles,
  Printer,
  RotateCcw,
  IndianRupee,
  Layers,
  Award,
} from 'lucide-react';

export const EcoPlanGenerator: React.FC = () => {
  const { language, t } = useLanguage();

  const [input, setInput] = useState<FarmingInput>({
    location: 'Maharashtra / Deccan Plateau',
    soilType: 'Black Cotton Soil (Regur)',
    season: 'Kharif (Monsoon)',
    budget: 'Moderate (₹30,000 - ₹50,000 / acre)',
    farmSize: '3 Acres',
  });

  const [irrigation, setIrrigation] = useState<string>('Drip Irrigation with Borewell');
  const [farmingGoal, setFarmingGoal] = useState<string>('Maximize Organic Yield & Soil Rejuvenation');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);

  // Load saved report if available
  useEffect(() => {
    const saved = localStorage.getItem('agrisahay_last_ecoplan');
    if (saved) {
      try {
        setReport(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleApplyPreset = (preset: {
    location: string;
    soilType: string;
    season: string;
    budget: string;
    farmSize: string;
    irrigation: string;
    goal: string;
  }) => {
    setInput({
      location: preset.location,
      soilType: preset.soilType,
      season: preset.season,
      budget: preset.budget,
      farmSize: preset.farmSize,
    });
    setIrrigation(preset.irrigation);
    setFarmingGoal(preset.goal);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-eco-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...input,
          irrigation,
          farmingGoal,
          languageCode: language.code,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error generating eco plan');
      }

      const data = await response.json();
      setReport(data);
      localStorage.setItem('agrisahay_last_ecoplan', JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || 'Failed to generate eco-plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/95 to-teal-950/40 p-6 sm:p-8 backdrop-blur-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-3">
            <Compass className="h-3.5 w-3.5" />
            Bio-Agronomy Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('ecoPlanTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {t('ecoPlanSubtitle')}
          </p>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Quick Regional Presets:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              title: 'Deccan Cotton & Pulses',
              location: 'Vidarbha / Marathwada',
              soilType: 'Deep Black Cotton Soil',
              season: 'Kharif',
              budget: 'Moderate (₹35k/acre)',
              farmSize: '4 Acres',
              irrigation: 'Drip Irrigation',
              goal: 'Organic Cotton + Pigeon Pea Intercrop',
            },
            {
              title: 'Punjab Wheat & Mustard',
              location: 'Punjab / Indo-Gangetic Plains',
              soilType: 'Rich Alluvial Loam',
              season: 'Rabi (Winter)',
              budget: 'Standard (₹45k/acre)',
              farmSize: '5 Acres',
              irrigation: 'Canal + Tubewell',
              goal: 'Residue-free Wheat & Bio-Mustard',
            },
            {
              title: 'South Spices & Horticulture',
              location: 'Western Ghats / Tamil Nadu',
              soilType: 'Red Laterite Loam',
              season: 'Year-Round / Perennial',
              budget: 'High Value (₹60k/acre)',
              farmSize: '2 Acres',
              irrigation: 'Micro-sprinklers',
              goal: 'Export-grade Turmeric & Ginger',
            },
            {
              title: 'Dryland Resilient Millets',
              location: 'Rajasthan / North Karnataka',
              soilType: 'Sandy Loam with low moisture',
              season: 'Kharif / Monsoon',
              budget: 'Low Input (₹20k/acre)',
              farmSize: '6 Acres',
              irrigation: 'Rainfed with farm pond',
              goal: 'Drought-tolerant Pearl Millet & Ragi',
            },
          ].map((preset, idx) => (
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
                {preset.location} • {preset.soilType}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Parameters Form */}
      <form onSubmit={handleGenerate} className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {t('locationLabel')}
            </label>
            <input
              type="text"
              value={input.location}
              onChange={(e) => setInput({ ...input, location: e.target.value })}
              placeholder="e.g. Pune, Maharashtra or Punjab"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          {/* Soil Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {t('soilTypeLabel')}
            </label>
            <select
              value={input.soilType}
              onChange={(e) => setInput({ ...input, soilType: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Black Cotton Soil (Regur)">Black Cotton Soil (Heavy clay, high moisture retention)</option>
              <option value="Alluvial Soil (Gangetic/Plains)">Alluvial Soil (Highly fertile, riverine loam)</option>
              <option value="Red Sandy Loam">Red Sandy Loam (Good drainage, low nitrogen)</option>
              <option value="Clayey Loam">Clayey Loam (Nutrient rich, medium aeration)</option>
              <option value="Laterite Soil (Coastal/Highland)">Laterite Soil (Acidic, iron-rich)</option>
              <option value="Saline or Alkaline Soil">Saline / Sodic Soil (Gypsum/green manure required)</option>
            </select>
          </div>

          {/* Season */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {t('seasonLabel')}
            </label>
            <select
              value={input.season}
              onChange={(e) => setInput({ ...input, season: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Kharif (Monsoon - June to Oct)">Kharif (Monsoon: June to October)</option>
              <option value="Rabi (Winter - Oct to March)">Rabi (Winter: October to March)</option>
              <option value="Zaid (Summer - March to June)">Zaid (Summer: March to June)</option>
              <option value="Perennial / Multi-Season">Perennial / Continuous Multi-Season</option>
            </select>
          </div>

          {/* Farm Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {t('farmSizeLabel')}
            </label>
            <input
              type="text"
              value={input.farmSize}
              onChange={(e) => setInput({ ...input, farmSize: e.target.value })}
              placeholder="e.g. 2.5 Acres, 1 Hectare"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          {/* Budget Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {t('budgetLabel')}
            </label>
            <select
              value={input.budget}
              onChange={(e) => setInput({ ...input, budget: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Low Budget (Natural zero-cost on-farm inputs)">Low Budget (On-farm cow dung/urine formulations)</option>
              <option value="Moderate (₹25,000 - ₹50,000 / acre)">Moderate (Certified organic seeds + bio-fertilizers)</option>
              <option value="High (Commercial Organic Farm ₹60,000+ / acre)">Commercial Organic (Automated drip, bio-fungicides)</option>
            </select>
          </div>

          {/* Irrigation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {t('irrigationLabel')}
            </label>
            <select
              value={irrigation}
              onChange={(e) => setIrrigation(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Drip Irrigation">Drip Irrigation (High water efficiency)</option>
              <option value="Flood / Furrow Canal">Flood / Furrow Canal Irrigation</option>
              <option value="Rainfed (Monsoon Dependent)">Rainfed (Dryland / Monsoon dependent)</option>
              <option value="Sprinklers & Rain Guns">Sprinklers / Rain Guns</option>
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
                {t('generatingPlan')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t('generatePlan')}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Report View */}
      {report && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-8 shadow-2xl backdrop-blur-md">
          {/* Executive Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <CheckCircle className="h-4 w-4" />
                Tailored Regenerative Plan
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Eco-Plan for {input.location}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {input.soilType} • {input.season} • {input.farmSize}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sustainability Score Meter */}
              <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    {t('sustainabilityScore')}
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    {report.sustainabilityScore} / 100
                  </span>
                </div>
              </div>

              <button
                onClick={handlePrint}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                title="Print or Save PDF"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/20 p-5 text-sm text-emerald-100 leading-relaxed">
            <span className="font-bold block text-emerald-300 text-xs uppercase tracking-wider mb-1">
              Agronomic Overview
            </span>
            {report.summary}
          </div>

          {/* Recommended Crops Cards */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Sprout className="h-5 w-5 text-emerald-400" />
              {t('recommendedCropsTitle')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {report.recommendedCrops.map((crop, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h5 className="font-extrabold text-white text-base">
                        {crop.cropName}
                      </h5>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {crop.suitabilityScore}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {crop.reasoning}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{t('expectedYield')}:</span>
                      <span className="font-bold text-slate-200">{crop.expectedYield}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{t('estProfit')}:</span>
                      <span className="font-bold text-emerald-400">{crop.estimatedProfit}</span>
                    </div>
                    {crop.durationDays && (
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Cycle Duration:</span>
                        <span>{crop.durationDays}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Phase Chronological Growth Timeline */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-400" />
              {t('growthTimeline')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.ecoPlanSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                        {idx + 1}
                      </span>
                      <h5 className="font-bold text-white text-sm">{step.phase}</h5>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md">
                      {step.timeline}
                    </span>
                  </div>

                  {/* Organic Inputs */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      {t('organicInputs')}
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {step.organicInputs.map((inputItem, i) => (
                        <li key={i}>{inputItem}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Water Strategy */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      {t('waterStrategy')}
                    </span>
                    <p className="text-xs text-slate-300">{step.waterStrategy}</p>
                  </div>

                  {/* Key Practices */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      {t('keyPractices')}
                    </span>
                    <ul className="text-xs text-slate-400 space-y-1">
                      {step.keyPractices.map((practice, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">✓</span>
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Analysis & Market Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Mitigation */}
            <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-5 space-y-3">
              <h5 className="font-bold text-white text-sm flex items-center gap-2 text-red-300">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                {t('riskTitle')}
              </h5>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-300 uppercase">Pest Pressures:</span>
                  <ul className="list-disc list-inside text-slate-400 mt-1 space-y-0.5">
                    {report.riskAnalysis.pestRisks.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-300 uppercase">Climate Factors:</span>
                  <ul className="list-disc list-inside text-slate-400 mt-1 space-y-0.5">
                    {report.riskAnalysis.climateRisks.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase">Mitigation Tips:</span>
                  <ul className="list-disc list-inside text-emerald-200/90 mt-1 space-y-0.5">
                    {report.riskAnalysis.mitigationTips.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Mandi & Market Insights */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-white text-sm flex items-center gap-2 text-emerald-300">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  {t('marketTitle')}
                </h5>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    report.marketInsights.priceTrend === 'Upward'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : report.marketInsights.priceTrend === 'Stable'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {report.marketInsights.priceTrend} Trend
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-300 uppercase">Demand Outlook:</span>
                  <p className="text-slate-300 mt-0.5">{report.marketInsights.currentDemand}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-300 uppercase">
                    Recommended Buyer Channels:
                  </span>
                  <ul className="list-disc list-inside text-slate-400 mt-1 space-y-0.5">
                    {report.marketInsights.recommendedBuyerChannels.map((ch, i) => (
                      <li key={i}>{ch}</li>
                    ))}
                  </ul>
                </div>

                {report.marketInsights.peakSellingPeriod && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-amber-300 uppercase">Peak Sales Window:</span>
                    <p className="text-slate-300 mt-0.5">{report.marketInsights.peakSellingPeriod}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
