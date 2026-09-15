/* Compatibility shim: panel-auth-guard.js is the single authentication and panel-routing gate. */
(function(){
  'use strict';
  if(document.documentElement.dataset.panelAuthChecking==='true' || document.documentElement.dataset.panelAuthenticated==='true') return;
})();
