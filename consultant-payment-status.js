(function(){
  'use strict';

  // همه نوبت‌ها باید در «📅 مدیریت نوبت‌ها» قابل مشاهده باشند.
  // این اسکریپت فقط وضعیت پرداخت را مشخص می‌کند و دیگر هیچ نوبتی را مخفی نمی‌کند.
  function apply(){
    const host=document.getElementById('appointmentList');
    if(!host) return;

    host.querySelectorAll('.appointment').forEach(card=>{
      // سازگاری با نسخه‌های قبلی: هر نوبتی که قبلاً توسط این اسکریپت مخفی شده،
      // دوباره به حالت عادی برگردانده شود.
      if(card.getAttribute('data-payment-hidden')==='1'){
        card.style.display='';
        card.removeAttribute('data-payment-hidden');
      }

      const text=(card.textContent||'').replace(/\s+/g,' ').trim();

      if(text.includes('پرداخت شده') && !card.querySelector('[data-paid-badge]')){
        const actions=card.querySelector('.actions') || card.querySelector('.appointment-head') || card;
        const b=document.createElement('span');
        b.type='button';
        b.textContent='✓ پرداخت شده';
        b.setAttribute('data-paid-badge','1');
        b.style.cssText='display:inline-block;border-radius:10px;padding:7px 11px;background:#16a34a;color:#fff;font:inherit;font-weight:800;box-shadow:0 5px 12px rgba(22,163,74,.18);';
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

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();