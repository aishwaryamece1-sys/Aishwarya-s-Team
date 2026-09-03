import React from 'react';
import {
  ShieldAlert,
  X,
  CloudRain,
  Waves,
  Mountain,
  Droplets,
  History,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { RiskLevel } from '../types';

export const RiskZoneDetailModal: React.FC = () => {
  const {
    selectedRiskZone,
    setSelectedRiskZone,
    currentTimeStep,
    currentRainfall,
    dataMode,
  } = useRainShield();

  if (!selectedRiskZone) return null;

  const getRiskBadgeColor = (level: RiskLevel) => {
    switch (level) {
      case 'EXTREME': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'VERY_HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'HIGH': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MODERATE': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const factorsList = [
    {
      label: 'Precipitation Intensity',
      score: selectedRiskZone.factors.rainfallIntensity,
      value: `${currentRainfall.intensityMmHr} mm/hr`,
      icon: CloudRain,
      desc: 'Short-duration convective rainfall rate exceeding infiltration capacity',
    },
    {
      label: 'Rainfall Accumulation (3h)',
      score: selectedRiskZone.factors.accumulation,
      value: `${currentRainfall.accumulatedMm} mm`,
      icon: Droplets,
      desc: 'Cumulative watershed surface runoff entering catchment sink',
    },
    {
      label: 'Terrain Vulnerability (Slope)',
      score: selectedRiskZone.factors.terrainVulnerability,
      value: `${selectedRiskZone.terrainSlopeDeg}° slope`,
      icon: Mountain,
      desc: 'Depression basin with low hydraulic elevation gradient (sink effect)',
    },
    {
      label: 'Drainage Network Deficit',
      score: selectedRiskZone.factors.drainageDeficit,
      value: `${selectedRiskZone.drainageCapacityPct}% capacity`,
      icon: Waves,
      desc: 'Primary storm conduit (Rajakaluve) backflow & culvert choke',
    },
    {
      label: 'Historical Flooding Tendency',
      score: selectedRiskZone.factors.historicalTendency,
      value: `${selectedRiskZone.historicalFloodsCount} events`,
      icon: History,
      desc: 'Bayesian prior weighting based on 15-year urban flood catalog',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                <span>Bayesian Hazard Attribution</span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                  {dataMode} ANALYSIS
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Why this area is at risk
              </h2>
            </div>
          </div>

          <button
            onClick={() => setSelectedRiskZone(null)}
            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
          {/* Target Zone Overview */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-base font-bold text-slate-900">{selectedRiskZone.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Neighborhood: {selectedRiskZone.neighborhood} • Catchment Area: {selectedRiskZone.affectedAreaSqKm} km²
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskBadgeColor(selectedRiskZone.riskLevel)}`}>
                {selectedRiskZone.riskLevel} RISK
              </span>
              <div className="px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200 font-mono">
                🌊 {selectedRiskZone.waterDepthMeters}m Depth
              </div>
            </div>
          </div>

          {/* AI Evidence-Based Attribution Explanation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Multi-Factor Scientific Synthesis:</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              &ldquo;{selectedRiskZone.explanation}&rdquo;
            </p>
          </div>

          {/* Factor Contribution Bar Meters */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Factor Contribution Weighting (0 - 100 Scale)
            </div>

            {factorsList.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <Icon className="w-4 h-4 text-emerald-600" />
                      <span>{f.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-500 text-[11px]">{f.value}</span>
                      <span className="font-bold text-slate-900">{f.score}/100</span>
                    </div>
                  </div>

                  {/* Meter Bar */}
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        f.score > 80 ? 'bg-rose-500' : f.score > 60 ? 'bg-orange-500' : f.score > 40 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 italic">{f.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Critical Assets In Jeopardy */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-amber-600" />
              <span>Nearby Critical Infrastructure Overlap:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedRiskZone.criticalAssetsNearby.map((asset, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 text-xs font-medium shadow-2xs"
                >
                  📍 {asset}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Model: <span className="text-slate-800 font-semibold">RainShield RiskEngine v2.4</span> • Horizon: <span className="text-emerald-700 font-bold">{currentTimeStep}</span>
          </div>
          <button
            onClick={() => setSelectedRiskZone(null)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-colors"
          >
            Close Drill-Down
          </button>
        </div>
      </div>
    </div>
  );
};
