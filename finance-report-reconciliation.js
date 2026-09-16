(function(){
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const db=window.supabase?.createClient?.(SB_URL,SB_KEY); if(!db)return;
const money=n=>Number(n||0).toLocaleString('fa-IR');
function init(){
 if(location.pathname!='/finance-reports.html'||document.getElementById('financeReconciliation'))return;
 const anchor=document.querySelector('#advancedFinance')||document.querySelector('.wrap'); if(!anchor)return;
 const box=document.createElement('section'); box.id='financeReconciliation'; box.className='card';
 box.innerHTML='<h2>🔎 تطبیق و کنترل مالی</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px"><div>رسیدهای تأییدشده<b id="frIncome">۰</b></div><div>تراکنش‌های مالی<b id="frTx">۰</b></div><div>رسید بدون تراکنش<b id="frUnlinked">۰</b></div><div>اختلاف مبلغ<b id="frMismatch">۰</b></div></div><p id="frStatus" style="margin-top:12px">در حال بررسی...</p><button id="frCheck" class="af-btn">🔄 بررسی مجدد</button>';
 anchor.appendChild(box); document.getElementById('frCheck').onclick=run;
 setTimeout(run,700);
}
function params(){return{
 p_from:document.getElementById('afFrom')?.value?new Date(document.getElementById('afFrom').value+'T00:00:00').toISOString():null,
 p_to:document.getElementById('afTo')?.value?new Date(document.getElementById('afTo').value+'T23:59:59.999').toISOString():null,
 p_consultant_id:document.getElementById('afConsultant')?.value||null,
 p_service_id:document.getElementById('afService')?.value||null,
 p_gateway:document.getElementById('afGateway')?.value||null
}}
async function run(){
 const r=await db.rpc('get_finance_reconciliation',params());
 if(r.error){document.getElementById('frStatus').textContent='خطا در تطبیق: '+r.error.message;return;}
 const d=r.data||{};
 document.getElementById('frIncome').textContent=money(d.approved_receipts)+' تومان';
 document.getElementById('frTx').textContent=money(d.verified_transactions)+' تومان';
 document.getElementById('frUnlinked').textContent=money(d.approved_without_transaction)+' تومان';
 document.getElementById('frMismatch').textContent=money(d.receipt_transaction_amount_mismatch)+' تومان';
 const warning=d.status!=='balanced'||Number(d.approved_without_transaction||0)>0||Number(d.receipt_transaction_amount_mismatch||0)>0;
 document.getElementById('frStatus').textContent=warning?'⚠️ مغایرت مالی شناسایی شد؛ موارد بدون تراکنش یا اختلاف مبلغ باید بررسی شوند.':'✅ تطبیق مالی بدون مغایرت ثبت‌شده است.';
}
function watchFilters(){['afFrom','afTo','afConsultant','afService','afGateway'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(run,50)));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{init();watchFilters()},600),{once:true});else setTimeout(()=>{init();watchFilters()},600);
})();