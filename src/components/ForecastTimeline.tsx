import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  CloudRain,
  Waves,
  AlertOctagon,
  FastForward,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { TimeStep } from '../types';
import { useLiveClock } from '../utils/timeUtils';

export const ForecastTimeline: React.FC = () => {
  const {
    currentTimeStep,
    setCurrentTimeStep,
    isPlayingEvolution,
    setIsPlayingEvolution,
    evolutionSpeedMs,
    setEvolutionSpeedMs,
    currentRainfall,
    currentInundationZones,
    dataMode,
  } = useRainShield();

  const { now, timeFormatted, stepApproximates } = useLiveClock(1000);

  const currentIndex = stepApproximates.findIndex(t => t.step === currentTimeStep);
  const activeStep = stepApproximates[currentIndex] || stepApproximates[0];

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentTimeStep(stepApproximates[currentIndex - 1].step);
    }
  };

  const handleNext = () => {
    if (currentIndex < stepApproximates.length - 1) {
      setCurrentTimeStep(stepApproximates[currentIndex + 1].step);
    }
  };

  const togglePlay = () => {
    setIsPlayingEvolution(!isPlayingEvolution);
  };

  const totalArea = currentInundationZones.reduce((acc, z) => acc + z.affectedAreaSqKm, 0).toFixed(1);
  const maxDepth = Math.max(...currentInundationZones.map(z => z.waterDepthMeters), 0).toFixed(2);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-slate-800 select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
        {/* Playback Controls & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className={`px-3 py-1.5 rounded font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                isPlayingEvolution
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title={isPlayingEvolution ? 'Pause Flood Evolution' : 'Play Flood Evolution'}
            >
              {isPlayingEvolution ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Evolution</span>
                </>
              )}
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === stepApproximates.length - 1}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Toggle */}
          <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <FastForward className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setEvolutionSpeedMs(evolutionSpeedMs === 2500 ? 1500 : 2500)}
              className="px-2 py-1 rounded bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-[11px] font-semibold transition-colors"
            >
              {evolutionSpeedMs === 1500 ? '2x Fast' : '1x Normal'}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 border-l border-slate-200 pl-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-slate-900 font-mono">{timeFormatted}</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-mono font-bold">
              Horizon: {activeStep?.fullDisplay || currentTimeStep}
            </span>
          </div>
        </div>

        {/* Real-Time Horizon Hazard Indicators */}
        <div className="flex items-center gap-2.5 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
            <CloudRain className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Rainfall:</span>
            <span className="font-bold text-slate-900">{currentRainfall.intensityMmHr} mm/hr</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
            <Waves className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Max Depth:</span>
            <span className="font-bold text-rose-600">{maxDepth} m</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
            <AlertOctagon className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Inundated:</span>
            <span className="font-bold text-amber-700">{totalArea} km²</span>
          </div>
        </div>
      </div>

      {/* Interactive Step Slider / Stepper Bar */}
      <div className="relative pt-3 pb-1">
        {/* Progress connecting track */}
        <div className="absolute top-6 left-0 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-rose-500 transition-all duration-300"
            style={{ width: `${(currentIndex / (stepApproximates.length - 1)) * 100}%` }}
          />
        </div>

        {/* Interactive Step Nodes */}
        <div className="relative flex items-center justify-between">
          {stepApproximates.map((t, idx) => {
            const isActive = t.step === currentTimeStep;
            const isPassed = idx <= currentIndex;
            return (
              <button
                key={t.step}
                onClick={() => setCurrentTimeStep(t.step)}
                className="flex flex-col items-center group focus:outline-none z-10"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
                    isActive
                      ? 'bg-emerald-600 border-white ring-2 ring-emerald-500 scale-110 shadow-md text-white'
                      : isPassed
                      ? 'bg-emerald-600 border-emerald-500 text-white group-hover:scale-105'
                      : 'bg-white border-slate-300 text-slate-700 group-hover:border-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold">
                    {idx === 0 ? '0' : `+${t.minutesOffset}`}
                  </span>
                </div>

                <div className="mt-2 text-center">
                  <div
                    className={`text-xs font-semibold transition-colors whitespace-nowrap ${
                      isActive ? 'text-emerald-700 font-bold' : 'text-slate-600 group-hover:text-slate-900'
                    }`}
                  >
                    {t.offsetLabel}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono font-medium whitespace-nowrap">
                    ~{t.timeStr}
                  </div>
                  <div className="text-[9px] text-slate-400 font-sans">
                    {t.approxRelativeLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
