import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  Database,
  CloudRain,
  Layers,
  ShieldAlert,
  Navigation,
  FileCheck,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';

export const FullAnalysisModal: React.FC = () => {
  const { isAnalyzing, analysisStep, selectedLocation } = useRainShield();

  if (!isAnalyzing) return null;

  const analysisSteps = [
    { step: 1, title: 'Geospatial Scope Validation', desc: `Targeting ${selectedLocation.name} basin boundaries (SRTM DEM)`, icon: Database },
    { step: 2, title: 'Data Quality & Clock Synchronization', desc: 'Validating NTP drift across 48 AWS sensors and DWR Doppler stream', icon: CheckCircle2 },
    { step: 3, title: 'Multi-Source Meteorological Data Fusion', desc: 'Fusing INSAT-3DR IR + DWR S-Band Radar Reflectivity', icon: Sparkles },
    { step: 4, title: 'Nowcasting CNN-LSTM Rainfall Inference', desc: 'Generating 250m grid rainfall intensity & precipitation probability', icon: CloudRain },
    { step: 5, title: 'HydroFlood2D Overland Shallow Water Simulation', desc: 'Solving St. Venant 2D hydraulic equations over urban terrain', icon: Layers },
    { step: 6, title: 'Bayesian Multi-Factor Risk Assessment', desc: 'Weighting rainfall intensity, slope, and drainage network deficit', icon: ShieldAlert },
    { step: 7, title: 'Critical Infrastructure Spatial Overlap', desc: 'Cross-referencing road underpasses, hospital ingress, and power substations', icon: Navigation },
    { step: 8, title: 'Emergency Response Priority Ranking', desc: 'Ranking urban catchment zones by intervention urgency (Priority 1 to 5)', icon: FileCheck },
    { step: 9, title: 'Decision Support Bulletin Synthesis', desc: 'Synthesizing early warnings and traffic diversion advisories', icon: Sparkles },
    { step: 10, title: 'Command Center State Synchronization', desc: 'Broadcasting refreshed state to GIS Map, Timeline, and AI Assistant', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-[#091124] border border-cyan-500/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 text-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400 shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-5 h-5 text-white animate-spin" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
              END-TO-END HYDRO-METEOROLOGICAL PIPELINE
            </div>
            <h3 className="text-base font-bold text-white">
              Executing Full Analysis — {selectedLocation.name}
            </h3>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-400">Pipeline Execution:</span>
            <span className="font-bold text-cyan-300">Step {analysisStep} of 10 ({analysisStep * 10}%)</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${analysisStep * 10}%` }}
            />
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {analysisSteps.map(s => {
            const isCompleted = s.step < analysisStep;
            const isCurrent = s.step === analysisStep;
            const Icon = s.icon;

            return (
              <div
                key={s.step}
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-3 transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/60 border-cyan-500/60 text-white shadow-md'
                    : isCompleted
                    ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                    : 'bg-slate-950/30 border-slate-900 text-slate-600'
                }`}
              >
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono">
                      {s.step}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className={`font-semibold ${isCurrent ? 'text-cyan-300' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                    {s.title}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
