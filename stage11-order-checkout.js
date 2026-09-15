(()=>{
'use strict';
const URL='https://aserkyiwwyggtixckjsv.supabase.co';
const KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const start=()=>{
  if(!window.supabase?.createClient)return;
  const db=window.supabase.createClient(URL,KEY);
  const btn=document.getElementById('bookBtn');
  if(!btn||btn.dataset.stage11Order==='1')return;
  btn.dataset.stage11Order='1';
  btn.addEventListener('click',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    const {data:{user}}=await db.auth.getUser();
    const msg=document.getElementById('bookMsg');
    const say=(t,ok=false)=>{if(msg){msg.className='msg '+(ok?'ok':'err');msg.textContent=t;}};
    if(!user){say('ابتدا وارد حساب کاربری شوید.');return;}
    const service=document.getElementById('consultant')?.dataset?.serviceId||window.selectedServiceId;
    const serviceId=service||document.querySelector('#servicesList .card.selected')?.dataset?.id;
    const consultantId=document.getElementById('consultant')?.value;
    const slotId=document.getElementById('slot')?.value;
    const reason=document.getElementById('clientReason')?.value||'';
    const notes=document.getElementById('notes')?.value||'';
    if(!serviceId||!consultantId||!slotId){say('لطفاً خدمت، مشاور و نوبت را کامل انتخاب کنید.');return;}
    btn.disabled=true;const old=btn.textContent;btn.textContent='در حال ثبت سفارش…';
    try{
      const {data,error}=await db.rpc('create_multi_session_booking',{p_service_id:serviceId,p_consultant_id:consultantId,p_slot_ids:[slotId],p_client_reason:reason,p_notes:notes});
      if(error)throw error;
      const row=Array.isArray(data)?data[0]:data;
      const orderId=row?.booking_order_id||row?.order_id||row?.id;
      if(!orderId)throw new Error('شناسه سفارش دریافت نشد.');
      window.location.assign('/order-review.html?order_id='+encodeURIComponent(orderId));
    }catch(err){say(err?.message||'ثبت سفارش انجام نشد.');btn.disabled=false;btn.textContent=old;}
  },true);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
