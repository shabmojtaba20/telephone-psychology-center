(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const RULES={dashboard:['dashboard.view'],general:['general.manage'],appearance:['appearance.manage'],media:['media.manage'],contact:['contact.manage'],consultants:['consultants.manage'],availability:['availability.manage'],appointments:['appointments.manage'],services:['services.manage'],finance:['finance.view','finance.manage'],bank:['bank.manage'],gateways:['gateways.manage'],messages:['messages.manage'],content:['content.manage'],notifications:['notifications.manage'],security:['security.manage']};
  let db;
  const create=()=>db||(db=window.supabase.createClient(SB_URL,SB_KEY));
  const allowedByPerm=(set,page)=>page==='dashboard'?(set.has('dashboard.view')||set.has('*')):(RULES[page]||[]).some(p=>set.has(p))||set.has('*');
  async function init(){
    try{
      const client=create();
      const {data:{user},error:userError}=await client.auth.getUser();
      if(userError||!user){location.replace('/admin-login.html');return;}
      const {data:roles,error:rolesError}=await client.rpc('admin_get_user_roles',{p_user_id:user.id});
      if(rolesError) throw rolesError;
      if(!roles||!roles.length){await client.auth.signOut();location.replace('/admin-login.html?error=no-role');return;}
      const permissions=new Set(), roleNames=roles.map(r=>r.name).filter(Boolean);
      for(const page of Object.keys(RULES)) for(const permission of RULES[page]){const {data,error}=await client.rpc('has_admin_permission',{p_permission:permission});if(!error&&data===true)permissions.add(permission);}
      if(roleNames.includes('super_admin')) permissions.add('*');
      const allowed=new Set(Object.keys(RULES).filter(page=>allowedByPerm(permissions,page)));
      document.documentElement.dataset.roles=roleNames.join(',');window.__adminRoles=roleNames;window.__adminPermissions=permissions;window.__adminAllowedPages=allowed;
      document.querySelectorAll('[data-page]').forEach(el=>{if(!allowed.has(el.dataset.page)){el.style.display='none';el.setAttribute('aria-hidden','true');el.dataset.roleHidden='1';}});
      document.querySelectorAll('.group').forEach(group=>{const visible=[...group.querySelectorAll('[data-page]')].some(x=>x.dataset.roleHidden!=='1'&&getComputedStyle(x).display!=='none');if(!visible)group.style.display='none';});
      document.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',e=>{if(!allowed.has(el.dataset.page)){e.preventDefault();e.stopImmediatePropagation();const n=document.getElementById('notice');if(n){n.textContent='این بخش برای نقش فعلی شما مجاز نیست.';n.className='notice err';n.style.display='block';}}},true));
      document.querySelectorAll('button').forEach(b=>{if(b.textContent.includes('تعیین تاریخ و ساعت نوبت')&&!allowed.has('appointments'))b.style.display='none';});
      const title=document.getElementById('title');if(title&&!allowed.has('security')){const labels={finance:'مدیر مالی',consultants:'مدیر مشاوران',appointments:'مدیر نوبت‌ها',content:'مدیر محتوا'};const active=[...allowed].filter(x=>labels[x]).map(x=>labels[x]);title.textContent=roleNames.includes('super_admin')?'مدیر ارشد':(active.join('، ')||'پنل مدیریت');}
    }catch(e){console.error('role access',e);location.replace('/admin-login.html?error=role-check');}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
