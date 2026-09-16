(function(){
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const db=supabase.createClient(SB_URL,SB_KEY),$=id=>document.getElementById(id),money=n=>Number(n||0).toLocaleString('fa-IR');
async function load(){
 const {data:session}=await db.auth.getSession(); if(!session.session)return;
 const p={p_from:null,p_to:null,p_consultant_id:null,p_service_id:null,p_gateway:null};
 const r=await db.rpc('get_advanced_finance_report',p); if(r.error)return console.error(r.error);
 const d=r.data||{};
 const income=Number(d.income||0), consultant=Number(d.consultant_paid||0), expenses=Number(d.expenses||0), net=Number(d.net_profit||0);
 const reconciliation={income,consultant_paid:consultant,expenses,net,center_after_consultant:income-consultant,unreconciled:(income-consultant-expenses)-net};
 const box=document.createElement('section');box.className='card';box.id='financeReconciliation';box.innerHTML=`<h2>🔎 تطبیق مالی</h2><p>کنترل ارتباط درآمد تأییدشده، هزینه‌ها و تسویه مشاوران</p><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px"><div>درآمد تأییدشده<br><b>${money(income)} تومان</b></div><div>تسویه مشاوران<br><b>${money(consultant)} تومان</b></div><div>هزینه‌ها<br><b>${money(expenses)} تومان</b></div><div>مانده مرکز<br><b>${money(income-consultant-expenses)} تومان</b></div></div><hr><div>کنترل اختلاف محاسبات: <b>${money(reconciliation.unreconciled)} تومان</b></div>`;
 const anchor=document.querySelector('.wrap');if(anchor&&!$('financeReconciliation'))anchor.appendChild(box);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
