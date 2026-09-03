import React from 'react';
import {
  Waves,
  Activity,
  Layers,
  Sparkles,
  Droplets,
  Mountain,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { GISMap } from '../components/GISMap';
import { ForecastTimeline } from '../components/ForecastTimeline';
import { RiskZoneDetailModal } from '../components/RiskZoneDetailModal';
import { InundationZone, RiskLevel } from '../types';

export const InundationPage: React.FC = () => {
  const {
    selectedLocation,
    currentTimeStep,
    currentInundationZones,
    setSelectedRiskZone,
    dataMode,
  } = useRainShield();

  const totalArea = currentInundationZones.reduce((acc, z) => acc + z.affectedAreaSqKm, 0).toFixed(1);
  const maxDepth = Math.max(...currentInundationZones.map(z => z.waterDepthMeters), 0).toFixed(2);
  const totalVolumeMcm = (parseFloat(totalArea) * parseFloat(maxDepth) * 0.45).toFixed(2);

  const getRiskBadgeColor = (level: RiskLevel) => {
    switch (level) {
      case 'EXTREME': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'VERY_HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'HIGH': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MODERATE': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1700px] mx-auto w-full select-none text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Waves className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
              2D Hydrodynamic Inundation & Overland Spread
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {selectedLocation.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            2D shallow water Saint-Venant hydraulic solver over 5m LiDAR DEM + stormwater conduit network.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-200">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Active Simulation Horizon: <strong className="text-slate-900">{currentTimeStep}</strong></span>
        </div>
      </div>

      {/* Hydraulic Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Maximum Depth</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">{maxDepth} m</div>
          <div className="text-[11px] text-slate-500 mt-1">Bellandur Lake Spillway</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Inundated Footprint</div>
          <div className="text-2xl font-bold text-amber-600 mt-0.5 font-mono">{totalArea} km²</div>
          <div className="text-[11px] text-slate-500 mt-1">Simulated Flood Extent</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Estimated Water Vol.</div>
          <div className="text-2xl font-bold text-teal-600 mt-0.5 font-mono">{totalVolumeMcm} MCM</div>
          <div className="text-[11px] text-slate-500 mt-1">Million Cubic Meters</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Drainage Deficit</div>
          <div className="text-2xl font-bold text-rose-600 mt-0.5 font-mono">68%</div>
          <div className="text-[11px] text-slate-500 mt-1">Conduit Choke Factor</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-slate-400 text-[11px] font-medium">Peak Rate of Rise</div>
          <div className="text-2xl font-bold text-rose-600 mt-0.5 font-mono">3.8 cm/min</div>
          <div className="text-[11px] text-slate-500 mt-1">Fast Inundation Velocity</div>
        </div>
      </div>

      {/* Main Map + Timeline Stage */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Interactive 2D Depth Polygon & Velocity Vector Overlay</span>
          </div>
          {/* Depth Color Legend */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Depth Ramp:</span>
            <div className="flex items-center gap-1 text-[11px] font-semibold">
              <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">0.2m</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">0.5m</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">1.0m</span>
              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">1.5m</span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">2.0m+</span>
            </div>
          </div>
        </div>

        <GISMap heightClass="h-[480px] w-full" />
        <ForecastTimeline />
      </div>

      {/* Hotspots Priority Ranking Table */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>High Risk Inundation Zones & Catchment Sinks ({currentInundationZones.length})</span>
          </div>
          <span className="text-xs text-slate-500">Click row for Bayesian Attribution</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-3">Catchment Hotspot</th>
                <th className="py-2.5 px-3">Water Depth</th>
                <th className="py-2.5 px-3">Flood Area</th>
                <th className="py-2.5 px-3">Drainage Capacity</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Historical Floods</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentInundationZones.map(zone => (
                <tr
                  key={zone.id}
                  onClick={() => setSelectedRiskZone(zone)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-semibold text-slate-900 font-sans">
                    <div>{zone.name}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{zone.neighborhood}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{zone.waterDepthMeters} m</td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{zone.affectedAreaSqKm} km²</td>
                  <td className="py-3 px-3 text-amber-600 font-mono font-semibold">{zone.drainageCapacityPct}%</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRiskBadgeColor(zone.riskLevel)}`}>
                      {zone.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{zone.historicalFloodsCount} recorded</td>
                  <td className="py-3 px-3">
                    <button className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1">
                      <span>Why at Risk?</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RiskZoneDetailModal />
    </div>
  );
};
