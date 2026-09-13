(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  const ROLE_META={
    super_admin:{title:'مدیر ارشد',icon:'🛡️',route:'/admin-professional.html'},
    finance_manager:{title:'مدیر مالی',icon:'💰',route:'/admin-v5.html'},
    consultant_manager:{title:'مدیر مشاوران',icon:'👨‍⚕️',route:'/admin-professional.html'},
    appointment_manager:{title:'مدیر نوبت‌ها',icon:'📅',route:'/admin-professional.html'},
    content_manager:{title:'مدیر محتوا',icon:'📢',route:'/admin-professional.html'}
  };
  const style=`
  .role-profile{position:relative;display:inline-block;z-index:1000}.role-profile-btn{border:1px solid #e5e7eb;background:#fff;color:#182033;border-radius:12px;padding:8px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 3px 12px #11182710}.role-profile-btn small{color:#6b7280}.role-menu{display:none;position:absolute;right:0;top:calc(100% + 8px);width:290px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:12px;box-shadow:0 18px 45px #11182722}.role-menu.open{display:block}.role-user{padding:8px 10px 12px;border-bottom:1px solid #eee;margin-bottom:8px}.role-user b{display:block}.role-user small{color:#6b7280;word-break:break-all}.role-label{font-size:12px;color:#6b7280;margin:8px 10px}.role-item{width:100%;border:1px solid #e5e7eb;background:#fff;border-radius:11px;padding:10px;margin:5px 0;text-align:right;display:flex;align-items:center;gap:9px;cursor:pointer}.role-item:hover{background:#f5f7ff;border-color:#c7d2fe}.role-item.current{background:#eef2ff;border-color:#818cf8}.role-item span{flex:1}.role-item em{font-style:normal;font-size:11px;color:#6b7280}.role-back{width:100%;border:0;background:#f3f4f6;border-radius:10px;padding:9px;margin-top:7px;cursor:pointer}
  @media(max-width:700px){.role-menu{position:fixed;right:12px;left:12px;top:58px;width:auto}}
  `;
  function addStyle(){if(document.getElementById('role-switcher-style'))return;const s=document.createElement('style');s.id='role-switcher-style';s.textContent=style;document.head.appendChild(s)}
  async function init(){
    try{
      addStyle();
      const sb=window.supabase.createClient(SB_URL,SB_KEY);
      const {data:{user},error:userErr}=await sb.auth.getUser();
      if(userErr||!user)return;
      const {data:roles,error}=await sb.rpc('admin_get_user_roles',{p_user_id:user.id});
      if(error||!roles?.length)return;
      const names=[...new Set(roles.map(r=>r.name).filter(r=>ROLE_META[r]))];
      if(!names.length)return;
      window.__adminRoles=names;
      const host=document.createElement('div');host.className='role-profile';
      const current=document.documentElement.dataset.activeRole||sessionStorage.getItem('activeAdminRole')||names[0];
      const meta=ROLE_META[current]||ROLE_META[names[0]];
      host.innerHTML=`<button class="role-profile-btn" type="button" aria-expanded="false"><span style="font-size:20px">👤</span><span><b>مجتبی شبیهی</b><br><small>${meta.icon} ${meta.title}</small></span><span>⌄</span></button><div class="role-menu"><div class="role-user"><b>مجتبی شبیهی</b><small>${user.email||''}</small></div><div class="role-label">نقش‌های قابل دسترسی شما</div><div class="role-list"></div><button class="role-back" type="button">↩ بازگشت به سایت اصلی</button></div>`;
      const list=host.querySelector('.role-list');
      names.forEach(name=>{const m=ROLE_META[name];const b=document.createElement('button');b.type='button';b.className='role-item'+(name===current?' current':'');b.innerHTML=`<span style="font-size:20px">${m.icon}</span><span>${m.title}</span><em>${name===current?'نقش فعلی':'ورود'}</em>`;b.onclick=()=>{sessionStorage.setItem('activeAdminRole',name);location.href=m.route+'?role='+encodeURIComponent(name)+'&v='+Date.now()};list.appendChild(b)});
      host.querySelector('.role-back').onclick=()=>{sessionStorage.removeItem('activeAdminRole');location.href='/'};
      const toggle=host.querySelector('.role-profile-btn'),menu=host.querySelector('.role-menu');toggle.onclick=()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',open?'true':'false')};
      document.addEventListener('click',e=>{if(!host.contains(e.target))menu.classList.remove('open')});
      const target=document.querySelector('.top .actions')||document.querySelector('.top');
      if(target)target.prepend(host);else document.body.prepend(host);
    }catch(e){console.error('role switcher',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
