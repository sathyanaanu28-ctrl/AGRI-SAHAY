import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CommunityResource } from '../types/farming';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Tag,
  ShieldCheck,
  Tractor,
  Sprout,
  Sparkles,
  HeartHandshake,
  X,
  MessageCircle,
} from 'lucide-react';

const INITIAL_RESOURCES: CommunityResource[] = [
  {
    id: 'res_1',
    title: 'Multi-Crop Zero-Till Seed Drill & Broadcaster',
    type: 'Equipment',
    ownerName: 'Rameshwar Patil',
    villageOrRegion: 'Baramati, Pune District, Maharashtra',
    phoneOrContact: '+91 98220 45123',
    availability: 'Available',
    costType: 'Affordable Daily Rent',
    costAmount: '₹350 / day (Tractor mount included)',
    description:
      'Ideal for direct sowing of wheat, chickpea, and soybean into crop residues without burning straw. Preserves soil moisture and cuts land prep costs by 60%.',
    rating: 4.9,
  },
  {
    id: 'res_2',
    title: 'Desi Bansi Indigenous Wheat Heritage Seeds (A2 Farm)',
    type: 'Indigenous Seeds',
    ownerName: 'Gurpreet Singh',
    villageOrRegion: 'Hoshiarpur, Punjab',
    phoneOrContact: '+91 94172 88201',
    availability: 'Available',
    costType: 'Free / Barter',
    costAmount: 'Barter for indigenous Black Gram / Ragi seeds',
    description:
      'Non-hybrid heritage Bansi wheat known for high zinc, iron, and drought hardiness. Harvested organically; open-pollinated, true to type for seed saving.',
    rating: 5.0,
  },
  {
    id: 'res_3',
    title: 'Trichoderma viride + Pseudomonas Mother Bio-Culture',
    type: 'Bio-Inputs & Culture',
    ownerName: 'Dr. Anita Deshmukh (Krishi Mitra)',
    villageOrRegion: 'Akola / Amravati Belt, Maharashtra',
    phoneOrContact: '+91 97654 32190',
    availability: 'Available',
    costType: 'Free / Barter',
    costAmount: 'Free for smallholder organic farmers',
    description:
      'High-potency mother culture for multiplication in farm-yard manure. Effective biocontrol against soil-borne Fusarium wilt, root rot, and damping off.',
    rating: 4.8,
  },
  {
    id: 'res_4',
    title: 'Rotary Vermicompost Sifter & Eisenia fetida Worm Colony',
    type: 'Equipment',
    ownerName: 'Senthil Murugan',
    villageOrRegion: 'Pollachi / Coimbatore, Tamil Nadu',
    phoneOrContact: '+91 94432 10987',
    availability: 'Available',
    costType: 'Affordable Daily Rent',
    costAmount: '₹200 / day (Includes 2kg live earthworm starter)',
    description:
      'Manual drum sifter for harvesting pure vermicast granules from compost beds. Comes with vigorous red wiggler earthworm starter culture.',
    rating: 4.9,
  },
  {
    id: 'res_5',
    title: 'Solar-Powered Twin-Nozzle Knapsack Sprayer (16L)',
    type: 'Equipment',
    ownerName: 'Venkatesh Rao',
    villageOrRegion: 'Guntur Rural, Andhra Pradesh',
    phoneOrContact: '+91 98480 33112',
    availability: 'Available',
    costType: 'Affordable Daily Rent',
    costAmount: '₹120 / day',
    description:
      'Lightweight solar charged backpack sprayer with micro-droplet brass nozzles. Specially fitted for dense organic sprays like Neemastra and Panchagavya.',
    rating: 4.7,
  },
  {
    id: 'res_6',
    title: 'Aged Desi Cow Dung Compost (Gir Cow Farm Yard Manure)',
    type: 'Organic Manure',
    ownerName: 'Balasaheb Shinde',
    villageOrRegion: 'Sangamner, Ahmednagar, Maharashtra',
    phoneOrContact: '+91 98500 77654',
    availability: 'Seasonal',
    costType: 'Nominal Cost',
    costAmount: '₹1,200 / trolley tractor load',
    description:
      'Well-cured decomposed desi cow manure rich in beneficial microbes, humic acids, and earthworm cocoons. Completely weed-seed free.',
    rating: 4.9,
  },
];

export const ResourceNetwork: React.FC = () => {
  const { language, t } = useLanguage();

  const [resources, setResources] = useState<CommunityResource[]>(() => {
    const saved = localStorage.getItem('agrisahay_resources');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_RESOURCES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<CommunityResource | null>(null);

  // New Resource Form
  const [formData, setFormData] = useState<Omit<CommunityResource, 'id'>>({
    title: '',
    type: 'Equipment',
    ownerName: '',
    villageOrRegion: '',
    phoneOrContact: '',
    availability: 'Available',
    costType: 'Free / Barter',
    costAmount: '',
    description: '',
  });

  useEffect(() => {
    localStorage.setItem('agrisahay_resources', JSON.stringify(resources));
  }, [resources]);

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.ownerName.trim()) return;

    const newRes: CommunityResource = {
      ...formData,
      id: 'res_' + Date.now(),
      rating: 5.0,
    };

    setResources([newRes, ...resources]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      type: 'Equipment',
      ownerName: '',
      villageOrRegion: '',
      phoneOrContact: '',
      availability: 'Available',
      costType: 'Free / Barter',
      costAmount: '',
      description: '',
    });
  };

  const filtered = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.villageOrRegion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || res.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/95 to-teal-950/40 p-6 sm:p-8 backdrop-blur-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-xl bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20 mb-3">
            <HeartHandshake className="h-3.5 w-3.5" />
            Decentralized Farmer Cooperative
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Farmer Resource & Bio-Input Network
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Borrow or rent machinery, exchange heritage indigenous seeds, and share organic bio-starter cultures directly with trusted neighboring farmers without middlemen.
          </p>
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
              placeholder="Search equipment, seeds, village, bio-inputs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
          >
            <option value="All">All Resources</option>
            <option value="Equipment">Farm Equipment & Tools</option>
            <option value="Indigenous Seeds">Heritage Indigenous Seeds</option>
            <option value="Bio-Inputs & Culture">Bio-Inputs & Microbe Cultures</option>
            <option value="Organic Manure">Aged Manure & Biomass</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          List Equipment or Seeds
        </button>
      </div>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/40 p-5 space-y-4 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.type === 'Equipment'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : item.type === 'Indigenous Seeds'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  }`}
                >
                  {item.type}
                </span>

                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    item.availability === 'Available' ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {item.availability}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-base leading-snug">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{item.villageOrRegion}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Terms:</span>
                  <span className="font-bold text-emerald-400">
                    {item.costAmount || item.costType}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">Listed By:</span>
                  <span className="font-semibold text-slate-200">{item.ownerName}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedResource(item)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                Contact Farmer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connect Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <button
              onClick={() => setSelectedResource(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Farmer Direct Contact
              </span>
              <h3 className="text-lg font-bold text-white">
                {selectedResource.title}
              </h3>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Farmer:</span>
                <span className="font-bold text-white">{selectedResource.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-bold text-slate-200">{selectedResource.villageOrRegion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pricing / Terms:</span>
                <span className="font-bold text-emerald-400">
                  {selectedResource.costAmount || selectedResource.costType}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Phone / WhatsApp:</span>
                <span className="font-mono font-bold text-emerald-300">
                  {selectedResource.phoneOrContact}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Please mention <strong className="text-emerald-400">AgriSahay Community Network</strong> when calling or texting for peer verification.
            </p>

            <div className="flex gap-2">
              <a
                href={`tel:${selectedResource.phoneOrContact}`}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Phone className="h-3.5 w-3.5" />
                Call Now
              </a>
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 sm:p-8 space-y-5 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">
                Share Machinery, Seeds, or Bio-Inputs
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Help fellow growers in your district by offering idle equipment for rent or bartering indigenous seed varieties.
              </p>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Resource Title</label>
                <input
                  type="text"
                  placeholder="e.g. 5-HP Power Tiller, Black Rice Indigenous Seeds"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Resource Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Equipment">Farm Equipment & Tools</option>
                    <option value="Indigenous Seeds">Heritage Indigenous Seeds</option>
                    <option value="Bio-Inputs & Culture">Bio-Inputs & Microbe Cultures</option>
                    <option value="Organic Manure">Aged Manure & Biomass</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Availability Status</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Available">Available Immediately</option>
                    <option value="Seasonal">Seasonal Availability</option>
                    <option value="In Use">Currently In Use (Book in advance)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Contact Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phoneOrContact}
                    onChange={(e) => setFormData({ ...formData, phoneOrContact: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Village & District</label>
                  <input
                    type="text"
                    placeholder="e.g. Sangli, Maharashtra"
                    value={formData.villageOrRegion}
                    onChange={(e) => setFormData({ ...formData, villageOrRegion: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Rate / Terms</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹200/day or Free Barter"
                    value={formData.costAmount}
                    onChange={(e) => setFormData({ ...formData, costAmount: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Description & Condition</label>
                <textarea
                  rows={3}
                  placeholder="Provide specifications, capacity, or barter requests..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
