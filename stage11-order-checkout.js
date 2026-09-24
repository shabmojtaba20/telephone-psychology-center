(() => {
'use strict';
const URL='https://aserkyiwwyggtixckjsv.supabase.co';
const KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
let clientPromise;
const client=()=>clientPromise||(clientPromise=import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm').then(({createClient})=>createClient(URL,KEY)));
const q=id=>document.getElementById(id);
function selected(){return [...document.querySelectorAll('#availableTimes .time-btn.selected')].map(x=>x.dataset.slot).filter(Boolean)}
function render(){
  const host=q('availableTimes'); if(!host)return;
  let box=q('multiBookingAction');
  if(!box){box=document.createElement('div');box.id='multiBookingAction';box.style.cssText='margin-top:14px;padding:14px;border:1px solid #c7d2fe;border-radius:14px;background:#f8faff';host.parentNode?.insertBefore(box,host.nextSibling);}
  const n=selected().length;
  box.innerHTML='<div style="font-weight:800;margin-bottom:8px">'+(n?'تعداد نوبت‌های انتخاب‌شده: '+n.toLocaleString('fa-IR'):'نوبت موردنظر را انتخاب کنید')+'</div><button type="button" id="multiBookBtn" class="btn" style="width:100%;font-size:16px;padding:13px" '+(n?'':'disabled')+'>رزرو و ادامه'+(n?' ('+n.toLocaleString('fa-IR')+' نوبت)':'')+'</button>';
  q('multiBookBtn').onclick=submit;
}
async function submit(){
  const slots=selected(),serviceId=window.selectedServiceId,consultantId=q('consultant')?.value;
  const msg=q('bookMsg');
  if(!serviceId||!consultantId||!slots.length){if(msg){msg.className='msg err';msg.textContent='لطفاً خدمت، مشاور و حداقل یک نوبت را انتخاب کنید.'}return}
  const sb=await client(); const {data:{user}}=await sb.auth.getUser();
  if(!user){if(msg){msg.className='msg err';msg.textContent='ابتدا وارد حساب کاربری شوید.'}q('bookingLogin')?.click();return}
  const btn=q('multiBookBtn');btn.disabled=true;btn.textContent='در حال ثبت سفارش…';
  try{
    const {data,error}=await sb.rpc('create_multi_session_booking',{p_service_id:serviceId,p_consultant_id:consultantId,p_slot_ids:slots,p_client_reason:q('clientReason')?.value||'',p_notes:q('notes')?.value||'',p_support_referral_code:q('supportReferralCode')?.value?.trim()||null});
    if(error)throw error;
    const row=Array.isArray(data)?data[0]:data; const orderId=row?.booking_order_id||row?.order_id||row?.id;
    if(!orderId)throw new Error('شناسه سفارش دریافت نشد.');
    if(msg){msg.className='msg ok';msg.textContent='نوبت‌ها با موفقیت ثبت و برای پرداخت آماده شدند.'}
    location.assign('/order-review.html?order_id='+encodeURIComponent(orderId));
  }catch(e){if(msg){msg.className='msg err';msg.textContent=e?.message||'ثبت سفارش انجام نشد.'}btn.disabled=false;btn.textContent='رزرو و ادامه'}
}
function init(){
  if(window.__legacyCheckoutInstalled)return;window.__legacyCheckoutInstalled=true;
  document.addEventListener('legacyBookingSelectionChanged',render);
  const mo=new MutationObserver(render);mo.observe(document.body,{childList:true,subtree:true});
  setInterval(render,500);render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
