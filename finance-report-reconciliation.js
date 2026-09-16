(function(){
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const db=window.supabase?.createClient?.(SB_URL,SB_KEY); if(!db)return;
const $=id=>document.getElementById(id);
const money=n=>Number(n||0).toLocaleString('fa-IR');
function init(){
 if(location.pathname!='/finance-reports.html'||$('financeReconciliation'))return;
 const anchor=document.querySelector('#advancedFinance')||document.querySelector('.wrap'); if(!anchor)return;
 const box=document.createElement('section'); box.id='financeReconciliation'; box.className='card';
 box.innerHTML='<h2>🔎 تطبیق و کنترل مالی</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px"><div>درآمد گزارش<b id="frIncome">۰</b></div><div>هزینه‌ها<b id="frExpense">۰</b></div><div>تسویه مشاوران<b id="frConsultant">۰</b></div><div>سود نهایی<b id="frNet">۰</b></div></div><p id="frStatus" style="margin-top:12px">برای بررسی تطبیق، روی دکمه زیر بزنید.</p><button id="frCheck" class="af-btn">🔄 بررسی تطبیق</button>';
 anchor.appendChild(box); $('frCheck').onclick=run; run();
}
async function run(){
 const r=await db.rpc('get_advanced_finance_report',{p_from:null,p_to:null,p_consultant_id:null,p_service_id:null,p_gateway:null});
 if(r.error){$('frStatus').textContent='خطا در تطبیق: '+r.error.message;return;}
 const d=r.data||{}; $('frIncome').textContent=money(d.income)+' تومان'; $('frExpense').textContent=money(d.expenses)+' تومان'; $('frConsultant').textContent=money(d.consultant_paid)+' تومان'; $('frNet').textContent=money(d.net_profit)+' تومان'; $('frStatus').textContent='✓ گزارش مالی از تراکنش‌های تأییدشده، هزینه‌ها و تسویه‌های پرداخت‌شده تشکیل شده است.';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,500),{once:true});else setTimeout(init,500);
})();
