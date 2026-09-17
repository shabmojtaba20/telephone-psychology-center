(function(){
  function init(){
    const group=[...document.querySelectorAll('.group')].find(g=>g.querySelector('.group-title')?.textContent.includes('مالی'));
    if(!group) return;
    const sub=group.querySelector('.sub');
    if(!sub || sub.querySelector('[data-finance-dedicated]')) return;
    const btn=document.createElement('button');
    btn.type='button';
    btn.dataset.page='finance';
    btn.dataset.financeDedicated='1';
    btn.textContent='💼 پنل اختصاصی مالی';
    btn.title='ورود به پنل حرفه‌ای مالی';
    btn.addEventListener('click',function(e){
      e.preventDefault();
      const role=sessionStorage.getItem('activeAdminRole')||'finance_manager';
      location.href='/admin-v5.html?role='+encodeURIComponent(role)+'&from=management&v='+Date.now();
    });
    sub.insertBefore(btn,sub.firstChild);

    const section=document.getElementById('finance');
    if(section && !section.querySelector('[data-finance-dedicated-card]')){
      const card=document.createElement('div');
      card.className='card';
      card.dataset.financeDedicatedCard='1';
      card.innerHTML='<h2>💼 پنل اختصاصی مالی</h2><p class="muted">مدیریت کامل دریافت‌ها، رسیدهای پرداخت، صورتحساب‌ها، حساب‌های بانکی، درگاه‌ها، هزینه‌ها، سود و زیان و گزارش‌های پیشرفته در پنل تخصصی مالی.</p><button class="btn green" type="button">ورود به پنل اختصاصی مالی</button>';
      card.querySelector('button').addEventListener('click',function(){
        const role=sessionStorage.getItem('activeAdminRole')||'finance_manager';
        location.href='/admin-v5.html?role='+encodeURIComponent(role)+'&from=management&v='+Date.now();
      });
      section.insertBefore(card,section.firstChild);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
