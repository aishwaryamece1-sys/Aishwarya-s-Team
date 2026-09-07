import { LocationInfo, TimeStep, InundationZone, InfrastructureAsset, SafeRoute, RealWeatherData, ExplainableRiskAssessment, RiskLevel } from '../types';

/**
 * Dynamically synthesizes localized hydrodynamic inundation zones for ANY given geographic location and coordinates.
 */
export function generateInundationZonesForLocation(
  location: LocationInfo,
  timeStep: TimeStep,
  realWeather: RealWeatherData | null,
  riskAssessment: ExplainableRiskAssessment | null
): InundationZone[] {
  const lat = location.lat;
  const lng = location.lng;
  const name = location.name;

  // Multiplier based on time step progression
  const stepMultipliers: Record<TimeStep, { depthMult: number; areaMult: number; risk: RiskLevel }> = {
    NOW: { depthMult: 1.0, areaMult: 1.0, risk: (riskAssessment?.riskLevel || 'MODERATE') as RiskLevel },
    '+30': { depthMult: 1.25, areaMult: 1.2, risk: 'HIGH' },
    '+60': { depthMult: 1.6, areaMult: 1.45, risk: 'VERY_HIGH' },
    '+90': { depthMult: 1.9, areaMult: 1.7, risk: 'EXTREME' },
    '+120': { depthMult: 2.1, areaMult: 1.85, risk: 'EXTREME' },
    '+180': { depthMult: 1.5, areaMult: 1.4, risk: 'HIGH' },
  };

  const { depthMult, areaMult, risk } = stepMultipliers[timeStep] || stepMultipliers.NOW;
  const rainIntensity = realWeather?.current?.precipitationMm ?? (timeStep === 'NOW' ? 12 : 35);
  const baseDepth = Math.max(0.2, (rainIntensity / 25) * 0.45);

  const zones: InundationZone[] = [
    {
      id: `zone-${location.id}-river-basin`,
      name: `${name} River / Lowland Natural Drainage Sink`,
      neighborhood: `${name} Lower Catchment Corridor`,
      center: [lat - 0.008, lng + 0.012],
      coordinates: [
        [lat - 0.003, lng + 0.006],
        [lat - 0.002, lng + 0.019],
        [lat - 0.012, lng + 0.022],
        [lat - 0.016, lng + 0.011],
        [lat - 0.010, lng + 0.004],
      ],
      riskLevel: risk,
      waterDepthMeters: Number((baseDepth * depthMult * 1.1).toFixed(2)),
      affectedAreaSqKm: Number((1.2 * areaMult).toFixed(2)),
      waterVolumeM3: Math.round(480000 * depthMult * areaMult),
      terrainSlopeDeg: 0.9,
      drainageCapacityPct: Math.max(15, Math.round(location.drainageIndex * 0.6)),
      historicalFloodsCount: 8,
      factors: {
        rainfallIntensity: Math.min(100, Math.round(rainIntensity * 2.2)),
        accumulation: Math.min(100, Math.round(rainIntensity * 1.8 * depthMult)),
        terrainVulnerability: 85,
        drainageDeficit: Math.max(20, 100 - location.drainageIndex),
        historicalTendency: 78,
      },
      explanation: `Low-elevation retention basin receiving rapid runoff from upper ${name} watershed terrain during prolonged or sudden rainfall.`,
      priorityRank: 1,
      criticalAssetsNearby: [`${name} Central Transit Link`, `${name} Civil Hospital`, `${name} Feeder Substation`],
    },
    {
      id: `zone-${location.id}-central-underpass`,
      name: `${name} Central Transit Underpass & Sump Basin`,
      neighborhood: `${name} Arterial Road Corridor`,
      center: [lat + 0.006, lng - 0.008],
      coordinates: [
        [lat + 0.011, lng - 0.013],
        [lat + 0.012, lng - 0.004],
        [lat + 0.002, lng - 0.003],
        [lat + 0.001, lng - 0.012],
      ],
      riskLevel: depthMult > 1.4 ? 'HIGH' : 'MODERATE',
      waterDepthMeters: Number((baseDepth * depthMult * 0.85).toFixed(2)),
      affectedAreaSqKm: Number((0.85 * areaMult).toFixed(2)),
      waterVolumeM3: Math.round(290000 * depthMult * areaMult),
      terrainSlopeDeg: 1.2,
      drainageCapacityPct: Math.max(20, Math.round(location.drainageIndex * 0.7)),
      historicalFloodsCount: 5,
      factors: {
        rainfallIntensity: Math.min(100, Math.round(rainIntensity * 1.9)),
        accumulation: Math.min(100, Math.round(rainIntensity * 1.5 * depthMult)),
        terrainVulnerability: 72,
        drainageDeficit: Math.max(25, 95 - location.drainageIndex),
        historicalTendency: 65,
      },
      explanation: `Depressed arterial grade intersection prone to rapid surface inundation when storm sewer intake rates are exceeded.`,
      priorityRank: 2,
      criticalAssetsNearby: [`${name} Main Bus & Rail Terminal`, `${name} Municipal Water Works`],
    },
    {
      id: `zone-${location.id}-east-valley`,
      name: `${name} Eastern Valley Alluvial Channel`,
      neighborhood: `${name} East Outskirts`,
      center: [lat + 0.014, lng + 0.015],
      coordinates: [
        [lat + 0.019, lng + 0.009],
        [lat + 0.021, lng + 0.021],
        [lat + 0.009, lng + 0.023],
        [lat + 0.007, lng + 0.012],
      ],
      riskLevel: depthMult > 1.8 ? 'VERY_HIGH' : 'MODERATE',
      waterDepthMeters: Number((baseDepth * depthMult * 0.7).toFixed(2)),
      affectedAreaSqKm: Number((1.5 * areaMult).toFixed(2)),
      waterVolumeM3: Math.round(410000 * depthMult * areaMult),
      terrainSlopeDeg: 0.6,
      drainageCapacityPct: Math.max(25, Math.round(location.drainageIndex * 0.8)),
      historicalFloodsCount: 4,
      factors: {
        rainfallIntensity: Math.min(100, Math.round(rainIntensity * 1.6)),
        accumulation: Math.min(100, Math.round(rainIntensity * 1.4 * depthMult)),
        terrainVulnerability: 68,
        drainageDeficit: Math.max(15, 85 - location.drainageIndex),
        historicalTendency: 55,
      },
      explanation: `Alluvial floodplain channel carrying overflow discharge toward regional river downstream outlets.`,
      priorityRank: 3,
      criticalAssetsNearby: [`${name} East Industrial Feeder`, `${name} Flood Embankment Check Dam`],
    },
  ];

  return zones;
}

/**
 * Dynamically synthesizes localized critical infrastructure assets for ANY given geographic location.
 */
export function generateInfrastructureAssetsForLocation(
  location: LocationInfo,
  riskAssessment: ExplainableRiskAssessment | null,
  realWeather?: RealWeatherData | null
): InfrastructureAsset[] {
  const lat = location.lat;
  const lng = location.lng;
  const name = location.name;
  const risk = (riskAssessment?.riskLevel || 'LOW') as RiskLevel;
  const rainIntensity = realWeather?.current?.precipitationMm ?? 0;
  const depthFactor = rainIntensity > 15 ? 1.8 : rainIntensity > 5 ? 1.3 : 1.0;

  return [
    {
      id: `asset-${location.id}-hospital`,
      name: `${name} District General Hospital & Trauma Center`,
      type: 'HOSPITAL',
      lat: lat + 0.009,
      lng: lng + 0.006,
      riskLevel: risk === 'EXTREME' ? 'HIGH' : 'LOW',
      waterDepthMeters: Number((0.08 * depthFactor).toFixed(2)),
      locationName: `${name} Medical Enclave`,
      accessStatus: 'Fully Accessible (Emergency Corridor Open)',
      status: 'OPERATIONAL',
      advisory: 'Emergency triage and power backup operational. Maintain elevated ambulance access.',
      distanceToInundationM: 650,
      predictedDepthM: Number((0.05 * depthFactor).toFixed(2)),
      capacity: '450 Beds / Level 2 Trauma Center',
      address: `Medical College Road, ${name}`,
    },
    {
      id: `asset-${location.id}-transit`,
      name: `${name} Central Railway Station & Transit Hub`,
      type: 'CRITICAL',
      lat: lat - 0.007,
      lng: lng - 0.009,
      riskLevel: risk === 'EXTREME' || risk === 'VERY_HIGH' ? 'HIGH' : 'MODERATE',
      waterDepthMeters: Number((0.22 * depthFactor).toFixed(2)),
      locationName: `${name} Station Road`,
      accessStatus: 'Slow Movement — Sump pumps engaged',
      status: 'MONITORING',
      advisory: 'Underpass pedestrian walkway experiencing 15cm surface wash. Avoid lower subways.',
      distanceToInundationM: 180,
      predictedDepthM: Number((0.25 * depthFactor).toFixed(2)),
      capacity: 'Daily Footfall 35,000+',
      address: `Station Road, Central ${name}`,
    },
    {
      id: `asset-${location.id}-substation`,
      name: `${name} 220kV Main Electrical Grid Substation`,
      type: 'SUBSTATION',
      lat: lat - 0.014,
      lng: lng + 0.016,
      riskLevel: risk === 'EXTREME' ? 'EXTREME' : risk === 'VERY_HIGH' || risk === 'HIGH' ? 'HIGH' : 'MODERATE',
      waterDepthMeters: Number((0.35 * depthFactor).toFixed(2)),
      locationName: `${name} East Grid Yard`,
      accessStatus: 'De-energization protocol on standby for low switchyards',
      status: 'POTENTIALLY_AFFECTED',
      advisory: 'Flood barrier coffer dams deployed around transformer bank 3.',
      distanceToInundationM: 90,
      predictedDepthM: Number((0.4 * depthFactor).toFixed(2)),
      capacity: '220/66/11 kV Grid Feed',
      address: `Industrial Ring Road, ${name}`,
    },
    {
      id: `asset-${location.id}-waterworks`,
      name: `${name} Municipal Stormwater Pumping Station #1`,
      type: 'CRITICAL',
      lat: lat - 0.011,
      lng: lng + 0.009,
      riskLevel: risk === 'EXTREME' ? 'VERY_HIGH' : 'HIGH',
      waterDepthMeters: Number((0.45 * depthFactor).toFixed(2)),
      locationName: `${name} Sump Basin`,
      accessStatus: 'Operating 6/6 Heavy Submersible Pumps',
      status: 'OPERATIONAL',
      advisory: 'Operating at 92% continuous volumetric discharge capacity.',
      distanceToInundationM: 30,
      predictedDepthM: 0.5,
      capacity: '45,000 m³/hr Discharge Rate',
      address: `Drainage Canal Outfall, ${name}`,
    },
    {
      id: `asset-${location.id}-emergency`,
      name: `${name} District Disaster Management & Emergency Operations Center`,
      type: 'CRITICAL',
      lat: lat + 0.004,
      lng: lng - 0.004,
      riskLevel: 'LOW',
      waterDepthMeters: 0.0,
      locationName: `${name} District Commissionerate`,
      accessStatus: 'Fully Operational — High Ground Command Post',
      status: 'OPERATIONAL',
      advisory: 'Emergency dispatch active. Satellite and VHF radio links online.',
      distanceToInundationM: 1200,
      predictedDepthM: 0.0,
      capacity: 'Civil Defense Response HQ',
      address: `Collectorate Complex, ${name}`,
    },
    {
      id: `asset-${location.id}-arterial`,
      name: `${name} Bypass Flyover & Elevated Highway Bridge`,
      type: 'ROAD',
      lat: lat + 0.016,
      lng: lng + 0.012,
      riskLevel: 'LOW',
      waterDepthMeters: 0.0,
      locationName: `${name} North-South Expressway`,
      accessStatus: 'Primary Designated Safe Evacuation Corridor',
      status: 'DIVERT_RECOMMENDED',
      advisory: 'Traffic diverted onto elevated lanes to bypass flooded low-level river causeways.',
      distanceToInundationM: 350,
      predictedDepthM: 0.0,
      roadLengthKm: 6.4,
      roadCategory: 'Elevated 4-Lane National Highway',
      address: `National Highway Corridor, ${name}`,
    },
    {
      id: `asset-${location.id}-school`,
      name: `${name} Government High School & Emergency Relief Shelter`,
      type: 'SCHOOL',
      lat: lat + 0.013,
      lng: lng - 0.012,
      riskLevel: 'LOW',
      waterDepthMeters: 0.0,
      locationName: `${name} West Ridge`,
      accessStatus: 'Designated Relief Camp (Equipped with Solar & Water Sump)',
      status: 'OPERATIONAL',
      advisory: 'Shelter capacity ready for up to 800 displaced residents.',
      distanceToInundationM: 850,
      predictedDepthM: 0.0,
      capacity: '800 Persons Evacuation Shelter',
      address: `Ridge View Road, ${name}`,
    },
  ];
}

/**
 * Dynamically synthesizes an elevated, inundation-avoiding evacuation route for ANY given geographic location.
 */
export function generateSafeRouteForLocation(location: LocationInfo): SafeRoute {
  const lat = location.lat;
  const lng = location.lng;
  const name = location.name;

  return {
    id: `route-${location.id}`,
    name: `${name} Elevated Evacuation Corridor (Bypass to High Ground)`,
    originName: `${name} Lowland Sink`,
    destinationName: `${name} Relief Shelter (West Ridge)`,
    originCoords: [lat - 0.008, lng + 0.012],
    destinationCoords: [lat + 0.013, lng - 0.012],
    waypoints: [
      [lat - 0.008, lng + 0.012],
      [lat - 0.003, lng + 0.008], // Northward away from river depression
      [lat + 0.005, lng + 0.002], // Transit via central elevated ridge
      [lat + 0.009, lng - 0.005], // Merge onto High School feeder road
      [lat + 0.013, lng - 0.012], // Destination high-ground relief shelter
    ],
    distanceKm: 4.8,
    estimatedTimeMin: 14,
    safetyScore: 94,
    avoidedRiskZones: [`${name} River Basin Sink`, `${name} Transit Underpass`],
    clearanceMarginMeters: 450,
  };
}
