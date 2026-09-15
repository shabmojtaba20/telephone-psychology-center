(() => {
  'use strict';
  const path = window.location.pathname.toLowerCase();
  const publicPaths = new Set(['/', '/index.html', '/admin-login.html', '/admin-login', '/customer-login.html', '/customer-login']);
  const protectedExact = new Set([
    '/admin.html','/admin-v2.html','/admin-v3.html','/admin-v4.html','/admin-v5.html','/admin-professional.html','/admin-invoices.html',
    '/consultant-panel.html','/consultant-panel-professional.html','/consultant-settlements.html','/finance-audit.html','/finance-reports.html',
    '/order-review.html','/payment.html','/card-payment.html','/submit-receipt.html'
  ]);
  const protectedPrefixes = ['/admin/','/consultant/','/finance/'];
  if (publicPaths.has(path) || !(protectedExact.has(path) || protectedPrefixes.some(p => path.startsWith(p)))) return;

  const SB_URL = 'https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY = 'sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const ADMIN_ROLES = new Set(['super_admin','finance_manager','consultant_manager','appointment_manager','content_manager']);
  const ADMIN_PATHS = new Set(['/admin.html','/admin-v2.html','/admin-v3.html','/admin-v4.html','/admin-professional.html','/admin-invoices.html']);
  const FINANCE_PATHS = new Set(['/admin-v5.html','/finance-audit.html','/finance-reports.html']);
  const CONSULTANT_PATHS = new Set(['/consultant-panel.html','/consultant-panel-professional.html','/consultant-settlements.html']);

  const target = window.location.pathname + window.location.search + window.location.hash;
  const goLogin = () => window.location.replace('/?login=1&returnTo=' + encodeURIComponent(target));
  const goRoleHome = (route, role) => window.location.replace(route + '?role=' + encodeURIComponent(role) + '&v=' + Date.now());

  async function loadSupabase() {
    if (window.supabase?.createClient) return;
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function guard() {
    try {
      await loadSupabase();
      const client = window.supabase.createClient(SB_URL, SB_KEY);
      window.supabaseClient = window.supabaseClient || client;
      const { data: { user }, error } = await client.auth.getUser();
      if (error || !user) return goLogin();

      const { data: roles } = await client.rpc('admin_get_user_roles', { p_user_id: user.id });
      const roleNames = [...new Set((roles || []).map(r => r.name).filter(Boolean))];
      const adminRoles = roleNames.filter(r => ADMIN_ROLES.has(r));
      let consultantLinked = false;
      try {
        const { data: link } = await client.from('consultant_user_links').select('consultant_id').eq('user_id', user.id).maybeSingle();
        consultantLinked = !!link?.consultant_id;
      } catch (_) {}

      if (path === '/consultant-panel.html' || path === '/consultant-panel-professional.html') {
        if (!consultantLinked && !roleNames.includes('super_admin') && !roleNames.includes('consultant_manager')) return goRoleHome('/admin-professional.html','appointment_manager');
      } else if (CONSULTANT_PATHS.has(path) || path.startsWith('/consultant/')) {
        if (!consultantLinked && !roleNames.includes('super_admin') && !roleNames.includes('consultant_manager')) return goRoleHome('/admin-professional.html','appointment_manager');
      }

      if (FINANCE_PATHS.has(path) || path.startsWith('/finance/')) {
        if (!roleNames.includes('super_admin') && !roleNames.includes('finance_manager')) return adminRoles.length ? goRoleHome('/admin-professional.html', adminRoles[0]) : (consultantLinked ? goRoleHome('/consultant-panel-professional.html','consultant') : goLogin());
      }

      if (ADMIN_PATHS.has(path) || path.startsWith('/admin/')) {
        if (!adminRoles.length) return consultantLinked ? goRoleHome('/consultant-panel-professional.html','consultant') : goRoleHome('/', 'customer');
      }

      document.documentElement.dataset.panelAuthenticated = 'true';
      document.documentElement.dataset.panelAuthChecking = 'false';
      document.documentElement.dataset.adminRoles = roleNames.join(',');
      document.documentElement.dataset.activeRole = sessionStorage.getItem('activeAdminRole') || adminRoles[0] || (consultantLinked ? 'consultant' : 'customer');
    } catch (e) {
      console.error('panel auth guard', e);
      goLogin();
    }
  }

  document.documentElement.dataset.panelAuthChecking = 'true';
  guard();
})();
