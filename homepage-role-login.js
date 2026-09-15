(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const wait=fn=>{if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();};
  const loadClient=async()=>{
    try{
      if(window.supabase?.createClient)return window.supabase.createClient(SB_URL,SB_KEY);
      const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      return createClient(SB_URL,SB_KEY);
    }catch(_){return null;}
  };
  const routeForRoles=async(client,user)=>{
    if(!client||!user)return null;
    try{
      const {data:roles}=await client.rpc('admin_get_user_roles',{p_user_id:user.id});
      const names=[...new Set((roles||[]).map(r=>r.name).filter(Boolean))];
      if(names.includes('super_admin'))return ['/admin-professional.html','super_admin'];
      if(names.includes('finance_manager'))return ['/admin-v5.html','finance_manager'];
      if(names.includes('consultant_manager'))return ['/admin-professional.html','consultant_manager'];
      if(names.includes('appointment_manager'))return ['/admin-professional.html','appointment_manager'];
      if(names.includes('content_manager'))return ['/admin-professional.html','content_manager'];
    }catch(_){}
    try{
      const {data:link}=await client.from('consultant_user_links').select('consultant_id').eq('user_id',user.id).maybeSingle();
      if(link?.consultant_id)return ['/consultant-panel-professional.html','consultant'];
    }catch(_){}
    return null;
  };
  const safeReturnTo=value=>{
    if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//'))return null;
    const allowed=new Set(['/admin-professional.html','/admin-v5.html','/consultant-panel-professional.html','/consultant-settlements.html','/finance-audit.html','/finance-reports.html','/order-review.html','/payment.html','/card-payment.html','/submit-receipt.html','/admin.html','/admin-v4.html','/admin-invoices.html','/consultant-panel.html']);
    const path=value.split('?')[0];
    return allowed.has(path)?value:null;
  };
  const goTop=()=>{
    try{window.scrollTo({top:0,left:0,behavior:'smooth'});}catch(_){window.scrollTo(0,0);}
    history.replaceState(null,'',location.pathname+location.search.replace(/([?&])(?:login|returnTo)=[^&]*&?/g,'$1').replace(/[?&]$/,''));
  };
  const handlePanelNavigation=async(target)=>{
    const safeTarget=safeReturnTo(target);
    if(!safeTarget)return;
    const client=await loadClient();
    // If the visitor is not authenticated, keep the intended behavior: send them to login.
    if(!client){location.replace('/?login=1&returnTo='+encodeURIComponent(safeTarget));return;}
    try{
      const {data:{user}}=await client.auth.getUser();
      if(!user){location.replace('/?login=1&returnTo='+encodeURIComponent(safeTarget));return;}
      // Authenticated users are routed by their actual role. A normal user has no admin role,
      // so do NOT send them back to the login screen; simply return them to the top of homepage.
      const destination=await routeForRoles(client,user);
      if(destination){
        sessionStorage.setItem('activeAdminRole',destination[1]);
        location.replace(destination[0]+'?role='+encodeURIComponent(destination[1])+'&v='+Date.now());
        return;
      }
      goTop();
    }catch(_){
      // A valid logged-in session without a management/consultant role is a normal user.
      goTop();
    }
  };

  wait(function(){
    const btn=document.getElementById('loginBtn');
    const input=document.getElementById('loginIdentifier');
    const pass=document.getElementById('loginPassword');
    const msg=document.getElementById('authMsg');
    if(!btn||!input||!pass)return;
    const show=(text,ok)=>{if(msg){msg.className='msg '+(ok?'ok':'err');msg.textContent=text;}};
    const isEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    btn.addEventListener('click',async function(e){
      const identifier=input.value.trim();
      if(!isEmail(identifier))return;
      e.preventDefault();e.stopImmediatePropagation();
      btn.disabled=true;show('در حال بررسی حساب و نقش شما...',true);
      try{
        const client=await loadClient();
        if(!client)throw new Error('اتصال احراز هویت در دسترس نیست.');
        const{data,error}=await client.auth.signInWithPassword({email:identifier,password:pass.value});
        if(error)throw error;
        if(!data?.user)throw new Error('ورود انجام نشد.');
        sessionStorage.removeItem('logoutInProgress');
        const destination=await routeForRoles(client,data.user);
        const params=new URLSearchParams(location.search);
        const returnTo=safeReturnTo(params.get('returnTo'));
        if(returnTo && destination){
          sessionStorage.setItem('activeAdminRole',destination[1]);
          location.replace(returnTo);
          return;
        }
        if(destination){
          sessionStorage.setItem('activeAdminRole',destination[1]);
          location.replace(destination[0]+'?role='+encodeURIComponent(destination[1])+'&v='+Date.now());
          return;
        }
        show('ورود موفق بود. پنل کاربری شما آماده است.',true);
        setTimeout(()=>location.reload(),350);
      }catch(err){
        btn.disabled=false;
        show(err?.message||'ایمیل یا رمز عبور صحیح نیست.');
      }
    },true);
  });

  wait(function(){
    const params=new URLSearchParams(location.search);
    if(params.get('login')==='1'){
      const open=()=>{
        const account=document.getElementById('accountBtn');
        if(account){account.click();return true;}
        const modal=document.getElementById('authModal');
        if(modal)modal.classList.remove('hidden');
        return !!modal;
      };
      if(!open())setTimeout(open,250);
    }
  });

  wait(function(){
    const panelPaths=new Set(['/admin.html','/admin-v2.html','/admin-v3.html','/admin-v4.html','/admin-v5.html','/admin-professional.html','/admin-invoices.html','/consultant-panel.html','/consultant-panel-professional.html','/consultant-settlements.html','/finance-audit.html','/finance-reports.html','/order-review.html','/payment.html','/card-payment.html','/submit-receipt.html']);
    document.addEventListener('click',function(e){
      if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      const a=e.target.closest?.('a[href]');
      if(!a)return;
      const raw=a.getAttribute('href');
      if(!raw||raw.startsWith('#')||raw.startsWith('mailto:')||raw.startsWith('tel:'))return;
      let url;
      try{url=new URL(raw,location.href);}catch(_){return;}
      if(url.origin!==location.origin||!panelPaths.has(url.pathname.toLowerCase()))return;
      e.preventDefault();e.stopPropagation();
      handlePanelNavigation(url.pathname+url.search+url.hash);
    },true);
  });

  wait(function(){
    const footer=document.querySelector('footer.footer');
    if(!footer || footer.querySelector('[data-footer-panels]')) return;
    const box=document.createElement('div');
    box.setAttribute('data-footer-panels','1');
    box.style.cssText='margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.14);display:flex;gap:10px;flex-wrap:wrap;align-items:center;';
    box.innerHTML='<a href="/admin-professional.html" data-footer-panel="/admin-professional.html" style="display:inline-block;padding:9px 14px;border-radius:10px;background:#5b5bd6;color:#fff;text-decoration:none;font-weight:700">🔐 ورود به پنل مدیریت</a><a href="/consultant-panel-professional.html" data-footer-panel="/consultant-panel-professional.html" style="display:inline-block;padding:9px 14px;border-radius:10px;background:#fff;color:#30364d;text-decoration:none;font-weight:700">👨‍⚕️ پنل مشاور</a><a href="/admin-v5.html" data-footer-panel="/admin-v5.html" style="display:inline-block;padding:9px 14px;border-radius:10px;background:#fff;color:#30364d;text-decoration:none;font-weight:700">💳 پنل مالی</a>';
    footer.querySelector('.c')?.appendChild(box);
  });
})();
