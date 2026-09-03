import React, { useState } from 'react';
import {
  Database,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Activity,
  Layers,
  ArrowUpRight,
  Server,
  CloudRain,
  Sliders,
  ShieldCheck,
  Zap,
  Globe,
  Terminal,
  Clock,
  Download,
  Plus,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { DATA_SOURCES_STATUS, DATA_QUALITY_CHECKS } from '../data/demoData';
import { DataSourceStatus } from '../types';

export const DataSourcesPage: React.FC = () => {
  const { dataMode, setDataMode, selectedLocation, addToast } = useRainShield();
  const [sourcesList, setSourcesList] = useState<DataSourceStatus[]>(DATA_SOURCES_STATUS);
  const [selectedSource, setSelectedSource] = useState<DataSourceStatus>(DATA_SOURCES_STATUS[0]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newFeedName, setNewFeedName] = useState<string>('');
  const [newFeedType, setNewFeedType] = useState<string>('Automatic Weather Station');
  const [newFeedEndpoint, setNewFeedEndpoint] = useState<string>('https://api.sensors.gov.in/v1/aws/telemetry');

  const filteredSources = sourcesList.filter(s => {
    const matchesFilter = filterType === 'ALL' || s.type === filterType;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handlePingSource = (srcId: string) => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setSourcesList(prev => prev.map(s => {
        if (s.id === srcId) {
          return {
            ...s,
            lastUpdate: 'Just now',
            latencyMs: Math.floor(Math.random() * 30) + 15,
            qualityScore: Math.min(100, s.qualityScore + 1),
          };
        }
        return s;
      }));
      addToast('Data Source Synchronized', `Pinged ${selectedSource.name}. Response received with 0% packet loss.`, 'success');
    }, 500);
  };

  const handleCopyPayload = () => {
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
    addToast('Payload Copied', 'Sample JSON telemetry payload copied to clipboard.', 'info');
  };

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedName.trim()) return;

    const newSource: DataSourceStatus = {
      id: `src-custom-${Date.now()}`,
      name: newFeedName,
      type: newFeedType as any,
      status: 'ONLINE',
      lastUpdate: 'Just now',
      coverage: `Civic Catchment (${selectedLocation.name})`,
      purpose: 'User-configured custom telemetry ingest stream',
      qualityScore: 96,
      latencyMs: 38,
      mode: dataMode,
      provider: 'Custom Sensor Adapter',
      resolution: 'Real-time REST / MQTT',
      updateFrequency: 'Every 30 seconds',
    };

    setSourcesList(prev => [newSource, ...prev]);
    setSelectedSource(newSource);
    setIsAddModalOpen(false);
    setNewFeedName('');
    addToast('New Feed Added', `Ingestion endpoint registered: ${newSource.name}`, 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
      case 'GOOD':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'WARNING':
      case 'DEGRADED':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'CRITICAL':
      case 'OFFLINE':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto w-full select-none text-slate-800">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                Data Sources & Ingestion Streams
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time sensory telemetry feeds, Doppler radar arrays, satellite payloads, and GIS datasets for <span className="font-semibold text-slate-700">{selectedLocation.name}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setDataMode('DEMO')}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                dataMode === 'DEMO'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              DEMO SIMULATION
            </button>
            <button
              onClick={() => setDataMode('REAL')}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                dataMode === 'REAL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              LIVE SENSORY
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Connect New Sensor Stream</span>
          </button>
        </div>
      </div>

      {/* Top Stream Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Active Data Feeds</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {sourcesList.filter(s => s.status === 'ONLINE').length} / {sourcesList.length}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Ingestion Pipeline Nominal</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Mean Ingestion Latency</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {Math.round(sourcesList.reduce((acc, s) => acc + s.latencyMs, 0) / sourcesList.length)} ms
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Target SLA: &lt; 500 ms for cloudburst trigger
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Average Quality Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">
            {Math.round(sourcesList.reduce((acc, s) => acc + s.qualityScore, 0) / sourcesList.length)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Physics Bounds & Kalman Filter: Active
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Spatial Coverage</span>
            <Globe className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            100%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Full 120km Radar & AWS Catchment Area
          </div>
        </div>
      </div>

      {/* Main Content Layout: Stream List + Detailed Ingestion Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Feeds Filter & List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search feeds, sensors, or providers..."
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 w-full sm:w-64"
              />

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {['ALL', 'Satellite', 'Doppler Radar', 'Automatic Weather Station', 'NWP Ensemble', 'DEM Elevation'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
                      filterType === t
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'ALL' ? 'All Types' : t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredSources.map(src => {
                const isSelected = selectedSource.id === src.id;
                return (
                  <div
                    key={src.id}
                    onClick={() => setSelectedSource(src)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500/20 shadow-sm'
                        : 'bg-white hover:border-slate-300 border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${getStatusColor(src.status)}`}>
                            {src.status}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {src.type}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-400 font-mono">{src.updateFrequency}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">{src.name}</h3>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{src.purpose}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-emerald-700 font-mono">
                          {src.qualityScore}% Quality
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {src.latencyMs} ms latency
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[240px]">Provider: <strong className="text-slate-700">{src.provider}</strong></span>
                      <span className="font-mono text-slate-400">Synced: {src.lastUpdate}</span>
                    </div>
                  </div>
                );
              })}

              {filteredSources.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No data sources match the search criteria.
                </div>
              )}
            </div>
          </div>

          {/* Quality Assurance Checks List */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Automated Data Quality & Ingestion Checks
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                6/6 Passing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DATA_QUALITY_CHECKS.map(qc => (
                <div key={qc.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-900 truncate">{qc.name}</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded">
                        {qc.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{qc.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Source Deep Dive & Live Stream Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Source Telemetry Inspector
                </h2>
              </div>

              <button
                onClick={() => handlePingSource(selectedSource.id)}
                disabled={isPinging}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Testing Ping...' : 'Test Connection'}</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Source Feed Identifier</span>
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedSource.id}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedSource.name}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedSource.purpose}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Data Provider</span>
                <span className="text-xs font-semibold text-slate-900 mt-0.5 block">{selectedSource.provider}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Spatial Resolution</span>
                <span className="text-xs font-semibold text-slate-900 mt-0.5 block font-mono">{selectedSource.resolution}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Sync Cadence</span>
                <span className="text-xs font-semibold text-slate-900 mt-0.5 block font-mono">{selectedSource.updateFrequency}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Catchment Coverage</span>
                <span className="text-xs font-semibold text-slate-900 mt-0.5 block">{selectedSource.coverage}</span>
              </div>
            </div>

            {/* Simulated Live Stream Buffer Preview */}
            <div className="border border-slate-800 bg-slate-950 rounded-xl p-3.5 text-slate-200 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>STREAM_BUFFER_INGEST</span>
                </div>
                <button
                  onClick={handleCopyPayload}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                  title="Copy sample JSON payload"
                >
                  {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <div className="py-2.5 overflow-x-auto text-[11px] text-emerald-400 leading-relaxed font-mono">
                {`{
  "source_id": "${selectedSource.id}",
  "timestamp": "${new Date().toISOString()}",
  "basin": "${selectedLocation.id}",
  "status": "${selectedSource.status}",
  "quality_metric": ${selectedSource.qualityScore / 100},
  "ingest_latency_ms": ${selectedSource.latencyMs},
  "payload": {
    "units": "SI_HYDROMET",
    "grid_bounds": [${selectedLocation.bbox.join(', ')}],
    "records_count": 1420,
    "crc_checksum": "0x7F9A4E2B"
  }
}`}
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  TCP/IP Socket Streaming
                </span>
                <span>Buffer: 48 KB / Frame</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect New Sensor Stream Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl max-w-md w-full text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Connect Ingestion Stream</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFeed} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Stream / Sensor Name</label>
                <input
                  type="text"
                  required
                  value={newFeedName}
                  onChange={e => setNewFeedName(e.target.value)}
                  placeholder="e.g. Koramangala Lake Level Sensor #3"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Telemetry Sensor Type</label>
                <select
                  value={newFeedType}
                  onChange={e => setNewFeedType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Automatic Weather Station">Automatic Weather Station (AWS)</option>
                  <option value="Doppler Radar">Doppler Weather Radar (DWR)</option>
                  <option value="Satellite">Geostationary Meteorological Satellite</option>
                  <option value="Drainage Network">IoT Ultrasonic Water Level Gauge</option>
                  <option value="NWP Ensemble">Numerical Weather Prediction NWP Model</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ingestion Endpoint / MQTT Topic</label>
                <input
                  type="text"
                  required
                  value={newFeedEndpoint}
                  onChange={e => setNewFeedEndpoint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-colors"
                >
                  Register & Verify Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
