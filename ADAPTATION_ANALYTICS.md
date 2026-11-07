# Adaptation Analytics & Cost-Benefit Lab
## Engineered Climate Resilience Investments & Net Present Benefit (NPB)
### ClimateRisk Scenario Lab (v0.3.0 — Phase 3)

---

### 1. Adaptation Modeling Framework

Adaptation modeling quantifies the financial return of physical resilience investments by comparing **Baseline Expected Annual Loss** with **Adapted Residual Loss**:

$$\text{Avoided Annual Loss} = \text{Baseline EAL} \times \text{Damage Reduction Pct}$$
$$\text{Adapted Residual Loss} = \max\left(0, \text{Baseline EAL} - \text{Avoided Annual Loss}\right)$$

---

### 2. Standard Adaptation Catalog

| Measure ID | Measure Name | Target Peril | Unit CapEx ($/asset) | Annual OpEx | Useful Life | Damage Reduction |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `ADAPT-FLOOD-01` | Perimeter Flood Wall & Barriers | River Flooding | $\$1.85\text{M}$ | $2.5\%$ | 25 Years | $75.0\%$ |
| `ADAPT-COASTAL-01`| Armored Revetment & Surge Gates | Coastal Flooding | $\$3.20\text{M}$ | $3.0\%$ | 30 Years | $80.0\%$ |
| `ADAPT-WIND-01` | Structural Wind Retrofit & Cladding| Tropical Cyclone | $\$1.40\text{M}$ | $2.0\%$ | 20 Years | $65.0\%$ |
| `ADAPT-PRECIP-01`| SuDS Drainage & Retention Sumps | Extreme Precip. | $\$0.95\text{M}$ | $3.5\%$ | 20 Years | $70.0\%$ |
| `ADAPT-WILDFIRE-01`| Defensible Buffer & Roof Sprinklers| Wildfire | $\$0.75\text{M}$ | $4.0\%$ | 15 Years | $65.0\%$ |
| `ADAPT-HEAT-01` | Industrial Chillers & Cool Roofs | Heat Stress | $\$0.85\text{M}$ | $4.5\%$ | 15 Years | $60.0\%$ |
| `ADAPT-WATER-01` | Closed-Loop Effluent Recycling | Water Stress | $\$2.10\text{M}$ | $3.0\%$ | 20 Years | $70.0\%$ |

---

### 3. Financial Discounting & Net Present Benefit (NPB)

$$\text{Net Annual Cash Savings} = \text{Avoided Annual Loss} - \text{Annual Maintenance OpEx}$$
$$\text{PV Annuity Factor } (\text{PVAF}) = \frac{1 - (1 + r)^{-n}}{r}$$

Where $r$ is the corporate hurdle / discount rate ($6.0\%$ standard) and $n$ is the useful asset life.

$$\text{Present Value of Savings } (\text{PV}_{\text{savings}}) = \text{Net Annual Cash Savings} \times \text{PVAF}$$
$$\text{Net Present Benefit } (\text{NPB}) = \text{PV}_{\text{savings}} - \text{Initial CapEx}$$

$$\text{Benefit-Cost Ratio } (\text{BCR}) = \frac{\text{PV of Gross Avoided Loss}}{\text{CapEx} + \text{PV of Maintenance OpEx}}$$
$$\text{Simple Payback Period } (\text{Years}) = \frac{\text{Initial CapEx}}{\text{Net Annual Cash Savings}}$$

---

### 4. Residual Physical Risk Principle

Resilience investments substantially dampen acute losses but **cannot eliminate risk entirely**. Extreme hazard events that breach engineered design thresholds (e.g., storms generating floods exceeding a $2.5\text{m}$ barrier) generate residual losses that must be absorbed through corporate liquidity buffers or catastrophe reinsurance.
