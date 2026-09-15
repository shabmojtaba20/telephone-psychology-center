(function(){
  'use strict';
  const UNPAID=['پرداخت نشده','در انتظار پرداخت','پرداخت ناموفق','لغو شده'];
  function apply(){
    const host=document.getElementById('appointmentList');
    if(!host) return;
    host.querySelectorAll('.appointment').forEach(card=>{
      const text=(card.textContent||'').replace(/\s+/g,' ').trim();
      const unpaid=UNPAID.some(x=>text.includes(x));
      if(unpaid){
        card.style.display='none';
        card.setAttribute('data-payment-hidden','1');
        return;
      }
      if(card.getAttribute('data-payment-hidden')==='1'){
        card.style.display='';
        card.removeAttribute('data-payment-hidden');
      }
      if(text.includes('پرداخت شده') && !card.querySelector('[data-paid-badge]')){
        const actions=card.querySelector('.actions') || card.querySelector('.appointment-head') || card;
        const b=document.createElement('button');
        b.type='button';
        b.textContent='✓ پرداخت شده';
        b.setAttribute('data-paid-badge','1');
        b.style.cssText='border:0;border-radius:10px;padding:8px 13px;background:#16a34a;color:#fff;font:inherit;font-weight:800;cursor:default;box-shadow:0 5px 12px rgba(22,163,74,.18);';
        actions.appendChild(b);
      }
    });
  }
  let timer=null;
  function start(){
    apply();
    clearInterval(timer);
    timer=setInterval(apply,1000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
