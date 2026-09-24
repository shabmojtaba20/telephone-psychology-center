// Legacy booking flow bridge: calendar + multi-slot selection.
(() => {
  const byId = id => document.getElementById(id);
  const picked = window.__legacyPickedSlots || (window.__legacyPickedSlots = new Set());
  const status = (message, error=false) => {
    let node=byId('bookingCalendarBridgeStatus');
    if(!node){node=document.createElement('div');node.id='bookingCalendarBridgeStatus';node.className='msg';const c=byId('bookingCalendar');c?.parentNode?.insertBefore(node,c);}
    node.className='msg '+(error?'err':'ok'); node.textContent=message;
  };
  const markTime = button => {
    const id=String(button.dataset.slot||'');
    if(!id)return;
    if(picked.has(id))picked.delete(id);else picked.add(id);
    document.querySelectorAll('#availableTimes .time-btn').forEach(b=>b.classList.toggle('selected',picked.has(String(b.dataset.slot||''))));
    const firstId=[...picked][0]||'';
    const first=[...document.querySelectorAll('#availableTimes .time-btn')].find(b=>String(b.dataset.slot||'')===firstId);
    const slot=byId('slot'); if(slot) slot.value=firstId;
    const scheduled=byId('scheduledAt'); if(scheduled) scheduled.value=first?.dataset.time||'';
    const preview=byId('scheduledAtFa'); if(preview) preview.textContent=picked.size ? 'نوبت‌های انتخاب‌شده: '+picked.size.toLocaleString('fa-IR')+' نوبت' : 'تاریخ و ساعت شمسی پس از انتخاب نوبت نمایش داده نمی‌شود.';
    document.dispatchEvent(new CustomEvent('legacyBookingSelectionChanged'));
  };
  document.addEventListener('click',event=>{
    const btn=event.target?.closest?.('#availableTimes .time-btn');
    if(!btn)return;
    event.preventDefault(); event.stopImmediatePropagation(); markTime(btn);
  },true);
  document.addEventListener('click',event=>{
    const btn=event.target?.closest?.('.consultant-book-btn[data-consultant-id]');
    if(!btn)return;
    const select=byId('consultant'); if(!select)return;
    const id=btn.dataset.consultantId; if(!id)return;
    if([...select.options].some(o=>o.value===id)){select.value=id;select.dispatchEvent(new Event('change',{bubbles:true}));byId('booking')?.scrollIntoView({behavior:'smooth'});}
  },true);
  new MutationObserver(()=>{document.querySelectorAll('#availableTimes .time-btn').forEach(btn=>{if(!btn.dataset.multiBound)btn.dataset.multiBound='1';});}).observe(document.body,{childList:true,subtree:true});
})();
