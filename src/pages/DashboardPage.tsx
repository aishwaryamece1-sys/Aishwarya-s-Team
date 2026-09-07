import React, { useState } from 'react';
import {
  CloudRain,
  Waves,
  ShieldAlert,
  Navigation,
  Sparkles,
  Play,
  FileText,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Radio,
  Clock,
  Compass,
  Zap,
  Layers,
  Route,
  Download,
  Info,
  Thermometer,
  Wind,
  Droplets,
  ChevronRight,
  TrendingUp,
  MapPin,
  Car,
  AlertOctagon,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { useLiveClock } from '../utils/timeUtils';
import { GISMap } from '../components/GISMap';
import { ForecastTimeline } from '../components/ForecastTimeline';
import { RealWeatherCharts } from '../components/RealWeatherCharts';
import { RainShieldAIAssistant } from '../components/RainShieldAIAssistant';
import { RiskZoneDetailModal } from '../components/RiskZoneDetailModal';
import { FullAnalysisModal } from '../components/FullAnalysisModal';
import { AlertGeneratorModal } from '../components/AlertGeneratorModal';
import { SafeRouteModal } from '../components/SafeRouteModal';
import { DATA_SOURCES_STATUS } from '../data/demoData';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    selectedLocation,
    currentTimeStep,
    currentRainfall,
    currentInundationZones,
    infrastructureAssets,
    alerts,
    runFullAnalysis,
    isAnalyzing,
    dataMode,
    setSelectedRiskZone,
    realWeatherData,
    historicalClimate,
    riskAssessment,
    isWeatherLoading,
    lastWeatherRefreshTime,
    generateAndDownloadReport,
    autoRefreshEnabled,
    toggleAutoRefresh,
    secondsUntilNextRefresh,
    lastAutoDetectionEvent,
    triggerLiveSimulationEvent,
    resetLiveRealData,
  } = useRainShield();

  const {
    now,
    fullDateFormatted,
    timeFormatted,
    utcFormatted,
    timezone,
    stepApproximates,
    formatRelative,
  } = useLiveClock(1000);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSafeRouteModalOpen, setIsSafeRouteModalOpen] = useState(false);

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  // Real-time time approximations
  const syncAgo = formatRelative(lastWeatherRefreshTime || now);
  const currentStepApprox = stepApproximates.find((s) => s.step === currentTimeStep) || stepApproximates[0];
  const peakApprox = stepApproximates.find((s) => s.step === '+120') || stepApproximates[4];

  // Real or synthesized metrics
  const currentRainRate = realWeatherData?.current?.precipitationMm ?? currentRainfall.intensityMmHr;
  const weatherDesc = realWeatherData?.current?.weatherDescription ?? 'Light Rain / Overcast';
  const tempC = realWeatherData?.current?.temperatureC ?? 24;
  const humidity = realWeatherData?.current?.relativeHumidityPct ?? 82;
  const windKmh = realWeatherData?.current?.windSpeedKmh ?? 14;

  const peak24hAccumulation = realWeatherData?.hourly
    ? realWeatherData.hourly.slice(0, 24).reduce((acc, h) => acc + h.precipitationMm, 0).toFixed(1)
    : currentRainfall.accumulatedMm.toString();

  const peakHourlyRate = realWeatherData?.hourly
    ? Math.max(...realWeatherData.hourly.slice(0, 24).map((h) => h.precipitationMm), 0).toFixed(1)
    : '45.0';

  const peakProbability = realWeatherData?.hourly
    ? Math.max(...realWeatherData.hourly.slice(0, 24).map((h) => h.precipitationProbabilityPct), 0)
    : 85;

  const riskScore = riskAssessment?.overallScore ?? 35;
  const riskLevel = riskAssessment?.riskLevel ?? 'MODERATE';

  const getRiskBg = (lvl: string) => {
    switch (lvl) {
      case 'EXTREME':
        return 'bg-rose-50 border-rose-200 text-rose-900';
      case 'HIGH':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'MODERATE':
        return 'bg-sky-50 border-sky-200 text-sky-900';
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
    }
  };

  const getRiskBadge = (lvl: string) => {
    switch (lvl) {
      case 'EXTREME':
        return 'bg-rose-600 text-white';
      case 'HIGH':
        return 'bg-amber-600 text-white';
      case 'MODERATE':
        return 'bg-sky-600 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-6 gap-6 overflow-y-auto select-none max-w-[1700px] mx-auto w-full">
      {/* Top Command Bar & Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
              <Compass className="w-5 h-5 text-emerald-600" />
              <span>Disaster & Risk Intelligence Command Center</span>
            </h1>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-600" />
              {selectedLocation.name} ({selectedLocation.lat.toFixed(2)}°, {selectedLocation.lng.toFixed(2)}°)
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-600" />
              Live Telemetry Stream Active (2016-2026 Calibrated)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Catchment Basin: <strong className="text-slate-700">{selectedLocation.description}</strong> • Deterministic Nowcast & 2D Hydrodynamic Risk Assessment
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={runFullAnalysis}
            disabled={isAnalyzing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-sm transition-colors flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Running Pipeline...' : 'Run Full Analysis'}</span>
          </button>

          <button
            onClick={generateAndDownloadReport}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Download Official Situation Report PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download SITREP (PDF)</span>
          </button>

          <button
            onClick={() => setIsSafeRouteModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Route className="w-3.5 h-3.5 text-emerald-600" />
            <span>Safe Route</span>
          </button>

          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Issue Alert</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME LIVE DATA & TEMPORAL CONTEXT BAR */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Left: Real-time Date & Clock & Auto-Sync ticker */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">Real-Time Live</span>
            <span className="text-slate-600">|</span>
            <span className="font-medium text-slate-200">{fullDateFormatted}</span>
            <span className="font-mono font-bold text-white text-sm tracking-tight">{timeFormatted}</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
              {timezone}
            </span>
            <span className="text-[11px] font-mono text-slate-400 hidden lg:inline">
              ({utcFormatted})
            </span>
          </div>

          {/* Continuous Auto-Refresh Countdown and Toggle */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 px-2.5 py-1 rounded-lg">
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isWeatherLoading ? 'animate-spin' : ''}`} />
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">Auto-Sync:</span>
              <span className="font-mono font-bold text-emerald-300">
                {autoRefreshEnabled ? `${secondsUntilNextRefresh}s` : 'PAUSED'}
              </span>
            </div>
            <button
              onClick={toggleAutoRefresh}
              className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                autoRefreshEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
              title="Toggle continuous real-time telemetry auto-ingestion"
            >
              {autoRefreshEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Simulation & Real Reset triggers for instant testing */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => triggerLiveSimulationEvent('cloudburst')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-[11px] font-semibold transition-all shadow-xs"
              title="Inject an extreme cloudburst scenario into the live ingestion loop to test instant flood auto-escalation"
            >
              <Zap className="w-3 h-3 text-rose-400" />
              <span>Simulate Cloudburst Influx</span>
            </button>

            <button
              onClick={resetLiveRealData}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] transition-all"
              title="Restore real Open-Meteo & Copernicus observations"
            >
              <RotateCcw className="w-2.5 h-2.5 text-slate-400" />
              <span>Live Sensor Sync</span>
            </button>
          </div>
        </div>

        {/* Right: Time Approximates on Forecast Horizons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Simulation Horizon:</span>
            <span className="font-mono font-bold text-amber-300">
              {currentStepApprox.offsetLabel} (~{currentStepApprox.timeStr})
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800/80 px-1.5 py-0.2 rounded font-semibold">
              {currentStepApprox.approxRelativeLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-[11px] hidden sm:flex">
            <CloudRain className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Projected Peak:</span>
            <span className="font-mono font-bold text-rose-300">
              ~{peakApprox.timeStr} ({peakApprox.approxRelativeLabel})
            </span>
          </div>
        </div>
      </div>

      {/* CITIZEN EMERGENCY & RISK ADVISORY BANNER: "IS MY LOCATION CURRENTLY AT RISK?" */}
      <div className={`p-5 rounded-xl border shadow-sm ${getRiskBg(riskLevel)} transition-all`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: Overall Risk Score Gauge & Status */}
          <div className="flex items-start gap-4 shrink-0">
            <div className="relative flex flex-col items-center justify-center w-20 h-20 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">{riskScore}</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${getRiskBadge(riskLevel)}`}>
                  {riskLevel} RISK
                </span>
                <span className="text-xs font-bold text-slate-800 font-mono">
                  {riskAssessment?.headlineSummary ?? 'Evaluating environmental indicators...'}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {riskLevel === 'LOW'
                  ? 'Current environmental indicators show safe meteorological conditions with no acute hazards.'
                  : riskLevel === 'MODERATE'
                  ? 'Moderate rainfall or catchment saturation detected. Normal vigilance advised.'
                  : riskLevel === 'HIGH'
                  ? 'Severe precipitation and localized inundation risk in low-lying corridors.'
                  : 'Critical extreme hazard: Severe localized flooding, rapid runoff, and transportation disruption expected.'}
              </h2>
            </div>
          </div>

          {/* Right: Why & What should I do? */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 lg:max-w-2xl text-xs">
            {/* Why is this score assigned? */}
            <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-lg border border-slate-200/60 shadow-xs">
              <div className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Contributing Factor Evaluation</span>
              </div>
              <ul className="space-y-1 text-slate-700 text-[11px]">
                {riskAssessment?.contributingFactors?.slice(0, 3)?.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{factor}</span>
                  </li>
                )) ?? <li>Atmospheric and catchment telemetry within normal baselines.</li>}
              </ul>
            </div>

            {/* Action Recommendations for Citizens */}
            <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-lg border border-slate-200/60 shadow-xs">
              <div className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Action Recommendations</span>
              </div>
              <ul className="space-y-1 text-slate-700 text-[11px]">
                {riskAssessment?.actionRecommendations?.slice(0, 3)?.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{act}</span>
                  </li>
                )) ?? <li>Maintain standard meteorological awareness.</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Main Live Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 shrink-0">
        {/* KPI 1: Live Precipitation */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Current Precipitation</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Live Sensor
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {currentRainRate} <span className="text-sm font-semibold text-slate-500">mm/h</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            <span>{weatherDesc}</span>
            <span className="text-emerald-600 font-semibold">{tempC}°C</span>
          </div>
        </div>

        {/* KPI 2: 24h Accumulation Forecast */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>24h Forecast Total</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                NWP Model
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {peak24hAccumulation} <span className="text-sm font-semibold text-slate-500">mm</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            <span>Peak Rate: <strong className="text-slate-800">{peakHourlyRate} mm/h</strong></span>
            <span className="text-cyan-700 font-semibold">{peakProbability}% Prob</span>
          </div>
        </div>

        {/* KPI 3: ERA5 10-Year Anomaly */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Climatic Anomaly</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                ERA5 Baseline
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {historicalClimate
                ? historicalClimate.anomalyPercent > 0
                  ? `+${historicalClimate.anomalyPercent}%`
                  : `${historicalClimate.anomalyPercent}%`
                : 'Normal'}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            <span>Monthly Baseline: <strong className="text-slate-800">{historicalClimate?.monthlyBaselineMm[0]?.avgRainfallMm ?? 140} mm</strong></span>
            <span className="text-slate-700 font-semibold">10-Yr Mean</span>
          </div>
        </div>

        {/* KPI 4: Inundation & Drainage */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Drainage & Flood</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                2D Hydro
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {riskAssessment?.breakdownScores?.inundationRisk ?? 25} <span className="text-sm font-semibold text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            <span>Catchment Runoff</span>
            <span className="text-amber-600 font-semibold">Grounded</span>
          </div>
        </div>

        {/* KPI 5: Atmospheric & Wind */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden col-span-2 md:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Atmosphere & Wind</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                Synoptic
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {windKmh} <span className="text-sm font-semibold text-slate-500">km/h</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            <span>Humidity: <strong className="text-slate-800">{humidity}%</strong></span>
            <span className="text-slate-700 font-semibold">{realWeatherData?.current?.surfacePressureHpa ?? 1012} hPa</span>
          </div>
        </div>
      </div>

      {/* 6 Hazard Modules Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Multi-Factor Risk Assessment Sub-Modules</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Explainable Multi-Factor Scoring (0–100 Scale)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Module 1: Heavy Rainfall */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase mb-1">
              <span className="flex items-center gap-1">
                <CloudRain className="w-3 h-3 text-blue-600" />
                Heavy Rain
              </span>
              <span className="font-mono">{riskAssessment?.breakdownScores?.heavyRainfall ?? 20}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${riskAssessment?.breakdownScores?.heavyRainfall ?? 20}%` }}
              />
            </div>
          </div>

          {/* Module 2: Extreme Burst */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" />
                Extreme Burst
              </span>
              <span className="font-mono">{riskAssessment?.breakdownScores?.extremePrecipitation ?? 15}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-600 h-1.5 rounded-full"
                style={{ width: `${riskAssessment?.breakdownScores?.extremePrecipitation ?? 15}%` }}
              />
            </div>
          </div>

          {/* Module 3: Flood & Waterlogging */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase mb-1">
              <span className="flex items-center gap-1">
                <Waves className="w-3 h-3 text-cyan-600" />
                Inundation
              </span>
              <span className="font-mono">{riskAssessment?.breakdownScores?.inundationRisk ?? 25}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-600 h-1.5 rounded-full"
                style={{ width: `${riskAssessment?.breakdownScores?.inundationRisk ?? 25}%` }}
              />
            </div>
          </div>

          {/* Module 4: Severe Weather */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase mb-1">
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-indigo-600" />
                Severe Weather
              </span>
              <span className="font-mono">{riskAssessment?.breakdownScores?.severeWeather ?? 10}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{ width: `${riskAssessment?.breakdownScores?.severeWeather ?? 10}%` }}
              />
            </div>
          </div>

          {/* Module 5: Travel Hazard */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase mb-1">
              <span className="flex items-center gap-1">
                <Car className="w-3 h-3 text-rose-600" />
                Mobility
              </span>
              <span className="font-mono">{riskAssessment?.breakdownScores?.mobilityDisruption ?? 20}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-600 h-1.5 rounded-full"
                style={{ width: `${riskAssessment?.breakdownScores?.mobilityDisruption ?? 20}%` }}
              />
            </div>
          </div>

          {/* Module 6: Historical Anomaly */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase mb-1">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                ERA5 Anomaly
              </span>
              <span className="font-mono">{riskAssessment?.breakdownScores?.historicalAnomaly ?? 10}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{ width: `${riskAssessment?.breakdownScores?.historicalAnomaly ?? 10}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Command Center Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* LEFT COLUMN: Risk Summary, Active Warnings, Data Source Health (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
          {/* Active Risk Summary Card */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Hazard Summary</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Horizon: {currentTimeStep}
              </span>
            </div>

            <div className="space-y-2">
              {currentInundationZones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setSelectedRiskZone(zone)}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100/90 border border-slate-200 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-900 truncate pr-2">{zone.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        zone.riskLevel === 'EXTREME'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {zone.riskLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Depth: <strong className="text-slate-800">{zone.waterDepthMeters}m</strong>
                    </span>
                    <span>Area: {zone.affectedAreaSqKm} km²</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('/inundation')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold text-center border border-slate-200 transition-colors"
            >
              Open Inundation Intelligence →
            </button>
          </div>

          {/* Active Warnings Bulletin Card */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Active Warnings ({activeAlerts.length})</span>
              </div>
              <button onClick={() => setIsAlertModalOpen(true)} className="text-xs text-rose-600 hover:text-rose-700 font-bold">
                + Issue Alert
              </button>
            </div>

            <div className="space-y-2">
              {activeAlerts.map((a) => (
                <div
                  key={a.id}
                  onClick={() => onNavigate('/alerts')}
                  className="p-3 rounded-lg bg-rose-50/60 border border-rose-200 hover:bg-rose-50 cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-rose-900 line-clamp-1">{a.title}</span>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{a.timestamp}</span>
                  </div>
                  <div className="text-xs text-slate-700 line-clamp-2">{a.rainfallIntensity}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Source Sensor Health Mini Card */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 uppercase tracking-wider text-xs">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>Data Feeds</span>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                Active
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Open-Meteo NWP Tensors</span>
                <span className="text-xs font-mono text-emerald-600 font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Copernicus ERA5 Climatology</span>
                <span className="text-xs font-mono text-emerald-600 font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">NASA GPM IMERG Precipitation</span>
                <span className="text-xs font-mono text-emerald-600 font-bold">ONLINE</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/data-sources')}
              className="w-full mt-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold text-center border border-slate-200 transition-colors"
            >
              View Data Pipeline & Verification →
            </button>
          </div>
        </div>

        {/* CENTER COLUMN: GIS Map & Weather Charts (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4 min-h-[520px]">
          <GISMap heightClass="h-[440px]" />
          <ForecastTimeline />
          <RealWeatherCharts />
        </div>

        {/* RIGHT COLUMN: RainShield AI Assistant (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col min-h-[460px]">
          <RainShieldAIAssistant />
        </div>
      </div>

      {/* Global Modals */}
      <RiskZoneDetailModal />
      <FullAnalysisModal />
      <AlertGeneratorModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} />
      <SafeRouteModal isOpen={isSafeRouteModalOpen} onClose={() => setIsSafeRouteModalOpen(false)} />
    </div>
  );
};
