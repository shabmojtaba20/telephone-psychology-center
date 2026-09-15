const fs = require('fs');
const path = require('path');

const root = __dirname;
const file = path.join(root, 'admin-v5.html');
const version = '20260915-1805';

if (!fs.existsSync(file)) {
  throw new Error('admin-v5.html not found');
}

let html = fs.readFileSync(file, 'utf8');

// Always remove previous finance module tags first so the build is deterministic.
html = html.replace(/\s*<script[^>]+src=["']\/finance-(?:tools|dashboard|manager-report)\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi, '');

const marker = '<!-- finance-build-injection-v2 -->';
const scripts = `\n${marker}\n<script src="/finance-tools.js?v=${version}"></script>\n<script src="/finance-dashboard.js?v=${version}"></script>\n<script src="/finance-manager-report.js?v=${version}"></script>`;

if (!html.includes(marker)) {
  html = html.replace('</body>', `${scripts}\n</body>`);
} else {
  html = html.replace(marker, `${marker}\n<script src="/finance-tools.js?v=${version}"></script>\n<script src="/finance-dashboard.js?v=${version}"></script>\n<script src="/finance-manager-report.js?v=${version}"></script>`);
}

fs.writeFileSync(file, html, 'utf8');
console.log('FINANCE BUILD V2: admin-v5 finance modules injected, version ' + version);
