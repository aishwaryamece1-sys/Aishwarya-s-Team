import React, { useState } from 'react';
import {
  Cpu,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
  Play,
  FileCode,
  Zap,
  BarChart3,
  RefreshCw,
  Info,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Download,
  Flame,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { MODEL_REGISTRY } from '../data/demoData';
import { ModelRegistryItem } from '../types';

export const ModelsPage: React.FC = () => {
  const { selectedLocation, addToast } = useRainShield();
  const [models, setModels] = useState<ModelRegistryItem[]>(MODEL_REGISTRY);
  const [selectedModel, setSelectedModel] = useState<ModelRegistryItem>(MODEL_REGISTRY[0]);
  
  // Interactive Inference Sandbox State
  const [testRainfallMm, setTestRainfallMm] = useState<number>(75);
  const [testSlopeDeg, setTestSlopeDeg] = useState<number>(0.8);
  const [testDrainageCapacity, setTestDrainageCapacity] = useState<number>(35);
  const [isInferenceRunning, setIsInferenceRunning] = useState<boolean>(false);
  const [inferenceResult, setInferenceResult] = useState<{
    predictedDepthM: number;
    riskCategory: string;
    flowVelocityMs: number;
    timeToPeakMin: number;
    confidenceScore: number;
    computeTimeMs: number;
  } | null>(null);

  const handleRunInference = () => {
    setIsInferenceRunning(true);
    setInferenceResult(null);

    setTimeout(() => {
      // Calculate realistic hydrodynamic & nowcast outputs based on parameters
      const depth = Number(((testRainfallMm / 60) * (1 - testDrainageCapacity / 100) * 1.35).toFixed(2));
      const velocity = Number((Math.sqrt(testSlopeDeg * 9.81 * depth) * 0.7).toFixed(2));
      const timeToPeak = Math.max(15, Math.round(90 - (testRainfallMm * 0.45)));
      const confidence = Math.min(99.4, 94.0 + (testRainfallMm > 50 ? 4.2 : 2.0));
      const computeTime = Math.floor(Math.random() * 80) + 140;

      let risk = 'MODERATE';
      if (depth > 1.2 || testRainfallMm > 80) risk = 'EXTREME';
      else if (depth > 0.7 || testRainfallMm > 50) risk = 'VERY_HIGH';
      else if (depth > 0.4) risk = 'HIGH';

      setInferenceResult({
        predictedDepthM: depth,
        riskCategory: risk,
        flowVelocityMs: velocity,
        timeToPeakMin: timeToPeak,
        confidenceScore: confidence,
        computeTimeMs: computeTime,
      });

      setIsInferenceRunning(false);
      addToast('Model Inference Executed', `Inference computed by ${selectedModel.name} in ${computeTime}ms.`, 'success');
    }, 600);
  };

  const handleExportModelCard = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedModel, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedModel.id}-model-card.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Model Card Exported', `Downloaded specification for ${selectedModel.name}`, 'info');
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto w-full select-none text-slate-800">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                Predictive AI & Hydrodynamic Models
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Physics-informed deep learning nowcasting, 2D Saint-Venant hydraulic solvers, and Bayesian multi-criteria hazard evaluation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportModelCard}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Model Card JSON</span>
          </button>
        </div>
      </div>

      {/* Models Grid (Top Overview) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {models.map(m => {
          const isSelected = selectedModel.id === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedModel(m)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'bg-white hover:border-slate-300 border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {m.status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">{m.version}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{m.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{m.type}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono text-emerald-700 font-semibold">{m.isEvaluationConnected ? 'Benchmark Active' : 'Agent Core'}</span>
                <span className="text-slate-400">View Specs →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split View: Selected Model Specs + Live Inference Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selected Model Technical Specifications (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Model Architecture & Parameters
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                {selectedModel.version}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{selectedModel.name}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedModel.notes}</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Neural / Numerical Architecture</span>
                <span className="text-xs font-semibold text-slate-900 mt-1 block font-mono leading-relaxed">
                  {selectedModel.architecture}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Input Tensor Feeds</span>
                  <span className="text-xs font-medium text-slate-800 mt-1 block leading-snug">
                    {selectedModel.input}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Output Predictions</span>
                  <span className="text-xs font-medium text-slate-800 mt-1 block leading-snug">
                    {selectedModel.output}
                  </span>
                </div>
              </div>
            </div>

            {/* Evaluation Metrics Leaderboard */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Benchmark Verification & Performance Metrics</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(selectedModel.evaluationMetrics).map(([metricKey, metricVal]) => (
                  <div key={metricKey} className="p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-medium block truncate" title={metricKey}>
                      {metricKey}
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block truncate">
                      {metricVal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Model Inference Sandbox (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Live Inference Sandbox
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Catchment: {selectedLocation.name}</span>
            </div>

            <p className="text-xs text-slate-500">
              Inject synthetic hydrological parameters to simulate real-time forward inference through the active model pipeline.
            </p>

            {/* Parameter Sliders */}
            <div className="space-y-3.5 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Rainfall Intensity</span>
                  <span className="font-mono font-bold text-emerald-700">{testRainfallMm} mm/hr</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="5"
                  value={testRainfallMm}
                  onChange={e => setTestRainfallMm(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Hydraulic Terrain Slope</span>
                  <span className="font-mono font-bold text-slate-800">{testSlopeDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={testSlopeDeg}
                  onChange={e => setTestSlopeDeg(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Effective Stormwater Drainage Capacity</span>
                  <span className="font-mono font-bold text-slate-800">{testDrainageCapacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={testDrainageCapacity}
                  onChange={e => setTestDrainageCapacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <button
                onClick={handleRunInference}
                disabled={isInferenceRunning}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-98 disabled:opacity-50 mt-2"
              >
                <Play className={`w-3.5 h-3.5 fill-white ${isInferenceRunning ? 'animate-spin' : ''}`} />
                <span>{isInferenceRunning ? 'Calculating Tensor Equations...' : 'Execute Test Inference'}</span>
              </button>
            </div>

            {/* Inference Output Card */}
            {inferenceResult && (
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Inference Output Received</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {inferenceResult.computeTimeMs} ms
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-medium block">Max Flood Depth</span>
                    <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                      {inferenceResult.predictedDepthM} m
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-medium block">Risk Classification</span>
                    <span className={`text-xs font-bold font-mono mt-1 inline-block px-2 py-0.5 rounded ${
                      inferenceResult.riskCategory === 'EXTREME'
                        ? 'bg-rose-100 text-rose-800'
                        : inferenceResult.riskCategory === 'VERY_HIGH'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {inferenceResult.riskCategory}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-medium block">Surface Wave Velocity</span>
                    <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                      {inferenceResult.flowVelocityMs} m/s
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-medium block">Est. Time to Basin Peak</span>
                    <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                      +{inferenceResult.timeToPeakMin} min
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                  <span>Ensemble Confidence: <strong className="text-emerald-700 font-mono">{inferenceResult.confidenceScore}%</strong></span>
                  <span className="text-slate-400">Physics Loss: 0.0042</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
