(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const wait=fn=>{if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();};
  const getClient=()=>window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;
  const routeForRoles=async(client,user)=>{
    const {data:roles}=await client.rpc('admin_get_user_roles',{p_user_id:user.id});
    const names=[...new Set((roles||[]).map(r=>r.name).filter(Boolean))];
    if(names.includes('super_admin'))return ['/admin-professional.html','super_admin'];
    if(names.includes('finance_manager'))return ['/admin-v5.html','finance_manager'];
    if(names.includes('consultant_manager'))return ['/admin-professional.html','consultant_manager'];
    if(names.includes('appointment_manager'))return ['/admin-professional.html','appointment_manager'];
    if(names.includes('content_manager'))return ['/admin-professional.html','content_manager'];
    try{
      const {data:link}=await client.from('consultant_user_links').select('consultant_id').eq('user_id',user.id).maybeSingle();
      if(link?.consultant_id)return ['/consultant-panel-professional.html','consultant'];
    }catch(_){}
    return null;
  };
  const safeReturnTo=value=>{
    if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//'))return null;
    const allowed=new Set(['/admin-professional.html','/admin-v5.html','/consultant-panel-professional.html','/consultant-settlements.html','/finance-audit.html','/finance-reports.html','/order-review.html','/payment.html','/card-payment.html','/submit-receipt.html']);
    const path=value.split('?')[0];
    return allowed.has(path)?value:null;
  };
  wait(function(){
    const btn=document.getElementById('loginBtn');
    const input=document.getElementById('loginIdentifier');
    const pass=document.getElementById('loginPassword');
    const msg=document.getElementById('authMsg');
    if(!btn||!input||!pass)return;
    const show=(text,ok)=>{if(msg){msg.className='msg '+(ok?'ok':'err');msg.textContent=text;}};
    const isEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    const client=getClient();
    if(!client)return;
    btn.addEventListener('click',async function(e){
      const identifier=input.value.trim();
      if(!isEmail(identifier))return;
      e.preventDefault();e.stopImmediatePropagation();
      btn.disabled=true;show('در حال بررسی حساب و نقش شما...',true);
      try{
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
    const footer=document.querySelector('footer.footer');
    if(!footer || footer.querySelector('[data-footer-panels]')) return;
    const box=document.createElement('div');
    box.setAttribute('data-footer-panels','1');
    box.style.cssText='margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.14);display:flex;gap:10px;flex-wrap:wrap;align-items:center;';
    box.innerHTML='<a href="/?login=1&returnTo=%2Fadmin-professional.html" data-footer-panel="/admin-professional.html" style="display:inline-block;padding:9px 14px;border-radius:10px;background:#5b5bd6;color:#fff;text-decoration:none;font-weight:700">🔐 ورود به پنل مدیریت</a><a href="/?login=1&returnTo=%2Fconsultant-panel-professional.html" data-footer-panel="/consultant-panel-professional.html" style="display:inline-block;padding:9px 14px;border-radius:10px;background:#fff;color:#30364d;text-decoration:none;font-weight:700">👨‍⚕️ پنل مشاور</a>';
    footer.querySelector('.c')?.appendChild(box);
    box.querySelectorAll('[data-footer-panel]').forEach(link=>link.addEventListener('click',async function(e){
      e.preventDefault();
      const target=safeReturnTo(this.getAttribute('data-footer-panel'));
      if(!target)return;
      const client=getClient();
      try{
        if(!client)throw new Error('auth-client-unavailable');
        const {data:{user}}=await client.auth.getUser();
        if(!user){location.replace('/?login=1&returnTo='+encodeURIComponent(target));return;}
        const destination=await routeForRoles(client,user);
        if(destination){
          sessionStorage.setItem('activeAdminRole',destination[1]);
          location.replace(destination[0]+'?role='+encodeURIComponent(destination[1])+'&v='+Date.now());
          return;
        }
        location.replace('/?login=1&returnTo='+encodeURIComponent(target));
      }catch(_){
        location.replace('/?login=1&returnTo='+encodeURIComponent(target));
      }
    }));
  });
})();
