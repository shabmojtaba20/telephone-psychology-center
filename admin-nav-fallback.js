(()=>{
'use strict';
const $=id=>document.getElementById(id);

function addNavCss(){
 const id='admin-nav-resilience-style';
 if(document.getElementById(id)) return;
 const s=document.createElement('style');
 s.id=id;
 s.textContent='.nav .group.open>.sub{display:block!important;visibility:visible!important;opacity:1!important;height:auto!important;max-height:none!important}.nav .sub button[data-page]{pointer-events:auto!important}';
 document.head.appendChild(s);
}

function setGroupState(group,open){
 if(!group)return;
 group.classList.toggle('open',open);
 const title=group.querySelector(':scope>.group-title');
 const sub=group.querySelector(':scope>.sub');
 if(title) title.setAttribute('aria-expanded',open?'true':'false');
 if(sub){
  sub.style.display=open?'block':'none';
  sub.setAttribute('aria-hidden',open?'false':'true');
 }
}

function activatePage(btn){
 const page=btn&&btn.dataset?btn.dataset.page:'';
 if(!page)return false;
 const allowed=window.__adminAllowedPages;
 if(allowed instanceof Set && !allowed.has('*') && !allowed.has(page)){
  const n=$('notice');
  if(n){
   n.textContent='این بخش برای نقش فعلی شما مجاز نیست.';
   n.className='notice err';
   n.style.display='block';
  }
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

 document.querySelectorAll('.group-title').forEach(btn=>{
  const group=btn.closest('.group');
  if(!group)return;
  const sub=group.querySelector(':scope>.sub');
  const open=group.classList.contains('open');
  btn.setAttribute('type','button');
  btn.setAttribute('aria-expanded',open?'true':'false');
  if(sub)sub.setAttribute('aria-hidden',open?'false':'true');
  btn.addEventListener('click',event=>{
   event.preventDefault();
   event.stopImmediatePropagation();
   setGroupState(group,!group.classList.contains('open'));
  },true);
 });

 document.querySelectorAll('[data-page]').forEach(btn=>{
  btn.setAttribute('type','button');
  btn.addEventListener('click',event=>{
   event.preventDefault();
   event.stopImmediatePropagation();
   const ok=activatePage(btn);
   if(ok){
    const group=btn.closest('.group');
    if(group)setGroupState(group,true);
   }
  },true);
 });

 const menu=$('menuBtn');
 if(menu){
  menu.setAttribute('type','button');
  menu.addEventListener('click',event=>{
   event.preventDefault();
   event.stopImmediatePropagation();
   const side=$('side');
   if(side)side.classList.toggle('open');
  },true);
 }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
