(()=>{
'use strict';
const URL='https://aserkyiwwyggtixckjsv.supabase.co';
const KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
let db=null;
const selectedSlots=new Set();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function client(){return db||(db=window.supabase?.createClient?window.supabase.createClient(URL,KEY):null)}
function say(t,ok=false){const msg=document.getElementById('bookMsgV2')||document.getElementById('bookMsg');if(msg){msg.className='msg '+(ok?'ok':'err');msg.textContent=t}}
function syncFromDom(){document.querySelectorAll('.booking-v2-root input.time-checkbox-v2[type="checkbox"], .booking-v2-root .session-v2 input[type="checkbox"]').forEach(i=>{i.checked?selectedSlots.add(i.value):selectedSlots.delete(i.value)})}
function renderAction(){
 const host=document.getElementById('selectedSessionsV2'); if(!host)return;
 let box=document.getElementById('multiBookingAction');
 if(!box){box=document.createElement('div');box.id='multiBookingAction';box.style.cssText='margin-top:14px;padding:14px;border:1px solid #c7d2fe;border-radius:14px;background:#f8faff';host.parentElement?.insertBefore(box,host.nextSibling)||host.appendChild(box)}
 const n=selectedSlots.size;
 box.innerHTML='<button type="button" id="multiBookBtn" class="btn" style="width:100%;font-size:16px;padding:13px" '+(n?'':'disabled')+'>رزرو و ادامه'+(n?' ('+n.toLocaleString('fa-IR')+' نوبت)':'')+'</button>';
 document.getElementById('multiBookBtn').onclick=submit;
}
async function submit(){
 const c=client(); if(!c){say('سیستم رزرو آماده نیست.');return}
 syncFromDom();
 const slotIds=[...selectedSlots];
 const serviceId=window.selectedServiceId||document.getElementById('consultant')?.dataset?.serviceId||null;
 const consultantId=document.getElementById('consultantV2')?.value||document.getElementById('consultant')?.value||null;
 if(!serviceId||!consultantId||!slotIds.length){say('لطفاً خدمت، مشاور و حداقل یک نوبت را انتخاب کنید.');return}
 const {data:{user}}=await c.auth.getUser();
 if(!user){say('ابتدا وارد حساب کاربری شوید.');document.getElementById('bookingLogin')?.click();return}
 const btn=document.getElementById('multiBookBtn');if(btn){btn.disabled=true;btn.textContent='در حال ثبت سفارش…'}
 const reason=document.getElementById('clientReason')?.value||'';
 const notes=document.getElementById('notes')?.value||'';
 const supportReferralCode=document.getElementById('supportReferralCode')?.value?.trim()||null;
 try{
   const {data,error}=await c.rpc('create_multi_session_booking',{p_service_id:serviceId,p_consultant_id:consultantId,p_slot_ids:slotIds,p_client_reason:reason,p_notes:notes,p_support_referral_code:supportReferralCode});
   if(error)throw error;
   const row=Array.isArray(data)?data[0]:data;
   const orderId=row?.booking_order_id||row?.order_id||row?.id;
   if(!orderId)throw new Error('شناسه سفارش دریافت نشد.');
   say('نوبت‌ها با موفقیت برای پرداخت آماده شدند.',true);
   window.location.assign('/order-review.html?order_id='+encodeURIComponent(orderId));
 }catch(err){say(err?.message||'ثبت سفارش انجام نشد.');if(btn){btn.disabled=false;btn.textContent='رزرو و ادامه'}}
}
function install(){
 if(window.__multiBookingStage11)return; window.__multiBookingStage11=true;
 document.addEventListener('change',e=>{
   const i=e.target;
   if(i.matches('.booking-v2-root input.time-checkbox-v2[type="checkbox"], .booking-v2-root .session-v2 input[type="checkbox"]')){
     i.checked?selectedSlots.add(i.value):selectedSlots.delete(i.value);renderAction();
   }
 });
 const mo=new MutationObserver(()=>{syncFromDom();renderAction()});
 mo.observe(document.body,{childList:true,subtree:true});
 setInterval(()=>{syncFromDom();renderAction()},700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
