(()=>{
const U='https://aserkyiwwyggtixckjsv.supabase.co',K='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const db=window.supabase?.createClient?window.supabase.createClient(U,K):null;
const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
const money=n=>Number(n||0).toLocaleString('fa-IR')+' تومان';
function install(){
 if(!db||!window.joinWorkshop)return false;
 window.joinWorkshop=async(id)=>{
  const {data:{session}}=await db.auth.getSession();
  if(!session){alert('برای ثبت‌نام باید وارد حساب کاربری شوید.');location.href='/';return;}
  const {data:w,error}=await db.from('workshops').select('id,title,price,access_type,status,max_participants,registration_deadline').eq('id',id).single();
  if(error||!w){alert('کارگاه پیدا نشد.');return;}
  if(!['scheduled','live'].includes(w.status)){alert('این کارگاه در حال حاضر قابل ثبت‌نام نیست.');return;}
  if(w.registration_deadline&&new Date(w.registration_deadline)<new Date()){alert('مهلت ثبت‌نام این کارگاه به پایان رسیده است.');return;}
  if(w.access_type==='paid'&&Number(w.price)<=0){alert('قیمت کارگاه تنظیم نشده است.');return;}
  const existing=document.getElementById('workshopRegistrationForm');if(existing)existing.remove();
  const wrap=document.createElement('div');wrap.id='workshopRegistrationForm';wrap.className='modal';
  wrap.innerHTML=`<div class="modalbox"><div class="modalhead"><h2>📝 ثبت‌نام در ${esc(w.title)}</h2><button class="close" id="wrClose">بستن</button></div><p class="muted">اطلاعات زیر برای ثبت شرکت‌کننده و نتیجه پرداخت استفاده می‌شود.</p><div style="display:grid;gap:10px"><label>نام و نام خانوادگی *<input id="wrName" style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #d9dee8;border-radius:10px;font:inherit" value="${esc(session.user.user_metadata?.full_name||'')}"></label><label>شماره موبایل *<input id="wrMobile" inputmode="tel" style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #d9dee8;border-radius:10px;font:inherit" value="${esc(session.user.user_metadata?.phone||'')}"></label><label>ایمیل<input id="wrEmail" type="email" style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #d9dee8;border-radius:10px;font:inherit" value="${esc(session.user.email||'')}"></label></div><div style="margin:15px 0;padding:12px;background:#f6f7ff;border-radius:12px"><b>هزینه ثبت‌نام:</b> ${w.access_type==='paid'?money(w.price):'رایگان'}</div><p id="wrMsg" class="muted"></p><button class="btn" id="wrSubmit">${w.access_type==='paid'?'ادامه و پرداخت':'ثبت‌نام رایگان'}</button></div>`;
  document.body.appendChild(wrap);document.getElementById('wrClose').onclick=()=>wrap.remove();
  document.getElementById('wrSubmit').onclick=async()=>{
   const btn=document.getElementById('wrSubmit'),msg=document.getElementById('wrMsg');
   const full_name=document.getElementById('wrName').value.trim(),mobile=document.getElementById('wrMobile').value.trim(),email=document.getElementById('wrEmail').value.trim();
   if(full_name.length<3||mobile.length<7){msg.textContent='نام کامل و شماره موبایل معتبر را وارد کنید.';return;}
   btn.disabled=true;msg.textContent='در حال ثبت اطلاعات...';
   try{
    if(w.access_type==='free'){
     const {data,rpcError}=await db.rpc('reserve_workshop_registration',{p_workshop_id:id,p_full_name:full_name,p_mobile:mobile,p_email:email});
     if(rpcError)throw rpcError;if(!data?.ok)throw new Error('ثبت‌نام انجام نشد.');
     msg.textContent='ثبت‌نام شما با موفقیت انجام شد.';btn.textContent='ثبت شد';setTimeout(()=>location.reload(),900);return;
    }
    const r=await fetch(U+'/functions/v1/education-zarinpal-request',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,apikey:K,'Content-Type':'application/json'},body:JSON.stringify({kind:'workshop',id,full_name,mobile,email})});
    const j=await r.json();if(!r.ok||!j.payment_url)throw new Error(j.error||'خطا در ایجاد پرداخت');location.href=j.payment_url;
   }catch(e){msg.textContent=e.message||'خطای ثبت‌نام';btn.disabled=false;}
  };
 };
 return true;
}
let tries=0;const timer=setInterval(()=>{if(install()||++tries>40)clearInterval(timer)},250);
})();
