import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  Send,
  AlertTriangle,
  Radio,
  FileCheck,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { EarlyWarningAlert, RiskLevel } from '../types';

interface AlertGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertGeneratorModal: React.FC<AlertGeneratorModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedLocation,
    currentTimeStep,
    currentRainfall,
    currentInundationZones,
    addAlert,
    dataMode,
  } = useRainShield();

  const [severity, setSeverity] = useState<RiskLevel>('EXTREME');
  const [forecastWindow, setForecastWindow] = useState('Next 1 to 3 Hours (15:00 - 18:00 IST)');
  const [selectedActions, setSelectedActions] = useState<string[]>([
    'Issue corporate & tech corridor work-from-home release advisory.',
    'Barricade low-lying underpasses and divert traffic to elevated flyovers.',
    'Deploy high-capacity mobile dewatering pumps (5000 LPM) to primary lake sluices.',
    'Alert local hospitals (Sakra & St. Johns) to prepare alternate emergency ingress.',
  ]);

  if (!isOpen) return null;

  const totalArea = currentInundationZones.reduce((acc, z) => acc + z.affectedAreaSqKm, 0).toFixed(1);

  const handleToggleAction = (action: string) => {
    if (selectedActions.includes(action)) {
      setSelectedActions(selectedActions.filter(a => a !== action));
    } else {
      setSelectedActions([...selectedActions, action]);
    }
  };

  const handleDispatch = () => {
    const newAlert: EarlyWarningAlert = {
      id: `alert-rs-${Date.now()}`,
      alertNumber: `RS-EW-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      title: `${severity === 'EXTREME' ? 'RED ALERT' : severity === 'VERY_HIGH' ? 'ORANGE ALERT' : 'YELLOW ADVISORY'}: Severe Inundation Threat — ${selectedLocation.name}`,
      severity,
      locationName: `${selectedLocation.name} (${selectedLocation.description})`,
      forecastWindow,
      rainfallIntensity: `Peak ${currentRainfall.intensityMmHr} mm/hr (Accumulation > ${currentRainfall.accumulatedMm}mm)`,
      inundationRisk: `${severity} (Water depth up to ${Math.max(...currentInundationZones.map(z => z.waterDepthMeters), 0.5).toFixed(2)}m)`,
      affectedArea: `${totalArea} km² (Simulated Flood Footprint)`,
      criticalAssets: 'Outer Ring Road, Silk Board Junction, Sakra Hospital Corridor, Koramangala Valley',
      recommendedActions: selectedActions,
      dataSources: ['Doppler Weather Radar (DWR)', 'AWS Surface Network', '2D Hydrodynamic Flood Model', 'INSAT-3DR IR'],
      modelVersion: 'RainShield Nowcasting CNN-LSTM v2.4 + HydroFlood2D v3.1',
      uncertainty: 'High model consensus across 12-member ensemble (98.4% heavy precipitation confidence)',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
      dispatchedTo: ['Disaster Management Authority', 'Traffic Police HQ', 'Emergency Operations Zonal Center'],
    };

    addAlert(newAlert);
    onClose();
  };

  const candidateActions = [
    'Issue corporate & tech corridor work-from-home release advisory.',
    'Barricade low-lying underpasses and divert traffic to elevated flyovers.',
    'Deploy high-capacity mobile dewatering pumps (5000 LPM) to primary lake sluices.',
    'Alert local hospitals (Sakra & St. Johns) to prepare alternate emergency ingress.',
    'Pre-position NDRF motorized rubber boats at Bellandur Lake catchment.',
    'Isolate electrical substations in flooded basements to prevent grid hazards.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                <span>Incident Command Early Warning</span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                  {dataMode}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Generate Early Warning Bulletin
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
          {/* Severity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Warning Severity Level
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {(['MODERATE', 'HIGH', 'VERY_HIGH', 'EXTREME'] as RiskLevel[]).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  className={`py-2 px-2 rounded-lg font-semibold border transition-all text-center ${
                    severity === lvl
                      ? lvl === 'EXTREME'
                        ? 'bg-rose-50 text-rose-700 border-rose-500 shadow-2xs'
                        : lvl === 'VERY_HIGH'
                        ? 'bg-orange-50 text-orange-700 border-orange-500'
                        : lvl === 'HIGH'
                        ? 'bg-amber-50 text-amber-700 border-amber-500'
                        : 'bg-sky-50 text-sky-700 border-sky-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Location & Time Horizon Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] font-medium">Target Region:</span>
              <div className="font-bold text-slate-900">{selectedLocation.name}</div>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-medium">Rainfall Rate:</span>
              <div className="font-bold text-slate-900 font-mono">{currentRainfall.intensityMmHr} mm/hr</div>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-medium">Inundated Extent:</span>
              <div className="font-bold text-amber-700 font-mono">{totalArea} km²</div>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-medium">Time Horizon:</span>
              <div className="font-bold text-emerald-700 font-mono">{currentTimeStep}</div>
            </div>
          </div>

          {/* Forecast Window Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Forecast Window
            </label>
            <input
              type="text"
              value={forecastWindow}
              onChange={e => setForecastWindow(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Action Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Tactical Action Directives</span>
              <span className="text-emerald-700 font-semibold">{selectedActions.length} Selected</span>
            </label>
            <div className="space-y-1.5">
              {candidateActions.map(action => {
                const isSelected = selectedActions.includes(action);
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => handleToggleAction(action)}
                    className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <CheckSquare className="w-3.5 h-3.5" />}
                    </div>
                    <span className="flex-1 leading-snug">{action}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Decision Support Notice */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Decision-support simulation. Requires authorized human validation prior to broadcast.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Issue & Broadcast Early Warning</span>
          </button>
        </div>
      </div>
    </div>
  );
};
