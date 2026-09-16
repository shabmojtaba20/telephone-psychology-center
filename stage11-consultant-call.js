(()=>{
'use strict';
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const wait=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
wait(async()=>{
 if(location.pathname!=='/'&&location.pathname!=='/index.html')return;
 const db=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;if(!db)return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const render=()=>{
  document.querySelectorAll('#myAppointmentsList [data-appointment-id]').forEach(card=>{
   const slot=card.querySelector('.stage11-call-slot');if(!slot)return;
   const id=card.dataset.appointmentId,start=new Date(card.dataset.scheduledAt||'').getTime();
   const status=card.dataset.appointmentStatus,pay=card.dataset.paymentStatus,now=Date.now();
   const eligible=status==='confirmed'&&pay==='paid';
   const active=eligible&&now>=start&&now<start+60*60*1000;
   const future=eligible&&now<start;
   const ended=status==='completed'||(eligible&&now>=start+60*60*1000);
   slot.innerHTML='';
   if(eligible&&!ended){
    slot.innerHTML=`<div style="margin-top:12px;padding:10px;border-radius:10px;background:#f5faf7;border:1px solid #b7dec5"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button class="btn" data-consultant-call="${esc(id)}" ${active?'':'disabled'} style="background:${active?'#16803c':'#94a3b8'};color:#fff">📞 تماس با مشاور</button><button class="btn" data-consultant-end="${esc(id)}" style="display:none;background:#b42318;color:#fff">⏹ پایان جلسه</button><span data-call-countdown class="muted">${future?'🔒 تماس در زمان شروع نوبت فعال می‌شود.':''}</span></div><div data-call-status class="muted" style="margin-top:7px"></div></div>`;
    const btn=slot.querySelector('[data-consultant-call]'),endBtn=slot.querySelector('[data-consultant-end]'),msg=slot.querySelector('[data-call-status]'),count=slot.querySelector('[data-call-countdown]');
    if(future){const d=Math.max(0,start-now);const m=Math.floor(d/60000),s=Math.floor((d%60000)/1000);count.textContent=`🔒 تماس در زمان شروع نوبت فعال می‌شود — ${m} دقیقه و ${s} ثانیه مانده`;}
    btn.addEventListener('click',async()=>{
     if(btn.disabled)return;
     btn.disabled=true;btn.textContent='در حال آماده‌سازی تماس…';
     try{
      const {data,error}=await db.rpc('request_my_consultant_direct_call',{p_appointment_id:id});
      if(error)throw error;
      const phone=typeof data==='string'?data:data?.phone;
      if(!phone)throw new Error('شماره تماس مشاور در حساب مرکز ثبت نشده است.');
      const tel=String(phone).replace(/[^+\d]/g,'');if(!tel)throw new Error('شماره تماس مشاور معتبر نیست.');
      btn.textContent='📞 تماس برقرار شد';endBtn.style.display='inline-block';msg.textContent='جلسه تماس فعال است. پس از پایان مکالمه، «پایان جلسه» را بزنید.';
      window.location.href='tel:'+tel;
     }catch(err){msg.textContent='❌ '+(err.message||'برقراری تماس امکان‌پذیر نشد.');btn.disabled=false;btn.textContent='📞 تماس با مشاور';}
    });
    endBtn.addEventListener('click',async()=>{
     endBtn.disabled=true;endBtn.textContent='در حال ثبت پایان جلسه…';
     try{const {error}=await db.rpc('finish_my_consultant_call',{p_appointment_id:id,p_status:'completed'});if(error)throw error;msg.textContent='✅ جلسه با موفقیت ثبت شد.';endBtn.style.display='none';btn.style.display='none';card.dataset.appointmentStatus='completed';setTimeout(render,300);}
     catch(err){msg.textContent='❌ '+(err.message||'ثبت پایان جلسه انجام نشد.');endBtn.disabled=false;endBtn.textContent='⏹ پایان جلسه';}
    });
   }else if(ended){slot.innerHTML='<div class="muted" style="margin-top:8px">⛔ زمان تماس این نوبت به پایان رسیده است.</div>';
   }
  });
 };
 const {data:{user}}=await db.auth.getUser();if(!user)return;
 render();const timer=setInterval(render,1000);db.auth.onAuthStateChange(()=>setTimeout(render,250));window.addEventListener('beforeunload',()=>clearInterval(timer));
});
})();
