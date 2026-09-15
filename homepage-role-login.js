(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const wait=fn=>{if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();};
  const loadClient=async()=>{try{if(window.supabase?.createClient)return window.supabase.createClient(SB_URL,SB_KEY);const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');return createClient(SB_URL,SB_KEY);}catch(_){return null;}};
  const getRoles=async(client,user)=>{if(!client||!user)return [];try{const {data}=await client.rpc('admin_get_user_roles',{p_user_id:user.id});return [...new Set((data||[]).map(r=>r.name).filter(Boolean))];}catch(_){return [];}};
  const hasConsultantLink=async(client,user)=>{try{const {data}=await client.from('consultant_user_links').select('consultant_id').eq('user_id',user.id).maybeSingle();return !!data?.consultant_id;}catch(_){return false;}};
  const routeForTarget=async(client,user,target)=>{
    const roles=await getRoles(client,user);
    const path=(target||'').split('?')[0].toLowerCase();
    if(path==='/admin-professional.html'||path==='/admin.html'||path==='/admin-v4.html') return roles.includes('super_admin')?['/admin-professional.html','super_admin']:null;
    if(path==='/admin-v5.html'||path==='/finance-reports.html'||path==='/finance-audit.html') return roles.includes('finance_manager')?['/admin-v5.html','finance_manager']:null;
    if(path==='/consultant-panel-professional.html'||path==='/consultant-panel.html'||path==='/consultant-settlements.html') return (await hasConsultantLink(client,user))?['/consultant-panel-professional.html','consultant']:null;
    if(roles.includes('super_admin'))return ['/admin-professional.html','super_admin'];
    if(roles.includes('finance_manager'))return ['/admin-v5.html','finance_manager'];
    if(await hasConsultantLink(client,user))return ['/consultant-panel-professional.html','consultant'];
    return null;
  };
  const safeReturnTo=value=>{if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//'))return null;const allowed=new Set(['/admin.html','/admin-v2.html','/admin-v3.html','/admin-v4.html','/admin-v5.html','/admin-professional.html','/admin-invoices.html','/consultant-panel.html','/consultant-panel-professional.html','/consultant-settlements.html','/finance-audit.html','/finance-reports.html','/order-review.html','/payment.html','/card-payment.html','/submit-receipt.html']);const path=value.split('?')[0];return allowed.has(path)?value:null;};
  const goTop=()=>{try{window.scrollTo({top:0,left:0,behavior:'smooth'});}catch(_){window.scrollTo(0,0);}};
  const sendToLogin=target=>location.replace('/?login=1&returnTo='+encodeURIComponent(target));
  const handlePanelNavigation=async(target)=>{
    const safeTarget=safeReturnTo(target);if(!safeTarget)return;
    const client=await loadClient();
    if(!client){sendToLogin(safeTarget);return;}
    try{
      const {data:{user}}=await client.auth.getUser();
      if(!user){sendToLogin(safeTarget);return;}
      const destination=await routeForTarget(client,user,safeTarget);
      if(destination){sessionStorage.setItem('activeAdminRole',destination[1]);location.replace(destination[0]+'?role='+encodeURIComponent(destination[1])+'&v='+Date.now());return;}
      goTop();
    }catch(_){goTop();}
  };
  wait(function(){
    const btn=document.getElementById('loginBtn'),input=document.getElementById('loginIdentifier'),pass=document.getElementById('loginPassword'),msg=document.getElementById('authMsg');
    if(!btn||!input||!pass)return;
    const show=(text,ok)=>{if(msg){msg.className='msg '+(ok?'ok':'err');msg.textContent=text;}};
    const isEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    btn.addEventListener('click',async function(e){const identifier=input.value.trim();if(!isEmail(identifier))return;e.preventDefault();e.stopImmediatePropagation();btn.disabled=true;show('در حال بررسی حساب و نقش شما...',true);try{const client=await loadClient();if(!client)throw new Error('اتصال احراز هویت در دسترس نیست.');const{data,error}=await client.auth.signInWithPassword({email:identifier,password:pass.value});if(error)throw error;if(!data?.user)throw new Error('ورود انجام نشد.');sessionStorage.removeItem('logoutInProgress');const params=new URLSearchParams(location.search),returnTo=safeReturnTo(params.get('returnTo'));const destination=returnTo?await routeForTarget(client,data.user,returnTo):await routeForTarget(client,data.user,'/admin-professional.html');if(destination){sessionStorage.setItem('activeAdminRole',destination[1]);location.replace(destination[0]+'?role='+encodeURIComponent(destination[1])+'&v='+Date.now());return;}show('ورود موفق بود. به صفحه اصلی بازگردانده شدید.',true);setTimeout(()=>location.reload(),350);}catch(err){btn.disabled=false;show(err?.message||'ایمیل یا رمز عبور صحیح نیست.');}},true);
  });
  wait(function(){const params=new URLSearchParams(location.search);if(params.get('login')==='1'){const open=()=>{const account=document.getElementById('accountBtn');if(account){account.click();return true;}const modal=document.getElementById('authModal');if(modal)modal.classList.remove('hidden');return !!modal;};if(!open())setTimeout(open,250);}});
  wait(function(){
    const footer=document.querySelector('footer.footer');
    if(!footer)return;
    const container=footer.querySelector('.c')||footer;
    if(!container.querySelector('[data-footer-panels]')){
      const box=document.createElement('div');box.setAttribute('data-footer-panels','1');box.style.cssText='margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.14);display:flex;gap:10px;flex-wrap:wrap;align-items:center;';
      box.innerHTML='<strong style="width:100%;color:#fff">دسترسی پنل‌ها</strong><a href="/admin-professional.html" data-footer-panel="/admin-professional.html" style="display:inline-block;padding:9px 14px;border-radius:10px;background:#5b5bd6;color:#fff;text-decoration:none;font-weight:700">🔐 ورود به پنل مدیریت</a><a href="/consultant-panel-professional.html" data-footer-panel="/consultant-panel-professional.html" style="display:inline-block;padding:9px 14px;border-radius:10px;background:#fff;color:#30364d;text-decoration:none;font-weight:700">👨‍⚕️ پنل مشاور</a><a href="/admin-v5.html" data-footer-panel="/admin-v5.html" style="display:inline-block;padding:9px 14px;border-radius:10px;background:#fff;color:#30364d;text-decoration:none;font-weight:700">💳 پنل مالی</a>';
      container.appendChild(box);
    }
    footer.addEventListener('click',function(e){const a=e.target.closest?.('a[data-footer-panel]');if(!a)return;e.preventDefault();e.stopPropagation();handlePanelNavigation(a.getAttribute('data-footer-panel'));});
  });
})();