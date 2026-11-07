# Phase 2 Implementation Plan & Architecture Backlog
## ClimateRisk Scenario Lab

### 1. Phase 1 Verification Status
- Application compilation: **PASS**
- 12/12 Numerical tests: **PASS**
- Synthetic dataset validation: **PASS (100% Integrity)**
- Presentation UI: **PASS**

---

### 2. Phase 2 Scope & Objectives

#### Sprint 2.1 — Multi-Period Financial Transmission Engine (Module 6)
- **Objective:** Extend single-horizon EBITDA stress into multi-period free cash flow to firm (FCFF) and capital expenditure (CapEx) schedules (2025 to 2050).
- **Core Models:**
  1. **CapEx Decarbonization Function:** $I_{green}(t) = \text{Capacity} \times \text{Unit Retrofit Cost} \times \Delta\text{DecarbTarget}(t)$.
  2. **Debt Service Coverage Ratio (DSCR):** $\text{DSCR}(t) = \frac{\text{Adjusted EBITDA}(t) - \text{Taxes}}{\text{Interest} + \text{Principal Amortization}}$.
  3. **IFRS 9 Expected Credit Loss (ECL):**
     $$\text{ECL} = \sum_{t=1}^T \frac{\text{PD}(t) \times \text{LGD}(t) \times \text{EAD}(t)}{(1 + r)^t}$$
     Distinguishing 12-month ECL (Stage 1) from Lifetime Staged ECL (Stage 2/3) upon Significant Increase in Credit Risk (SICR).

#### Sprint 2.2 — Reverse Portfolio Stress Testing & Macroeconomic Feedback (Module 7)
- **Objective:** Allow risk managers to determine the critical carbon price or acute shock required to deplete bank CET1 capital below regulatory minimums.
- **Key Features:**
  - Solvency threshold solver.
  - GDP contraction and unemployment feedback loops calibrated from NGFS Phase IV macro models.

#### Sprint 2.3 — Quadrilateral Scenario Comparison (Module 8)
- **Objective:** Side-by-side 4-way variance decomposition table isolating:
  - Policy effect (Carbon price)
  - Technology effect (Wholesale energy tariffs)
  - Physical damage drag (Avoided damages)

#### Sprint 2.4 — Python FastAPI Backend Integration
- **Objective:** Provide optional microservice running NumPy/Pandas calculation engine with REST endpoints matching TypeScript schemas:
  - `POST /api/v1/transition/calculate`
  - `POST /api/v1/portfolio/pcaf-aggregate`
  - `POST /api/v1/stress-test/reverse`

---

### 3. Acceptance Criteria for Phase 2
1. All Phase 2 financial formulas reconcile deterministically with zero floating-point drift.
2. IFRS 9 staging triggers execute without hardcoded assumptions.
3. Python backend and TypeScript adapter produce identical numerical results down to $0.001.
