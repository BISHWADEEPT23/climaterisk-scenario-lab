/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClimateRisk Scenario Lab - Console Test Runner
 * Command-line runner for deterministic numerical tests.
 */

import { runAllNumericalTests } from './numericalEngine.test';

console.log('========================================================');
console.log('CLIMATERISK SCENARIO LAB — NUMERICAL VERIFICATION SUITE');
console.log('========================================================\n');

const results = runAllNumericalTests();
let allPassed = true;

results.forEach((r) => {
  const icon = r.status === 'PASS' ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`${icon} Test ${r.id}: ${r.name} (${r.durationMs}ms)`);
  console.log(`   Expected: ${r.expected}`);
  console.log(`   Actual:   ${r.actual}`);
  console.log(`   Details:  ${r.details}\n`);

  if (r.status !== 'PASS') {
    allPassed = false;
  }
});

console.log('--------------------------------------------------------');
const passCount = results.filter(r => r.status === 'PASS').length;
console.log(`SUMMARY: ${passCount} / ${results.length} Tests Passed.`);
if (allPassed) {
  console.log(`STATUS: ALL ${results.length} NUMERICAL TESTS PASSED VERIFICATION.`);
} else {
  console.error('STATUS: NUMERICAL TEST FAILURES DETECTED.');
  process.exit(1);
}
console.log('========================================================');
