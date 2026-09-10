const fs = require('fs');
const path = require('path');

const root = __dirname;
const indexFile = path.join(root, 'index.html');
if (!fs.existsSync(indexFile)) throw new Error('index.html not found');

// Mobile-first refinements for the public website.
let indexHtml = fs.readFileSync(indexFile, 'utf8');
const mobileMarker = '<!-- mobile-ui-enhancements -->';
if (!indexHtml.includes(mobileMarker)) {
  const mobileEnhancement = `
${mobileMarker}
<style>
@media (max-width:700px){
  html{scroll-behavior:smooth}
  body{font-size:15px;overflow-x:hidden}
  .c{width:calc(100% - 24px);max-width:none}
  .h{position:sticky;top:0}
  .nav{min-height:58px;gap:8px}
  .brand{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:58vw}
  .links{gap:6px}
  .links a.btn{display:inline-block!important;padding:8px 10px;font-size:12px;white-space:nowrap}
  .links button{display:inline-block;padding:7px 4px;font-size:12px}
  .hero{padding:42px 0 38px}
  .hero h1{font-size:31px;line-height:1.65}
  .hero p{font-size:14px;line-height:2}
  .hero .btn{width:100%;box-sizing:border-box;text-align:center;padding:12px 14px}
  .section{padding:34px 0}
  .head{margin-bottom:18px}
  .head h2{font-size:23px}
  .grid{grid-template-columns:1fr;gap:12px}
  .card,.panel{border-radius:14px;padding:16px}
  .card .btn{width:100%;box-sizing:border-box;margin-top:8px}
  .steps{grid-template-columns:1fr;gap:7px}
  .step{padding:9px;font-size:13px}
  input,select,textarea{font-size:16px;padding:12px;margin:5px 0 12px}
  .row{flex-direction:column;gap:7px;align-items:stretch}
  .copy{width:100%;padding:9px}
  .paybox{padding:12px}
  #paymentInfo,.paybox{overflow-wrap:anywhere}
  #onlinePay,#bookBtn{width:100%;box-sizing:border-box}
  .modal{padding:12px}
  .modal-card{width:100%;max-height:92vh;overflow:auto;padding:16px;border-radius:16px}
  .modal-card .btn{width:100%}
  .footer{padding:28px 0}
  .footer h3{font-size:17px}
}
@media (max-width:380px){
  .brand{max-width:50vw;font-size:13px}
  .links a.btn{font-size:11px;padding:7px 8px}
  .hero h1{font-size:27px}
}
</style>
`;
  indexHtml = indexHtml.replace('</head>', mobileEnhancement + '\n</head>');
  fs.writeFileSync(indexFile, indexHtml, 'utf8');
}

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
