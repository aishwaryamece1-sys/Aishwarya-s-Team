import React, { useState } from 'react';
import {
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowDown,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { DATA_SOURCES_STATUS, DATA_QUALITY_CHECKS } from '../data/demoData';
import { DataSourceStatus } from '../types';

export const MonitoringPage: React.FC = () => {
  const { dataMode, selectedLocation, addToast } = useRainShield();
  const [selectedSource, setSelectedSource] = useState<DataSourceStatus>(DATA_SOURCES_STATUS[0]);
  const [isRefreshingQuality, setIsRefreshingQuality] = useState(false);

  const handleRefreshQuality = () => {
    setIsRefreshingQuality(true);
    setTimeout(() => {
      setIsRefreshingQuality(false);
      addToast('Data Quality Verified', 'All 6 quality rules re-evaluated across active ingestion buffer.', 'success');
    }, 600);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
      case 'GOOD':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'WARNING':
      case 'DEGRADED':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'CRITICAL':
      case 'OFFLINE':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto w-full select-none text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
              Live Multi-Source Ingestion & Data Fusion
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {dataMode} STREAM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Real-time multi-sensor telemetry ingestion, physics-informed data quality control, and spatial grid alignment pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshQuality}
            disabled={isRefreshingQuality}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingQuality ? 'animate-spin' : ''}`} />
            <span>Re-Verify Sensor Stream</span>
          </button>
        </div>
      </div>

      {/* 7 Data Cards Grid */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Active Data Ingestion Sources ({DATA_SOURCES_STATUS.length})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DATA_SOURCES_STATUS.map(src => {
            const isSelected = selectedSource.id === src.id;
            return (
              <div
                key={src.id}
                onClick={() => setSelectedSource(src)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'bg-white hover:border-slate-300 border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {src.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(src.status)}`}>
                      {src.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-1">{src.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{src.purpose}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Latency:</span>
                    <div className="font-bold text-slate-800 font-mono">{src.latencyMs} ms</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Quality Score:</span>
                    <div className="font-bold text-emerald-600 font-mono">{src.qualityScore}%</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Updated:</span>
                    <div className="text-slate-700 font-mono text-[11px]">{src.lastUpdate}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Mode:</span>
                    <div className="text-slate-800 font-semibold">{src.mode}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Data Source Detailed Inspector */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold text-emerald-800 uppercase tracking-wider">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>Selected Feed Telemetry Details: {selectedSource.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Provider Agency:</span>
            <div className="font-bold text-slate-900 mt-0.5">{selectedSource.provider}</div>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Spatial / Sensor Resolution:</span>
            <div className="font-bold text-slate-900 mt-0.5">{selectedSource.resolution}</div>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Sampling Rate:</span>
            <div className="font-bold text-slate-900 mt-0.5">{selectedSource.updateFrequency}</div>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Spatial Coverage:</span>
            <div className="font-bold text-slate-900 mt-0.5">{selectedSource.coverage}</div>
          </div>
        </div>
      </div>

      {/* Animated Data Fusion Pipeline */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>RainShield Data Fusion & Inference Architecture</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Real-Time Pipeline
          </span>
        </div>

        {/* Pipeline Stage Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs relative">
          {/* Stage 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] text-emerald-700 font-bold uppercase mb-1">Stage 01</div>
            <div className="font-bold text-slate-900 mb-2">RAW INGESTION</div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>• DWR Doppler Radar</div>
              <div>• INSAT-3DR Satellite</div>
              <div>• 48 AWS Sensors</div>
              <div>• WRF NWP 3km</div>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] text-emerald-700 font-bold uppercase mb-1">Stage 02</div>
            <div className="font-bold text-slate-900 mb-2">QUALITY CONTROL</div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>• NTP Clock Sync</div>
              <div>• Kalman Outlier Filter</div>
              <div>• Missing Imputation</div>
              <div>• Spatial Bounds Check</div>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] text-emerald-700 font-bold uppercase mb-1">Stage 03</div>
            <div className="font-bold text-slate-900 mb-2">SPATIAL ALIGNMENT</div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>• 250m Common Grid</div>
              <div>• Elevation Projection</div>
              <div>• Doppler Radial Merge</div>
              <div>• Surface Bias Tuning</div>
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] text-emerald-700 font-bold uppercase mb-1">Stage 04</div>
            <div className="font-bold text-slate-900 mb-2">HYDRO FUSION</div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>• Nowcast CNN-LSTM</div>
              <div>• HydroFlood2D Engine</div>
              <div>• Stormwater Hydraulic</div>
              <div>• Bayesian Risk Matrix</div>
            </div>
          </div>

          {/* Stage 5 */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] text-emerald-800 font-bold uppercase mb-1">Stage 05</div>
            <div className="font-bold text-emerald-950 mb-2">DECISION INTELLIGENCE</div>
            <div className="text-[11px] text-emerald-800 space-y-1">
              <div>• 0-3hr Inundation Map</div>
              <div>• Road Overlap Alerts</div>
              <div>• Safe Route Planning</div>
              <div>• AI Commander Brief</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Quality Engine Table */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Data Quality Engine Verification Log</span>
          </div>
          <span className="text-xs text-slate-400">Tested: 1 min ago</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-3">Quality Rule</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Measured Value</th>
                <th className="py-2.5 px-3">Tolerance Bound</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {DATA_QUALITY_CHECKS.map(qc => (
                <tr key={qc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{qc.name}</td>
                  <td className="py-3 px-3 text-slate-500">{qc.category}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{qc.value}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono">{qc.threshold}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(qc.status)}`}>
                      {qc.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{qc.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
