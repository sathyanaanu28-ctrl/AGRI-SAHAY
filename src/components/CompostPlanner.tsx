import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CompostMaterial, CompostResult } from '../types/farming';
import {
  Flame,
  Plus,
  Trash2,
  Sparkles,
  Droplets,
  RotateCw,
  Clock,
  Layers,
  Thermometer,
  ShieldAlert,
} from 'lucide-react';

const COMMON_PRESETS: { name: string; category: 'Green' | 'Brown'; defaultKg: number; cn: number }[] = [
  // Greens
  { name: 'Cow Manure (Fresh)', category: 'Green', defaultKg: 30, cn: 15 },
  { name: 'Kitchen & Vegetable Scraps', category: 'Green', defaultKg: 20, cn: 15 },
  { name: 'Fresh Green Grass Clippings', category: 'Green', defaultKg: 25, cn: 20 },
  { name: 'Green Weed & Legume Biomass', category: 'Green', defaultKg: 15, cn: 18 },
  { name: 'Poultry Manure', category: 'Green', defaultKg: 10, cn: 10 },
  // Browns
  { name: 'Dry Leaves & Litter', category: 'Brown', defaultKg: 35, cn: 60 },
  { name: 'Paddy / Wheat Straw', category: 'Brown', defaultKg: 25, cn: 80 },
  { name: 'Dry Sorghum / Maize Stalks', category: 'Brown', defaultKg: 20, cn: 70 },
  { name: 'Shredded Cardboard & Paper', category: 'Brown', defaultKg: 10, cn: 200 },
  { name: 'Sawdust / Wood Shavings', category: 'Brown', defaultKg: 8, cn: 400 },
];

export const CompostPlanner: React.FC = () => {
  const { language, t } = useLanguage();

  const [materials, setMaterials] = useState<CompostMaterial[]>([
    { id: '1', name: 'Cow Manure (Fresh)', category: 'Green', quantityKg: 40, estimatedCN: 15 },
    { id: '2', name: 'Kitchen & Vegetable Scraps', category: 'Green', quantityKg: 20, estimatedCN: 15 },
    { id: '3', name: 'Dry Leaves & Litter', category: 'Brown', quantityKg: 50, estimatedCN: 60 },
    { id: '4', name: 'Paddy / Wheat Straw', category: 'Brown', quantityKg: 30, estimatedCN: 80 },
  ]);

  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<'Green' | 'Brown'>('Green');
  const [customKg, setCustomKg] = useState('10');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompostResult | null>(null);

  // Compute live mathematical approximation of C:N
  const totalKg = materials.reduce((acc, m) => acc + m.quantityKg, 0);
  const greenKg = materials.filter((m) => m.category === 'Green').reduce((acc, m) => acc + m.quantityKg, 0);
  const brownKg = materials.filter((m) => m.category === 'Brown').reduce((acc, m) => acc + m.quantityKg, 0);

  // Approximate carbon-to-nitrogen calculation
  const calculatedRatioNumber =
    totalKg > 0
      ? Math.round(
          materials.reduce((sum, m) => sum + m.estimatedCN * m.quantityKg, 0) / totalKg
        )
      : 30;

  const isOptimalRatio = calculatedRatioNumber >= 24 && calculatedRatioNumber <= 32;
  const isHighNitrogen = calculatedRatioNumber < 24;
  const isHighCarbon = calculatedRatioNumber > 32;

  const handleUpdateKg = (id: string, newKg: number) => {
    if (newKg < 0) return;
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, quantityKg: newKg } : m))
    );
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddPreset = (preset: typeof COMMON_PRESETS[0]) => {
    const existing = materials.find((m) => m.name === preset.name);
    if (existing) {
      handleUpdateKg(existing.id, existing.quantityKg + 10);
    } else {
      setMaterials((prev) => [
        ...prev,
        {
          id: 'mat_' + Date.now() + Math.random(),
          name: preset.name,
          category: preset.category,
          quantityKg: preset.defaultKg,
          estimatedCN: preset.cn,
        },
      ]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const kg = parseFloat(customKg) || 10;
    const estCN = customCategory === 'Green' ? 18 : 100;

    setMaterials((prev) => [
      ...prev,
      {
        id: 'mat_' + Date.now(),
        name: customName.trim(),
        category: customCategory,
        quantityKg: kg,
        estimatedCN: estCN,
      },
    ]);

    setCustomName('');
    setCustomKg('10');
  };

  const handleAnalyze = async () => {
    if (materials.length === 0) {
      setError('Please add at least one material.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-compost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials,
          totalKg,
          languageCode: language.code,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze compost');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred during compost calculation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/30 p-6 sm:p-8 backdrop-blur-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20 mb-3">
            <Flame className="h-3.5 w-3.5" />
            Aerobic Microbiology & Soil Humus
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('compostTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {t('compostSubtitle')}
          </p>
        </div>
      </div>

      {/* Real-Time Ratio Gauge Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Live Ratio */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t('cnRatio')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {calculatedRatioNumber}:1
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isOptimalRatio
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isHighNitrogen
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}
            >
              {isOptimalRatio
                ? 'Ideal Balanced (25-30:1)'
                : isHighNitrogen
                ? 'High Nitrogen'
                : 'Carbon Heavy'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isOptimalRatio
              ? 'Perfect microbial diet for rapid heat buildup (55-65°C) and weed seed destruction.'
              : isHighNitrogen
              ? 'Risk of ammonia smell and moisture saturation. Add dry leaves or straw.'
              : 'Decomposition will be slow. Add fresh cow manure, kitchen scraps, or green leaves.'}
          </p>
        </div>

        {/* Greens vs Browns Ratio */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Biomass Breakdown ({totalKg} kg total)
          </span>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400">Green (Nitrogen): {greenKg} kg</span>
              <span className="text-amber-400">Brown (Carbon): {brownKg} kg</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${totalKg > 0 ? (greenKg / totalKg) * 100 : 50}%` }}
              />
              <div
                className="bg-amber-500 transition-all duration-500"
                style={{ width: `${totalKg > 0 ? (brownKg / totalKg) * 100 : 50}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>Ideal by weight: ~30-40% Green</span>
            <span>~60-70% Brown</span>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-sky-300 flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold">
              <Droplets className="h-3.5 w-3.5 text-sky-400" /> Supplemental Water:
            </span>
            <span className="font-bold">
              ~{Math.max(5, Math.round(brownKg * 0.45 - greenKg * 0.05))} Litres
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              AI Compost Analysis
            </span>
            <p className="text-xs text-slate-300 mt-1">
              Generate precise microbial acceleration recipes, turning schedules, and moisture instructions.
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isLoading || materials.length === 0}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                {t('analyzingCompost')}
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                {t('calculateCompost')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Materials Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Pile Materials */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              Active Compost Pile Ingredients
            </h3>
            <span className="text-xs font-mono text-slate-400">{materials.length} items</span>
          </div>

          <div className="space-y-2.5">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      mat.category === 'Green' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{mat.name}</h4>
                    <span className="text-[10px] text-slate-400">
                      {mat.category} • Approx C:N {mat.estimatedCN}:1
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                    <input
                      type="number"
                      min="1"
                      value={mat.quantityKg}
                      onChange={(e) => handleUpdateKg(mat.id, parseFloat(e.target.value) || 0)}
                      className="w-14 bg-transparent text-right font-mono font-bold text-xs text-white outline-none"
                    />
                    <span className="text-[11px] text-slate-400">kg</span>
                  </div>

                  <button
                    onClick={() => handleRemoveMaterial(mat.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add custom ingredient inline */}
          <form onSubmit={handleAddCustom} className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Custom material (e.g. Mustard cake, neem leaves)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 min-w-[180px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as any)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="Green">Green (Nitrogen)</option>
              <option value="Brown">Brown (Carbon)</option>
            </select>
            <input
              type="number"
              min="1"
              value={customKg}
              onChange={(e) => setCustomKg(e.target.value)}
              className="w-16 rounded-xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-center text-white outline-none focus:border-emerald-500"
              placeholder="kg"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('addMaterial')}
            </button>
          </form>
        </div>

        {/* Quick Add Library */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <h3 className="font-bold text-white text-base">Farm Biomass Library</h3>
          <p className="text-xs text-slate-400">
            Click any raw ingredient below to add it directly to your compost batch:
          </p>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              {t('greensTitle')}
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {COMMON_PRESETS.filter((p) => p.category === 'Green').map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPreset(preset)}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-950/60 hover:bg-slate-900 text-left text-xs transition-colors group"
                >
                  <span className="font-semibold text-slate-200 group-hover:text-emerald-300">
                    + {preset.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {preset.defaultKg}kg
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              {t('brownsTitle')}
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {COMMON_PRESETS.filter((p) => p.category === 'Brown').map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPreset(preset)}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-800 hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-900 text-left text-xs transition-colors group"
                >
                  <span className="font-semibold text-slate-200 group-hover:text-amber-300">
                    + {preset.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {preset.defaultKg}kg
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* AI Compost Optimization Result */}
      {result && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
          {/* Top Result Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                Compost Chemistry & Maturation Forecast
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                {result.qualityGrade}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">
                  {t('readyTime')}
                </span>
                <span className="text-base font-black text-emerald-400 flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  {t('readyWeeks', { weeks: result.estimatedReadyWeeks })}
                </span>
              </div>
            </div>
          </div>

          {/* Moisture & Turning Roadmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-sky-500/20 bg-sky-950/20 p-4 space-y-2">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="h-4 w-4" />
                Moisture & Water Advice
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {result.moistureAdvice}
              </p>
            </div>

            {result.aerationSchedule && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCw className="h-4 w-4" />
                  Pile Turning & Aeration Schedule
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {result.aerationSchedule}
                </p>
              </div>
            )}
          </div>

          {/* Microbial Accelerators */}
          {result.acceleratorTips && result.acceleratorTips.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="h-4 w-4 text-amber-400" />
                {t('accelerators')}
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                {result.acceleratorTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-amber-500/10">
                    <span className="text-amber-400 font-bold">⚡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step-by-Step Recommendations */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Optimal Composting Protocol
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                    {i + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Biological Temperature Curve Visualizer */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-emerald-400" />
              Thermal Decomposition Phase Stages
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                <span className="text-[10px] font-bold text-sky-400 uppercase">Phase 1: Initial</span>
                <div className="text-xs font-black text-white">Days 1 - 3 (20-40°C)</div>
                <p className="text-[11px] text-slate-400">Rapid multiplication of mesophilic bacteria consuming soluble sugars.</p>
              </div>
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Phase 2: Hot Peak</span>
                <div className="text-xs font-black text-amber-300">Days 4 - 15 (55-65°C)</div>
                <p className="text-[11px] text-slate-300">Thermophilic sanitization: weed seeds and pathogens eradicated.</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                <span className="text-[10px] font-bold text-teal-400 uppercase">Phase 3: Cooling</span>
                <div className="text-xs font-black text-white">Days 16 - 40 (40-45°C)</div>
                <p className="text-[11px] text-slate-400">Actinomycetes and beneficial fungi colonize to digest cellulose & lignin.</p>
              </div>
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Phase 4: Curing</span>
                <div className="text-xs font-black text-emerald-300">Days 40 - 60+ (Ambient)</div>
                <p className="text-[11px] text-slate-300">Earthworms return; stabilizes into sweet-smelling, rich bio-humus.</p>
              </div>
            </div>
          </div>

          {/* Warning Flags if any */}
          {result.warningFlags && result.warningFlags.length > 0 && (
            <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 space-y-2">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                Attention & Hazard Flags
              </h4>
              <ul className="text-xs text-red-200/90 list-disc list-inside space-y-1">
                {result.warningFlags.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
