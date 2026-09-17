(()=>{
  const dbi=window.db||(window.supabase&&window.supabase.createClient?window.supabase.createClient('https://aserkyiwwyggtixckjsv.supabase.co','sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX'):null);
  if(!dbi)return;
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const init=async()=>{
    if(location.pathname!=='/admin-v5.html'||document.getElementById('financeIntegrity'))return;
    const {data:{session}}=await dbi.auth.getSession(); if(!session)return;
    const perm=await dbi.rpc('has_admin_permission',{p_permission:'finance.view'}); if(perm.error||perm.data!==true)return;
    const [pending,approved,rejected,tx] = await Promise.all([
      dbi.from('payment_receipts').select('id',{count:'exact',head:true}).eq('status','pending'),
      dbi.from('payment_receipts').select('id',{count:'exact',head:true}).eq('status','approved'),
      dbi.from('payment_receipts').select('id',{count:'exact',head:true}).eq('status','rejected'),
      dbi.from('finance_transactions').select('id',{count:'exact',head:true}).eq('transaction_type','income').eq('status','paid')
    ]);
    const s=document.createElement('section');s.id='financeIntegrity';s.className='card';
    s.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><div><h2 style="margin:0">🛡️ کنترل سلامت مالی</h2><div style="color:#667085;font-size:13px;margin-top:5px">کنترل سریع وضعیت رسیدها و تراکنش‌های درآمدی ثبت‌شده</div></div><button id="financeIntegrityRefresh" class="btn">🔄 بررسی مجدد</button></div><div id="financeIntegrityBody" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px"></div><div id="financeIntegrityNote" style="margin-top:12px;font-size:13px"></div>';
    const target=document.querySelector('#receipts')||document.querySelector('main')||document.body; target.parentNode?target.parentNode.insertBefore(s,target):document.body.prepend(s);
    const render=()=>{
      const vals=[['رسیدهای منتظر بررسی',pending.count||0,'#92400e'],['رسیدهای تأییدشده',approved.count||0,'#166534'],['رسیدهای ردشده',rejected.count||0,'#991b1b'],['تراکنش‌های درآمدی پرداخت‌شده',tx.count||0,'#3730a3']];
      document.getElementById('financeIntegrityBody').innerHTML=vals.map(x=>'<div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;background:#fff"><div style="font-size:12px;color:#667085">'+esc(x[0])+'</div><b style="display:block;font-size:22px;margin-top:6px;color:'+x[2]+'">'+Number(x[1]).toLocaleString('fa-IR')+'</b></div>').join('');
      const errs=[pending,approved,rejected,tx].filter(x=>x.error).map(x=>x.error.message); document.getElementById('financeIntegrityNote').innerHTML=errs.length?'<span style="color:#b91c1c">خطا در بررسی: '+esc(errs.join(' | '))+'</span>':'<span style="color:#166534">✓ بررسی اولیه سلامت مالی بدون خطای دسترسی انجام شد.</span>';
    };
    render();
    document.getElementById('financeIntegrityRefresh').onclick=()=>location.reload();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();