(()=>{
'use strict';
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const wait=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
wait(async()=>{
 if(location.pathname!=='/admin-professional.html')return;
 if(!window.supabase)return;
 const db=window.supabase.createClient(SB_URL,SB_KEY);
 const {data:{user}}=await db.auth.getUser();
 if(!user)return;
 const perm=window.__adminPermissions;
 if(!(perm&& (perm.has('*')||perm.has('consultants.manage'))))return;
 const host=document.getElementById('consultants');
 if(!host)return;
 const card=host.querySelector('.card');
 if(!card)return;
 const oldList=document.getElementById('consultantsList');
 const oldForm=document.getElementById('consultantForm');
 if(oldForm)oldForm.innerHTML='';
 if(oldList)oldList.innerHTML='';
 const panel=document.createElement('div');
 panel.innerHTML=`<div class="item" style="margin-top:14px;background:#f8fafc;border-color:#c7d2fe">
 <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><div><b>مدیریت حرفه‌ای مشاوران</b><div class="muted">پروفایل، حساب ورود، درصد حق‌العمل و وضعیت فعالیت هر مشاور</div></div><button class="btn secondary" id="s10Schedule">📅 مدیریت برنامه و نوبت‌های مشاوران</button></div>
 </div>
 <div id="s10Form" class="item" style="display:none"></div>
 <div id="s10List"></div>`;
 card.appendChild(panel);
 const $=id=>document.getElementById(id);
 $('s10Schedule').onclick=()=>location.href='/appointment-slots.html';
 let consultants=[],users=[];
 function notice(t,bad=false){const n=document.getElementById('notice');if(n){n.textContent=t;n.className='notice'+(bad?' err':'');n.style.display='block';setTimeout(()=>n.style.display='none',4500);}}
 async function loadUsers(){const r=await db.rpc('admin_list_consultant_user_candidates');if(r.error){notice(r.error.message,true);return []}return r.data||[]}
 function userLabel(u){return `${u.full_name?esc(u.full_name)+' — ':''}${esc(u.email||u.user_id)}`}
 function form(x={}){
  const f=$('s10Form');f.style.display='block';
  f.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h3 style="margin:0">${x.id?'ویرایش مشاور':'افزودن مشاور جدید'}</h3><button class="btn gray" id="s10Cancel">انصراف</button></div>
  <div class="fields" style="margin-top:12px">
   <label>نام و نام خانوادگی<input id="s10Name" value="${esc(x.name)}"></label>
   <label>تخصص<input id="s10Specialty" value="${esc(x.specialty)}"></label>
   <label>تحصیلات<input id="s10Education" value="${esc(x.education)}"></label>
   <label>درصد حق‌العمل کاری<input id="s10Commission" type="number" min="0" max="100" step="0.01" value="${x.commission_percent??0}"></label>
   <label>حساب ورود مشاور<select id="s10User"><option value="">بدون اتصال حساب</option>${users.map(u=>`<option value="${esc(u.user_id)}" ${u.user_id===x.linked_user_id?'selected':''}>${userLabel(u)}${u.linked_consultant_id&&u.linked_consultant_id!==x.id?' — متصل به مشاور دیگر':''}</option>`).join('')}</select></label>
   <label>وضعیت<select id="s10Active"><option value="true" ${x.is_active!==false?'selected':''}>فعال</option><option value="false" ${x.is_active===false?'selected':''}>غیرفعال</option></select></label>
   <label class="full">لینک تصویر پروفایل<input id="s10Photo" value="${esc(x.photo_url)}" placeholder="https://..."></label>
   <label class="full">معرفی مشاور<textarea id="s10Bio">${esc(x.bio)}</textarea></label>
  </div><button class="btn green" id="s10Save">💾 ذخیره مشاور</button>`;
  $('s10Cancel').onclick=()=>f.style.display='none';
  $('s10Save').onclick=async()=>{
   const commission=Number($('s10Commission').value||0);if(!String($('s10Name').value||'').trim())return notice('نام مشاور الزامی است.',true);if(commission<0||commission>100)return notice('درصد حق‌العمل باید بین ۰ تا ۱۰۰ باشد.',true);
   const r=await db.rpc('admin_save_consultant',{p_id:x.id||null,p_name:$('s10Name').value,p_specialty:$('s10Specialty').value,p_bio:$('s10Bio').value,p_education:$('s10Education').value,p_photo_url:$('s10Photo').value,p_is_active:$('s10Active').value==='true',p_user_id:$('s10User').value||null,p_commission_percent:commission});
   if(r.error)return notice(r.error.message,true);f.style.display='none';notice('اطلاعات مشاور با موفقیت ذخیره شد.');load();
  };
 }
 function render(){
  const list=$('s10List');if(!consultants.length){list.innerHTML='<div class="empty">هنوز مشاوری ثبت نشده است.</div>';return;}
  list.innerHTML=consultants.map(c=>`<div class="item"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div><b style="font-size:17px">${esc(c.name)}</b><div class="muted">${esc(c.specialty||'بدون تخصص ثبت‌شده')} · حق‌العمل ${Number(c.commission_percent||0).toLocaleString('fa-IR')}٪</div><div class="muted" style="margin-top:5px">حساب ورود: ${esc(c.linked_email||'متصل نیست')}</div></div><span class="badge" style="background:${c.is_active?'#dcfce7':'#f1f5f9'};color:${c.is_active?'#166534':'#64748b'}">${c.is_active?'فعال':'غیرفعال'}</span></div><div class="actions" style="margin-top:10px"><button class="btn secondary" data-edit="${c.id}">✏️ ویرایش</button><button class="btn gray" data-schedule="${c.id}">📅 برنامه کاری</button></div></div>`).join('');
  list.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>form(consultants.find(c=>c.id===b.dataset.edit)||{}));
  list.querySelectorAll('[data-schedule]').forEach(b=>b.onclick=()=>location.href='/appointment-slots.html?consultant_id='+encodeURIComponent(b.dataset.schedule));
 }
 async function load(){const r=await db.rpc('admin_list_consultants');if(r.error)return notice(r.error.message,true);consultants=r.data||[];render()}
 $('addConsultant').onclick=async()=>{users=await loadUsers();form()};
 // Replace the old lightweight list actions with the professional manager while retaining the section and role guards.
 users=await loadUsers();
 await load();
});
})();
