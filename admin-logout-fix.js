/* Centralized logout handler: prevents legacy /admin redirect loops after sign-out. */
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

  async function logout(event) {
    if (handled) return;
    handled = true;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    }
    try {
      sessionStorage.removeItem('activeAdminRole');
      if (!window.supabase) await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      await client.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.warn('logout cleanup', e);
    } finally {
      window.location.replace('/');
    }
  }

  function bind() {
    const selectors = ['#logoutBtn', '#logout', '#logoutButton', '#logout-btn', '#logoutBtnMobile'];
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('click', logout, true);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
