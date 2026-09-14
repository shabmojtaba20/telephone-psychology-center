(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const FN=SB_URL+'/functions/v1/appointment-ai-summary';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  async function run(card,button){
    const id=(card.querySelector('[data-a]')||card.querySelector('[data-finish]')||card.querySelector('[data-start]')||card.querySelector('[data-cancel-session]'))?.dataset.a||card.querySelector('[data-finish]')?.dataset.finish||card.querySelector('[data-start]')?.dataset.start||card.querySelector('[data-cancel-session]')?.dataset.cancelSession;
    const reason=card.querySelector('.reason')?.innerText?.replace(/^علت مراجعه:\s*/,'').trim();
    if(!id||!reason||reason==='ثبت نشده')return;
    button.disabled=true;button.textContent='⏳ در حال آماده‌سازی...';
    let box=card.querySelector('.ai-summary');
    if(!box){box=document.createElement('div');box.className='ai-summary';card.appendChild(box)}
    box.innerHTML='<b>🧠 خلاصه هوشمند مراجعه</b><div class="muted" style="margin-top:6px">در حال تحلیل غیرتشخیصی شرح مراجعه...</div>';
    try{
      const keys=Object.keys(localStorage).filter(k=>k.includes('-auth-token'));
      let token=null;
      for(const k of keys){try{const x=JSON.parse(localStorage.getItem(k)||'{}');if(x.access_token){token=x.access_token;break}}catch{}}
      if(!token)throw new Error('نشست ورود پیدا نشد؛ یک‌بار از پنل خارج و دوباره وارد شوید.');
      const r=await fetch(FN,{method:'POST',headers:{'Content-Type':'application/json',apikey:SB_KEY,Authorization:'Bearer '+token},body:JSON.stringify({appointment_id:id,client_reason:reason})});
      const j=await r.json().catch(()=>({}));
      if(!r.ok||j.error){
        const detail=j.detail||j.message||'';
        const msg=(j.error||'خطا در سرویس هوش مصنوعی')+(detail?' — '+detail:'');
        throw new Error(msg);
      }
      box.innerHTML='<div><b>🧠 خلاصه هوشمند مراجعه</b></div><div style="margin-top:8px"><b>خلاصه اولیه:</b><div class="muted" style="margin-top:4px;white-space:pre-wrap">'+esc(j.summary||'—')+'</div></div><div style="margin-top:9px"><b>سرفصل‌های پیشنهادی:</b><ul style="margin:6px 0;padding-right:22px">'+(j.topics||[]).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><div class="muted" style="margin-top:8px">⚠️ این محتوا صرفاً برای آماده‌سازی مشاور است و تشخیص یا توصیه درمانی محسوب نمی‌شود.</div>';
      button.textContent='🔄 تولید مجدد خلاصه';
    }catch(e){box.innerHTML='<b>🧠 خلاصه هوشمند مراجعه</b><div class="msg err" style="margin-top:8px">'+esc(e.message||'خطا در دریافت خلاصه هوشمند')+'</div>';button.textContent='تلاش دوباره'}
    button.disabled=false;
  }
  function inject(){
    if(!document.getElementById('ai-summary-style')){const st=document.createElement('style');st.id='ai-summary-style';st.textContent='.ai-summary{margin-top:10px;padding:13px;border-radius:13px;background:linear-gradient(135deg,#eef2ff,#faf5ff);border:1px solid #c7d2fe}.ai-summary ul{margin-bottom:0}.ai-summary-btn{background:#4338ca!important}.ai-summary .err{white-space:pre-wrap;word-break:break-word}';document.head.appendChild(st)}
    document.querySelectorAll('#appointmentList .appointment').forEach(card=>{
      if(card.querySelector('.ai-summary-btn'))return;
      const reason=card.querySelector('.reason')?.innerText?.trim();if(!reason||reason.endsWith('ثبت نشده'))return;
      const actions=card.querySelector('.actions')||card;
      const b=document.createElement('button');b.className='btn ai-summary-btn';b.textContent='🧠 دریافت سرفصل و خلاصه هوشمند';b.onclick=()=>run(card,b);actions.appendChild(b);
    });
  }
  const obs=new MutationObserver(inject);obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(inject,700);setInterval(inject,1800);
})();
