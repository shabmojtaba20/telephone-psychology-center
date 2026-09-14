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
 if(location.pathname.endsWith('/admin-professional.html')){
  set('g_name',data.center_name);set('g_tagline',data.tagline);set('g_color',data.primary_color||'#5b5bd6');set('g_color2',data.secondary_color||'#eef2ff');set('g_font',data.font_family||'Vazirmatn');
  const app=document.getElementById('appearance'); if(app&&!document.getElementById('g_bg')){
   const card=app.querySelector('.card');
   const box=document.createElement('div');box.className='item';box.innerHTML='<h3 style="margin-top:0">🎨 پس‌زمینه سایت</h3><p class="muted">رنگ پس‌زمینه را با انتخابگر بصری انتخاب کنید.</p><input id="g_bg" type="color" value="'+(data.background_color||'#f7f8fc')+'" style="width:70px;height:48px;padding:3px;cursor:pointer"><span id="g_bg_label" style="margin-right:10px;font-weight:700;direction:ltr">'+(data.background_color||'#f7f8fc')+'</span>';
   card.insertBefore(box,card.querySelector('#saveAppearance')); const bg=box.querySelector('#g_bg'),lab=box.querySelector('#g_bg_label');
   bg.oninput=()=>{lab.textContent=bg.value};
   const save=document.getElementById('saveAppearance');
   if(save&&!save.dataset.stage6){save.dataset.stage6='1';save.addEventListener('click',async()=>{const r=await db.from('center_public_settings').update({background_color:bg.value,updated_at:new Date().toISOString()}).eq('id',1);if(r.error)alert(r.error.message);else{document.body.style.backgroundColor=bg.value;lab.textContent=bg.value}});}
  }
 }
 const bg=data.background_color||'#f7f8fc';
 const style=document.createElement('style');style.id='stage6Theme';style.textContent=`:root{--site-primary:${data.primary_color||'#5b5bd6'};--site-secondary:${data.secondary_color||'#eef2ff'};--site-bg:${bg}}body{background-color:var(--site-bg)!important}`;
 document.head.appendChild(style);document.documentElement.style.setProperty('--site-primary',data.primary_color||'#5b5bd6');document.documentElement.style.setProperty('--site-secondary',data.secondary_color||'#eef2ff');document.body.style.backgroundColor=bg;document.title=data.center_name||document.title;
 }catch(e){console.warn('stage6 theme',e)}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();