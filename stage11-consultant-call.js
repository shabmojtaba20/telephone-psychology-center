(()=>{
'use strict';
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const wait=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
wait(async()=>{
 if(location.pathname!=='/'&&location.pathname!=='/index.html')return;
 const db=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;if(!db)return;
 const render=()=>{
   document.querySelectorAll('#myAppointmentsList [data-appointment-id]').forEach(card=>{
     const slot=card.querySelector('.stage11-call-slot');if(!slot)return;
     const id=card.dataset.appointmentId,start=new Date(card.dataset.scheduledAt||'').getTime();
     const status=card.dataset.appointmentStatus,pay=card.dataset.paymentStatus,now=Date.now();
     const active=status==='confirmed'&&pay==='paid'&&now>=start&&now<start+60*60*1000;
     const future=status==='confirmed'&&pay==='paid'&&now<start;
     const ended=status==='completed'||(status!=='cancelled'&&now>=start+60*60*1000);
     const existing=slot.querySelector('[data-consultant-call]');
     if(existing&&active)return;
     if(existing)existing.remove();
     slot.innerHTML='';
     if(active){
       slot.innerHTML=`<button class="btn" data-consultant-call="${esc(id)}" style="margin-top:10px;background:#16803c;color:#fff">📞 تماس با مشاور</button><div id="callmsg-${esc(id)}" class="muted" style="margin-top:7px"></div>`;
       slot.querySelector('[data-consultant-call]').addEventListener('click',async e=>{
         const btn=e.currentTarget,msg=document.getElementById('callmsg-'+id);btn.disabled=true;btn.textContent='در حال آماده‌سازی تماس…';
         try{
           const {data,error}=await db.rpc('request_my_consultant_direct_call',{p_appointment_id:id});
           if(error)throw error;
           const phone=typeof data==='string'?data:data?.phone;
           if(!phone)throw new Error('شماره تماس مشاور در حساب مرکز ثبت نشده است.');
           const tel=String(phone).replace(/[^+\d]/g,'');
           if(!tel)throw new Error('شماره تماس مشاور معتبر نیست.');
           btn.textContent='📞 در حال برقراری تماس…';
           window.location.href='tel:'+tel;
         }catch(err){
           if(msg)msg.textContent='❌ '+(err.message||'برقراری تماس امکان‌پذیر نشد.');
           btn.disabled=false;btn.textContent='📞 تماس با مشاور';
         }
       });
     }else if(future){
       slot.innerHTML='<div class="muted" style="margin-top:8px">🔒 تماس در زمان شروع نوبت فعال می‌شود.</div>';
     }else if(ended){
       slot.innerHTML='<div class="muted" style="margin-top:8px">⛔ زمان تماس این نوبت به پایان رسیده است.</div>';
     }
   });
 };
 const {data:{user}}=await db.auth.getUser();if(!user)return;
 render();
 const timer=setInterval(render,15000);
 db.auth.onAuthStateChange(()=>setTimeout(render,250));
 window.addEventListener('beforeunload',()=>clearInterval(timer));
});
})();
