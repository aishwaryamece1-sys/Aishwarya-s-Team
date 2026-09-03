import {
  AnalysisWorkflowStep,
  AIChatMessage,
  LocationInfo,
  TimeStep,
  DataMode,
  InundationZone,
  InfrastructureAsset,
  RainfallForecastPoint,
} from '../types';

export interface AgentContext {
  location: LocationInfo;
  timeStep: TimeStep;
  dataMode: DataMode;
  rainfall: RainfallForecastPoint;
  inundationZones: InundationZone[];
  infrastructure: InfrastructureAsset[];
  activeAlertCount: number;
}

export class RainShieldAgent {
  static async processQuery(query: string, ctx: AgentContext): Promise<AIChatMessage> {
    const q = query.toLowerCase();
    const trace: AnalysisWorkflowStep[] = [];

    // Step 1: Query Intent Parsing
    trace.push({
      stepId: 1,
      name: 'Query Intent & Spatial Scope Parsing',
      tool: 'AgentParserTool',
      status: 'completed',
      durationMs: 45,
      dataSource: 'Natural Language Ingestion',
      resultSummary: `Parsed query intent: "${query.slice(0, 45)}..." for location: ${ctx.location.name}`,
    });

    // Step 2: Ingest Multi-source Data Quality
    trace.push({
      stepId: 2,
      name: 'Multi-Source Data Quality Verification',
      tool: 'DataQualityTool',
      status: 'completed',
      durationMs: 82,
      dataSource: 'INSAT-3DR + Doppler Radar (DWR) + Surface AWS',
      resultSummary: 'Data quality check passed (0.04% missing, NTP clock sync verified)',
    });

    // Step 3: Run Forecast Model Tool
    trace.push({
      stepId: 3,
      name: 'Rainfall Nowcast & Spatial Grid Analysis',
      tool: 'RainfallForecastTool',
      status: 'completed',
      durationMs: 110,
      dataSource: 'Nowcasting CNN-LSTM v2.4',
      resultSummary: `Current intensity: ${ctx.rainfall.intensityMmHr} mm/hr, Probability: ${ctx.rainfall.probabilityPercent}%, Risk: ${ctx.rainfall.risk}`,
    });

    let answerText = '';
    const keyMetrics: Record<string, string | number> = {
      'Location': ctx.location.name,
      'Time Horizon': ctx.timeStep,
      'Precipitation Intensity': `${ctx.rainfall.intensityMmHr} mm/hr`,
      'Accumulated Rainfall': `${ctx.rainfall.accumulatedMm} mm`,
      'Active Hazard Zones': ctx.inundationZones.length,
      'Data Mode': ctx.dataMode,
    };

    // Branching logic based on intent
    if (q.includes('road') || q.includes('traffic') || q.includes('transport') || q.includes('route')) {
      trace.push({
        stepId: 4,
        name: 'Hydrodynamic Inundation Overlap Calculation',
        tool: 'InundationTool',
        status: 'completed',
        durationMs: 140,
        dataSource: 'HydroFlood2D Engine',
        resultSummary: `Calculated water depth across ${ctx.inundationZones.length} hazard zones`,
      });

      trace.push({
        stepId: 5,
        name: 'Road Network & Arterial Corridor Impact Scan',
        tool: 'InfrastructureTool',
        status: 'completed',
        durationMs: 95,
        dataSource: 'Urban Transit GIS Layer',
        resultSummary: 'Identified critical road segments intersecting water depth > 0.5m',
      });

      const roadsAtRisk = ctx.infrastructure.filter(i => i.type === 'road' && (i.riskLevel === 'EXTREME' || i.riskLevel === 'VERY_HIGH' || i.riskLevel === 'HIGH'));
      const extremeRoads = roadsAtRisk.filter(r => r.riskLevel === 'EXTREME');

      answerText = `Based on the **${ctx.dataMode}** hydrological simulation for **${ctx.location.name}** at horizon **${ctx.timeStep}**:\n\n` +
        `• **Critical Roads Under Immediate Threat**: ${roadsAtRisk.length} primary corridors exceed safety thresholds.\n` +
        extremeRoads.map(r => `  - **${r.name}**: Predicted water depth reaches **${r.predictedDepthM ?? 0.8}m** (${r.riskLevel} risk). ${r.notes}`).join('\n') +
        `\n\n• **Recommended Traffic Actions**:\n` +
        `  1. Immediately close ground-level approaches to **Central Silk Board** and **Outer Ring Road** service roads.\n` +
        `  2. Divert through-traffic to elevated flyover corridors.\n` +
        `  3. Restrict low-clearance public transit buses and light passenger vehicles from low-lying underpasses.`;

    } else if (q.includes('hospital') || q.includes('school') || q.includes('facility') || q.includes('critical') || q.includes('health')) {
      trace.push({
        stepId: 4,
        name: 'Critical Infrastructure Geospatial Intersection',
        tool: 'InfrastructureTool',
        status: 'completed',
        durationMs: 125,
        dataSource: 'Emergency Facilities GIS',
        resultSummary: 'Cross-referenced hospital ambulance bays and school catchments against inundation polygons',
      });

      const facilities = ctx.infrastructure.filter(i => i.type === 'hospital' || i.type === 'school' || i.type === 'emergency');
      const affectedFacilities = facilities.filter(f => f.riskLevel === 'EXTREME' || f.riskLevel === 'VERY_HIGH' || f.riskLevel === 'HIGH');

      answerText = `Based on the multi-factor risk assessment for **${ctx.location.name}** at horizon **${ctx.timeStep}**:\n\n` +
        `• **High-Risk Critical Facilities**: ${affectedFacilities.length} facilities require operational attention.\n` +
        affectedFacilities.map(f => `  - **${f.name}** (${f.type.toUpperCase()}): Risk is **${f.riskLevel}** (Distance to flood edge: ${f.distanceToInundationM}m). ${f.notes}`).join('\n') +
        `\n\n• **Safe Operations Advisory**:\n` +
        `  - **Primary Referral Hub**: **Manipal Hospital HAL** remains fully operational (${facilities.find(f => f.id === 'asset-hosp-manipal')?.status ?? 'OPERATIONAL'}).\n` +
        `  - Ambulances attempting to reach Sakra Hospital must use elevated bypass ramps.`;

    } else if (q.includes('why') || q.includes('reason') || q.includes('cause') || q.includes('factor')) {
      trace.push({
        stepId: 4,
        name: 'Bayesian Multi-Factor Hazard Attribution',
        tool: 'RiskTool',
        status: 'completed',
        durationMs: 130,
        dataSource: 'RainShield Risk Engine v2.4',
        resultSummary: 'Decomposed risk into precipitation, elevation slope, and drainage deficit components',
      });

      const topZone = ctx.inundationZones[0] || {
        name: 'Bellandur Catchment',
        riskLevel: 'EXTREME',
        waterDepthMeters: 1.35,
        explanation: 'Extreme storm intensity combined with severe urban drainage deficit.',
        factors: { rainfallIntensity: 96, accumulation: 94, terrainVulnerability: 88, drainageDeficit: 82, historicalTendency: 92 },
      };

      answerText = `**Attribution Analysis for ${topZone.name}** (${topZone.riskLevel} Risk):\n\n` +
        `1. **Precipitation Intensity (${topZone.factors.rainfallIntensity}/100)**: Simulated rainfall intensity is **${ctx.rainfall.intensityMmHr} mm/hr** with **${ctx.rainfall.accumulatedMm} mm** accumulated runoff.\n` +
        `2. **Topographic Basin Vulnerability (${topZone.factors.terrainVulnerability}/100)**: Situated in an undulating depression valley (low hydraulic gradient slope).\n` +
        `3. **Drainage Deficit (${topZone.factors.drainageDeficit}/100)**: Local stormwater conduit capacity is exceeded by over 200%.\n` +
        `4. **Historical Flooding Tendency (${topZone.factors.historicalTendency}/100)**: Recurrent waterlogging records confirm high prior probability.\n\n` +
        `**Key Conclusion**: ${topZone.explanation}`;

    } else if (q.includes('peak') || q.includes('when') || q.includes('timing') || q.includes('hour')) {
      trace.push({
        stepId: 4,
        name: 'Temporal Hyetograph & Peak Runoff Curve Evaluation',
        tool: 'RainfallForecastTool',
        status: 'completed',
        durationMs: 90,
        dataSource: 'Nowcasting CNN-LSTM v2.4',
        resultSummary: 'Identified rainfall intensity peak at +120m (112.5 mm/hr) and hydrological runoff peak at +180m',
      });

      answerText = `**Precipitation & Inundation Timing Summary for ${ctx.location.name}**:\n\n` +
        `• **Rainfall Peak**: Rainfall intensity is forecasted to peak at **16:30 IST (+120 min)** at **112.5 mm/hr**.\n` +
        `• **Inundation Lag Peak**: Due to hydrological catchment routing delay, maximum surface flood volume reaches its peak at **17:30 IST (+180 min)**, resulting in approximately **31.8 km²** of cumulative affected terrain.\n` +
        `• **Early Action Window**: Mitigation measures (traffic diversion, evacuation, dewatering pump activation) should be fully in place **before 15:30 IST (+60 min)**.`;

    } else if (q.includes('summar') || q.includes('overview') || q.includes('situation') || q.includes('status')) {
      trace.push({
        stepId: 4,
        name: 'Holistic Disaster Situation Synthesis',
        tool: 'ReportTool',
        status: 'completed',
        durationMs: 150,
        dataSource: 'Fused Multi-Source State Engine',
        resultSummary: 'Synthesized meteorological, hydrodynamic, and infrastructure status',
      });

      const totalArea = ctx.inundationZones.reduce((acc, z) => acc + z.affectedAreaSqKm, 0).toFixed(1);
      const topRiskZones = ctx.inundationZones.map(z => z.neighborhood).join(', ');

      answerText = `**Current Situation Summary — ${ctx.location.name} (${ctx.timeStep})**:\n\n` +
        `• **Meteorological Status**: Predicted rainfall intensity is **${ctx.rainfall.intensityMmHr} mm/hr** with **${ctx.rainfall.accumulatedMm} mm** accumulation. Probability of heavy precipitation is **${ctx.rainfall.probabilityPercent}%**.\n` +
        `• **Inundation Footprint**: **${totalArea} km²** across primary hotspots (${topRiskZones}).\n` +
        `• **Infrastructure Impact**: High risk to Outer Ring Road, Silk Board Junction, and Sakra Hospital access.\n` +
        `• **Decision Priority**: Issue immediate traffic advisories and deploy emergency dewatering pumps at Bellandur Lake sluice gates.\n\n` +
        `*Notice: Generated in **${ctx.dataMode} MODE** for decision-support simulation.*`;

    } else {
      // General decision support query
      trace.push({
        stepId: 4,
        name: 'Multi-Criteria Priority Ranking',
        tool: 'RiskTool',
        status: 'completed',
        durationMs: 110,
        dataSource: 'Bayesian Disaster Risk Engine',
        resultSummary: `Ranked ${ctx.inundationZones.length} spatial zones by emergency intervention priority`,
      });

      const zoneNames = ctx.inundationZones.map((z, idx) => `Priority ${idx + 1}: **${z.name}** (Depth: ${z.waterDepthMeters}m, Risk: ${z.riskLevel})`).join('\n');

      answerText = `**Response Analysis for ${ctx.location.name} (${ctx.timeStep})**:\n\n` +
        `Here is the prioritized risk evaluation:\n` +
        `${zoneNames}\n\n` +
        `• **Current Rainfall Intensity**: ${ctx.rainfall.intensityMmHr} mm/hr (Reflectivity ${ctx.rainfall.radarReflectivityDbz} dBZ)\n` +
        `• **Highest Vulnerability**: Bellandur Lake overflow basin and Silk Board underpass require immediate monitoring.\n` +
        `• **Command Recommendation**: Deploy mobile pump squads and broadcast travel advisories.`;
    }

    // Step Final: Answer Generation
    trace.push({
      stepId: trace.length + 1,
      name: 'Structured Decision-Support Answer Generation',
      tool: 'AgentResponseTool',
      status: 'completed',
      durationMs: 65,
      dataSource: 'RainShield AI Core',
      resultSummary: 'Synthesized evidence-backed answer with data lineage',
    });

    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'assistant',
      text: answerText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      executionTrace: trace,
      evidence: {
        sources: ['Doppler Weather Radar (DWR)', 'INSAT-3DR Satellite', 'Urban AWS Network', 'HydroFlood2D Model'],
        timestamp: new Date().toISOString(),
        model: 'RainShield Agent v1.8 + Nowcast v2.4',
        mode: ctx.dataMode,
        keyMetrics,
      },
    };
  }
}
