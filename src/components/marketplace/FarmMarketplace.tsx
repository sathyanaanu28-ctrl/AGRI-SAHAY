import React, { useState, useEffect, useMemo } from 'react';
import { FarmListing, FarmFilterState, UserProfile } from '../../types/farming';
import { INITIAL_FARM_LISTINGS } from '../../utils/initialFarmListings';
import { saveFarmListingToFirestore, getFarmListingsFromFirestore } from '../../utils/firebase';
import { FarmListingCard } from './FarmListingCard';
import { FarmDetailsModal } from './FarmDetailsModal';
import { FarmMapView } from './FarmMapView';
import { ListFarmForm } from './ListFarmForm';
import {
  Tractor,
  Plus,
  Search,
  Filter,
  MapPin,
  Compass,
  LayoutGrid,
  Map as MapIcon,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  FolderOpen,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  IndianRupee,
  Layers,
  Sprout,
  Droplets,
} from 'lucide-react';

interface FarmMarketplaceProps {
  currentUser: UserProfile;
}

export const FarmMarketplace: React.FC<FarmMarketplaceProps> = ({ currentUser }) => {
  // Persistent listings in localStorage
  const [listings, setListings] = useState<FarmListing[]>(() => {
    const saved = localStorage.getItem('agrisahay_farm_marketplace_listings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading saved farm listings:', e);
      }
    }
    return INITIAL_FARM_LISTINGS;
  });

  // Active top-level subtab: 'browse' | 'list' | 'my-listings'
  const [activeTab, setActiveTab] = useState<'browse' | 'list' | 'my-listings'>('browse');

  // View mode in browse: 'grid' | 'split-map'
  const [viewMode, setViewMode] = useState<'grid' | 'split-map'>('grid');

  // Currently inspected farm for details modal
  const [selectedFarm, setSelectedFarm] = useState<FarmListing | null>(null);

  // Farm selected for map centering
  const [mapFocusedFarm, setMapFocusedFarm] = useState<FarmListing | null>(null);

  // Editing farm state
  const [editingFarm, setEditingFarm] = useState<FarmListing | null>(null);

  // Filters state
  const [filters, setFilters] = useState<FarmFilterState>({
    searchQuery: '',
    state: 'All',
    minPrice: 0,
    maxPrice: 0,
    landSizeRange: 'All',
    cropType: 'All',
    soilType: 'All',
    waterAvailability: 'All',
    sortBy: 'newest',
  });

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // My listings filter: 'all' | 'published' | 'draft' | 'sold'
  const [myListingStatusFilter, setMyListingStatusFilter] = useState<'all' | 'published' | 'draft' | 'sold'>('all');

  // Save listings to localStorage
  useEffect(() => {
    localStorage.setItem('agrisahay_farm_marketplace_listings', JSON.stringify(listings));
  }, [listings]);

  // Load from Firestore on mount
  useEffect(() => {
    getFarmListingsFromFirestore().then((cloudListings) => {
      if (cloudListings && cloudListings.length > 0) {
        setListings((prev) => {
          const map = new Map<string, FarmListing>();
          prev.forEach((item) => map.set(item.id, item));
          cloudListings.forEach((item: any) => map.set(item.id, item));
          return Array.from(map.values());
        });
      }
    });
  }, []);

  // Handle Save / Publish new or edited farm listing
  const handleSaveListing = (listing: FarmListing) => {
    setListings((prev) => {
      const exists = prev.some((item) => item.id === listing.id);
      if (exists) {
        return prev.map((item) => (item.id === listing.id ? listing : item));
      } else {
        return [listing, ...prev];
      }
    });

    saveFarmListingToFirestore(listing).catch(() => {});
    setEditingFarm(null);
    setActiveTab(listing.status === 'draft' ? 'my-listings' : 'browse');
    setSelectedFarm(listing);
  };

  const handleDeleteListing = (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  const handleStatusChange = (id: string, status: FarmListing['status']) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item))
    );
  };

  // Filtered and Sorted Listings for Browse view
  const filteredListings = useMemo(() => {
    return listings
      .filter((farm) => {
        // Only show published in public browse
        if (farm.status !== 'published') return false;

        // Search text
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const match =
            farm.title.toLowerCase().includes(q) ||
            farm.district.toLowerCase().includes(q) ||
            farm.state.toLowerCase().includes(q) ||
            farm.village.toLowerCase().includes(q) ||
            farm.cropType.toLowerCase().includes(q) ||
            farm.soilType.toLowerCase().includes(q);
          if (!match) return false;
        }

        // State filter
        if (filters.state !== 'All' && farm.state !== filters.state) {
          return false;
        }

        // Price range
        if (filters.minPrice > 0 && farm.price < filters.minPrice) return false;
        if (filters.maxPrice > 0 && farm.price > filters.maxPrice) return false;

        // Land size
        if (filters.landSizeRange !== 'All') {
          if (filters.landSizeRange === '<2' && farm.landSizeAcres >= 2) return false;
          if (filters.landSizeRange === '2-5' && (farm.landSizeAcres < 2 || farm.landSizeAcres > 5)) return false;
          if (filters.landSizeRange === '5-10' && (farm.landSizeAcres < 5 || farm.landSizeAcres > 10)) return false;
          if (filters.landSizeRange === '>10' && farm.landSizeAcres <= 10) return false;
        }

        // Crop Type
        if (filters.cropType !== 'All' && !farm.cropType.toLowerCase().includes(filters.cropType.toLowerCase())) {
          return false;
        }

        // Soil Type
        if (filters.soilType !== 'All' && !farm.soilType.toLowerCase().includes(filters.soilType.toLowerCase())) {
          return false;
        }

        // Water
        if (filters.waterAvailability !== 'All' && !farm.waterAvailability.toLowerCase().includes(filters.waterAvailability.toLowerCase())) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price_asc') return a.price - b.price;
        if (filters.sortBy === 'price_desc') return b.price - a.price;
        if (filters.sortBy === 'size_desc') return b.landSizeAcres - a.landSizeAcres;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, filters]);

  // My listings
  const myListings = useMemo(() => {
    return listings.filter((farm) => {
      const matchOwner = farm.sellerId === currentUser.id;
      if (!matchOwner) return false;
      if (myListingStatusFilter === 'all') return true;
      return farm.status === myListingStatusFilter;
    });
  }, [listings, currentUser.id, myListingStatusFilter]);

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      state: 'All',
      minPrice: 0,
      maxPrice: 0,
      landSizeRange: 'All',
      cropType: 'All',
      soilType: 'All',
      waterAvailability: 'All',
      sortBy: 'newest',
    });
  };

  const activeFiltersCount = [
    filters.state !== 'All',
    filters.minPrice > 0,
    filters.maxPrice > 0,
    filters.landSizeRange !== 'All',
    filters.cropType !== 'All',
    filters.soilType !== 'All',
    filters.waterAvailability !== 'All',
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 p-6 sm:p-8 backdrop-blur-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-3">
            <Tractor className="h-3.5 w-3.5" />
            Verified Agricultural Land Exchange
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Farm Marketplace
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Browse verified fertile agricultural lands, orchard plantations, and polyhouses directly from farmers. Plot locations on Google Maps and get turn-by-turn directions.
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setActiveTab('browse');
              setEditingFarm(null);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Compass className="h-4 w-4" />
            1. Browse Farms ({filteredListings.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('list');
              setEditingFarm(null);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'list'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plus className="h-4 w-4" />
            2. List Your Farm
          </button>

          <button
            onClick={() => {
              setActiveTab('my-listings');
              setEditingFarm(null);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'my-listings'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            My Listings ({listings.filter((f) => f.sellerId === currentUser.id).length})
          </button>
        </div>

        {/* View Switcher when in Browse mode */}
        {activeTab === 'browse' && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('split-map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'split-map'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Interactive Map Explorer"
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Map & Cards</span>
            </button>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. BROWSE FARMS VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'browse' && (
        <div className="space-y-5">
          {/* Search, Filter Toggle, and Sort Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by state, district, village, crop, or keywords..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Filter Drawer Toggle */}
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 transition-colors ${
                  isFilterPanelOpen || activeFiltersCount > 0
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sorting */}
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="newest">Sort: Newest Listings</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="size_desc">Land Size: Largest First</option>
              </select>
            </div>

            {/* Expandable Advanced Filters Panel */}
            {isFilterPanelOpen && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5 text-emerald-400" /> Refine Farm Searches
                  </h4>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* State */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Agricultural State</label>
                    <select
                      value={filters.state}
                      onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                    >
                      <option value="All">All States (भारतभर)</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Gujarat">Gujarat</option>
                    </select>
                  </div>

                  {/* Land Size Range */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Land Size (Acres)</label>
                    <select
                      value={filters.landSizeRange}
                      onChange={(e) => setFilters({ ...filters, landSizeRange: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                    >
                      <option value="All">All Sizes</option>
                      <option value="<2">Small Plot (Under 2 Acres)</option>
                      <option value="2-5">Medium Farm (2 to 5 Acres)</option>
                      <option value="5-10">Large Farm (5 to 10 Acres)</option>
                      <option value=">10">Commercial Holding (10+ Acres)</option>
                    </select>
                  </div>

                  {/* Soil Type */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Soil Type</label>
                    <select
                      value={filters.soilType}
                      onChange={(e) => setFilters({ ...filters, soilType: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                    >
                      <option value="All">All Soil Types</option>
                      <option value="Black">Black Cotton / Regur</option>
                      <option value="Alluvial">Alluvial Loam</option>
                      <option value="Red">Red Sandy Loam</option>
                      <option value="Clay">Clayey Loam</option>
                    </select>
                  </div>

                  {/* Water Availability */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Water Availability</label>
                    <select
                      value={filters.waterAvailability}
                      onChange={(e) => setFilters({ ...filters, waterAvailability: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-500"
                    >
                      <option value="All">All Water Sources</option>
                      <option value="Canal">Canal Irrigation Rights</option>
                      <option value="Borewell">Deep Borewell / Tubewell</option>
                      <option value="Pond">Lined Farm Pond</option>
                      <option value="River">River Basin Lift</option>
                    </select>
                  </div>
                </div>

                {/* Price Range Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400">Budget Range:</span>
                  {[
                    { label: 'All Budgets', min: 0, max: 0 },
                    { label: 'Under ₹40 Lakh', min: 0, max: 4000000 },
                    { label: '₹40L - ₹75L', min: 4000000, max: 7500000 },
                    { label: '₹75L - ₹1.5 Cr', min: 7500000, max: 15000000 },
                    { label: 'Above ₹1.5 Cr', min: 15000000, max: 0 },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFilters({ ...filters, minPrice: preset.min, maxPrice: preset.max })}
                      className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-colors ${
                        filters.minPrice === preset.min && filters.maxPrice === preset.max
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Listings Display: Split Map vs Grid */}
          {viewMode === 'split-map' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left / Top Google Map Explorer */}
              <div className="lg:col-span-6 sticky top-20 z-20 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <MapIcon className="h-4 w-4 text-emerald-400" /> Geographic Map Explorer
                  </span>
                  <span>Click pin to view listing preview</span>
                </div>
                <FarmMapView
                  farms={filteredListings}
                  selectedFarm={mapFocusedFarm}
                  onSelectFarm={(farm) => setMapFocusedFarm(farm)}
                  onViewDetails={(farm) => setSelectedFarm(farm)}
                  className="h-[520px] w-full rounded-3xl"
                />
              </div>

              {/* Right Cards List */}
              <div className="lg:col-span-6 space-y-4 max-h-[85vh] overflow-y-auto pr-1">
                {filteredListings.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
                    <Tractor className="h-10 w-10 text-slate-600 mx-auto" />
                    <h4 className="text-base font-bold text-white">No Matching Farm Listings Found</h4>
                    <p className="text-xs text-slate-400">Try adjusting your budget or state filters.</p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-emerald-400"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  filteredListings.map((farm) => (
                    <div
                      key={farm.id}
                      onMouseEnter={() => setMapFocusedFarm(farm)}
                      className={`transition-all ${
                        mapFocusedFarm?.id === farm.id ? 'ring-2 ring-emerald-500 rounded-3xl' : ''
                      }`}
                    >
                      <FarmListingCard
                        farm={farm}
                        onViewDetails={(f) => setSelectedFarm(f)}
                        onViewOnMap={(f) => {
                          setMapFocusedFarm(f);
                          window.scrollTo({ top: 120, behavior: 'smooth' });
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Cards Grid View */
            <div>
              {filteredListings.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <Tractor className="h-10 w-10 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">No Matching Farm Listings Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    No active listings matched your search criteria. You can be the first to list farmland in this area!
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-emerald-400"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((farm) => (
                    <FarmListingCard
                      key={farm.id}
                      farm={farm}
                      onViewDetails={(f) => setSelectedFarm(f)}
                      onViewOnMap={(f) => {
                        setMapFocusedFarm(f);
                        setViewMode('split-map');
                        window.scrollTo({ top: 100, behavior: 'smooth' });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. LIST YOUR FARM VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'list' && (
        <ListFarmForm
          currentUser={currentUser}
          initialData={editingFarm}
          onSaveListing={handleSaveListing}
          onCancel={() => {
            setActiveTab('browse');
            setEditingFarm(null);
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. MY LISTINGS VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'my-listings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white">My Farmland Listings</h3>
              <p className="text-xs text-slate-400">
                Manage, edit, or mark as sold listings created under your farmer account.
              </p>
            </div>

            {/* Filter by status */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['all', 'published', 'draft', 'sold'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setMyListingStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                    myListingStatusFilter === st
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {myListings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4">
              <FolderOpen className="h-12 w-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">No Listings Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You haven't posted any farm listings yet. Publish your first land listing to receive inquiries from verified agricultural buyers.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingFarm(null);
                  setActiveTab('list');
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="h-4 w-4" />
                List a Farm Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((farm) => (
                <div
                  key={farm.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={farm.images[0]} alt={farm.title} className="w-full h-full object-cover" />
                      <span
                        className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          farm.status === 'published'
                            ? 'bg-emerald-500 text-slate-950'
                            : farm.status === 'sold'
                            ? 'bg-red-500 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {farm.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-white text-base line-clamp-1">{farm.title}</h4>
                      <p className="text-xs text-slate-400">{farm.village}, {farm.district}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                      <span className="font-mono text-emerald-400 font-bold">
                        {farm.landSizeAcres} Acres
                      </span>
                      <span className="font-black text-white text-sm">
                        ₹{(farm.price / 100000).toFixed(2)} Lakh
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedFarm(farm)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>

                    <button
                      onClick={() => {
                        setEditingFarm(farm);
                        setActiveTab('list');
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center gap-1"
                      title="Edit Listing"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    {farm.status !== 'sold' && (
                      <button
                        onClick={() => handleStatusChange(farm.id, 'sold')}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30"
                      >
                        Mark Sold
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Delete this listing permanently?')) {
                          handleDeleteListing(farm.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Farm Details Modal */}
      {selectedFarm && (
        <FarmDetailsModal
          farm={selectedFarm}
          onClose={() => setSelectedFarm(null)}
          currentUserId={currentUser.id}
          onDeleteListing={handleDeleteListing}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};
