# Financial Model Methodology
## Multi-Year Statement Projections & DCF Transmission
### ClimateRisk Scenario Lab (v0.2.0)

---

### 1. Model Scope & Horizon
The Financial Impact Engine projects corporate financial statements annually from **2024 (historical baseline)** through **2050** under scenario-conditioned climate variables.

Projections differentiate between:
- **Historical Baseline (FY2024):** Audited synthetic baseline financials ($t_0$).
- **Scenario Horizon ($t \in [2025, 2050]$):** Dynamic macroeconomic and climate policy pathways.

---

### 2. Revenue Modeling & Demand Elasticity

$$\text{Projected Revenue}(t) = \text{Revenue}(t-1) \times \left[ 1 + g_{\text{baseline}}(t) + \Delta \text{Rev}_{\text{climate}}(t) \right]$$

Where:
- $g_{\text{baseline}}(t)$: Organic baseline GDP growth rate (default: $2.5\%$ p.a.).
- $\Delta \text{Rev}_{\text{climate}}(t)$: Composite climate revenue shock, defined as:
  $$\Delta \text{Rev}_{\text{climate}}(t) = - \epsilon_{\text{carbon}} \times \frac{\max(0, P_{\text{carbon}}(t) - 50)}{100} - \epsilon_{\text{warming}} \times \max(0, \Delta T(t) - 1.5)$$
- $\epsilon_{\text{carbon}}$: Sector demand elasticity to carbon policy (e.g., $0.05$ for Power/Steel, $0.02$ for Commercial Real Estate).
- $\epsilon_{\text{warming}}$: Sector chronic warming impact elasticity (e.g., $0.08$ for Agriculture, $0.01$ for Automotive).

---

### 3. Operating Expense & EBITDA Transmission

Operating expenses consist of baseline counterfactual costs augmented by absorbed transition penalties:

$$\text{Adjusted OpEx}(t) = \text{Baseline OpEx}(t) + \text{Absorbed Carbon Cost}(t) + \text{Absorbed Energy Tariff Delta}(t)$$

$$\text{Baseline OpEx}(t) = \text{Projected Revenue}(t) \times \left( \frac{\text{Baseline OpEx}_{2024}}{\text{Baseline Revenue}_{2024}} \right)$$

#### 3.1. Absorbed Carbon Compliance Cost
$$\text{Gross Carbon Cost}(t) = \text{Covered Emissions}(t) \times P_{\text{carbon}}(t)$$
$$\text{Net Incremental Cost}(t) = \max(0, \text{Gross Cost}(t) - \text{Free Allowances}(t))$$
$$\text{Absorbed Carbon Cost}(t) = \text{Net Incremental Cost}(t) \times (1 - \alpha)$$
Where $\alpha \in [0, 1]$ represents the corporate customer pass-through rate.

#### 3.2. Absorbed Electricity Price Shift
$$\text{Absorbed Energy Delta}(t) = \text{Electricity Draw (MWh)} \times \max(0, P_{\text{elec}}(t) - P_{\text{base}}) \times (1 - 0.5 \times \alpha)$$
This accounts for wholesale fuel cost shifts while dampening double-counting of embedded carbon taxes.

#### 3.3. EBITDA & Margin Calculation
$$\text{EBITDA}(t) = \text{Projected Revenue}(t) - \text{Adjusted OpEx}(t)$$
$$\text{EBITDA Margin}(t) = \begin{cases} \frac{\text{EBITDA}(t)}{\text{Projected Revenue}(t)} & \text{if } \text{Projected Revenue}(t) > 0 \\ 0\% & \text{otherwise} \end{cases}$$

---

### 4. Capital Expenditure & Depreciation Schedules

Total capital expenditure combines ongoing operational maintenance with planned decarbonization investments:

$$\text{Total CapEx}(t) = \text{Baseline CapEx}(t) + \text{Green CapEx}(t)$$
$$\text{Baseline CapEx}(t) = 0.05 \times \text{Projected Revenue}(t)$$

Decarbonization schedules profile multi-year capital deployment:
- Phase 1 (2025–2030): Initial equipment retrofit and electrification.
- Phase 2 (2031–2040): Deep decarbonization (CCUS, hydrogen, renewables).
- Phase 3 (2041–2050): Residual abatement and efficiency.

#### 4.1. Straight-Line Depreciation Schedule
$$\text{D\&A}(t) = \text{Baseline D\&A}_{2024} + \sum_{k=2025}^t \frac{\text{Green CapEx}(k)}{U_L}$$
Where $U_L$ is the useful asset life (standard: 15 years).

---

### 5. Operating Profit (EBIT) & Corporate Taxes

$$\text{EBIT}(t) = \text{EBITDA}(t) - \text{D\&A}(t)$$
$$\text{Tax Expense}(t) = \max(0, \text{EBIT}(t) \times \tau)$$
Where $\tau$ is the effective statutory corporate tax rate (default: $25\%$). If $\text{EBIT}(t) \le 0$, corporate tax is floored at zero (loss before carry-forward).

---

### 6. Free Cash Flow to Firm (FCFF)

$$\text{FCFF}(t) = \text{EBIT}(t) \times (1 - \tau) + \text{D\&A}(t) - \text{Total CapEx}(t) - \Delta \text{NWC}(t)$$

Where working capital change is conditioned on top-line growth:
$$\Delta \text{NWC}(t) = 0.05 \times (\text{Revenue}(t) - \text{Revenue}(t-1))$$

---

### 7. Debt Service Coverage Ratio (DSCR) & Financial Covenants

$$\text{Total Debt Service}(t) = \text{Interest Expense}(t) + \text{Principal Repayment}(t)$$
$$\text{Interest Expense}(t) = \text{Total Debt}(t) \times r_{\text{borrowing}}$$
$$\text{Principal Repayment}(t) = \frac{\text{Total Debt}(t)}{\text{Debt Tenor (Years)}}$$
$$\text{DSCR}(t) = \frac{\max(0, \text{EBITDA}(t) - \text{Tax Expense}(t))}{\max(1.0, \text{Total Debt Service}(t))}$$

**Covenant Breach Rule:**
If $\text{DSCR}(t) < 1.20\text{x}$, a financial covenant violation is flagged, indicating elevated default vulnerability under credit stress.
