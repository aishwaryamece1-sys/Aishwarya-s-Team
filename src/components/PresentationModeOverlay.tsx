import React from 'react';
import {
  X,
  Play,
  Pause,
  Maximize2,
  CloudRain,
  Waves,
  ShieldAlert,
  Navigation,
  Sparkles,
  Radio,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { GISMap } from './GISMap';
import { ForecastTimeline } from './ForecastTimeline';

export const PresentationModeOverlay: React.FC = () => {
  const {
    isPresentationMode,
    exitPresentationMode,
    selectedLocation,
    currentTimeStep,
    currentRainfall,
    currentInundationZones,
    isPlayingEvolution,
    setIsPlayingEvolution,
    dataMode,
  } = useRainShield();

  if (!isPresentationMode) return null;

  const totalArea = currentInundationZones.reduce((acc, z) => acc + z.affectedAreaSqKm, 0).toFixed(1);
  const maxDepth = Math.max(...currentInundationZones.map(z => z.waterDepthMeters), 0).toFixed(2);
  const topRisk = currentInundationZones[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#050811] text-slate-100 flex flex-col p-4 md:p-6 overflow-hidden animate-in fade-in select-none">
      {/* Top Presentation Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-950/80 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
            <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white font-mono tracking-wider">
                RAINSHIELD COMMAND BRIEFING
              </span>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded font-bold">
                LIVE BRIEFING MODE
              </span>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                {dataMode}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Region: <strong className="text-slate-200">{selectedLocation.name}</strong> • Catchment: {selectedLocation.description}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlayingEvolution(!isPlayingEvolution)}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
              isPlayingEvolution
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
            }`}
          >
            {isPlayingEvolution ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlayingEvolution ? 'Pause Simulation' : 'Auto Play Event'}</span>
          </button>

          <button
            onClick={exitPresentationMode}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Exit Presentation Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Presentation Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Large GIS Map Stage */}
        <div className="lg:col-span-3 h-full flex flex-col min-h-0">
          <GISMap heightClass="flex-1 w-full" />
        </div>

        {/* Side Hazard Briefing Telemetry Panel */}
        <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
          {/* Key KPI Card */}
          <div className="p-4 rounded-xl bg-[#091124] border border-cyan-900/60 shadow-xl space-y-3">
            <div className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Event Telemetry ({currentTimeStep})</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#060b18] border border-slate-800">
                <div className="text-slate-400 text-[10px]">Precipitation Rate</div>
                <div className="text-base font-bold text-cyan-300">{currentRainfall.intensityMmHr} mm/h</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#060b18] border border-slate-800">
                <div className="text-slate-400 text-[10px]">Radar Reflectivity</div>
                <div className="text-base font-bold text-white">{currentRainfall.radarReflectivityDbz} dBZ</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#060b18] border border-slate-800">
                <div className="text-slate-400 text-[10px]">Max Water Depth</div>
                <div className="text-base font-bold text-sky-400">{maxDepth} m</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#060b18] border border-slate-800">
                <div className="text-slate-400 text-[10px]">Inundated Area</div>
                <div className="text-base font-bold text-amber-400">{totalArea} km²</div>
              </div>
            </div>
          </div>

          {/* Primary High-Risk Hotspot Card */}
          {topRisk && (
            <div className="p-4 rounded-xl bg-[#0e162b] border border-red-500/40 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider bg-red-950 px-2 py-0.5 rounded border border-red-800">
                  PRIORITY 1 CRITICAL ZONE
                </span>
                <span className="text-xs font-mono font-bold text-red-400">{topRisk.riskLevel}</span>
              </div>
              <div className="text-sm font-bold text-white">{topRisk.name}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{topRisk.explanation}</p>
            </div>
          )}

          {/* Emergency Operations Directives */}
          <div className="p-4 rounded-xl bg-[#091124] border border-slate-800 shadow-xl space-y-2 text-xs flex-1">
            <div className="font-bold text-slate-200 font-mono uppercase text-[11px] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recommended Tactical Actions</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
              <li>Deploy high-volume dewatering pumps to Bellandur lake intake.</li>
              <li>Barricade Outer Ring Road underpass service lanes.</li>
              <li>Divert emergency ambulance transfer to Manipal HAL.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Timeline */}
      <div className="mt-3 shrink-0">
        <ForecastTimeline />
      </div>
    </div>
  );
};
