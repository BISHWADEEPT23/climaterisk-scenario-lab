# Physical Climate Risk Methodology
## Quantitative Hazard Modeling, Vulnerability Transmission & Catastrophe Risk
### ClimateRisk Scenario Lab (v0.3.0 — Phase 3)

---

### 1. Product Vision & Risk Transmission Framework

The Physical Risk Engine implements an end-to-end catastrophe modeling chain linking macro-climate scenario pathways to asset-level structural impairment and portfolio credit losses:

$$\text{Climate Scenario} \longrightarrow \text{Hazard Intensity } (I) \longrightarrow \text{Exposure } (E) \longrightarrow \text{Vulnerability } (D_r) \longrightarrow \text{Physical Damage} \longrightarrow \text{EAL} \longrightarrow \text{Financial Transmission} \longrightarrow \text{Credit Risk}$$

---

### 2. Acute vs. Chronic Perils Architecture

To avoid forcing continuous climate trends into catastrophe event curves, the engine maintains distinct analytical treatment for acute and chronic perils:

#### 2.1. Acute Climate Perils (Probabilistic Event Exceedance)
- **River Flooding:** Inundation depth ($h$ in meters) evaluated across 10-year to 500-year events.
- **Coastal Flooding & Storm Surge:** Saline water depth ($h$ in meters) with enhanced structural velocity and corrosion factors.
- **Tropical Cyclone:** 3-second peak wind gust ($V$ in m/s) calibrated to Saffir-Simpson intensity scales.
- **Wildfire:** Radiative heat flux and flame front severity ($0$ to $100$ index) evaluated against building envelope resistance.
- **Extreme Precipitation:** 24-hour rainfall intensity (mm/24h) evaluated against municipal stormwater drainage capacity.

#### 2.2. Chronic Climate Perils (Operational Drag & Impairment)
- **Heat Stress:** Degree-days above $35^\circ\text{C}$ causing labor productivity derating and industrial chiller power spikes.
- **Drought:** Prolonged soil moisture deficit driving agricultural supply chain input cost inflation and crop yield drag.
- **Water Stress:** Basin-level water withdrawal-to-availability ratio ($>40\%$) forcing cooling curtailments and operational downtime.
- **Sea-Level Rise:** Permanent elevation rise (cm) causing land inundation and direct capital write-downs of coastal infrastructure.

---

### 3. Hazard Intensity Downscaling

Scenario climate anomalies are downscaled to asset-level hazard intensities using NGFS temperature-conditioned scaling:

$$I(T, \text{Scenario}, t) = I_{\text{base}}(T) \times M_{\text{hazard}}(\text{Scenario}, t)$$

Where the return period factor relative to the 100-year anchor is modeled via an extreme value (GEV/Gumbel) quantile proxy:

$$\text{Factor}(T) = \max\left(0.40, 1.0 + 0.28 \times \ln\left(\frac{T}{100}\right)\right)$$

Under **High Warming (2050)**:
- Extreme precipitation & flood depths scale by $+50\%$.
- Tropical cyclone peak wind gusts scale by $+20\%$.
- Heat stress degree-days scale by $+65\%$.

---

### 4. Financial Statement Transmission (Zero Double-Count Guarantee)

To preserve accounting integrity, physical losses are strictly categorized across financial statements:

1. **Cash Repair Outflows:**
   $$\text{Cash Repair Expenditure} = \text{Uninsured Retained Acute Physical Damage}$$
2. **Operating Income Contraction (EBITDA):**
   $$\Delta \text{EBITDA} = \text{Business Interruption (BI) Loss} + \text{Chronic Operational Drag}$$
3. **Non-Cash Capital Impairment:**
   $$\text{Asset Impairment Write-Down} = 0.40 \times \text{Uninsured Physical Damage}$$
4. **Free Cash Flow to Firm (FCFF):**
   $$\Delta \text{FCFF} = -\Delta \text{EBITDA} \times (1 - \tau) - \text{Cash Repairs} \times (1 - \tau)$$

---

### 5. Credit Risk Transmission

Physical damage transmits to credit risk parameters through two empirical channels:

1. **Loss Given Default (LGD) Collateral Haircut:**
   $$\text{Collateral Impairment Pct} = \min\left(30\%, \frac{\text{Uninsured Damage}}{\text{Asset Replacement Value}} \times 100\right)$$
   $$\Delta \text{LGD (bps)} = \text{Collateral Impairment Pct} \times 45.0\text{ bps/\%}$$

2. **Probability of Default (PD) Logit Shock:**
   $$\Delta \text{Logit} = \beta_{\text{physical}} \times \left(\frac{\Delta \text{EBITDA}}{\text{Baseline EBITDA}}\right)$$
   Where $\Delta \text{PD}$ is bounded within $[0.01\%, 99.99\%]$.
