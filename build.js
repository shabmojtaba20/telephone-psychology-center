const fs = require('fs');
const path = require('path');

const root = __dirname;
const indexFile = path.join(root, 'index.html');
if (!fs.existsSync(indexFile)) throw new Error('index.html not found');

const adminFile = path.join(root, 'admin-v4.html');
if (fs.existsSync(adminFile)) {
  let html = fs.readFileSync(adminFile, 'utf8');
  const marker = '<!-- admin-ui-enhancements -->';
  if (!html.includes(marker)) {
    const enhancement = `
${marker}
<style>
#adminUserBar{position:fixed;top:14px;right:270px;z-index:30;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:8px 12px;box-shadow:0 4px 16px rgba(0,0,0,.08);font-size:13px}
#adminUserBar .user-name{font-weight:700;color:#172033}
#adminUserBar .back-site{border:0;border-radius:8px;background:#4f46e5;color:#fff;padding:7px 11px;text-decoration:none;cursor:pointer}
@media(max-width:700px){#adminUserBar{position:sticky;top:0;right:auto;margin:8px 0;justify-content:space-between;z-index:25}.main{padding-top:8px}}
</style>
<script>
(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  function client(){ return window.supabase.createClient(SB_URL,SB_KEY); }
  async function initAdminUi(){
    try{
      const dbx=client();
      const {data:{session}}=await dbx.auth.getSession();
      if(!session) return;
      let displayName=session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || '';
      if(!displayName){
        const r=await dbx.from('user_profiles').select('full_name').eq('user_id',session.user.id).maybeSingle();
        if(!r.error) displayName=r.data?.full_name || '';
      }
      if(!displayName) displayName=session.user?.email || 'مدیر';
      if(document.getElementById('adminUserBar')) return;
      const bar=document.createElement('div');
      bar.id='adminUserBar';
      bar.innerHTML='<span>👤 <span class="user-name"></span></span><a class="back-site" href="/">↩ بازگشت به سایت</a>';
      bar.querySelector('.user-name').textContent=displayName;
      document.body.appendChild(bar);
    }catch(e){ console.warn('Admin UI enhancement:',e); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initAdminUi); else initAdminUi();
})();
</script>
`;
    html = html.replace('</body>', enhancement + '\n</body>');
    fs.writeFileSync(adminFile, html, 'utf8');
  }
}

console.log('Build completed successfully');
