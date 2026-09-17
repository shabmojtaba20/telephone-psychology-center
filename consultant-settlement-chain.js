(()=>{
  const start=()=>{
    if(location.pathname!=='/consultant-settlements.html') return;
    if(typeof window.showDetail!=='function') return setTimeout(start,150);
    const original=window.showDetail;
    window.showDetail=async function(id){
      await original(id);
      try{
        const r=await db.rpc('get_consultant_settlement_detail',{p_settlement_id:id});
        if(r.error||!r.data) return;
        const d=r.data, items=Array.isArray(d.items)?d.items:[], audit=Array.isArray(d.audit)?d.audit:[];
        const moneyLocal=n=>Number(n||0).toLocaleString('fa-IR');
        const escLocal=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        const fmtLocal=x=>x?new Date(x).toLocaleString('fa-IR'):'—';
        const c=$('detailContent');
        let chain='<h3>🔗 زنجیره مالی هر جلسه</h3><div class="subtable"><table><thead><tr><th>جلسه</th><th>رسید</th><th>فاکتور</th><th>درآمد</th><th>مبلغ</th></tr></thead><tbody>';
        if(!items.length) chain+='<tr><td colspan="5" class="empty">اطلاعات زنجیره مالی موجود نیست.</td></tr>';
        else items.forEach(i=>{const rc=i.receipt||{},iv=i.invoice||{},it=i.income_transaction||{};chain+=`<tr><td>${escLocal(i.appointment_id||'—')}</td><td>${escLocal(rc.status||'—')}<br><span class="muted">${escLocal(rc.tracking_code||'بدون کد')}</span></td><td>${escLocal(iv.invoice_number||'—')}<br>${escLocal(iv.status||'—')}</td><td>${escLocal(it.status||'—')}<br><span class="muted">${escLocal(it.id||'—')}</span></td><td><b>${moneyLocal(i.gross_amount)} تومان</b></td></tr>`});
        chain+='</tbody></table></div>';
        let timeline='<h3>🛡️ حسابرسی تسویه</h3><div class="timeline">';
        if(!audit.length) timeline+='<div class="muted">سابقه‌ای ثبت نشده است.</div>';
        else audit.forEach(a=>{timeline+=`<div class="event"><b>${escLocal(a.action||'عملیات')}</b>${a.note?' — '+escLocal(a.note):''}<div class="muted">${fmtLocal(a.created_at)}${a.actor_id?' | کاربر: '+escLocal(a.actor_id):''}</div></div>`});
        timeline+='</div>';
        c.insertAdjacentHTML('beforeend',chain+timeline);
      }catch(e){console.warn('settlement chain ui',e)}
    };
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
