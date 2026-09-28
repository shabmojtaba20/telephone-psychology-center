(function(){
  function add(){
    const cleanEducationFooter=()=>{
      const norm=v=>(v||'').replace(/[\u200c\u200f\u202a-\u202e]/g,'').replace(/\s+/g,' ').trim();
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
    if(document.querySelector('.site-credit')) return;
    const f=document.createElement('footer');
    f.className='site-credit'; f.dir='rtl';
    f.innerHTML='<b>طراح: مهندس مجتبی شبیهی</b><span>کلیه حقوق این سایت برای پدیدآورنده محفوظ است.</span>';
    const style=document.createElement('style');
    style.textContent='.site-credit{margin:34px auto 18px;padding:12px 16px;text-align:center;color:#7b8494;font:12px/1.9 Tahoma,Arial,sans-serif}.site-credit b{font-weight:700;color:#5f6878}.site-credit span{display:block}';
    document.head.appendChild(style);
    (document.body||document.documentElement).appendChild(f);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add); else add();
  new MutationObserver(()=>add()).observe(document.documentElement,{subtree:true,childList:true});
})();