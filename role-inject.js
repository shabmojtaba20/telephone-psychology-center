const fs=require('fs');
const path=require('path');
const root=__dirname;
const roleScript='<script src="/role-access.js"></script>';
const roleSwitcher='<script src="/role-switcher.js"></script>';
const panelAuth='<script src="/panel-auth-guard.js"></script>';
const panelIntegration='<script src="/admin-panel-integration.js"></script>';
const logoutFix='<script src="/admin-logout-fix.js"></script>';
const adminStability='<script src="/admin-professional-stability.js"></script>';
const financePanelBridge='<script src="/finance-panel-bridge.js"></script>';
const consultantManager='<script src="/stage10-consultant-management.js"></script>';
const consultantAi='<script src="/consultant-ai-summary.js"></script>';
const consultantReadonly='<script src="/consultant-profile-readonly.js"></script>';
const consultantPayment='<script src="/consultant-payment-status.js?v=20260926-1"></script>';
const consultantOps='<script src="/consultant-operations-pro.js"></script>';
const consultantBootFix='<script src="/consultant-panel-boot-fix.js?v=20260920"></script>';
const mediaUi='<script src="/stage5-media-ui.js"></script>';
const branding='<script src="/stage5-branding.js"></script>';
const theme='<script src="/stage6-brand-theme.js"></script>';
const homepageManager='<script src="/stage7-homepage-manager.js"></script>';
const homepagePro='<script src="/stage7-homepage-pro.js"></script>';
const homepageAdmin='<script src="/stage7-homepage-admin.js"></script>';
const notifications='<script src="/stage8-notifications.js"></script>';
const faqs='<script src="/stage9-faqs.js"></script>';
const mediaHome='<script src="/homepage-media.js"></script>';
const homepage='<script src="/stage7-homepage.js"></script>';
const customerDashboard='<script src="/stage11-customer-dashboard.js"></script>';
const orderCheckout='<script src="/stage11-order-checkout.js"></script>';
const consultantCall='<script src="/stage11-consultant-call.js?v=2"></script>';
const financeBankFix='<script src="/finance-bank-settings-fix.js?v=1"></script>';
const financeReportAccessFix='<script src="/finance-report-access-fix.js?v=1"></script>';
const financeReceiptIntegrity='<script src="/finance-receipt-integrity.js?v=1"></script>';
const workshopAdminPlus='<script src="/workshop-admin-plus.js?v=1"></script>';
const educationDashboardNav='<script src="/education-dashboard-nav.js?v=2"></script>';
const adminNavFinal='<script src="/admin-nav-final.js?v=6"></script>';
const mediaCss='<link rel="stylesheet" href="/stage5-media.css?v=1">';
const homepageCss='<link rel="stylesheet" href="/stage7-homepage.css?v=3">';
const homepageProCss='<link rel="stylesheet" href="/stage7-homepage-pro.css?v=1">';
const modernCss='<link rel="stylesheet" href="/admin-professional-modern.css?v=2">';
const homepageRoleLogin='<script src="/homepage-role-login.js"></script>';
function inject(html,scripts=[]){for(const s of scripts)if(!html.includes(s))html=html.replace('</body>',`\n${s}\n</body>`);return html;}
function injectHead(html,scripts=[]){for(const s of scripts)if(!html.includes(s))html=html.replace('</head>',`\n${s}\n</head>`);return html;}
const adminPath=path.join(root,'admin-professional.html');
if(fs.existsSync(adminPath)){let html=fs.readFileSync(adminPath,'utf8');html=html.replace(/\s*<script[^>]+src=["']\/admin-nav-final\.js\?v=[^"']+["'][^>]*><\/script>/gi,'');html=html.replace(/\s*<script[^>]+src=["']\/admin-route-guard\.js["'][^>]*><\/script>/gi,'');html=html.replace(/\s*<script[^>]+src=["']\/admin-nav-fallback\.js(?:\?v=[^"']*)?["'][^>]*><\/script>/gi,'');html=injectHead(html,[panelAuth]);html=inject(html,[roleScript,roleSwitcher,panelIntegration,logoutFix,adminStability,financePanelBridge,consultantManager,mediaUi,branding,theme,homepageManager,homepagePro,homepageAdmin,notifications,faqs,workshopAdminPlus,educationDashboardNav,adminNavFinal]);for(const s of [modernCss,homepageCss,homepageProCss])if(!html.includes(s))html=html.replace('</head>',`\n${s}\n</head>`);fs.writeFileSync(adminPath,html,'utf8');}
const consultantPath=path.join(root,'consultant-panel-professional.html');
if(fs.existsSync(consultantPath)){let html=fs.readFileSync(consultantPath,'utf8');html=injectHead(html,[panelAuth]);html=inject(html,[logoutFix,consultantAi,consultantReadonly,consultantPayment,consultantOps,theme]);fs.writeFileSync(consultantPath,html,'utf8');}
for(const file of ['admin-v5.html','consultant-panel.html','admin-v4.html','admin-invoices.html','consultant-settlements.html','finance-audit.html','finance-reports.html','order-review.html','payment.html','card-payment.html','submit-receipt.html']){const p=path.join(root,file);if(fs.existsSync(p)){let html=fs.readFileSync(p,'utf8');html=injectHead(html,[panelAuth]);const scripts=[logoutFix,roleSwitcher,theme,...(file==='admin-v5.html'?[financeBankFix,financeReceiptIntegrity]:[]),...(file==='finance-reports.html'?[financeReportAccessFix]:[])];html=inject(html,scripts);fs.writeFileSync(p,html,'utf8');}}
const indexPath=path.join(root,'index.html');
if(fs.existsSync(indexPath)){let html=fs.readFileSync(indexPath,'utf8');html=inject(html,[homepageRoleLogin,mediaHome,homepage,branding,theme,notifications,faqs,customerDashboard,orderCheckout,consultantCall]);for(const s of [mediaCss,homepageCss])if(!html.includes(s.split(' href="')[1].split('"')[0]))html=html.replace('</head>',`\n${s}\n</head>`);fs.writeFileSync(indexPath,html,'utf8');}
const financePath=path.join(root,'admin-v5.html');
if(fs.existsSync(financePath)){const html=fs.readFileSync(financePath,'utf8');const required=['/finance-tools.js','/finance-dashboard.js','/finance-manager-report.js','/commission-rules.js','/finance-receipt-preview.js','/finance-audit-ledger.js','/management-kpi-dashboard.js','/management-kpi-charts.js','/management-performance-dashboard.js','/management-final-dashboard.js'];const missing=required.filter(src=>!html.includes(src));const duplicate=required.filter(src=>(html.match(new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length!==1);const markerMatches=html.match(/<!-- finance-build-injection-v\d+ -->/g)||[];const markers=markerMatches.length;if(missing.length||duplicate.length||markers!==1)throw new Error('Finance build verification failed: missing='+missing.join(',')+' duplicate='+duplicate.join(',')+' markers='+markers+' found='+markerMatches.join('|'));console.log('BUILD VERIFY: finance injection OK; one owner, ten finance/management assets, one marker');}
console.log('Role build injection completed; finance assets remain owned by finance-build-inject.js');