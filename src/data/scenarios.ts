/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Scenario Catalog
 * Aligned with NGFS Phase IV Scenario Framework principles:
 * 1. Orderly (Net Zero 2050 / Below 2°C)
 * 2. Disorderly (Delayed Transition)
 * 3. Hot House World / High Warming (Current Policies / >3°C)
 * 4. Baseline / Current Policies
 * 5. Custom User Scenario
 * 
 * All trajectories are synthetic proxies calibrated to peer-reviewed NGFS macro-climate ranges.
 */

import { ScenarioDefinition, TimeHorizon } from '../types/climate';

export const SCENARIO_CATALOG: Record<string, ScenarioDefinition> = {
  orderly: {
    id: 'orderly',
    name: 'Orderly Transition (Net Zero 2050)',
    category: 'Orderly',
    ngfsAlignment: 'NGFS Phase IV — Net Zero 2050 (1.5°C ambitious smooth climate action)',
    provider: 'Synthetic NGFS Phase IV Aligned Proxy',
    sourceVersion: 'v4.1.2-SYNTH',
    publicationDate: '2024-11-15',
    priceBaseYear: 2024,
    narrativeSummary: 'Ambitious, coordinated international climate policies implemented early. Stringent carbon pricing is introduced immediately alongside rapid technological innovation and energy efficiency. Transition costs are managed smoothly with lower overall economic volatility.',
    keyAssumptions: [
      'Carbon price rises steadily from $45/t in 2025 to $140/t in 2030, reaching $280/t by 2050.',
      'Global warming is constrained to 1.5°C above pre-industrial levels with minimal overshoot.',
      'Fast electrification and renewable deployment suppresses long-term wholesale power costs.',
      'Slight near-term GDP drag (-0.8% in 2030) offset by long-term avoided physical damages.'
    ],
    horizons: {
      2025: {
        horizon: 2025,
        carbonPriceUsd: 45,
        tempAnomalyCelsius: 1.25,
        electricityPriceUsdMwh: 80,
        energyDemandIndex: 100,
        sectorEmissionsReductionPct: {
          'Power Generation': 12,
          'Steel': 6,
          'Cement': 5,
          'Automotive': 10,
          'Commercial Real Estate': 8,
          'Agriculture': 4
        },
        gdpImpactPct: -0.2,
        inflationBps: 20,
        acuteHazardIndex: 25,
        chronicHazardIndex: 22
      },
      2030: {
        horizon: 2030,
        carbonPriceUsd: 140,
        tempAnomalyCelsius: 1.35,
        electricityPriceUsdMwh: 92,
        energyDemandIndex: 98,
        sectorEmissionsReductionPct: {
          'Power Generation': 48,
          'Steel': 28,
          'Cement': 24,
          'Automotive': 45,
          'Commercial Real Estate': 35,
          'Agriculture': 18
        },
        gdpImpactPct: -0.8,
        inflationBps: 55,
        acuteHazardIndex: 30,
        chronicHazardIndex: 28
      },
      2035: {
        horizon: 2035,
        carbonPriceUsd: 195,
        tempAnomalyCelsius: 1.42,
        electricityPriceUsdMwh: 88,
        energyDemandIndex: 96,
        sectorEmissionsReductionPct: {
          'Power Generation': 72,
          'Steel': 48,
          'Cement': 42,
          'Automotive': 68,
          'Commercial Real Estate': 54,
          'Agriculture': 28
        },
        gdpImpactPct: -0.6,
        inflationBps: 35,
        acuteHazardIndex: 34,
        chronicHazardIndex: 32
      },
      2040: {
        horizon: 2040,
        carbonPriceUsd: 235,
        tempAnomalyCelsius: 1.48,
        electricityPriceUsdMwh: 82,
        energyDemandIndex: 95,
        sectorEmissionsReductionPct: {
          'Power Generation': 88,
          'Steel': 66,
          'Cement': 60,
          'Automotive': 84,
          'Commercial Real Estate': 70,
          'Agriculture': 38
        },
        gdpImpactPct: -0.3,
        inflationBps: 20,
        acuteHazardIndex: 38,
        chronicHazardIndex: 36
      },
      2045: {
        horizon: 2045,
        carbonPriceUsd: 260,
        tempAnomalyCelsius: 1.50,
        electricityPriceUsdMwh: 78,
        energyDemandIndex: 94,
        sectorEmissionsReductionPct: {
          'Power Generation': 95,
          'Steel': 80,
          'Cement': 75,
          'Automotive': 92,
          'Commercial Real Estate': 82,
          'Agriculture': 46
        },
        gdpImpactPct: 0.1,
        inflationBps: 10,
        acuteHazardIndex: 40,
        chronicHazardIndex: 39
      },
      2050: {
        horizon: 2050,
        carbonPriceUsd: 280,
        tempAnomalyCelsius: 1.50,
        electricityPriceUsdMwh: 74,
        energyDemandIndex: 93,
        sectorEmissionsReductionPct: {
          'Power Generation': 99,
          'Steel': 90,
          'Cement': 86,
          'Automotive': 98,
          'Commercial Real Estate': 90,
          'Agriculture': 55
        },
        gdpImpactPct: 0.4,
        inflationBps: 5,
        acuteHazardIndex: 42,
        chronicHazardIndex: 40
      }
    }
  },

  disorderly: {
    id: 'disorderly',
    name: 'Disorderly Transition (Delayed Action)',
    category: 'Disorderly',
    ngfsAlignment: 'NGFS Phase IV — Delayed Transition (late, sudden, aggressive action after 2030)',
    provider: 'Synthetic NGFS Phase IV Aligned Proxy',
    sourceVersion: 'v4.1.2-SYNTH',
    publicationDate: '2024-11-15',
    priceBaseYear: 2024,
    narrativeSummary: 'Climate policy action is delayed until 2030, followed by abrupt, steep carbon price hikes and rapid mandatory phase-outs of high-emitting technologies. Economic shocks, stranded assets, and capital misallocation result in substantial transition and financial stress.',
    keyAssumptions: [
      'Subdued carbon price through 2030 ($25/t), followed by explosive surge to $220/t in 2035 and $350/t in 2040.',
      'Sudden fossil fuel plant retirements cause severe wholesale electricity price spikes ($145/MWh in 2035).',
      'Sharp macroeconomic contraction (-2.4% GDP drag in 2035) with elevated inflation (+120 bps).',
      'Moderate temperature peak at ~1.75°C before stabilizing near 1.6°C.'
    ],
    horizons: {
      2025: {
        horizon: 2025,
        carbonPriceUsd: 15,
        tempAnomalyCelsius: 1.28,
        electricityPriceUsdMwh: 76,
        energyDemandIndex: 101,
        sectorEmissionsReductionPct: {
          'Power Generation': 4,
          'Steel': 2,
          'Cement': 1,
          'Automotive': 3,
          'Commercial Real Estate': 2,
          'Agriculture': 1
        },
        gdpImpactPct: -0.1,
        inflationBps: 10,
        acuteHazardIndex: 26,
        chronicHazardIndex: 24
      },
      2030: {
        horizon: 2030,
        carbonPriceUsd: 35,
        tempAnomalyCelsius: 1.45,
        electricityPriceUsdMwh: 85,
        energyDemandIndex: 103,
        sectorEmissionsReductionPct: {
          'Power Generation': 12,
          'Steel': 8,
          'Cement': 6,
          'Automotive': 14,
          'Commercial Real Estate': 10,
          'Agriculture': 4
        },
        gdpImpactPct: -0.4,
        inflationBps: 30,
        acuteHazardIndex: 32,
        chronicHazardIndex: 30
      },
      2035: {
        horizon: 2035,
        carbonPriceUsd: 220,
        tempAnomalyCelsius: 1.60,
        electricityPriceUsdMwh: 145,
        energyDemandIndex: 94,
        sectorEmissionsReductionPct: {
          'Power Generation': 65,
          'Steel': 42,
          'Cement': 38,
          'Automotive': 60,
          'Commercial Real Estate': 48,
          'Agriculture': 20
        },
        gdpImpactPct: -2.4,
        inflationBps: 120,
        acuteHazardIndex: 40,
        chronicHazardIndex: 38
      },
      2040: {
        horizon: 2040,
        carbonPriceUsd: 350,
        tempAnomalyCelsius: 1.68,
        electricityPriceUsdMwh: 128,
        energyDemandIndex: 91,
        sectorEmissionsReductionPct: {
          'Power Generation': 84,
          'Steel': 62,
          'Cement': 55,
          'Automotive': 78,
          'Commercial Real Estate': 65,
          'Agriculture': 30
        },
        gdpImpactPct: -1.8,
        inflationBps: 80,
        acuteHazardIndex: 46,
        chronicHazardIndex: 44
      },
      2045: {
        horizon: 2045,
        carbonPriceUsd: 380,
        tempAnomalyCelsius: 1.70,
        electricityPriceUsdMwh: 110,
        energyDemandIndex: 89,
        sectorEmissionsReductionPct: {
          'Power Generation': 92,
          'Steel': 74,
          'Cement': 68,
          'Automotive': 88,
          'Commercial Real Estate': 76,
          'Agriculture': 38
        },
        gdpImpactPct: -1.1,
        inflationBps: 45,
        acuteHazardIndex: 49,
        chronicHazardIndex: 47
      },
      2050: {
        horizon: 2050,
        carbonPriceUsd: 410,
        tempAnomalyCelsius: 1.68,
        electricityPriceUsdMwh: 98,
        energyDemandIndex: 88,
        sectorEmissionsReductionPct: {
          'Power Generation': 97,
          'Steel': 85,
          'Cement': 79,
          'Automotive': 95,
          'Commercial Real Estate': 84,
          'Agriculture': 45
        },
        gdpImpactPct: -0.5,
        inflationBps: 25,
        acuteHazardIndex: 51,
        chronicHazardIndex: 49
      }
    }
  },

  high_warming: {
    id: 'high_warming',
    name: 'High Warming (Hot House World / >3°C)',
    category: 'Hot House World',
    ngfsAlignment: 'NGFS Phase IV — Current Policies (fragmented, weak climate action with catastrophic physical risks)',
    provider: 'Synthetic NGFS Phase IV Aligned Proxy',
    sourceVersion: 'v4.1.2-SYNTH',
    publicationDate: '2024-11-15',
    priceBaseYear: 2024,
    narrativeSummary: 'Only existing policies are preserved. No meaningful global carbon pricing is enacted. Fossil fuels dominate the energy system, causing global temperatures to exceed 3.0°C by end-of-century with compounding physical perils, widespread asset degradation, and chronic operational disruptions.',
    keyAssumptions: [
      'Carbon price remains stagnant below $25/t through 2050 (near-zero transition cost).',
      'Global mean temperature reaches 1.8°C by 2035 and 2.6°C by 2050, heading to >3.2°C.',
      'Extreme physical climate hazards escalate non-linearly (acute hazard index reaches 88 by 2050).',
      'Long-term structural GDP erosion (-4.5% in 2050) driven by chronic heat, drought, and capital destruction.'
    ],
    horizons: {
      2025: {
        horizon: 2025,
        carbonPriceUsd: 10,
        tempAnomalyCelsius: 1.30,
        electricityPriceUsdMwh: 75,
        energyDemandIndex: 101,
        sectorEmissionsReductionPct: {
          'Power Generation': 2,
          'Steel': 1,
          'Cement': 0,
          'Automotive': 2,
          'Commercial Real Estate': 1,
          'Agriculture': 0
        },
        gdpImpactPct: 0.0,
        inflationBps: 5,
        acuteHazardIndex: 28,
        chronicHazardIndex: 26
      },
      2030: {
        horizon: 2030,
        carbonPriceUsd: 12,
        tempAnomalyCelsius: 1.55,
        electricityPriceUsdMwh: 78,
        energyDemandIndex: 106,
        sectorEmissionsReductionPct: {
          'Power Generation': 5,
          'Steel': 3,
          'Cement': 2,
          'Automotive': 5,
          'Commercial Real Estate': 3,
          'Agriculture': 1
        },
        gdpImpactPct: -0.3,
        inflationBps: 15,
        acuteHazardIndex: 38,
        chronicHazardIndex: 36
      },
      2035: {
        horizon: 2035,
        carbonPriceUsd: 15,
        tempAnomalyCelsius: 1.82,
        electricityPriceUsdMwh: 81,
        energyDemandIndex: 111,
        sectorEmissionsReductionPct: {
          'Power Generation': 8,
          'Steel': 5,
          'Cement': 3,
          'Automotive': 8,
          'Commercial Real Estate': 5,
          'Agriculture': 2
        },
        gdpImpactPct: -1.0,
        inflationBps: 30,
        acuteHazardIndex: 52,
        chronicHazardIndex: 49
      },
      2040: {
        horizon: 2040,
        carbonPriceUsd: 18,
        tempAnomalyCelsius: 2.10,
        electricityPriceUsdMwh: 85,
        energyDemandIndex: 116,
        sectorEmissionsReductionPct: {
          'Power Generation': 12,
          'Steel': 7,
          'Cement': 5,
          'Automotive': 12,
          'Commercial Real Estate': 7,
          'Agriculture': 3
        },
        gdpImpactPct: -2.0,
        inflationBps: 50,
        acuteHazardIndex: 65,
        chronicHazardIndex: 62
      },
      2045: {
        horizon: 2045,
        carbonPriceUsd: 20,
        tempAnomalyCelsius: 2.38,
        electricityPriceUsdMwh: 89,
        energyDemandIndex: 120,
        sectorEmissionsReductionPct: {
          'Power Generation': 15,
          'Steel': 9,
          'Cement': 6,
          'Automotive': 15,
          'Commercial Real Estate': 9,
          'Agriculture': 4
        },
        gdpImpactPct: -3.2,
        inflationBps: 75,
        acuteHazardIndex: 78,
        chronicHazardIndex: 75
      },
      2050: {
        horizon: 2050,
        carbonPriceUsd: 22,
        tempAnomalyCelsius: 2.65,
        electricityPriceUsdMwh: 93,
        energyDemandIndex: 125,
        sectorEmissionsReductionPct: {
          'Power Generation': 18,
          'Steel': 12,
          'Cement': 8,
          'Automotive': 18,
          'Commercial Real Estate': 12,
          'Agriculture': 5
        },
        gdpImpactPct: -4.5,
        inflationBps: 110,
        acuteHazardIndex: 88,
        chronicHazardIndex: 86
      }
    }
  },

  baseline: {
    id: 'baseline',
    name: 'Baseline (Current Policies)',
    category: 'Baseline / Current Policies',
    ngfsAlignment: 'NGFS Phase IV — Baseline Reference Pathway',
    provider: 'Synthetic NGFS Phase IV Aligned Proxy',
    sourceVersion: 'v4.1.2-SYNTH',
    publicationDate: '2024-11-15',
    priceBaseYear: 2024,
    narrativeSummary: 'Reference baseline assuming continuation of existing statutory regulations and legislated policies as of 2024 without further tightening. Used as benchmark against which incremental transition and physical risk deviations are computed.',
    keyAssumptions: [
      'Carbon price nominal index starts at $5/t and adjusts solely with regional baseline inflation.',
      'Energy demand expands at historical trend rate with modest efficiency gains.',
      'Serves as the numerical counterfactual baseline for incremental stress-test metrics.'
    ],
    horizons: {
      2025: {
        horizon: 2025,
        carbonPriceUsd: 5,
        tempAnomalyCelsius: 1.25,
        electricityPriceUsdMwh: 75,
        energyDemandIndex: 100,
        sectorEmissionsReductionPct: {
          'Power Generation': 0,
          'Steel': 0,
          'Cement': 0,
          'Automotive': 0,
          'Commercial Real Estate': 0,
          'Agriculture': 0
        },
        gdpImpactPct: 0.0,
        inflationBps: 0,
        acuteHazardIndex: 25,
        chronicHazardIndex: 23
      },
      2030: {
        horizon: 2030,
        carbonPriceUsd: 8,
        tempAnomalyCelsius: 1.45,
        electricityPriceUsdMwh: 77,
        energyDemandIndex: 104,
        sectorEmissionsReductionPct: {
          'Power Generation': 3,
          'Steel': 2,
          'Cement': 1,
          'Automotive': 4,
          'Commercial Real Estate': 2,
          'Agriculture': 1
        },
        gdpImpactPct: 0.0,
        inflationBps: 0,
        acuteHazardIndex: 32,
        chronicHazardIndex: 30
      },
      2035: {
        horizon: 2035,
        carbonPriceUsd: 10,
        tempAnomalyCelsius: 1.68,
        electricityPriceUsdMwh: 79,
        energyDemandIndex: 108,
        sectorEmissionsReductionPct: {
          'Power Generation': 6,
          'Steel': 4,
          'Cement': 2,
          'Automotive': 7,
          'Commercial Real Estate': 4,
          'Agriculture': 2
        },
        gdpImpactPct: -0.2,
        inflationBps: 5,
        acuteHazardIndex: 42,
        chronicHazardIndex: 39
      },
      2040: {
        horizon: 2040,
        carbonPriceUsd: 12,
        tempAnomalyCelsius: 1.90,
        electricityPriceUsdMwh: 81,
        energyDemandIndex: 112,
        sectorEmissionsReductionPct: {
          'Power Generation': 8,
          'Steel': 5,
          'Cement': 3,
          'Automotive': 9,
          'Commercial Real Estate': 5,
          'Agriculture': 3
        },
        gdpImpactPct: -0.5,
        inflationBps: 10,
        acuteHazardIndex: 52,
        chronicHazardIndex: 49
      },
      2045: {
        horizon: 2045,
        carbonPriceUsd: 14,
        tempAnomalyCelsius: 2.15,
        electricityPriceUsdMwh: 83,
        energyDemandIndex: 115,
        sectorEmissionsReductionPct: {
          'Power Generation': 10,
          'Steel': 6,
          'Cement': 4,
          'Automotive': 11,
          'Commercial Real Estate': 7,
          'Agriculture': 3
        },
        gdpImpactPct: -0.9,
        inflationBps: 15,
        acuteHazardIndex: 62,
        chronicHazardIndex: 59
      },
      2050: {
        horizon: 2050,
        carbonPriceUsd: 16,
        tempAnomalyCelsius: 2.40,
        electricityPriceUsdMwh: 85,
        energyDemandIndex: 118,
        sectorEmissionsReductionPct: {
          'Power Generation': 12,
          'Steel': 8,
          'Cement': 5,
          'Automotive': 14,
          'Commercial Real Estate': 8,
          'Agriculture': 4
        },
        gdpImpactPct: -1.4,
        inflationBps: 20,
        acuteHazardIndex: 72,
        chronicHazardIndex: 68
      }
    }
  }
};
