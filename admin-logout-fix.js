/* Centralized logout: every panel exit ends the local Supabase session and returns to the main user login. */
(function () {
  const SUPABASE_URL = 'https://aserkyiwwyggtixckjsv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  let handled = false;

  function load(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function isLogoutTarget(el) {
    if (!el) return false;
    const node = el.closest('button,a,[role="button"]');
    if (!node) return false;
    const id = (node.id || '').toLowerCase();
    const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (/^(logout|signout|exit|خروج|بستن پنل|خروج از پنل)$/i.test(text)) return true;
    return ['logoutbtn','logout','logoutbutton','logout-btn','logoutbtnmobile'].includes(id);
  }

  async function logout(event) {
    if (handled) return;
    if (!isLogoutTarget(event?.target)) return;
    handled = true;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    try {
      sessionStorage.removeItem('activeAdminRole');
      sessionStorage.removeItem('logoutInProgress');
      if (!window.supabase) await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      await client.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.warn('logout cleanup', e);
    } finally {
      // Main public page; homepage-role-login opens the initial user login dialog.
      window.location.replace('/?login=1');
    }
  }

  document.addEventListener('click', logout, true);
  document.addEventListener('submit', function (event) {
    if (isLogoutTarget(event?.submitter)) logout(event);
  }, true);
})();
