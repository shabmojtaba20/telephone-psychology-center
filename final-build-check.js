const fs = require('fs');
const path = require('path');

const root = __dirname;
const requiredFiles = [
  'index.html',
  'admin-v5.html',
  'admin-professional.html',
  'finance-reports.html',
  'finance-audit.html',
  'consultant-settlements.html',
  'finance-tools.js',
  'finance-dashboard.js',
  'finance-manager-report.js',
  'finance-build-inject.js',
  'role-inject.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`FINAL BUILD CHECK FAILED: missing ${file}`);
  }
}

const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!/<html[\s>]/i.test(indexHtml) || !/<body[\s>]/i.test(indexHtml)) {
  throw new Error('FINAL BUILD CHECK FAILED: index.html is not a valid HTML document');
}

const financeReports = fs.readFileSync(path.join(root, 'finance-reports.html'), 'utf8');
const financeAudit = fs.readFileSync(path.join(root, 'finance-audit.html'), 'utf8');
const admin = fs.readFileSync(path.join(root, 'admin-v5.html'), 'utf8');

if (!financeReports.includes('advanced-finance-report.js')) {
  throw new Error('FINAL BUILD CHECK FAILED: advanced finance report injection is missing');
}
if (!financeAudit.includes('finance-audit-ledger.js')) {
  throw new Error('FINAL BUILD CHECK FAILED: finance audit ledger injection is missing');
}
if (!admin.includes('finance-tools.js') || !admin.includes('finance-dashboard.js')) {
  throw new Error('FINAL BUILD CHECK FAILED: core finance assets are missing from admin-v5.html');
}

const allHtml = [indexHtml, financeReports, financeAudit, admin];
const markerCount = allHtml.reduce((sum, html) => sum + (html.match(/finance-build-injection-v8/g) || []).length, 0);
if (markerCount !== 1) {
  throw new Error(`FINAL BUILD CHECK FAILED: expected exactly one finance injection marker, found ${markerCount}`);
}

console.log('FINAL BUILD CHECK: PASS — one clean deployment can be used for the current main branch.');
