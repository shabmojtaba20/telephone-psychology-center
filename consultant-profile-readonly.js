(()=>{
'use strict';
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const wait=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
wait(async()=>{
 if(location.pathname!=='/consultant-panel-professional.html'||!window.supabase)return;
 const db=window.supabase.createClient(SB_URL,SB_KEY);
 const {data:{user}}=await db.auth.getUser(); if(!user)return;
 const r=await db.rpc('get_my_consultant_profile'); if(r.error||!r.data)return;
 const p=Array.isArray(r.data)?r.data[0]:r.data;
 const tab=document.getElementById('profileTab'); if(!tab)return;
 tab.innerHTML=`<section class="card"><h2>👤 پروفایل مشاور</h2><div class="muted" style="margin-bottom:14px">اطلاعات این صفحه توسط پنل مدیریت مرکز کنترل می‌شود و در پنل مشاور فقط به‌صورت نمایش داده می‌شود.</div><div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:18px">${p.photo_url?`<img src="${esc(p.photo_url)}" class="profile-avatar" alt="تصویر مشاور" style="margin:0">`:'<div class="profile-avatar" style="display:grid;place-items:center;font-size:30px;margin:0">👤</div>'}<div><div class="muted">نام مشاور</div><b style="font-size:20px">${esc(p.name||'—')}</b><div class="muted" style="margin-top:6px">${esc(p.specialty||'بدون تخصص ثبت‌شده')}</div></div></div><div class="formgrid"><div class="field"><span>نام و نام خانوادگی</span><div class="item">${esc(p.name||'—')}</div></div><div class="field"><span>تخصص</span><div class="item">${esc(p.specialty||'—')}</div></div><div class="field"><span>تحصیلات</span><div class="item">${esc(p.education||'—')}</div></div><div class="field"><span>ایمیل حساب ورود</span><div class="item">${esc(p.email||p.linked_email||'—')}</div></div><div class="field full"><span>معرفی مشاور</span><div class="item" style="white-space:pre-wrap">${esc(p.bio||'—')}</div></div></div></section>`;
});
})();
