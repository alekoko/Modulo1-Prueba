'use strict';
/** Resume el JSON de Cucumber: totales, % de éxito, duración y detalle de fallas. */
const fs = require('fs');

const FAILED = new Set(['failed', 'ambiguous', 'undefined', 'pending']);

function scenarioStatus(steps) {
  const statuses = steps.map((s) => s.result?.status);
  if (statuses.some((s) => FAILED.has(s))) return 'failed';
  if (statuses.length > 0 && statuses.every((s) => s === 'passed')) return 'passed';
  return 'skipped';
}

function buildSummary(jsonFile) {
  const summary = { total: 0, passed: 0, failed: 0, skipped: 0, passRate: 0, durationSec: 0, failures: [], generatedAt: new Date().toISOString() };
  if (!fs.existsSync(jsonFile) || fs.statSync(jsonFile).size === 0) return summary;

  let features;
  try {
    features = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  } catch {
    return summary;
  }

  let durationNs = 0;
  for (const feature of features) {
    for (const scenario of (feature.elements || []).filter((e) => e.type === 'scenario')) {
      const steps = scenario.steps || [];
      durationNs += steps.reduce((sum, s) => sum + (s.result?.duration || 0), 0);
      const status = scenarioStatus(steps);
      summary.total += 1;
      summary[status] += 1;
      if (status === 'failed') {
        const step = steps.find((s) => FAILED.has(s.result?.status));
        summary.failures.push({
          scenario: scenario.name,
          step: step?.name || step?.keyword || 'hook',
          error: (step?.result?.error_message || '').split('\n')[0],
        });
      }
    }
  }
  summary.durationSec = Math.round(durationNs / 1e9);
  summary.passRate = summary.total ? Math.round((summary.passed / summary.total) * 100) : 0;
  return summary;
}

module.exports = { buildSummary };
