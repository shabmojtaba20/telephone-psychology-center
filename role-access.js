(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const RULES={dashboard:['dashboard.view'],general:['general.manage'],appearance:['appearance.manage'],media:['media.manage'],contact:['contact.manage'],consultants:['consultants.manage'],availability:['availability.manage'],appointments:['appointments.manage'],services:['services.manage'],finance:['finance.view','finance.manage'],bank:['bank.manage'],gateways:['gateways.manage'],messages:['messages.manage'],content:['content.manage'],notifications:['notifications.manage'],security:['security.manage']};
  let db;
  const create=()=>db||(db=window.supabase.createClient(SB_URL,SB_KEY));
  const goLogin=()=>location.replace('/?login=1&returnTo='+encodeURIComponent(location.pathname+location.search));
  async function init(){
    try{
      const client=create();
      const {data:{user},error:userError}=await client.auth.getUser();
      if(userError||!user){goLogin();return;}
      const {data:roles,error:rolesError}=await client.rpc('admin_get_user_roles',{p_user_id:user.id});
      if(rolesError) throw rolesError;
      if(!roles||!roles.length){await client.auth.signOut({scope:'local'});location.replace('/?login=1&error=no-role');return;}
      const roleNames=[...new Set(roles.map(r=>r.name).filter(Boolean))];
      const requested=new URLSearchParams(location.search).get('role');
      const stored=sessionStorage.getItem('activeAdminRole');
      const activeRole=requested&&roleNames.includes(requested)?requested:(stored&&roleNames.includes(stored)?stored:roleNames[0]);
      sessionStorage.setItem('activeAdminRole',activeRole);
      const permissions=new Set();
      if(activeRole==='super_admin') permissions.add('*');
      else for(const page of Object.keys(RULES)) for(const permission of RULES[page]){
        const {data,error}=await client.rpc('has_admin_role_permission',{p_role:activeRole,p_permission:permission});
        if(!error&&data===true)permissions.add(permission);
      }
      const allowed=new Set(Object.keys(RULES).filter(page=>permissions.has('*')||(page==='dashboard'?permissions.has('dashboard.view'):(RULES[page]||[]).some(p=>permissions.has(p)))));
      document.documentElement.dataset.roles=roleNames.join(',');
      document.documentElement.dataset.activeRole=activeRole;
      window.__adminRoles=roleNames;window.__adminPermissions=permissions;window.__adminAllowedPages=allowed;
      document.querySelectorAll('[data-page]').forEach(el=>{if(!allowed.has(el.dataset.page)){el.style.display='none';el.setAttribute('aria-hidden','true');el.dataset.roleHidden='1';}});
      document.querySelectorAll('.group').forEach(group=>{const visible=[...group.querySelectorAll('[data-page]')].some(x=>x.dataset.roleHidden!=='1'&&getComputedStyle(x).display!=='none');if(!visible)group.style.display='none';});
      document.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',e=>{if(!allowed.has(el.dataset.page)){e.preventDefault();e.stopImmediatePropagation();const n=document.getElementById('notice');if(n){n.textContent='این بخش برای نقش فعلی شما مجاز نیست.';n.className='notice err';n.style.display='block';}}},true));
      document.querySelectorAll('button').forEach(b=>{if(b.textContent.includes('تعیین تاریخ و ساعت نوبت')&&!allowed.has('appointments'))b.style.display='none';});
      const title=document.getElementById('title');
      if(title){const labels={super_admin:'مدیر ارشد',finance_manager:'مدیر مالی',consultant_manager:'مدیر مشاوران',appointment_manager:'مدیر نوبت‌ها',content_manager:'مدیر محتوا'};title.textContent=labels[activeRole]||'پنل مدیریت';}
    }catch(e){console.error('role access',e);goLogin();}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
