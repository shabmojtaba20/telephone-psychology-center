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
  if(!box){
    box=document.createElement('div');box.id='multiBookingAction';box.style.cssText='margin-top:14px;padding:14px;border:1px solid #c7d2fe;border-radius:14px;background:#f8faff';
    const status=document.createElement('div');status.id='multiBookingStatus';status.style.cssText='font-weight:800;margin-bottom:8px';
    const btn=document.createElement('button');btn.type='button';btn.id='multiBookBtn';btn.className='btn';btn.style.cssText='width:100%;font-size:16px;padding:13px';btn.textContent='رزرو و ادامه';btn.addEventListener('click',submit);
    box.append(status,btn);host.parentNode?.insertBefore(box,host.nextSibling);
  }
  const n=selected().length;
  const status=q('multiBookingStatus'),btn=q('multiBookBtn');
  if(status)status.textContent=n?'تعداد نوبت‌های انتخاب‌شده: '+n.toLocaleString('fa-IR'):'نوبت موردنظر را انتخاب کنید';
  if(btn&&!btn.dataset.submitting){btn.disabled=!n;btn.textContent='رزرو و ادامه'+(n?' ('+n.toLocaleString('fa-IR')+' نوبت)':'')}
}
async function submit(){
  const btn=q('multiBookBtn');if(btn?.dataset.submitting==='1')return;
  const slots=selected(),serviceId=window.selectedServiceId,consultantId=q('consultant')?.value;
  const msg=q('bookMsg');
  if(!serviceId||!consultantId||!slots.length){if(msg){msg.className='msg err';msg.textContent='لطفاً خدمت، مشاور و حداقل یک نوبت را انتخاب کنید.'}return}
  if(btn){btn.dataset.submitting='1';btn.disabled=true;btn.textContent='در حال بررسی حساب کاربری…'}
  try{
    const sb=await client();
    const {data:{user},error:authError}=await sb.auth.getUser();
    if(authError)throw authError;
    if(!user){if(msg){msg.className='msg err';msg.textContent='ابتدا وارد حساب کاربری شوید.'}if(btn){delete btn.dataset.submitting;btn.disabled=false}q('bookingLogin')?.click();return}
    if(btn)btn.textContent='در حال ثبت سفارش…';
    const {data,error}=await sb.rpc('create_multi_session_booking',{p_service_id:serviceId,p_consultant_id:consultantId,p_slot_ids:slots,p_client_reason:q('clientReason')?.value||'',p_notes:q('notes')?.value||'',p_support_referral_code:q('supportReferralCode')?.value?.trim()||null});
    if(error)throw error;
    const row=Array.isArray(data)?data[0]:data; const orderId=row?.booking_order_id||row?.order_id||row?.id;
    if(!orderId)throw new Error('شناسه سفارش دریافت نشد.');
    if(msg){msg.className='msg ok';msg.textContent='نوبت‌ها با موفقیت ثبت و برای پرداخت آماده شدند.'}
    location.assign('/order-review.html?order_id='+encodeURIComponent(orderId));
  }catch(e){
    if(msg){msg.className='msg err';msg.textContent=e?.message||'ثبت سفارش انجام نشد.'}
    if(btn){delete btn.dataset.submitting;btn.disabled=false;btn.textContent='تلاش دوباره برای رزرو'}
  }
}
function init(){
  if(window.__legacyCheckoutInstalled)return;window.__legacyCheckoutInstalled=true;
  document.addEventListener('legacyBookingSelectionChanged',render);
  const mo=new MutationObserver(()=>{if(!q('multiBookingAction'))render()});
  mo.observe(document.body,{childList:true,subtree:true});
  render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
