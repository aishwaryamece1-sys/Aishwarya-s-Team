export type DataMode = 'DEMO' | 'REAL';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'EXTREME';

export type TimeStep = 'NOW' | '+30' | '+60' | '+90' | '+120' | '+180';

export interface LocationInfo {
  id: string;
  name: string;
  displayName?: string;
  formattedAddress?: string;
  city?: string;
  district?: string;
  state: string;
  country: string;
  countryCode?: string;
  lat: number;
  lng: number;
  zoom: number;
  bbox: [number, number, number, number]; // [minLat, minLng, maxLat, maxLng]
  description: string;
  catchmentName: string;
  drainageIndex: number; // 0 - 100
  terrainType: string;
  populationEstimate: string;
  placeId?: string;
}

export interface MapLayer {
  id: string;
  name: string;
  group: 'weather' | 'inundation' | 'infrastructure' | 'terrain';
  visible: boolean;
  opacity: number;
  source: string;
  timestamp: string;
  mode: 'DEMO' | 'REAL';
  description: string;
  color?: string;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  type: 'Satellite' | 'Doppler Radar' | 'Automatic Weather Station' | 'NWP Ensemble' | 'DEM Elevation' | 'Drainage Network' | 'Hydrological History';
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'OFFLINE';
  lastUpdate: string;
  coverage: string;
  purpose: string;
  qualityScore: number; // 0 - 100
  latencyMs: number;
  mode: DataMode;
  provider: string;
  resolution: string;
  updateFrequency: string;
}

export interface DataQualityCheck {
  id: string;
  name: string;
  category: string;
  status: 'GOOD' | 'WARNING' | 'CRITICAL' | 'UNAVAILABLE';
  value: string;
  threshold: string;
  details: string;
  testedAt: string;
}

export interface RainfallForecastPoint {
  timeOffset: TimeStep;
  timestamp: string;
  intensityMmHr: number;
  accumulatedMm: number;
  probabilityPercent: number;
  radarReflectivityDbz: number;
  risk: RiskLevel;
}

export interface RainfallGridCell {
  id: string;
  lat: number;
  lng: number;
  intensityMmHr: number;
  radarDbz: number;
  probability: number;
}

export interface InundationZone {
  id: string;
  name: string;
  neighborhood: string;
  center: [number, number];
  coordinates: [number, number][];
  riskLevel: RiskLevel;
  waterDepthMeters: number; // e.g. 0.35m to 1.85m
  affectedAreaSqKm: number;
  waterVolumeM3: number;
  terrainSlopeDeg: number;
  drainageCapacityPct: number;
  historicalFloodsCount: number;
  factors: {
    rainfallIntensity: number; // 0-100 score
    accumulation: number;
    terrainVulnerability: number;
    drainageDeficit: number;
    historicalTendency: number;
  };
  explanation: string;
  priorityRank: number; // 1 = highest
  criticalAssetsNearby: string[];
}

export type AssetType = 'hospital' | 'school' | 'road' | 'railway' | 'airport' | 'power' | 'emergency' | 'residential' | 'ROAD' | 'HOSPITAL' | 'SUBSTATION' | 'SCHOOL' | 'CRITICAL';

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  riskLevel: RiskLevel;
  waterDepthMeters?: number;
  locationName?: string;
  accessStatus?: string;
  advisory?: string;
  status?: 'OPERATIONAL' | 'MONITORING' | 'POTENTIALLY_AFFECTED' | 'DIVERT_RECOMMENDED';
  distanceToInundationM?: number;
  predictedDepthM?: number;
  roadLengthKm?: number;
  roadCategory?: string;
  capacity?: string;
  address?: string;
  notes?: string;
}

export interface EarlyWarningAlert {
  id: string;
  alertNumber: string;
  title: string;
  severity: RiskLevel;
  locationName: string;
  forecastWindow: string;
  rainfallIntensity: string;
  inundationRisk: string;
  affectedArea: string;
  criticalAssets: string;
  recommendedActions: string[];
  dataSources: string[];
  modelVersion: string;
  uncertainty: string;
  timestamp: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';
  acknowledgedBy?: string;
  dispatchedTo: string[];
}

export interface AnalysisWorkflowStep {
  stepId: number;
  name: string;
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  durationMs: number;
  dataSource: string;
  resultSummary?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  executionTrace?: AnalysisWorkflowStep[];
  evidence?: {
    sources: string[];
    timestamp: string;
    model: string;
    mode: DataMode;
    keyMetrics: Record<string, string | number>;
  };
}

export interface SafeRoute {
  id: string;
  name: string;
  originName: string;
  destinationName: string;
  originCoords: [number, number];
  destinationCoords: [number, number];
  waypoints: [number, number][];
  distanceKm: number;
  estimatedTimeMin: number;
  safetyScore: number; // 0-100
  avoidedRiskZones: string[];
  clearanceMarginMeters: number;
}

export interface SessionHistoryItem {
  id: string;
  timestamp: string;
  locationName: string;
  timeStep: TimeStep;
  peakRainfallMm: number;
  maxRisk: RiskLevel;
  affectedAreaSqKm: number;
  criticalAssetsCount: number;
  alertCount: number;
  model: string;
  querySummary: string;
}

export interface ModelRegistryItem {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'ACTIVE_DEPLOYED' | 'STANDBY' | 'EVALUATING';
  input: string;
  output: string;
  lastInference: string;
  architecture: string;
  evaluationMetrics: Record<string, string>;
  isEvaluationConnected: boolean;
  notes: string;
}

export interface SystemSettings {
  defaultLocationId: string;
  dataMode: DataMode;
  units: {
    rainfall: 'mm' | 'in';
    area: 'km²' | 'acres' | 'sq_miles';
    depth: 'meters' | 'feet';
    temperature: '°C' | '°F';
  };
  thresholds: {
    highRainfallMmHr: number;
    extremeRainfallMmHr: number;
    criticalWaterDepthM: number;
  };
  mapStyle: 'dark-carto' | 'satellite-dark' | 'terrain-hybrid' | 'minimal-vector';
  audioAlertsEnabled: boolean;
  autoRefreshIntervalSec: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

export interface RealCurrentWeather {
  temperatureC: number;
  apparentTemperatureC: number;
  relativeHumidityPct: number;
  precipitationMm: number;
  rainMm: number;
  showersMm: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeedKmh: number;
  windDirectionDeg: number;
  surfacePressureHpa: number;
  isDay: boolean;
  timestamp: string;
}

export interface HourlyWeatherPoint {
  time: string;
  displayTime: string;
  temperatureC: number;
  precipitationMm: number;
  rainMm: number;
  precipitationProbabilityPct: number;
  humidityPct: number;
  windSpeedKmh: number;
  surfacePressureHpa: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface DailyWeatherPoint {
  date: string;
  displayDate: string;
  temperatureMaxC: number;
  temperatureMinC: number;
  precipitationSumMm: number;
  rainSumMm: number;
  precipitationProbabilityMaxPct: number;
  windSpeedMaxKmh: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface RealWeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lng: number;
    elevationM?: number;
    timezone: string;
  };
  current: RealCurrentWeather;
  hourly: HourlyWeatherPoint[];
  daily: DailyWeatherPoint[];
  retrievedAt: string;
  source: string;
}

export interface HistoricalClimateSummary {
  locationName: string;
  lat: number;
  lng: number;
  yearsAnalyzed: string; // e.g. "2016 - 2025"
  monthlyBaselineMm: { month: string; avgRainfallMm: number; maxRainfallMm: number }[];
  annualMeanPrecipitationMm: number;
  max24hRainfallRecordMm: number;
  extremeRainfallThreshold95thMm: number;
  extremeRainfallThreshold99thMm: number;
  currentMonthlyBaselineMm: number;
  currentForecastRainfall24hMm: number;
  anomalyPercent: number; // e.g. +145% vs baseline
  anomalyClassification: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'EXTREME';
  dataSource: string;
  citation: string;
}

export interface HistoricalDisasterCaseStudy {
  id: string;
  eventName: string;
  year: number;
  dateRange: string;
  region: string;
  country: string;
  centerCoords: [number, number];
  hazardType: string;
  meteorologicalTrigger: string;
  peakPrecipitation: string;
  fatalities: string;
  affectedPopulation: string;
  economicDamagesUsd: string;
  keyConsequences: string[];
  authoritativeSources: string[];
  isVerifiedCaseStudy: true;
}

export interface HazardModuleAssessment {
  id: string;
  name: string;
  level: RiskLevel;
  score: number; // 0 - 100
  metricValue: string;
  metricLabel: string;
  status: 'ACTIVE' | 'ELEVATED' | 'NOMINAL' | 'INSUFFICIENT_DATA';
  rationale: string;
}

export interface ExplainableRiskAssessment {
  overallScore: number; // 0 - 100
  riskLevel: RiskLevel;
  isAtRisk: boolean;
  headline: string;
  commonPersonSummary: string;
  whyFactors: string[];
  actionRecommendations: string[];
  hazardModules: HazardModuleAssessment[];
  timestamp: string;
  dataSources: string[];
  methodologyNote: string;
}

export interface SituationReportRecord {
  id: string;
  reportNumber: string;
  timestamp: string;
  locationName: string;
  coordinates: [number, number];
  riskScore: number;
  riskLevel: RiskLevel;
  rainfallCurrentMm: number;
  rainfall24hForecastMm: number;
  temperatureC: number;
  primaryHazard: string;
  dataSources: string[];
  fileName: string;
}
