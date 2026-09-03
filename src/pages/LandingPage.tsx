import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CloudRain,
  Layers,
  Navigation,
  Bot,
  Activity,
  CheckCircle2,
  Database,
  Radio,
  Clock,
  Compass,
  Play,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const {
    selectedLocation,
    currentRainfall,
    runFullAnalysis,
    startPresentationMode,
    dataMode,
  } = useRainShield();

  const capabilities = [
    {
      icon: CloudRain,
      title: 'Multi-Source Radar & Rain Nowcast',
      desc: 'Fuses S-Band Doppler weather radar, INSAT-3DR satellite thermal IR, and 48 municipal AWS stations for sub-kilometer precipitation prediction.',
      tag: '0 - 3 Hour Horizon',
      route: '/forecast',
    },
    {
      icon: Layers,
      title: '2D Hydrodynamic Inundation',
      desc: 'Solves overland shallow water wave equations over 5m LiDAR DEMs to predict water depth, flood spread velocity, and lake weir overflows.',
      tag: 'Sub-Grid Drainage',
      route: '/inundation',
    },
    {
      icon: Navigation,
      title: 'Infrastructure & Safe Routing',
      desc: 'Overlays critical road underpasses, hospital trauma bays, and schools to calculate flood-avoidance routing for emergency responders.',
      tag: 'Asset Protection',
      route: '/impact',
    },
    {
      icon: Bot,
      title: 'Grounded AI Decision Support',
      desc: 'Agentic multi-tool system that directly queries real-time GIS state, provides multi-factor risk attribution, and generates formal early warning bulletins.',
      tag: 'Agentic Tool-Calling',
      route: '/dashboard',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col relative overflow-hidden select-none">
      {/* Background Decorative Radar Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 flex-1 flex flex-col items-center justify-center text-center">
        {/* Top Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold mb-6 shadow-lg shadow-cyan-950/50">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span>HYDRO-METEOROLOGICAL DISASTER INTELLIGENCE PLATFORM</span>
          <span className="bg-amber-900/80 text-amber-300 px-1.5 py-0.2 rounded text-[10px] uppercase font-mono">
            {dataMode} MODE
          </span>
        </div>

        {/* Product Brand */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white font-mono mb-4">
          RAIN<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">SHIELD</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl font-bold text-slate-200 tracking-tight max-w-3xl mb-3">
          &ldquo;Predict the Rain. See the Risk. Act Earlier.&rdquo;
        </p>

        {/* Supporting description */}
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed mb-8">
          AI-powered rainfall nowcasting, 2D overland inundation modeling, and critical infrastructure impact analysis for emergency disaster operations.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <button
            onClick={() => onNavigate('/dashboard')}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-cyan-500/25 border border-cyan-300 transition-all hover:scale-105 active:scale-95"
          >
            <Compass className="w-4 h-4 stroke-[2.5]" />
            <span>Enter Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={startPresentationMode}
            className="px-5 py-3.5 rounded-xl bg-[#0c162e] hover:bg-[#122044] text-cyan-300 border border-cyan-800/70 font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current text-cyan-400" />
            <span>Launch Presentation Briefing</span>
          </button>

          <button
            onClick={() => {
              runFullAnalysis();
              onNavigate('/dashboard');
            }}
            className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Run Full Analysis Simulation</span>
          </button>
        </div>

        {/* Real-Time Telemetry Bar for Bengaluru Catchment */}
        <div className="w-full max-w-4xl bg-[#091124]/90 backdrop-blur-md border border-cyan-900/60 rounded-2xl p-4 sm:p-5 shadow-2xl mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800 text-left">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                Active Demonstration Catchment: {selectedLocation.name}
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800">
              Catchment: {selectedLocation.catchmentName}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3.5 text-left font-mono">
            <div className="p-3 rounded-xl bg-[#060b18] border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Current Rainfall</div>
              <div className="text-lg font-bold text-cyan-300 mt-0.5">{currentRainfall.intensityMmHr} mm/hr</div>
              <div className="text-[10px] text-slate-500 mt-0.5">DWR Reflectivity {currentRainfall.radarReflectivityDbz} dBZ</div>
            </div>
            <div className="p-3 rounded-xl bg-[#060b18] border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Peak 3-Hour Forecast</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">112.5 mm/hr</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Convective Cloudburst (+120m)</div>
            </div>
            <div className="p-3 rounded-xl bg-[#060b18] border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Max Water Depth</div>
              <div className="text-lg font-bold text-sky-400 mt-0.5">1.95 meters</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Bellandur Lake Basin</div>
            </div>
            <div className="p-3 rounded-xl bg-[#060b18] border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Critical Roads Overlap</div>
              <div className="text-lg font-bold text-red-400 mt-0.5">4 Corridors</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Outer Ring Road & Silk Board</div>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="w-full max-w-5xl text-left">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
              ENGINEERED FOR DISASTER DECISION SPEED
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic scientific modeling from multi-source observation to tactical emergency directives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onNavigate(cap.route)}
                  className="p-5 rounded-2xl bg-[#091124]/70 hover:bg-[#0d1733] border border-cyan-950/70 hover:border-cyan-500/50 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900">
                        {cap.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 font-mono">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>Explore Workspace →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs font-mono text-slate-500">
        <p>RainShield • AI-Powered Rainfall, Inundation & Infrastructure Intelligence</p>
        <p className="text-[10px] text-slate-600 mt-1">Built for Emergency Operations Commanders & Hydrological Decision Support</p>
      </footer>
    </div>
  );
};
