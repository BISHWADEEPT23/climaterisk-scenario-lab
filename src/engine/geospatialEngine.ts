/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab — Geospatial Analytics Engine (Phase 3)
 * Spatial clustering, distance metrics, bounding boxes, and GeoJSON features.
 */

import { PhysicalAsset, Country, SpecificPhysicalHazard, GeospatialAssetCluster, ExpectedAnnualLossResult } from '../types/climate';

/**
 * Standard country centroid coordinates for fast zoom and framing
 */
export const COUNTRY_CENTROIDS: Record<Country, { lat: number; lng: number; zoom: number; name: string }> = {
  'India': { lat: 21.7679, lng: 78.8718, zoom: 4.5, name: 'India' },
  'United States': { lat: 38.0, lng: -97.0, zoom: 4.0, name: 'United States' },
  'Germany': { lat: 51.1657, lng: 10.4515, zoom: 6.0, name: 'Germany' },
  'United Kingdom': { lat: 54.0, lng: -2.5, zoom: 5.5, name: 'United Kingdom' },
  'Japan': { lat: 36.2048, lng: 138.2529, zoom: 5.5, name: 'Japan' }
};

/**
 * Calculates great-circle distance between two geographic coordinates via Haversine formula (km).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371.0; // Earth mean radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Computes bounding box [minLon, minLat, maxLon, maxLat] for an array of assets.
 */
export function calculateBoundingBox(assets: PhysicalAsset[]): [number, number, number, number] {
  if (assets.length === 0) return [-180, -90, 180, 90];

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (const a of assets) {
    if (a.latitude < minLat) minLat = a.latitude;
    if (a.latitude > maxLat) maxLat = a.latitude;
    if (a.longitude < minLon) minLon = a.longitude;
    if (a.longitude > maxLon) maxLon = a.longitude;
  }

  return [
    Number(minLon.toFixed(4)),
    Number(minLat.toFixed(4)),
    Number(maxLon.toFixed(4)),
    Number(maxLat.toFixed(4))
  ];
}

/**
 * Automatically groups 100 physical assets into deterministic regional clusters.
 */
export function clusterAssetsByRegion(
  assets: PhysicalAsset[],
  assetEals: ExpectedAnnualLossResult[]
): GeospatialAssetCluster[] {
  const ealMap = new Map<string, ExpectedAnnualLossResult>();
  assetEals.forEach(e => ealMap.set(e.assetId, e));

  // Predefined regional centroids
  const regionalBuckets: Record<string, { country: Country; name: string; assets: PhysicalAsset[] }> = {
    'US-GULF': { country: 'United States', name: 'US Gulf Coast / Texas', assets: [] },
    'US-WEST': { country: 'United States', name: 'US West Coast & Southwest', assets: [] },
    'US-EAST': { country: 'United States', name: 'US Northeast & Midwest', assets: [] },
    'DE-NORTH': { country: 'Germany', name: 'Germany Northern / Rhine-Ruhr', assets: [] },
    'DE-SOUTH': { country: 'Germany', name: 'Germany Southern / Bavaria', assets: [] },
    'UK-SOUTH': { country: 'United Kingdom', name: 'UK Greater London & South', assets: [] },
    'UK-NORTH': { country: 'United Kingdom', name: 'UK Midlands & Northern / Scotland', assets: [] },
    'IN-WEST': { country: 'India', name: 'India Western Industrial Belt', assets: [] },
    'IN-NORTH': { country: 'India', name: 'India Northern / Indo-Gangetic', assets: [] },
    'IN-SOUTH': { country: 'India', name: 'India Southern Peninsula', assets: [] },
    'JP-KANTO': { country: 'Japan', name: 'Japan Kanto / Greater Tokyo', assets: [] },
    'JP-KANSAI': { country: 'Japan', name: 'Japan Kansai / Osaka-Kyoto', assets: [] }
  };

  for (const asset of assets) {
    if (asset.country === 'United States') {
      if (asset.latitude < 32 && asset.longitude > -100 && asset.longitude < -85) {
        regionalBuckets['US-GULF'].assets.push(asset);
      } else if (asset.longitude < -110) {
        regionalBuckets['US-WEST'].assets.push(asset);
      } else {
        regionalBuckets['US-EAST'].assets.push(asset);
      }
    } else if (asset.country === 'Germany') {
      if (asset.latitude >= 51.5) {
        regionalBuckets['DE-NORTH'].assets.push(asset);
      } else {
        regionalBuckets['DE-SOUTH'].assets.push(asset);
      }
    } else if (asset.country === 'United Kingdom') {
      if (asset.latitude < 52.5) {
        regionalBuckets['UK-SOUTH'].assets.push(asset);
      } else {
        regionalBuckets['UK-NORTH'].assets.push(asset);
      }
    } else if (asset.country === 'India') {
      if (asset.latitude > 24) {
        regionalBuckets['IN-NORTH'].assets.push(asset);
      } else if (asset.longitude < 76) {
        regionalBuckets['IN-WEST'].assets.push(asset);
      } else {
        regionalBuckets['IN-SOUTH'].assets.push(asset);
      }
    } else if (asset.country === 'Japan') {
      if (asset.longitude > 138) {
        regionalBuckets['JP-KANTO'].assets.push(asset);
      } else {
        regionalBuckets['JP-KANSAI'].assets.push(asset);
      }
    }
  }

  const clusters: GeospatialAssetCluster[] = [];

  for (const [key, bucket] of Object.entries(regionalBuckets)) {
    if (bucket.assets.length === 0) continue;

    const count = bucket.assets.length;
    const avgLat = bucket.assets.reduce((sum, a) => sum + a.latitude, 0) / count;
    const avgLng = bucket.assets.reduce((sum, a) => sum + a.longitude, 0) / count;
    const totalVal = bucket.assets.reduce((sum, a) => sum + a.replacementValueUsdM, 0);
    const avgScore = bucket.assets.reduce((sum, a) => sum + a.overallPhysicalScore, 0) / count;

    let totalEal = 0;
    let criticalCount = 0;

    const perilCounts: Record<SpecificPhysicalHazard, number> = {
      'River Flooding': 0,
      'Coastal Flooding': 0,
      'Tropical Cyclone': 0,
      'Wildfire': 0,
      'Extreme Precipitation': 0,
      'Heat Stress': 0,
      'Drought': 0,
      'Water Stress': 0,
      'Sea-level Rise': 0
    };

    for (const a of bucket.assets) {
      if (a.riskTier === 'Critical') criticalCount++;
      const ealRes = ealMap.get(a.id);
      if (ealRes) {
        totalEal += ealRes.totalExpectedAnnualLossUsdM;
        for (const [p, val] of Object.entries(ealRes.perilBreakdown) as [SpecificPhysicalHazard, number][]) {
          perilCounts[p] += val;
        }
      }
    }

    // Determine dominant peril by loss contribution
    let dominantPeril: SpecificPhysicalHazard = 'River Flooding';
    let maxPerilLoss = -1;
    for (const [p, val] of Object.entries(perilCounts) as [SpecificPhysicalHazard, number][]) {
      if (val > maxPerilLoss) {
        maxPerilLoss = val;
        dominantPeril = p;
      }
    }

    clusters.push({
      clusterId: key,
      country: bucket.country,
      regionName: bucket.name,
      centerLatitude: Number(avgLat.toFixed(4)),
      centerLongitude: Number(avgLng.toFixed(4)),
      assetCount: count,
      totalReplacementValueUsdM: Number(totalVal.toFixed(2)),
      avgPhysicalScore: Number(avgScore.toFixed(1)),
      totalEalUsdM: Number(totalEal.toFixed(3)),
      dominantPeril,
      criticalAssetCount: criticalCount
    });
  }

  return clusters;
}

/**
 * Converts the 100 assets into a standard GeoJSON FeatureCollection.
 */
export function generateAssetsGeoJson(
  assets: PhysicalAsset[],
  assetEals: ExpectedAnnualLossResult[]
): Record<string, any> {
  const ealMap = new Map<string, ExpectedAnnualLossResult>();
  assetEals.forEach(e => ealMap.set(e.assetId, e));

  return {
    type: 'FeatureCollection',
    metadata: {
      generatedAt: new Date().toISOString(),
      count: assets.length,
      provenance: 'ClimateRisk Scenario Lab — Deterministic Synthetic Catalog',
      isSynthetic: true
    },
    features: assets.map(a => {
      const eal = ealMap.get(a.id);
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [a.longitude, a.latitude]
        },
        properties: {
          id: a.id,
          name: a.name,
          companyId: a.companyId,
          companyName: a.companyName,
          sector: a.sector,
          country: a.country,
          city: a.city,
          assetType: a.assetType,
          replacementValueUsdM: a.replacementValueUsdM,
          overallPhysicalScore: a.overallPhysicalScore,
          riskTier: a.riskTier,
          expectedAnnualLossUsdM: eal?.totalExpectedAnnualLossUsdM ?? 0,
          lossRatePct: eal?.lossRatePct ?? 0,
          uninsuredLossUsdM: eal?.uninsuredEalUsdM ?? 0,
          businessInterruptionEalUsdM: eal?.businessInterruptionEalUsdM ?? 0,
          acuteHazards: a.acuteHazards,
          chronicHazards: a.chronicHazards
        }
      };
    })
  };
}
