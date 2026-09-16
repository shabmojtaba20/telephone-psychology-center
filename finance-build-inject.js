const fs = require('fs');
const path = require('path');

const root = __dirname;
const version = process.env.BUILD_VERSION || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

const adminFile = path.join(root, 'admin-v5.html');
if (!fs.existsSync(adminFile)) throw new Error('admin-v5.html not found');

let adminHtml = fs.readFileSync(adminFile, 'utf8');
adminHtml = adminHtml.replace(/\s*<script[^>]+src=["']\/finance-(?:tools|dashboard|manager-report)\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi, '');
adminHtml = adminHtml.replace(/\s*<script[^>]+src=["']\/commission-rules\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi, '');
adminHtml = adminHtml.replace(/\s*<script[^>]+src=["']\/finance-receipt-preview\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi, '');
const adminMarker = '<!-- finance-build-injection-v3 -->';
const adminScripts = `\n${adminMarker}\n<script src="/finance-tools.js?v=${version}"></script>\n<script src="/finance-dashboard.js?v=${version}"></script>\n<script src="/finance-manager-report.js?v=${version}"></script>\n<script src="/commission-rules.js?v=${version}"></script>\n<script src="/finance-receipt-preview.js?v=${version}"></script>`;
if (!adminHtml.includes(adminMarker)) adminHtml = adminHtml.replace('</body>', `${adminScripts}\n</body>`);
else adminHtml = adminHtml.replace(/<!-- finance-build-injection-v\d+ -->[\s\S]*?<\/body>/i, `${adminScripts}\n</body>`);
fs.writeFileSync(adminFile, adminHtml, 'utf8');

const reportFile = path.join(root, 'finance-reports.html');
if (fs.existsSync(reportFile)) {
  let reportHtml = fs.readFileSync(reportFile, 'utf8');
  reportHtml = reportHtml.replace(/\s*<script[^>]+src=["']\/advanced-finance-report\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi, '');
  const reportMarker = '<!-- advanced-finance-report-injection -->';
  const reportScript = `\n${reportMarker}\n<script src="/advanced-finance-report.js?v=${version}"></script>`;
  if (!reportHtml.includes(reportMarker)) reportHtml = reportHtml.replace('</body>', `${reportScript}\n</body>`);
  else reportHtml = reportHtml.replace(reportMarker, `${reportMarker}\n<script src="/advanced-finance-report.js?v=${version}"></script>`);
  fs.writeFileSync(reportFile, reportHtml, 'utf8');
}

console.log('FINANCE BUILD: finance assets injected with cache version ' + version);