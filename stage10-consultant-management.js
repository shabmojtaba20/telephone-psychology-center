(()=>{
'use strict';
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const wait=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
wait(async()=>{
 if(location.pathname!=='/admin-professional.html')return;
 const host=document.getElementById('consultants');
 if(!host||!window.supabase)return;
 const db=window.supabase.createClient(SB_URL,SB_KEY);
 const {data:{user}}=await db.auth.getUser();
 if(!user)return;
 const card=host.querySelector('.card'); if(!card)return;
 const add=document.getElementById('addConsultant');
 const legacyForm=document.getElementById('consultantForm');
 const legacyList=document.getElementById('consultantsList');
 if(legacyForm)legacyForm.innerHTML='';
 if(legacyList)legacyList.innerHTML='';
 const panel=document.createElement('div');
 panel.id='s10Professional';
 panel.innerHTML=`
 <div id="s10Notice" class="notice" style="display:none"></div>
 <div id="s10Form" class="item" style="display:none;margin-top:14px;background:#f8fafc;border-color:#c7d2fe"></div>
 <div id="s10List" style="margin-top:14px"></div>`;
 card.appendChild(panel);
 const $=id=>document.getElementById(id);
 function notice(t,bad=false){const n=$('s10Notice');n.textContent=t;n.className='notice'+(bad?' err':'');n.style.display='block';clearTimeout(window.__s10Timer);window.__s10Timer=setTimeout(()=>n.style.display='none',5000)}
 let consultants=[],users=[];
 async function loadUsers(){const r=await db.rpc('admin_list_consultant_user_candidates');if(r.error){notice('حساب‌های قابل اتصال بارگذاری نشد: '+r.error.message,true);return []}return r.data||[]}
 async function load(){const r=await db.rpc('admin_list_consultants');if(r.error){notice('فهرست مشاوران بارگذاری نشد: '+r.error.message,true);return}consultants=r.data||[];render()}
 function userLabel(u){return `${u.full_name?esc(u.full_name)+' — ':''}${esc(u.email||u.user_id)}${u.linked_consultant_id?' — حساب متصل':''}`}
 async function uploadPhoto(file, consultantId){
   if(!file)return '';
   if(!file.type.startsWith('image/'))throw new Error('فقط فایل تصویری مجاز است.');
   if(file.size>6*1024*1024)throw new Error('حجم تصویر باید حداکثر ۶ مگابایت باشد.');
   const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
   const path=`consultants/${consultantId||crypto.randomUUID()}/profile-${crypto.randomUUID()}.${ext}`;
   const up=await db.storage.from('site-media').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
   if(up.error)throw up.error;
   return db.storage.from('site-media').getPublicUrl(up.data.path).data.publicUrl;
 }
 function form(x={}){
   const f=$('s10Form');f.style.display='block';
   const currentUser=users.find(u=>u.user_id===x.linked_user_id);
   const currentEmail=x.linked_email||currentUser?.email||'';
   f.innerHTML=`
   <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><div><h3 style="margin:0">${x.id?'ویرایش مشاور':'افزودن مشاور جدید'}</h3><div class="muted">اطلاعات حساب، حق‌العمل و تصویر فقط از پنل مدیریت کنترل می‌شود.</div></div><button class="btn gray" id="s10Cancel">انصراف</button></div>
   <div class="item" style="background:#eef2ff;border-color:#c7d2fe;margin-top:12px"><b>🔐 حساب ورود و امور مالی</b><div class="fields" style="margin-top:10px">
   <label>حساب ورود مشاور<select id="s10User"><option value="">بدون اتصال حساب</option>${users.map(u=>`<option value="${esc(u.user_id)}" ${u.user_id===x.linked_user_id?'selected':''}>${userLabel(u)}</option>`).join('')}</select></label>
   <label>ایمیل حساب<input id="s10Email" value="${esc(currentEmail||'—')}" readonly></label>
   <label>درصد حق‌العمل کاری<input id="s10Commission" type="number" min="0" max="100" step="0.01" value="${x.commission_percent??0}"></label>
   <label>فرمول خالص دریافتی<div id="s10Formula" style="padding:10px;border:1px solid #d9dee8;border-radius:9px;background:#fff;margin-top:4px">کارکرد دوره − ${Number(x.commission_percent||0).toLocaleString('fa-IR')}٪ حق‌العمل</div></label>
   </div></div>
   <div class="item" style="background:#fff"><b>👤 اطلاعات حرفه‌ای</b><div class="fields" style="margin-top:10px">
   <label>نام و نام خانوادگی<input id="s10Name" value="${esc(x.name)}"></label><label>تخصص<input id="s10Specialty" value="${esc(x.specialty)}"></label><label>تحصیلات<input id="s10Education" value="${esc(x.education)}"></label><label>وضعیت<select id="s10Active"><option value="true" ${x.is_active!==false?'selected':''}>فعال</option><option value="false" ${x.is_active===false?'selected':''}>غیرفعال</option></select></label>
   </div><label>معرفی مشاور<textarea id="s10Bio">${esc(x.bio)}</textarea></label></div>
   <div class="item" style="background:#fff"><b>📷 تصویر مشاور</b><div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:10px"><div id="s10PhotoPreview">${x.photo_url?`<img src="${esc(x.photo_url)}" style="width:100px;height:100px;border-radius:18px;object-fit:cover;border:1px solid #ddd" alt="تصویر مشاور">`:'<div style="width:100px;height:100px;border-radius:18px;background:#eef2ff;display:grid;place-items:center;font-size:35px">👤</div>'}</div><div style="min-width:240px;flex:1"><label>بارگذاری تصویر جدید<input id="s10PhotoFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label><div class="muted">PNG/JPG/WebP/GIF — حداکثر ۶ مگابایت</div><input id="s10PhotoUrl" type="hidden" value="${esc(x.photo_url)}"></div></div></div>
   <button class="btn green" id="s10Save">💾 ذخیره مشاور</button>`;
   $('s10Cancel').onclick=()=>f.style.display='none';
   $('s10User').onchange=()=>{const u=users.find(a=>a.user_id===$('s10User').value);$('s10Email').value=u?.email||'—'};
   $('s10Commission').oninput=()=>{const v=Math.max(0,Math.min(100,Number($('s10Commission').value||0)));$('s10Formula').textContent=`کارکرد دوره − ${v.toLocaleString('fa-IR')}٪ حق‌العمل`};
   $('s10PhotoFile').onchange=()=>{const file=$('s10PhotoFile').files?.[0];if(file)$('s10PhotoPreview').innerHTML=`<img src="${URL.createObjectURL(file)}" style="width:100px;height:100px;border-radius:18px;object-fit:cover;border:1px solid #ddd" alt="پیش‌نمایش">`};
   $('s10Save').onclick=async()=>{
     const btn=$('s10Save');btn.disabled=true;btn.textContent='در حال ذخیره...';
     try{
       const name=String($('s10Name').value||'').trim(), commission=Number($('s10Commission').value||0), userId=$('s10User').value||null;
       if(!name)throw new Error('نام مشاور الزامی است.');
       if(commission<0||commission>100)throw new Error('درصد حق‌العمل باید بین ۰ تا ۱۰۰ باشد.');
       let photoUrl=$('s10PhotoUrl').value||null;
       const file=$('s10PhotoFile').files?.[0];
       if(file)photoUrl=await uploadPhoto(file,x.id||null);
       const r=await db.rpc('admin_save_consultant',{p_id:x.id||null,p_name:name,p_specialty:$('s10Specialty').value,p_bio:$('s10Bio').value,p_education:$('s10Education').value,p_photo_url:photoUrl,p_is_active:$('s10Active').value==='true',p_user_id:userId,p_commission_percent:commission});
       if(r.error)throw r.error;
       f.style.display='none';users=await loadUsers();await load();notice('مشاور با موفقیت ذخیره شد؛ حساب ورود، ایمیل، حق‌العمل و تصویر ثبت شد.');
     }catch(e){notice(e.message||String(e),true)}finally{btn.disabled=false;btn.textContent='💾 ذخیره مشاور'}
   };
 }
 function render(){
   const list=$('s10List');
   if(!consultants.length){list.innerHTML='<div class="empty">هنوز مشاوری ثبت نشده است.</div>';return}
   list.innerHTML=`<div class="item" style="background:#f8fafc"><b>فهرست مشاوران</b><div class="muted">ایمیل حساب، حق‌العمل و تصویر هر مشاور در همین کارت قابل مشاهده است.</div></div>`+consultants.map(c=>{const pct=Number(c.commission_percent||0);return `<div class="item"><div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap"><div>${c.photo_url?`<img src="${esc(c.photo_url)}" style="width:82px;height:82px;border-radius:16px;object-fit:cover" alt="">`:'<div style="width:82px;height:82px;border-radius:16px;background:#eef2ff;display:grid;place-items:center;font-size:30px">👤</div>'}</div><div style="min-width:230px;flex:1"><b style="font-size:17px">${esc(c.name)}</b><div class="muted">${esc(c.specialty||'بدون تخصص ثبت‌شده')}</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;margin-top:10px"><div style="padding:10px;border-radius:10px;background:#eef2ff"><small class="muted">🔐 ایمیل حساب ورود</small><div><b>${esc(c.linked_email||'متصل نیست')}</b></div></div><div style="padding:10px;border-radius:10px;background:#ecfdf5"><small class="muted">💰 حق‌العمل کاری</small><div><b>${pct.toLocaleString('fa-IR')}٪</b></div></div></div></div><span class="badge" style="background:${c.is_active?'#dcfce7':'#f1f5f9'};color:${c.is_active?'#166534':'#64748b'}">${c.is_active?'فعال':'غیرفعال'}</span></div><div class="actions" style="margin-top:10px"><button class="btn secondary" data-edit="${c.id}">✏️ ویرایش مشاور</button><button class="btn gray" data-schedule="${c.id}">📅 برنامه کاری</button></div></div>`}).join('');
   list.querySelectorAll('[data-edit]').forEach(b=>b.onclick=async()=>{users=await loadUsers();form(consultants.find(c=>c.id===b.dataset.edit)||{})});
   list.querySelectorAll('[data-schedule]').forEach(b=>b.onclick=()=>location.href='/appointment-slots.html?consultant_id='+encodeURIComponent(b.dataset.schedule));
 }
 if(add){add.onclick=async()=>{users=await loadUsers();form({});};add.textContent='➕ افزودن مشاور';}
 users=await loadUsers();await load();
});
})();
