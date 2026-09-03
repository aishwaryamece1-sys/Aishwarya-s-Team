import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Send,
  Printer,
  CheckCircle2,
  Clock,
  Radio,
  FileCheck,
  AlertTriangle,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { AlertGeneratorModal } from '../components/AlertGeneratorModal';
import { EarlyWarningAlert, RiskLevel } from '../types';

export const AlertsPage: React.FC = () => {
  const {
    alerts,
    setAlerts,
    selectedLocation,
    currentTimeStep,
    addToast,
    dataMode,
  } = useRainShield();

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');

  const activeAlert = alerts.find(a => a.id === selectedAlertId) || alerts[0];

  const handlePrint = () => {
    window.print();
    addToast('Print Triggered', 'Formatted emergency dispatch bulletin for printing.', 'info');
  };

  const handleAcknowledge = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'EXPIRED' } : a))
    );
    addToast('Alert Acknowledged', 'Disaster Command marked bulletin as acknowledged.', 'success');
  };

  const getSeverityBadge = (level: RiskLevel) => {
    switch (level) {
      case 'EXTREME': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'VERY_HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'HIGH': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MODERATE': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1700px] mx-auto w-full select-none text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
              Early Warning & Emergency Disaster Bulletins
            </h1>
            <span className="text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full">
              {alerts.filter(a => a.status === 'ACTIVE').length} ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Standardized hydro-meteorological early warning bulletins for disaster authorities and public safety agencies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Early Warning</span>
          </button>
        </div>
      </div>

      {/* 2-Column Layout: Left Alerts List, Right Active Bulletin Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Alerts Master List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Bulletin Archive ({alerts.length})</span>
            <span className="text-emerald-700 font-semibold text-xs">{selectedLocation.name}</span>
          </div>

          <div className="space-y-2.5">
            {alerts.map(a => {
              const isSelected = selectedAlertId === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAlertId(a.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                      : 'bg-white hover:border-slate-300 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-emerald-800">{a.alertNumber}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(a.severity)}`}>
                        {a.severity}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${a.status === 'ACTIVE' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {a.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mb-1.5 leading-snug line-clamp-1">{a.title}</h3>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-100">
                    <span>{a.forecastWindow}</span>
                    <span className="text-slate-400">{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Bulletin Document (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 text-xs">
          {activeAlert ? (
            <>
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-800 font-semibold mb-1">
                    <span className="uppercase tracking-wider">{activeAlert.alertNumber}</span>
                    <span>•</span>
                    <span>DISPATCHED: {new Date(activeAlert.timestamp).toLocaleString()} IST</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {activeAlert.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
                    title="Print Bulletin"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {activeAlert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAcknowledge(activeAlert.id)}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Hazard Core Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[11px] font-medium">Precipitation Threat</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">{activeAlert.rainfallIntensity}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[11px] font-medium">Inundation Hazard Level</div>
                  <div className="font-bold text-amber-600 font-mono mt-0.5">{activeAlert.inundationRisk}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[11px] font-medium">Simulated Flood Footprint</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">{activeAlert.affectedArea}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[11px] font-medium">Target Location Window</div>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">{activeAlert.forecastWindow}</div>
                </div>
              </div>

              {/* Critical Assets At Risk */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                  High-Priority Critical Infrastructure in Danger Envelope
                </div>
                <div className="text-slate-800 font-medium leading-relaxed">{activeAlert.criticalAssets}</div>
              </div>

              {/* Recommended Tactical Actions */}
              <div className="space-y-2.5">
                <div className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                  Authorized Incident Command Tactical Directives
                </div>
                <div className="space-y-2">
                  {activeAlert.recommendedActions.map((action, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-slate-800"
                    >
                      <span className="font-mono text-emerald-700 font-bold mt-0.5">{i + 1}.</span>
                      <span className="leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Lineage, Model & Uncertainty */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Info className="w-3.5 h-3.5" />
                  <span>Scientific Model Lineage & Grounding ({dataMode} MODE):</span>
                </div>
                <div>• Model Engine: <span className="font-mono text-slate-800">{activeAlert.modelVersion}</span></div>
                <div>• Ingested Feeds: <span className="font-mono text-slate-800">{activeAlert.dataSources.join(', ')}</span></div>
                <div>• Confidence: <span className="font-mono text-slate-800">{activeAlert.uncertainty}</span></div>
                <div className="pt-2 border-t border-slate-200 text-amber-800 font-medium">
                  ⚠️ Notice: Decision-support simulation. Requires authorized human validation prior to broadcast.
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">No alert selected.</div>
          )}
        </div>
      </div>

      <AlertGeneratorModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} />
    </div>
  );
};
