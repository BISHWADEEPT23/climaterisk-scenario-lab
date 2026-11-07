/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab — Interactive Geospatial Asset Map (Phase 3)
 * High-performance vector map rendering asset pins, regional clusters, and peril overlays.
 */

import React, { useState, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  MapPin,
  AlertTriangle,
  Info,
  ChevronRight,
  Shield,
  Download,
  Flame,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Waves
} from 'lucide-react';
import {
  PhysicalAsset,
  Country,
  SpecificPhysicalHazard,
  ExpectedAnnualLossResult,
  GeospatialAssetCluster
} from '../../types/climate';
import { COUNTRY_CENTROIDS, clusterAssetsByRegion, generateAssetsGeoJson } from '../../engine/geospatialEngine';

interface InteractiveAssetMapProps {
  assets: PhysicalAsset[];
  assetEals: ExpectedAnnualLossResult[];
  selectedCountry: Country | 'All';
  onSelectCountry: (country: Country | 'All') => void;
  selectedAsset: PhysicalAsset | null;
  onSelectAsset: (asset: PhysicalAsset | null) => void;
  activePerilLayer: SpecificPhysicalHazard | 'Composite';
  onSelectPerilLayer: (peril: SpecificPhysicalHazard | 'Composite') => void;
}

export const InteractiveAssetMap: React.FC<InteractiveAssetMapProps> = ({
  assets,
  assetEals,
  selectedCountry,
  onSelectCountry,
  selectedAsset,
  onSelectAsset,
  activePerilLayer,
  onSelectPerilLayer
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showClusters, setShowClusters] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  const ealMap = useMemo(() => {
    const map = new Map<string, ExpectedAnnualLossResult>();
    assetEals.forEach(e => map.set(e.assetId, e));
    return map;
  }, [assetEals]);

  const clusters = useMemo(() => {
    return clusterAssetsByRegion(assets, assetEals);
  }, [assets, assetEals]);

  // SVG dimensions
  const mapWidth = 900;
  const mapHeight = 500;

  /**
   * Equirectangular projection mapping [longitude, latitude] to SVG coordinates
   * Longitude [-180, 180] -> x [0, mapWidth]
   * Latitude [90, -90] -> y [0, mapHeight]
   */
  const projectCoords = (lat: number, lon: number): { x: number; y: number } => {
    // Normalise to [0, 1]
    const xNorm = (lon + 180.0) / 360.0;
    const yNorm = (90.0 - lat) / 180.0;

    let x = xNorm * mapWidth;
    let y = yNorm * mapHeight;

    // Apply country zoom focus if a specific country is chosen
    if (selectedCountry !== 'All') {
      const centroid = COUNTRY_CENTROIDS[selectedCountry];
      const cxNorm = (centroid.lng + 180.0) / 360.0;
      const cyNorm = (90.0 - centroid.lat) / 180.0;
      const cx = cxNorm * mapWidth;
      const cy = cyNorm * mapHeight;

      const scale = centroid.zoom * 0.75 * zoomLevel;
      x = (x - cx) * scale + mapWidth / 2 + panOffset.x;
      y = (y - cy) * scale + mapHeight / 2 + panOffset.y;
    } else {
      // Global overview
      const cx = mapWidth / 2;
      const cy = mapHeight / 2;
      x = (x - cx) * zoomLevel + cx + panOffset.x;
      y = (y - cy) * zoomLevel + cy + panOffset.y;
    }

    return { x, y };
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(3.5, Math.max(0.7, prev + delta)));
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    onSelectCountry('All');
  };

  const handleExportGeoJson = () => {
    const geoJson = generateAssetsGeoJson(assets, assetEals);
    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClimateRisk_Asset_Portfolio_GeoJSON_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative text-white flex flex-col">
      {/* Map Control Header */}
      <div className="px-5 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Geospatial Asset Risk Map</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800">
                100 Asset Coordinates
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive hazard exposure &amp; EAL distribution across 5 core industrial geographies.
            </p>
          </div>
        </div>

        {/* View Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Country Quick Focus */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
            {(['All', 'United States', 'Germany', 'United Kingdom', 'India', 'Japan'] as const).map(c => (
              <button
                key={c}
                onClick={() => {
                  onSelectCountry(c);
                  setZoomLevel(1.0);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedCountry === c
                    ? 'bg-teal-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {c === 'All' ? 'Global' : c === 'United States' ? 'USA' : c === 'United Kingdom' ? 'UK' : c}
              </button>
            ))}
          </div>

          {/* Peril Layer Dropdown */}
          <select
            value={activePerilLayer}
            onChange={(e) => onSelectPerilLayer(e.target.value as any)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
          >
            <option value="Composite">Composite Physical Risk</option>
            <option value="River Flooding">River Flooding (Inundation)</option>
            <option value="Coastal Flooding">Coastal Flooding / Surge</option>
            <option value="Tropical Cyclone">Tropical Cyclone (Wind)</option>
            <option value="Wildfire">Wildfire (Radiative Flux)</option>
            <option value="Extreme Precipitation">Extreme Pluvial Rain</option>
            <option value="Heat Stress">Heat Stress (Labor Drag)</option>
            <option value="Water Stress">Water Stress (Curtailment)</option>
            <option value="Drought">Drought (Yield Loss)</option>
            <option value="Sea-level Rise">Sea-level Rise (Permanent)</option>
          </select>

          {/* Toggle Heatmap */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showHeatmap
                ? 'bg-slate-800 text-teal-400 border-teal-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
            title="Toggle Peril Heat Surface"
          >
            Heatmap: {showHeatmap ? 'ON' : 'OFF'}
          </button>

          {/* Export GeoJSON */}
          <button
            onClick={handleExportGeoJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GeoJSON</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <button
              onClick={() => handleZoom(0.25)}
              className="p-1.5 hover:bg-slate-700 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-1.5 hover:bg-slate-700 text-slate-300 border-l border-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-slate-700 text-slate-300 border-l border-slate-700"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map Area */}
      <div className="relative w-full h-[480px] bg-[#070d19] overflow-hidden select-none cursor-crosshair">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full"
          style={{ transformOrigin: 'center center' }}
        >
          {/* Subtle Lat/Lon Graticules */}
          <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3">
            {[100, 200, 300, 400].map(y => (
              <line key={`lat-${y}`} x1="0" y1={y} x2={mapWidth} y2={y} />
            ))}
            {[150, 300, 450, 600, 750].map(x => (
              <line key={`lon-${x}`} x1={x} y1="0" x2={x} y2={mapHeight} />
            ))}
          </g>

          {/* Equator & Prime Meridian Markers */}
          <line x1="0" y1={mapHeight / 2} x2={mapWidth} y2={mapHeight / 2} stroke="#334155" strokeWidth="0.75" />
          <line x1={mapWidth / 2} y1="0" x2={mapWidth / 2} y2={mapHeight} stroke="#334155" strokeWidth="0.75" />

          {/* World Landmass Simplified Basemap Silhouette */}
          <g fill="#0f172a" stroke="#1e293b" strokeWidth="0.75" opacity="0.6">
            {/* North America */}
            <path d="M 120 80 Q 220 90 280 150 Q 250 220 180 230 Q 130 180 120 80 Z" />
            {/* Europe */}
            <path d="M 430 110 Q 510 110 520 160 Q 480 200 440 180 Q 420 140 430 110 Z" />
            {/* Asia & India */}
            <path d="M 520 110 Q 720 110 740 220 Q 640 310 580 250 Q 520 200 520 110 Z" />
            {/* Japan Arc */}
            <path d="M 750 160 Q 770 180 760 210 Q 745 190 750 160 Z" />
            {/* United Kingdom Isles */}
            <path d="M 425 125 Q 440 125 435 150 Q 420 145 425 125 Z" />
          </g>

          {/* Heatmap Hazard Radii (Optional Synthetic Peril Surface) */}
          {showHeatmap && (
            <g opacity="0.25">
              {assets.map(asset => {
                const { x, y } = projectCoords(asset.latitude, asset.longitude);
                if (x < -50 || x > mapWidth + 50 || y < -50 || y > mapHeight + 50) return null;

                const eal = ealMap.get(asset.id);
                const score = activePerilLayer === 'Composite'
                  ? asset.overallPhysicalScore
                  : ((asset.acuteHazards as unknown as Record<string, number>)[activePerilLayer] ?? (asset.chronicHazards as unknown as Record<string, number>)[activePerilLayer] ?? 30);

                const radius = Math.max(15, (score / 100) * 45);
                const color = score >= 70 ? '#f43f5e' : score >= 50 ? '#f59e0b' : '#06b6d4';

                return (
                  <circle
                    key={`heat-${asset.id}`}
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={color}
                    filter="blur(8px)"
                  />
                );
              })}
            </g>
          )}

          {/* Regional Cluster Concentric Halos */}
          {showClusters && clusters.map(cluster => {
            if (selectedCountry !== 'All' && cluster.country !== selectedCountry) return null;
            const { x, y } = projectCoords(cluster.centerLatitude, cluster.centerLongitude);
            if (x < 0 || x > mapWidth || y < 0 || y > mapHeight) return null;

            return (
              <g key={cluster.clusterId} className="cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r="26"
                  fill="#0f766e"
                  fillOpacity="0.18"
                  stroke="#14b8a6"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
                <circle cx={x} cy={y} r="18" fill="#134e4a" fillOpacity="0.7" />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#5eead4"
                  fontFamily="monospace"
                >
                  {cluster.assetCount}
                </text>
                <text
                  x={x}
                  y={y - 22}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill="#94a3b8"
                >
                  {cluster.regionName.split('/')[0]}
                </text>
              </g>
            );
          })}

          {/* Individual Asset Vector Pins */}
          {assets.map(asset => {
            if (selectedCountry !== 'All' && asset.country !== selectedCountry) return null;
            const { x, y } = projectCoords(asset.latitude, asset.longitude);

            // Clip outside screen
            if (x < -20 || x > mapWidth + 20 || y < -20 || y > mapHeight + 20) return null;

            const isSelected = selectedAsset?.id === asset.id;
            const eal = ealMap.get(asset.id);
            const lossRate = eal?.lossRatePct ?? 0;
            const score = asset.overallPhysicalScore;

            // Pin styling based on risk severity
            let pinColor = '#10b981'; // Low - Emerald
            let strokeColor = '#059669';
            if (asset.riskTier === 'Critical' || lossRate >= 0.8) {
              pinColor = '#f43f5e'; // Critical - Rose
              strokeColor = '#e11d48';
            } else if (asset.riskTier === 'High' || lossRate >= 0.5) {
              pinColor = '#f59e0b'; // High - Amber
              strokeColor = '#d97706';
            } else if (asset.riskTier === 'Medium') {
              pinColor = '#3b82f6'; // Medium - Blue
              strokeColor = '#2563eb';
            }

            return (
              <g
                key={asset.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => onSelectAsset(asset)}
                className="cursor-pointer transition-transform duration-150 hover:scale-125"
              >
                {/* Critical Pulse Halo */}
                {(asset.riskTier === 'Critical' || isSelected) && (
                  <circle
                    r={isSelected ? '14' : '10'}
                    fill={pinColor}
                    opacity="0.35"
                    className="animate-ping"
                  />
                )}

                {/* Pin Circle Body */}
                <circle
                  r={isSelected ? '7' : '4.5'}
                  fill={pinColor}
                  stroke={isSelected ? '#ffffff' : strokeColor}
                  strokeWidth={isSelected ? '2' : '1'}
                  className="shadow-lg"
                />

                {/* Tooltip on SVG hover */}
                <title>
                  {`${asset.name} (${asset.city}, ${asset.country})
Company: ${asset.companyName}
Replacement: $${asset.replacementValueUsdM}M
Physical Score: ${asset.overallPhysicalScore}/100 [${asset.riskTier}]
EAL: $${(eal?.totalExpectedAnnualLossUsdM ?? 0).toFixed(2)}M/yr (Loss Rate: ${(eal?.lossRatePct ?? 0).toFixed(2)}%)`}
                </title>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay Box */}
        <div className="absolute bottom-4 left-4 p-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl text-xs space-y-2 shadow-xl pointer-events-none">
          <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
            Asset Risk Classification
          </span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
              <span className="text-slate-300 font-medium">Critical (&ge;75)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
              <span className="text-slate-300 font-medium">High (55–74)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
              <span className="text-slate-300 font-medium">Medium (35–54)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-slate-300 font-medium">Low (&lt;35)</span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Projection: Equirectangular</span>
            <span>Scale: {zoomLevel.toFixed(1)}x</span>
          </div>
        </div>

        {/* Selected Asset Quick-Drawer Modal (if any) */}
        {selectedAsset && (
          <div className="absolute top-4 right-4 max-w-sm w-full bg-slate-900/95 backdrop-blur-lg border border-slate-700/80 rounded-xl p-4 shadow-2xl text-xs space-y-3 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-teal-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedAsset.id} · {selectedAsset.city}, {selectedAsset.country}</span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{selectedAsset.name}</h4>
                <p className="text-[11px] text-slate-400">{selectedAsset.companyName} ({selectedAsset.sector})</p>
              </div>
              <button
                onClick={() => onSelectAsset(null)}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
              >
                &times;
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
              <div>
                <span className="text-[10px] text-slate-400 block">Replacement Value</span>
                <span className="text-xs font-mono font-bold text-white">${selectedAsset.replacementValueUsdM}M</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Composite Peril</span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  {selectedAsset.overallPhysicalScore}/100 [{selectedAsset.riskTier}]
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Modelled EAL</span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  ${(ealMap.get(selectedAsset.id)?.totalExpectedAnnualLossUsdM ?? 0).toFixed(2)}M/yr
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Loss Rate</span>
                <span className="text-xs font-mono font-bold text-teal-300">
                  {(ealMap.get(selectedAsset.id)?.lossRatePct ?? 0).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Peril Exposure Mini Bars */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Key Hazard Exposures</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center justify-between bg-slate-800/40 px-2 py-1 rounded">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-blue-400" /> Flood:
                  </span>
                  <span className="font-mono font-bold text-slate-200">{selectedAsset.acuteHazards.Flood}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/40 px-2 py-1 rounded">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-cyan-400" /> Cyclone:
                  </span>
                  <span className="font-mono font-bold text-slate-200">{selectedAsset.acuteHazards.Cyclone}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/40 px-2 py-1 rounded">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-400" /> Heat:
                  </span>
                  <span className="font-mono font-bold text-slate-200">{selectedAsset.chronicHazards['Heat Stress']}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/40 px-2 py-1 rounded">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-indigo-400" /> Water:
                  </span>
                  <span className="font-mono font-bold text-slate-200">{selectedAsset.chronicHazards['Water Stress']}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => onSelectAsset(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium"
              >
                Close Drawer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
