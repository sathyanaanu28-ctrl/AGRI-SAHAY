import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types/farming';
import {
  User,
  MapPin,
  Sprout,
  CheckCircle2,
  Phone,
  Sparkles,
  Layers,
} from 'lucide-react';

const INDIAN_STATES = [
  'Maharashtra',
  'Punjab',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Andhra Pradesh',
  'Telangana',
  'Tamil Nadu',
  'Karnataka',
  'Gujarat',
  'Rajasthan',
  'Haryana',
  'Bihar',
  'West Bengal',
  'Odisha',
  'Kerala',
  'Chhattisgarh',
  'Assam',
  'Jharkhand',
  'Himachal Pradesh',
  'Uttarakhand',
  'Other / International',
];

const MAIN_CROPS = [
  'Rice / Paddy (धान)',
  'Wheat (गेहूं)',
  'Cotton (कपास)',
  'Sugarcane (गन्ना)',
  'Soybean (सोयाबीन)',
  'Maize / Corn (मक्का)',
  'Tomato & Vegetables (टमाटर / सब्जियां)',
  'Millets - Jowar / Bajra / Ragi (मोटा अनाज)',
  'Pulses - Chickpea / Pigeon Pea (दालें)',
  'Spices - Turmeric / Ginger / Chilli (मसाले)',
  'Oilseeds - Mustard / Groundnut (तिलहन)',
  'Fruits & Horticulture (फल)',
  'Other',
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isInitialSetup?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  isInitialSetup = false,
}) => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    state: user?.state || 'Maharashtra',
    district: user?.district || '',
    village: user?.village || '',
    mainCrop: user?.mainCrop || 'Rice / Paddy (धान)',
    farmSize: user?.farmSize || '2.5 Acres',
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      await updateProfile(formData);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">
              {isInitialSetup ? 'Complete Farmer Profile' : 'Edit Farm Profile'}
            </h3>
            <p className="text-xs text-slate-400">
              Personalize crop advisory, disease diagnostics, and local mandi prices for your farm.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Farmer Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-emerald-400" />
              Farmer Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Rameshwar Patil / Balwant Singh"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              Contact Mobile Number
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 98220 12345"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Location: State, District, Village */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                State (राज्य) *
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">
                District (ज़िला) *
              </label>
              <input
                type="text"
                placeholder="e.g. Pune, Ludhiana, Guntur"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">
              Village / Gram Panchayat (गाँव)
            </label>
            <input
              type="text"
              placeholder="e.g. Baramati Rural, Morinda"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          {/* Farm Details: Main Crop and Farm Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sprout className="h-3.5 w-3.5 text-emerald-400" />
                Primary Crop (मुख्य फसल)
              </label>
              <select
                value={formData.mainCrop}
                onChange={(e) => setFormData({ ...formData, mainCrop: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              >
                {MAIN_CROPS.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                Farm Size (जमीन का आकार)
              </label>
              <input
                type="text"
                placeholder="e.g. 2 Acres, 1 Hectare"
                value={formData.farmSize}
                onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            {!isInitialSetup && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving || !formData.name.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                'Saving Profile...'
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save & Open Dashboard
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
