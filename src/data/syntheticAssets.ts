/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Synthetic Physical Assets Dataset
 * Exactly 100 Fictional Physical Assets mapped to the 30 Synthetic Companies.
 * Covers Acute & Chronic Hazard Exposure Scores (0-100 Scale).
 * Seeded deterministically: SEED_CRSL_ASSET_100
 */

import { PhysicalAsset, Country, Sector, AcuteHazardType, ChronicHazardType } from '../types/climate';
import { SYNTHETIC_COMPANIES } from './syntheticCompanies';

interface AssetSeedBlueprint {
  name: string;
  assetType: string;
  city: string;
  lat: number;
  lng: number;
  valM: number;
  acute: Record<AcuteHazardType, number>;
  chronic: Record<ChronicHazardType, number>;
}

// Fixed deterministic asset specs linked to companies
const ASSET_BLUEPRINTS: Record<string, AssetSeedBlueprint[]> = {
  'COMP-001': [ // Bharat Urja Power Corp (India)
    { name: 'Singrauli Thermal Plant [Synthetic]', assetType: 'Coal-Fired Power Station', city: 'Singrauli', lat: 24.199, lng: 82.664, valM: 1400, acute: { Flood: 45, Cyclone: 15, Wildfire: 25, 'Extreme Precipitation': 65 }, chronic: { 'Heat Stress': 82, 'Water Stress': 85, Drought: 78, 'Sea-level Rise': 0 } },
    { name: 'Rihand Super Thermal Station [Synthetic]', assetType: 'Thermal Power Complex', city: 'Sonbhadra', lat: 24.018, lng: 82.793, valM: 1200, acute: { Flood: 55, Cyclone: 10, Wildfire: 20, 'Extreme Precipitation': 60 }, chronic: { 'Heat Stress': 79, 'Water Stress': 80, Drought: 74, 'Sea-level Rise': 0 } },
    { name: 'Ennore Coastal Gas Station [Synthetic]', assetType: 'Combined-Cycle Gas Plant', city: 'Chennai', lat: 13.214, lng: 80.321, valM: 900, acute: { Flood: 75, Cyclone: 80, Wildfire: 10, 'Extreme Precipitation': 85 }, chronic: { 'Heat Stress': 72, 'Water Stress': 65, Drought: 50, 'Sea-level Rise': 75 } },
    { name: 'Gujarat Solar PV Park I [Synthetic]', assetType: 'Solar Photovoltaic Facility', city: 'Charanka', lat: 23.905, lng: 71.201, valM: 700, acute: { Flood: 20, Cyclone: 40, Wildfire: 30, 'Extreme Precipitation': 35 }, chronic: { 'Heat Stress': 88, 'Water Stress': 82, Drought: 80, 'Sea-level Rise': 15 } }
  ],
  'COMP-002': [ // Midwest Energy Dynamics (US)
    { name: 'Prairie Creek Generating Station [Synthetic]', assetType: 'Coal & Biomass Facility', city: 'Cedar Rapids', lat: 41.936, lng: -91.642, valM: 2200, acute: { Flood: 68, Cyclone: 10, Wildfire: 20, 'Extreme Precipitation': 72 }, chronic: { 'Heat Stress': 55, 'Water Stress': 45, Drought: 52, 'Sea-level Rise': 0 } },
    { name: 'Rock River Combined Cycle [Synthetic]', assetType: 'Natural Gas Turbine', city: 'Beloit', lat: 42.549, lng: -89.043, valM: 1800, acute: { Flood: 60, Cyclone: 15, Wildfire: 25, 'Extreme Precipitation': 65 }, chronic: { 'Heat Stress': 50, 'Water Stress': 40, Drought: 48, 'Sea-level Rise': 0 } },
    { name: 'Cedar Hills Wind Energy Park [Synthetic]', assetType: 'Wind Turbine Farm', city: 'Austin', lat: 43.666, lng: -92.974, valM: 1400, acute: { Flood: 25, Cyclone: 35, Wildfire: 20, 'Extreme Precipitation': 40 }, chronic: { 'Heat Stress': 42, 'Water Stress': 30, Drought: 35, 'Sea-level Rise': 0 } },
    { name: 'Joliet Peaking Plant [Synthetic]', assetType: 'Gas Peaker Facility', city: 'Joliet', lat: 41.525, lng: -88.081, valM: 1100, acute: { Flood: 55, Cyclone: 15, Wildfire: 15, 'Extreme Precipitation': 58 }, chronic: { 'Heat Stress': 48, 'Water Stress': 38, Drought: 40, 'Sea-level Rise': 0 } }
  ],
  'COMP-003': [ // RheinKraft Utilities SE (Germany)
    { name: 'Neurath Lignite Modernized Block [Synthetic]', assetType: 'Thermal Power Plant', city: 'Grevenbroich', lat: 51.037, lng: 6.621, valM: 2100, acute: { Flood: 50, Cyclone: 25, Wildfire: 15, 'Extreme Precipitation': 58 }, chronic: { 'Heat Stress': 45, 'Water Stress': 55, Drought: 52, 'Sea-level Rise': 0 } },
    { name: 'Emsland Combined Gas Station [Synthetic]', assetType: 'Flexible Gas Turbine', city: 'Lingen', lat: 52.522, lng: 7.319, valM: 1600, acute: { Flood: 40, Cyclone: 30, Wildfire: 10, 'Extreme Precipitation': 45 }, chronic: { 'Heat Stress': 38, 'Water Stress': 40, Drought: 42, 'Sea-level Rise': 10 } },
    { name: 'Nordsee Windpark Alpha [Synthetic]', assetType: 'Offshore Wind Farm', city: 'Helgoland', lat: 54.180, lng: 7.890, valM: 1400, acute: { Flood: 80, Cyclone: 75, Wildfire: 0, 'Extreme Precipitation': 65 }, chronic: { 'Heat Stress': 15, 'Water Stress': 0, Drought: 0, 'Sea-level Rise': 85 } }
  ],
  'COMP-004': [ // Thames Grid Renewables Plc (UK)
    { name: 'Dogger Bank Offshore Array East [Synthetic]', assetType: 'Offshore Wind Generation', city: 'Hull', lat: 54.800, lng: 1.900, valM: 1500, acute: { Flood: 70, Cyclone: 70, Wildfire: 0, 'Extreme Precipitation': 60 }, chronic: { 'Heat Stress': 12, 'Water Stress': 5, Drought: 5, 'Sea-level Rise': 78 } },
    { name: 'Severn Tidal Hydro Facility [Synthetic]', assetType: 'Tidal Lagoon Generation', city: 'Bristol', lat: 51.512, lng: -2.684, valM: 1100, acute: { Flood: 78, Cyclone: 55, Wildfire: 5, 'Extreme Precipitation': 70 }, chronic: { 'Heat Stress': 22, 'Water Stress': 15, Drought: 18, 'Sea-level Rise': 82 } },
    { name: 'Didcot Reserve Storage Facility [Synthetic]', assetType: 'Battery Energy Storage System', city: 'Didcot', lat: 51.606, lng: -1.242, valM: 700, acute: { Flood: 42, Cyclone: 30, Wildfire: 25, 'Extreme Precipitation': 48 }, chronic: { 'Heat Stress': 32, 'Water Stress': 25, Drought: 28, 'Sea-level Rise': 0 } }
  ],
  'COMP-005': [ // Kanto Thermal & Clean Energy (Japan)
    { name: 'Yokohama Minato Coastal Plant [Synthetic]', assetType: 'LNG Combined Cycle Station', city: 'Yokohama', lat: 35.443, lng: 139.638, valM: 2400, acute: { Flood: 82, Cyclone: 88, Wildfire: 5, 'Extreme Precipitation': 85 }, chronic: { 'Heat Stress': 65, 'Water Stress': 35, Drought: 30, 'Sea-level Rise': 80 } },
    { name: 'Chiba East Energy Terminal [Synthetic]', assetType: 'LNG Gas Facility', city: 'Chiba', lat: 35.607, lng: 140.106, valM: 1500, acute: { Flood: 75, Cyclone: 85, Wildfire: 8, 'Extreme Precipitation': 80 }, chronic: { 'Heat Stress': 62, 'Water Stress': 30, Drought: 28, 'Sea-level Rise': 75 } },
    { name: 'Ibaraki Solar Mega Array [Synthetic]', assetType: 'Solar Photovoltaic Station', city: 'Mito', lat: 36.365, lng: 140.471, valM: 1000, acute: { Flood: 40, Cyclone: 60, Wildfire: 30, 'Extreme Precipitation': 55 }, chronic: { 'Heat Stress': 58, 'Water Stress': 38, Drought: 32, 'Sea-level Rise': 15 } }
  ],

  // STEEL (COMP-006 to COMP-010)
  'COMP-006': [ // Kalinga Ispat Smelters (India)
    { name: 'Paradip Port Blast Furnace [Synthetic]', assetType: 'Integrated Steel Plant', city: 'Paradip', lat: 20.264, lng: 86.674, valM: 1100, acute: { Flood: 78, Cyclone: 92, Wildfire: 10, 'Extreme Precipitation': 88 }, chronic: { 'Heat Stress': 80, 'Water Stress': 60, Drought: 55, 'Sea-level Rise': 82 } },
    { name: 'Rourkela Rolling Mill Complex [Synthetic]', assetType: 'Hot Strip Rolling Mill', city: 'Rourkela', lat: 22.260, lng: 84.853, valM: 950, acute: { Flood: 48, Cyclone: 35, Wildfire: 25, 'Extreme Precipitation': 65 }, chronic: { 'Heat Stress': 84, 'Water Stress': 76, Drought: 70, 'Sea-level Rise': 0 } },
    { name: 'Angul DRI Iron Facility [Synthetic]', assetType: 'Direct Reduced Iron Plant', city: 'Angul', lat: 20.840, lng: 85.100, valM: 650, acute: { Flood: 42, Cyclone: 28, Wildfire: 22, 'Extreme Precipitation': 58 }, chronic: { 'Heat Stress': 85, 'Water Stress': 79, Drought: 75, 'Sea-level Rise': 0 } },
    { name: 'Barbil Pelletization Yard [Synthetic]', assetType: 'Iron Ore Pellet Plant', city: 'Barbil', lat: 22.120, lng: 85.390, valM: 400, acute: { Flood: 38, Cyclone: 20, Wildfire: 30, 'Extreme Precipitation': 52 }, chronic: { 'Heat Stress': 78, 'Water Stress': 72, Drought: 68, 'Sea-level Rise': 0 } }
  ],
  'COMP-007': [ // Keystone Alloy Works (US)
    { name: 'Mon Valley Mill Plant [Synthetic]', assetType: 'Basic Oxygen Furnace Plant', city: 'Pittsburgh', lat: 40.380, lng: -79.860, valM: 1600, acute: { Flood: 62, Cyclone: 15, Wildfire: 18, 'Extreme Precipitation': 68 }, chronic: { 'Heat Stress': 46, 'Water Stress': 38, Drought: 40, 'Sea-level Rise': 0 } },
    { name: 'Gary Harbor Works [Synthetic]', assetType: 'Integrated Steel Works', city: 'Gary', lat: 41.603, lng: -87.337, valM: 1300, acute: { Flood: 65, Cyclone: 22, Wildfire: 10, 'Extreme Precipitation': 66 }, chronic: { 'Heat Stress': 52, 'Water Stress': 42, Drought: 44, 'Sea-level Rise': 0 } },
    { name: 'Birmingham Tube Mill [Synthetic]', assetType: 'Electric Arc Furnace Mill', city: 'Birmingham', lat: 33.518, lng: -86.810, valM: 800, acute: { Flood: 58, Cyclone: 45, Wildfire: 35, 'Extreme Precipitation': 72 }, chronic: { 'Heat Stress': 68, 'Water Stress': 50, Drought: 55, 'Sea-level Rise': 0 } },
    { name: 'Cleveland Slag Processing Yard [Synthetic]', assetType: 'By-Product Recovery Yard', city: 'Cleveland', lat: 41.499, lng: -81.694, valM: 500, acute: { Flood: 52, Cyclone: 18, Wildfire: 12, 'Extreme Precipitation': 56 }, chronic: { 'Heat Stress': 44, 'Water Stress': 30, Drought: 32, 'Sea-level Rise': 0 } }
  ],
  'COMP-008': [ // RuhrStahl AG (Germany)
    { name: 'Duisburg-Nord Smelter [Synthetic]', assetType: 'Oxygen Converter Smelter', city: 'Duisburg', lat: 51.488, lng: 6.745, valM: 1500, acute: { Flood: 64, Cyclone: 25, Wildfire: 12, 'Extreme Precipitation': 68 }, chronic: { 'Heat Stress': 48, 'Water Stress': 58, Drought: 55, 'Sea-level Rise': 0 } },
    { name: 'Dortmund Forging & Bar Plant [Synthetic]', assetType: 'Specialty Steel Forge', city: 'Dortmund', lat: 51.513, lng: 7.465, valM: 1200, acute: { Flood: 46, Cyclone: 20, Wildfire: 15, 'Extreme Precipitation': 52 }, chronic: { 'Heat Stress': 42, 'Water Stress': 50, Drought: 46, 'Sea-level Rise': 0 } },
    { name: 'Bochum Electric Arc Furnace [Synthetic]', assetType: 'Recycled Steel Furnace', city: 'Bochum', lat: 51.481, lng: 7.216, valM: 900, acute: { Flood: 42, Cyclone: 18, Wildfire: 10, 'Extreme Precipitation': 48 }, chronic: { 'Heat Stress': 40, 'Water Stress': 45, Drought: 42, 'Sea-level Rise': 0 } }
  ],
  'COMP-009': [ // Severn Metallic Holdings Plc (UK)
    { name: 'Port Talbot Modern Mill [Synthetic]', assetType: 'Integrated Strip Mill', city: 'Port Talbot', lat: 51.583, lng: -3.766, valM: 1000, acute: { Flood: 72, Cyclone: 60, Wildfire: 10, 'Extreme Precipitation': 75 }, chronic: { 'Heat Stress': 28, 'Water Stress': 25, Drought: 22, 'Sea-level Rise': 75 } },
    { name: 'Scunthorpe Heavy Sections [Synthetic]', assetType: 'Rail & Structural Mill', city: 'Scunthorpe', lat: 53.588, lng: -0.654, valM: 800, acute: { Flood: 55, Cyclone: 40, Wildfire: 15, 'Extreme Precipitation': 58 }, chronic: { 'Heat Stress': 26, 'Water Stress': 30, Drought: 28, 'Sea-level Rise': 20 } },
    { name: 'Newport Coil Processing Center [Synthetic]', assetType: 'Finishing Line & Logistics', city: 'Newport', lat: 51.584, lng: -2.997, valM: 400, acute: { Flood: 65, Cyclone: 45, Wildfire: 10, 'Extreme Precipitation': 64 }, chronic: { 'Heat Stress': 25, 'Water Stress': 20, Drought: 20, 'Sea-level Rise': 60 } }
  ],
  'COMP-010': [ // Nippon Tokushu Steel KK (Japan)
    { name: 'Yahata Steel Foundry [Synthetic]', assetType: 'Integrated Alloy Steel Works', city: 'Kitakyushu', lat: 33.868, lng: 130.803, valM: 2100, acute: { Flood: 72, Cyclone: 84, Wildfire: 10, 'Extreme Precipitation': 82 }, chronic: { 'Heat Stress': 64, 'Water Stress': 42, Drought: 36, 'Sea-level Rise': 70 } },
    { name: 'Muroran Specialty Bar Mill [Synthetic]', assetType: 'High-Tensile Bar Works', city: 'Muroran', lat: 42.315, lng: 140.974, valM: 1600, acute: { Flood: 45, Cyclone: 60, Wildfire: 15, 'Extreme Precipitation': 55 }, chronic: { 'Heat Stress': 32, 'Water Stress': 25, Drought: 20, 'Sea-level Rise': 45 } },
    { name: 'Kimitsu Seamless Pipe Facility [Synthetic]', assetType: 'Oil Country Tubular Goods', city: 'Kimitsu', lat: 35.328, lng: 139.864, valM: 1100, acute: { Flood: 68, Cyclone: 80, Wildfire: 8, 'Extreme Precipitation': 75 }, chronic: { 'Heat Stress': 58, 'Water Stress': 35, Drought: 30, 'Sea-level Rise': 65 } }
  ],

  // CEMENT (COMP-011 to COMP-015)
  'COMP-011': [ // Deccan Cements & Minerals (India)
    { name: 'Nalgonda Clinker Mega Plant [Synthetic]', assetType: 'Rotary Kiln Facility', city: 'Nalgonda', lat: 17.050, lng: 79.270, valM: 750, acute: { Flood: 35, Cyclone: 25, Wildfire: 20, 'Extreme Precipitation': 50 }, chronic: { 'Heat Stress': 86, 'Water Stress': 88, Drought: 85, 'Sea-level Rise': 0 } },
    { name: 'Gulbarga Limestone Extraction Unit [Synthetic]', assetType: 'Quarry & Calciner Unit', city: 'Kalaburagi', lat: 17.330, lng: 76.830, valM: 500, acute: { Flood: 28, Cyclone: 15, Wildfire: 22, 'Extreme Precipitation': 42 }, chronic: { 'Heat Stress': 88, 'Water Stress': 90, Drought: 87, 'Sea-level Rise': 0 } },
    { name: 'Visakhapatnam Grinding Mill [Synthetic]', assetType: 'Coastal Grinding Station', city: 'Visakhapatnam', lat: 17.686, lng: 83.218, valM: 350, acute: { Flood: 72, Cyclone: 88, Wildfire: 8, 'Extreme Precipitation': 82 }, chronic: { 'Heat Stress': 76, 'Water Stress': 65, Drought: 55, 'Sea-level Rise': 75 } },
    { name: 'Kurnool Slag Cement Unit [Synthetic]', assetType: 'Slag Blending Unit', city: 'Kurnool', lat: 15.828, lng: 78.037, valM: 200, acute: { Flood: 30, Cyclone: 18, Wildfire: 20, 'Extreme Precipitation': 45 }, chronic: { 'Heat Stress': 84, 'Water Stress': 85, Drought: 82, 'Sea-level Rise': 0 } }
  ],
  'COMP-012': [ // Blue Ridge Aggregates (US)
    { name: 'Shenandoah Limestone Kilns [Synthetic]', assetType: 'Dry Process Cement Kiln', city: 'Roanoke', lat: 37.270, lng: -79.941, valM: 1100, acute: { Flood: 55, Cyclone: 25, Wildfire: 30, 'Extreme Precipitation': 65 }, chronic: { 'Heat Stress': 52, 'Water Stress': 40, Drought: 42, 'Sea-level Rise': 0 } },
    { name: 'Piedmont Distribution Terminal [Synthetic]', assetType: 'Silo & Rail Terminal', city: 'Greensboro', lat: 36.072, lng: -79.791, valM: 800, acute: { Flood: 48, Cyclone: 35, Wildfire: 28, 'Extreme Precipitation': 60 }, chronic: { 'Heat Stress': 56, 'Water Stress': 42, Drought: 45, 'Sea-level Rise': 0 } },
    { name: 'Savannah River Marine Silos [Synthetic]', assetType: 'Deepwater Import Terminal', city: 'Savannah', lat: 32.080, lng: -81.091, valM: 600, acute: { Flood: 80, Cyclone: 75, Wildfire: 15, 'Extreme Precipitation': 82 }, chronic: { 'Heat Stress': 68, 'Water Stress': 48, Drought: 46, 'Sea-level Rise': 84 } }
  ],
  'COMP-013': [ // Bavaria Baustoffe AG (Germany)
    { name: 'Eichstaett White Clinker Works [Synthetic]', assetType: 'Specialty Cement Plant', city: 'Eichstaett', lat: 48.892, lng: 11.185, valM: 950, acute: { Flood: 52, Cyclone: 20, Wildfire: 18, 'Extreme Precipitation': 60 }, chronic: { 'Heat Stress': 40, 'Water Stress': 48, Drought: 45, 'Sea-level Rise': 0 } },
    { name: 'Regensburg Danube Concrete Hub [Synthetic]', assetType: 'Ready-Mix Concrete Center', city: 'Regensburg', lat: 49.013, lng: 12.101, valM: 650, acute: { Flood: 68, Cyclone: 18, Wildfire: 10, 'Extreme Precipitation': 65 }, chronic: { 'Heat Stress': 38, 'Water Stress': 42, Drought: 40, 'Sea-level Rise': 0 } },
    { name: 'Augsburg Aggregate Quarry [Synthetic]', assetType: 'Gravel & Sand Extraction', city: 'Augsburg', lat: 48.370, lng: 10.897, valM: 500, acute: { Flood: 45, Cyclone: 15, Wildfire: 12, 'Extreme Precipitation': 52 }, chronic: { 'Heat Stress': 36, 'Water Stress': 38, Drought: 36, 'Sea-level Rise': 0 } }
  ],
  'COMP-014': [ // Albion Clinker Works Plc (UK)
    { name: 'Peak District Limestone Kilns [Synthetic]', assetType: 'Dry Process Rotary Kiln', city: 'Buxton', lat: 53.259, lng: -1.914, valM: 700, acute: { Flood: 40, Cyclone: 35, Wildfire: 20, 'Extreme Precipitation': 55 }, chronic: { 'Heat Stress': 22, 'Water Stress': 22, Drought: 20, 'Sea-level Rise': 0 } },
    { name: 'Rugby Central Grinding Plant [Synthetic]', assetType: 'Slag & Pozzolan Mill', city: 'Rugby', lat: 52.370, lng: -1.264, valM: 450, acute: { Flood: 48, Cyclone: 30, Wildfire: 15, 'Extreme Precipitation': 52 }, chronic: { 'Heat Stress': 25, 'Water Stress': 28, Drought: 25, 'Sea-level Rise': 0 } },
    { name: 'Avonmouth Cement Depots [Synthetic]', assetType: 'Estuary Bulk Terminal', city: 'Bristol', lat: 51.503, lng: -2.712, valM: 300, acute: { Flood: 76, Cyclone: 52, Wildfire: 8, 'Extreme Precipitation': 70 }, chronic: { 'Heat Stress': 24, 'Water Stress': 20, Drought: 18, 'Sea-level Rise': 80 } }
  ],
  'COMP-015': [ // Sendai Cement Solutions (Japan)
    { name: 'Ofunato Coastal Kiln Complex [Synthetic]', assetType: 'Seaside Cement Plant', city: 'Ofunato', lat: 39.082, lng: 141.708, valM: 1200, acute: { Flood: 75, Cyclone: 78, Wildfire: 15, 'Extreme Precipitation': 78 }, chronic: { 'Heat Stress': 42, 'Water Stress': 30, Drought: 25, 'Sea-level Rise': 68 } },
    { name: 'Iwate Limestone Quarry [Synthetic]', assetType: 'High-Purity Quarry', city: 'Morioka', lat: 39.703, lng: 141.152, valM: 850, acute: { Flood: 40, Cyclone: 55, Wildfire: 25, 'Extreme Precipitation': 52 }, chronic: { 'Heat Stress': 35, 'Water Stress': 28, Drought: 22, 'Sea-level Rise': 0 } },
    { name: 'Tokyo Bay Logistics Silo [Synthetic]', assetType: 'Automated Marine Silo', city: 'Kawasaki', lat: 35.530, lng: 139.703, valM: 650, acute: { Flood: 70, Cyclone: 82, Wildfire: 5, 'Extreme Precipitation': 76 }, chronic: { 'Heat Stress': 60, 'Water Stress': 32, Drought: 28, 'Sea-level Rise': 75 } }
  ],

  // AUTOMOTIVE (COMP-016 to COMP-020)
  'COMP-016': [ // Swaraj Mobility Motors (India)
    { name: 'Chakan Assembly Mega Hub [Synthetic]', assetType: 'Passenger Car Factory', city: 'Pune', lat: 18.760, lng: 73.850, valM: 1400, acute: { Flood: 55, Cyclone: 30, Wildfire: 15, 'Extreme Precipitation': 68 }, chronic: { 'Heat Stress': 75, 'Water Stress': 82, Drought: 78, 'Sea-level Rise': 0 } },
    { name: 'Sanand EV Powertrain Plant [Synthetic]', assetType: 'Battery & Motor Factory', city: 'Sanand', lat: 22.980, lng: 72.380, valM: 950, acute: { Flood: 40, Cyclone: 35, Wildfire: 20, 'Extreme Precipitation': 52 }, chronic: { 'Heat Stress': 85, 'Water Stress': 80, Drought: 80, 'Sea-level Rise': 0 } },
    { name: 'Jamshedpur Stamping Press [Synthetic]', assetType: 'Body-in-White Press Shop', city: 'Jamshedpur', lat: 22.804, lng: 86.202, valM: 550, acute: { Flood: 48, Cyclone: 28, Wildfire: 22, 'Extreme Precipitation': 62 }, chronic: { 'Heat Stress': 80, 'Water Stress': 72, Drought: 68, 'Sea-level Rise': 0 } },
    { name: 'Hosur R&D Proving Grounds [Synthetic]', assetType: 'Automotive Test Facility', city: 'Hosur', lat: 12.740, lng: 77.820, valM: 300, acute: { Flood: 32, Cyclone: 25, Wildfire: 18, 'Extreme Precipitation': 45 }, chronic: { 'Heat Stress': 65, 'Water Stress': 75, Drought: 70, 'Sea-level Rise': 0 } }
  ],
  'COMP-017': [ // Continental Auto Propulsion (US)
    { name: 'Warren Transmission Plant [Synthetic]', assetType: 'Heavy Gear & Motor Plant', city: 'Warren', lat: 42.477, lng: -83.027, valM: 2600, acute: { Flood: 52, Cyclone: 15, Wildfire: 10, 'Extreme Precipitation': 58 }, chronic: { 'Heat Stress': 46, 'Water Stress': 35, Drought: 32, 'Sea-level Rise': 0 } },
    { name: 'Bowling Green Chassis Center [Synthetic]', assetType: 'Chassis Assembly Works', city: 'Bowling Green', lat: 36.968, lng: -86.480, valM: 1900, acute: { Flood: 58, Cyclone: 40, Wildfire: 22, 'Extreme Precipitation': 68 }, chronic: { 'Heat Stress': 58, 'Water Stress': 42, Drought: 45, 'Sea-level Rise': 0 } },
    { name: 'Austin EV Gigafoundry [Synthetic]', assetType: 'Die-Casting & Pack Plant', city: 'Austin', lat: 30.222, lng: -97.617, valM: 1400, acute: { Flood: 45, Cyclone: 25, Wildfire: 42, 'Extreme Precipitation': 60 }, chronic: { 'Heat Stress': 82, 'Water Stress': 75, Drought: 78, 'Sea-level Rise': 0 } },
    { name: 'Toledo Paint & Stamping Yard [Synthetic]', assetType: 'Automated Paint Shop', city: 'Toledo', lat: 41.652, lng: -83.537, valM: 900, acute: { Flood: 50, Cyclone: 18, Wildfire: 12, 'Extreme Precipitation': 54 }, chronic: { 'Heat Stress': 48, 'Water Stress': 34, Drought: 34, 'Sea-level Rise': 0 } }
  ],
  'COMP-018': [ // Stuttgart Motorenwerke AG (Germany)
    { name: 'Sindelfingen Integrated Assembly [Synthetic]', assetType: 'Flagship Luxury Auto Plant', city: 'Sindelfingen', lat: 48.706, lng: 8.995, valM: 3200, acute: { Flood: 46, Cyclone: 22, Wildfire: 15, 'Extreme Precipitation': 54 }, chronic: { 'Heat Stress': 42, 'Water Stress': 45, Drought: 40, 'Sea-level Rise': 0 } },
    { name: 'Untertuerkheim Engine Foundry [Synthetic]', assetType: 'Engine & E-Axle Production', city: 'Stuttgart', lat: 48.780, lng: 9.245, valM: 2300, acute: { Flood: 55, Cyclone: 20, Wildfire: 12, 'Extreme Precipitation': 58 }, chronic: { 'Heat Stress': 44, 'Water Stress': 48, Drought: 44, 'Sea-level Rise': 0 } },
    { name: 'Kamenz Battery Cell Plant [Synthetic]', assetType: 'Lithium-Ion Pack Facility', city: 'Kamenz', lat: 51.270, lng: 14.095, valM: 1400, acute: { Flood: 38, Cyclone: 18, Wildfire: 25, 'Extreme Precipitation': 45 }, chronic: { 'Heat Stress': 38, 'Water Stress': 52, Drought: 48, 'Sea-level Rise': 0 } },
    { name: 'Bremen Coastal Logistics Depot [Synthetic]', assetType: 'Finished Vehicle Export Hub', city: 'Bremen', lat: 53.079, lng: 8.801, valM: 1000, acute: { Flood: 74, Cyclone: 45, Wildfire: 5, 'Extreme Precipitation': 65 }, chronic: { 'Heat Stress': 30, 'Water Stress': 32, Drought: 30, 'Sea-level Rise': 72 } }
  ],
  'COMP-019': [ // Midlands EV & Commercials Plc (UK)
    { name: 'Solihull Assembly Works [Synthetic]', assetType: 'Aluminum Body Assembly', city: 'Solihull', lat: 52.412, lng: -1.778, valM: 1100, acute: { Flood: 42, Cyclone: 32, Wildfire: 12, 'Extreme Precipitation': 50 }, chronic: { 'Heat Stress': 24, 'Water Stress': 26, Drought: 24, 'Sea-level Rise': 0 } },
    { name: 'Castle Bromwich Battery Lab [Synthetic]', assetType: 'Electric Platform Engineering', city: 'Birmingham', lat: 52.515, lng: -1.795, valM: 800, acute: { Flood: 45, Cyclone: 30, Wildfire: 10, 'Extreme Precipitation': 52 }, chronic: { 'Heat Stress': 25, 'Water Stress': 28, Drought: 25, 'Sea-level Rise': 0 } },
    { name: 'Halewood Pressing Works [Synthetic]', assetType: 'Sheet Metal Pressing Shop', city: 'Liverpool', lat: 53.355, lng: -2.836, valM: 500, acute: { Flood: 58, Cyclone: 48, Wildfire: 8, 'Extreme Precipitation': 62 }, chronic: { 'Heat Stress': 20, 'Water Stress': 20, Drought: 18, 'Sea-level Rise': 35 } }
  ],
  'COMP-020': [ // Aichi Precision Auto KK (Japan)
    { name: 'Motomachi Vehicle Plant [Synthetic]', assetType: 'High-Volume Assembly Works', city: 'Toyota City', lat: 35.083, lng: 137.155, valM: 4100, acute: { Flood: 55, Cyclone: 82, Wildfire: 12, 'Extreme Precipitation': 78 }, chronic: { 'Heat Stress': 62, 'Water Stress': 38, Drought: 32, 'Sea-level Rise': 0 } },
    { name: 'Tahara Coastal Manufacturing Complex [Synthetic]', assetType: 'Integrated Auto & Engine Works', city: 'Tahara', lat: 34.667, lng: 137.267, valM: 3100, acute: { Flood: 80, Cyclone: 90, Wildfire: 8, 'Extreme Precipitation': 85 }, chronic: { 'Heat Stress': 65, 'Water Stress': 35, Drought: 30, 'Sea-level Rise': 82 } },
    { name: 'Tsutsumi Hybrid Plant [Synthetic]', assetType: 'Hybrid & Fuel Cell Works', city: 'Toyota City', lat: 35.045, lng: 137.108, valM: 1900, acute: { Flood: 50, Cyclone: 78, Wildfire: 10, 'Extreme Precipitation': 72 }, chronic: { 'Heat Stress': 60, 'Water Stress': 36, Drought: 30, 'Sea-level Rise': 0 } }
  ],

  // COMMERCIAL REAL ESTATE (COMP-021 to COMP-025)
  'COMP-021': [ // Indus Urban Landmark REIT (India)
    { name: 'Bandra-Kurla Prestige Tower [Synthetic]', assetType: 'Grade-A Commercial Tower', city: 'Mumbai', lat: 19.068, lng: 72.868, valM: 1600, acute: { Flood: 88, Cyclone: 84, Wildfire: 5, 'Extreme Precipitation': 95 }, chronic: { 'Heat Stress': 78, 'Water Stress': 70, Drought: 50, 'Sea-level Rise': 88 } },
    { name: 'Whitefield Tech Park Block Alpha [Synthetic]', assetType: 'IT Campus Complex', city: 'Bengaluru', lat: 12.983, lng: 77.749, valM: 1100, acute: { Flood: 60, Cyclone: 25, Wildfire: 10, 'Extreme Precipitation': 72 }, chronic: { 'Heat Stress': 62, 'Water Stress': 88, Drought: 82, 'Sea-level Rise': 0 } },
    { name: 'Gurugram Cyber Galleria [Synthetic]', assetType: 'Prime Office & Retail Mall', city: 'Gurugram', lat: 28.490, lng: 77.089, valM: 700, acute: { Flood: 65, Cyclone: 15, Wildfire: 18, 'Extreme Precipitation': 70 }, chronic: { 'Heat Stress': 86, 'Water Stress': 92, Drought: 88, 'Sea-level Rise': 0 } }
  ],
  'COMP-022': [ // Hudson Prime Realty Trust (US)
    { name: 'Hudson Yards West Pinnacle [Synthetic]', assetType: 'Skyscraper Office Tower', city: 'New York', lat: 40.753, lng: -74.002, valM: 3100, acute: { Flood: 72, Cyclone: 55, Wildfire: 5, 'Extreme Precipitation': 76 }, chronic: { 'Heat Stress': 48, 'Water Stress': 30, Drought: 28, 'Sea-level Rise': 75 } },
    { name: 'Boston Seaport Innovation Center [Synthetic]', assetType: 'Life Sciences Commercial Hub', city: 'Boston', lat: 42.348, lng: -71.043, valM: 2200, acute: { Flood: 78, Cyclone: 60, Wildfire: 5, 'Extreme Precipitation': 74 }, chronic: { 'Heat Stress': 40, 'Water Stress': 28, Drought: 25, 'Sea-level Rise': 82 } },
    { name: 'Brickell Financial Center [Synthetic]', assetType: 'Coastal Financial Tower', city: 'Miami', lat: 25.761, lng: -80.191, valM: 1400, acute: { Flood: 92, Cyclone: 95, Wildfire: 10, 'Extreme Precipitation': 90 }, chronic: { 'Heat Stress': 85, 'Water Stress': 60, Drought: 45, 'Sea-level Rise': 95 } },
    { name: 'Chicago Loop Commercial Plaza [Synthetic]', assetType: 'Central Business District Office', city: 'Chicago', lat: 41.882, lng: -87.629, valM: 900, acute: { Flood: 52, Cyclone: 20, Wildfire: 10, 'Extreme Precipitation': 60 }, chronic: { 'Heat Stress': 50, 'Water Stress': 32, Drought: 30, 'Sea-level Rise': 0 } }
  ],
  'COMP-023': [ // Hanseatic Immobilen AG (Germany)
    { name: 'HafenCity Maritime Office Tower [Synthetic]', assetType: 'Waterfront Commercial Building', city: 'Hamburg', lat: 53.542, lng: 9.998, valM: 2100, acute: { Flood: 80, Cyclone: 50, Wildfire: 5, 'Extreme Precipitation': 68 }, chronic: { 'Heat Stress': 32, 'Water Stress': 30, Drought: 28, 'Sea-level Rise': 78 } },
    { name: 'Frankfurt Mainzer Landstrasse Hub [Synthetic]', assetType: 'Banking District High-Rise', city: 'Frankfurt', lat: 50.113, lng: 8.665, valM: 1600, acute: { Flood: 45, Cyclone: 25, Wildfire: 12, 'Extreme Precipitation': 52 }, chronic: { 'Heat Stress': 46, 'Water Stress': 45, Drought: 42, 'Sea-level Rise': 0 } },
    { name: 'Berlin Potsdamer Platz Center [Synthetic]', assetType: 'Mixed Commercial & Retail', city: 'Berlin', lat: 52.509, lng: 13.376, valM: 1000, acute: { Flood: 40, Cyclone: 20, Wildfire: 15, 'Extreme Precipitation': 48 }, chronic: { 'Heat Stress': 44, 'Water Stress': 55, Drought: 52, 'Sea-level Rise': 0 } }
  ],
  'COMP-024': [ // Canary Square Properties Plc (UK)
    { name: 'Canary Wharf Prime Dockland Tower [Synthetic]', assetType: 'Waterfront Financial Skyscraper', city: 'London', lat: 51.505, lng: -0.020, valM: 2600, acute: { Flood: 65, Cyclone: 40, Wildfire: 5, 'Extreme Precipitation': 60 }, chronic: { 'Heat Stress': 35, 'Water Stress': 42, Drought: 38, 'Sea-level Rise': 65 } },
    { name: 'City of London Leadenhall Tower [Synthetic]', assetType: 'Institutional Insurance Tower', city: 'London', lat: 51.513, lng: -0.082, valM: 1900, acute: { Flood: 42, Cyclone: 35, Wildfire: 8, 'Extreme Precipitation': 52 }, chronic: { 'Heat Stress': 34, 'Water Stress': 40, Drought: 36, 'Sea-level Rise': 35 } },
    { name: 'Edinburgh St Andrew Square Plaza [Synthetic]', assetType: 'Asset Management Head Office', city: 'Edinburgh', lat: 55.954, lng: -3.193, valM: 1000, acute: { Flood: 38, Cyclone: 52, Wildfire: 10, 'Extreme Precipitation': 55 }, chronic: { 'Heat Stress': 18, 'Water Stress': 20, Drought: 15, 'Sea-level Rise': 20 } }
  ],
  'COMP-025': [ // Nippon Central Office Fund (Japan)
    { name: 'Marunouchi Grand Headquarters [Synthetic]', assetType: 'Seismic Grade-S Office Tower', city: 'Tokyo', lat: 35.681, lng: 139.764, valM: 3400, acute: { Flood: 60, Cyclone: 80, Wildfire: 5, 'Extreme Precipitation': 75 }, chronic: { 'Heat Stress': 65, 'Water Stress': 35, Drought: 30, 'Sea-level Rise': 60 } },
    { name: 'Osaka Nakanoshima Landmark [Synthetic]', assetType: 'Island Commercial Complex', city: 'Osaka', lat: 34.692, lng: 135.496, valM: 2100, acute: { Flood: 75, Cyclone: 85, Wildfire: 5, 'Extreme Precipitation': 80 }, chronic: { 'Heat Stress': 68, 'Water Stress': 38, Drought: 32, 'Sea-level Rise': 75 } },
    { name: 'Nagoya Station Meieki Plaza [Synthetic]', assetType: 'Integrated Transit Hub Tower', city: 'Nagoya', lat: 35.170, lng: 136.882, valM: 1300, acute: { Flood: 62, Cyclone: 82, Wildfire: 8, 'Extreme Precipitation': 76 }, chronic: { 'Heat Stress': 64, 'Water Stress': 36, Drought: 30, 'Sea-level Rise': 40 } }
  ],

  // AGRICULTURE (COMP-026 to COMP-030)
  'COMP-026': [ // Punjab Agro-Harvest Holdings (India)
    { name: 'Ludhiana Central Grain Processing [Synthetic]', assetType: 'Grain Milling & Silo Complex', city: 'Ludhiana', lat: 30.900, lng: 75.857, valM: 700, acute: { Flood: 65, Cyclone: 10, Wildfire: 30, 'Extreme Precipitation': 70 }, chronic: { 'Heat Stress': 88, 'Water Stress': 95, Drought: 92, 'Sea-level Rise': 0 } },
    { name: 'Amritsar Seed Conditioning Plant [Synthetic]', assetType: 'Hybrid Seed Processing Facility', city: 'Amritsar', lat: 31.634, lng: 74.872, valM: 450, acute: { Flood: 58, Cyclone: 10, Wildfire: 25, 'Extreme Precipitation': 65 }, chronic: { 'Heat Stress': 86, 'Water Stress': 94, Drought: 90, 'Sea-level Rise': 0 } },
    { name: 'Bhatinda Cold Chain Terminal [Synthetic]', assetType: 'Perishable Logistics Warehouse', city: 'Bathinda', lat: 30.211, lng: 74.945, valM: 350, acute: { Flood: 42, Cyclone: 8, Wildfire: 35, 'Extreme Precipitation': 50 }, chronic: { 'Heat Stress': 90, 'Water Stress': 96, Drought: 94, 'Sea-level Rise': 0 } },
    { name: 'Jalandhar Agro-Chemical Blending [Synthetic]', assetType: 'Bio-Fertilizer Formulation Unit', city: 'Jalandhar', lat: 31.326, lng: 75.576, valM: 200, acute: { Flood: 52, Cyclone: 10, Wildfire: 22, 'Extreme Precipitation': 62 }, chronic: { 'Heat Stress': 85, 'Water Stress': 92, Drought: 88, 'Sea-level Rise': 0 } }
  ],
  'COMP-027': [ // Heartland Grain & Silos (US)
    { name: 'Des Moines River Grain Terminal [Synthetic]', assetType: 'Inland River Elevator & Silo', city: 'Des Moines', lat: 41.586, lng: -93.625, valM: 1600, acute: { Flood: 72, Cyclone: 25, Wildfire: 20, 'Extreme Precipitation': 75 }, chronic: { 'Heat Stress': 58, 'Water Stress': 52, Drought: 62, 'Sea-level Rise': 0 } },
    { name: 'Omaha Corn Processing Complex [Synthetic]', assetType: 'Ethanol & Animal Feed Plant', city: 'Omaha', lat: 41.256, lng: -95.934, valM: 1200, acute: { Flood: 68, Cyclone: 28, Wildfire: 22, 'Extreme Precipitation': 70 }, chronic: { 'Heat Stress': 60, 'Water Stress': 55, Drought: 65, 'Sea-level Rise': 0 } },
    { name: 'Quad Cities Mississippi Barge Port [Synthetic]', assetType: 'Barge Loading Marine Facility', city: 'Davenport', lat: 41.523, lng: -90.577, valM: 700, acute: { Flood: 82, Cyclone: 20, Wildfire: 15, 'Extreme Precipitation': 78 }, chronic: { 'Heat Stress': 55, 'Water Stress': 48, Drought: 55, 'Sea-level Rise': 0 } }
  ],
  'COMP-028': [ // Schwarzwald Agrarprodukte eG (Germany)
    { name: 'Breisgau Dairy Processing Center [Synthetic]', assetType: 'Automated Dairy Processing', city: 'Freiburg', lat: 47.999, lng: 7.842, valM: 650, acute: { Flood: 48, Cyclone: 22, Wildfire: 25, 'Extreme Precipitation': 58 }, chronic: { 'Heat Stress': 46, 'Water Stress': 50, Drought: 48, 'Sea-level Rise': 0 } },
    { name: 'Ortenau Fruit Storage & Logistics [Synthetic]', assetType: 'Controlled Atmosphere Cold Store', city: 'Offenburg', lat: 48.473, lng: 7.944, valM: 500, acute: { Flood: 52, Cyclone: 20, Wildfire: 20, 'Extreme Precipitation': 56 }, chronic: { 'Heat Stress': 44, 'Water Stress': 48, Drought: 45, 'Sea-level Rise': 0 } },
    { name: 'Kaiserstuhl Organic Vineyard Cellars [Synthetic]', assetType: 'Winery & Bottling Facility', city: 'Vogtsburg', lat: 48.087, lng: 7.625, valM: 350, acute: { Flood: 35, Cyclone: 18, Wildfire: 30, 'Extreme Precipitation': 48 }, chronic: { 'Heat Stress': 52, 'Water Stress': 58, Drought: 54, 'Sea-level Rise': 0 } }
  ],
  'COMP-029': [ // Wessex Bio-Farms Group Plc (UK)
    { name: 'Salisbury Plain Milling Plant [Synthetic]', assetType: 'Bio-Flour & Grain Mills', city: 'Salisbury', lat: 51.074, lng: -1.794, valM: 500, acute: { Flood: 45, Cyclone: 35, Wildfire: 18, 'Extreme Precipitation': 54 }, chronic: { 'Heat Stress': 28, 'Water Stress': 35, Drought: 32, 'Sea-level Rise': 0 } },
    { name: 'Somerset Dairy Farm Hub [Synthetic]', assetType: 'Pasture Dairy & Cheese Works', city: 'Yeovil', lat: 50.942, lng: -2.632, valM: 350, acute: { Flood: 60, Cyclone: 38, Wildfire: 12, 'Extreme Precipitation': 62 }, chronic: { 'Heat Stress': 26, 'Water Stress': 28, Drought: 26, 'Sea-level Rise': 15 } },
    { name: 'Dorset Agri-Biomass Digester [Synthetic]', assetType: 'Anaerobic Digestion Plant', city: 'Dorchester', lat: 50.715, lng: -2.438, valM: 250, acute: { Flood: 40, Cyclone: 42, Wildfire: 15, 'Extreme Precipitation': 52 }, chronic: { 'Heat Stress': 25, 'Water Stress': 30, Drought: 28, 'Sea-level Rise': 10 } }
  ],
  'COMP-030': [ // Hokkaido Agro-Pastoral KK (Japan)
    { name: 'Tokachi Dairy Processing Complex [Synthetic]', assetType: 'Milk Powder & Butter Works', city: 'Obihiro', lat: 42.923, lng: 143.196, valM: 1000, acute: { Flood: 48, Cyclone: 45, Wildfire: 15, 'Extreme Precipitation': 56 }, chronic: { 'Heat Stress': 28, 'Water Stress': 25, Drought: 22, 'Sea-level Rise': 0 } },
    { name: 'Asahikawa Grain Silo Center [Synthetic]', assetType: 'Wheat & Barley Silo Depot', city: 'Asahikawa', lat: 43.770, lng: 142.364, valM: 750, acute: { Flood: 52, Cyclone: 40, Wildfire: 18, 'Extreme Precipitation': 58 }, chronic: { 'Heat Stress': 32, 'Water Stress': 28, Drought: 24, 'Sea-level Rise': 0 } },
    { name: 'Tomakomai Cold Port Logistics [Synthetic]', assetType: 'Refrigerated Export Terminal', city: 'Tomakomai', lat: 42.635, lng: 141.605, valM: 450, acute: { Flood: 68, Cyclone: 65, Wildfire: 10, 'Extreme Precipitation': 70 }, chronic: { 'Heat Stress': 25, 'Water Stress': 20, Drought: 18, 'Sea-level Rise': 65 } }
  ]
};

// Generate exactly 100 physical assets deterministically
function buildSyntheticAssets(): PhysicalAsset[] {
  const assets: PhysicalAsset[] = [];
  let assetCounter = 1;

  for (const comp of SYNTHETIC_COMPANIES) {
    const blueprints = ASSET_BLUEPRINTS[comp.id] || [];
    for (const bp of blueprints) {
      const assetId = `ASSET-${String(assetCounter).padStart(3, '0')}`;
      
      // Calculate composite overall physical score (weighted 40% acute max, 60% chronic max)
      const acuteValues = Object.values(bp.acute);
      const chronicValues = Object.values(bp.chronic);
      const maxAcute = Math.max(...acuteValues);
      const maxChronic = Math.max(...chronicValues);
      const avgAcute = acuteValues.reduce((a, b) => a + b, 0) / acuteValues.length;
      const avgChronic = chronicValues.reduce((a, b) => a + b, 0) / chronicValues.length;

      const compositeScore = Math.round((maxAcute * 0.3) + (avgAcute * 0.2) + (maxChronic * 0.3) + (avgChronic * 0.2));

      let riskTier: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      if (compositeScore >= 75) riskTier = 'Critical';
      else if (compositeScore >= 55) riskTier = 'High';
      else if (compositeScore >= 35) riskTier = 'Medium';

      assets.push({
        id: assetId,
        companyId: comp.id,
        companyName: comp.name,
        sector: comp.sector,
        name: bp.name,
        isSynthetic: true,
        assetType: bp.assetType,
        country: comp.country,
        city: bp.city,
        latitude: bp.lat,
        longitude: bp.lng,
        replacementValueUsdM: bp.valM,
        acuteHazards: bp.acute,
        chronicHazards: bp.chronic,
        overallPhysicalScore: compositeScore,
        riskTier
      });

      assetCounter++;
    }
  }

  return assets;
}

export const SYNTHETIC_ASSETS: PhysicalAsset[] = buildSyntheticAssets();
