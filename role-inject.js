const fs = require('fs');
const path = require('path');

const root = __dirname;
const panelAuth = '<script src="/panel-auth-guard.js"></script>';

const targets = [
  'admin-professional.html', 'consultant-panel-professional.html', 'admin-v5.html',
  'consultant-panel.html', 'admin-v4.html', 'admin-invoices.html',
  'consultant-settlements.html', 'finance-audit.html', 'finance-reports.html',
  'order-review.html', 'payment.html', 'card-payment.html', 'submit-receipt.html'
];

function injectHead(html, scripts) {
  if (html.includes('/panel-auth-guard.js')) return html;
  const tags = scripts.join('\n');
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head([^>]*)>/i, '<head$1>\n' + tags);
  return tags + '\n' + html;
}

for (const file of targets) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  let html = fs.readFileSync(filePath, 'utf8');
  html = injectHead(html, [panelAuth]);
  fs.writeFileSync(filePath, html, 'utf8');
}
