// Secure commission-rule UI adapter. The database RPC enforces finance.manage.
(function(){
  function wire(){
    if(!window.supabase || typeof window.saveRule!=='function' || window.__commissionRuleRpcWired) return;
    window.__commissionRuleRpcWired=true;
    const db=window.supabase.createClient('https://aserkyiwwyggtixckjsv.supabase.co','sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX');
    const originalNote=window.note;
    window.saveRule=async function(){
      const id=document.getElementById('ruleConsultant')?.value;
      const rate=Number(document.getElementById('ruleRate')?.value);
      const from=document.getElementById('ruleFrom')?.value;
      if(!id||!Number.isFinite(rate)||rate<0||rate>100||!from) return originalNote('مشاور، درصد و تاریخ شروع را کامل کنید.',true);
      const r=await db.rpc('save_consultant_commission_rule',{p_consultant_id:id,p_commission_percent:rate,p_effective_from:from,p_note:null});
      if(r.error) return originalNote(r.error.message,true);
      originalNote('قانون حق‌العمل با موفقیت ثبت شد.');
      if(typeof window.loadRule==='function') await window.loadRule();
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire); else wire();
  setTimeout(wire,800);
})();
