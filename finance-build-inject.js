const fs = require('fs');
const path = require('path');
const root = __dirname;
const version = process.env.BUILD_VERSION || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const adminFile = path.join(root, 'admin-v5.html');
if (!fs.existsSync(adminFile)) throw new Error('admin-v5.html not found');
let adminHtml = fs.readFileSync(adminFile, 'utf8');
const assets=['finance-tools','finance-dashboard','finance-manager-report','commission-rules','finance-receipt-preview','finance-audit-ledger','management-kpi-dashboard','management-kpi-charts','management-performance-dashboard','management-final-dashboard','management-finance-alerts','finance-receipt-review-ui','finance-period-closing'];
for(const a of assets) adminHtml=adminHtml.replace(new RegExp('\\s*<script[^>]+src=["\\\']\\/'+a+'\\.js(?:\\?[^"\\\']*)?["\\\'][^>]*><\\/script>','gi'),'');
const adminMarker='<!-- finance-build-injection-v10 -->';
const adminScripts=`\n${adminMarker}\n${assets.map(a=>`<script src="/${a}.js?v=${version}"></script>`).join('\n')}`;
if(!adminHtml.includes(adminMarker)) adminHtml=adminHtml.replace('</body>',`${adminScripts}\n</body>`); else adminHtml=adminHtml.replace(/<!-- finance-build-injection-v\d+ -->[\s\S]*?<\/body>/i,`${adminScripts}\n</body>`);
fs.writeFileSync(adminFile,adminHtml,'utf8');
const reportFile=path.join(root,'finance-reports.html');
if(fs.existsSync(reportFile)){let h=fs.readFileSync(reportFile,'utf8');const reportAssets=['advanced-finance-report','finance-report-reconciliation','finance-report-expense-breakdown','finance-report-export-breakdown','finance-report-excel'];for(const a of reportAssets)h=h.replace(new RegExp('\\s*<script[^>]+src=["\']\\/'+a+'\\.js(?:\\?[^"\']*)?["\\'][^>]*><\\/script>','gi'),'');const m='<!-- advanced-finance-report-injection -->';const s=`\n${m}\n${reportAssets.map(a=>`<script src="/${a}.js?v=${version}"></script>`).join('\n')}`;if(!h.includes(m)) h=h.replace('</body>',`${s}\n</body>`); else h=h.replace(new RegExp(m+'[\\s\\S]*?<\\/body>','i'),`${s}\n</body>`);fs.writeFileSync(reportFile,h,'utf8');}
const auditFile=path.join(root,'finance-audit.html');
if(fs.existsSync(auditFile)){let h=fs.readFileSync(auditFile,'utf8');h=h.replace(/\s*<script[^>]+src=["']\/finance-audit-ledger\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,'');const m='<!-- finance-audit-ledger-injection -->';const s=`\n${m}\n<script src="/finance-audit-ledger.js?v=${version}"></script>`;if(!h.includes(m))h=h.replace('</body>',`${s}\n</body>`);else h=h.replace(m,`${m}\n<script src="/finance-audit-ledger.js?v=${version}"></script>`);fs.writeFileSync(auditFile,h,'utf8');}
const settlementFile=path.join(root,'consultant-settlements.html');
if(fs.existsSync(settlementFile)){let h=fs.readFileSync(settlementFile,'utf8');h=h.replace(/\s*<script[^>]+src=["']\/consultant-settlement-chain\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,'');const m='<!-- consultant-settlement-chain-injection -->';const s=`\n${m}\n<script src="/consultant-settlement-chain.js?v=${version}"></script>`;if(!h.includes(m))h=h.replace('</body>',`${s}\n</body>`);else h=h.replace(new RegExp(m+'[\\s\\S]*?<\\/body>','i'),`${s}\n</body>`);fs.writeFileSync(settlementFile,h,'utf8');}
console.log('FINANCE BUILD: finance assets injected with cache version '+version);
