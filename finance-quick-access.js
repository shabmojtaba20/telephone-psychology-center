(function(){
function add(){
  if(location.pathname!=='/admin-v5.html') return;
  const side=document.querySelector('.side');
  if(side&&!document.getElementById('financeQuickExpenses')){
    const a=document.createElement('a');a.id='financeQuickExpenses';a.href='/finance-expenses.html';a.textContent='💸 مدیریت هزینه‌ها';side.insertBefore(a,side.querySelector('button'));
    const b=document.createElement('a');b.id='financeQuickPL';b.href='/finance-reports.html';b.textContent='📈 سود و زیان مرکز';side.insertBefore(b,side.querySelector('button'));
  }
  const notice=document.getElementById('notice');
  if(notice&&!document.getElementById('financeQuickCard')){
    const card=document.createElement('section');card.id='financeQuickCard';card.className='card';card.innerHTML='<div class="toolbar"><h2 style="margin-left:auto">📌 دسترسی سریع مالی</h2><a class="btn green" href="/finance-expenses.html">💸 مدیریت هزینه‌ها</a><a class="btn" href="/finance-reports.html">📈 سود و زیان و گزارش پیشرفته</a></div><p class="muted">برای تعریف هزینه، ثبت مبلغ و تاریخ و مشاهده محاسبه درآمد منهای هزینه از این بخش‌ها استفاده کنید.</p>';notice.insertAdjacentElement('afterend',card);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add,{once:true});else add();
})();