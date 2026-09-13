const fs=require('fs');
const path=require('path');
const root=__dirname;
const roleScript='<script src="/role-access.js"></script>';
const roleSwitcher='<script src="/role-switcher.js"></script>';
const routeGuard='<script src="/admin-route-guard.js"></script>';
const panelIntegration='<script src="/admin-panel-integration.js"></script>';
const logoutFix='<script src="/admin-logout-fix.js"></script>';
const modernCss='<link rel="stylesheet" href="/admin-professional-modern.css?v=2">';
const adminPath=path.join(root,'admin-professional.html');
if(fs.existsSync(adminPath)){
 let html=fs.readFileSync(adminPath,'utf8');
 if(!html.includes(roleScript))html=html.replace('</body>',`\n${roleScript}\n</body>`);
 if(!html.includes(roleSwitcher))html=html.replace('</body>',`\n${roleSwitcher}\n</body>`);
 if(!html.includes(routeGuard))html=html.replace('</body>',`\n${routeGuard}\n</body>`);
 if(!html.includes(panelIntegration))html=html.replace('</body>',`\n${panelIntegration}\n</body>`);
 if(!html.includes(logoutFix))html=html.replace('</body>',`\n${logoutFix}\n</body>`);
 if(!html.includes('admin-professional-modern.css'))html=html.replace('</head>',`\n${modernCss}\n</head>`);
 fs.writeFileSync(adminPath,html,'utf8');
}
for(const file of ['admin-v5.html','consultant-panel.html']){
 const p=path.join(root,file);
 if(fs.existsSync(p)){
  let html=fs.readFileSync(p,'utf8');
  if(!html.includes(roleSwitcher))html=html.replace('</body>',`\n${roleSwitcher}\n</body>`);
  if(!html.includes(logoutFix))html=html.replace('</body>',`\n${logoutFix}\n</body>`);
  fs.writeFileSync(p,html,'utf8');
 }
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
console.log('Role routing, multi-role switcher and specialist-panel integration injected');
