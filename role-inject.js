const fs=require('fs');
const path=require('path');
const root=__dirname;
const roleScript='<script src="/role-access.js"></script>';
const roleSwitcher='<script src="/role-switcher.js"></script>';
const panelAuth='<script src="/panel-auth-guard.js"></script>';
const panelIntegration='<script src="/admin-panel-integration.js"></script>';
const logoutFix='<script src="/admin-logout-fix.js"></script>';
const adminStability='<script src="/admin-professional-stability.js"></script>';
const consultantManager='<script src="/stage10-consultant-management.js"></script>';
const consultantAi='<script src="/consultant-ai-summary.js"></script>';
const consultantReadonly='<script src="/consultant-profile-readonly.js"></script>';
const consultantPayment='<script src="/consultant-payment-status.js"></script>';
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
const consultantCall='<script src="/stage11-consultant-call.js"></script>';
const mediaCss='<link rel="stylesheet" href="/stage5-media.css?v=1">';
const homepageCss='<link rel="stylesheet" href="/stage7-homepage.css?v=3">';
const homepageProCss='<link rel="stylesheet" href="/stage7-homepage-pro.css?v=1">';
const modernCss='<link rel="stylesheet" href="/admin-professional-modern.css?v=2">';
const homepageRoleLogin='<script src="/homepage-role-login.js"></script>';
function inject(html,scripts=[]){for(const s of scripts)if(!html.includes(s))html=html.replace('</body>',`\n${s}\n</body>`);return html;}
function injectHead(html,scripts=[]){for(const s of scripts)if(!html.includes(s))html=html.replace('</head>',`\n${s}\n</head>`);return html;}
const adminPath=path.join(root,'admin-professional.html');
if(fs.existsSync(adminPath)){let html=fs.readFileSync(adminPath,'utf8');html=injectHead(html,[panelAuth]);html=inject(html,[roleScript,roleSwitcher,panelIntegration,logoutFix,adminStability,consultantManager,mediaUi,branding,theme,homepageManager,homepagePro,homepageAdmin,notifications,faqs]);for(const s of [modernCss,homepageCss,homepageProCss])if(!html.includes(s))html=html.replace('</head>',`\n${s}\n</head>`);fs.writeFileSync(adminPath,html,'utf8');}
const consultantPath=path.join(root,'consultant-panel-professional.html');
if(fs.existsSync(consultantPath)){let html=fs.readFileSync(consultantPath,'utf8');html=injectHead(html,[panelAuth]);html=inject(html,[logoutFix,consultantAi,consultantReadonly,consultantPayment,theme]);fs.writeFileSync(consultantPath,html,'utf8');}
for(const file of ['admin-v5.html','consultant-panel.html','admin-v4.html','admin-invoices.html','consultant-settlements.html','finance-audit.html','finance-reports.html','order-review.html','payment.html','card-payment.html','submit-receipt.html']){const p=path.join(root,file);if(fs.existsSync(p)){let html=fs.readFileSync(p,'utf8');html=injectHead(html,[panelAuth]);html=inject(html,[logoutFix,roleSwitcher,theme]);fs.writeFileSync(p,html,'utf8');}}
const indexPath=path.join(root,'index.html');
if(fs.existsSync(indexPath)){let html=fs.readFileSync(indexPath,'utf8');html=inject(html,[homepageRoleLogin,mediaHome,homepage,branding,theme,notifications,faqs,customerDashboard,orderCheckout,consultantCall]);for(const s of [mediaCss,homepageCss])if(!html.includes(s.split(' href="')[1].split('"')[0]))html=html.replace('</head>',`\n${s}\n</head>`);fs.writeFileSync(indexPath,html,'utf8');}
console.log('Stage 11 order review -> payment -> consultant call flow injected');
