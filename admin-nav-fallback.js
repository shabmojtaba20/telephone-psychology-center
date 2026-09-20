(()=>{
'use strict';
const $=id=>document.getElementById(id);

function addNavCss(){
 const id='admin-nav-resilience-style';
 if(document.getElementById(id)) return;
 const s=document.createElement('style');
 s.id=id;
 s.textContent='.nav .group>.sub{display:none}.nav .group.open>.sub{display:block!important;visibility:visible!important;opacity:1!important;height:auto!important;max-height:none!important;overflow:visible!important}.nav .sub button[data-page]{pointer-events:auto!important}';
 document.head.appendChild(s);
}

function setGroupState(group,open){
 if(!group)return;
 group.classList.toggle('open',open);
 const title=group.querySelector('.group-title');
 const sub=group.querySelector('.sub');
 if(title) title.setAttribute('aria-expanded',open?'true':'false');
 if(sub){
  sub.style.setProperty('display',open?'block':'none','important');
  sub.style.setProperty('visibility',open?'visible':'hidden','important');
  sub.style.setProperty('opacity',open?'1':'0','important');
  sub.setAttribute('aria-hidden',open?'false':'true');
 }
}

function activatePage(btn){
 const page=btn&&btn.dataset?btn.dataset.page:'';
 if(!page)return false;
 const allowed=window.__adminAllowedPages;
 if(allowed instanceof Set && !allowed.has('*') && !allowed.has(page)){
  const n=$('notice');
  if(n){n.textContent='این بخش برای نقش فعلی شما مجاز نیست.';n.className='notice err';n.style.display='block';}
  return false;
 }
 const section=$(page);
 if(!section)return false;
 document.querySelectorAll('.section').forEach(el=>el.classList.remove('active'));
 section.classList.add('active');
 document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el===btn));
 const title=$('title');
 if(title)title.textContent=btn.textContent.trim()||'پنل مدیریت';
 const side=$('side');
 if(side)side.classList.remove('open');
 if(typeof window.load==='function'){
  try{window.load()}catch(error){console.error('Admin section refresh failed',error)}
 }
 return true;
}

function init(){
 addNavCss();
 document.querySelectorAll('.group').forEach(group=>{
  const title=group.querySelector('.group-title');
  if(!title)return;
  setGroupState(group,group.classList.contains('open'));
 });
 // A single delegated capture handler avoids competing click handlers on the nested nav.
 document.addEventListener('click',event=>{
  const title=event.target&&event.target.closest?event.target.closest('.group-title'):null;
  if(title){
   const group=title.closest('.group');
   if(!group)return;
   event.preventDefault();
   event.stopImmediatePropagation();
   setGroupState(group,!group.classList.contains('open'));
   return;
  }
  const btn=event.target&&event.target.closest?event.target.closest('[data-page]'):null;
  if(btn){
   event.preventDefault();
   event.stopImmediatePropagation();
   const ok=activatePage(btn);
   if(ok){const group=btn.closest('.group');if(group)setGroupState(group,true);}
   return;
  }
  const menu=event.target&&event.target.closest?event.target.closest('#menuBtn'):null;
  if(menu){
   event.preventDefault();
   event.stopImmediatePropagation();
   const side=$('side');if(side)side.classList.toggle('open');
  }
 },true);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
