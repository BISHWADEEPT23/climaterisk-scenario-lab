# Geospatial Data Dictionary & Spatial Taxonomy
## Geographic Entities, GeoJSON Specifications & Coordinate Bounds
### ClimateRisk Scenario Lab (v0.3.0 — Phase 3)

---

### 1. Spatial Coordinate Standard

All asset locations in the catalog use the **WGS 84 (EPSG:4326)** standard:
- Latitude: Floating-point decimal degrees bounded strictly within $[-90.0000, +90.0000]$.
- Longitude: Floating-point decimal degrees bounded strictly within $[-180.0000, +180.0000]$.
- Precision: 4 decimal places ($\sim 11\text{ meters}$ ground resolution).

---

### 2. Country Centroids & Regional Hubs

| Country | Code | Centroid Latitude | Centroid Longitude | Default Map Zoom | Regional Industrial Hubs |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **United States** | `US` | $38.0000^\circ\text{N}$ | $-97.0000^\circ\text{W}$ | $4.0\text{x}$ | Gulf Coast, West Coast/CA, East/Midwest |
| **Germany** | `DE` | $51.1657^\circ\text{N}$ | $10.4515^\circ\text{E}$ | $6.0\text{x}$ | Rhine-Ruhr, Bavaria, Northern Ports |
| **United Kingdom** | `GB` | $54.0000^\circ\text{N}$ | $-2.5000^\circ\text{W}$ | $5.5\text{x}$ | Greater London, Midlands, Scotland/North |
| **India** | `IN` | $21.7679^\circ\text{N}$ | $78.8718^\circ\text{E}$ | $4.5\text{x}$ | Western Coastal Belt, Indo-Gangetic, South |
| **Japan** | `JP` | $36.2048^\circ\text{N}$ | $138.2529^\circ\text{E}$ | $5.5\text{x}$ | Greater Tokyo/Kanto, Osaka-Kobe/Kansai |

---

### 3. GeoJSON Feature Specification

When exported via the **GeoJSON Export** button, physical assets conform to RFC 7946:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-95.3698, 29.7604]
  },
  "properties": {
    "id": "ASSET-014",
    "name": "Houston Petrochemical Complex [Synthetic]",
    "companyId": "COMP-005",
    "companyName": "Apex Energy & Refining [Synthetic]",
    "sector": "Power Generation",
    "country": "United States",
    "city": "Houston",
    "assetType": "Refinery & Processing Facility",
    "replacementValueUsdM": 85.0,
    "overallPhysicalScore": 78,
    "riskTier": "Critical",
    "expectedAnnualLossUsdM": 1.42,
    "lossRatePct": 1.67,
    "uninsuredLossUsdM": 0.89,
    "businessInterruptionEalUsdM": 0.28,
    "acuteHazards": {
      "Flood": 82,
      "Cyclone": 74,
      "Wildfire": 20,
      "Extreme Precipitation": 79
    },
    "chronicHazards": {
      "Heat Stress": 65,
      "Water Stress": 42,
      "Drought": 30,
      "Sea-level Rise": 68
    }
  }
}
```

---

### 4. Great-Circle Distance Metric

Spatial clustering and distance calculations use the **Haversine Formula**:

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$
$$d = R \cdot c \quad (R = 6,371.0\text{ km})$$
