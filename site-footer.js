(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const norm=v=>(v||'').replace(/[\u200c\u200f\u202a-\u202e]/g,'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const safeUrl=v=>{
    const s=String(v||'').trim();
    if(!s)return '';
    return /^https?:\/\//i.test(s)?s:'https://'+s.replace(/^\/\//,'');
  };
  const contactLink=(label,value,href,external=false)=>{
    if(!value)return '';
    return '<a class="footer-contact-item" href="'+esc(href)+'"'+(external?' target="_blank" rel="noopener"':'')+'><span class="footer-contact-label">'+label+'</span><span>'+esc(value)+'</span></a>';
  };
  const contactText=(label,value)=>{
    if(!value)return '';
    return '<div class="footer-contact-item footer-contact-static"><span class="footer-contact-label">'+label+'</span><span>'+esc(value)+'</span></div>';
  };
  async function loadContacts(){
    const isHome=location.pathname==='/' || location.pathname==='/index.html';
    if(!isHome)return;
    if(document.querySelector('.footer-contact-section[data-loaded]')) return;
    try{
      const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      const db=createClient(SB_URL,SB_KEY);
      const {data,error}=await db.from('center_public_settings')
        .select('phone,mobile,email,address,whatsapp_url,telegram_url,instagram_url,working_hours')
        .eq('id',1).maybeSingle();
      if(error||!data)return;
      const items=[
        contactLink('☎️ تلفن',data.phone,data.phone?'tel:'+String(data.phone).replace(/[^+\d]/g,''):''),
        contactLink('📱 موبایل',data.mobile,data.mobile?'tel:'+String(data.mobile).replace(/[^+\d]/g,''):''),
        contactLink('✉️ ایمیل',data.email,data.email?'mailto:'+data.email:''),
        contactText('📍 آدرس',data.address),
        contactLink('💬 واتساپ',data.whatsapp_url,safeUrl(data.whatsapp_url),true),
        contactLink('✈️ تلگرام',data.telegram_url,safeUrl(data.telegram_url),true),
        contactLink('📷 اینستاگرام',data.instagram_url,safeUrl(data.instagram_url),true),
        contactText('🕐 ساعات فعالیت',data.working_hours)
      ].filter(Boolean).join('');
      if(!items)return;
      const target=document.querySelector('footer .footer-contact-host');
      if(!target)return;
      target.querySelector('.footer-contact-placeholder')?.remove();
      if(target.querySelector('.footer-contact-section'))return;
      const section=document.createElement('div');
      section.className='footer-contact-section';
      section.dataset.loaded='1';
      section.innerHTML='<div class="footer-panel-title">راه‌های ارتباطی</div><div class="footer-contact-grid">'+items+'</div>';
      target.appendChild(section);
    }catch(e){console.warn('footer contact load failed',e)}
  }
  function applyPanelColors(){
    document.querySelectorAll('.footer-panel-links').forEach(nav=>{
      const links=[...nav.querySelectorAll('a')];
      links.forEach(a=>{
        const href=a.getAttribute('href')||'';
        a.style.color='#000';
        a.style.fontWeight='700';
        a.style.border='1px solid #000';
        a.style.textDecoration='none';
        let icon='⚙️';
        if(href.includes('/admin.html')){
          icon='🛡️';
          a.style.background='#239f40';
          a.style.color='#000';
        }else if(href.includes('/admin-v5.html')){
          icon='📊';
          a.style.background='#fff';
          a.style.color='#000';
        }else if(href.includes('/consultant-panel.html')){
          icon='🧑‍⚕️';
          a.style.background='#da251d';
          a.style.color='#000';
        }
        if(!a.dataset.panelIcon){
          a.textContent=icon+' '+a.textContent.trim();
          a.dataset.panelIcon='1';
        }
      });
    });
  }

  function add(){
    const exact=/مطالب آموزشی\s*و\s*کارگاه(?:ها|‌ها)?/;
    document.querySelectorAll('body *').forEach(el=>{
      if(el.closest('#education')) return;
      const t=norm(el.textContent);
      if(!t || el.children.length) return;
      if(exact.test(t)){
        const target=el.closest('a,button,li')||el;
        if(!target.closest('#education')) target.remove();
      }
    });
    document.querySelectorAll('footer .footer-menu, footer .footer-links').forEach(el=>el.remove());

    // User/home footer: rebuild panel access as one canonical block.
    // Remove every old/duplicate panel block first, then create exactly one.
    const isHome=location.pathname==='/' || location.pathname==='/index.html';
    const panelBlocks=[...document.querySelectorAll('.footer-panels')];
    panelBlocks.forEach(el=>el.remove());

    if(isHome){
      const footer=document.querySelector('footer.professional-footer, footer');
      if(footer){
        const section=document.createElement('div');
        section.className='footer-panels';
        section.innerHTML='<div class="footer-panel-title">دسترسی پنل‌ها</div><nav class="footer-panel-links" aria-label="دسترسی به پنل‌ها"><a class="panel-admin" href="/admin.html">پنل مدیریت</a><a class="panel-finance" href="/admin-v5.html">پنل مالی</a><a class="panel-consultant" href="/consultant-panel.html">پنل مشاور</a></nav>';
        const container=footer.querySelector('.c')||footer;
        const bottom=footer.querySelector('.footer-bottom');
        container.insertBefore(section,bottom||null);
      }
    }

    applyPanelColors();

    // Contact data is below the fold; load it after the first paint so it never
    // delays the initial page rendering.
    const defer=window.requestIdleCallback||((fn)=>setTimeout(fn,1200));
    defer(()=>loadContacts());
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add,{once:true}); else add();
})();