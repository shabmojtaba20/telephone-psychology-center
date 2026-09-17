(()=>{
  const dbi=window.db||(window.supabase&&window.supabase.createClient?window.supabase.createClient('https://aserkyiwwyggtixckjsv.supabase.co','sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX'):null);
  if(!dbi)return;
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const init=async()=>{
    if(location.pathname!=='/admin-v5.html'||document.getElementById('financeIntegrity'))return;
    const {data:{session}}=await dbi.auth.getSession(); if(!session)return;
    const perm=await dbi.rpc('has_admin_permission',{p_permission:'finance.manage'}); if(perm.error||perm.data!==true)return;
    const s=document.createElement('section');s.id='financeIntegrity';s.className='card';
    s.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><div><h2 style="margin:0">🛡️ کنترل سلامت تراکنش‌ها</h2><div style="color:#667085;font-size:13px;margin-top:5px">هماهنگی رسید، صورتحساب و دفتر مالی پس از تأیید پرداخت</div></div><button id="financeIntegrityRefresh" class="btn">🔄 بررسی مجدد</button></div><div id="financeIntegrityBody" style="margin-top:14px"></div>';
    const target=document.querySelector('#receipts')||document.querySelector('main')||document.body;
    if(target.parentNode)target.parentNode.insertBefore(s,target);else document.body.prepend(s);
    const run=async()=>{
      const [rr,ii,tt]=await Promise.all([
        dbi.from('payment_receipts').select('id,amount,status,invoice_id,appointment_id,finance_transaction_id,submitted_at,approved_at'),
        dbi.from('invoices').select('id,appointment_id,user_id,amount,status,receipt_id,finance_transaction_id'),
        dbi.from('finance_transactions').select('id,receipt_id,appointment_id,user_id,amount,status,transaction_type,occurred_at')
      ]);
      const body=document.getElementById('financeIntegrityBody');
      if(rr.error||ii.error||tt.error){body.innerHTML='<div style="padding:12px;border-radius:10px;background:#fff1f2;color:#9f1239">خطا در کنترل سلامت مالی: '+esc([rr.error,ii.error,tt.error].filter(Boolean).map(x=>x.message).join(' | '))+'</div>';return}
      const receipts=rr.data||[], invoices=ii.data||[], tx=tt.data||[];
      const im=new Map(invoices.map(x=>[x.id,x])), tm=new Map(tx.map(x=>[x.id,x]));
      const income=tx.filter(x=>x.transaction_type==='income'&&x.status==='paid');
      const receiptTxCount=new Map(); income.forEach(x=>{if(x.receipt_id)receiptTxCount.set(x.receipt_id,(receiptTxCount.get(x.receipt_id)||0)+1)});
      const issues=[];
      receipts.filter(x=>x.status==='approved').forEach(x=>{
        const inv=x.invoice_id?im.get(x.invoice_id):null;
        const ft=x.finance_transaction_id?tm.get(x.finance_transaction_id):null;
        if(!x.invoice_id)issues.push('رسید تأییدشده بدون صورتحساب');
        if(!x.finance_transaction_id)issues.push('رسید تأییدشده بدون تراکنش مالی');
        if(inv&&inv.status!=='paid')issues.push('رسید تأییدشده با صورتحساب غیرپرداخت‌شده');
        if(x.finance_transaction_id&&!ft)issues.push('شناسه تراکنش مالی رسید معتبر نیست');
        if(receiptTxCount.get(x.id)>1)issues.push('بیش از یک درآمد برای یک رسید ثبت شده');
      });
      invoices.filter(x=>x.status==='paid').forEach(x=>{if(!x.finance_transaction_id)issues.push('صورتحساب پرداخت‌شده بدون تراکنش مالی')});
      income.forEach(x=>{if(!x.receipt_id)issues.push('تراکنش درآمدی پرداخت‌شده بدون رسید')});
      const counts={receipts:receipts.length,pending:receipts.filter(x=>x.status==='pending').length,approved:receipts.filter(x=>x.status==='approved').length,rejected:receipts.filter(x=>x.status==='rejected').length,income:income.length,anomalies:issues.length};
      const box=(title,value,cls)=>'<div style="border:1px solid #e5e7eb;border-radius:12px;padding:13px;background:#fff"><div style="font-size:12px;color:#667085">'+esc(title)+'</div><b style="display:block;font-size:21px;margin-top:5px" class="'+cls+'">'+Number(value).toLocaleString('fa-IR')+'</b></div>';
      const unique=[...new Set(issues)];
      body.innerHTML='<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">'+box('کل رسیدها',counts.receipts,'')+box('در انتظار',counts.pending,'orange')+box('تأییدشده',counts.approved,'green')+box('ردشده',counts.rejected,'red')+box('درآمدهای ثبت‌شده',counts.income,'')+'</div>'+(unique.length?'<div style="margin-top:12px;padding:12px;border-radius:10px;background:#fff7ed;color:#9a3412"><b>⚠️ موارد نیازمند بررسی: '+unique.length+'</b><ul style="margin:8px 0 0">'+unique.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>':'<div style="margin-top:12px;padding:12px;border-radius:10px;background:#ecfdf5;color:#166534">✓ کنترل یکپارچگی رسید، صورتحساب و تراکنش مالی بدون مغایرت انجام شد.</div>');
    };
    await run();
    document.getElementById('financeIntegrityRefresh').onclick=run;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
