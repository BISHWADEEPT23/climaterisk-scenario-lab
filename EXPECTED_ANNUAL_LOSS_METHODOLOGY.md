# Expected Annual Loss (EAL) Methodology
## Probabilistic Exceedance Curve Integration & Insurance Layering
### ClimateRisk Scenario Lab (v0.3.0 — Phase 3)

---

### 1. Mathematical Definition of EAL

Expected Annual Loss (EAL) represents the mean expected financial loss across all potential hazard intensities occurring in any given year.

For a continuous hazard exceedance probability distribution, EAL is defined as the definite integral of conditional loss $L(p)$ over the annual exceedance probability $p \in [0, 1]$:

$$\text{EAL} = \int_0^1 L(p) \, dp$$

Where $p = \frac{1}{T}$ represents the Annual Exceedance Probability (AEP) corresponding to return period $T$.

---

### 2. Numerical Trapezoidal Integration Algorithm

Because catastrophe loss models compute damages at discrete return period quantiles ($T \in [10, 25, 50, 100, 250, 500]$ years), the continuous integral is evaluated using trapezoidal quadrature:

$$\text{EAL} \approx \sum_{k=1}^{n-1} \left[ \frac{L(p_k) + L(p_{k+1})}{2} \right] \times (p_k - p_{k+1}) + p_n \times L(p_n)$$

| Return Period ($T$) | Annual Exceedance Probability ($p$) | Interval Weight ($\Delta p$) |
| :---: | :---: | :---: |
| $10\text{ years}$ | $0.100$ ($10.0\%$) | $0.100 - 0.040 = 0.060$ |
| $25\text{ years}$ | $0.040$ ($4.0\%$) | $0.040 - 0.020 = 0.020$ |
| $50\text{ years}$ | $0.020$ ($2.0\%$) | $0.020 - 0.010 = 0.010$ |
| $100\text{ years}$ | $0.010$ ($1.0\%$) | $0.010 - 0.004 = 0.006$ |
| $250\text{ years}$ | $0.004$ ($0.4\%$) | $0.004 - 0.002 = 0.002$ |
| $500\text{ years}$ | $0.002$ ($0.2\%$) | Low-frequency extreme tail ($p_n \times L_n$) |

---

### 3. Insurance Layering Architecture

The engine decomposes gross physical damage $D$ across contractual insurance layers:

$$\text{Policy Deductible } (d) = \max\left(\$0.10\text{M}, \text{Asset Replacement Value} \times \text{Deductible Pct}\right)$$
$$\text{Policy Limit } (C) = \text{Asset Replacement Value} \times \text{Coverage Limit Pct}$$

$$\text{Claimable Damage} = \max\left(0, D - d\right)$$
$$\text{Net Insured Payout } (I) = \min\left(C, \text{Claimable Damage}\right)$$
$$\text{Uninsured Retained Loss } (U) = D - I$$

**Zero-Leakage Invariance Guarantee:**
$$\text{Gross Physical Damage} \equiv \text{Net Insured Payout} + \text{Uninsured Retention}$$

---

### 4. Business Interruption (BI) Modeling

Business interruption losses account for lost operating cash flow during facility reconstruction:

$$\text{Downtime Days} = \min\left(365, \text{Round}(D_r \times 240\text{ days})\right)$$
$$\text{Daily Operating Profit Run Rate} = \frac{\text{Company Revenue} \times \text{EBITDA Margin}}{365} \times \left(\frac{\text{Asset Replacement Value}}{\text{Total Company Assets}}\right)$$
$$\text{Gross BI Loss} = \text{Downtime Days} \times \text{Daily Operating Profit Run Rate}$$

Insurance BI coverage incorporates a **14-day waiting period deductible** and an **indemnity limit of 180 days**.
