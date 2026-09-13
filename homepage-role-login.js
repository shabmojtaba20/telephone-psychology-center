(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const wait=fn=>{if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();};
  wait(function(){
    const btn=document.getElementById('loginBtn');
    const input=document.getElementById('loginIdentifier');
    const pass=document.getElementById('loginPassword');
    const msg=document.getElementById('authMsg');
    if(!btn||!input||!pass)return;
    const show=(text,ok)=>{if(msg){msg.className='msg '+(ok?'ok':'err');msg.textContent=text;}};
    const isEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    const client=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;
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
        const{data:roles,error:roleError}=await client.rpc('admin_get_user_roles',{p_user_id:data.user.id});
        if(roleError)throw roleError;
        const names=[...new Set((roles||[]).map(r=>r.name).filter(Boolean))];
        if(names.length){
          sessionStorage.setItem('activeAdminRole',names[0]);
          sessionStorage.removeItem('logoutInProgress');
          location.replace('/admin-professional.html?v='+Date.now());
          return;
        }
        show('ورود موفق بود.',true);
        setTimeout(()=>location.reload(),350);
      }catch(err){
        btn.disabled=false;
        show(err?.message||'ایمیل یا رمز عبور صحیح نیست.');
      }
    },true);
  });
})();
