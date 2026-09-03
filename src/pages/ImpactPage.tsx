import React, { useState } from 'react';
import {
  Navigation,
  Activity,
  AlertTriangle,
  Building,
  Route,
  Search,
  Download,
  Filter,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { GISMap } from '../components/GISMap';
import { SafeRouteModal } from '../components/SafeRouteModal';
import { InfrastructureAsset, AssetType, RiskLevel } from '../types';

export const ImpactPage: React.FC = () => {
  const {
    infrastructureAssets,
    selectedLocation,
    currentTimeStep,
    setSelectedAsset,
    selectedAsset,
    addToast,
  } = useRainShield();

  const [activeTypeFilter, setActiveTypeFilter] = useState<AssetType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSafeRouteModalOpen, setIsSafeRouteModalOpen] = useState(false);

  const filteredAssets = infrastructureAssets.filter(asset => {
    const matchesType = activeTypeFilter === 'ALL' || asset.type.toUpperCase() === activeTypeFilter.toUpperCase();
    const loc = asset.locationName || asset.address || '';
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getRiskBadgeColor = (level: RiskLevel) => {
    switch (level) {
      case 'EXTREME': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'VERY_HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'HIGH': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MODERATE': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Type,Location,Latitude,Longitude,RiskLevel,FloodDepth_m,AccessStatus,Advisory\n';
    const rows = filteredAssets
      .map(
        a =>
          `"${a.id}","${a.name}","${a.type}","${a.locationName || a.address || ''}",${a.lat},${a.lng},"${a.riskLevel}",${a.waterDepthMeters ?? a.predictedDepthM ?? 0},"${a.accessStatus || a.status || 'OPERATIONAL'}","${(a.advisory || a.notes || '').replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `RainShield_${selectedLocation.id}_Infrastructure_Impact_${currentTimeStep}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Impact CSV Exported', `Exported ${filteredAssets.length} infrastructure records for GIS dispatch.`, 'success');
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1700px] mx-auto w-full select-none text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Navigation className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
              Critical Infrastructure & Vulnerability Analytics
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {selectedLocation.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Overland inundation exposure for transport arteries, medical trauma centers, and emergency power utilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSafeRouteModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Route className="w-4 h-4" />
            <span>Calculate Safe Transit Route</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Asset CSV</span>
          </button>
        </div>
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Inundated Roads</div>
          <div className="text-2xl font-bold text-rose-600 mt-0.5 font-mono">3 Corridors</div>
          <div className="text-[11px] text-slate-500 mt-1">Outer Ring Road & Silk Board</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Hospitals Monitored</div>
          <div className="text-2xl font-bold text-amber-600 mt-0.5 font-mono">2 Facilities</div>
          <div className="text-[11px] text-slate-500 mt-1">Sakra & St. John&apos;s Medical</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Substations At Risk</div>
          <div className="text-2xl font-bold text-teal-600 mt-0.5 font-mono">1 Substation</div>
          <div className="text-[11px] text-slate-500 mt-1">Bellandur 66kV Yard</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Exposed Commuters</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">~145,000</div>
          <div className="text-[11px] text-slate-500 mt-1">Tech Corridor Arterials</div>
        </div>
      </div>

      {/* Map & Asset Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: GIS Map (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>Infrastructure Spatial Inundation Overlap</span>
            </div>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Horizon: {currentTimeStep}
            </span>
          </div>
          <GISMap heightClass="h-[480px] w-full" />
        </div>

        {/* Right: Filterable Infrastructure Assets List (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search infrastructure assets or roads..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 text-xs text-slate-900 placeholder-slate-400 font-sans focus:outline-none focus:bg-white"
                />
              </div>

              {/* Type Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] shrink-0">
                {(['ALL', 'ROAD', 'HOSPITAL', 'SUBSTATION', 'SCHOOL'] as (AssetType | 'ALL')[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTypeFilter(t)}
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-colors ${
                      activeTypeFilter === t
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Assets Scroll List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredAssets.map(asset => {
                const isSelected = selectedAsset?.id === asset.id;
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                        : 'bg-white hover:border-slate-300 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span>{asset.name}</span>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {asset.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {asset.locationName || asset.address || 'Urban Core'} • Lat: {asset.lat.toFixed(4)}, Lng: {asset.lng.toFixed(4)}
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-1 font-mono">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeColor(asset.riskLevel)}`}>
                          {asset.riskLevel}
                        </span>
                        <span className="text-[11px] font-bold text-sky-700">
                          {asset.waterDepthMeters ?? asset.predictedDepthM ?? 0}m Flood
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-50/70 text-xs text-amber-900 flex items-start gap-2 border border-amber-200/80">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{asset.advisory || asset.notes || 'Monitor access road for surface water ponding.'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Showing {filteredAssets.length} of {infrastructureAssets.length} critical assets</span>
            <span className="text-emerald-700 font-semibold">Grounded in GIS Layer Stack</span>
          </div>
        </div>
      </div>

      <SafeRouteModal isOpen={isSafeRouteModalOpen} onClose={() => setIsSafeRouteModalOpen(false)} />
    </div>
  );
};
