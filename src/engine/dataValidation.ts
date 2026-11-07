/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Deterministic Data Validation & Quality Engine
 * Executes formal accounting and physical sanity checks across companies and assets.
 */

import { Company, PhysicalAsset, ValidationIssue, ValidationSummary } from '../types/climate';

export function validateClimateDataset(
  companies: Company[],
  assets: PhysicalAsset[]
): ValidationSummary {
  const issues: ValidationIssue[] = [];
  let totalChecked = 0;

  const validSectors = new Set([
    'Power Generation',
    'Steel',
    'Cement',
    'Automotive',
    'Commercial Real Estate',
    'Agriculture'
  ]);

  const validCountries = new Set([
    'India',
    'United States',
    'Germany',
    'United Kingdom',
    'Japan'
  ]);

  // Track unique IDs
  const seenCompanyIds = new Set<string>();
  const seenAssetIds = new Set<string>();

  // Sector intensity tracking for outlier detection
  const sectorIntensities: Record<string, number[]> = {};

  // 1. Company Validation
  for (const comp of companies) {
    totalChecked++;

    // Duplicate Check
    if (seenCompanyIds.has(comp.id)) {
      issues.push({
        id: `DUP-${comp.id}`,
        entityType: 'Company',
        entityId: comp.id,
        field: 'id',
        severity: 'Error',
        rule: 'UNIQUE_COMPANY_ID',
        message: `Duplicate company identifier detected: ${comp.id}`,
        valueReceived: comp.id
      });
    }
    seenCompanyIds.add(comp.id);

    // Non-negative emissions
    if (comp.scope1Tco2e < 0) {
      issues.push({
        id: `NEG-S1-${comp.id}`,
        entityType: 'Company',
        entityId: comp.id,
        field: 'scope1Tco2e',
        severity: 'Error',
        rule: 'NON_NEGATIVE_EMISSIONS',
        message: `Scope 1 emissions must be non-negative`,
        valueReceived: comp.scope1Tco2e
      });
    }

    if (comp.scope2Tco2e < 0) {
      issues.push({
        id: `NEG-S2-${comp.id}`,
        entityType: 'Company',
        entityId: comp.id,
        field: 'scope2Tco2e',
        severity: 'Error',
        rule: 'NON_NEGATIVE_EMISSIONS',
        message: `Scope 2 emissions must be non-negative`,
        valueReceived: comp.scope2Tco2e
      });
    }

    // Financial consistency
    if (comp.ebitdaUsdM > comp.revenueUsdM && comp.revenueUsdM > 0) {
      issues.push({
        id: `FIN-EBITDA-${comp.id}`,
        entityType: 'Company',
        entityId: comp.id,
        field: 'ebitdaUsdM',
        severity: 'Error',
        rule: 'FINANCIAL_STATEMENT_CONSISTENCY',
        message: `EBITDA cannot exceed total revenue`,
        valueReceived: { ebitda: comp.ebitdaUsdM, revenue: comp.revenueUsdM }
      });
    }

    if (comp.loanExposureUsdM > comp.enterpriseValueUsdM && comp.enterpriseValueUsdM > 0) {
      issues.push({
        id: `FIN-LOAN-EVIC-${comp.id}`,
        entityType: 'Company',
        entityId: comp.id,
        field: 'loanExposureUsdM',
        severity: 'Warning',
        rule: 'EXPOSURE_EVIC_BOUND',
        message: `Loan exposure exceeds Enterprise Value Including Cash (EVIC)`,
        valueReceived: { loan: comp.loanExposureUsdM, evic: comp.enterpriseValueUsdM }
      });
    }

    // Percentage bounds
    if (comp.carbonCoveragePct < 0 || comp.carbonCoveragePct > 100) {
      issues.push({
        id: `PCT-COV-${comp.id}`,
        entityType: 'Company',
        entityId: comp.id,
        field: 'carbonCoveragePct',
        severity: 'Error',
        rule: 'PERCENTAGE_BOUND_0_100',
        message: `Carbon coverage must be between 0 and 100%`,
        valueReceived: comp.carbonCoveragePct
      });
    }

    if (comp.carbonPassThroughPct < 0 || comp.carbonPassThroughPct > 100) {
      issues.push({
        id: `PCT-PT-${comp.id}`,
        entityType: 'Company',
        entityId: comp.id,
        field: 'carbonPassThroughPct',
        severity: 'Error',
        rule: 'PERCENTAGE_BOUND_0_100',
        message: `Carbon pass-through must be between 0 and 100%`,
        valueReceived: comp.carbonPassThroughPct
      });
    }

    // Taxonomy validation
    if (!validSectors.has(comp.sector)) {
      issues.push({
        id: `TAX-SEC-${comp.id}`,
        entityType: 'Company',
        entityId: comp.id,
        field: 'sector',
        severity: 'Error',
        rule: 'STANDARDIZED_SECTOR_TAXONOMY',
        message: `Sector is not in approved 6-sector taxonomy`,
        valueReceived: comp.sector
      });
    }

    if (!validCountries.has(comp.country)) {
      issues.push({
        id: `TAX-CTY-${comp.id}`,
        entityType: 'Company',
        entityId: comp.id,
        field: 'country',
        severity: 'Error',
        rule: 'STANDARDIZED_GEOGRAPHY_TAXONOMY',
        message: `Country is not in approved 5-country taxonomy`,
        valueReceived: comp.country
      });
    }

    // Collect sector intensity
    if (comp.revenueUsdM > 0) {
      const intensity = (comp.scope1Tco2e + comp.scope2Tco2e) / comp.revenueUsdM;
      if (!sectorIntensities[comp.sector]) sectorIntensities[comp.sector] = [];
      sectorIntensities[comp.sector].push(intensity);
    }
  }

  // 2. Outlier Detection (intensity > 3.5x sector median)
  for (const comp of companies) {
    if (comp.revenueUsdM > 0) {
      const intensity = (comp.scope1Tco2e + comp.scope2Tco2e) / comp.revenueUsdM;
      const list = sectorIntensities[comp.sector] || [];
      const sorted = [...list].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)] || 1;
      if (intensity > median * 4.0 && intensity > 500) {
        issues.push({
          id: `OUTLIER-INT-${comp.id}`,
          entityType: 'Company',
          entityId: comp.id,
          field: 'emissionsIntensity',
          severity: 'Notice',
          rule: 'STATISTICAL_OUTLIER_FLAG',
          message: `Emissions intensity (${Math.round(intensity)} tCO2e/$M) exceeds 4x sector median`,
          valueReceived: Math.round(intensity)
        });
      }
    }
  }

  // 3. Asset Validation
  for (const asset of assets) {
    totalChecked++;

    // Duplicate Check
    if (seenAssetIds.has(asset.id)) {
      issues.push({
        id: `DUP-${asset.id}`,
        entityType: 'Asset',
        entityId: asset.id,
        field: 'id',
        severity: 'Error',
        rule: 'UNIQUE_ASSET_ID',
        message: `Duplicate physical asset identifier detected: ${asset.id}`,
        valueReceived: asset.id
      });
    }
    seenAssetIds.add(asset.id);

    // Geographic coordinate sanity
    if (asset.latitude < -90 || asset.latitude > 90) {
      issues.push({
        id: `GEO-LAT-${asset.id}`,
        entityType: 'Asset',
        entityId: asset.id,
        field: 'latitude',
        severity: 'Error',
        rule: 'GEOGRAPHIC_LATITUDE_RANGE',
        message: `Latitude must be between -90 and +90 degrees`,
        valueReceived: asset.latitude
      });
    }

    if (asset.longitude < -180 || asset.longitude > 180) {
      issues.push({
        id: `GEO-LNG-${asset.id}`,
        entityType: 'Asset',
        entityId: asset.id,
        field: 'longitude',
        severity: 'Error',
        rule: 'GEOGRAPHIC_LONGITUDE_RANGE',
        message: `Longitude must be between -180 and +180 degrees`,
        valueReceived: asset.longitude
      });
    }

    // Replacement value
    if (asset.replacementValueUsdM <= 0) {
      issues.push({
        id: `VAL-REP-${asset.id}`,
        entityType: 'Asset',
        entityId: asset.id,
        field: 'replacementValueUsdM',
        severity: 'Error',
        rule: 'POSITIVE_ASSET_VALUATION',
        message: `Asset replacement value must be greater than zero`,
        valueReceived: asset.replacementValueUsdM
      });
    }

    // Foreign key check
    if (!seenCompanyIds.has(asset.companyId)) {
      issues.push({
        id: `FK-COMP-${asset.id}`,
        entityType: 'Asset',
        entityId: asset.id,
        field: 'companyId',
        severity: 'Error',
        rule: 'REFERENTIAL_INTEGRITY',
        message: `Asset references unknown parent company ID: ${asset.companyId}`,
        valueReceived: asset.companyId
      });
    }
  }

  const errorCount = issues.filter(i => i.severity === 'Error').length;
  const warningCount = issues.filter(i => i.severity === 'Warning').length;
  const passedCount = totalChecked - errorCount;
  const datasetIntegrityScorePct = totalChecked > 0 
    ? Number((((totalChecked - errorCount - (warningCount * 0.2)) / totalChecked) * 100).toFixed(1))
    : 100;

  return {
    totalChecked,
    passedCount,
    errorCount,
    warningCount,
    issues,
    datasetIntegrityScorePct,
    executionTimestamp: new Date().toISOString()
  };
}
