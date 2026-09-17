(function(){
  const dbp=window.db||(window.supabase&&window.supabase.createClient?window.supabase.createClient('https://aserkyiwwyggtixckjsv.supabase.co','sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX'):null);
  if(!dbp)return;
  const moneyP=n=>Number(n||0).toLocaleString('fa-IR');
  const escP=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const withTimeout=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label)),ms))]);
  async function loadPreview(){
    const box=document.getElementById('receiptPreviewBody');if(!box)return;
    const r=await dbp.from('payment_receipts').select('id,amount,status,invoice_id,appointment_id,tracking_code,submitted_at,approved_at').eq('status','pending').order('submitted_at',{ascending:false}).limit(50);
    if(r.error){box.innerHTML='<div class="notice err">'+escP(r.error.message)+'</div>';return;}
    const rows=r.data||[];
    if(!rows.length){box.innerHTML='<div class="empty">رسید منتظر بررسی وجود ندارد.</div>';return;}
    const ids=[...new Set(rows.map(x=>x.appointment_id).filter(Boolean))];let amap={};
    if(ids.length){
      const a=await dbp.from('appointments').select('id,consultant_id,scheduled_at').in('id',ids);
      const cids=[...new Set((a.data||[]).map(x=>x.consultant_id).filter(Boolean))];let cmap={};
      if(cids.length){const c=await dbp.from('consultants').select('id,name').in('id',cids);(c.data||[]).forEach(x=>cmap[x.id]=x.name)}
      const ruleRows=[];
      for(const x of (a.data||[])){
        let rule=null;
        if(x.consultant_id){
          const rr=await dbp.from('consultant_commission_rules').select('commission_percent,effective_from,effective_to,is_active').eq('consultant_id',x.consultant_id).eq('is_active',true).order('effective_from',{ascending:false}).limit(10);
          if(!rr.error){
            const day=(x.scheduled_at||'').slice(0,10)||null;
            rule=(rr.data||[]).find(z=>!day||z.effective_from<=day&&(!z.effective_to||z.effective_to>day))||null;
          }
        }
        amap[x.id]={consultant:cmap[x.consultant_id]||'—',scheduled:x.scheduled_at,commission:rule?Number(rule.commission_percent):null};
      }
    }
    box.innerHTML=rows.map(x=>{
      const a=amap[x.appointment_id]||{};const gross=Number(x.amount||0);const pct=Number.isFinite(a.commission)?a.commission:null;
      const consultant=pct===null?null:Math.round(gross*pct/100);const center=consultant===null?null:gross-consultant;
      const split=pct===null?'⚠️ قاعده فعال سهم مشاور برای این نوبت پیدا نشد؛ پس از تأیید نیز تسویه خودکار انجام نمی‌شود.':'سهم مشاور '+moneyP(pct)+'٪: <b>'+moneyP(consultant)+' تومان</b> | سهم مرکز: <b>'+moneyP(center)+' تومان</b>';
      return '<div class="receipt-preview-row"><div><b>'+moneyP(gross)+' تومان</b> <span class="badge">منتظر تأیید</span></div><div class="muted">مشاور: '+escP(a.consultant||'—')+' | کد پیگیری: '+escP(x.tracking_code||'—')+' | فاکتور: '+(x.invoice_id?'متصل':'بدون فاکتور')+'</div><div class="preview-split">'+split+'</div><button class="btn green" onclick="window.previewApproveReceipt(\''+escP(x.id)+'\')">تأیید رسید و ثبت مالی</button></div>';
    }).join('');
  }
  window.previewApproveReceipt=async function(id){
    const box=document.getElementById('receiptPreviewBody');
    try{
      if(!confirm('این عملیات رسید را تأیید کرده و تراکنش مالی/فاکتور مرتبط را ثبت می‌کند. ادامه می‌دهید؟'))return;
      if(box)box.insertAdjacentHTML('afterbegin','<div class="notice" id="receiptActionNotice">در حال بررسی نشست مدیر مالی و ثبت رسید...</div>');
      const userResult=await withTimeout(dbp.auth.getUser(),10000,'بررسی هویت مدیر مالی زمان‌بر شد. صفحه را تازه‌سازی کنید و دوباره وارد شوید.');
      if(userResult.error||!userResult.data?.user){alert('تأیید انجام نشد: نشست مدیر مالی معتبر نیست. ابتدا صفحه را تازه‌سازی و دوباره وارد شوید.');return;}
      const note=document.getElementById('note_'+id)?.value.trim()||'تأیید رسید توسط مدیر مالی';
      const inputTracking=document.getElementById('track_'+id)?.value.trim()||null;
      let tracking=inputTracking;
      if(!tracking){
        const rr=await withTimeout(dbp.from('payment_receipts').select('tracking_code').eq('id',id).maybeSingle(),10000,'دریافت کد پیگیری زمان‌بر شد.');
        if(rr.error){alert('تأیید انجام نشد: '+rr.error.message);return;}
        tracking=rr.data?.tracking_code||null;
      }
      if(box){const n=document.getElementById('receiptActionNotice');if(n)n.textContent='در حال ثبت تأیید رسید در سیستم مالی...';}
      const r=await withTimeout(dbp.rpc('review_payment_receipt',{p_receipt_id:id,p_decision:'approved',p_note:note,p_tracking_code:tracking}),20000,'ثبت رسید بیش از حد معمول طول کشید. لطفاً نتیجه تراکنش را بررسی کنید.');
      if(r.error){alert('تأیید انجام نشد:\n'+r.error.message);return;}
      const result=r.data||{};
      alert('رسید با موفقیت تأیید و ثبت مالی شد.\nشناسه تراکنش: '+(result.finance_transaction_id||result.transaction_id||'ثبت شد'));
      if(typeof window.loadReceipts==='function')await window.loadReceipts();
      if(typeof window.loadSummary==='function')await window.loadSummary();
      await loadPreview();
    }catch(e){alert('تأیید انجام نشد:\n'+(e?.message||String(e)));}
    finally{const n=document.getElementById('receiptActionNotice');if(n)n.remove();}
  };
  function init(){
    if(document.getElementById('receiptPreview'))return;
    const target=document.getElementById('receipts');if(!target)return;
    const s=document.createElement('section');s.id='receiptPreview';s.className='card';s.innerHTML='<h2>🔎 پیش‌نمایش تأیید رسید و تقسیم مالی</h2><p class="muted">سهم مشاور بر اساس قانون کمیسیون فعال همان مشاور نمایش داده می‌شود؛ دیگر درصد ثابت ۳۰٪/۷۰٪ فرض نمی‌شود. ثبت واقعی فقط پس از تأیید مدیر مالی انجام خواهد شد.</p><div id="receiptPreviewBody"></div>';
    target.parentNode.insertBefore(s,target.nextSibling);loadPreview();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();