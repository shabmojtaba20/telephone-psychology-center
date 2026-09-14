(function(){
'use strict';
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
async function boot(){
 if(!window.supabase)return;
 const db=window.supabase.createClient(SB_URL,SB_KEY);
 const media=document.getElementById('media');
 if(media){
  media.innerHTML=`<div class="card"><h2>🖼️ مدیریت تصاویر و اسلایدشو</h2><p class="muted">تصویر را انتخاب کنید؛ سپس عنوان، متن و نوع نمایش را تعیین کنید. فایل مستقیماً در Supabase Storage ذخیره می‌شود.</p>
  <div class="fields"><label>انتخاب تصویر<input id="m_file" type="file" accept="image/jpeg,image/png,image/webp,image/avif"></label><label>نوع نمایش<select id="m_place"><option value="hero">اسلایدشو صفحه اصلی</option><option value="banner">بنر تبلیغاتی</option><option value="gallery">گالری</option></select></label><label>عنوان<input id="m_title" placeholder="مثلاً مشاوره تخصصی و محرمانه"></label><label>متن کوتاه<input id="m_subtitle" placeholder="رزرو نوبت با مشاور موردنظر"></label><label>متن دکمه<input id="m_button" placeholder="رزرو نوبت"></label><label>لینک دکمه<input id="m_link" placeholder="/booking.html"></label><label>ترتیب نمایش<input id="m_order" type="number" value="0"></label></div>
  <div class="actions"><button class="btn green" id="m_upload">⬆️ بارگذاری و افزودن</button></div><div id="m_msg" class="notice"></div><div id="m_list"></div></div>`;
  const msg=(t,err)=>{const x=document.getElementById('m_msg');x.textContent=t;x.className='notice'+(err?' err':'');x.style.display='block'};
  async function load(){const {data,error}=await db.from('site_media_slides').select('*').order('placement').order('sort_order');if(error)return msg(error.message,true);document.getElementById('m_list').innerHTML=data.length?data.map(x=>`<div class="item" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><img src="${x.image_url||''}" style="width:150px;height:80px;object-fit:cover;border-radius:10px;background:#eee"><div style="flex:1"><b>${esc(x.title||'بدون عنوان')}</b><div class="muted">${x.placement==='hero'?'اسلایدشو':x.placement==='banner'?'بنر':'گالری'} • ترتیب ${x.sort_order}</div></div><button class="btn ${x.is_active?'red':'green'}" data-toggle="${x.id}" data-active="${x.is_active}">${x.is_active?'غیرفعال':'فعال'}</button><button class="btn red" data-del="${x.id}">حذف</button></div>`).join(''):'<div class="empty">هنوز تصویری اضافه نشده است.</div>';
   document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=async()=>{await db.from('site_media_slides').update({is_active:b.dataset.active!=='true'}).eq('id',b.dataset.toggle);load()});
   document.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{if(!confirm('این تصویر حذف شود؟'))return;const row=data.find(x=>x.id===b.dataset.del);if(row?.image_path)await db.storage.from('site-media').remove([row.image_path]);await db.from('site_media_slides').delete().eq('id',b.dataset.del);load()});
  }
  document.getElementById('m_upload').onclick=async()=>{try{const f=document.getElementById('m_file').files[0];if(!f)return msg('ابتدا یک تصویر انتخاب کنید.',true);if(f.size>5*1024*1024)return msg('حداکثر حجم تصویر ۵ مگابایت است.',true);const ext=(f.name.split('.').pop()||'jpg').toLowerCase();const path='slides/'+crypto.randomUUID()+'.'+ext;const up=await db.storage.from('site-media').upload(path,f,{contentType:f.type,upsert:false});if(up.error)throw up.error;const {data:url}=db.storage.from('site-media').getPublicUrl(path);const {error}=await db.from('site_media_slides').insert({image_path:path,image_url:url.publicUrl,title:document.getElementById('m_title').value.trim(),subtitle:document.getElementById('m_subtitle').value.trim(),button_text:document.getElementById('m_button').value.trim(),link_url:document.getElementById('m_link').value.trim(),placement:document.getElementById('m_place').value,sort_order:Number(document.getElementById('m_order').value)||0,created_by:(await db.auth.getUser()).data.user?.id});if(error)throw error;msg('تصویر با موفقیت بارگذاری و ثبت شد.');document.getElementById('m_file').value='';load()}catch(e){msg(e.message||'بارگذاری تصویر ناموفق بود.',true)}};
  load();
 }
 const app=document.getElementById('appearance');
 if(app){
  const c=document.getElementById('g_color'),c2=document.getElementById('g_color2');
  [c,c2].forEach((el,i)=>{if(!el)return;const wrap=document.createElement('div');wrap.className='visual-color';wrap.innerHTML=`<label>${i?'رنگ مکمل':'رنگ اصلی'}<div style="display:flex;gap:10px;align-items:center"><input type="color" id="visual_${i}" value="${/^#[0-9a-f]{6}$/i.test(el.value)?el.value:(i?'#eef2ff':'#5b5bd6')}" style="width:58px;height:44px;padding:3px;cursor:pointer"><span id="visual_hex_${i}" style="font-weight:700;direction:ltr">${el.value||''}</span></div></label>`;el.parentNode.replaceChild(wrap,el);const picker=wrap.querySelector('input');const out=wrap.querySelector('span');picker.oninput=()=>{out.textContent=picker.value;};picker.onchange=()=>{c===el?c.value=picker.value:c2.value=picker.value};});
  const font=document.getElementById('g_font');if(font){font.innerHTML='<option value="Vazirmatn">Vazirmatn — پیشنهادی</option><option value="Tahoma">Tahoma</option><option value="Arial">Arial</option><option value="IRANSans">IRANSans</option><option value="Sahel">Sahel</option>';}
 }
 function esc(s){return String(s).replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();