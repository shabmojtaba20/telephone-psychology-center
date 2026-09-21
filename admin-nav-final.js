(()=>{
'use strict';
if(window.__adminNavFinalBoot)return;
window.__adminNavFinalBoot=true;
const $=id=>document.getElementById(id);
function setOpen(group,open){
 if(!group)return;
 group.classList.toggle('open',open);group.classList.toggle('is-open',open);
 const title=group.querySelector(':scope>.group-title'),sub=group.querySelector(':scope>.sub');
 if(title){title.type='button';title.setAttribute('aria-expanded',String(open));}
 if(sub){sub.setAttribute('aria-hidden',String(!open));sub.style.setProperty('display',open?'block':'none','important');sub.style.setProperty('visibility',open?'visible':'hidden','important');sub.style.setProperty('opacity',open?'1':'0','important');sub.style.setProperty('height',open?'auto':'0','important');sub.style.setProperty('overflow',open?'visible':'hidden','important');}
}
function switchPage(btn){
 const page=btn?.dataset?.page;if(!page)return;
 const allowed=window.__adminAllowedPages;
 if(allowed instanceof Set&&!allowed.has('*')&&!allowed.has(page)){const n=$('notice');if(n){n.textContent='این بخش برای نقش فعلی شما مجاز نیست.';n.className='notice err';n.style.display='block';}return;}
 const section=$(page);if(!section)return;
 document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));section.classList.add('active');
 document.querySelectorAll('.nav [data-page]').forEach(x=>x.classList.toggle('active',x===btn));
 const title=$('title');if(title)title.textContent=(btn.textContent||'').trim()||'پنل مدیریت';
 const current=btn.closest('.group');document.querySelectorAll('.nav .group').forEach(g=>setOpen(g,g===current));
 if(window.matchMedia?.('(max-width:700px)').matches)$('side')?.classList.remove('open');
 if(typeof window.load==='function'){try{window.load();}catch(e){console.error('Admin page refresh failed',e);}}
}
function init(){
 const nav=document.querySelector('.nav');if(!nav)return;
 if(!document.getElementById('admin-nav-final-style')){const s=document.createElement('style');s.id='admin-nav-final-style';s.textContent='.nav .group>.sub{display:none!important;visibility:hidden!important;opacity:0!important;height:0!important;overflow:hidden!important}.nav .group.is-open>.sub,.nav .group.open>.sub{display:block!important;visibility:visible!important;opacity:1!important;height:auto!important;max-height:none!important;overflow:visible!important}.nav .group>.group-title{touch-action:manipulation;-webkit-tap-highlight-color:transparent}.nav .sub button[data-page]{pointer-events:auto!important;touch-action:manipulation}';document.head.appendChild(s);}
 nav.querySelectorAll('.group>.group-title').forEach(t=>{t.type='button';t.setAttribute('aria-haspopup','true');t.setAttribute('aria-expanded','false');});
 nav.querySelectorAll('.nav [data-page]').forEach(b=>b.type='button');
 nav.addEventListener('click',e=>{
  const title=e.target.closest?.('.group>.group-title');
  if(title&&nav.contains(title)){e.preventDefault();e.stopPropagation();const group=title.parentElement;setOpen(group,!group.classList.contains('is-open'));return;}
  const btn=e.target.closest?.('[data-page]');if(btn&&nav.contains(btn)){e.preventDefault();e.stopPropagation();switchPage(btn);}
 });
 const menu=$('menuBtn');if(menu){menu.type='button';menu.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();$('side')?.classList.toggle('open');});}
 document.querySelectorAll('.nav .group').forEach(g=>setOpen(g,g.classList.contains('open')||g.classList.contains('is-open')));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();