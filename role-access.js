(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const RULES={
    dashboard:['dashboard.view'],general:['general.manage'],appearance:['appearance.manage'],media:['media.manage'],contact:['contact.manage'],
    consultants:['consultants.manage'],availability:['availability.manage'],appointments:['appointments.manage'],services:['services.manage'],
    finance:['finance.view','finance.manage'],bank:['bank.manage'],gateways:['gateways.manage'],messages:['messages.manage'],
    content:['content.manage'],education:['education.manage'],notifications:['notifications.manage'],security:['security.manage'],
    organizations:['support.manage'],workshops:['workshops.manage'],callRooms:['calls.manage'],reports:['reports.view']
  };
  const db=window.supabase.createClient(SB_URL,SB_KEY);
  async function init(){
    try{
      const {data:{user},error}=await db.auth.getUser();
      if(error||!user){location.replace('/?login=1&returnTo='+encodeURIComponent(location.pathname));return;}
      const {data:roles,error:re}=await db.rpc('admin_get_user_roles',{p_user_id:user.id});
      if(re)throw re;
      const roleNames=[...new Set((roles||[]).map(r=>r.name).filter(Boolean))];
      if(!roleNames.length){location.replace('/?login=1&error=no-role');return;}
      const active=sessionStorage.getItem('activeAdminRole');
      const role=active&&roleNames.includes(active)?active:roleNames[0];
      sessionStorage.setItem('activeAdminRole',role);
      const permissions=new Set();
      if(role==='super_admin')permissions.add('*');
      else for(const page of Object.keys(RULES))for(const permission of RULES[page]){
        const {data}=await db.rpc('has_admin_role_permission',{p_role:role,p_permission:permission});
        if(data===true)permissions.add(permission);
      }
      const allowed=new Set(Object.keys(RULES).filter(p=>permissions.has('*')||RULES[p].some(x=>permissions.has(x))));
      window.__adminRoles=roleNames;window.__adminPermissions=permissions;window.__adminAllowedPages=allowed;
      document.querySelectorAll('[data-page]').forEach(el=>{
        if(!allowed.has(el.dataset.page)){el.style.display='none';el.setAttribute('aria-hidden','true');el.dataset.roleHidden='1';}
      });
      document.querySelectorAll('[data-permission]').forEach(el=>{\n        if(!permissions.has('*') && !permissions.has(el.dataset.permission)){el.style.display='none';el.setAttribute('aria-hidden','true');el.dataset.roleHidden='1';}\n      });\n      document.querySelectorAll('.group').forEach(group=>{
        const visible=[...group.querySelectorAll('[data-page]')].some(x=>x.dataset.roleHidden!=='1'&&getComputedStyle(x).display!=='none');
        if(!visible)group.style.display='none';
      });
      const labels={super_admin:'مدیر ارشد',finance_manager:'مدیر مالی',consultant_manager:'مدیر مشاوران',appointment_manager:'مدیر نوبت‌ها',content_manager:'مدیر محتوا'};
      const title=document.getElementById('title');if(title)title.textContent=labels[role]||'پنل مدیریت';
    }catch(e){console.error('role access',e);location.replace('/?login=1&error=admin-access');}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();