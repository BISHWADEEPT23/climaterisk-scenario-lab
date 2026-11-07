/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, X, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-1">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>
          <strong>Analytical Portfolio Project:</strong> ClimateRisk Scenario Lab is an independent technical demonstration. 
          All corporate profiles, asset locations, and scenario pathways are deterministic synthetic proxies calibrated to NGFS concepts.
          Not an official Moody&apos;s Analytics product or regulatory-approved financial risk model.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" /> Phase 1 Verified
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 p-0.5 rounded"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
