import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap as useGoogleMap,
} from '@vis.gl/react-google-maps';
import L from 'leaflet';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Crosshair,
  MapPin,
  ShieldAlert,
  Key,
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Eye,
  Settings2,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { InundationZone, InfrastructureAsset, HistoricalDisasterCaseStudy } from '../types';
import { VERIFIED_HISTORICAL_DISASTER_CASES } from '../services/historicalDataService';
import { LocationService } from '../services/locationService';

interface GISMapProps {
  heightClass?: string;
  onSelectZone?: (zone: InundationZone) => void;
  onSelectAsset?: (asset: InfrastructureAsset) => void;
  showLayerPanel?: boolean;
}

// Helper to check if a string matches a plausible Google Maps API Key
function isValidGoogleMapsApiKey(key?: string | null): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (!trimmed) return false;
  if (
    trimmed === 'YOUR_GOOGLE_MAPS_API_KEY' ||
    trimmed.includes('YOUR_') ||
    trimmed.includes('PLACEHOLDER') ||
    trimmed.length < 25
  ) {
    return false;
  }
  // Google API keys typically start with AIza
  return trimmed.startsWith('AIza');
}

// Inner Controller component for Google Map instance
const GoogleMapController: React.FC<{
  centerLat: number;
  centerLng: number;
  zoom: number;
  mapType: string;
}> = ({ centerLat, centerLng, zoom, mapType }) => {
  const map = useGoogleMap();

  useEffect(() => {
    if (!map) return;
    map.panTo({ lat: centerLat, lng: centerLng });
  }, [map, centerLat, centerLng]);

  useEffect(() => {
    if (!map) return;
    map.setMapTypeId(mapType as any);
  }, [map, mapType]);

  return null;
};

export const GISMap: React.FC<GISMapProps> = ({
  heightClass = 'h-[580px] lg:h-[680px]',
  onSelectZone,
  onSelectAsset,
  showLayerPanel = true,
}) => {
  const {
    selectedLocation,
    currentTimeStep,
    layers,
    toggleLayer,
    setLayerOpacity,
    currentInundationZones,
    infrastructureAssets,
    setSelectedRiskZone,
    setSelectedAsset,
    safeRoute,
    currentRainfall,
    dataMode,
    realWeatherData,
    riskAssessment,
    handleSelectGeocodedLocation,
    addToast,
  } = useRainShield();

  // API Key handling (Env variable + local storage override option)
  const [apiKey, setApiKey] = useState<string>(() => {
    const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    if (isValidGoogleMapsApiKey(envKey)) return envKey.trim();
    const localKey = localStorage.getItem('rainshield_gmp_key');
    if (isValidGoogleMapsApiKey(localKey)) return localKey.trim();
    return '';
  });

  const [authError, setAuthError] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<string>('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [leafletLayerType, setLeafletLayerType] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [showTargetInfo, setShowTargetInfo] = useState(true);
  const [selectedHistoricalCase, setSelectedHistoricalCase] = useState<HistoricalDisasterCaseStudy | null>(null);

  // Dynamic layer toggles
  const [showHistoricalMarkers, setShowHistoricalMarkers] = useState(true);
  const [showRadarOverlay, setShowRadarOverlay] = useState(true);

  // Leaflet DOM ref & instance
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletLayersRef = useRef<{ [key: string]: L.LayerGroup | L.TileLayer }>({});
  const targetMarkerRef = useRef<L.Marker | null>(null);

  // Catch Google Maps InvalidKeyMapError globally to prevent broken UI
  useEffect(() => {
    const originalGmAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps Authentication Failed (InvalidKeyMapError). Switching to interactive fallback GIS map.');
      setAuthError(true);
      if (originalGmAuthFailure) {
        try {
          originalGmAuthFailure();
        } catch {
          // Ignore
        }
      }
    };
    return () => {
      (window as any).gm_authFailure = originalGmAuthFailure;
    };
  }, []);

  const saveCustomKey = (keyToSave: string) => {
    const trimmed = keyToSave.trim();
    if (isValidGoogleMapsApiKey(trimmed)) {
      localStorage.setItem('rainshield_gmp_key', trimmed);
      setApiKey(trimmed);
      setAuthError(false);
      setIsKeyModalOpen(false);
      addToast('Google Maps Key Activated', 'Google Maps JavaScript API loaded successfully.', 'success');
    } else {
      addToast('Invalid Key Format', 'Please enter a valid Google Maps API Key starting with AIza...', 'warning');
    }
  };

  // Map click reverse geocoding
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      try {
        const geo = await LocationService.reverseGeocode(lat, lng);
        handleSelectGeocodedLocation(geo);
        addToast('Location Updated', `Target set to ${geo.name}`, 'info');
      } catch (err) {
        console.error('Reverse geocode on map click failed:', err);
      }
    },
    [handleSelectGeocodedLocation, addToast]
  );

  // Marker pin colors based on risk
  const getRiskPinColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'EXTREME':
        return { background: '#ef4444', glyph: '#ffffff', border: '#b91c1c', hex: '#ef4444' };
      case 'HIGH':
        return { background: '#f97316', glyph: '#ffffff', border: '#c2410c', hex: '#f97316' };
      case 'MODERATE':
        return { background: '#0284c7', glyph: '#ffffff', border: '#0369a1', hex: '#0284c7' };
      default:
        return { background: '#10b981', glyph: '#ffffff', border: '#047857', hex: '#10b981' };
    }
  };

  const riskPinColors = getRiskPinColor(riskAssessment?.riskLevel);
  const useGoogleMapsEngine = Boolean(apiKey && isValidGoogleMapsApiKey(apiKey) && !authError);

  // --- LEAFLET INITIALIZATION & UPDATES ---
  useEffect(() => {
    if (useGoogleMapsEngine) {
      // Destroy leaflet map if active
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      return;
    }

    if (!leafletContainerRef.current) return;

    // Initialize Leaflet if not present
    if (!leafletMapRef.current) {
      const map = L.map(leafletContainerRef.current, {
        center: [selectedLocation.lat, selectedLocation.lng],
        zoom: selectedLocation.zoom || 12,
        zoomControl: false,
        attributionControl: true,
      });

      // Click event for reverse geocoding
      map.on('click', (e: L.LeafletMouseEvent) => {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      });

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    if (!map) return;

    // Remove existing tile layer
    if (leafletLayersRef.current['tileLayer']) {
      map.removeLayer(leafletLayersRef.current['tileLayer']);
    }

    // Add selected Tile Layer
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    if (leafletLayerType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (leafletLayerType === 'terrain') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution,
    }).addTo(map);
    leafletLayersRef.current['tileLayer'] = tileLayer;

    // Pan / zoom to current selected location
    map.setView([selectedLocation.lat, selectedLocation.lng], selectedLocation.zoom || 12);

    // Update or create Target Location Marker
    if (targetMarkerRef.current) {
      map.removeLayer(targetMarkerRef.current);
    }

    const targetIcon = L.divIcon({
      className: 'custom-target-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2 rounded-full animate-ping opacity-40" style="background-color: ${riskPinColors.hex};"></div>
          <div class="w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs" style="background-color: ${riskPinColors.hex};">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([selectedLocation.lat, selectedLocation.lng], { icon: targetIcon }).addTo(map);
    marker.bindPopup(`
      <div class="p-1 text-slate-800 text-xs space-y-1">
        <div class="font-bold text-sm text-slate-900">${selectedLocation.name}</div>
        <div class="text-[11px] text-slate-500">${selectedLocation.displayName || `${selectedLocation.state}, ${selectedLocation.country}`}</div>
        <div class="text-[10px] font-mono text-slate-600">Lat: ${selectedLocation.lat.toFixed(4)}°, Lng: ${selectedLocation.lng.toFixed(4)}°</div>
        ${
          riskAssessment
            ? `<div class="rounded px-2 py-0.5 mt-1 font-semibold text-[10px] inline-block" style="background-color: ${riskPinColors.hex}20; color: ${riskPinColors.hex};">
                Risk: ${riskAssessment.riskLevel} (${riskAssessment.overallScore}/100)
              </div>`
            : ''
        }
      </div>
    `);
    targetMarkerRef.current = marker;

    // Overlay Inundation Zones
    if (leafletLayersRef.current['inundationZones']) {
      map.removeLayer(leafletLayersRef.current['inundationZones']);
    }
    const zoneGroup = L.layerGroup();
    if (layers.find((l) => l.id === 'inundation_zones')?.visible) {
      currentInundationZones.forEach((zone) => {
        const color =
          zone.riskLevel === 'EXTREME'
            ? '#ef4444'
            : zone.riskLevel === 'HIGH'
            ? '#f97316'
            : zone.riskLevel === 'MODERATE'
            ? '#0284c7'
            : '#10b981';

        const poly = L.polygon(zone.coordinates, {
          color,
          fillColor: color,
          fillOpacity: (layers.find((l) => l.id === 'inundation_zones')?.opacity || 60) / 100,
          weight: 2,
        }).addTo(zoneGroup);

        poly.bindPopup(`
          <div class="p-1 text-xs">
            <strong class="text-slate-900">${zone.name}</strong><br/>
            <span class="text-slate-600">Depth: ${zone.depthMeters}m | Severity: ${zone.severity}</span>
          </div>
        `);
      });
    }
    zoneGroup.addTo(map);
    leafletLayersRef.current['inundationZones'] = zoneGroup;

    // Overlay Historical Case Study Markers
    if (leafletLayersRef.current['historicalCases']) {
      map.removeLayer(leafletLayersRef.current['historicalCases']);
    }
    const histGroup = L.layerGroup();
    if (showHistoricalMarkers) {
      VERIFIED_HISTORICAL_DISASTER_CASES.forEach((ev) => {
        const histIcon = L.divIcon({
          className: 'custom-hist-marker',
          html: `
            <div class="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
              ★
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const hMarker = L.marker([ev.centerCoords[0], ev.centerCoords[1]], { icon: histIcon }).addTo(histGroup);
        hMarker.bindPopup(`
          <div class="p-1 text-xs max-w-xs space-y-1">
            <div class="font-bold text-amber-900">${ev.eventName}</div>
            <div class="text-[10px] text-slate-500">${ev.dateRange} • ${ev.region}</div>
            <div class="bg-amber-50 p-1.5 rounded text-[10px] text-amber-800">
              <strong>Peak Rainfall:</strong> ${ev.peakPrecipitation}<br/>
              <strong>Fatalities:</strong> ${ev.fatalities}<br/>
              <strong>Impact:</strong> ${ev.affectedPopulation}
            </div>
          </div>
        `);
      });
    }
    histGroup.addTo(map);
    leafletLayersRef.current['historicalCases'] = histGroup;

    // Cleanup on unmount
    return () => {
      // Map stays until component unmounts
    };
  }, [
    useGoogleMapsEngine,
    selectedLocation,
    leafletLayerType,
    layers,
    currentInundationZones,
    showHistoricalMarkers,
    riskPinColors,
    riskAssessment,
    handleMapClick,
  ]);

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-slate-700 shadow-md bg-slate-950 flex flex-col ${heightClass} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : ''
      }`}
    >
      {/* 1. GOOGLE MAPS ENGINE (When valid key is present) */}
      {useGoogleMapsEngine && (
        <APIProvider apiKey={apiKey} libraries={['places', 'marker', 'geometry']}>
          <div className="w-full h-full relative">
            <GoogleMap
              mapId="DEMO_MAP_ID"
              defaultCenter={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              defaultZoom={selectedLocation.zoom || 12}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              mapTypeControl={false}
              streetViewControl={false}
              fullscreenControl={false}
              zoomControl={false}
              onClick={(e) => {
                if (e.detail?.latLng) {
                  handleMapClick(e.detail.latLng.lat, e.detail.latLng.lng);
                }
              }}
              className="w-full h-full"
            >
              <GoogleMapController
                centerLat={selectedLocation.lat}
                centerLng={selectedLocation.lng}
                zoom={selectedLocation.zoom || 12}
                mapType={mapType}
              />

              {/* Target Location Primary Marker */}
              <AdvancedMarker
                position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                onClick={() => setShowTargetInfo(!showTargetInfo)}
                title={selectedLocation.name}
              >
                <div className="relative cursor-pointer group">
                  <div
                    className="absolute -inset-2 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: riskPinColors.background }}
                  />
                  <Pin
                    background={riskPinColors.background}
                    glyphColor={riskPinColors.glyph}
                    borderColor={riskPinColors.border}
                    scale={1.2}
                  />
                </div>
              </AdvancedMarker>

              {/* Target Location Info Window */}
              {showTargetInfo && (
                <InfoWindow
                  position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  onCloseClick={() => setShowTargetInfo(false)}
                  headerContent={
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedLocation.name}</span>
                    </div>
                  }
                >
                  <div className="p-1 max-w-xs text-slate-800 text-[11px] space-y-1.5">
                    <div className="text-[10px] text-slate-500 font-mono">
                      Lat: {selectedLocation.lat.toFixed(4)}°, Lng: {selectedLocation.lng.toFixed(4)}°
                    </div>
                    {selectedLocation.displayName && (
                      <div className="text-[10px] text-slate-600 line-clamp-2">
                        {selectedLocation.displayName}
                      </div>
                    )}
                    {riskAssessment && (
                      <div
                        className="rounded px-2 py-1 font-semibold text-[11px] flex items-center justify-between"
                        style={{
                          backgroundColor: `${riskPinColors.background}15`,
                          color: riskPinColors.background,
                          border: `1px solid ${riskPinColors.background}40`,
                        }}
                      >
                        <span>Risk: {riskAssessment.riskLevel}</span>
                        <span className="font-mono font-bold">{riskAssessment.overallScore}/100</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-200 pt-1">
                      <span>Live Rainfall:</span>
                      <strong className="text-slate-900 font-mono">
                        {realWeatherData ? `${realWeatherData.current.precipitationMm} mm/h` : '0 mm/h'}
                      </strong>
                    </div>
                  </div>
                </InfoWindow>
              )}

              {/* Historical Disaster Case Study Markers */}
              {showHistoricalMarkers &&
                VERIFIED_HISTORICAL_DISASTER_CASES.map((ev) => (
                  <AdvancedMarker
                    key={ev.id}
                    position={{ lat: ev.centerCoords[0], lng: ev.centerCoords[1] }}
                    onClick={() => setSelectedHistoricalCase(ev)}
                    title={ev.eventName}
                  >
                    <div className="cursor-pointer transition-transform hover:scale-110">
                      <Pin background="#475569" glyphColor="#f59e0b" borderColor="#d97706" scale={0.9} />
                    </div>
                  </AdvancedMarker>
                ))}

              {/* Historical Disaster InfoWindow */}
              {selectedHistoricalCase && (
                <InfoWindow
                  position={{
                    lat: selectedHistoricalCase.centerCoords[0],
                    lng: selectedHistoricalCase.centerCoords[1],
                  }}
                  onCloseClick={() => setSelectedHistoricalCase(null)}
                  headerContent={
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider font-mono">
                      Historical Flood Case Study
                    </div>
                  }
                >
                  <div className="p-1 max-w-xs text-slate-800 text-[11px] space-y-1.5">
                    <div className="font-bold text-xs text-slate-900">{selectedHistoricalCase.eventName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {selectedHistoricalCase.dateRange} • {selectedHistoricalCase.region}, {selectedHistoricalCase.country}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded p-1.5 text-[10px] text-amber-900 space-y-0.5">
                      <div>
                        <strong>Peak Rainfall:</strong> {selectedHistoricalCase.peakPrecipitation}
                      </div>
                      <div>
                        <strong>Fatalities:</strong> {selectedHistoricalCase.fatalities}
                      </div>
                      <div>
                        <strong>Impact:</strong> {selectedHistoricalCase.affectedPopulation}
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-500 italic border-t border-slate-200 pt-1">
                      Source: {selectedHistoricalCase.authoritativeSources[0]}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        </APIProvider>
      )}

      {/* 2. LEAFLET INTERACTIVE GIS ENGINE (Default & Safe Fallback) */}
      {!useGoogleMapsEngine && (
        <div className="w-full h-full relative">
          <div ref={leafletContainerRef} className="w-full h-full z-0" />
        </div>
      )}

      {/* Floating Header / Status Indicator (Top-Left) */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg px-2.5 py-1.5 shadow-lg flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-200">
            {useGoogleMapsEngine ? 'Google Maps JS Engine' : 'Interactive GIS Engine'}
          </span>
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 underline ml-1 flex items-center gap-1"
          >
            <Key className="w-3 h-3" />
            {useGoogleMapsEngine ? 'Configured' : 'Connect GMP Key'}
          </button>
        </div>
      </div>

      {/* Floating Control Bar (Top-Right) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {/* Map Type Switcher */}
        {useGoogleMapsEngine ? (
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-0.5 flex text-[11px] font-semibold text-slate-300 shadow-lg">
            {(['roadmap', 'satellite', 'hybrid', 'terrain'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMapType(type)}
                className={`px-2 py-1 rounded capitalize transition-colors ${
                  mapType === type ? 'bg-emerald-600 text-white' : 'hover:text-white hover:bg-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-0.5 flex text-[11px] font-semibold text-slate-300 shadow-lg">
            {(['streets', 'satellite', 'terrain'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setLeafletLayerType(type)}
                className={`px-2 py-1 rounded capitalize transition-colors ${
                  leafletLayerType === type ? 'bg-emerald-600 text-white' : 'hover:text-white hover:bg-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* Layer Toggle */}
        <button
          onClick={() => setIsLayersOpen(!isLayersOpen)}
          className={`p-2 rounded-lg border text-xs font-semibold shadow-lg backdrop-blur-md transition-colors flex items-center gap-1.5 ${
            isLayersOpen
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
          title="Map Layers & Overlays"
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Layers</span>
        </button>

        {/* Recenter Button */}
        <button
          onClick={() => {
            if (leafletMapRef.current) {
              leafletMapRef.current.setView([selectedLocation.lat, selectedLocation.lng], selectedLocation.zoom || 12);
            }
            setShowTargetInfo(true);
            addToast('Map Centered', `Targeted focus on ${selectedLocation.name}`, 'info');
          }}
          className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-lg backdrop-blur-md transition-colors"
          title="Center on Target Location"
        >
          <Crosshair className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-lg backdrop-blur-md transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Instructions Pill (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg px-3 py-1.5 shadow-lg text-[11px] text-slate-300 flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Click anywhere on the map to update target coordinates</span>
      </div>

      {/* Layers Panel Drawer */}
      {isLayersOpen && (
        <div className="absolute top-14 right-3 z-30 w-64 bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-3 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-white">Map Layers</span>
            <button
              onClick={() => setIsLayersOpen(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Target Pin & Info
              </span>
              <input
                type="checkbox"
                checked={showTargetInfo}
                onChange={(e) => setShowTargetInfo(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Inundation Risk Zones
              </span>
              <input
                type="checkbox"
                checked={layers.find((l) => l.id === 'inundation_zones')?.visible ?? true}
                onChange={() => toggleLayer('inundation_zones')}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Historical Flood Cases
              </span>
              <input
                type="checkbox"
                checked={showHistoricalMarkers}
                onChange={(e) => setShowHistoricalMarkers(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
            </label>
          </div>
        </div>
      )}

      {/* Legend (Bottom-Right) */}
      <div className="absolute bottom-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-2.5 shadow-lg text-[10px] space-y-1.5 hidden sm:block">
        <div className="font-bold text-white mb-1">Risk Scale</div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Low Risk (0-25)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span>Moderate Risk (26-50)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>High Risk (51-75)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Extreme Risk (76-100)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 pt-1 border-t border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-amber-400" />
          <span>Historical Disaster Case</span>
        </div>
      </div>

      {/* Google Maps API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                Google Maps Platform Key
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Connect your Google Maps Platform API key for native Google Maps JavaScript satellite tiles, Places Autocomplete, and advanced 3D markers.
            </p>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5">
              <div className="font-semibold text-emerald-400">Quick Developer Access:</div>
              <p className="text-slate-400 text-[11px]">
                You can generate a free prototyping key with zero credit card setup from the official Maps Demo Key flow:
              </p>
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-semibold underline text-xs pt-1"
              >
                Generate Free Demo Key <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 font-medium block">Paste API Key:</label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => saveCustomKey(inputKey)}
                disabled={!inputKey.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold shadow-md transition-colors"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
