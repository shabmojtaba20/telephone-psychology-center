(()=>{
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>Number(n||0).toLocaleString('fa-IR');
  const fmt=d=>d?new Date(d).toLocaleDateString('fa-IR'):'—';
  const badge=s=>'<span class="badge">'+esc(s||'—')+'</span>';
  const run=()=>{
    if(typeof window.showDetail!=='function' || typeof window.db==='undefined') return;
    window.showDetail=async function(id){
      const modal=document.getElementById('detailModal'), box=document.getElementById('detailContent');
      modal.classList.add('show'); box.innerHTML='در حال دریافت زنجیره مالی...';
      const r=await window.db.rpc('get_consultant_settlement_detail',{p_settlement_id:id});
      if(r.error){box.innerHTML='<div class="notice err">'+esc(r.error.message)+'</div>';return;}
      const d=r.data||{},s=d.settlement||{},c=d.consultant||{},items=Array.isArray(d.items)?d.items:[],t=d.expense_transaction||null,audit=Array.isArray(d.audit)?d.audit:[];
      box.innerHTML='<div class="detailgrid"><div class="detailitem">مشاور<b>'+esc(c.name||'—')+'</b></div><div class="detailitem">وضعیت<b>'+badge(s.status)+'</b></div><div class="detailitem">دوره<b>'+fmt(s.period_from)+' تا '+fmt(s.period_to)+'</b></div><div class="detailitem">جلسات<b>'+money(s.appointment_count)+'</b></div><div class="detailitem">ناخالص<b>'+money(s.gross_amount)+' تومان</b></div><div class="detailitem">حق‌العمل مرکز<b>'+money(s.commission_amount)+' تومان ('+money(s.commission_percent)+'٪)</b></div><div class="detailitem">خالص مشاور<b>'+money(s.net_amount)+' تومان</b></div><div class="detailitem">مرجع پرداخت<b>'+esc(s.payment_reference||'ثبت نشده')+'</b></div></div><h3>زنجیره مالی هر جلسه</h3><div class="subtable"><table><thead><tr><th>جلسه</th><th>رسید پرداخت</th><th>فاکتور</th><th>درآمد ثبت‌شده</th><th>ناخالص</th><th>خالص مشاور</th></tr></thead><tbody>'+(items.length?items.map(x=>{const i=x.item||{},a=x.appointment||{},r=x.receipt||{},inv=x.invoice||{},inc=x.income_transaction||{};return '<tr><td>'+esc(i.appointment_id||'—')+'<div class="muted">'+fmt(a.scheduled_at)+'</div></td><td>'+esc(r.status||'—')+'<div class="muted">'+esc(r.tracking_code||'بدون کد')+'</div></td><td>'+esc(inv.invoice_number||'—')+'<div class="muted">'+esc(inv.status||'')+'</div></td><td>'+money(inc.amount||0)+' تومان<div class="muted">'+esc(inc.status||'')+'</div></td><td>'+money(i.gross_amount)+' تومان</td><td><b>'+money(i.net_amount)+' تومان</b></td></tr>';}).join(''):'<tr><td colspan="6" class="empty">ریز جلسه‌ای ثبت نشده است.</td></tr>')+'</tbody></table></div><h3>تراکنش هزینه پرداخت مشاور</h3>'+(t?'<div class="detailgrid"><div class="detailitem">شناسه<b>'+esc(t.id)+'</b></div><div class="detailitem">مبلغ<b>'+money(t.amount)+' تومان</b></div><div class="detailitem">وضعیت<b>'+esc(t.status||'—')+'</b></div><div class="detailitem">روش پرداخت<b>'+esc(t.payment_method||'—')+'</b></div><div class="detailitem">کد پیگیری<b>'+esc(t.tracking_code||'—')+'</b></div><div class="detailitem">تاریخ<b>'+esc(t.occurred_at||t.created_at||'—')+'</b></div></div>':'<div class="detail">هنوز تراکنش هزینه‌ای برای این تسویه ثبت نشده است.</div>')+'<h3>سوابق عملیات</h3><div class="timeline">'+(audit.length?audit.map(a=>'<div class="event"><b>'+esc(a.action||'عملیات')+'</b> — '+esc(a.note||'')+'<div class="muted">'+esc(a.created_at||'')+'</div></div>').join(''):'<div class="muted">سابقه‌ای ثبت نشده است.</div>')+'</div>';
    };
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
