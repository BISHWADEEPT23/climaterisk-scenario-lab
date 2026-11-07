# ClimateRisk Scenario Lab
### Climate Financial Risk Intelligence & Scenario Analytics Platform (Version v0.3.0 — Phase 3)

> **Important Analytical & Academic Disclaimer:**  
> ClimateRisk Scenario Lab is an independent technical portfolio project developed to demonstrate professional competencies in climate financial risk quantitative analysis, catastrophe risk modeling, sustainable finance, ESG risk data architecture, and full-stack financial engineering.  
> It is **not** an official Moody's Analytics product, regulatory-approved stress-testing system, or commercially validated catastrophe model. All corporate profiles, asset locations, and scenario pathways are deterministic synthetic proxies.
> All capital impacts and credit adjustments are explicitly labeled: *"Illustrative Capital Adequacy Sensitivity — Not a Regulatory Stress Test"*.

---

## 1. Executive Overview

ClimateRisk Scenario Lab is an integrated quantitative analytics platform that simulates the financial transmission of climate transition risks and physical perils on commercial credit portfolios.

### Core Analytical Principle
$$\text{Climate Scenario} \longrightarrow \text{Hazard Intensity } (I) \longrightarrow \text{Exposure } (E) \longrightarrow \text{Vulnerability } (D_r) \longrightarrow \text{Physical Damage} \longrightarrow \text{EAL} \longrightarrow \text{Financial Transmission} \longrightarrow \text{Credit Metric} \longrightarrow \text{Decision Support}$$

Every calculated result in the platform has a traceable numerical methodology with inspectable formulas, parameter inputs, and calculation audit logs.

---

## 2. Platform Architecture (Phase 1, Phase 2 & Phase 3 Modules)

1. **Executive Dashboard (`/dashboard`)**: Traceable KPI cards for Portfolio Exposure, PCAF Financed Emissions, WACI, High Transition Risk, High Physical Risk, Modelled EBITDA Shock, Scenario Carbon Price, and Data Integrity Score. Includes interactive formula audit modals, sector exposure charts, carbon price pathways, waterfall charts, and risk concentration matrices.
2. **Scenario Explorer (`/scenario`)**: Interactive exploration of 4 NGFS-aligned pathways (Orderly, Disorderly, High Warming, Baseline) across 6 time horizons (2025 to 2050), dynamic interpolation between anchor years, and one-click CSV export.
3. **Corporate Exposure Analysis (`/corporate`)**: 30 fictional corporate entities across 6 sectors and 5 benchmark countries with deep-dive financial drawers, balance sheets, emissions profiles, and scenario-conditioned stress traces.
4. **Transition Risk Engine (`/transition`)**: Live sensitivity calculator implementing gross compliance costs, free allowance deductions, customer pass-through rates ($\alpha$), wholesale energy tariff shifts, and Merton credit transmission elasticity.
5. **Module 5 — Physical Risk & Geospatial EAL Engine (`/physical`)**: Full quantitative physical catastrophe loss engine:
   - **Interactive Geospatial Asset Map:** High-performance vector cartography rendering 100 industrial facilities, regional clustering, peril heat surface overlays, country zooms (USA, UK, Germany, India, Japan), and asset detail inspection drawer.
   - **Analytical Vulnerability Functions:** Documented depth-damage, wind-velocity, and thermal stress response curves bounded strictly in $[0.0, 1.0]$.
   - **Probabilistic Expected Annual Loss (EAL):** Trapezoidal numerical integration over return-period exceedance curves ($10\text{yr}$ to $500\text{yr}$) plus chronic operational drag.
   - **Insurance Layering & Deductible/Limits:** Partitions gross damage into net insured recoveries and uninsured retained losses with zero leakage.
   - **Business Interruption (BI):** Models facility downtime days, operating profit run rate, and waiting period deductibles.
   - **Adaptation & Cost-Benefit Lab:** 7 engineered adaptation measures with discounted cash flow Net Present Benefit (NPB), Benefit-Cost Ratio (BCR), and Payback Period.
   - **Corporate Financial & Credit Transmission:** Translates physical loss into cash repair CapEx, EBITDA drag, LGD collateral haircuts, and PD logit shifts.
6. **Module 6 — Financial Impact Engine (`/financial`)**: Multi-year dynamic financial projections (2024–2050) modeling climate revenue elasticity, absorbed carbon costs, energy tariff adjustments, EBITDA margins, Free Cash Flow to Firm (FCFF), CapEx decarbonization investment schedules, and Debt Service Coverage Ratio (DSCR) covenant thresholds.
7. **Module 7 — Portfolio Stress Testing (`/stress`)**: Comprehensive credit portfolio stress testing engine implementing Logit-Shift Probability of Default (PD), physical collateral LGD haircuts, Basel III Credit Conversion Factors (CCF) for EAD, single-period Expected Loss (EL), IFRS 9 SICR staging (Stage 1/2/3), illustrative CET1 capital adequacy sensitivity, and a deterministic bisection reverse stress solver for carbon price thresholds.
8. **Module 8 — Advanced Scenario Comparison (`/comparison`)**: Quadrilateral scenario cross-comparison matrix, exact cent-reconciled financial waterfall bridges (zero numerical leakage), and sequential risk driver attributions.
9. **Data Quality & Governance (`/quality`)**: Automated validation engine running deterministic checks (non-negative emissions, coordinates, balance sheet consistency, unique IDs), model assumptions register, and data dictionary.
10. **Reports & Disclosure Mapping (`/reports`)**: Printable institutional HTML report engine with full IFRS S2 / TCFD paragraph-by-paragraph mapping.
11. **Settings & Calibration (`/settings`)**: Configurable parameters, price base year benchmark (2024 USD), and compliance scopes.
12. **Numerical QA Test Suite (`/tests`)**: 58 deterministic numerical tests executing in console and browser (100% pass rate).

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React icons, Recharts
- **State & Data Layer:** Local-first immutable synthetic fixtures (30 companies, 100 assets, 4 NGFS scenarios)
- **Calculation Engines:**
  - `src/engine/vulnerabilityFunctions.ts` — 9 analytical vulnerability curves & insurance partitioning
  - `src/engine/probabilisticEalEngine.ts` — Probabilistic exceedance curve numerical trapezoidal integration
  - `src/engine/adaptationEngine.ts` — DCF net present benefit (NPB), BCR & avoided loss modeling
  - `src/engine/geospatialEngine.ts` — Haversine distance, bounding box, regional clustering & GeoJSON export
  - `src/engine/physicalFinancialIntegration.ts` — Corporate statement transmission & credit LGD/PD shifts
  - `src/engine/financialProjection.ts` — Multi-year financial statement projections & DCF metrics
  - `src/engine/creditRiskEngine.ts` — Logit-shift credit risk, LGD haircuts, and IFRS 9 staging
  - `src/engine/portfolioStressEngine.ts` — Portfolio aggregations, CET1 sensitivity, and bisection root solver
  - `src/engine/scenarioComparisonEngine.ts` — Factor attribution and reconciled waterfall generation
  - `src/engine/transitionRisk.ts` — Transition compliance & energy tariff calculations
  - `src/engine/portfolioMetrics.ts` — PCAF financed emissions & WACI aggregations
- **Numerical Testing:** Deterministic test runner with 58 exact floating-point assertions

---

## 4. Key Calculation Methodologies

### 4.1. Probabilistic Expected Annual Loss (EAL)
$$\text{EAL} = \int_0^1 L(p) \, dp \approx \sum_{k=1}^{n-1} \left[ \frac{L(p_k) + L(p_{k+1})}{2} \right] \times (p_k - p_{k+1}) + p_n \times L(p_n)$$

### 4.2. Analytical Vulnerability Functions
$$\text{Damage Ratio } (D_r) = \min\left(1.0, \max\left(0.0, V(I, \mathbf{\theta})\right)\right)$$
$$\text{Physical Damage} = \text{Asset Replacement Value} \times D_r$$

### 4.3. Insurance Layering
$$\text{Insured Payout} = \min\left(\text{Policy Limit}, \max(0, \text{Gross Damage} - \text{Deductible})\right)$$
$$\text{Uninsured Retained Loss} = \text{Gross Damage} - \text{Insured Payout}$$

### 4.4. Adaptation Net Present Benefit (NPB)
$$\text{NPB} = \left[ \text{Avoided Annual Loss} - \text{Annual Maintenance} \right] \times \left[ \frac{1 - (1 + r)^{-n}}{r} \right] - \text{CapEx}$$

### 4.5. Multi-Year Financial Projections & Credit Transmission
$$\text{Projected Revenue}(t) = \text{Revenue}(t-1) \times [1 + g_{\text{base}}(t) + \Delta \text{Rev}_{\text{climate}}(t)]$$
$$\text{EBITDA}(t) = \text{Projected Revenue}(t) - \text{Adjusted OpEx}(t)$$
$$\Delta \text{LGD (bps)} = \left(\frac{\text{Uninsured Damage}}{\text{Asset Replacement Value}} \times 100\right) \times 45.0\text{ bps/\%}$$
$$\Delta \text{Logit}(\text{PD}) = \beta \times \left(\frac{\Delta \text{EBITDA}}{\text{Baseline EBITDA}}\right)$$

---

## 5. Numerical Test Suite (58 Tests)

The platform contains 58 deterministic numerical tests verified against exact analytical fixtures:
- Tests 1–12: Phase 1 Baseline Regressions (Carbon cost, PCAF WACI, Lerp, Unit conversions)
- Tests 13–16: Multi-Year Revenue Growth, Demand Contraction, EBITDA Accounting & Margin Bounds
- Tests 17–19: Free Cash Flow to Firm (FCFF), Decarbonization CapEx & Straight-Line D&A
- Tests 20–21: Energy Tariff Uplift Absorption & Multi-Engine Transition Cost Reconciliation
- Tests 22–24: PD Logit Invertibility, PD Strict Bounds $[0.01\%, 99.99\%]$, LGD Bounds $[5\%, 100\%]$
- Tests 25–28: EAD with CCF, Single-Period Expected Loss, Zero-Exposure Floor & Portfolio Aggregation
- Tests 29–31: Scenario Stress Monotonicity, Financial Waterfall Cent Reconciliation, CET1 Ratio
- Tests 32–33: Reverse Stress Bisection Solver Convergence & Unreachable Target Boundary Safety
- Tests 34–35: Negative EBITDA Tax Shield Floor & Deterministic Numerical Reproducibility
- Test 36: Hazard Intensity Validation ($1.60\text{m}$ at 100-yr RP)
- Test 37: Vulnerability Function Bounds ($D_r \in [0.0, 1.0]$)
- Test 38: Zero Hazard Intensity Boundary ($D_r(0) = 0.0$)
- Test 39: Maximum Damage Ratio Saturation ($D_r = 1.0$)
- Test 40: Asset Replacement Value Multiplication ($\$50\text{M} \times 0.30 = \$15.00\text{M}$)
- Test 41: Discrete Event EAL Formulation ($\sum P_i \times L_i = \$0.55\text{M}$)
- Test 42: Exceedance Probability Integration (Trapezoidal $\text{EAL} = \$4.15\text{M}$)
- Test 43: Return-Period Interpretation ($100\text{yr} = 0.01\text{ AEP}$)
- Test 44: Insurance Deductible Partitioning ($\text{Claimable} = \text{Gross} - \text{Deductible}$)
- Test 45: Insurance Policy Limit Cap ($\text{Payout} = \min(\text{Limit}, \text{Claimable})$)
- Test 46: Uninsured Loss Complementarity ($\text{Gross} = \text{Insured} + \text{Uninsured}$)
- Test 47: Business Interruption Run Rate ($\$0.10\text{M/day} \times 30 = \$3.00\text{M}$)
- Test 48: Geographic Haversine Distance (London to Paris $\sim 343.6\text{ km}$)
- Test 49: Bounding Box Calculation (Tight geometric envelope)
- Test 50: Company-Level Physical Loss Aggregation (Multi-asset roll-up)
- Test 51: Portfolio Physical Loss Linear Aggregation ($\sum \text{EAL}_i = \text{Total}$)
- Test 52: Adaptation Loss Reduction Ratio ($75\%$ reduction yields $\$2.50\text{M}$ adapted EAL)
- Test 53: Adaptation Net Present Benefit ($\text{NPB} > 0$, $\text{BCR} > 1.0$)
- Test 54: Financial Impact Reconciliation (Zero double-count)
- Test 55: Credit Risk Transmission LGD Haircut ($10\% \to +450.0\text{ bps}$)
- Test 56: Physical Scenario Monotonicity (High Warming $1.65 >$ Baseline $1.25$)
- Test 57: Missing Hazard Fallback & Coordinate Sanity (100% valid Earth coordinates)
- Test 58: Multi-Run Physical EAL Reproducibility (Deterministic floating-point parity)

---

## 6. How to Run

```bash
# Run deterministic numerical test suite in terminal:
npm test

# Build production bundle:
npm run build

# Start local development server:
npm run dev
```
