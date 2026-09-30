import React, { useState } from 'react';
import { FarmListing, UserProfile } from '../../types/farming';
import { LocationPicker } from './LocationPicker';
import {
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Save,
  CheckCircle2,
  Sprout,
  Image as ImageIcon,
  Layers,
  Droplets,
  Zap,
  Truck,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';

const CROP_OPTIONS = [
  'Sugarcane (गन्ना)',
  'Basmati & Paddy Rice (धान)',
  'Organic Cotton (कपास)',
  'Wheat & Mustard (गेहूं / सरसों)',
  'Turmeric & Red Chilli (हल्दी / मिर्च)',
  'Coconut & Arecanut Orchard (नारियल)',
  'Polyhouse Bell Peppers / Exotics (पॉलीहाउस सब्जियां)',
  'Soybean & Pulses (सोयाबीन / दालें)',
  'Millets - Jowar / Bajra (मोटा अनाज)',
  'Mango & Pomegranate Horticulture (फलोद्यान)',
  'Fallow / Ready for Organic Sowing',
];

const SOIL_OPTIONS = [
  'Deep Black Cotton Soil (Regur)',
  'Medium Black Loam',
  'Alluvial Riverine Loam (गंगा / मैदान)',
  'Red Sandy Loam',
  'Clayey Loam with Organic Humus',
  'Laterite Coastal Soil',
  'Fertile Silt Loam',
];

const WATER_OPTIONS = [
  'Canal Rights + 2 High-Yield Borewells (24x7)',
  '2 Deep Borewells with Sweet Aquifer',
  'Perennial River Lift Connection',
  'Lined Farm Pond (Geomembrane) + Borewell',
  'Government Tube-well Siphon',
  'Rainfed with Farm Trench Recharging',
];

const ELECTRICITY_OPTIONS = [
  'Dedicated 3-Phase 8 Hours Guaranteed Ag Power',
  '24x7 Solar Powered with Inverter Storage',
  'Commercial + Ag 3-Phase Continuous Feeder',
  'Single Phase Grid Connection',
];

const ROAD_OPTIONS = [
  'Tar / Paved Road Frontage (State Highway direct)',
  '25-ft Paved Approach Road',
  '20-ft WBM Farm Approach Road',
  '18-ft Metal Road (Tractor / Harvester accessible)',
  'Kachha Farm Track with Right of Way',
];

const FACILITIES_OPTIONS = [
  'Functional Borewell',
  'Automated Drip Irrigation Lines',
  'Perimeter Chainlink Fencing',
  'Barbed Wire Fence',
  'Farmhouse / Farmer Cottage',
  'Tractor & Tool Shed',
  'Labor Quarters',
  'High-Tech Polyhouse Unit',
  'Geomembrane Farm Pond',
  'Solar Pump Setup',
  'Grain Drying Floor',
  'Organic Certification Registered',
];

// Curated high-res real agricultural sample photos for instant 1-click test
const SAMPLE_FARM_PHOTOS = [
  {
    title: 'Fertile Farmland Aerial',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Green Paddy Field',
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Orchard with Drip System',
    url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Modern Greenhouse / Polyhouse',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Red Soil Organic Plantation',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Coconut Palms & Water Basin',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
  },
];

interface ListFarmFormProps {
  currentUser: UserProfile;
  onSaveListing: (listing: FarmListing) => void;
  onCancel: () => void;
  initialData?: FarmListing | null;
}

export const ListFarmForm: React.FC<ListFarmFormProps> = ({
  currentUser,
  onSaveListing,
  onCancel,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [landSizeAcres, setLandSizeAcres] = useState<string>(
    initialData ? String(initialData.landSizeAcres) : '3.5'
  );
  const [price, setPrice] = useState<string>(
    initialData ? String(initialData.price) : '3500000'
  );

  const [state, setState] = useState(initialData?.state || currentUser.state || 'Maharashtra');
  const [district, setDistrict] = useState(initialData?.district || currentUser.district || 'Pune');
  const [village, setVillage] = useState(initialData?.village || currentUser.village || 'Baramati Rural');

  const [latitude, setLatitude] = useState<number>(initialData?.latitude || 18.1524);
  const [longitude, setLongitude] = useState<number>(initialData?.longitude || 74.5772);

  const [cropType, setCropType] = useState(initialData?.cropType || CROP_OPTIONS[0]);
  const [soilType, setSoilType] = useState(initialData?.soilType || SOIL_OPTIONS[0]);
  const [waterAvailability, setWaterAvailability] = useState(
    initialData?.waterAvailability || WATER_OPTIONS[0]
  );
  const [electricityAvailability, setElectricityAvailability] = useState(
    initialData?.electricityAvailability || ELECTRICITY_OPTIONS[0]
  );
  const [roadAccess, setRoadAccess] = useState(initialData?.roadAccess || ROAD_OPTIONS[0]);
  const [facilities, setFacilities] = useState<string[]>(
    initialData?.facilities || ['Functional Borewell', 'Automated Drip Irrigation Lines', 'Perimeter Chainlink Fencing']
  );

  const [sellerName, setSellerName] = useState(
    initialData?.sellerName || currentUser.name || 'Farmer Landowner'
  );
  const [sellerPhone, setSellerPhone] = useState(
    initialData?.sellerPhone || currentUser.phone || '+91 98220 12345'
  );

  // Images state
  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : [SAMPLE_FARM_PHOTOS[0].url, SAMPLE_FARM_PHOTOS[1].url]
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            setImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleAddSamplePhoto = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReorderImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const item = updated.splice(fromIndex, 1)[0];
    updated.splice(toIndex, 0, item);
    setImages(updated);
  };

  const toggleFacility = (facilityName: string) => {
    setFacilities((prev) =>
      prev.includes(facilityName)
        ? prev.filter((f) => f !== facilityName)
        : [...prev, facilityName]
    );
  };

  const handleSubmit = (status: 'published' | 'draft') => {
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Please enter a descriptive farm listing title.');
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedAcres = parseFloat(landSizeAcres);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setValidationError('Please specify a valid asking price.');
      return;
    }

    if (isNaN(parsedAcres) || parsedAcres <= 0) {
      setValidationError('Please specify valid land size in acres.');
      return;
    }

    if (images.length === 0) {
      setValidationError('Please upload or select at least 1 farm photo.');
      return;
    }

    const listing: FarmListing = {
      id: initialData?.id || 'farm_' + Date.now(),
      sellerId: currentUser.id,
      sellerName: sellerName.trim() || 'Verified Farmer',
      sellerPhone: sellerPhone.trim() || '+91 98220 12345',
      title: title.trim(),
      description: description.trim() || `Prime agricultural land of ${parsedAcres} acres in ${village}, ${district}.`,
      images,
      price: parsedPrice,
      landSizeAcres: parsedAcres,
      state,
      district,
      village,
      latitude,
      longitude,
      cropType,
      soilType,
      waterAvailability,
      electricityAvailability,
      roadAccess,
      facilities,
      status,
      featured: initialData?.featured || false,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveListing(listing);
  };

  return (
    <div className="rounded-3xl border border-emerald-500/20 bg-slate-900/60 p-5 sm:p-8 space-y-8 shadow-2xl backdrop-blur-md">
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Marketplace
          </button>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {initialData ? 'Edit Farm Listing' : 'List Your Agricultural Land'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Connect directly with verified agricultural buyers, organic farming collectives, and progressive farmers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            Publish Farm Listing
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Basic Title & Overview */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <Sprout className="h-4 w-4" /> 1. Farm Title & Pricing
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-300">Listing Headline / Title *</label>
            <input
              type="text"
              placeholder="e.g. 5-Acre Fertile Black Soil Land with Canal Water & Drip Setup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Land Size (in Acres) *</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              placeholder="e.g. 4.5"
              value={landSizeAcres}
              onChange={(e) => setLandSizeAcres(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Asking Total Price (₹ INR) *</label>
            <div className="relative">
              <IndianRupee className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="number"
                step="10000"
                min="50000"
                placeholder="e.g. 4500000 for 45 Lakhs"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-8 pr-3 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
            {price && parseFloat(price) > 0 && (
              <span className="text-[11px] text-emerald-400 font-mono block">
                {parseFloat(price) >= 10000000
                  ? `₹${(parseFloat(price) / 10000000).toFixed(2)} Crore`
                  : `₹${(parseFloat(price) / 100000).toFixed(2)} Lakh`}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Landowner / Seller Name</label>
            <input
              type="text"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Comprehensive Farm Description</label>
          <textarea
            rows={4}
            placeholder="Describe soil fertility, water discharge rates, crop history, title clearance, distance to mandi, and approach roads..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Location Details & Interactive Google Map Picker */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <Truck className="h-4 w-4" /> 2. Location & Interactive Map Pin
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">State (राज्य) *</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">District (ज़िला) *</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Village / Town (गाँव) *</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Interactive Google Maps Location Picker */}
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          onChangeLocation={(lat, lng, addr) => {
            setLatitude(lat);
            setLongitude(lng);
            if (addr?.state) setState(addr.state);
            if (addr?.district) setDistrict(addr.district);
            if (addr?.village) setVillage(addr.village);
          }}
        />
      </div>

      {/* Agricultural Attributes */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="h-4 w-4" /> 3. Agricultural & Infrastructure Attributes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5 text-emerald-400" /> Current / Recent Crop
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            >
              {CROP_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-amber-400" /> Soil Classification
            </label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            >
              {SOIL_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-sky-400" /> Water Availability
            </label>
            <select
              value={waterAvailability}
              onChange={(e) => setWaterAvailability(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            >
              {WATER_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-300" /> Electricity Feeder
            </label>
            <select
              value={electricityAvailability}
              onChange={(e) => setElectricityAvailability(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            >
              {ELECTRICITY_OPTIONS.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-purple-400" /> Road Accessibility
            </label>
            <select
              value={roadAccess}
              onChange={(e) => setRoadAccess(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            >
              {ROAD_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Facilities Checkboxes */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-300 block">
            Additional Installed Facilities & Assets:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {FACILITIES_OPTIONS.map((fac) => {
              const isChecked = facilities.includes(fac);
              return (
                <button
                  key={fac}
                  type="button"
                  onClick={() => toggleFacility(fac)}
                  className={`p-2 rounded-xl text-left text-xs transition-all flex items-center gap-2 border ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-md flex items-center justify-center shrink-0 border ${
                      isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                    }`}
                  >
                    {isChecked && '✓'}
                  </div>
                  <span className="truncate text-[11px]">{fac}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multiple Image Uploads & Reordering */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> 4. Farm Photos ({images.length})
          </h3>
          <span className="text-[11px] text-slate-400">First image is main cover photo</span>
        </div>

        {/* Dropzone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950/60 rounded-2xl p-6 cursor-pointer transition-colors group">
            <Upload className="h-8 w-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200">Click to upload photos from device</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Supports JPG, PNG, WEBP (Multiple allowed)</span>
            <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Quick Preset Library */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Or pick from verified agricultural presets:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_FARM_PHOTOS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddSamplePhoto(sample.url)}
                  className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 hover:border-emerald-500/50 group"
                  title={sample.title}
                >
                  <img src={sample.url} alt={sample.title} className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                    + Add
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Uploaded Images List with Reorder & Delete */}
        {images.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-300 block">Uploaded Photo Previews:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-[4/3]"
                >
                  <img src={img} alt={`preview-${idx}`} className="w-full h-full object-cover" />

                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md">
                      Cover Photo
                    </span>
                  )}

                  {/* Reorder and Delete controls overlay */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleReorderImage(idx, idx - 1)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                        title="Move left"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white"
                      title="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleReorderImage(idx, idx + 1)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                        title="Move right"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Submit Buttons */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            Publish Farm Listing
          </button>
        </div>
      </div>
    </div>
  );
};
