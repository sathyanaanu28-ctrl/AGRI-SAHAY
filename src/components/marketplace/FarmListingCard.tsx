import React from 'react';
import { FarmListing } from '../../types/farming';
import {
  formatIndianCurrency,
  formatPerAcrePrice,
  getGoogleDirectionsUrl,
} from '../../utils/farmFormatters';
import {
  MapPin,
  Droplets,
  Layers,
  Sprout,
  Navigation,
  Eye,
  Compass,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface FarmListingCardProps {
  farm: FarmListing;
  onViewDetails: (farm: FarmListing) => void;
  onViewOnMap?: (farm: FarmListing) => void;
}

export const FarmListingCard: React.FC<FarmListingCardProps> = ({
  farm,
  onViewDetails,
  onViewOnMap,
}) => {
  const directionsUrl = getGoogleDirectionsUrl(farm.latitude, farm.longitude);

  return (
    <div className="group rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 p-4 sm:p-5 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/20 flex flex-col justify-between backdrop-blur-sm">
      {/* Top Media & Badges */}
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 aspect-[16/10]">
          <img
            src={farm.images[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'}
            alt={farm.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <span className="text-base font-black text-emerald-400 block leading-tight">
              {formatIndianCurrency(farm.price)}
            </span>
            <span className="text-[10px] text-slate-300 font-mono">
              {formatPerAcrePrice(farm.price, farm.landSizeAcres)}
            </span>
          </div>

          {/* Land Size Badge */}
          <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-white border border-slate-700 flex items-center gap-1 shadow-md">
            <Sprout className="h-3.5 w-3.5 text-emerald-400" />
            {farm.landSizeAcres} Acres
          </div>

          {farm.featured && (
            <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </div>
          )}
        </div>

        {/* Title & Location */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate font-medium">
              {farm.village}, {farm.district}, {farm.state}
            </span>
          </div>

          <h3
            onClick={() => onViewDetails(farm)}
            className="font-extrabold text-white text-base line-clamp-2 leading-snug cursor-pointer hover:text-emerald-300 transition-colors"
          >
            {farm.title}
          </h3>
        </div>

        {/* Specs Pills */}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950/40 p-2 rounded-xl">
            <Sprout className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{farm.cropType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950/40 p-2 rounded-xl">
            <Layers className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{farm.soilType.split('(')[0]}</span>
          </div>
        </div>

        {/* Water Source */}
        <div className="flex items-center gap-1.5 text-[11px] text-sky-300 bg-sky-950/20 border border-sky-500/20 px-2.5 py-1.5 rounded-xl">
          <Droplets className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <span className="truncate font-medium">{farm.waterAvailability}</span>
        </div>

        {/* Short description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {farm.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {onViewOnMap && (
            <button
              onClick={() => onViewOnMap(farm)}
              className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Compass className="h-3.5 w-3.5 text-emerald-400" />
              View on Map
            </button>
          )}

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Navigation className="h-3.5 w-3.5 text-sky-400" />
            Get Directions
          </a>
        </div>

        <button
          onClick={() => onViewDetails(farm)}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 active:scale-98"
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
