(()=>{
'use strict';
const KEY='psychology-call-notifications-enabled';
let ready=false;
async function registerSW(){try{if(!('serviceWorker'in navigator))return null;return await navigator.serviceWorker.register('/service-worker.js',{scope:'/'});}catch(e){console.warn('call notification SW',e);return null}}
async function enable(){
  if(!('Notification'in window)){alert('مرورگر این گوشی از اعلان پشتیبانی نمی‌کند.');return false}
  const p=await Notification.requestPermission();
  if(p!=='granted'){alert('برای دریافت آلارم تماس، اجازه اعلان را در تنظیمات مرورگر فعال کنید.');return false}
  localStorage.setItem(KEY,'1');await registerSW();
  try{navigator.vibrate?.([120,80,120])}catch{}
  new Notification('اعلان تماس فعال شد',{body:'از این پس هنگام فعال شدن تماس مشاور، به شما اطلاع داده می‌شود.',tag:'call-alert-ready'});
  return true;
}
window.callNotifications={enable,isEnabled:()=>localStorage.getItem(KEY)==='1',notify:async(title,body,url)=>{
  if(!('Notification'in window)||Notification.permission!=='granted')return false;
  const sw=await registerSW();
  const options={body,tag:'consultant-call',renotify:true,vibrate:[300,120,300,120,600],data:{url:url||'/#myAppointments'}};
  try{if(sw?.showNotification)return sw.showNotification(title,options);new Notification(title,options);return true}catch{return false}
}};
registerSW();
})();