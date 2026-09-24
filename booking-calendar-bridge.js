// Legacy booking flow bridge: calendar + multi-slot selection.
(() => {
  const byId = id => document.getElementById(id);
  const status = (message, error=false) => {
    let node=byId('bookingCalendarBridgeStatus');
    if(!node){node=document.createElement('div');node.id='bookingCalendarBridgeStatus';node.className='msg';const c=byId('bookingCalendar');c?.parentNode?.insertBefore(node,c);}
    node.className='msg '+(error?'err':'ok'); node.textContent=message;
  };
  const markTime = button => {
    button.classList.toggle('selected');
    const selected=[...document.querySelectorAll('#availableTimes .time-btn.selected')];
    const first=selected[0];
    const slot=byId('slot'); if(slot) slot.value=first?.dataset.slot||'';
    const scheduled=byId('scheduledAt'); if(scheduled) scheduled.value=first?.dataset.time||'';
    const preview=byId('scheduledAtFa'); if(preview) preview.textContent=selected.length ? 'نوبت‌های انتخاب‌شده: '+selected.length.toLocaleString('fa-IR')+' نوبت' : 'تاریخ و ساعت شمسی پس از انتخاب نوبت نمایش داده می‌شود.';
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
