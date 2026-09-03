import React, { useState } from 'react';
import {
  CloudRain,
  Activity,
  Sparkles,
  TrendingUp,
  Clock,
  Layers,
  Zap,
  Info,
  Radio,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useRainShield } from '../context/RainShieldContext';
import { GISMap } from '../components/GISMap';
import { ForecastTimeline } from '../components/ForecastTimeline';
import { HYETOGRAPH_CHART_DATA } from '../data/demoData';

export const ForecastPage: React.FC = () => {
  const {
    selectedLocation,
    currentTimeStep,
    currentRainfall,
    dataMode,
    runFullAnalysis,
    isAnalyzing,
  } = useRainShield();

  const [selectedModel, setSelectedModel] = useState<'cnn-lstm' | 'wrf-ensemble'>('cnn-lstm');

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1700px] mx-auto w-full select-none text-slate-800">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <CloudRain className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
              Precipitation Nowcasting & Hyetograph Analytics
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {selectedLocation.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            0-3 hour high-resolution (250m grid) convective rainfall forecasting & temporal accumulation tracking.
          </p>
        </div>

        {/* Model Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedModel('cnn-lstm')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                selectedModel === 'cnn-lstm' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CNN-LSTM Nowcaster (250m)
            </button>
            <button
              onClick={() => setSelectedModel('wrf-ensemble')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                selectedModel === 'wrf-ensemble' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              WRF NWP Ensemble (3km)
            </button>
          </div>

          <button
            onClick={runFullAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Recomputing Nowcast...' : 'Re-Run Forecast'}</span>
          </button>
        </div>
      </div>

      {/* Main Meteorological Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Predicted Rate</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{currentRainfall.intensityMmHr} mm/h</div>
          <div className="text-[11px] text-slate-500 mt-1">Horizon: {currentTimeStep}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Storm Peak Rate</div>
          <div className="text-xl font-bold text-amber-600 mt-0.5 font-mono">112.5 mm/h</div>
          <div className="text-[11px] text-slate-500 mt-1">Expected at 16:30 IST</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Accumulated (3h)</div>
          <div className="text-xl font-bold text-teal-600 mt-0.5 font-mono">{currentRainfall.accumulatedMm} mm</div>
          <div className="text-[11px] text-slate-500 mt-1">Watershed Runoff</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Heavy Rain Prob.</div>
          <div className="text-xl font-bold text-rose-600 mt-0.5 font-mono">{currentRainfall.probabilityPercent}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Ensemble Confidence</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Radar Reflectivity</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{currentRainfall.radarReflectivityDbz} dBZ</div>
          <div className="text-[11px] text-slate-500 mt-1">S-Band Doppler DWR</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium">Hazard Status</div>
          <div className="text-xl font-bold text-rose-600 mt-0.5">{currentRainfall.risk}</div>
          <div className="text-[11px] text-slate-500 mt-1">{dataMode} SIMULATION</div>
        </div>
      </div>

      {/* 2-Column Main Workspace (Left Map, Right Hyetograph Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: GIS Rainfall Map (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>Spatial Radar Echo & Precipitation Heatmap</span>
            </div>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Grid: 250m
            </span>
          </div>
          <GISMap heightClass="h-[480px] w-full" />
          <ForecastTimeline />
        </div>

        {/* Right: Hyetograph Intensity Chart (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Hyetograph Time-Series & Warning Thresholds</span>
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Peak: +120 MIN (16:30 IST)
              </span>
            </div>

            {/* Recharts Hyetograph */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={HYETOGRAPH_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Rainfall (mm/hr)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine y={50} label={{ value: 'High Risk (50mm/h)', fill: '#d97706', fontSize: 10 }} stroke="#d97706" strokeDasharray="4 4" />
                  <ReferenceLine y={80} label={{ value: 'Extreme Risk (80mm/h)', fill: '#e11d48', fontSize: 10 }} stroke="#e11d48" strokeDasharray="4 4" />
                  <Bar dataKey="current" name="Observed AWS Rain (mm/h)" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="forecast" name="Predicted Nowcast Rain (mm/h)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="probability" name="Heavy Rain Probability (%)" stroke="#e11d48" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Meteorological Model Discussion */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scientific Nowcaster Interpretation ({dataMode} Simulation):</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              A rapidly organizing Mesoscale Convective Cluster is developing over the Bellandur-Varthur valley ridge. Deep convective cloud top brightness temperatures have dropped to -64°C on INSAT-3DR IR. Doppler radar reflectivity displays maximum core intensity of <strong>62 dBZ</strong> at +120 minutes, confirming severe cloudburst potential (&gt;100 mm/hr peak).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
