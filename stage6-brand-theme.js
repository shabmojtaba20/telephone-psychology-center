(()=>{
'use strict';
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const run=async()=>{try{
 const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
 const db=createClient(SB_URL,SB_KEY);
 const {data,error}=await db.from('center_public_settings').select('center_name,tagline,logo_url,primary_color,secondary_color,font_family,background_color').eq('id',1).maybeSingle();
 if(error||!data)return;
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v||''};
 const applyTheme=()=>{
  const primary=data.primary_color||'#5b5bd6';
  const secondary=data.secondary_color||'#eef2ff';
  const bg=data.background_color||'#f7f8fc';
  const font=data.font_family||'Tahoma';
  let link=document.getElementById('stage6Vazirmatn');
  if(font==='Vazirmatn'&&!link){link=document.createElement('link');link.id='stage6Vazirmatn';link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap';document.head.appendChild(link)}
  let style=document.getElementById('stage6Theme');
  if(!style){style=document.createElement('style');style.id='stage6Theme';document.head.appendChild(style)}
  style.textContent=`:root{--site-primary:${primary};--site-secondary:${secondary};--site-bg:${bg};--site-font:${JSON.stringify(font)}}body{background-color:var(--site-bg)!important;font-family:var(--site-font),Tahoma,Arial,sans-serif!important}button,input,textarea,select{font-family:var(--site-font),Tahoma,Arial,sans-serif!important}`;
  document.documentElement.style.setProperty('--site-primary',primary);
  document.documentElement.style.setProperty('--site-secondary',secondary);
  document.documentElement.style.setProperty('--site-bg',bg);
  document.documentElement.style.setProperty('--site-font',font);
  document.body.style.backgroundColor=bg;
  document.body.style.fontFamily=`${font},Tahoma,Arial,sans-serif`;
  document.title=data.center_name||document.title;
 };
 if(location.pathname.endsWith('/admin-professional.html')){
  set('g_name',data.center_name);set('g_tagline',data.tagline);set('g_font',data.font_family||'Tahoma');
  const app=document.getElementById('appearance');
  if(app){
   const card=app.querySelector('.card');
   const color1=document.getElementById('g_color');const color2=document.getElementById('g_color2');
   const convertColor=(input,valueId,labelText)=>{
    if(!input)return;
    if(input.type!=='color'){
     const old=input.value||labelText;
     const picker=document.createElement('input');picker.type='color';picker.id=input.id;picker.value=/^#[0-9a-f]{6}$/i.test(old)?old:valueId;picker.style.cssText='width:70px;height:48px;padding:3px;cursor:pointer;vertical-align:middle';
     const label=input.closest('label');if(label)label.replaceChild(picker,input);else input.replaceWith(picker);
    }
   };
   convertColor(color1,data.primary_color||'#5b5bd6','#5b5bd6');
   convertColor(color2,data.secondary_color||'#eef2ff','#eef2ff');
   const bgExists=document.getElementById('g_bg');
   if(!bgExists){
    const box=document.createElement('div');box.className='item';box.innerHTML='<h3 style="margin-top:0">🎨 پس‌زمینه سایت</h3><p class="muted">رنگ پس‌زمینه را با انتخابگر بصری انتخاب کنید.</p><input id="g_bg" type="color" value="'+(data.background_color||'#f7f8fc')+'" style="width:70px;height:48px;padding:3px;cursor:pointer"><span id="g_bg_label" style="margin-right:10px;font-weight:700;direction:ltr">'+(data.background_color||'#f7f8fc')+'</span>';
    card.insertBefore(box,card.querySelector('#saveAppearance'));
    const bg=box.querySelector('#g_bg'),lab=box.querySelector('#g_bg_label');bg.oninput=()=>{lab.textContent=bg.value;document.body.style.backgroundColor=bg.value};
    const save=document.getElementById('saveAppearance');
    if(save&&!save.dataset.stage6){save.dataset.stage6='1';save.addEventListener('click',async()=>{const r=await db.from('center_public_settings').update({background_color:bg.value,updated_at:new Date().toISOString()}).eq('id',1);if(r.error)alert(r.error.message);else{data.background_color=bg.value;applyTheme();lab.textContent=bg.value}})}
   }
   const save=document.getElementById('saveAppearance');
   if(save&&!save.dataset.stage6colors){save.dataset.stage6colors='1';save.addEventListener('click',async()=>{const p=document.getElementById('g_color')?.value||data.primary_color||'#5b5bd6';const s=document.getElementById('g_color2')?.value||data.secondary_color||'#eef2ff';const f=document.getElementById('g_font')?.value||data.font_family||'Tahoma';const r=await db.from('center_public_settings').update({primary_color:p,secondary_color:s,font_family:f,updated_at:new Date().toISOString()}).eq('id',1);if(r.error)alert(r.error.message);else{data.primary_color=p;data.secondary_color=s;data.font_family=f;applyTheme()}})}
  }
 }
 applyTheme();
 }catch(e){console.warn('stage6 theme',e)}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();