(()=>{
'use strict';
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const wait=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const faDate=v=>{if(!v)return'—';try{return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Tehran'}).format(new Date(v))}catch{return v}};
wait(async()=>{
 if(location.pathname!=='/'&&location.pathname!=='/index.html')return;
 const account=document.getElementById('accountBtn');
 if(!account)return;
 const db=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;
 if(!db)return;
 let section=document.getElementById('myAppointments');
 if(!section){
   section=document.createElement('section');section.id='myAppointments';section.className='section hidden';
   section.innerHTML='<div class="c"><div class="head"><h2>📅 نوبت‌های من</h2><p class="muted">نوبت‌ها، وضعیت پرداخت و زمان مشاوره شما در یکجا.</p></div><div class="panel"><div id="myAppointmentsList" class="grid"></div></div></div>';
   const payment=document.getElementById('payment');payment?.parentNode?.insertBefore(section,payment);
 }
 const nav=document.querySelector('.links');
 if(nav&&!document.getElementById('myAppointmentsNav')){const a=document.createElement('a');a.id='myAppointmentsNav';a.href='#myAppointments';a.textContent='نوبت‌های من';a.style.display='none';nav.insertBefore(a,account)}
 async function load(){
   const {data:{user}}=await db.auth.getUser();
   if(!user){section.classList.add('hidden');const n=document.getElementById('myAppointmentsNav');if(n)n.style.display='none';return}
   section.classList.remove('hidden');const n=document.getElementById('myAppointmentsNav');if(n)n.style.display='inline';
   const host=document.getElementById('myAppointmentsList');
   host.innerHTML='<div class="muted">در حال دریافت نوبت‌های شما…</div>';
   const r=await db.from('appointments').select('id,scheduled_at,status,payment_status,amount,consultant_id,service_id,booking_order_id').eq('user_id',user.id).order('scheduled_at',{ascending:false}).limit(30);
   if(r.error){host.innerHTML='<div class="msg err">دریافت نوبت‌ها انجام نشد. لطفاً دوباره تلاش کنید.</div>';return}
   const rows=r.data||[];
   if(!rows.length){host.innerHTML='<div class="muted">هنوز نوبتی برای شما ثبت نشده است.</div>';return}
   const sids=[...new Set(rows.map(x=>x.service_id).filter(Boolean))],cids=[...new Set(rows.map(x=>x.consultant_id).filter(Boolean))];
   const [sr,cr]=await Promise.all([
     sids.length?db.from('services').select('id,name').in('id',sids):Promise.resolve({data:[]}),
     cids.length?db.from('consultants').select('id,name').in('id',cids):Promise.resolve({data:[]})
   ]);
   const sm=Object.fromEntries((sr.data||[]).map(x=>[x.id,x.name])),cm=Object.fromEntries((cr.data||[]).map(x=>[x.id,x.name]));
   const status={pending:'در انتظار تأیید',confirmed:'تأیید شده',completed:'انجام شده',cancelled:'لغو شده'};
   const pay={unpaid:'پرداخت نشده',pending:'در انتظار پرداخت',paid:'پرداخت شده',failed:'پرداخت ناموفق',cancelled:'لغو شده'};
   host.innerHTML=rows.map(x=>`<article class="card" style="cursor:default"><h3 style="margin-top:0">${esc(sm[x.service_id]||'خدمت مشاوره')}</h3><p class="muted">👨‍⚕️ ${esc(cm[x.consultant_id]||'مشاور مشخص نشده')}</p><p>📅 ${esc(faDate(x.scheduled_at))}</p><div class="row"><span>وضعیت نوبت</span><b>${esc(status[x.status]||x.status||'—')}</b></div><div class="row"><span>وضعیت پرداخت</span><b>${esc(pay[x.payment_status]||x.payment_status||'—')}</b></div><div class="row"><span>مبلغ</span><b>${x.amount==null?'—':Number(x.amount).toLocaleString('fa-IR')+' تومان'}</b></div>${x.payment_status!=='paid'&&x.booking_order_id?`<a class="btn" href="/order-review.html?order_id=${encodeURIComponent(x.booking_order_id)}">بررسی سفارش و پرداخت</a>`:''}</article>`).join('');
 }
 account.addEventListener('click',()=>setTimeout(load,100));
 document.getElementById('bookingLogin')?.addEventListener('click',()=>setTimeout(load,100));
 db.auth.onAuthStateChange(()=>setTimeout(load,150));
 await load();
});
})();
