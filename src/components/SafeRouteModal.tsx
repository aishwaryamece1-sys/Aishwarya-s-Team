import React, { useState } from 'react';
import {
  Navigation,
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Route,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { SAFE_ROUTES } from '../data/demoData';

interface SafeRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafeRouteModal: React.FC<SafeRouteModalProps> = ({ isOpen, onClose }) => {
  const { safeRoute, setSafeRoute, calculateSafeRoute } = useRainShield();
  const [selectedRouteId, setSelectedRouteId] = useState(SAFE_ROUTES[0].id);

  if (!isOpen) return null;

  const currentRoute = SAFE_ROUTES.find(r => r.id === selectedRouteId) || SAFE_ROUTES[0];

  const handleApplyRoute = () => {
    setSafeRoute(currentRoute);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                Decision Support • Evacuation & Transit
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Calculate Safe Transit Route
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-800">
          {/* Preset Route Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Emergency Route Mission
            </label>
            <div className="space-y-2">
              {SAFE_ROUTES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                    selectedRouteId === r.id
                      ? 'bg-emerald-50/70 border-emerald-500 text-slate-900 shadow-sm ring-1 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between mb-1">
                    <span className="text-slate-900">{r.name}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {r.safetyScore}% Safe
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{r.originName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{r.destinationName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Route Metrics Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="text-[11px] text-slate-400 font-medium">Total Distance</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{currentRoute.distanceKm} km</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="text-[11px] text-slate-400 font-medium">Estimated ETA</div>
              <div className="text-sm font-bold text-emerald-700 mt-0.5 font-mono">{currentRoute.estimatedTimeMin} min</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="text-[11px] text-slate-400 font-medium">Flood Clearance</div>
              <div className="text-sm font-bold text-teal-700 mt-0.5 font-mono">&gt;{currentRoute.clearanceMarginMeters}m</div>
            </div>
          </div>

          {/* Avoided Flood Hotspots */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Inundation Sinks Avoided by Routing:</span>
            </div>
            <div className="space-y-1.5 text-slate-600 text-xs">
              {currentRoute.avoidedRiskZones.map((zone, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Bypassed: <strong>{zone}</strong> via elevated arterial bridge decks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyRoute}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Route className="w-3.5 h-3.5" />
            <span>Overlay Safe Route on GIS Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
