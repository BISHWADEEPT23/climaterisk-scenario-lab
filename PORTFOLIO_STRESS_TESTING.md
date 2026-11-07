# Portfolio Stress Testing & Capital Adequacy
## Macroeconomic-to-Portfolio Credit Risk Transmission & Reverse Stress Testing
### ClimateRisk Scenario Lab (v0.2.0)

> **Regulatory Framing Disclaimer:**  
> The capital adequacy metrics and reverse stress algorithms provided in this lab are illustrative financial engineering prototypes. They do **not** replace formal regulatory capital requirements under Basel Committee standards or national competent authority stress tests.

---

### 1. Portfolio Aggregation Engine

Portfolio metrics aggregate loan-level calculations across all corporate obligors $i \in \{1, \dots, N\}$:

$$\text{Total Portfolio Drawn Exposure} = \sum_{i=1}^N \text{Drawn Exposure}_i$$
$$\text{Total Portfolio EAD} = \sum_{i=1}^N \text{EAD}_i$$
$$\text{Portfolio Baseline Expected Loss} = \sum_{i=1}^N \text{EL}_{\text{baseline}, i}$$
$$\text{Portfolio Stressed Expected Loss} = \sum_{i=1}^N \text{EL}_{\text{stressed}, i}$$
$$\Delta \text{Portfolio Loss} = \text{Portfolio Stressed EL} - \text{Portfolio Baseline EL}$$

#### 1.1. Portfolio Weighted Average PD
$$\overline{\text{PD}}_{\text{stressed}} = \sum_{i=1}^N \left( \frac{\text{EAD}_i}{\text{Total EAD}} \times \text{PD}_{\text{stressed}, i} \right)$$

---

### 2. Illustrative Capital Adequacy Sensitivity

Under scenario stress, increased credit risk affects bank capitalization through two channels:
1. **CET1 Capital Depletion:** Additional credit loss provisions reduce retained earnings net of tax shield.
2. **Risk-Weighted Assets (RWA) Expansion:** Borrower credit rating downgrades increase average regulatory risk weights under Basel IRB formulas.

#### 2.1. Stressed CET1 Capital
$$\Delta \text{CET1 Capital} = - \max(0, \Delta \text{Portfolio Loss}) \times (1 - \tau_{\text{tax}})$$
$$\text{Stressed CET1 Capital} = \text{Baseline CET1 Capital} + \Delta \text{CET1 Capital}$$
Where $\tau_{\text{tax}}$ is the deferred tax shield (standard: $25\%$).

#### 2.2. Stressed Risk-Weighted Assets (RWA)
Borrower rating migration inflates portfolio credit risk density:
$$\text{Stressed RWA} = \text{Baseline RWA} \times \left( 1 + \min\left(0.50, \psi_{\text{migration}} \times \frac{\Delta \overline{\text{PD}}}{\overline{\text{PD}}_{\text{base}}}\right) \right)$$
Where $\psi_{\text{migration}}$ is the portfolio risk-weight elasticity (default: $0.35$).

#### 2.3. Stressed CET1 Capital Ratio
$$\text{Stressed CET1 Ratio} = \frac{\text{Stressed CET1 Capital}}{\text{Stressed RWA}}$$
$$\text{CET1 Capital Impact (bps)} = (\text{Baseline CET1 Ratio} - \text{Stressed CET1 Ratio}) \times 10,000$$

**Capital Adequacy Breach Flag:**
If $\text{Stressed CET1 Ratio} < \text{Regulatory Minimum}$ (e.g., $10.5\%$ including capital conservation buffer), the portfolio is flagged for potential capital restoration actions.

---

### 3. Deterministic Bisection Reverse Stress Solver

Reverse stress testing identifies the critical climate stress severity required to breach a specified portfolio loss threshold or capital hurdle.

#### 3.1. Problem Formulation
Given a target incremental portfolio loss $L^*$, solve for the critical carbon price $P^* \in [0, P_{\max}]$ such that:
$$f(P) = \Delta \text{Portfolio Loss}(P) - L^* = 0$$

Where $P_{\max} = \$1,000/\text{tCO}_2\text{e}$ and tolerance $\epsilon = \$0.01/\text{tCO}_2\text{e}$.

#### 3.2. Deterministic Bisection Algorithm
```text
Input: f(P), lower bound a = 0, upper bound b = 1000, max_iter = 100, tol = 0.01

1. Evaluate f(a) and f(b)
2. If f(a) >= 0:
     Target already breached at baseline; return P* = a, converged = true
3. If f(b) < 0:
     Target unreachable within search interval; return P* = b, converged = false, unreachable = true
4. For iteration k = 1 to max_iter:
     c = (a + b) / 2
     If |f(c)| < tol or (b - a)/2 < tol:
         Return P* = c, converged = true
     If sign(f(c)) == sign(f(a)):
         a = c
     Else:
         b = c
5. Return P* = (a + b) / 2, converged = true
```

#### 3.3. Convergence & Safety Properties
- **Monotonicity:** Because corporate compliance cost is strictly monotonically non-decreasing with carbon price, $f(P)$ is monotonically increasing, guaranteeing a unique root if a crossing exists.
- **Boundary Safety:** If the target loss exceeds the maximum possible loss even at $\$1,000/\text{tCO}_2\text{e}$, the algorithm gracefully reports `isConverged: false` and `isUnreachable: true`, preventing false or fabricated solutions.
