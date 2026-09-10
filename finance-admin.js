(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvPGC8grgA_6J1E_9HX'.replace('GvPG','GvR');
  let db;
  const $=id=>document.getElementById(id);
  const money=n=>Number(n||0).toLocaleString('fa-IR');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const note=(t,bad=false)=>{const e=$('notice');if(!e)return;e.textContent=t;e.className='notice'+(bad?' err':'');e.style.display='block';setTimeout(()=>e.style.display='none',4000)};
  async function init(){
    if(!window.supabase)return;
    db=window.supabase.createClient(SB_URL,SB_KEY);
    const {data:{session}}=await db.auth.getSession(); if(!session)return;
    const admin=await db.rpc('is_admin'); if(admin.error||admin.data!==true)return;
    installUI(); await refreshAll();
  }
  function installUI(){
    const finance=$('finance'); if(!finance)return;
    finance.innerHTML=`
      <div class="grid finance-kpis">
        <div class="card stat">💰 درآمد قطعی<b id="fxIncome">۰</b><small>تومان</small></div>
        <div class="card stat">⏳ مبالغ در انتظار<b id="fxPending">۰</b><small>تومان</small></div>
        <div class="card stat">🧾 تعداد فاکتورها<b id="fxInvoices">۰</b></div>
        <div class="card stat">🧾 رسیدهای در انتظار<b id="fxReceipts">۰</b></div>
      </div>
      <div class="card"><h2>💳 مدیریت مالی</h2><div class="actions"><button class="btn" id="fxRefresh">🔄 به‌روزرسانی</button><button class="btn secondary" id="fxExport">📥 خروجی گزارش CSV</button></div></div>
      <div class="card"><h2>🏦 حساب بانکی و کارت‌به‌کارت</h2><div class="fields"><label>نام بانک<input id="fxBankName"></label><label>صاحب حساب<input id="fxCardHolder"></label><label>شماره حساب<input id="fxAccount"></label><label>شماره کارت<input id="fxCard"></label><label>شماره شبا<input id="fxIban"></label></div><label>راهنمای پرداخت<textarea id="fxPaymentNotes"></textarea></label><label><input id="fxCardActive" type="checkbox"> کارت‌به‌کارت فعال باشد</label><button class="btn green" id="fxSaveBank">💾 ذخیره اطلاعات بانکی</button></div>
      <div class="card"><h2>🔌 درگاه‌های پرداخت</h2><p>شناسه درگاه در تنظیمات مدیر نگهداری می‌شود. کلیدهای محرمانه برای اتصال واقعی باید فقط در Secretهای سمت سرور قرار بگیرند.</p>${gatewayCard('زرین‌پال','zarin','Merchant ID')}${gatewayCard('ایران درگاه','iran','Merchant ID')}${gatewayCard('پارسیان','parsian','Terminal ID')}${gatewayCard('پاسارگاد','pasargad','Terminal ID')}<button class="btn green" id="fxSaveGateways">💾 ذخیره تنظیمات درگاه‌ها</button></div>
      <div class="card"><h2>📊 تراکنش‌ها</h2><div class="table"><table><thead><tr><th>تاریخ</th><th>نوع</th><th>روش</th><th>درگاه</th><th>مبلغ</th><th>وضعیت</th><th>پیگیری</th></tr></thead><tbody id="fxTransactions"></tbody></table></div></div>
      <div class="card"><h2>🧾 فاکتورها</h2><div class="table"><table><thead><tr><th>شماره</th><th>عنوان</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th><th>عملیات</th></tr></thead><tbody id="fxInvoicesList"></tbody></table></div></div>
      <div class="card"><h2>🧾 رسیدهای کارت‌به‌کارت</h2><div class="table"><table><thead><tr><th>نوبت</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th><th>رسید</th><th>عملیات</th></tr></thead><tbody id="fxReceiptsList"></tbody></table></div></div>`;
    $('fxRefresh').onclick=refreshAll; $('fxSaveBank').onclick=saveBank; $('fxSaveGateways').onclick=saveGateways; $('fxExport').onclick=exportTransactions;
    $('fxReceiptsList').onclick=e=>{const b=e.target.closest('[data-receipt]');if(b)approveReceipt(b.dataset.receipt,b.dataset.status)};
    $('fxInvoicesList').onclick=e=>{const b=e.target.closest('[data-invoice]');if(b)settleInvoice(b.dataset.invoice)};
  }
  function gatewayCard(name,key,placeholder){return `<div class="item"><b>${name}</b><label><input type="checkbox" id="${key}Enabled"> فعال</label><input id="${key}Id" placeholder="${placeholder}"></div>`}
  async function refreshAll(){
    try{
      const [t,i,r,f,c]=await Promise.all([
        db.from('finance_transactions').select('*').order('occurred_at',{ascending:false}).limit(200),
        db.from('invoices').select('*').order('created_at',{ascending:false}).limit(100),
        db.from('payment_receipts').select('*').order('submitted_at',{ascending:false}).limit(100),
        db.from('center_financial_settings').select('*').eq('id',1).maybeSingle(),
        db.from('card_payment_settings').select('*').eq('id',1).maybeSingle()
      ]);
      for(const x of [t,i,r,f,c])if(x.error)throw x.error;
      const T=t.data||[],I=i.data||[],R=r.data||[];
      const paid=T.filter(x=>x.status==='paid').reduce((s,x)=>s+Number(x.amount||0),0);
      const pending=T.filter(x=>x.status==='pending').reduce((s,x)=>s+Number(x.amount||0),0);
      $('fxIncome').textContent=money(paid);$('fxPending').textContent=money(pending);$('fxInvoices').textContent=money(I.length);$('fxReceipts').textContent=money(R.filter(x=>x.status==='pending').length);
      $('financeIncome')?.textContent=money(paid);$('financeCount')?.textContent=money(T.length);
      $('fxTransactions').innerHTML=T.length?T.map(x=>`<tr><td>${new Date(x.occurred_at||x.created_at).toLocaleString('fa-IR')}</td><td>${esc(x.transaction_type)}</td><td>${esc(x.payment_method||'')}</td><td>${esc(x.gateway||'')}</td><td>${money(x.amount)} ${esc(x.currency||'IRR')}</td><td>${esc(x.status)}</td><td>${esc(x.tracking_code||x.reference_id||'')}</td></tr>`).join(''):'<tr><td colspan="7">تراکنشی ثبت نشده است.</td></tr>';
      $('fxInvoicesList').innerHTML=I.length?I.map(x=>`<tr><td>${esc(x.invoice_number)}</td><td>${esc(x.title)}</td><td>${money(x.amount)} تومان</td><td>${esc(x.status)}</td><td>${new Date(x.issued_at||x.created_at).toLocaleDateString('fa-IR')}</td><td>${x.status!=='paid'?`<button class="btn green" data-invoice="${esc(x.id)}">تسویه</button>`:'تسویه شده'}</td></tr>`).join(''):'<tr><td colspan="6">فاکتوری ثبت نشده است.</td></tr>';
      $('fxReceiptsList').innerHTML=R.length?R.map(x=>`<tr><td>${esc(x.appointment_id)}</td><td>${money(x.amount)} تومان</td><td>${esc(x.status)}</td><td>${new Date(x.submitted_at).toLocaleString('fa-IR')}</td><td>${x.receipt_path?`<span>${esc(x.receipt_path)}</span>`:'-'}</td><td>${x.status==='pending'?`<button class="btn green" data-receipt="${esc(x.id)}" data-status="approved">تأیید</button> <button class="btn red" data-receipt="${esc(x.id)}" data-status="rejected">رد</button>`:'-'}</td></tr>`).join(''):'<tr><td colspan="6">رسیدی ثبت نشده است.</td></tr>';
      const x=f.data||{};
      $('fxBankName').value=x.bank_name||'';$('fxCardHolder').value=x.card_holder||'';$('fxAccount').value=x.account_number||'';$('fxCard').value=x.card_number||'';$('fxIban').value=x.iban||'';$('fxPaymentNotes').value=x.payment_notes||'';
      $('zarinEnabled').checked=!!x.zarinpal_enabled;$('zarinId').value=x.zarinpal_merchant_id||'';$('iranEnabled').checked=!!x.iran_dargah_enabled;$('iranId').value=x.iran_dargah_merchant_id||'';$('parsianEnabled').checked=!!x.parsian_enabled;$('parsianId').value=x.parsian_terminal_id||'';$('pasargadEnabled').checked=!!x.pasargad_enabled;$('pasargadId').value=x.pasargad_terminal_id||'';
      $('fxCardActive').checked=!!c.data?.is_active;
    }catch(e){note(e.message||'خطا در بارگذاری امور مالی',true)}
  }
  async function saveBank(){
    const r=await db.from('center_financial_settings').update({bank_name:$('fxBankName').value.trim(),card_holder:$('fxCardHolder').value.trim(),account_number:$('fxAccount').value.trim(),card_number:$('fxCard').value.trim(),iban:$('fxIban').value.trim(),payment_notes:$('fxPaymentNotes').value.trim(),updated_at:new Date().toISOString()}).eq('id',1);
    if(r.error)return note(r.error.message,true);
    const c=await db.from('card_payment_settings').update({bank_name:$('fxBankName').value.trim(),card_number:$('fxCard').value.trim(),card_holder:$('fxCardHolder').value.trim(),instructions:$('fxPaymentNotes').value.trim(),is_active:$('fxCardActive').checked}).eq('id',1);
    if(c.error)return note(c.error.message,true); note('اطلاعات بانکی ذخیره شد'); refreshAll();
  }
  async function saveGateways(){
    const v={zarinpal_enabled:$('zarinEnabled').checked,zarinpal_merchant_id:$('zarinId').value.trim(),iran_dargah_enabled:$('iranEnabled').checked,iran_dargah_merchant_id:$('iranId').value.trim(),parsian_enabled:$('parsianEnabled').checked,parsian_terminal_id:$('parsianId').value.trim(),pasargad_enabled:$('pasargadEnabled').checked,pasargad_terminal_id:$('pasargadId').value.trim(),updated_at:new Date().toISOString()};
    const r=await db.from('center_financial_settings').update(v).eq('id',1); if(r.error)note(r.error.message,true);else note('تنظیمات درگاه‌ها ذخیره شد');
  }
  async function approveReceipt(id,status){
    const r=await db.from('payment_receipts').update({status,reviewed_at:new Date().toISOString(),reviewed_by:(await db.auth.getUser()).data.user?.id||null}).eq('id',id);
    if(r.error)return note(r.error.message,true);
    if(status==='approved'){
      const rec=await db.from('payment_receipts').select('*').eq('id',id).single(); if(rec.error)return note(rec.error.message,true);
      const a=await db.from('appointments').update({payment_status:'paid',paid_at:new Date().toISOString()}).eq('id',rec.data.appointment_id); if(a.error)return note(a.error.message,true);
      const tr=await db.from('finance_transactions').insert({appointment_id:rec.data.appointment_id,user_id:rec.data.user_id,transaction_type:'income',category:'consultation',amount:rec.data.amount,currency:'IRR',payment_method:'card_to_card',gateway:'card_to_card',status:'paid',description:'تأیید رسید کارت‌به‌کارت',occurred_at:new Date().toISOString()});
      if(tr.error)return note('رسید تأیید شد ولی ثبت تراکنش انجام نشد: '+tr.error.message,true); note('رسید تأیید شد و پرداخت در مالی ثبت شد');
    }else note('رسید رد شد'); refreshAll();
  }
  async function settleInvoice(id){const r=await db.from('invoices').update({status:'paid',paid_at:new Date().toISOString()}).eq('id',id);if(r.error)note(r.error.message,true);else{note('فاکتور تسویه شد');refreshAll()}}
  function exportTransactions(){const rows=[['تاریخ','نوع','روش پرداخت','درگاه','مبلغ','وضعیت','پیگیری']];document.querySelectorAll('#fxTransactions tr').forEach(tr=>rows.push([...tr.children].map(td=>td.textContent.trim())));const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='finance-report.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();