(()=>{
'use strict';
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const wait=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const faDate=v=>{try{return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Tehran'}).format(new Date(v))}catch{return String(v||'—')}};
wait(async()=>{
 if(location.pathname!=='/'&&location.pathname!=='/index.html')return;
 const db=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;if(!db)return;
 let timer=null;
 async function load(){
  const {data:{user}}=await db.auth.getUser(); if(!user)return;
  const r=await db.from('appointments').select('id,scheduled_at,status,payment_status,consultant_id,service_id,booking_order_id').eq('user_id',user.id).order('scheduled_at',{ascending:false}).limit(30);if(r.error)return;
  const rows=r.data||[];
  const host=document.getElementById('myAppointmentsList');if(!host)return;
  const now=Date.now();
  host.querySelectorAll('[data-consultant-call]').forEach(b=>b.remove());
  const html=rows.map(x=>{
   const start=new Date(x.scheduled_at).getTime();
   const active=x.status==='confirmed'&&x.payment_status==='paid'&&now>=start;
   const future=x.status==='confirmed'&&x.payment_status==='paid'&&now<start;
   const ended=x.status==='completed'||(x.status!=='cancelled'&&now>=start+60*60*1000);
   let call='';
   if(active&&!ended) call=`<button class="btn" data-consultant-call="${esc(x.id)}" style="margin-top:10px;background:#16803c;color:#fff">📞 تماس با مشاور</button><div id="callmsg-${esc(x.id)}" class="muted" style="margin-top:7px"></div>`;
   else if(future) call=`<div class="muted" style="margin-top:8px">🔒 تماس در زمان شروع نوبت فعال می‌شود.</div>`;
   else if(ended) call=`<div class="muted" style="margin-top:8px">⛔ زمان تماس این نوبت به پایان رسیده است.</div>`;
   return `<div style="margin-top:10px">${call}</div>`;
  }).join('');
  const marker='[data-consultant-call]';
  host.querySelectorAll(marker).forEach(b=>b.closest('div[style*="margin-top:10px"]')?.remove());
  host.insertAdjacentHTML('beforeend',html);
  host.querySelectorAll(marker).forEach(btn=>btn.addEventListener('click',async()=>{
   const id=btn.dataset.consultantCall,msg=document.getElementById('callmsg-'+id);btn.disabled=true;btn.textContent='در حال آماده‌سازی تماس…';
   try{
    const {data,error}=await db.rpc('request_my_consultant_direct_call',{p_appointment_id:id});
    if(error)throw error;
    const phone=typeof data==='string'?data:data?.phone;
    if(!phone)throw new Error('شماره تماس مشاور در حساب مرکز ثبت نشده است.');
    const tel=String(phone).replace(/[^+\d]/g,'');
    if(!tel)throw new Error('شماره تماس مشاور معتبر نیست.');
    btn.textContent='📞 در حال برقراری تماس…';
    window.location.href='tel:'+tel;
   }catch(e){if(msg)msg.textContent='❌ '+(e.message||'برقراری تماس امکان‌پذیر نشد.');btn.disabled=false;btn.textContent='📞 تماس با مشاور';}
  }));
 }
 await load();timer=setInterval(load,30000);window.addEventListener('beforeunload',()=>clearInterval(timer));
});
})();
