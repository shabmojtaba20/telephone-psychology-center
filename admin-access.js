(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  let db;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast=(msg,bad=false)=>{if(typeof window.note==='function') window.note(msg,bad); else alert(msg)};
  async function allowed(){
    db ||= window.supabase.createClient(SB_URL,SB_KEY);
    const r=await db.rpc('has_admin_permission',{p_permission:'security.manage'});
    return !r.error && r.data===true;
  }
  async function loadData(){
    const [u,r]=await Promise.all([db.rpc('admin_list_users'),db.rpc('admin_list_roles')]);
    if(u.error) throw u.error; if(r.error) throw r.error;
    return {users:u.data||[],roles:r.data||[]};
  }
  function openPanel(data){
    let el=document.getElementById('adminAccessModal');
    if(!el){
      el=document.createElement('div'); el.id='adminAccessModal';
      el.style='position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
      el.innerHTML='<div style="background:#fff;width:min(1000px,100%);max-height:92vh;overflow:auto;border-radius:18px;padding:20px;box-sizing:border-box"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 style="margin:0">🔐 مدیریت دسترسی مدیران</h2><button id="accessClose" class="btn gray">بستن</button></div><p style="color:#64748b">برای هر کاربر، یک یا چند نقش مدیریتی تعیین کنید. دسترسی‌ها از سمت Supabase نیز کنترل می‌شوند.</p><div id="accessBody"></div></div>';
      document.body.appendChild(el); document.getElementById('accessClose').onclick=()=>el.remove();
    }
    const body=document.getElementById('accessBody');
    const roleOptions=data.roles.map(r=>`<option value="${r.id}">${esc(r.name)} — ${esc(r.description||'')}</option>`).join('');
    body.innerHTML=`<div class="card" style="margin-bottom:12px"><label>کاربر<select id="accessUser">${data.users.map(u=>`<option value="${u.user_id}">${esc(u.email||u.user_id)} — نقش‌ها: ${esc((u.roles||[]).join(', ')||'بدون نقش')}</option>`).join('')}</select></label><label>نقش جدید<select id="accessRole">${roleOptions}</select></label><button class="btn green" id="assignRole">➕ اعطای نقش</button></div><div class="table"><table><thead><tr><th>کاربر</th><th>نقش‌های فعلی</th><th>عملیات</th></tr></thead><tbody>${data.users.map(u=>`<tr><td>${esc(u.email||u.user_id)}</td><td>${(u.roles||[]).length?u.roles.map(x=>`<span style="display:inline-block;background:#eef2ff;padding:4px 7px;border-radius:7px;margin:2px">${esc(x)}</span>`).join(''):'بدون نقش'}</td><td><select data-revoke-user="${u.user_id}"><option value="">انتخاب نقش برای حذف</option>${(u.roles||[]).map(n=>{const rr=data.roles.find(x=>x.name===n);return rr?`<option value="${rr.id}">${esc(n)}</option>`:''}).join('')}</select> <button class="btn red" data-revoke="${u.user_id}">حذف نقش</button></td></tr>`).join('')}</tbody></table></div>`;
    document.getElementById('assignRole').onclick=async()=>{const uid=document.getElementById('accessUser').value,rid=document.getElementById('accessRole').value;if(!uid||!rid)return toast('کاربر و نقش را انتخاب کنید',true);const r=await db.rpc('admin_assign_role',{p_user_id:uid,p_role_id:Number(rid)});if(r.error)return toast(r.error.message,true);toast('نقش با موفقیت اعطا شد');render();};
    body.querySelectorAll('[data-revoke]').forEach(b=>b.onclick=async()=>{const uid=b.dataset.revoke,sel=body.querySelector(`[data-revoke-user="${uid}"]`);const rid=sel?.value;if(!rid)return toast('نقش موردنظر را انتخاب کنید',true);if(!confirm('این نقش حذف شود؟'))return;const r=await db.rpc('admin_revoke_role',{p_user_id:uid,p_role_id:Number(rid)});if(r.error)return toast(r.error.message,true);toast('نقش حذف شد');render();});
  }
  async function render(){try{if(!(await allowed()))return toast('این حساب مجوز مدیریت دسترسی ندارد.',true);openPanel(await loadData())}catch(e){toast(e.message||'خطا در مدیریت دسترسی',true)}}
  function init(){
    db ||= window.supabase.createClient(SB_URL,SB_KEY);
    if(document.getElementById('accessNavBtn')) return;
    const side=document.getElementById('side'); if(!side)return;
    const b=document.createElement('button');b.id='accessNavBtn';b.className='nav';b.textContent='🔐 مدیریت دسترسی';b.dataset.page='security';b.onclick=render;side.insertBefore(b,document.getElementById('logoutBtn'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
