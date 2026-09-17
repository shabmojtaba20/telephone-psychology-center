(function(){
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const db=window.supabase?.createClient?.(SB_URL,SB_KEY);if(!db)return;
const money=n=>Number(n||0).toLocaleString('fa-IR');
async function load(){
 const box=document.getElementById('financePeriodClosures');if(!box)return;
 const r=await db.rpc('get_finance_period_closures');
 if(r.error){box.innerHTML='<p>خطا در دریافت دوره‌های مالی: '+r.error.message+'</p>';return;}
 const rows=r.data||[];
 box.innerHTML='<h3>🔒 دوره‌های مالی</h3>'+(!rows.length?'<p>هنوز دوره‌ای بسته نشده است.</p>':'<div style="overflow:auto"><table><thead><tr><th>دوره</th><th>درآمد</th><th>هزینه</th><th>سود/زیان</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+new Date(x.period_from).toLocaleDateString('fa-IR')+' تا '+new Date(x.period_to).toLocaleDateString('fa-IR')+'</td><td>'+money(x.total_income)+'</td><td>'+money(x.total_expense)+'</td><td>'+money(x.net_profit)+'</td><td>'+((x.status==='closed')?'🔒 بسته':'🔓 بازگشایی‌شده')+'</td><td>'+ (x.status==='closed'?'<button class="btn reopen-period" data-id="'+x.id+'">🔓 بازگشایی</button>':'—')+'</td></tr>').join('')+'</tbody></table></div>';
 box.querySelectorAll('.reopen-period').forEach(b=>b.onclick=()=>reopen(b.dataset.id));
}
async function reopen(id){
 const reason=prompt('علت بازگشایی دوره مالی را وارد کنید:');if(!reason?.trim())return;
 const r=await db.rpc('reopen_finance_period',{p_period_id:id,p_reason:reason.trim()});
 if(r.error){alert('بازگشایی انجام نشد: '+r.error.message);return}
 alert('دوره مالی با موفقیت بازگشایی شد.');load();
}
function init(){if(location.pathname!='/admin-v5.html')return;const host=document.querySelector('#profitLoss')||document.querySelector('#financeDashboard');if(!host||document.getElementById('financePeriodClosures'))return;const box=document.createElement('section');box.id='financePeriodClosures';box.className='card';box.innerHTML='در حال بارگذاری دوره‌های مالی...';host.parentNode?.appendChild(box);load();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1200));else setTimeout(init,1200);
})();