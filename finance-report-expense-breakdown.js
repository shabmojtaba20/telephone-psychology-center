(function(){
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const db=window.supabase?.createClient?.(SB_URL,SB_KEY);if(!db)return;
const money=n=>Number(n||0).toLocaleString('fa-IR');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function params(){return{p_from:document.getElementById('from')?.value||null,p_to:document.getElementById('to')?.value||null};}
function render(d){
 const cats=d.by_category||[], consultants=d.by_consultant||[];
 const manual=Number(d.manual_expenses_total||0),settlement=Number(d.consultant_settlement_expenses_total||0),total=manual+settlement;
 const section=document.getElementById('financeExpenseBreakdown');if(!section)return;
 section.innerHTML=`<div class="head"><div><h2>💸 تفکیک هزینه‌ها</h2><div class="muted">هزینه‌های دستی و تسویه‌های پرداخت‌شده مشاوران در بازه انتخابی</div></div><div><b>${money(total)} تومان</b><div class="muted">هزینه کل</div></div></div><div class="stats" style="margin-top:14px"><div class="stat"><span class="muted">هزینه‌های دستی</span><b class="expense">${money(manual)} تومان</b></div><div class="stat"><span class="muted">تسویه مشاوران</span><b class="expense">${money(settlement)} تومان</b></div><div class="stat"><span class="muted">جمع هزینه</span><b class="expense">${money(total)} تومان</b></div></div><div class="reports" style="margin-top:14px"><div class="report-card"><h3>🧾 هزینه بر اساس دسته</h3><div class="table"><table><thead><tr><th>دسته</th><th>تعداد</th><th>مبلغ</th><th>سهم</th></tr></thead><tbody>${cats.length?cats.map(x=>`<tr><td><b>${esc(x.category_name||'بدون دسته')}</b></td><td>${money(x.expense_count)}</td><td>${money(x.total_expenses)} تومان</td><td>${Number(x.share_percent||0).toFixed(1)}%</td></tr>`).join(''):'<tr><td colspan="4" class="empty">هزینه دستی ثبت نشده است.</td></tr>'}</tbody></table></div></div><div class="report-card"><h3>👨‍⚕️ هزینه تسویه مشاوران</h3><div class="table"><table><thead><tr><th>مشاور</th><th>تعداد</th><th>پرداخت‌شده</th><th>سهم</th></tr></thead><tbody>${consultants.length?consultants.map(x=>`<tr><td><b>${esc(x.consultant_name||'نامشخص')}</b></td><td>${money(x.settlement_count)}</td><td>${money(x.total_paid)} تومان</td><td>${Number(x.share_percent||0).toFixed(1)}%</td></tr>`).join(''):'<tr><td colspan="4" class="empty">تسویه پرداخت‌شده‌ای ثبت نشده است.</td></tr>'}</tbody></table></div></div></div>`;
}
async function load(){const r=await db.rpc('get_finance_expense_breakdown',params());if(r.error){console.error('expense breakdown',r.error);return;}render(r.data||{});}
function init(){if(location.pathname!='/finance-reports.html'||document.getElementById('financeExpenseBreakdown'))return;const wrap=document.querySelector('.wrap');if(!wrap)return;const s=document.createElement('section');s.id='financeExpenseBreakdown';s.className='card';wrap.insertBefore(s,wrap.querySelector('section.card:nth-of-type(3)')||null);load();['from','to'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(load,50)));const old=window.loadReport; if(typeof old==='function')window.loadReport=async function(){await old();await load();};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,500),{once:true});else setTimeout(init,500);
})();
