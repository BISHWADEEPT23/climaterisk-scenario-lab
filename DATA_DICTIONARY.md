# Data Dictionary & Taxonomy Standards
## ClimateRisk Scenario Lab (v0.3.0 — Phase 3)

### 1. Corporate Borrowers Entity (`Company`)

| Field | Type | Unit | Description | Accounting / Regulatory Reference |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | Code | Unique synthetic ID (`COMP-001` to `COMP-030`) | Internal Portfolio Identifier |
| `name` | String | Text | Corporate name tagged with `[Synthetic]` | IFRS S2 Entity Name |
| `isSynthetic` | Boolean | Flag | Always `true` to ensure zero confusion with real entities | QA Integrity Flag |
| `sector` | Enum | Taxonomy | One of 6 target sectors: Power Generation, Steel, Cement, Automotive, Commercial Real Estate, Agriculture | GICS / NACE Standard |
| `country` | Enum | Geography | One of 5 operational markets: India, United States, Germany, United Kingdom, Japan | ISO Alpha-2 Country Proxy |
| `headquarters` | String | City | Municipal administrative center | Entity Metadata |
| `reportingYear`| Number | Year | Fiscal baseline year (FY2024) | Reporting Baseline |
| `revenueUsdM` | Float | USD Millions | Audited top-line gross revenues | IFRS S2 Par. 29 (WACI Denominator) |
| `ebitdaUsdM` | Float | USD Millions | Operating cash flow baseline before climate shock | IFRS S2 Financial Position |
| `totalDebtUsdM`| Float | USD Millions | Total outstanding funded debt obligations | Balance Sheet Debt Metric |
| `cashUsdM` | Float | USD Millions | Liquid cash and equivalents | EVIC Component |
| `enterpriseValueUsdM` | Float | USD Millions | EVIC (Market Cap + Total Debt + Cash) | PCAF Global Standard Part A |
| `loanExposureUsdM` | Float | USD Millions | Exposure at Default (EAD) drawn in bank portfolio | Basel III / IFRS 7 / IFRS 9 |
| `baselineRating`| String | Grade | Baseline agency credit rating (AAA down to BB) | Standard Credit Rating |
| `baselinePdPct`| Float | % | Annual Probability of Default | Baseline Credit Metric |
| `baselineLgdPct`| Float | % | Loss Given Default | Basel Foundation IRBF |
| `scope1Tco2e` | Float | tCO2e | Direct combustion emissions | GHG Protocol / IFRS S2 Par. 29(a)(i) |
| `scope2Tco2e` | Float | tCO2e | Indirect market-based purchased electricity | GHG Protocol / IFRS S2 Par. 29(a)(ii) |
| `scope3Tco2e` | Float | tCO2e | Optional upstream and downstream value chain | GHG Protocol / IFRS S2 Par. 29(a)(iii) |
| `carbonCoveragePct` | Float | % | Share of emissions subject to statutory carbon pricing | World Bank Carbon Pricing Metric |
| `freeAllowancesPct` | Float | % | Share of covered emissions granted as free credits | EU ETS / CBAM Allocation Schedule |
| `carbonPassThroughPct` | Float | % | Pricing power to pass compliance penalties to customers | OECD Empirical Calibration |
| `energyConsumptionMwh` | Float | MWh | Total annual electrical power and heat draw | GRI 302 Energy Consumption |
| `physicalAssetCount` | Number | Count | Number of physical facilities mapped in asset catalog | Spatial Asset Allocation |
| `totalAssetReplacementValueUsdM` | Float | USD Millions | Total insured rebuild cost across physical assets | Physical Exposure Denominator |
| `dataQuality` | Enum | Category | Observed, Estimated, Synthetic, Missing, Invalid | Data Governance Operational Flag |

---

### 2. Physical Asset Entity (`PhysicalAsset`)

| Field | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Code | Unique asset identifier (`ASSET-001` to `ASSET-100`) |
| `companyId` | String | Code | Foreign key referencing parent `Company.id` |
| `name` | String | Text | Asset facility description with `[Synthetic]` marker |
| `assetType` | String | Text | Operational facility classification (e.g., Kiln, Smelter, Wind Farm) |
| `city` | String | City | Physical municipality location |
| `latitude` | Float | Degrees | Geographic latitude coordinate (-90 to +90) |
| `longitude`| Float | Degrees | Geographic longitude coordinate (-180 to +180) |
| `replacementValueUsdM` | Float | USD Millions | Insured reconstruction valuation |
| `acuteHazards` | Object | Index (0-100) | Flood, Cyclone, Wildfire, Extreme Precipitation |
| `chronicHazards` | Object | Index (0-100) | Heat Stress, Water Stress, Drought, Sea-level Rise |
| `overallPhysicalScore` | Number | Index (0-100) | Weighted composite hazard exposure index |
| `riskTier` | Enum | Rating | Critical (>=75), High (55-74), Medium (35-54), Low (<35) |

---

### 3. Phase 3 Physical Loss & EAL Fields (`ExpectedAnnualLossResult`)

| Field | Type | Unit | Description | Modeling Reference |
| :--- | :--- | :--- | :--- | :--- |
| `grossEalUsdM` | Float | USD Millions | Numerical integration of gross damage exceedance curve | Catastrophe EAL ($\int L(p)dp$) |
| `netInsuredEalUsdM` | Float | USD Millions | Expected annual indemnification under policy deductible/limit | Insured Catastrophe Layer |
| `uninsuredEalUsdM` | Float | USD Millions | Expected annual uninsured retention (Cash repair outflow) | Balance Sheet Retention |
| `businessInterruptionEalUsdM`| Float | USD Millions | Annualized operating profit loss from downtime days | Business Interruption |
| `chronicLossUsdM` | Float | USD Millions | Annual operating drag from heat, drought, water, SLR | Chronic Climate Drag |
| `totalExpectedAnnualLossUsdM`| Float | USD Millions | Total expected annual loss ($U + \text{BI} + \text{Chronic}$) | Comprehensive Physical EAL |
| `lossRatePct` | Float | % | Total EAL divided by Asset Replacement Value | Physical Loss Rate |
| `floodExceedanceCurve` | Array | Points | Quantile damage points for 10, 25, 50, 100, 250, 500-yr events | AEP Exceedance Curve |
| `cycloneExceedanceCurve` | Array | Points | Quantile wind damage points for 10 to 500-yr events | AEP Exceedance Curve |

---

### 4. Phase 3 Adaptation Analytics Fields (`AdaptationMeasure`)

| Field | Type | Unit | Description | Economic Reference |
| :--- | :--- | :--- | :--- | :--- |
| `measureId` | String | Code | Unique adaptation identifier (e.g., `ADAPT-FLOOD-01`) | Resilience Measure ID |
| `name` | String | Text | Descriptive name of engineered adaptation measure | Engineered Solution |
| `targetHazard` | Enum | Peril | Specific hazard targeted by adaptation defense | Target Peril |
| `capitalCostUsdM` | Float | USD Millions | Initial capital deployment required for construction | Initial CapEx Outflow |
| `annualMaintenanceCostUsdM` | Float | USD Millions | Ongoing operational maintenance expenditure | Annual OpEx Outflow |
| `usefulLifeYears` | Number | Years | Economic depreciable useful life of the asset | Asset Tenor |
| `damageReductionPct` | Float | % | Percentage reduction in residual damage within design bounds | Resilience Effectiveness |
| `avoidedLossAnnualUsdM` | Float | USD Millions | Annual avoided physical and BI losses ($\text{Base EAL} \times \text{Reduction}$) | Annual Cash Savings |
| `adaptedEalUsdM` | Float | USD Millions | Residual expected annual loss remaining after adaptation | Residual Physical Risk |
| `netPresentBenefitUsdM` | Float | USD Millions | Net Present Value of avoided losses minus CapEx & OpEx at 6% | Net Present Benefit (NPB) |
| `benefitCostRatio` | Float | Ratio | PV of Gross Avoided Loss divided by PV of Costs | Benefit-Cost Ratio (BCR) |
| `paybackYears` | Float | Years | Simple undiscounted investment payback period | Payback Period |

---

### 5. Phase 2 Financial & Credit Stress Fields

| Field | Type | Unit | Description | Regulatory Reference |
| :--- | :--- | :--- | :--- | :--- |
| `fcff` | Float | USD Millions | Free Cash Flow to Firm: EBIT*(1-t) + D&A - CapEx - DeltaNWC | Valuation Metric |
| `dscr` | Float | Ratio | Debt Service Coverage Ratio: (EBITDA - Taxes) / Debt Service | Credit Covenant |
| `stressedPd` | Float | Ratio | Scenario-adjusted PD via logit-shift model [0.01%, 99.99%] | Climate Stress PD |
| `stressedLgd` | Float | Ratio | Stressed LGD incorporating physical hazard collateral haircuts | Stressed LGD [5%, 100%] |
| `ead` | Float | USD Millions | Total Exposure at Default: $\text{Drawn} + \text{CCF} \times \text{Undrawn}$ | Basel EAD |
| `expectedLoss` | Float | USD Millions | Single-period Expected Loss: $\text{PD} \times \text{LGD} \times \text{EAD}$ | Illustrative Loss |
| `ifrs9Stage` | Enum | Classification | Stage 1 (Performing), Stage 2 (SICR), Stage 3 (Default) | IFRS 9 Financial Instruments |
| `cet1RatioStressed` | Float | % | Post-stress Common Equity Tier 1 capital ratio | Basel III Capital Adequacy |
| `reverseStressCarbonPrice` | Float | $/tCO2e | Critical carbon price solved via bisection to breach threshold | Reverse Stress Metric |
