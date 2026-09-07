import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
} from 'recharts';
import {
  CloudRain,
  TrendingUp,
  Thermometer,
  Calendar,
  Layers,
  Info,
  Clock,
  Compass,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { useLiveClock, formatTimeApproximate } from '../utils/timeUtils';

export const RealWeatherCharts: React.FC = () => {
  const { realWeatherData, historicalClimate, isWeatherLoading, weatherError, refreshRealWeather, lastWeatherRefreshTime } = useRainShield();
  const { now, timeFormatted, formatRelative } = useLiveClock(1000);
  const [activeTab, setActiveTab] = useState<'hourly' | 'historical' | 'temperature' | 'daily'>('hourly');

  if (isWeatherLoading && !realWeatherData) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <h3 className="text-sm font-bold text-slate-800">Synchronizing Real Meteorological Telemetry...</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Ingesting Open-Meteo high-resolution NWP model tensors and Copernicus ERA5 reanalysis baselines.
        </p>
      </div>
    );
  }

  if (weatherError && !realWeatherData) {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <CloudRain className="w-10 h-10 text-rose-500 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Live Weather Data Unavailable</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{weatherError}</p>
        <button
          onClick={refreshRealWeather}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          Retry Telemetry Ingest
        </button>
      </div>
    );
  }

  if (!realWeatherData || !historicalClimate) return null;

  // Prepare Hourly Data (take 36 hours for clean visualization)
  const hourlyData = realWeatherData.hourly.slice(0, 36).map((pt) => {
    const ptDate = new Date(pt.time);
    const approx = formatTimeApproximate(ptDate, now);
    return {
      time: pt.displayTime,
      fullTime: pt.time,
      approx,
      rainMm: pt.precipitationMm,
      probabilityPct: pt.precipitationProbabilityPct,
      tempC: pt.temperatureC,
      pressureHpa: pt.surfacePressureHpa,
      windKmh: pt.windSpeedKmh,
    };
  });

  // Prepare Historical Monthly Baseline vs Current
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'short' });
  const monthlyData = historicalClimate.monthlyBaselineMm.map((m) => ({
    month: m.month,
    baselineAvgMm: m.avgRainfallMm,
    historicalRecordMaxMm: m.maxRainfallMm,
    isCurrentMonth: m.month.toLowerCase() === currentMonthName.toLowerCase(),
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Chart Header & Tab Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Verified Hydro-Meteorological Observational Charts
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span>
              Retrieved for <strong className="text-slate-800">{realWeatherData.location.name}</strong> • Source:{' '}
              <span className="font-mono text-emerald-700">Open-Meteo & Copernicus ERA5</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Time: {timeFormatted}
            </span>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Synced {formatRelative(lastWeatherRefreshTime || now)}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'hourly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Hourly Rainfall (36h)</span>
          </button>

          <button
            onClick={() => setActiveTab('historical')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'historical' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>ERA5 Baseline vs Anomaly</span>
          </button>

          <button
            onClick={() => setActiveTab('temperature')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'temperature' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-amber-600" />
            <span>Temp & Pressure</span>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>7-Day Synoptic</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Hourly Rainfall & Probability (36 Hours) */}
      {activeTab === 'hourly' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              Precipitation (mm/h) on Left Axis <span className="inline-block w-3 h-3 bg-blue-500 rounded ml-1 mr-3" />
              Probability (%) on Right Axis <span className="inline-block w-3 h-1 bg-cyan-500 rounded ml-1" />
            </span>
            <span className="font-mono text-slate-500">
              Peak 24h Cumulative: <strong className="text-slate-800">{realWeatherData.hourly.slice(0, 24).reduce((a, b) => a + b.precipitationMm, 0).toFixed(1)} mm</strong>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} interval={2} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{ value: 'Rain (mm)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) => {
                    if (name === 'Rainfall') return [`${val} mm`, 'Rainfall'];
                    if (name === 'Precipitation Probability') return [`${val}%`, 'Probability'];
                    return [val, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar yAxisId="left" dataKey="rainMm" name="Rainfall" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="probabilityPct"
                  name="Precipitation Probability"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 2: Copernicus ERA5 10-Year Monthly Baseline vs Anomaly */}
      {activeTab === 'historical' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
            <span>
              Copernicus ERA5 10-Year Climatological Mean (2016–2025) across calendar months vs 10-Year Record Maximums.
            </span>
            <span className="font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
              Current Anomaly: {historicalClimate.anomalyPercent > 0 ? `+${historicalClimate.anomalyPercent}%` : `${historicalClimate.anomalyPercent}%`} ({historicalClimate.anomalyClassification})
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" mm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) => [`${val} mm`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="baselineAvgMm" name="10-Year Monthly Baseline Avg (ERA5)" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Line
                  type="monotone"
                  dataKey="historicalRecordMaxMm"
                  name="10-Year Peak Monthly Extreme (ERA5)"
                  stroke="#e11d48"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: Temperature & Barometric Pressure Trend */}
      {activeTab === 'temperature' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              Temperature (°C) on Left Axis <span className="inline-block w-3 h-1 bg-amber-500 rounded ml-1 mr-3" />
              Surface Pressure (hPa) on Right Axis <span className="inline-block w-3 h-1 bg-indigo-500 rounded ml-1" />
            </span>
            <span className="font-mono text-slate-500">
              Current Pressure: <strong className="text-slate-800">{realWeatherData.current.surfacePressureHpa} hPa</strong>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} interval={2} />
                <YAxis
                  yAxisId="temp"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  unit="°C"
                />
                <YAxis
                  yAxisId="press"
                  orientation="right"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  unit=" hPa"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="tempC"
                  name="Temperature (°C)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  yAxisId="press"
                  type="monotone"
                  dataKey="pressureHpa"
                  name="Surface Pressure (hPa)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 4: 7-Day Synoptic Daily Cards */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
          {realWeatherData.daily.map((d, idx) => (
            <div
              key={d.date}
              className={`p-3 rounded-xl border text-center flex flex-col justify-between ${
                idx === 0 ? 'bg-emerald-50/70 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="text-[11px] font-bold text-slate-800">{d.displayDate}</div>
                <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block my-0.5 ${
                  idx === 0
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200/70 text-slate-700'
                }`}>
                  {idx === 0 ? 'Today (Live)' : idx === 1 ? 'Tomorrow' : `In ~${idx} days`}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 my-0.5">{d.weatherDescription}</div>
              </div>

              <div className="my-2">
                <div className="text-sm font-bold text-slate-900">
                  {d.temperatureMaxC}° <span className="text-xs font-normal text-slate-500">/ {d.temperatureMinC}°</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-600 flex items-center justify-between">
                <span>Rain: <strong>{d.precipitationSumMm}mm</strong></span>
                <span className="font-bold text-cyan-700">{d.precipitationProbabilityMaxPct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
