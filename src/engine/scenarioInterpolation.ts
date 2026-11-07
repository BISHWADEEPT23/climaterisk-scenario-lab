/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Scenario Interpolation & Trajectory Engine
 * Performs strict linear interpolation between published anchor years (2025, 2030, 2035, 2040, 2045, 2050).
 * Flags all non-anchor values with `isInterpolated: true` to prevent presenting synthetic/interpolated points as official observations.
 */

import { ScenarioDefinition, ScenarioHorizonPoint, TimeHorizon, Sector } from '../types/climate';

export const ANCHOR_HORIZONS: TimeHorizon[] = [2025, 2030, 2035, 2040, 2045, 2050];

export interface TrajectoryPoint extends ScenarioHorizonPoint {
  year: number;
  isAnchorYear: boolean;
  isInterpolated: boolean;
  provenanceLabel: string;
}

/**
 * Linearly interpolates a scenario point for any intermediate year between 2025 and 2050
 */
export function interpolateScenarioForYear(
  scenario: ScenarioDefinition,
  targetYear: number
): TrajectoryPoint {
  const clampedYear = Math.max(2025, Math.min(2050, Math.round(targetYear)));

  // If exact anchor year exists
  if (ANCHOR_HORIZONS.includes(clampedYear as TimeHorizon)) {
    const anchorData = scenario.horizons[clampedYear as TimeHorizon];
    return {
      ...anchorData,
      year: clampedYear,
      isAnchorYear: true,
      isInterpolated: false,
      provenanceLabel: `Published Scenario Anchor (${clampedYear})`
    };
  }

  // Find surrounding anchor years
  let prevAnchor: TimeHorizon = 2025;
  let nextAnchor: TimeHorizon = 2050;

  for (let i = 0; i < ANCHOR_HORIZONS.length - 1; i++) {
    if (clampedYear > ANCHOR_HORIZONS[i] && clampedYear < ANCHOR_HORIZONS[i + 1]) {
      prevAnchor = ANCHOR_HORIZONS[i];
      nextAnchor = ANCHOR_HORIZONS[i + 1];
      break;
    }
  }

  const pData = scenario.horizons[prevAnchor];
  const nData = scenario.horizons[nextAnchor];
  const t = (clampedYear - prevAnchor) / (nextAnchor - prevAnchor);

  const lerp = (a: number, b: number) => a + (b - a) * t;

  const sectors: Sector[] = [
    'Power Generation',
    'Steel',
    'Cement',
    'Automotive',
    'Commercial Real Estate',
    'Agriculture'
  ];

  const interpolatedSectors: Record<Sector, number> = {} as Record<Sector, number>;
  for (const s of sectors) {
    interpolatedSectors[s] = Number(lerp(pData.sectorEmissionsReductionPct[s] || 0, nData.sectorEmissionsReductionPct[s] || 0).toFixed(2));
  }

  return {
    horizon: (clampedYear >= 2040 ? 2040 : 2030) as TimeHorizon,
    year: clampedYear,
    carbonPriceUsd: Number(lerp(pData.carbonPriceUsd, nData.carbonPriceUsd).toFixed(2)),
    tempAnomalyCelsius: Number(lerp(pData.tempAnomalyCelsius, nData.tempAnomalyCelsius).toFixed(2)),
    electricityPriceUsdMwh: Number(lerp(pData.electricityPriceUsdMwh, nData.electricityPriceUsdMwh).toFixed(2)),
    energyDemandIndex: Number(lerp(pData.energyDemandIndex, nData.energyDemandIndex).toFixed(2)),
    sectorEmissionsReductionPct: interpolatedSectors,
    gdpImpactPct: Number(lerp(pData.gdpImpactPct, nData.gdpImpactPct).toFixed(2)),
    inflationBps: Math.round(lerp(pData.inflationBps, nData.inflationBps)),
    acuteHazardIndex: Number(lerp(pData.acuteHazardIndex, nData.acuteHazardIndex).toFixed(1)),
    chronicHazardIndex: Number(lerp(pData.chronicHazardIndex, nData.chronicHazardIndex).toFixed(1)),
    isAnchorYear: false,
    isInterpolated: true,
    provenanceLabel: `Linear Interpolation (${prevAnchor}–${nextAnchor})`
  };
}

/**
 * Returns full annual trajectory from 2025 to 2050 for charting
 */
export function getFullScenarioTrajectory(scenario: ScenarioDefinition): TrajectoryPoint[] {
  const trajectory: TrajectoryPoint[] = [];
  for (let y = 2025; y <= 2050; y++) {
    trajectory.push(interpolateScenarioForYear(scenario, y));
  }
  return trajectory;
}
