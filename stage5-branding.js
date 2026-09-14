(()=>{
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const script=document.currentScript;
const isAdmin=location.pathname.endsWith('/admin-professional.html');
const load=async()=>{
 try{
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const db=createClient(SB_URL,SB_KEY);
  const {data,error}=await db.from('center_public_settings').select('center_name,tagline,logo_url').eq('id',1).maybeSingle();
  if(error||!data)return;
  const name=data.center_name||'مرکز مشاوره تلفنی روان';
  document.title=isAdmin?`پنل مدیریت حرفه‌ای | ${name}`:name;
  if(!isAdmin){
   document.querySelectorAll('.brand').forEach(el=>{
    const href=el.getAttribute('href')||'#top';
    el.innerHTML=`${data.logo_url?`<img src="${data.logo_url}" alt="لوگوی ${name}">`:''}<span>${name}</span>`;
    el.setAttribute('href',href);
   });
   const foot=document.querySelector('.footer h3');if(foot)foot.textContent=name;
   const admin=document.querySelector('.mobile b');if(admin&&admin.textContent.includes('پنل مدیریت'))admin.textContent=`پنل مدیریت | ${name}`;
   return;
  }
  const sideBrand=document.querySelector('.side .brand');
  if(sideBrand)sideBrand.innerHTML=`${data.logo_url?`<img src="${data.logo_url}" alt="لوگو">`:''}<b>${name}</b><small>${data.tagline||'مدیریت حرفه‌ای و یکپارچه مرکز'}</small>`;
  const topTitle=document.querySelector('.top h1');
  if(topTitle&&topTitle.textContent.trim()==='داشبورد')topTitle.insertAdjacentHTML('afterend',`<div class="muted" style="margin-top:3px">${name}</div>`);
  enhanceLogoManager(db,data);
 }catch(e){console.warn('branding',e)}
};
function enhanceLogoManager(db,current){
 const media=document.getElementById('media');if(!media)return;
 const card=media.querySelector('.card');if(!card)return;
 let box=document.getElementById('centerLogoManager');
 if(!box){
  box=document.createElement('div');box.id='centerLogoManager';box.className='item';box.style.cssText='margin-top:14px;padding:18px;border:1px solid #dfe3ec;border-radius:14px;background:#fafbff';
  box.innerHTML=`<h3 style="margin-top:0">🏷️ لوگوی مرکز</h3><p class="muted">لوگو از این بخش بارگذاری می‌شود و به‌صورت خودکار در هدر سایت، پنل مدیریت و عنوان مرکز نمایش داده خواهد شد.</p><div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div id="logoPreview" style="width:110px;height:110px;border:1px dashed #cbd5e1;border-radius:14px;display:flex;align-items:center;justify-content:center;background:#fff;overflow:hidden">بدون لوگو</div><div style="flex:1;min-width:240px"><label>فایل لوگو <input id="centerLogoFile" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label><div class="muted" style="font-size:12px">PNG یا WebP برای لوگوی شفاف پیشنهاد می‌شود؛ حداکثر 3MB.</div><button class="btn green" id="uploadCenterLogo" type="button">⬆️ بارگذاری و ثبت لوگو</button><button class="btn gray" id="removeCenterLogo" type="button" style="margin-right:6px">🗑️ حذف لوگو</button><div id="logoMsg" class="muted" style="margin-top:8px"></div></div></div>`;
  card.insertBefore(box,card.firstChild.nextSibling);
 }
 const preview=document.getElementById('logoPreview');
 const render=url=>preview.innerHTML=url?`<img src="${url}" alt="لوگوی مرکز" style="max-width:100%;max-height:100%;object-fit:contain">`:'بدون لوگو';
 render(current.logo_url);
 const file=document.getElementById('centerLogoFile');
 file.onchange=()=>{const f=file.files?.[0];if(f){if(f.size>3*1024*1024){file.value='';msg('حجم فایل بیشتر از 3MB است.',true);return}preview.innerHTML='';const img=document.createElement('img');img.src=URL.createObjectURL(f);img.style.cssText='max-width:100%;max-height:100%;object-fit:contain';preview.appendChild(img)}};
 const msg=(t,err=false)=>{const m=document.getElementById('logoMsg');m.textContent=t;m.style.color=err?'#b91c1c':'#166534'};
 document.getElementById('uploadCenterLogo').onclick=async()=>{
  const f=file.files?.[0];if(!f)return msg('ابتدا فایل لوگو را انتخاب کنید.',true);
  const {data:{user}}=await db.auth.getUser();if(!user)return msg('نشست مدیریت معتبر نیست. دوباره وارد شوید.',true);
  const ext=(f.name.split('.').pop()||'png').toLowerCase();
  const path=`branding/center-logo-${crypto.randomUUID()}.${ext}`;
  msg('در حال بارگذاری...');
  const {error:up}=await db.storage.from('site-media').upload(path,f,{contentType:f.type,cacheControl:'3600',upsert:false});
  if(up)return msg(up.message||'بارگذاری لوگو ناموفق بود.',true);
  const {data:pub}=db.storage.from('site-media').getPublicUrl(path);
  const {error:save}=await db.from('center_public_settings').update({logo_url:pub.publicUrl,updated_at:new Date().toISOString()}).eq('id',1);
  if(save)return msg(save.message||'ذخیره آدرس لوگو ناموفق بود.',true);
  render(pub.publicUrl);file.value='';msg('لوگوی مرکز با موفقیت ثبت شد.');
 };
 document.getElementById('removeCenterLogo').onclick=async()=>{
  if(!current.logo_url)return msg('لوگویی برای حذف ثبت نشده است.');
  if(!confirm('لوگوی مرکز از هدر سایت حذف شود؟'))return;
  const {error}=await db.from('center_public_settings').update({logo_url:null,updated_at:new Date().toISOString()}).eq('id',1);
  if(error)return msg(error.message,true);
  current.logo_url=null;render(null);msg('لوگو حذف شد.');
 };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
