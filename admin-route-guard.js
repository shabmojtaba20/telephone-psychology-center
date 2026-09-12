/* Admin route guard: verify the authenticated Supabase user and admin role before exposing protected pages. */
(function () {
  const PUBLIC = new Set(['/admin-login.html', '/admin-login']);
  if (PUBLIC.has(window.location.pathname)) return;
  const SUPABASE_URL = 'https://aserkyiwwyggtixckjsv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  function load(src) { return new Promise((ok, bad) => { const s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=bad; document.head.appendChild(s); }); }
  async function guard() {
    try {
      if (!window.supabase) await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data: { user }, error } = await client.auth.getUser();
      if (error || !user) return window.location.replace('/admin-login.html?returnTo=' + encodeURIComponent(location.pathname + location.search));
      const { data: roles, error: roleError } = await client.rpc('admin_get_user_roles', { p_user_id: user.id });
      if (roleError || !roles || !roles.length) { await client.auth.signOut(); return window.location.replace('/admin-login.html?error=no_admin_role'); }
      document.documentElement.dataset.adminAuthorized = 'true';
    } catch (e) { console.error(e); window.location.replace('/admin-login.html?error=auth_check_failed'); }
  }
  guard();
})();
