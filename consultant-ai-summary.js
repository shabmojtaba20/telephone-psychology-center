(function(){
  /* Free, local-only summarizer: no OpenAI, no API key, no network call, no patient text leaves the browser. */
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const STOP=new Set(('از با به برای در که و یا را این آن یک من به تا اما اگر درمورد درباره روی خود خیلی بیشتر کمتر شدن هست است دارم دارد دارند بود بوده می کند میشه شود شودش کردم کرده کردن هستم نیست نیستم ندارم ندارند باید شاید فقط هم نیز چه چرا چگونه کجا کی کسی چیزی هیچ همه بعضی چند خیلی خیلی').split(/\s+/));
  const TOPICS={
    'اضطراب و نگرانی':['اضطراب','نگران','نگرانی','استرس','دلشوره','ترس','فکرهای منفی','حمله پانیک','پانیک'],
    'افسردگی و خلق':['افسرد','بی‌انگیز','بی انگیز','غمگین','ناامید','بی‌حوصل','بی حوصله','خلق','گریه'],
    'روابط عاطفی و زناشویی':['همسر','ازدواج','رابطه','نامزد','طلاق','عاطفی','زناشویی','خیانت','جدایی'],
    'خانواده و تعارضات خانوادگی':['خانواده','پدر','مادر','فرزند','والدین','خواهر','برادر','تعارض خانوادگی'],
    'خواب و آرامش':['خواب','بی‌خوابی','بی خوابی','کابوس','شب خواب'],
    'اعتمادبه‌نفس و عزت‌نفس':['اعتماد به نفس','اعتمادبه‌نفس','عزت نفس','خودباوری','خودم را قبول'],
    'کار و فشار شغلی':['کار','شغل','مدیر','همکار','محیط کاری','فشار کاری','بیکاری'],
    'تحصیل و فشار درسی':['درس','دانشگاه','مدرسه','امتحان','کنکور','تحصیل','دانشجو'],
    'سوگ و فقدان':['فوت','مرگ','سوگ','از دست دادن','فقدان'],
    'خشم و کنترل هیجان':['عصبانی','خشم','پرخاش','کنترل خشم','زودجوش'],
    'وسواس و افکار مزاحم':['وسواس','اجبار','فکر مزاحم','افکار مزاحم','شستشو'],
    'تصمیم‌گیری و انتخاب':['تصمیم','انتخاب','دوراهی','مردد','مهاجرت'],
    'کودک و نوجوان':['کودک','نوجوان','بچه','فرزندم','تربیت'],
    'مشکلات فردی و سبک زندگی':['تنهایی','اعتماد','عادت','تمرکز','انگیزه','خودشناسی']
  };
  function sentences(text){return String(text).replace(/\r/g,'').split(/(?<=[.!؟؛\n])\s+|\n+/).map(s=>s.trim()).filter(s=>s.length>10)}
  function words(s){return s.toLowerCase().replace(/[^\u0600-\u06FF\u200c\d\s]/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOP.has(w))}
  function summarize(text){
    const ss=sentences(text);if(!ss.length)return text.trim();if(ss.length<=3)return ss.join(' ');
    const freq={};ss.forEach(s=>words(s).forEach(w=>freq[w]=(freq[w]||0)+1));
    const scored=ss.map((s,i)=>{const ws=words(s);let score=ws.reduce((a,w)=>a+(freq[w]||0),0)/(ws.length||1);score+=Math.max(0,1-i/ss.length)*1.4;if(/(مشکل|دلیل|علت|احساس|نگران|می‌خواهم|می خواهم|کمک|مدت|اخیراً|اخیرا)/.test(s))score+=2;return {s,i,score}});
    const n=Math.min(3,Math.max(1,Math.ceil(ss.length*.35)));return scored.sort((a,b)=>b.score-a.score).slice(0,n).sort((a,b)=>a.i-b.i).map(x=>x.s).join(' ');
  }
  function topics(text){
    const t=String(text).toLowerCase();
    return Object.entries(TOPICS).map(([name,ks])=>({name,score:ks.reduce((n,k)=>n+(t.includes(k.toLowerCase())?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5).map(x=>x.name);
  }
  function keyPoints(text){
    const ss=sentences(text);return ss.filter(s=>/(مدت|اخیراً|اخیرا|می‌خواهم|می خواهم|مشکل|علت|دلیل|کمک|احساس|نگران|تصمیم)/.test(s)).slice(0,4);
  }
  function run(card,button){
    const id=(card.querySelector('[data-a]')||card.querySelector('[data-finish]')||card.querySelector('[data-start]')||card.querySelector('[data-cancel-session]'))?.dataset.a||card.querySelector('[data-finish]')?.dataset.finish||card.querySelector('[data-start]')?.dataset.start||card.querySelector('[data-cancel-session]')?.dataset.cancelSession;
    const reason=card.querySelector('.reason')?.innerText?.replace(/^علت مراجعه:\s*/,'').trim();
    if(!id||!reason||reason==='ثبت نشده')return;
    button.disabled=true;button.textContent='⏳ در حال خلاصه‌سازی محلی...';
    let box=card.querySelector('.ai-summary');if(!box){box=document.createElement('div');box.className='ai-summary';card.appendChild(box)}
    const summary=summarize(reason), ts=topics(reason), kp=keyPoints(reason);
    box.innerHTML='<div><b>🧠 خلاصه هوشمند مراجعه</b><span class="local-badge">رایگان • پردازش روی دستگاه</span></div><div style="margin-top:8px"><b>خلاصه اولیه:</b><div class="muted" style="margin-top:4px;white-space:pre-wrap">'+esc(summary||reason)+'</div></div>'+(ts.length?'<div style="margin-top:9px"><b>سرفصل‌های پیشنهادی:</b><ul style="margin:6px 0;padding-right:22px">'+ts.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>':'')+(kp.length?'<div style="margin-top:9px"><b>نکات قابل توجه از شرح مراجعه:</b><ul style="margin:6px 0;padding-right:22px">'+kp.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>':'')+'<div class="muted" style="margin-top:8px">⚠️ این ابزار صرفاً برای آماده‌سازی مشاور است؛ تشخیص، ارزیابی بالینی یا توصیه درمانی ارائه نمی‌کند.</div>';
    button.textContent='🔄 خلاصه‌سازی مجدد';button.disabled=false;
  }
  function inject(){
    if(!document.getElementById('ai-summary-style')){const st=document.createElement('style');st.id='ai-summary-style';st.textContent='.ai-summary{margin-top:10px;padding:13px;border-radius:13px;background:linear-gradient(135deg,#eef2ff,#faf5ff);border:1px solid #c7d2fe}.ai-summary ul{margin-bottom:0}.ai-summary-btn{background:#4338ca!important}.ai-summary .local-badge{display:inline-block;margin-right:8px;padding:3px 7px;border-radius:999px;background:#dcfce7;color:#166534;font-size:11px}.ai-summary .muted{color:#475569}';document.head.appendChild(st)}
    document.querySelectorAll('#appointmentList .appointment').forEach(card=>{if(card.querySelector('.ai-summary-btn'))return;const reason=card.querySelector('.reason')?.innerText?.trim();if(!reason||reason.endsWith('ثبت نشده'))return;const actions=card.querySelector('.actions')||card;const b=document.createElement('button');b.className='btn ai-summary-btn';b.textContent='🧠 دریافت سرفصل و خلاصه رایگان';b.onclick=()=>run(card,b);actions.appendChild(b)});
  }
  const obs=new MutationObserver(inject);obs.observe(document.documentElement,{childList:true,subtree:true});setTimeout(inject,700);setInterval(inject,1800);
})();
