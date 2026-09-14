const STAGE7_HOME_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const STAGE7_HOME_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
(async()=>{
 try{
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const sb=createClient(STAGE7_HOME_URL,STAGE7_HOME_KEY);
  if(location.pathname!=='/'&&!location.pathname.endsWith('/index.html'))return;
  const {data:sections,error}=await sb.from('homepage_sections').select('*').order('sort_order');
  if(error||!sections?.length)return;
  const main=document.querySelector('main');if(!main)return;
  const map={hero:document.querySelector('.hero'),services:document.querySelector('#services'),education:document.querySelector('#education'),consultants:document.querySelector('#consultants'),payment:document.querySelector('#payment'),about:document.querySelector('#about')};
  const gallery=await buildGallery(sb,sections.find(x=>x.section_key==='gallery'));if(gallery)map.gallery=gallery;
  sections.forEach(s=>{
   if(s.section_key==='gallery')return;
   let el=map[s.section_key];
   if(!el&&s.section_key.startsWith('custom_')){el=buildCustomSection(s);if(el){map[s.section_key]=el;main.appendChild(el)}}
   if(!el)return;
   el.style.display=s.is_visible?'':'none';el.dataset.homeStyle=s.style_variant||'default';el.classList.add('stage7-'+(s.style_variant||'default'));
   const h=el.querySelector(s.section_key==='hero'?'h1':'.head h2');if(h&&s.title)h.innerHTML=s.title.replace(/\n/g,'<br>');
   const p=el.querySelector(s.section_key==='hero'?'.hero p':'.head .muted');if(p&&s.subtitle)p.textContent=s.subtitle;
   if(s.body){let body=el.querySelector('[data-home-body]');if(!body){body=document.createElement('p');body.dataset.homeBody='1';body.className='muted';(el.querySelector('.c')||el).appendChild(body)}body.textContent=s.body}
   let btn=el.querySelector('[data-home-button]')||el.querySelector('.btn');if(s.button_text||s.button_url){if(!btn){btn=document.createElement('a');btn.className='btn';(el.querySelector('.c')||el).appendChild(btn)}btn.dataset.homeButton='1';btn.textContent=s.button_text||'مشاهده بیشتر';btn.href=validUrl(s.button_url)?(s.button_url||'#'):'#'}
   if(s.image_url){let img=el.querySelector('[data-home-image]');if(!img){img=document.createElement('img');img.dataset.homeImage='1';img.style.cssText='display:block;max-width:100%;width:min(680px,100%);margin:18px auto 0;border-radius:18px;object-fit:cover';(el.querySelector('.c')||el).appendChild(img)}img.src=s.image_url;img.alt=s.title||'تصویر بخش'}
  });
  const ordered=sections.filter(s=>s.is_visible&&map[s.section_key]).map(s=>map[s.section_key]);
  const booking=document.querySelector('#booking');ordered.forEach(el=>main.insertBefore(el,booking||null));
 }catch(e){console.error('Stage7 homepage',e)}
 function buildCustomSection(s){
  const sec=document.createElement('section');sec.className='section';sec.dataset.customBlock='1';sec.id='home-'+String(s.section_key).replace(/[^a-z0-9_-]/gi,'');
  const c=document.createElement('div');c.className='c';
  const head=document.createElement('div');head.className='head';
  const h=document.createElement('h2');h.textContent=s.title||'بخش سفارشی';head.appendChild(h);
  if(s.subtitle){const p=document.createElement('p');p.className='muted';p.textContent=s.subtitle;head.appendChild(p)}
  c.appendChild(head);
  if(s.image_url){const img=document.createElement('img');img.dataset.homeImage='1';img.src=s.image_url;img.alt=s.title||'تصویر بخش';img.style.cssText='display:block;max-width:100%;width:min(760px,100%);margin:18px auto;border-radius:18px;object-fit:cover';c.appendChild(img)}
  if(s.body){const p=document.createElement('p');p.className='muted';p.dataset.homeBody='1';p.textContent=s.body;c.appendChild(p)}
  if(s.button_text||s.button_url){const a=document.createElement('a');a.className='btn';a.dataset.homeButton='1';a.textContent=s.button_text||'مشاهده بیشتر';a.href=validUrl(s.button_url)?(s.button_url||'#'):'#';c.appendChild(a)}
  sec.appendChild(c);return sec;
 }
 async function buildGallery(sb,section){
  const {data}=await sb.from('site_media_slides').select('id,title,subtitle,image_url,link_url,button_text,sort_order').eq('placement','gallery').eq('is_active',true).order('sort_order').limit(12);
  if(!section||!section.is_visible||!data?.length)return null;
  const sec=document.createElement('section');sec.id='gallery';sec.className='section stage7-'+(section.style_variant||'default');
  sec.innerHTML=`<div class="c"><div class="head"><h2>${safe(section.title||'گالری تصاویر')}</h2><p class="muted">${safe(section.subtitle||'تصاویر و فضای مرکز')}</p></div><div class="stage7-gallery">${data.map(x=>`<a href="${safe(validUrl(x.link_url)?(x.link_url||'#'):'#')}" class="stage7-gallery-card"><img src="${safe(x.image_url||'')}" alt="${safe(x.title||'مرکز مشاوره')}" loading="lazy"><div><b>${safe(x.title||'')}</b>${x.subtitle?`<small>${safe(x.subtitle)}</small>`:''}${x.button_text?`<em>${safe(x.button_text)}</em>`:''}</div></a>`).join('')}</div></div>`;return sec;
 }
 function validUrl(v){return !v||v.startsWith('/')||v.startsWith('#')||/^https?:\/\//i.test(v)}
 function safe(v){return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
})();