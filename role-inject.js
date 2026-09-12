const fs=require('fs');
const path=require('path');
const root=__dirname;
const roleScript='<script src="/role-access.js"></script>';
const adminPath=path.join(root,'admin-professional.html');
if(fs.existsSync(adminPath)){
 let html=fs.readFileSync(adminPath,'utf8');
 if(!html.includes(roleScript)) html=html.replace('</body>',`\n${roleScript}\n</body>`);
 fs.writeFileSync(adminPath,html,'utf8');
}
const loginPath=path.join(root,'admin-login.html');
if(fs.existsSync(loginPath)){
 let html=fs.readFileSync(loginPath,'utf8');
 const marker='<!-- role-login-routing -->';
 if(!html.includes(marker)){
  const helper=`\n${marker}<script>async function redirectByRole(){try{const{data:{user}}=await sb.auth.getUser();if(!user){location.replace('/admin-login.html');return}const{data:rows,error}=await sb.from('admin_user_roles').select('role_id,admin_roles(name)').eq('user_id',user.id);if(error)throw error;const roles=(rows||[]).map(x=>x.admin_roles?.name).filter(Boolean);if(!roles.length){await sb.auth.signOut();throw new Error('این حساب نقش مدیریتی ندارد.')}const target=roles.includes('super_admin')?'admin-professional.html':roles.includes('finance_manager')?'admin-professional.html#finance':roles.includes('consultant_manager')?'admin-professional.html#consultants':roles.includes('appointment_manager')?'admin-professional.html#appointments':roles.includes('content_manager')?'admin-professional.html#content':'admin-professional.html';location.replace('/'+target+'?v='+Date.now())}catch(e){msg.className='msg err';msg.textContent=e.message||'تشخیص نقش انجام نشد.';btn.disabled=false}}</script>`;
  html=html.replace('</body>',helper+'\n</body>');
  html=html.replace("location.replace('/admin-professional.html?v='+Date.now())","redirectByRole()");
  fs.writeFileSync(loginPath,html,'utf8');
 }
}
console.log('Role routing injected');
