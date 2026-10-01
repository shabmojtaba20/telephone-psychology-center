(()=>{
'use strict';
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const wait=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
wait(async()=>{
 if(location.pathname!=='/'&&location.pathname!=='/index.html')return;
 const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
 const db=createClient(SB_URL,SB_KEY);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let notified=new Set(),dbAppointments=new Map(),lastFetch=0;
 async function refreshAppointments(){
  if(Date.now()-lastFetch<2500)return;
  lastFetch=Date.now();
  const {data:{user}}=await db.auth.getUser(); if(!user)return;
  const {data,error}=await db.from('appointments').select('id,scheduled_at,status,payment_status').eq('user_id',user.id).order('scheduled_at',{ascending:false}).range(0,99);
  if(!error)dbAppointments=new Map((data||[]).map(x=>[String(x.id),x]));
 }
 const render=async()=>{
  await refreshAppointments();
  document.querySelectorAll('#myAppointmentsList [data-appointment-id]').forEach(card=>{
   let slot=card.querySelector('.stage11-call-slot');
   if(!slot){
    slot=document.createElement('div');
    slot.className='stage11-call-slot';
    const del=card.querySelector('.stage11-delete-slot');
    if(del)card.insertBefore(slot,del);else card.appendChild(slot);
   }
   const id=String(card.dataset.appointmentId||''),row=dbAppointments.get(id);
   const scheduled=row?.scheduled_at||card.dataset.scheduledAt||'',start=new Date(scheduled).getTime(),now=Date.now();
   const status=String(row?.status||card.dataset.appointmentStatus||'').toLowerCase();
   const pay=String(row?.payment_status||card.dataset.paymentStatus||'').toLowerCase();
   const paid=pay==='paid';
   const validDate=Number.isFinite(start);
   const eligible=status==='confirmed'&&paid&&validDate;
   const active=eligible&&now>=start-15*60*1000&&now<start+60*60*1000;
   const future=eligible&&now<start-15*60*1000;
   const ended=eligible&&now>=start+60*60*1000;
   if(active&&!notified.has(id)&&window.callNotifications?.isEnabled?.()){
    notified.add(id);
    window.callNotifications.notify('📞 تماس با مشاور فعال شد','زمان نوبت شما رسیده است. برای ورود به تماس با مشاور، دکمه «تماس با مشاور» را بزنید.',location.origin+'/#myAppointments');
    try{navigator.vibrate?.([400,120,400,120,700])}catch{}
   }
   let stateText='',buttonText='📞 تماس با مشاور',disabled=true,bg='#94a3b8';
   if(!validDate){
    stateText='⚠️ زمان نوبت قابل تشخیص نیست.';
   }else if(status==='cancelled'){
    stateText='⛔ این نوبت لغو شده و امکان تماس ندارد.';
   }else if(status==='completed'){
    stateText='✅ این جلسه قبلاً انجام شده است.';
   }else if(!paid){
    stateText='💳 پس از ثبت پرداخت، امکان تماس فعال خواهد شد.';
   }else if(status!=='confirmed'){
    stateText='🕐 پرداخت ثبت شده؛ تماس پس از تأیید نوبت توسط مرکز فعال می‌شود.';
   }else if(active){
    stateText='🟢 تماس اکنون فعال است';
    disabled=false;
    bg='#16803c';
   }else if(future){
    const d=Math.max(0,start-Date.now()),m=Math.floor(d/60000),s=Math.floor((d%60000)/1000);
    stateText=`🔒 تماس از ۱۵ دقیقه قبل از شروع نوبت فعال می‌شود — ${m} دقیقه و ${s} ثانیه مانده`;
   }else if(ended){
    stateText='⛔ زمان تماس این نوبت به پایان رسیده است.';
   }
   slot.innerHTML=`<div style="margin-top:12px;padding:10px;border-radius:10px;background:#f5faf7;border:1px solid #b7dec5"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button class="btn" data-consultant-call="${esc(id)}" ${disabled?'disabled':''} style="background:${bg};color:#fff">${buttonText}</button><button class="btn" data-consultant-end="${esc(id)}" style="display:none;background:#b42318;color:#fff">⏹ پایان جلسه</button><span data-call-countdown class="muted">${stateText}</span></div><div data-call-status class="muted" style="margin-top:7px"></div></div>`;
   const btn=slot.querySelector('[data-consultant-call]'),endBtn=slot.querySelector('[data-consultant-end]'),msg=slot.querySelector('[data-call-status]');
   if(!disabled){
    btn.addEventListener('click',()=>{if(btn.disabled)return;btn.disabled=true;btn.textContent='در حال ورود به تماس…';location.href='/livekit-call.html?appointment_id='+encodeURIComponent(id)+'&role=client&v=20261001-2';});
   }
   endBtn.addEventListener('click',async()=>{endBtn.disabled=true;try{const {error}=await db.rpc('finish_my_consultant_call',{p_appointment_id:id,p_status:'completed'});if(error)throw error;msg.textContent='✅ جلسه با موفقیت ثبت شد.';setTimeout(render,300);}catch(err){msg.textContent='❌ '+(err.message||'ثبت پایان جلسه انجام نشد.');endBtn.disabled=false;}});
  });
 };
 const {data:{user}}=await db.auth.getUser();if(!user)return;
 render();
 const timer=setInterval(render,1000);
 db.auth.onAuthStateChange(()=>setTimeout(render,250));
 window.addEventListener('appointments:refresh',()=>setTimeout(render,100));
 const observer=new MutationObserver(()=>setTimeout(render,50));
 const watch=()=>{const host=document.getElementById('myAppointmentsList');if(host)observer.observe(host,{childList:true,subtree:true});};
 watch();
 const watchTimer=setInterval(watch,500);
 window.addEventListener('beforeunload',()=>{clearInterval(timer);clearInterval(watchTimer);observer.disconnect()});
});
})();