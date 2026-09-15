const fs = require('fs');
const path = require('path');

const root = __dirname;
const file = path.join(root, 'admin-v5.html');
const version = process.env.BUILD_VERSION || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

if (!fs.existsSync(file)) throw new Error('admin-v5.html not found');

let html = fs.readFileSync(file, 'utf8');
html = html.replace(/\s*<script[^>]+src=["']\/finance-(?:tools|dashboard|manager-report)\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi, '');
html = html.replace(/\s*<script[^>]+src=["']\/commission-rules\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi, '');
html = html.replace(/\s*<script[^>]+src=["']\/finance-receipt-preview\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi, '');

const marker = '<!-- finance-build-injection-v2 -->';
const scripts = `\n${marker}\n<script src="/finance-tools.js?v=${version}"></script>\n<script src="/finance-dashboard.js?v=${version}"></script>\n<script src="/finance-manager-report.js?v=${version}"></script>\n<script src="/commission-rules.js?v=${version}"></script>\n<script src="/finance-receipt-preview.js?v=${version}"></script>`;

if (!html.includes(marker)) html = html.replace('</body>', `${scripts}\n</body>`);
else html = html.replace(marker, `${marker}\n<script src="/finance-tools.js?v=${version}"></script>\n<script src="/finance-dashboard.js?v=${version}"></script>\n<script src="/finance-manager-report.js?v=${version}"></script>\n<script src="/commission-rules.js?v=${version}"></script>\n<script src="/finance-receipt-preview.js?v=${version}"></script>`);

fs.writeFileSync(file, html, 'utf8');
console.log('FINANCE BUILD: finance assets injected with automatic cache version ' + version);