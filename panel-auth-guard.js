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
  const target = window.location.pathname + window.location.search + window.location.hash;
  const goLogin = () => window.location.replace('/?login=1&returnTo=' + encodeURIComponent(target));
  const check = (attempt = 0) => {
    if (window.supabaseClient?.auth?.getSession) {
      window.supabaseClient.auth.getSession().then(({data,error}) => {
        if (error || !data?.session?.user) goLogin();
        else document.documentElement.dataset.panelAuthenticated = 'true';
      }).catch(goLogin);
      return;
    }
    if (attempt < 80) setTimeout(() => check(attempt + 1), 50);
    else goLogin();
  };
  document.documentElement.dataset.panelAuthChecking = 'true';
  check();
})();
