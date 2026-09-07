import React, { useState } from 'react';
import {
  Clock,
  Globe,
  RefreshCw,
  Radio,
  CheckCircle2,
  ChevronDown,
  Play,
  Zap,
  RotateCcw,
  CloudRain,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { useLiveClock } from '../utils/timeUtils';
import { useRainShield } from '../context/RainShieldContext';

interface LiveClockWidgetProps {
  compact?: boolean;
}

export const LiveClockWidget: React.FC<LiveClockWidgetProps> = ({ compact = false }) => {
  const {
    now,
    dateFormatted,
    fullDateFormatted,
    timeFormatted,
    utcFormatted,
    timezone,
    formatRelative,
  } = useLiveClock(1000);

  const {
    lastWeatherRefreshTime,
    refreshRealWeather,
    isWeatherLoading,
    selectedLocation,
    currentTimeStep,
    autoRefreshEnabled,
    toggleAutoRefresh,
    secondsUntilNextRefresh,
    lastAutoDetectionEvent,
    triggerLiveSimulationEvent,
    resetLiveRealData,
  } = useRainShield();

  const [isOpenDetails, setIsOpenDetails] = useState(false);

  const syncTime = lastWeatherRefreshTime || now;
  const syncAgo = formatRelative(syncTime);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2 py-1 text-slate-200 text-xs shadow-inner">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-mono font-bold text-white text-[11px] tracking-tight">{timeFormatted}</span>
        <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline">
          {autoRefreshEnabled ? `${secondsUntilNextRefresh}s` : 'PAUSED'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpenDetails(!isOpenDetails)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-700 hover:border-slate-600 rounded-xl text-left shadow-sm transition-all group"
        title="Click for full Real-Time Live Clock, Auto-Update Status & Timing Details"
      >
        {/* Pulsing Live Beacon */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>

        {/* Date & Time display */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-mono font-bold text-white text-xs tracking-tight">
              {timeFormatted}
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 font-mono bg-emerald-950/80 border border-emerald-800/80 px-1 py-0.2 rounded">
              {timezone}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 leading-none mt-0.5">
            <span className="font-medium text-slate-300">{dateFormatted}</span>
            <span>•</span>
            <span className="text-emerald-400/90 font-mono text-[9px] flex items-center gap-1">
              {autoRefreshEnabled ? (
                <span>Auto-Sync in {secondsUntilNextRefresh}s</span>
              ) : (
                <span className="text-amber-400">Live ~{syncAgo}</span>
              )}
            </span>
          </div>
        </div>

        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-transform" />
      </button>

      {/* Floating Detailed Time & Auto-Update Popover */}
      {isOpenDetails && (
        <div
          className="absolute right-0 top-12 z-50 w-80 bg-slate-900/98 border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-3 animate-in fade-in zoom-in-95 duration-100"
          onMouseLeave={() => setIsOpenDetails(false)}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-Time Live Telemetry Timing</span>
            </div>
            <button
              onClick={() => setIsOpenDetails(false)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
              <span className="text-slate-400">Live Local Clock:</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">
                {timeFormatted} ({timezone})
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
              <span className="text-slate-400">Local System Date:</span>
              <span className="font-bold text-white text-[11px]">{fullDateFormatted}</span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
              <span className="text-slate-400">Universal Time (UTC):</span>
              <span className="font-mono font-semibold text-slate-300 text-xs">{utcFormatted}</span>
            </div>

            {/* Auto-Refresh Status with Toggle */}
            <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
              <div className="flex flex-col">
                <span className="text-slate-300 font-medium">Automatic Ingestion:</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {autoRefreshEnabled ? `Next cycle in ${secondsUntilNextRefresh}s` : 'Paused'}
                </span>
              </div>
              <button
                onClick={toggleAutoRefresh}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  autoRefreshEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                }`}
              >
                {autoRefreshEnabled ? 'RUNNING (30s)' : 'PAUSED'}
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
              <span className="text-slate-400">Last Telemetry Sync:</span>
              <span className="font-mono font-medium text-emerald-300 text-[11px]">
                {syncAgo}
              </span>
            </div>

            {lastAutoDetectionEvent && (
              <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Auto-Detection Monitor:</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                      lastAutoDetectionEvent.severity === 'EXTREME'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : lastAutoDetectionEvent.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {lastAutoDetectionEvent.type}
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 truncate">
                  {lastAutoDetectionEvent.message}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            <button
              onClick={() => {
                refreshRealWeather();
                setIsOpenDetails(false);
              }}
              disabled={isWeatherLoading}
              className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors text-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isWeatherLoading ? 'animate-spin' : ''}`} />
              <span>{isWeatherLoading ? 'Ingesting Stream...' : 'Sync Real-Time Telemetry Now'}</span>
            </button>

            {/* Test Simulation Trigger */}
            <button
              onClick={() => {
                triggerLiveSimulationEvent('cloudburst');
                setIsOpenDetails(false);
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 border border-rose-700/60 text-rose-200 font-semibold flex items-center justify-center gap-1.5 transition-colors text-xs"
              title="Instantly test real-time cloudburst & flood auto-alert detection at current location"
            >
              <Zap className="w-3 h-3 text-rose-400" />
              <span>Simulate Heavy Rain / Flood Influx</span>
            </button>

            <button
              onClick={() => {
                resetLiveRealData();
                setIsOpenDetails(false);
              }}
              className="w-full py-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5 text-slate-400" />
              <span>Restore Live Open-Meteo Real Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
