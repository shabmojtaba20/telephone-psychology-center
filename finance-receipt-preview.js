(function(){
  const dbp=window.db||(window.supabase&&window.supabase.createClient?window.supabase.createClient('https://aserkyiwwyggtixckjsv.supabase.co','sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX'):null);
  if(!dbp)return;
  const moneyP=n=>Number(n||0).toLocaleString('fa-IR');
  const escP=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function loadPreview(){
    const box=document.getElementById('receiptPreviewBody');if(!box)return;
    const r=await dbp.from('payment_receipts').select('id,amount,status,invoice_id,appointment_id,tracking_code,submitted_at').eq('status','pending').order('submitted_at',{ascending:false}).limit(50);
    if(r.error){box.innerHTML='<div class="notice err">'+escP(r.error.message)+'</div>';return;}
    const rows=r.data||[];
    if(!rows.length){box.innerHTML='<div class="empty">رسید منتظر بررسی وجود ندارد.</div>';return;}
    const ids=[...new Set(rows.map(x=>x.appointment_id).filter(Boolean))];let amap={};
    if(ids.length){const a=await dbp.from('appointments').select('id,consultant_id,scheduled_at').in('id',ids);const cids=[...new Set((a.data||[]).map(x=>x.consultant_id).filter(Boolean))];let cmap={};if(cids.length){const c=await dbp.from('consultants').select('id,name').in('id',cids);(c.data||[]).forEach(x=>cmap[x.id]=x.name)};(a.data||[]).forEach(x=>amap[x.id]={consultant:cmap[x.consultant_id]||'—',scheduled:x.scheduled_at});}
    box.innerHTML=rows.map(x=>{const a=amap[x.appointment_id]||{};const gross=Number(x.amount||0);const consultant=gross*.30;const center=gross-consultant;return '<div class="receipt-preview-row"><div><b>'+moneyP(gross)+' تومان</b> <span class="badge">منتظر تأیید</span></div><div class="muted">مشاور: '+escP(a.consultant||'—')+' | کد پیگیری: '+escP(x.tracking_code||'—')+' | فاکتور: '+(x.invoice_id?'متصل':'بدون فاکتور')+'</div><div class="preview-split">سهم مشاور ۳۰٪: <b>'+moneyP(consultant)+' تومان</b> | سهم مرکز ۷۰٪: <b>'+moneyP(center)+' تومان</b></div><button class="btn green" onclick="window.previewApproveReceipt(\''+escP(x.id)+'\')">تأیید رسید و ثبت مالی</button></div>';}).join('');
  }
  window.previewApproveReceipt=async function(id){
    if(!confirm('این عملیات رسید را تأیید کرده و تراکنش مالی/فاکتور مرتبط را ثبت می‌کند. ادامه می‌دهید؟'))return;
    const note=document.getElementById('note_'+id)?.value.trim()||'تأیید رسید توسط مدیر مالی';
    const tracking=document.getElementById('track_'+id)?.value.trim()||null;
    const r=await dbp.rpc('review_payment_receipt',{p_receipt_id:id,p_decision:'approved',p_note:note,p_tracking_code:tracking});
    if(r.error){alert('تأیید انجام نشد:\n'+r.error.message);return;}
    const result=r.data||{};alert('رسید با موفقیت تأیید و ثبت مالی شد.\nشناسه تراکنش: '+(result.transaction_id||'ثبت شد'));
    if(typeof window.loadReceipts==='function')await window.loadReceipts();
    if(typeof window.loadSummary==='function')await window.loadSummary();
    await loadPreview();
  };
  function init(){
    if(document.getElementById('receiptPreview'))return;
    const target=document.getElementById('receipts');if(!target)return;
    const s=document.createElement('section');s.id='receiptPreview';s.className='card';s.innerHTML='<h2>🔎 پیش‌نمایش تأیید رسید و تقسیم مالی</h2><p class="muted">قبل از تأیید، مبلغ و تقسیم ۳۰٪ مشاور / ۷۰٪ مرکز نمایش داده می‌شود. ثبت واقعی فقط پس از تأیید مدیر مالی انجام خواهد شد.</p><div id="receiptPreviewBody"></div>';
    target.parentNode.insertBefore(s,target.nextSibling);loadPreview();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
