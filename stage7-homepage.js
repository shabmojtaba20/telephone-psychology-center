const STAGE7_HOME_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const STAGE7_HOME_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
(async()=>{
 try{
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const sb=createClient(STAGE7_HOME_URL,STAGE7_HOME_KEY);
  if(location.pathname!=='/'&&!location.pathname.endsWith('/index.html'))return;
  const {data:sections,error}=await sb.from('homepage_sections').select('section_key,title,subtitle,is_visible,sort_order').order('sort_order');
  if(error||!sections?.length)return;
  const main=document.querySelector('main');if(!main)return;
  const map={hero:document.querySelector('.hero'),services:document.querySelector('#services'),education:document.querySelector('#education'),consultants:document.querySelector('#consultants'),payment:document.querySelector('#payment'),about:document.querySelector('#about')};
  const gallery=await buildGallery(sb);
  if(gallery)map.gallery=gallery;
  sections.forEach(s=>{
   const el=map[s.section_key];if(!el)return;
   el.style.display=s.is_visible?'':'none';
   if(s.section_key!=='hero'){
    const h=el.querySelector('.head h2');if(h&&s.title)h.textContent=s.title;
    const p=el.querySelector('.head .muted');if(p&&s.subtitle)p.textContent=s.subtitle;
   }
  });
  const ordered=sections.filter(s=>s.is_visible&&map[s.section_key]).map(s=>map[s.section_key]);
  const booking=document.querySelector('#booking');
  ordered.forEach(el=>main.insertBefore(el,booking||null));
 }catch(e){console.error('Stage7 homepage',e)}
 async function buildGallery(sb){
  const {data}=await sb.from('site_media_slides').select('id,title,subtitle,image_url,sort_order').eq('placement','gallery').eq('is_active',true).order('sort_order').limit(12);
  if(!data?.length)return null;
  const sec=document.createElement('section');sec.id='gallery';sec.className='section';
  sec.innerHTML=`<div class="c"><div class="head"><h2>گالری تصاویر</h2><p class="muted">تصاویر و فضای مرکز</p></div><div class="stage7-gallery">${data.map(x=>`<figure><img src="${safe(x.image_url||'')}" alt="${safe(x.title||'مرکز مشاوره')}" loading="lazy"><figcaption>${safe(x.title||'')}${x.subtitle?`<small>${safe(x.subtitle)}</small>`:''}</figcaption></figure>`).join('')}</div></div>`;
  return sec;
 }
 function safe(v){return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
})();
