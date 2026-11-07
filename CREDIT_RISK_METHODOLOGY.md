# Credit Risk Methodology
## Climate-Conditioned Credit Transmission & Staging Engine
### ClimateRisk Scenario Lab (v0.2.0)

> **Regulatory Framing Disclaimer:**  
> The credit risk transmission and capital calculations in this platform are illustrative sensitivity models designed for exploratory portfolio risk analysis. They do **not** constitute an approved Internal Ratings-Based (IRB) model, Comprehensive Capital Analysis and Review (CCAR), or regulatory supervisory stress test.

---

### 1. Probability of Default (PD) — Logit-Shift Formulation

To prevent probability estimates from violating natural bounds ($[0, 1]$) under extreme scenario stress, the platform models default probabilities in log-odds space using a logit-shift transformation.

#### 1.1. Logit Transformation
$$\text{logit}(p) = \ln\left( \frac{p}{1 - p} \right)$$
$$\text{invLogit}(z) = \frac{1}{1 + e^{-z}}$$

#### 1.2. Climate Transmission Shock
$$\text{EBITDA Compression} = \frac{\text{Baseline EBITDA} - \text{Stressed EBITDA}}{\text{Baseline EBITDA}}$$
$$\Delta \text{Logit} = \beta_{\text{transition}} \times \max(0, \text{EBITDA Compression}) + \beta_{\text{physical}} \times \left( \frac{\text{Physical Hazard Score}}{100} \right)$$
$$\text{logit}(\text{PD}_{\text{stressed}}) = \text{logit}(\text{PD}_{\text{baseline}}) + \Delta \text{Logit}$$
$$\text{PD}_{\text{stressed}} = \min(0.9999, \max(0.0001, \text{invLogit}(\text{logit}(\text{PD}_{\text{stressed}}))))$$

- **Default Sensitivity ($\beta_{\text{transition}}$):** Typically calibrated to $1.5$–$2.5$ based on sector empirical default elasticity.
- **Physical Sensitivity ($\beta_{\text{physical}}$):** Calibrated to $0.5$–$1.0$ reflecting structural impairment.
- **Strict Invertibility:** The model satisfies $\text{invLogit}(\text{logit}(p)) \equiv p$ across all valid numeric domains.

---

### 2. Loss Given Default (LGD) — Collateral Impairment

Under severe physical hazard exposure (e.g., severe flood, coastal surge, or persistent water stress), the liquidation value of physical collateral (land, industrial plant, machinery) is impaired, driving an upward shift in LGD:

$$\text{LGD}_{\text{stressed}} = \min\left(1.00, \max\left(0.05, \text{LGD}_{\text{baseline}} + \Delta \text{LGD}_{\text{haircut}}\right)\right)$$

Where:
$$\Delta \text{LGD}_{\text{haircut}} = \min\left(0.30, \frac{\text{Physical Score}}{100} \times \phi_{\text{collateral}}\right)$$
- $\phi_{\text{collateral}}$: Collateral vulnerability factor (e.g., $0.20$ for heavy industrial facilities).
- Bounds: Enforces an economic floor of $5.0\%$ and a ceiling of $100.0\%$.

---

### 3. Exposure at Default (EAD) & Credit Conversion Factor (CCF)

Exposure at Default incorporates both current drawn bank exposure and off-balance-sheet commitments:

$$\text{EAD} = \text{Drawn Balance} + \text{CCF} \times \text{Undrawn Commitment}$$

- $\text{CCF}$: Credit Conversion Factor conforming to Basel III standards:
  - Corporate revolving credit facilities: $50\%$
  - Committed lines under 1 year: $20\%$
  - Unconditionally cancellable commitments: $0\%$
  - Default platform benchmark: $50\%$

---

### 4. Single-Period Expected Credit Loss (EL)

For single-horizon scenario stress testing, Expected Credit Loss is computed as:

$$\text{Expected Loss (EL)} = \text{PD}_{\text{stressed}} \times \text{LGD}_{\text{stressed}} \times \text{EAD}$$
$$\Delta \text{Expected Loss} = \text{EL}_{\text{stressed}} - \text{EL}_{\text{baseline}}$$

---

### 5. IFRS 9 Staging Classification

Borrowers are classified into IFRS 9 credit impairment stages based on scenario-conditioned credit deterioration:

| Stage | Classification | Threshold Criteria | Provisioning Basis |
| :---: | :--- | :--- | :--- |
| **Stage 1** | Performing | $\text{PD}_{\text{stressed}} < 2.0 \times \text{PD}_{\text{base}}$ AND $\Delta \text{PD} < 100\text{ bps}$ | 12-Month Expected Loss |
| **Stage 2** | Significant Increase in Credit Risk (SICR) | $\text{PD}_{\text{stressed}} \ge 2.0 \times \text{PD}_{\text{base}}$ OR $\Delta \text{PD} \ge 100\text{ bps}$ | Lifetime Expected Loss |
| **Stage 3** | Credit Impaired / Default | $\text{PD}_{\text{stressed}} \ge 20.0\%$ OR $\text{DSCR} < 0.75\text{x}$ | Lifetime Expected Loss |

---

### 6. Rating Migration Matrix

Stressed PDs are mapped into standard credit rating agency bands:
- **AAA:** $\text{PD} \le 0.03\%$
- **AA:** $0.03\% < \text{PD} \le 0.08\%$
- **A:** $0.08\% < \text{PD} \le 0.25\%$
- **BBB (Investment Grade Floor):** $0.25\% < \text{PD} \le 1.00\%$
- **BB (Speculative Grade):** $1.00\% < \text{PD} \le 3.50\%$
- **B (Highly Speculative):** $3.50\% < \text{PD} \le 10.00\%$
- **CCC/D (Substantial Risk / Default):** $\text{PD} > 10.00\%$
