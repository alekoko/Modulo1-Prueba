'use strict';
/**  HTML + capturas en un .zip adjunta en email o Slack. */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

function zipReports(paths) {
  const outputFile = path.join(paths.reports, `saucedemo-report-${Date.now()}.zip`);
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => resolve({ filename: path.basename(outputFile), path: outputFile, bytes: archive.pointer() }));
    archive.on('error', reject);
    archive.pipe(output);
    [
      [paths.dashboard, 'dashboard'],
      [paths.html, 'html'],
      [paths.screenshots, 'screenshots'],
    ].forEach(([dir, name]) => fs.existsSync(dir) && archive.directory(dir, name));
    archive.finalize();
  });
}

module.exports = { zipReports };
