const fs = require('fs');
const path = require('path');
const root = __dirname;
const indexFile = path.join(root, 'index.html');
if (!fs.existsSync(indexFile)) throw new Error('index.html not found');
let indexHtml = fs.readFileSync(indexFile, 'utf8');
const mobileMarker = '<!-- mobile-ui-enhancements -->';
if (!indexHtml.includes(mobileMarker)) {
  const mobileEnhancement = `\n${mobileMarker}\n<style>@media(max-width:700px){html{scroll-behavior:smooth}body{font-size:15px;overflow-x:hidden}.c{width:calc(100% - 24px);max-width:none}.h{position:sticky;top:0}.nav{min-height:58px;gap:8px}.brand{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:58vw}.links{gap:6px}.links a.btn{display:inline-block!important;padding:8px 10px;font-size:12px;white-space:nowrap}.links button{display:inline-block;padding:7px 4px;font-size:12px}.hero{padding:42px 0 38px}.hero h1{font-size:31px;line-height:1.65}.hero p{font-size:14px;line-height:2}.hero .btn{width:100%;box-sizing:border-box;text-align:center;padding:12px 14px}.section{padding:34px 0}.head{margin-bottom:18px}.head h2{font-size:23px}.grid{grid-template-columns:1fr;gap:12px}.card,.panel{border-radius:14px;padding:16px}.card .btn{width:100%;box-sizing:border-box;margin-top:8px}.steps{grid-template-columns:1fr;gap:7px}.step{padding:9px;font-size:13px}input,select,textarea{font-size:16px;padding:12px;margin:5px 0 12px}.row{flex-direction:column;gap:7px;align-items:stretch}.copy{width:100%;padding:9px}.paybox{padding:12px}#paymentInfo,.paybox{overflow-wrap:anywhere}#onlinePay,#bookBtn{width:100%;box-sizing:border-box}.modal{padding:12px}.modal-card{width:100%;max-height:92vh;overflow:auto;padding:16px;border-radius:16px}.modal-card .btn{width:100%}.footer{padding:28px 0}.footer h3{font-size:17px}}@media(max-width:380px){.brand{max-width:50vw;font-size:13px}.links a.btn{font-size:11px;padding:7px 8px}.hero h1{font-size:27px}}</style>`;
  indexHtml = indexHtml.replace('</head>', mobileEnhancement + '\n</head>');
  fs.writeFileSync(indexFile, indexHtml, 'utf8');
}
const profileMarker = '<!-- user-profile-ui -->';
if (!indexHtml.includes(profileMarker)) {
  const profileEnhancement = `\n${profileMarker}\n<style>#userProfileUi{display:none;align-items:center;gap:7px}#userProfileUi .profile-btn,#userProfileUi .logout-btn{border:0;border-radius:9px;padding:8px 10px;font:inherit;cursor:pointer}#userProfileUi .profile-btn{background:#f1f2ff;color:#4338ca;font-weight:700}#userProfileUi .logout-btn{background:#fee2e2;color:#991b1b}@media(max-width:700px){#userProfileUi{gap:4px}#userProfileUi .profile-btn,#userProfileUi .logout-btn{font-size:11px;padding:7px 7px}.account-guest{display:none!important}}</style>\n<script>(function(){const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';async function initUserUi(){try{const mod=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');const db=mod.createClient(SB_URL,SB_KEY);const account=document.getElementById('accountBtn');if(!account)return;if(!document.getElementById('userProfileUi')){const wrap=document.createElement('span');wrap.id='userProfileUi';wrap.innerHTML='<button type="button" class="profile-btn" id="profileBtn">👤 پروفایل</button><button type="button" class="logout-btn" id="logoutBtn">خروج</button>';account.parentNode.insertBefore(wrap,account.nextSibling)}const wrap=document.getElementById('userProfileUi'),profileBtn=document.getElementById('profileBtn'),logoutBtn=document.getElementById('logoutBtn');function render(session){const logged=!!session;account.style.display=logged?'none':'';wrap.style.display=logged?'inline-flex':'none';if(logged){const name=session.user?.user_metadata?.full_name||session.user?.user_metadata?.name||session.user?.email||'کاربر';profileBtn.textContent='👤 '+(name.length>18?name.slice(0,18)+'…':name)}}const {data}=await db.auth.getSession();render(data.session);db.auth.onAuthStateChange((_event,session)=>render(session));profileBtn.onclick=()=>{window.location.hash='profile';window.dispatchEvent(new CustomEvent('open-user-profile'))};logoutBtn.onclick=async()=>{await db.auth.signOut();window.location.reload()}}catch(e){console.warn('User profile UI:',e)}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initUserUi);else initUserUi()})();</script>`;
  indexHtml = indexHtml.replace('</body>', profileEnhancement + '\n</body>');
  fs.writeFileSync(indexFile, indexHtml, 'utf8');
}

const educationLinkMarker = '<!-- education-center-link -->';
if (!indexHtml.includes(educationLinkMarker)) {
  const educationLink = `\n${educationLinkMarker}<a class="btn" href="/education.html" style="text-decoration:none">📚 مطالب آموزشی و کارگاه‌ها</a>`;
  indexHtml = indexHtml.replace('</body>', educationLink + '\n</body>');
  fs.writeFileSync(indexFile, educationLink + '\n</body>');
}

function injectScript(filePath, marker, scripts) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes(marker)) html = html.replace('</body>', `\n${marker}\n${scripts}\n</body>`);
  else for (const src of scripts.matchAll(/<script src="([^"]+)"><\/script>/g)) if (!html.includes(src[1])) html = html.replace('</body>', `<script src="${src[1]}"></script>\n</body>`);
  fs.writeFileSync(filePath,html,'utf8');
}

const adminFile = path.join(root, 'admin-v4.html');
if (fs.existsSync(adminFile)) {
  let html = fs.readFileSync(adminFile, 'utf8');
  const marker = '<!-- admin-ui-enhancements -->';
  const enhancement = `\n${marker}\n<style>#adminUserBar{position:fixed;top:14px;right:270px;z-index:30;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:8px 12px;box-shadow:0 4px 16px rgba(0,0,0,.08);font-size:13px}#adminUserBar .user-name{font-weight:700;color:#172033}#adminUserBar .back-site{border:0;border-radius:8px;background:#4f46e5;color:#fff;padding:7px 11px;text-decoration:none;cursor:pointer}@media(max-width:700px){#adminUserBar{position:sticky;top:0;right:auto;margin:8px 0;justify-content:space-between;z-index:25}.main{padding-top:8px}}</style>\n<script>(function(){const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';function client(){return window.supabase.createClient(SB_URL,SB_KEY)}async function initAdminUi(){try{const dbx=client();const {data:{session}}=await dbx.auth.getSession();if(!session)return;let displayName=session.user?.user_metadata?.full_name||session.user?.user_metadata?.name||'';if(!displayName){const r=await dbx.from('user_profiles').select('full_name').eq('user_id',session.user.id).maybeSingle();if(!r.error)displayName=r.data?.full_name||''}if(!displayName)displayName=session.user?.email||'مدیر';if(document.getElementById('adminUserBar'))return;const bar=document.createElement('div');bar.id='adminUserBar';bar.innerHTML='<span>👤 <span class="user-name"></span></span><a class="back-site" href="/">↩ بازگشت به سایت</a>';bar.querySelector('.user-name').textContent=displayName;document.body.appendChild(bar)}catch(e){console.warn('Admin UI enhancement:',e)}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initAdminUi);else initAdminUi()})();</script>\n<script src="/admin-access.js"></script>\n<script src="/finance-admin.js"></script>\n<script src="/admin-education.js"></script>`;
  if (!html.includes(marker)) html=html.replace('</body>',enhancement+'\n</body>'); else { for (const src of ['/admin-access.js','/finance-admin.js','/admin-education.js']) if(!html.includes(src)) html=html.replace('</body>',`<script src="${src}"></script>\n</body>`); }
  fs.writeFileSync(adminFile,html,'utf8');
}

const professionalAdminFile = path.join(root, 'admin-professional.html');
if (fs.existsSync(professionalAdminFile)) {
  let html = fs.readFileSync(professionalAdminFile, 'utf8');
  const marker = '<!-- professional-finance-module -->';
  const scripts = '<script src="/finance-admin.js"></script>\n<script src="/admin-education.js"></script>\n<script src="/role-access.js"></script>';
  if (!html.includes(marker)) {
    const enhancement = `\n${marker}\n<style>.finance-kpis .card{min-height:120px}.finance-kpis{margin-bottom:4px}#finance .actions{display:flex;gap:8px;flex-wrap:wrap}#finance .actions .btn{margin:0}</style>\n${scripts}`;
    html = html.replace('</body>', enhancement + '\n</body>');
  } else {
    if(!html.includes('/finance-admin.js')) html=html.replace('</body>','<script src="/finance-admin.js"></script>\n</body>');
    if(!html.includes('/admin-education.js')) html=html.replace('</body>','<script src="/admin-education.js"></script>\n</body>');
    if(!html.includes('/role-access.js')) html=html.replace('</body>','<script src="/role-access.js"></script>\n</body>');
  }
  fs.writeFileSync(professionalAdminFile, html, 'utf8');
}
console.log('Build completed successfully');
