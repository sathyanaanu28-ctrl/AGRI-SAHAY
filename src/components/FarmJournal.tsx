import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { JournalEntry } from '../types/farming';
import { saveJournalEntryToFirestore, getJournalEntriesFromFirestore } from '../utils/firebase';
import { createCalendarEvent } from '../services/calendarService';
import { createTask } from '../services/tasksService';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  CheckCircle2,
  Sprout,
  Droplets,
  Bug,
  Sparkles,
  Scissors,
  FileSpreadsheet,
  CalendarPlus,
  Check,
} from 'lucide-react';

const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 1,
    date: '2026-09-28',
    plotName: 'Plot A (South Ridge)',
    activity: 'Soil inoculation with Jeevamrutha prior to sowing',
    category: 'Bio-fertilizer',
    inputsUsed: 'Fresh Jeevamrutha (Aerated with jaggery + besan)',
    quantityApplied: '200 Litres / acre via venturi drip',
    weatherNotes: 'Clear sky, 28°C, soil well-aerated',
    notes: 'Soil microbial activity visibly high; earthworm casts noted near drippers.',
  },
  {
    id: 2,
    date: '2026-09-25',
    plotName: 'Plot B (Orchard & Intercrop)',
    activity: 'Preventative bio-spray against early sucking pests',
    category: 'Pest Management',
    inputsUsed: 'Neem Seed Kernel Extract (NSKE 5%) + Cow urine',
    quantityApplied: '15 Litres solution per knapsack sprayer',
    weatherNotes: 'Overcast, high humidity 75%',
    notes: 'Sprayed early morning at dawn to protect beneficial pollinators and honeybees.',
  },
  {
    id: 3,
    date: '2026-09-20',
    plotName: 'Plot C (Vegetable Bed)',
    activity: 'First picking of certified organic cherry tomatoes',
    category: 'Harvesting',
    inputsUsed: 'Clean sanitized harvesting crates',
    quantityApplied: 'N/A',
    harvestYield: '145 kg premium grade',
    weatherNotes: 'Pleasant morning, 24°C',
    notes: 'Sent directly to local organic farmers cooperative mandi at ₹45/kg premium rate.',
  },
  {
    id: 4,
    date: '2026-09-15',
    plotName: 'Plot A (South Ridge)',
    activity: 'Mulching with dried paddy straw and legume residues',
    category: 'Weeding',
    inputsUsed: 'Dry paddy straw mulch (4-inch thickness)',
    quantityApplied: '1.2 tonnes mulch',
    weatherNotes: 'Sunny, 31°C',
    notes: 'Suppresses weed emergence and cuts soil water evaporation by ~45%.',
  },
];

export const FarmJournal: React.FC<{ userId: string }> = ({ userId }) => {
  const { language, t } = useLanguage();
  const { hasGoogleWorkspaceToken } = useAuth();
  const [syncedIds, setSyncedIds] = useState<Record<number, boolean>>({});

  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(`agrisahay_journal_${userId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_JOURNAL_ENTRIES;
  });

  // Sync with Firestore
  useEffect(() => {
    getJournalEntriesFromFirestore(userId).then((cloudEntries) => {
      if (cloudEntries && cloudEntries.length > 0) {
        setEntries((prev) => {
          const map = new Map<number, JournalEntry>();
          prev.forEach((e) => map.set(e.id, e));
          cloudEntries.forEach((ce: any) => map.set(ce.id, ce));
          return Array.from(map.values()).sort((a, b) => b.id - a.id);
        });
      }
    });
  }, [userId]);

  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Form State
  const [formData, setFormData] = useState<Omit<JournalEntry, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    plotName: 'Plot A',
    activity: '',
    category: 'Bio-fertilizer',
    inputsUsed: '',
    quantityApplied: '',
    harvestYield: '',
    weatherNotes: 'Sunny, mild breeze',
    notes: '',
  });

  useEffect(() => {
    localStorage.setItem(`agrisahay_journal_${userId}`, JSON.stringify(entries));
  }, [entries, userId]);

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activity.trim()) return;

    const newEntry: JournalEntry = {
      ...formData,
      id: Date.now(),
    };

    setEntries([newEntry, ...entries]);
    saveJournalEntryToFirestore({ ...newEntry, userId }).catch(() => {});
    setIsAdding(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      plotName: 'Plot A',
      activity: '',
      category: 'Bio-fertilizer',
      inputsUsed: '',
      quantityApplied: '',
      harvestYield: '',
      weatherNotes: 'Sunny, mild breeze',
      notes: '',
    });
  };

  const handleSyncToCalendar = async (entry: JournalEntry) => {
    try {
      await createCalendarEvent({
        summary: `🌾 Farm Operation: ${entry.activity}`,
        description: `Plot: ${entry.plotName}\nCategory: ${entry.category}\nInputs: ${entry.inputsUsed}\nNotes: ${entry.notes || 'Logged via AgriSahay Journal'}`,
        startDate: entry.date,
        location: entry.plotName,
        isAllDay: true,
      });
      setSyncedIds((prev) => ({ ...prev, [entry.id]: true }));
      setTimeout(() => {
        setSyncedIds((prev) => ({ ...prev, [entry.id]: false }));
      }, 3000);
    } catch (err: any) {
      alert(
        err.message === 'NOT_AUTHENTICATED'
          ? 'Please connect your Google Workspace account under the "Schedule & Tasks" tab.'
          : 'Failed to add to calendar: ' + err.message
      );
    }
  };

  const handleDeleteEntry = (id: number) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Plot', 'Category', 'Activity', 'Inputs', 'Quantity', 'Harvest', 'Weather', 'Notes'];
    const rows = entries.map((e) => [
      e.id,
      `"${e.date}"`,
      `"${e.plotName}"`,
      `"${e.category}"`,
      `"${e.activity.replace(/"/g, '""')}"`,
      `"${(e.inputsUsed || '').replace(/"/g, '""')}"`,
      `"${(e.quantityApplied || '').replace(/"/g, '""')}"`,
      `"${(e.harvestYield || '').replace(/"/g, '""')}"`,
      `"${(e.weatherNotes || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AgriSahay_Farm_Journal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.plotName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.inputsUsed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || entry.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate summaries
  const totalEntries = entries.length;
  const totalHarvests = entries.filter((e) => e.category === 'Harvesting').length;
  const bioDoses = entries.filter((e) => e.category === 'Bio-fertilizer' || e.category === 'Pest Management').length;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/95 to-teal-950/40 p-6 sm:p-8 backdrop-blur-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-xl bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20 mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            Field Operations & Traceability
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('journalTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {t('journalSubtitle')}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('totalEntries')}
          </span>
          <span className="text-2xl font-black text-white mt-1 block">
            {totalEntries}
          </span>
          <span className="text-[11px] text-slate-500">Recorded Operations</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            {t('organicDosages')}
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {bioDoses}
          </span>
          <span className="text-[11px] text-slate-500">Biological Applications</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            Harvest Pickings
          </span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">
            {totalHarvests}
          </span>
          <span className="text-[11px] text-slate-500">Documented Batches</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
            Export Records
          </span>
          <button
            onClick={handleExportCSV}
            className="mt-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search & Filter */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search activity, plot, or input..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
          >
            <option value="All">All Categories</option>
            <option value="Bio-fertilizer">Bio-fertilizer</option>
            <option value="Pest Management">Pest Management</option>
            <option value="Harvesting">Harvesting</option>
            <option value="Sowing">Sowing</option>
            <option value="Irrigation">Irrigation</option>
            <option value="Weeding">Weeding</option>
            <option value="Pruning">Pruning</option>
          </select>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          {isAdding ? 'Cancel Entry' : t('addEntry')}
        </button>
      </div>

      {/* New Entry Form */}
      {isAdding && (
        <form onSubmit={handleSaveEntry} className="rounded-3xl border border-emerald-500/30 bg-slate-900/80 p-6 space-y-4">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            {t('addEntry')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">{t('dateLabel')}</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">{t('plotLabel')}</label>
              <input
                type="text"
                placeholder="e.g. Plot A, North Acre"
                value={formData.plotName}
                onChange={(e) => setFormData({ ...formData, plotName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">{t('categoryLabel')}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="Bio-fertilizer">Bio-fertilizer (Jeevamrutha, Compost)</option>
                <option value="Pest Management">Pest Management (Neemastra, Traps)</option>
                <option value="Harvesting">Harvesting & Yield</option>
                <option value="Sowing">Sowing & Seed Treatment</option>
                <option value="Irrigation">Irrigation & Moisture</option>
                <option value="Weeding">Weeding & Mulching</option>
                <option value="Pruning">Pruning & Training</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">{t('quantityLabel')}</label>
              <input
                type="text"
                placeholder="e.g. 200L, 5kg/acre, 15L"
                value={formData.quantityApplied}
                onChange={(e) => setFormData({ ...formData, quantityApplied: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">{t('activityLabel')}</label>
              <input
                type="text"
                placeholder="Describe operation (e.g. Applied Panchagavya foliar spray)"
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">{t('inputsUsedLabel')}</label>
              <input
                type="text"
                placeholder="Specific bio-inputs used (e.g. Panchagavya 3% + Aloe vera)"
                value={formData.inputsUsed}
                onChange={(e) => setFormData({ ...formData, inputsUsed: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">{t('harvestLabel')}</label>
              <input
                type="text"
                placeholder="e.g. 120 kg, 3 quintals (optional)"
                value={formData.harvestYield}
                onChange={(e) => setFormData({ ...formData, harvestYield: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Weather & Soil Conditions</label>
              <input
                type="text"
                placeholder="e.g. Sunny 30°C, high morning dew"
                value={formData.weatherNotes}
                onChange={(e) => setFormData({ ...formData, weatherNotes: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Detailed Observations & Notes</label>
            <textarea
              rows={2}
              placeholder="Any notable plant response, pest counts, market price received, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20"
            >
              {t('saveLog')}
            </button>
          </div>
        </form>
      )}

      {/* Journal Entries List */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center border border-slate-800 rounded-2xl bg-slate-900/20 text-slate-500 text-sm">
            No journal entries match your search or filter criteria.
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 p-5 space-y-3 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      entry.category === 'Bio-fertilizer'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : entry.category === 'Pest Management'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : entry.category === 'Harvesting'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    {entry.category}
                  </span>
                  <span className="font-bold text-white text-sm">{entry.plotName}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    {entry.date}
                  </span>
                  <button
                    onClick={() => handleSyncToCalendar(entry)}
                    className="px-2 py-0.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                    title="Add this activity to Google Calendar"
                  >
                    {syncedIds[entry.id] ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Added</span>
                      </>
                    ) : (
                      <>
                        <CalendarPlus className="h-3.5 w-3.5" />
                        <span>Add to Calendar</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Activity */}
              <div>
                <h4 className="font-extrabold text-white text-sm">{entry.activity}</h4>
                {entry.inputsUsed && (
                  <p className="text-xs text-emerald-300 mt-1">
                    <strong className="text-slate-400">Inputs:</strong> {entry.inputsUsed}{' '}
                    {entry.quantityApplied && `(${entry.quantityApplied})`}
                  </p>
                )}
              </div>

              {/* Harvest or Weather details */}
              {(entry.harvestYield || entry.weatherNotes) && (
                <div className="flex flex-wrap gap-4 text-xs pt-1 text-slate-400">
                  {entry.harvestYield && (
                    <span className="font-bold text-amber-300">
                      Harvest Yield: {entry.harvestYield}
                    </span>
                  )}
                  {entry.weatherNotes && <span>Weather: {entry.weatherNotes}</span>}
                </div>
              )}

              {entry.notes && (
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                  {entry.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
