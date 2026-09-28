(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const norm=v=>(v||'').replace(/[\u200c\u200f\u202a-\u202e]/g,'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const link=(label,value,href)=>value?'<a class="footer-contact-item" href="'+href+'"'+(href.startsWith('http')?' target="_blank" rel="noopener"':'')+'><span class="footer-contact-label">'+label+'</span><span>'+esc(value)+'</span></a>':'';
  async function loadContacts(){
    if(document.querySelector('.footer-contact-section[data-loaded]')) return;
    try{
      const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      const db=createClient(SB_URL,SB_KEY);
      const {data,error}=await db.from('center_public_settings').select('phone,mobile,email,address,whatsapp_url,telegram_url,instagram_url,working_hours').eq('id',1).maybeSingle();
      if(error||!data)return;
      const items=[
        link('☎️ تلفن',data.phone,data.phone?'tel:'+String(data.phone).replace(/[^+\d]/g,''):''),
        link('📱 موبایل',data.mobile,data.mobile?'tel:'+String(data.mobile).replace(/[^+\d]/g,''):''),
        link('✉️ ایمیل',data.email,data.email?'mailto:'+data.email:''),
        link('📍 آدرس',data.address,'#'),
        link('💬 واتساپ',data.whatsapp_url,'https://'+String(data.whatsapp_url).replace(/^https?:\\/\\//,'')),
        link('✈️ تلگرام',data.telegram_url,'https://'+String(data.telegram_url).replace(/^https?:\\/\\//,'')),
        link('📷 اینستاگرام',data.instagram_url,'https://'+String(data.instagram_url).replace(/^https?:\\/\\//,'')),
        link('🕐 ساعات فعالیت',data.working_hours,'#')
      ].filter(Boolean).join('');
      if(!items)return;
      const target=[...document.querySelectorAll('footer')].find(el=>el.querySelector('.footer-panel-links'))||document.querySelector('footer');
      if(!target||target.querySelector('.footer-contact-section'))return;
      const section=document.createElement('div');
      section.className='footer-contact-section'; section.dataset.loaded='1';
      section.innerHTML='<div class="footer-panel-title">راه‌های ارتباطی</div><div class="footer-contact-grid">'+items+'</div>';
      target.querySelector('.c')?.appendChild(section);
    }catch(e){console.warn('footer contact load failed',e)}
  }
  function add(){
    const cleanEducationFooter=()=>{
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
    };
    cleanEducationFooter();
    const blocks=[...document.querySelectorAll('.footer-panel-links')];
    if(blocks.length>1) blocks.slice(0,-1).forEach(x=>x.closest('.footer')?.remove()||x.remove());
    const panelSections=[...document.querySelectorAll('footer, body > .footer')].filter(el=>norm(el.textContent).includes('دسترسی پنل‌ها'));
    if(panelSections.length>1) panelSections.slice(0,-1).forEach(el=>el.remove());
    if(!document.querySelector('.site-credit')){
      const f=document.createElement('footer');
      f.className='site-credit'; f.dir='rtl';
      f.innerHTML='<b>طراح: مهندس مجتبی شبیهی</b><span>کلیه حقوق این سایت برای پدیدآورنده محفوظ است.</span>';
      const style=document.createElement('style');
      style.textContent='.site-credit{margin:34px auto 18px;padding:12px 16px;text-align:center;color:#7b8494;font:12px/1.9 Tahoma,Arial,sans-serif}.site-credit b{font-weight:700;color:#5f6878}.site-credit span{display:block}.footer-contact-section{margin-top:20px;padding-top:18px;border-top:1px solid rgba(127,127,127,.18)}.footer-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:9px;margin-top:10px}.footer-contact-item{display:flex;gap:7px;align-items:flex-start;padding:9px 10px;border:1px solid rgba(127,127,127,.18);border-radius:10px;text-decoration:none;color:inherit}.footer-contact-label{font-weight:700;white-space:nowrap}.footer-contact-item:hover{opacity:.82}';
      document.head.appendChild(style);
      (document.body||document.documentElement).appendChild(f);
    }
    loadContacts();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add); else add();
  new MutationObserver(()=>add()).observe(document.documentElement,{subtree:true,childList:true});
})();