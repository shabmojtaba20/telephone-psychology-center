(function(){
  function add(){
    // Keep only one panel-access block when another layer (such as the Worker) injected a duplicate.
    // Remove only education/workshop menu items from the main footer; keep the homepage education section and panel-access links intact.
    document.querySelectorAll('footer a, footer button, footer li, footer .footer-menu, footer .footer-links').forEach(el=>{
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(/آموزش|کارگاه/.test(t) && !el.closest('.footer-panel-links')) el.remove();
    });
    const blocks=[...document.querySelectorAll('.footer-panel-links')];
    if(blocks.length>1) blocks.slice(0,-1).forEach(x=>x.remove());
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
})();