(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const ROLE_RULES={
    super_admin:{pages:['dashboard','general','appearance','media','contact','consultants','availability','appointments','services','finance','bank','gateways','messages','content','notifications','security']},
    finance_manager:{pages:['dashboard','finance','bank','gateways']},
    consultant_manager:{pages:['dashboard','consultants','availability']},
    appointment_manager:{pages:['dashboard','appointments']},
    content_manager:{pages:['dashboard','general','appearance','media','contact','content','notifications']}
  };
  async function init(){
    try{
      const db=window.supabase.createClient(SB_URL,SB_KEY);
      const {data:{session}}=await db.auth.getSession();
      if(!session){location.replace('/admin-login.html');return}
      const {data:rows,error}=await db.from('admin_user_roles').select('role_id,admin_roles(name)').eq('user_id',session.user.id);
      if(error) throw error;
      const names=(rows||[]).map(r=>r.admin_roles?.name).filter(Boolean);
      if(!names.length){await db.auth.signOut();location.replace('/admin-login.html?error=no-role');return}
      const allowed=new Set(['dashboard']);
      names.forEach(r=>(ROLE_RULES[r]?.pages||[]).forEach(p=>allowed.add(p)));
      document.documentElement.dataset.roles=names.join(',');
      document.querySelectorAll('[data-page]').forEach(el=>{if(!allowed.has(el.dataset.page))el.style.display='none'});
      document.querySelectorAll('.group').forEach(g=>{if(![...g.querySelectorAll('[data-page]')].some(x=>x.style.display!=='none'))g.style.display='none'});
      window.__adminRoles=names; window.__adminAllowedPages=allowed;
      const title=document.getElementById('title');
      if(title) title.textContent=names.includes('super_admin')?'مدیر ارشد':names.map(r=>({finance_manager:'مدیر مالی',consultant_manager:'مدیر مشاوران',appointment_manager:'مدیر نوبت‌ها',content_manager:'مدیر محتوا'}[r])).filter(Boolean).join('، ')||'پنل مدیریت';
    }catch(e){console.error('role access',e);location.replace('/admin-login.html?error=role-check')}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
