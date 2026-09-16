(function(){
'use strict';
if(location.pathname!=='/admin-v5.html') return;
const sb=window.supabaseClient||window.supabase;
if(!sb) return;
async function allowed(){try{const {data,error}=await sb.rpc('has_admin_permission',{p_permission:'finance.view'});return !error&&data===true}catch(e){return false}}
function money(v){return new Intl.NumberFormat('fa-IR').format(Math.round(Number(v)||0))+' تومان'}
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]))}
function inject(){
 const anchor=document.querySelector('#managementKpi'); if(!anchor||document.querySelector('#managementPerformance')) return;
 const el=document.createElement('section'); el.id='managementPerformance'; el.className='admin-card'; el.style.marginTop='18px';
 el.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">📈 تحلیل عملکرد مشاوران و خدمات</h3><small id="mpPeriod">دوره جاری</small></div><button id="mpRefresh" class="btn">↻ بروزرسانی</button></div><div id="mpSummary" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px;margin:14px 0"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div><h4>👨‍⚕️ عملکرد مشاوران</h4><div style="overflow:auto"><table class="admin-table" style="width:100%"><thead><tr><th>مشاور</th><th>جلسات</th><th>پرداختی</th><th>درآمد</th><th>سهم مرکز</th><th>سهم مشاور</th></tr></thead><tbody id="mpConsultants"></tbody></table></div></div><div><h4>🧩 عملکرد خدمات</h4><div style="overflow:auto"><table class="admin-table" style="width:100%"><thead><tr><th>خدمت</th><th>جلسات</th><th>پرداختی</th><th>درآمد</th><th>میانگین</th><th>لغو</th></tr></thead><tbody id="mpServices"></tbody></table></div></div></div>`;
 anchor.insertAdjacentElement('afterend',el);
 document.getElementById('mpRefresh').onclick=load;
 load();
}
async function load(){
 if(!(await allowed())) return;
 const now=new Date(), from=new Date(now.getFullYear(),now.getMonth(),1);
 const {data,error}=await sb.rpc('get_management_performance',{p_from:from.toISOString(),p_to:now.toISOString(),p_consultant_id:null,p_service_id:null});
 if(error){console.error(error);return}
 const s=data?.summary||{}; document.getElementById('mpPeriod').textContent='از '+from.toLocaleDateString('fa-IR')+' تا '+now.toLocaleDateString('fa-IR');
 document.getElementById('mpSummary').innerHTML=[['کل جلسات',s.total_appointments],['جلسات پرداخت‌شده',s.paid_appointments],['درآمد ناخالص',money(s.gross_income)],['سهم مرکز',money(s.center_share)],['سهم مشاوران',money(s.consultant_share)],['میانگین جلسه',money(s.average_paid_session)],['مشتریان',s.customers],['لغو',s.cancelled_appointments]].map(x=>`<div style="padding:12px;border:1px solid var(--border-color,#ddd);border-radius:10px"><small>${x[0]}</small><div style="font-size:18px;font-weight:700;margin-top:5px">${esc(x[1])}</div></div>`).join('');
 document.getElementById('mpConsultants').innerHTML=(data?.consultants||[]).map(r=>`<tr><td>${esc(r.consultant_name||'بدون مشاور')}</td><td>${r.appointments}</td><td>${r.paid_appointments}</td><td>${money(r.gross_income)}</td><td>${money(r.center_share)}</td><td>${money(r.consultant_share)}</td></tr>`).join('')||'<tr><td colspan="6">داده‌ای در این دوره وجود ندارد.</td></tr>';
 document.getElementById('mpServices').innerHTML=(data?.services||[]).map(r=>`<tr><td>${esc(r.service_name||'بدون خدمت')}</td><td>${r.appointments}</td><td>${r.paid_appointments}</td><td>${money(r.gross_income)}</td><td>${money(r.average_ticket)}</td><td>${r.cancelled_appointments}</td></tr>`).join('')||'<tr><td colspan="6">داده‌ای در این دوره وجود ندارد.</td></tr>';
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',inject); else inject();
})();
