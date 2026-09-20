(()=>{
'use strict';
const $=id=>document.getElementById(id);
function init(){
 const groups=[...document.querySelectorAll('.group-title')];
 groups.forEach(btn=>{btn.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();const group=btn.closest('.group');if(group)group.classList.toggle('open')},true)});
 document.querySelectorAll('[data-page]').forEach(btn=>btn.addEventListener('click',event=>{
  const page=btn.dataset.page;if(!page)return;
  const allowed=window.__adminAllowedPages;
  if(allowed instanceof Set&&!allowed.has('*')&&!allowed.has(page)){event.preventDefault();event.stopImmediatePropagation();return;}
  const section=$(page);if(!section)return;
  event.preventDefault();event.stopImmediatePropagation();
  document.querySelectorAll('.section').forEach(el=>el.classList.remove('active'));
  section.classList.add('active');
  document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el===btn));
  const title=$('title');if(title)title.textContent=btn.textContent.trim()||'پنل مدیریت';
  $('side')?.classList.remove('open');
  if(typeof window.load==='function')try{window.load()}catch(error){console.error('Admin section refresh failed',error)}
 },true));
 const menu=$('menuBtn');if(menu)menu.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();$('side')?.classList.toggle('open')},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
