import React, { useState } from 'react';
import { FarmListing } from '../../types/farming';
import {
  formatIndianCurrency,
  formatPerAcrePrice,
  getGoogleDirectionsUrl,
  getGoogleMapsViewUrl,
  formatCoordinates,
} from '../../utils/farmFormatters';
import { FarmMapView } from './FarmMapView';
import {
  X,
  MapPin,
  Sprout,
  Droplets,
  Zap,
  Truck,
  Layers,
  Phone,
  MessageCircle,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Share2,
  CheckCircle,
  Check,
} from 'lucide-react';

interface FarmDetailsModalProps {
  farm: FarmListing | null;
  onClose: () => void;
  currentUserId?: string;
  onDeleteListing?: (id: string) => void;
  onStatusChange?: (id: string, status: FarmListing['status']) => void;
}

export const FarmDetailsModal: React.FC<FarmDetailsModalProps> = ({
  farm,
  onClose,
  currentUserId,
  onDeleteListing,
  onStatusChange,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!farm) return null;

  const isOwner = currentUserId && farm.sellerId === currentUserId;
  const directionsUrl = getGoogleDirectionsUrl(farm.latitude, farm.longitude);
  const mapsViewUrl = getGoogleMapsViewUrl(farm.latitude, farm.longitude);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl p-5 sm:p-8 space-y-6">
        {/* Top Close & Share bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                farm.status === 'published'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : farm.status === 'sold'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {farm.status.toUpperCase()}
            </span>
            {farm.featured && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                <ShieldCheck className="h-3 w-3" />
                Verified Title
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5"
              title="Share listing link"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 aspect-[16/9] max-h-96">
            <img
              src={farm.images[activeImageIndex] || farm.images[0]}
              alt={farm.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono text-slate-300 border border-slate-700">
              {activeImageIndex + 1} / {farm.images.length}
            </div>
          </div>

          {/* Thumbnails */}
          {farm.images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {farm.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-emerald-500 scale-105'
                      : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Details Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>{farm.village}, {farm.district}, {farm.state}</span>
              <span>•</span>
              <span className="font-mono text-emerald-300">
                {formatCoordinates(farm.latitude, farm.longitude)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {farm.title}
            </h2>
          </div>

          {/* Price & Size Card */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 shrink-0 text-left md:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Asking Price</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">
              {formatIndianCurrency(farm.price)}
            </span>
            <span className="text-xs text-slate-300 font-mono">
              {farm.landSizeAcres} Acres • {formatPerAcrePrice(farm.price, farm.landSizeAcres)}
            </span>
          </div>
        </div>

        {/* Key Agricultural Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Sprout className="h-3.5 w-3.5 text-emerald-400" /> Current Crop
            </span>
            <span className="text-xs font-bold text-white block truncate">{farm.cropType}</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-amber-400" /> Soil Type
            </span>
            <span className="text-xs font-bold text-white block truncate">{farm.soilType}</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-sky-400" /> Water Source
            </span>
            <span className="text-xs font-bold text-white block truncate">{farm.waterAvailability}</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-300" /> Electricity
            </span>
            <span className="text-xs font-bold text-white block truncate">{farm.electricityAvailability}</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-purple-400" /> Road Access
            </span>
            <span className="text-xs font-bold text-white block truncate">{farm.roadAccess}</span>
          </div>
        </div>

        {/* Facilities Chips */}
        {farm.facilities && farm.facilities.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Installed Farm Facilities & Amenities:
            </span>
            <div className="flex flex-wrap gap-2">
              {farm.facilities.map((facility, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-950 border border-emerald-500/20 text-xs font-medium text-slate-200 flex items-center gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Farm Description */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Detailed Description & Title Information:
          </span>
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
            {farm.description}
          </div>
        </div>

        {/* Interactive Google Map Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Geographic Map Location
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={mapsViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                View on Google Maps
              </a>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-xs font-bold text-sky-300 border border-sky-500/40 flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="h-3.5 w-3.5 text-sky-400" />
                Get Directions
              </a>
            </div>
          </div>

          <FarmMapView
            farms={[farm]}
            selectedFarm={farm}
            className="h-64 w-full rounded-2xl overflow-hidden"
          />
        </div>

        {/* Seller Info & Contact Actions */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Direct Farmer / Landowner
            </span>
            <h4 className="text-base font-extrabold text-white">{farm.sellerName}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                Listed {new Date(farm.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="text-emerald-300">Verified Seller</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsContactOpen(true)}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <Phone className="h-4 w-4" />
              Contact Seller
            </button>
          </div>
        </div>

        {/* Owner Controls if authenticated seller is viewing their own listing */}
        {isOwner && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-medium">You are the owner of this farm listing.</span>
            <div className="flex items-center gap-2">
              {farm.status === 'published' && onStatusChange && (
                <button
                  onClick={() => onStatusChange(farm.id, 'sold')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold transition-colors"
                >
                  Mark as Sold
                </button>
              )}
              {onDeleteListing && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this listing?')) {
                      onDeleteListing(farm.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold transition-colors"
                >
                  Delete Listing
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contact Dialog */}
        {isContactOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 space-y-4 shadow-2xl">
              <button
                onClick={() => setIsContactOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Verified Contact Details
                </span>
                <h4 className="text-lg font-bold text-white">{farm.sellerName}</h4>
                <p className="text-xs text-slate-400">Landowner for {farm.title}</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Mobile:</span>
                  <span className="font-bold text-emerald-400">{farm.sellerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Location:</span>
                  <span className="text-slate-200 font-sans">{farm.village}, {farm.district}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={`tel:${farm.sellerPhone}`}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <Phone className="h-4 w-4" />
                  Call Directly
                </a>
                <a
                  href={`https://wa.me/${farm.sellerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hello ${farm.sellerName}, I saw your farm listing "${farm.title}" on AgriSahay Marketplace and I am interested in visiting.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
