const fs=require('fs');
const path=require('path');
const root=__dirname;
const roleScript='<script src="/role-access.js"></script>';
const roleSwitcher='<script src="/role-switcher.js"></script>';
const routeGuard='<script src="/admin-route-guard.js"></script>';
const panelIntegration='<script src="/admin-panel-integration.js"></script>';
const logoutFix='<script src="/admin-logout-fix.js"></script>';
const consultantAi='<script src="/consultant-ai-summary.js"></script>';
const mediaUi='<script src="/stage5-media-ui.js"></script>';
const branding='<script src="/stage5-branding.js"></script>';
const theme='<script src="/stage6-brand-theme.js"></script>';
const homepageManager='<script src="/stage7-homepage-manager.js"></script>';
const homepagePro='<script src="/stage7-homepage-pro.js"></script>';
const homepageAdmin='<script src="/stage7-homepage-admin.js"></script>';
const mediaHome='<script src="/homepage-media.js"></script>';
const homepage='<script src="/stage7-homepage.js"></script>';
const mediaCss='<link rel="stylesheet" href="/stage5-media.css?v=1">';
const homepageCss='<link rel="stylesheet" href="/stage7-homepage.css?v=3">';
const modernCss='<link rel="stylesheet" href="/admin-professional-modern.css?v=2">';
const homepageRoleLogin='<script src="/homepage-role-login.js"></script>';
const adminPath=path.join(root,'admin-professional.html');
if(fs.existsSync(adminPath)){
 let html=fs.readFileSync(adminPath,'utf8');
 for(const s of [roleScript,roleSwitcher,routeGuard,panelIntegration,logoutFix,mediaUi,branding,theme,homepageManager,homepagePro,homepageAdmin])if(!html.includes(s))html=html.replace('</body>',`\n${s}\n</body>`);
 if(!html.includes('admin-professional-modern.css'))html=html.replace('</head>',`\n${modernCss}\n</head>`);
 if(!html.includes('stage7-homepage.css'))html=html.replace('</head>',`\n${homepageCss}\n</head>`);
 fs.writeFileSync(adminPath,html,'utf8');
}
const consultantPath=path.join(root,'consultant-panel-professional.html');
if(fs.existsSync(consultantPath)){
 let html=fs.readFileSync(consultantPath,'utf8');
 if(!html.includes(consultantAi))html=html.replace('</body>',`\n${consultantAi}\n</body>`);
 if(!html.includes(theme))html=html.replace('</body>',`\n${theme}\n</body>`);
 fs.writeFileSync(consultantPath,html,'utf8');
}
for(const file of ['admin-v5.html','consultant-panel.html']){
 const p=path.join(root,file);
 if(fs.existsSync(p)){
  let html=fs.readFileSync(p,'utf8');
  if(!html.includes(roleSwitcher))html=html.replace('</body>',`\n${roleSwitcher}\n</body>`);
  if(!html.includes(logoutFix))html=html.replace('</body>',`\n${logoutFix}\n</body>`);
  if(!html.includes(theme))html=html.replace('</body>',`\n${theme}\n</body>`);
  fs.writeFileSync(p,html,'utf8');
 }
}
const indexPath=path.join(root,'index.html');
if(fs.existsSync(indexPath)){
 let html=fs.readFileSync(indexPath,'utf8');
 if(!html.includes(homepageRoleLogin))html=html.replace('</body>',`\n${homepageRoleLogin}\n</body>`);
 if(!html.includes(mediaHome))html=html.replace('</body>',`\n${mediaHome}\n</body>`);
 if(!html.includes(homepage))html=html.replace('</body>',`\n${homepage}\n</body>`);
 if(!html.includes(branding))html=html.replace('</body>',`\n${branding}\n</body>`);
 if(!html.includes(theme))html=html.replace('</body>',`\n${theme}\n</body>`);
 if(!html.includes('stage5-media.css'))html=html.replace('</head>',`\n${mediaCss}\n</head>`);
 if(!html.includes('stage7-homepage.css'))html=html.replace('</head>',`\n${homepageCss}\n</head>`);
 fs.writeFileSync(indexPath,html,'utf8');
}
const loginPath=path.join(root,'admin-login.html');
if(fs.existsSync(loginPath)){
 let html=fs.readFileSync(loginPath,'utf8');
 const marker='<!-- role-login-routing -->';
 if(!html.includes(marker)){
  const helper=`\n${marker}<script>async function redirectByRole(){try{const{data:{user}}=await sb.auth.getUser();if(!user){location.replace('/admin-login.html');return}const{data:roles,error}=await sb.rpc('admin_get_user_roles',{p_user_id:user.id});if(error)throw error;if(!roles?.length){await sb.auth.signOut();throw new Error('این حساب نقش مدیریتی ندارد.')}location.replace('/admin-professional.html?v='+Date.now())}catch(e){msg.className='msg err';msg.textContent=e.message||'تشخیص نقش انجام نشد.';btn.disabled=false}}</script>`;
  html=html.replace('</body>',helper+'\n</body>');
  fs.writeFileSync(loginPath,html,'utf8');
 }
}
console.log('Admin routing, role switcher, consultant AI, media manager, branding/theme, Stage 7 professional homepage manager, live preview, image upload, drag/drop ordering, dynamic homepage and gallery injected');
