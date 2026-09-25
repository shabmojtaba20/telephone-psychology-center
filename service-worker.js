self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification.data?.url||'/#myAppointments';
  event.waitUntil((async()=>{
    const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of clientsList){if('focus' in c){try{await c.navigate(target)}catch{};return c.focus();}}
    if(self.clients.openWindow)return self.clients.openWindow(target);
  })());
});