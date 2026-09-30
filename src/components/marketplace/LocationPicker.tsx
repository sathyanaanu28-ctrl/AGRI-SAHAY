import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { formatCoordinates } from '../../utils/farmFormatters';
import { MapPin, Search, Crosshair, AlertCircle, Check } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChangeLocation: (lat: number, lng: number, addressDetails?: { state?: string; district?: string; village?: string }) => void;
  defaultState?: string;
  defaultDistrict?: string;
}

// Quick Indian agricultural hub presets for fast 1-click location jumping
const AGRI_LOCATIONS = [
  { name: 'Baramati, Pune, Maharashtra', lat: 18.1524, lng: 74.5772, state: 'Maharashtra', district: 'Pune' },
  { name: 'Nakodar, Jalandhar, Punjab', lat: 31.1278, lng: 75.4722, state: 'Punjab', district: 'Jalandhar' },
  { name: 'Tenali, Guntur, Andhra Pradesh', lat: 16.2437, lng: 80.6405, state: 'Andhra Pradesh', district: 'Guntur' },
  { name: 'Pollachi, Coimbatore, Tamil Nadu', lat: 10.6609, lng: 77.0048, state: 'Tamil Nadu', district: 'Coimbatore' },
  { name: 'Gondal, Rajkot, Gujarat', lat: 21.9619, lng: 70.7937, state: 'Gujarat', district: 'Rajkot' },
  { name: 'Mandya, Karnataka', lat: 12.5244, lng: 76.8958, state: 'Karnataka', district: 'Mandya' },
  { name: 'Ludhiana, Punjab', lat: 30.9010, lng: 75.8573, state: 'Punjab', district: 'Ludhiana' },
  { name: 'Nashik, Maharashtra', lat: 19.9975, lng: 73.7898, state: 'Maharashtra', district: 'Nashik' },
];

function LocationMapController({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (map && latitude && longitude) {
      map.panTo({ lat: latitude, lng: longitude });
    }
  }, [map, latitude, longitude]);

  return null;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onChangeLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const geocodingLib = useMapsLibrary('geocoding');

  const currentPos = useMemo(() => {
    return {
      lat: latitude || 19.7515,
      lng: longitude || 75.7139,
    };
  }, [latitude, longitude]);

  // Reverse Geocoding helper
  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (!geocodingLib && !(window as any).google?.maps?.Geocoder) return;

      const GeocoderClass = geocodingLib ? geocodingLib.Geocoder : (window as any).google.maps.Geocoder;
      const geocoder = new GeocoderClass();

      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          let state = '';
          let district = '';
          let village = '';

          results[0].address_components?.forEach((comp: any) => {
            if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
            if (comp.types.includes('administrative_area_level_2')) district = comp.long_name;
            if (comp.types.includes('locality') || comp.types.includes('sublocality')) village = comp.long_name;
          });

          onChangeLocation(lat, lng, { state, district, village });
        }
      });
    },
    [geocodingLib, onChangeLocation]
  );

  const handleMapClick = (e: any) => {
    const latLng = e.detail?.latLng;
    if (!latLng) return;
    const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
    onChangeLocation(lat, lng);
    reverseGeocode(lat, lng);
  };

  const handleMarkerDragEnd = (e: any) => {
    if (!e.latLng) return;
    const lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
    const lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
    onChangeLocation(lat, lng);
    reverseGeocode(lat, lng);
  };

  // Search Location
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setErrorMsg(null);

    // Check presets first
    const matchedPreset = AGRI_LOCATIONS.find((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchedPreset) {
      onChangeLocation(matchedPreset.lat, matchedPreset.lng, {
        state: matchedPreset.state,
        district: matchedPreset.district,
      });
      return;
    }

    if (geocodingLib || (window as any).google?.maps?.Geocoder) {
      const GeocoderClass = geocodingLib ? geocodingLib.Geocoder : (window as any).google.maps.Geocoder;
      const geocoder = new GeocoderClass();

      geocoder.geocode({ address: searchQuery + ', India' }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          onChangeLocation(lat, lng);
          reverseGeocode(lat, lng);
        } else {
          setErrorMsg('Location not found. Try searching a district or clicking directly on the map.');
        }
      });
    }
  };

  // GPS Device Location
  const handleUseDeviceLocation = () => {
    setErrorMsg(null);
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onChangeLocation(lat, lng);
        reverseGeocode(lat, lng);
      },
      () => {
        setIsLocating(false);
        setErrorMsg('Location permission denied or unavailable. Click on the map to place the farm pin.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-emerald-400" />
            Set Farm Location on Map *
          </label>
          <span className="text-[11px] text-slate-400 block">
            Click anywhere on the map or drag the pin to set the exact farm entrance.
          </span>
        </div>

        {/* Current coordinates display */}
        {latitude && longitude ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            {formatCoordinates(latitude, longitude)}
          </div>
        ) : null}
      </div>

      {/* Location Search & GPS button */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search town, district, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Find
          </button>
        </form>

        <button
          type="button"
          onClick={handleUseDeviceLocation}
          disabled={isLocating}
          className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              Locating...
            </>
          ) : (
            <>
              <Crosshair className="h-3.5 w-3.5 text-emerald-400" />
              My Current Location
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Location Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] text-slate-500 font-semibold uppercase">Popular Hubs:</span>
        {AGRI_LOCATIONS.slice(0, 4).map((loc, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              onChangeLocation(loc.lat, loc.lng, { state: loc.state, district: loc.district });
            }}
            className="px-2 py-0.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 hover:text-emerald-300 transition-colors"
          >
            {loc.name.split(',')[0]}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative h-64 w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={currentPos}
          defaultZoom={latitude && longitude ? 13 : 6}
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
          onClick={handleMapClick}
        >
          <LocationMapController latitude={latitude} longitude={longitude} />
          {latitude && longitude ? (
            <AdvancedMarker
              position={{ lat: latitude, lng: longitude }}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              title="Drag to adjust farm location"
            >
              <Pin background="#10b981" borderColor="#022c22" glyphColor="#ffffff" scale={1.2} />
            </AdvancedMarker>
          ) : null}
        </Map>

        <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-300 border border-slate-700 pointer-events-none">
          📍 Drag marker or click on map to position
        </div>
      </div>
    </div>
  );
};
