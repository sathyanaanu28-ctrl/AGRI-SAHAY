import React, { useEffect, useState, useMemo } from 'react';
import { Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { FarmListing } from '../../types/farming';
import { formatIndianCurrency, getGoogleDirectionsUrl } from '../../utils/farmFormatters';
import { MapPin, Navigation, ExternalLink, Compass } from 'lucide-react';

interface FarmMapViewProps {
  farms: FarmListing[];
  selectedFarm?: FarmListing | null;
  onSelectFarm?: (farm: FarmListing) => void;
  onViewDetails?: (farm: FarmListing) => void;
  className?: string;
  zoom?: number;
  center?: { lat: number; lng: number };
}

// Inner component to handle map camera changes and bounds fitting
function MapController({
  selectedFarm,
  farms,
  center,
}: {
  selectedFarm?: FarmListing | null;
  farms: FarmListing[];
  center: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (selectedFarm && selectedFarm.latitude && selectedFarm.longitude) {
      map.panTo({ lat: selectedFarm.latitude, lng: selectedFarm.longitude });
      map.setZoom(13);
    } else if (farms.length > 1 && (window as any).google?.maps?.LatLngBounds) {
      const bounds = new (window as any).google.maps.LatLngBounds();
      let validCount = 0;
      farms.forEach((f) => {
        if (f.latitude && f.longitude) {
          bounds.extend({ lat: f.latitude, lng: f.longitude });
          validCount++;
        }
      });
      if (validCount > 1) {
        map.fitBounds(bounds, 50);
      } else if (validCount === 1) {
        const single = farms.find((f) => f.latitude && f.longitude);
        if (single) {
          map.panTo({ lat: single.latitude, lng: single.longitude });
          map.setZoom(12);
        }
      }
    } else if (farms.length === 1 && farms[0].latitude) {
      map.panTo({ lat: farms[0].latitude, lng: farms[0].longitude });
      map.setZoom(12);
    }
  }, [map, selectedFarm, farms]);

  return null;
}

export const FarmMapView: React.FC<FarmMapViewProps> = ({
  farms,
  selectedFarm,
  onSelectFarm,
  onViewDetails,
  className = 'h-[450px] w-full rounded-2xl overflow-hidden',
  zoom = 6,
  center = { lat: 19.7515, lng: 75.7139 }, // Central India default
}) => {
  const [activeFarm, setActiveFarm] = useState<FarmListing | null>(null);

  useEffect(() => {
    if (selectedFarm) {
      setActiveFarm(selectedFarm);
    }
  }, [selectedFarm]);

  const defaultCenter = useMemo(() => {
    if (selectedFarm && selectedFarm.latitude) {
      return { lat: selectedFarm.latitude, lng: selectedFarm.longitude };
    }
    if (farms.length > 0 && farms[0].latitude) {
      return { lat: farms[0].latitude, lng: farms[0].longitude };
    }
    return center;
  }, [selectedFarm, farms, center]);

  return (
    <div className={`relative ${className} bg-slate-900 border border-emerald-500/20 shadow-xl`}>
      <Map
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        defaultCenter={defaultCenter}
        defaultZoom={selectedFarm ? 13 : zoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={{ width: '100%', height: '100%' }}
      >
        <MapController selectedFarm={selectedFarm} farms={farms} center={center} />

        {farms.map((farm) => {
          if (!farm.latitude || !farm.longitude) return null;
          const isSelected = (selectedFarm && selectedFarm.id === farm.id) || (activeFarm && activeFarm.id === farm.id);

          return (
            <AdvancedMarker
              key={farm.id}
              position={{ lat: farm.latitude, lng: farm.longitude }}
              title={farm.title}
              onClick={() => {
                setActiveFarm(farm);
                if (onSelectFarm) onSelectFarm(farm);
              }}
              zIndex={isSelected ? 99 : 1}
            >
              <Pin
                background={isSelected ? '#10b981' : '#059669'}
                borderColor="#022c22"
                glyphColor="#ffffff"
                scale={isSelected ? 1.3 : 1.0}
              />
            </AdvancedMarker>
          );
        })}

        {activeFarm && activeFarm.latitude && activeFarm.longitude && (
          <InfoWindow
            position={{ lat: activeFarm.latitude, lng: activeFarm.longitude }}
            onCloseClick={() => setActiveFarm(null)}
            maxWidth={280}
          >
            <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl space-y-2 font-sans">
              {activeFarm.images && activeFarm.images[0] && (
                <img
                  src={activeFarm.images[0]}
                  alt={activeFarm.title}
                  className="w-full h-24 object-cover rounded-lg"
                />
              )}
              <div>
                <div className="text-emerald-400 font-extrabold text-sm">
                  {formatIndianCurrency(activeFarm.price)}{' '}
                  <span className="text-slate-400 text-xs font-normal">
                    ({activeFarm.landSizeAcres} Acres)
                  </span>
                </div>
                <div className="font-bold text-xs text-white truncate max-w-[240px]">
                  {activeFarm.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  📍 {activeFarm.village}, {activeFarm.district}
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(activeFarm)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    View Details
                  </button>
                )}
                <a
                  href={getGoogleDirectionsUrl(activeFarm.latitude, activeFarm.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-1 transition-colors"
                  title="Get Directions"
                >
                  <Navigation className="h-3 w-3" />
                  <span>Go</span>
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
};
