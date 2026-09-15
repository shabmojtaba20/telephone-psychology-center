const fs = require('fs');
const path = require('path');

const root = __dirname;

const scriptsByPage = {
  'admin-professional.html': [
    '/admin-professional-stability.js', '/stage5-media-ui.js', '/stage6-brand-theme.js',
    '/stage7-homepage-pro.js', '/stage9-faqs.js', '/stage10-consultant-management.js',
    '/admin-logout-fix.js'
  ],
  'consultant-panel-professional.html': ['/consultant-profile-readonly.js', '/consultant-payment-status.js', '/admin-logout-fix.js'],
  'admin-v5.html': ['/admin-logout-fix.js'],
  'consultant-panel.html': ['/admin-logout-fix.js'],
  'admin-v4.html': ['/admin-logout-fix.js'],
  'admin-invoices.html': ['/admin-logout-fix.js']
};

const panelAuth = '<script src="/panel-auth-guard.js"></script>';

function injectHead(html, scripts) {
  const tags = [panelAuth, ...scripts.map(src => `<script src="${src}"></script>`)].join('\n');
  if (html.includes('/panel-auth-guard.js')) return html;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head([^>]*)>/i, '<head$1>\n' + tags);
  return tags + '\n' + html;
}

for (const [file, scripts] of Object.entries(scriptsByPage)) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  const html = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, injectHead(html, scripts), 'utf8');
}
