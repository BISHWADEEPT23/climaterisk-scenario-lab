# System Architecture Document
## ClimateRisk Scenario Lab — Phase 3 Architecture (v0.3.0)

### 1. Architectural Philosophy
ClimateRisk Scenario Lab follows a modular, auditable, and mathematically deterministic architecture. The platform decouples analytical data contracts from presentation layers, enforcing strict accounting balance-sheet constraints, physical hazard laws, catastrophe vulnerability bounds, and credit risk mechanics before state propagation.

```
+-----------------------------------------------------------------------------------------------------------------+
|                                            CLIMATE RISK SCENARIO LAB                                            |
+-----------------------------------------------------------------------------------------------------------------+
                                                         |
         +-----------------------------------------------+-----------------------------------------------+
         |                                               |                                               |
         v                                               v                                               v
+------------------+                           +-------------------+                           +-------------------+
|  SCENARIO ENGINE |                           |  DATA LAYER & QA  |                           | TRANSITION ENGINE |
|  4 NGFS Pathways |                           | 30 Companies      |                           | Carbon Cost       |
|  6 Time Horizons |                           | 100 Geo Assets    |                           | Pass-Through      |
|  Linear Lerp     |                           | Deterministic Val |                           | Energy Shock      |
+------------------+                           +-------------------+                           +-------------------+
         |                                               |                                               |
         +-----------------------------------------------+-----------------------------------------------+
                                                         |
         +-----------------------------------------------+-----------------------------------------------+
         |                                               |                                               |
         v                                               v                                               v
+-----------------------+                      +-----------------------+                       +-----------------------+
|   MODULE 5: PHYSICAL  |                      |   MODULE 6: FINANCIAL |                       |  MODULE 7: PORTFOLIO  |
|    RISK & EAL ENGINE  |                      |     IMPACT ENGINE     |                       |     STRESS TESTING    |
| - 9 Peril Models      |                      | - Revenue Elasticity  |                       | - Logit-Shift PD      |
| - Vulnerability Dr    |                      | - OpEx & EBITDA Trans |                       | - Physical LGD Haircut|
| - Probabilistic EAL   |                      | - FCFF / CapEx / D&A  |                       | - EAD with CCF        |
| - Insurance Layers    |                      | - DSCR Debt Covenants |                       | - IFRS 9 Staging      |
| - Business Interrupt. |                      | - Projections to 2050 |                       | - CET1 Sensitivity    |
| - Vector GIS Map      |                      | - Calculation Audit   |                       | - Bisection Solver    |
| - Adaptation NPB/BCR  |                      +-----------------------+                       +-----------------------+
+-----------------------+                                                                                |
         |                                                                                               |
         +-----------------------------------------------+-----------------------------------------------+
                                                         |
                                                         v
                                       +-----------------------------------+
                                       |   MODULE 8: SCENARIO COMPARISON   |
                                       | - Reconciled Waterfall Bridge     |
                                       | - Factor Driver Attribution       |
                                       | - Multi-Scenario Cross Grid       |
                                       | - Zero-Leakage Verification       |
                                       +-----------------------------------+
                                                         |
                                                         v
                                       +-----------------------------------+
                                       |     PRESENTATION & REPORTING      |
                                       | - Executive Dashboard & Drilldown |
                                       | - Scenario Explorer & Comparison  |
                                       | - Interactive Vector GIS Map      |
                                       | - Vulnerability Simulator         |
                                       | - Adaptation Cost-Benefit Lab     |
                                       | - IFRS S2 / TCFD Export Engine    |
                                       | - 58-Test QA In-App & CLI Runner  |
                                       +-----------------------------------+
```

---

### 2. Core Service Contracts

#### 2.1 Physical Vulnerability Service (`src/engine/vulnerabilityFunctions.ts`)
- `calculateDamageRatio(hazardType, intensity, assetTypeModifier, adaptationThresholdBonus)`: Evaluates analytical depth-damage and wind functions, strictly bounded in $[0.0, 1.0]$.
- `calculateAssetPhysicalDamage(asset, hazardType, intensity, deductiblePct, policyLimitPct, adaptationBonusThreshold)`: Computes Gross Damage, Insured Damage, Uninsured Retention, and Deductible allocation.
- `calculateBusinessInterruption(asset, damageRatio, companyRevenue, marginPct, totalAssets)`: Computes downtime days, daily margin run rate, gross BI, and insured BI.

#### 2.2 Probabilistic EAL Service (`src/engine/probabilisticEalEngine.ts`)
- `estimateHazardIntensity(hazardType, baselineScore, returnPeriod, scenarioMultiplier)`: Evaluates quantile scaling across return periods $T \in [10, 25, 50, 100, 250, 500]$ years.
- `integrateExceedanceCurve(points)`: Evaluates trapezoidal numerical integration of conditional losses over annual exceedance probabilities.
- `calculateAssetEal(asset, company, scenarioId, horizon, config)`: Generates complete asset-level probabilistic EAL, exceedance curves, insurance allocations, and chronic losses.
- `calculatePortfolioPhysicalLosses(assets, companies, scenarioId, horizon)`: Linear portfolio loss aggregation across all 100 facilities.

#### 2.3 Adaptation Service (`src/engine/adaptationEngine.ts`)
- `calculateAdaptationEconomics(baselineEal, measure, assetCount, discountRate)`: Evaluates avoided loss, capital cost, discounted cash flow Net Present Benefit (NPB), Benefit-Cost Ratio (BCR), and Payback Period.
- `evaluatePortfolioAdaptation(portfolioAssetEals, selectedMeasureIds, discountRate)`: Aggregates portfolio-wide adaptation program economics.

#### 2.4 Geospatial Service (`src/engine/geospatialEngine.ts`)
- `calculateHaversineDistanceKm(lat1, lon1, lat2, lon2)`: Great-circle spherical distance.
- `calculateBoundingBox(assets)`: Tight spatial envelope computation.
- `clusterAssetsByRegion(assets, assetEals)`: Regional clustering across 12 industrial belts.
- `generateAssetsGeoJson(assets, assetEals)`: RFC 7946 compliant GeoJSON FeatureCollection generator.

#### 2.5 Physical Financial Integration Service (`src/engine/physicalFinancialIntegration.ts`)
- `calculateCompanyPhysicalImpact(company, companyAssets, scenarioId, horizon, taxRate)`: Bridges physical damage and BI into corporate cash repairs, EBITDA drag, FCFF delta, LGD collateral haircuts, and PD logit shifts.

---

### 3. Separation of Concerns & Determinism
- **Immutability:** All engine calculations operate as pure functions without modifying input scenario or asset objects.
- **Traceability:** Every calculated metric is paired with an audit record documenting the active scenario, formula applied, inputs, and intermediate terms.
- **Synthetic Flagging:** All data models enforce `isSynthetic: true` to prevent confusion with real property inspection records or commercially certified cat models.
