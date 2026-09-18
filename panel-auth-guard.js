(() => {
  'use strict';
  const path = window.location.pathname.toLowerCase();
  const protectedExact = new Set([
    '/admin.html','/admin-v2.html','/admin-v3.html','/admin-v4.html','/admin-v5.html','/admin-professional.html','/admin-invoices.html',
    '/consultant-panel.html','/consultant-panel-professional.html','/consultant-settlements.html','/finance-audit.html','/finance-reports.html',
    '/education-dashboard.html','/education-dashboard/','/education-dashboard', '/order-review.html','/payment.html','/card-payment.html','/submit-receipt.html'
  ]);
  const protectedPrefixes = ['/admin/','/consultant/','/finance/'];
  if (!(protectedExact.has(path) || protectedPrefixes.some(p => path.startsWith(p)))) return;

  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const ADMIN_ROLES=new Set(['super_admin','finance_manager','consultant_manager','appointment_manager','content_manager']);
  const ADMIN_PATHS=new Set(['/admin.html','/admin-v2.html','/admin-v3.html','/admin-v4.html','/admin-professional.html','/admin-invoices.html']);
  const FINANCE_PATHS=new Set(['/admin-v5.html','/finance-audit.html','/finance-reports.html']);
  const CONSULTANT_PATHS=new Set(['/consultant-panel.html','/consultant-panel-professional.html','/consultant-settlements.html']);
  const EDUCATION_PATHS=new Set(['/education-dashboard.html','/education-dashboard','/education-dashboard/']);
  const CUSTOMER_PATHS=new Set(['/order-review.html','/payment.html','/card-payment.html','/submit-receipt.html']);
  const target=window.location.pathname+window.location.search+window.location.hash;
  const login=()=>window.location.replace('/?login=1&returnTo='+encodeURIComponent(target));
  const roleRoute=(role)=>{
    if(role==='super_admin')return '/admin-professional.html';
    if(role==='finance_manager')return '/admin-v5.html';
    if(ADMIN_ROLES.has(role))return '/admin-professional.html';
    if(role==='consultant')return '/consultant-panel-professional.html';
    return null;
  };
  const go=(route,role)=>window.location.replace(route+'?role='+encodeURIComponent(role)+'&v='+Date.now());
  async function load(){
    if(window.supabase?.createClient)return window.supabase.createClient(SB_URL,SB_KEY);
    const mod=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    return mod.createClient(SB_URL,SB_KEY);
  }
  async function guard(){
    try{
      const client=await load();
      window.supabaseClient=window.supabaseClient||client;
      const {data:{user},error}=await client.auth.getUser();
      if(error||!user)return login();
      const {data:roles}=await client.rpc('admin_get_user_roles',{p_user_id:user.id});
      const roleNames=[...new Set((roles||[]).map(r=>r.name).filter(Boolean))];
      const adminRoles=roleNames.filter(r=>ADMIN_ROLES.has(r));
      let consultantLinked=false;
      try{
        const {data:link}=await client.from('consultant_user_links').select('consultant_id').eq('user_id',user.id).maybeSingle();
        consultantLinked=!!link?.consultant_id;
      }catch(_){ }
      if(consultantLinked)roleNames.push('consultant');

      if(EDUCATION_PATHS.has(path)){
        if(roleNames.includes('super_admin')||roleNames.includes('content_manager')){
          document.documentElement.dataset.panelAuthenticated='true';
          document.documentElement.dataset.panelAuthChecking='false';
          document.documentElement.dataset.adminRoles=roleNames.join(',');
          document.documentElement.dataset.activeRole=sessionStorage.getItem('activeAdminRole')||'content_manager';
          return;
        }
        if(adminRoles.length){go(roleRoute(adminRoles[0]),adminRoles[0]);return;}
        return login();
      }
      if(CUSTOMER_PATHS.has(path)){
        document.documentElement.dataset.panelAuthenticated='true';
        document.documentElement.dataset.panelAuthChecking='false';
        document.documentElement.dataset.adminRoles=roleNames.join(',');
        document.documentElement.dataset.activeRole='customer';
        return;
      }
      if(CONSULTANT_PATHS.has(path)||path.startsWith('/consultant/')){
        if(consultantLinked||roleNames.includes('super_admin')||roleNames.includes('consultant_manager')){
          document.documentElement.dataset.panelAuthenticated='true';
          document.documentElement.dataset.panelAuthChecking='false';
          document.documentElement.dataset.adminRoles=roleNames.join(',');
          document.documentElement.dataset.activeRole=consultantLinked?'consultant':(sessionStorage.getItem('activeAdminRole')||'super_admin');
          return;
        }
        if(adminRoles.length){go('/admin-professional.html',adminRoles[0]);return;}
        return login();
      }
      if(FINANCE_PATHS.has(path)||path.startsWith('/finance/')){
        if(roleNames.includes('super_admin')||roleNames.includes('finance_manager')){
          document.documentElement.dataset.panelAuthenticated='true';
          document.documentElement.dataset.panelAuthChecking='false';
          document.documentElement.dataset.adminRoles=roleNames.join(',');
          document.documentElement.dataset.activeRole=sessionStorage.getItem('activeAdminRole')||'finance_manager';
          return;
        }
        if(adminRoles.length){go(roleRoute(adminRoles[0]),adminRoles[0]);return;}
        if(consultantLinked){go('/consultant-panel-professional.html','consultant');return;}
        return login();
      }
      if(ADMIN_PATHS.has(path)||path.startsWith('/admin/')){
        if(adminRoles.length){
          const active=sessionStorage.getItem('activeAdminRole');
          const preferred=active&&adminRoles.includes(active)?active:adminRoles[0];
          const expected=roleRoute(preferred);
          if(expected && path!==expected && (path==='/admin.html'||path==='/admin-v2.html'||path==='/admin-v3.html'||path==='/admin-invoices.html'||path==='/admin-v4.html')){
            go(expected,preferred);return;
          }
          document.documentElement.dataset.panelAuthenticated='true';
          document.documentElement.dataset.panelAuthChecking='false';
          document.documentElement.dataset.adminRoles=roleNames.join(',');
          document.documentElement.dataset.activeRole=preferred;
          return;
        }
        if(consultantLinked){go('/consultant-panel-professional.html','consultant');return;}
        return login();
      }
    }catch(e){console.error('panel auth guard',e);login();}
  }
  document.documentElement.dataset.panelAuthChecking='true';
  guard();
})();
