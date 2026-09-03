import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  MapPin,
  Activity,
  Play,
  Sparkles,
  Bell,
  Settings,
  Database,
  Layers,
  CloudRain,
  Radio,
  FileText,
  History,
  Cpu,
  Navigation,
  Compass,
  Search,
  Crosshair,
  RefreshCw,
  Download,
  AlertTriangle,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';
import { LocationService, GeocodingResult } from '../services/locationService';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  const {
    selectedLocation,
    dataMode,
    setDataMode,
    startPresentationMode,
    runFullAnalysis,
    isAnalyzing,
    alerts,
    realWeatherData,
    riskAssessment,
    isWeatherLoading,
    refreshRealWeather,
    handleSearchLocations,
    handleSelectGeocodedLocation,
    handleUseCurrentLocation,
    generateAndDownloadReport,
    addToast,
  } = useRainShield();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  // Direct search submission handler
  const handleSearchSubmit = async (customQuery?: string) => {
    const queryToUse = (customQuery ?? searchQuery).trim();
    if (!queryToUse) return;

    // Check if query is raw coordinates like "13.9315, 75.5679"
    const coordMatch = queryToUse.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setIsSearching(true);
        try {
          const geo = await LocationService.reverseGeocode(lat, lng);
          handleSelectGeocodedLocation(geo);
          setIsSearchOpen(false);
          setSearchQuery('');
          return;
        } catch (err) {
          console.error('Coordinate reverse geocode error:', err);
        } finally {
          setIsSearching(false);
        }
      }
    }

    // If an item in dropdown is selected via arrow keys
    if (isSearchOpen && searchResults.length > 0 && selectedIndex >= 0 && selectedIndex < searchResults.length) {
      handleSelectGeocodedLocation(searchResults[selectedIndex]);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSelectedIndex(-1);
      return;
    }

    // If search results are already loaded, select the first match
    if (searchResults.length > 0) {
      handleSelectGeocodedLocation(searchResults[0]);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSelectedIndex(-1);
      return;
    }

    // Direct geocoding fetch on Enter
    setIsSearching(true);
    try {
      const results = await handleSearchLocations(queryToUse);
      if (results && results.length > 0) {
        handleSelectGeocodedLocation(results[0]);
        setIsSearchOpen(false);
        setSearchQuery('');
        setSelectedIndex(-1);
      } else {
        addToast('Location Not Found', `No geographic coordinates found for "${queryToUse}".`, 'warning');
      }
    } catch (err) {
      console.error('Direct search submit error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsSearchOpen(true);
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Debounced geocoding search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSelectedIndex(-1);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await handleSearchLocations(searchQuery);
        setSearchResults(results);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearchLocations]);

  // Click outside search dismiss
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: '/dashboard', label: 'Command Center', icon: Compass },
    { id: '/monitoring', label: 'Monitoring', icon: Radio },
    { id: '/forecast', label: 'Rainfall', icon: CloudRain },
    { id: '/inundation', label: 'Inundation', icon: Layers },
    { id: '/impact', label: 'Impact', icon: Navigation },
    { id: '/alerts', label: 'Alerts', icon: ShieldAlert, badge: activeAlerts.length },
    { id: '/history', label: 'History & Cases', icon: History },
    { id: '/data-sources', label: 'Sources', icon: Database },
    { id: '/models', label: 'Models & ML', icon: Cpu },
    { id: '/reports', label: 'Reports (PDF)', icon: FileText },
  ];

  const getRiskBadgeColor = (level?: string) => {
    switch (level) {
      case 'EXTREME':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MODERATE':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 select-none shadow-md">
      {/* Top Notification / Critical Banner if Active Alert */}
      {activeAlerts.length > 0 && currentRoute !== '/alerts' && (
        <div className="bg-rose-900/90 border-b border-rose-700/60 px-4 py-1.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-rose-100">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
            </span>
            <span className="font-bold text-rose-900 uppercase tracking-wider text-[10px] bg-rose-200 px-2 py-0.5 rounded">
              Active Early Warning
            </span>
            <span className="truncate max-w-xl font-medium">{activeAlerts[0].title}</span>
          </div>
          <button
            onClick={() => onNavigate('/alerts')}
            className="text-rose-200 hover:text-white underline font-semibold flex items-center gap-1 shrink-0 ml-3"
          >
            Review Protocols & Actions →
          </button>
        </div>
      )}

      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => onNavigate('/')} className="flex items-center gap-3 group text-left focus:outline-none">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-sm group-hover:bg-emerald-600 transition-colors">
              <ShieldAlert className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans flex items-center">
                  Rain<span className="text-emerald-400">Shield</span>
                </span>
                <span className="text-[10px] font-mono font-bold tracking-wider bg-slate-800 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded uppercase">
                  INTELLIGENCE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
                Hyperlocal Rainfall & Weather Risk Platform
              </p>
            </div>
          </button>
        </div>

        {/* Global Real Location Search & Current GPS */}
        <div className="flex-1 max-w-md mx-2 hidden md:block" ref={searchContainerRef}>
          <div className="relative">
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="text-slate-400 hover:text-emerald-400 transition-colors mr-2 shrink-0"
                title="Search location"
              >
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search any global city, region, or coordinates..."
                className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full font-medium"
              />
              {isSearching && <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0 ml-1.5" />}
              {searchQuery.trim().length > 0 && !isSearching && (
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded mr-1 transition-colors"
                >
                  GO
                </button>
              )}
              <button
                onClick={handleUseCurrentLocation}
                disabled={isWeatherLoading}
                className="ml-1 text-slate-400 hover:text-emerald-400 p-1 rounded hover:bg-slate-700 transition-colors shrink-0 flex items-center gap-1 text-[11px] font-medium"
                title="Use Current GPS Geolocation"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isWeatherLoading ? 'animate-spin text-emerald-400' : ''}`} />
                <span className="hidden lg:inline">GPS</span>
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-72 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 flex items-center justify-between">
                  <span>Geocoding Results ({searchResults.length})</span>
                  <span className="text-[9px] text-slate-500 font-sans">Press Enter to select</span>
                </div>
                {searchResults.map((geo, idx) => {
                  const isHighlighted = idx === selectedIndex;
                  return (
                    <button
                      key={geo.id}
                      onClick={() => {
                        handleSelectGeocodedLocation(geo);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setSelectedIndex(-1);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-start gap-2.5 transition-colors ${
                        isHighlighted ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/70 text-slate-300'
                      }`}
                    >
                      <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isHighlighted ? 'text-emerald-300' : 'text-emerald-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate text-white">{geo.displayName}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Lat: {geo.lat.toFixed(4)}°, Lng: {geo.lng.toFixed(4)}° {geo.elevation ? `• ${geo.elevation}m MSL` : ''}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Global Controls, Risk Badge, Telemetry & Report Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Coordinates & Risk Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="font-mono text-[11px] text-slate-300">
              {selectedLocation.lat.toFixed(2)}°N, {selectedLocation.lng.toFixed(2)}°E
            </div>
            {riskAssessment && (
              <span
                className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border uppercase ${getRiskBadgeColor(
                  riskAssessment.riskLevel
                )}`}
              >
                {riskAssessment.overallScore}/100 {riskAssessment.riskLevel}
              </span>
            )}
          </div>

          {/* Quick Refresh */}
          <button
            onClick={refreshRealWeather}
            disabled={isWeatherLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Live Weather Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isWeatherLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Download Situation Report PDF Quick Action */}
          <button
            onClick={generateAndDownloadReport}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Generate & Download Official Situation Report (PDF)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">PDF Report</span>
          </button>

          {/* Run Full Analysis Quick Action Button */}
          <button
            onClick={runFullAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs shadow-sm transition-colors active:scale-95 disabled:opacity-50"
            title="Execute live multi-factor risk pipeline"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isAnalyzing ? 'Analyzing...' : 'Run Pipeline'}</span>
            <span className="sm:hidden">Run</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white uppercase tracking-wider">
                      Early Warnings & Alerts
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-bold">
                    {alerts.length} Total
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        onNavigate('/alerts');
                        setIsNotificationsOpen(false);
                      }}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                        a.severity === 'EXTREME'
                          ? 'bg-rose-950/30 border-rose-700/50 hover:bg-rose-950/50'
                          : a.severity === 'VERY_HIGH' || a.severity === 'HIGH'
                          ? 'bg-amber-950/30 border-amber-700/50 hover:bg-amber-950/50'
                          : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                            a.severity === 'EXTREME' ? 'bg-rose-900 text-rose-100' : 'bg-amber-900 text-amber-100'
                          }`}
                        >
                          {a.severity} RISK
                        </span>
                        <span className="text-[10px] text-slate-400">{a.timestamp}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-100 line-clamp-1">{a.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {a.affectedArea} • {a.rainfallIntensity}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    onNavigate('/alerts');
                    setIsNotificationsOpen(false);
                  }}
                  className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold text-center border border-slate-700 transition-colors"
                >
                  View All Early Warning Records →
                </button>
              </div>
            )}
          </div>

          {/* Settings Link */}
          <button
            onClick={() => onNavigate('/settings')}
            className={`p-2 rounded-lg border transition-colors ${
              currentRoute === '/settings'
                ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="System Preferences & Data Sources"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Location Search Bar */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 md:hidden" ref={searchContainerRef}>
        <div className="relative">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 focus-within:border-emerald-500">
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="text-slate-400 hover:text-emerald-400 mr-2 shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search any global location..."
              className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full"
            />
            {isSearching && <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0 ml-1.5" />}
            {searchQuery.trim().length > 0 && !isSearching && (
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded mr-1"
              >
                GO
              </button>
            )}
            <button
              onClick={handleUseCurrentLocation}
              disabled={isWeatherLoading}
              className="ml-1 text-emerald-400 p-1"
              title="Use GPS"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>

          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 max-h-60 overflow-y-auto">
              {searchResults.map((geo, idx) => (
                <button
                  key={geo.id}
                  onClick={() => {
                    handleSelectGeocodedLocation(geo);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSelectedIndex(-1);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs text-slate-300 block ${
                    idx === selectedIndex ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-white">{geo.displayName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Lat: {geo.lat.toFixed(4)}°, Lng: {geo.lng.toFixed(4)}°
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="px-4 lg:px-8 bg-slate-900/95 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = currentRoute === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs transition-colors shrink-0 ${
                isActive ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{link.label}</span>
              {link.badge !== undefined && link.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white">
                  {link.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
