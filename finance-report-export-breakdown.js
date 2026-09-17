(function(){
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const db=window.supabase?.createClient?.(SB_URL,SB_KEY); if(!db)return;
const csvCell=v=>{const s=String(v??'');return '"'+s.replace(/"/g,'""')+'"'};
const num=v=>Number(v||0);
function download(rows){
 const csv='\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 const from=document.getElementById('from')?.value||'all',to=document.getElementById('to')?.value||'all';
 a.href=url;a.download='finance-report-'+from+'-'+to+'.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
async function exportFullFinanceCSV(){
 const session=(await db.auth.getSession()).data.session;
 if(!session){location.replace('/admin-login.html?redirect=/finance-reports.html');return}
 const permission=await db.rpc('has_admin_permission',{p_permission:'finance.view'});
 if(permission.error||permission.data!==true){alert('این حساب دسترسی گزارش مالی ندارد.');return}
 const p={p_from:document.getElementById('from')?.value||null,p_to:document.getElementById('to')?.value||null};
 const [r,b,e]=await Promise.all([
  db.rpc('get_finance_advanced_report',p),
  db.rpc('get_finance_income_breakdown',p),
  db.rpc('get_finance_expense_breakdown',p)
 ]);
 if(r.error||b.error||e.error){alert('دریافت اطلاعات کامل گزارش مالی ناموفق بود.');console.error(r.error,b.error,e.error);return}
 const d=r.data||{},pl=d.profit_loss||{},bd=b.data||{},ed=e.data||{};
 const rows=[
  ['گزارش مالی پیشرفته مرکز مشاوره تلفنی روان'],
  ['از تاریخ',p.p_from||'همه دوره'],['تا تاریخ',p.p_to||'همه دوره'],[],
  ['خلاصه مالی','مبلغ (تومان)'],
  ['درآمد تاییدشده',pl.total_income||0],['هزینه کل',pl.total_expense||0],['سود/زیان خالص',pl.net_profit||0],
  ['سهم مرکز از تسویه‌ها',pl.consultant_center_share||0],['مطالبات مشاوران',pl.consultant_payable||0],['ناخالص تسویه‌های در انتظار',pl.pending_settlement_gross||0],[],
  ['تفکیک درآمد بر اساس خدمت','تعداد','درآمد (تومان)','درصد'],
  ...(bd.by_service||[]).map(x=>[x.service_name||'نامشخص',x.paid_appointments||0,x.income||0,pl.total_income?num(x.income)/num(pl.total_income)*100:0]),[],
  ['تفکیک درآمد بر اساس درگاه','تعداد','درآمد (تومان)','درصد'],
  ...(bd.by_gateway||[]).map(x=>[x.gateway||'نامشخص',x.paid_appointments||0,x.income||0,pl.total_income?num(x.income)/num(pl.total_income)*100:0]),[],
  ['تفکیک درآمد بر اساس روش پرداخت','تعداد','درآمد (تومان)','درصد'],
  ...(bd.by_payment_method||[]).map(x=>[x.payment_method||'نامشخص',x.paid_appointments||0,x.income||0,pl.total_income?num(x.income)/num(pl.total_income)*100:0]),[],
  ['تفکیک هزینه‌ها','مبلغ (تومان)','تعداد','سهم از هزینه'],
  ['هزینه‌های دستی',ed.manual_expenses_total||0,ed.manual_expenses_count||0,pl.total_expense?num(ed.manual_expenses_total)/num(pl.total_expense)*100:0],
  ['هزینه تسویه مشاوران',ed.consultant_settlement_expenses_total||0,ed.consultant_settlement_expenses_count||0,pl.total_expense?num(ed.consultant_settlement_expenses_total)/num(pl.total_expense)*100:0],
  ['مجموع هزینه‌ها',ed.total_expenses||pl.total_expense||0,ed.total_expense_count||0,100],[],
  ['دسته‌بندی هزینه‌های دستی','مبلغ (تومان)','تعداد','سهم'],
  ...(ed.by_category||[]).map(x=>[x.category_name||x.category||'نامشخص',x.total_amount||0,x.expense_count||0,x.share_percent||0]),[],
  ['هزینه تسویه به تفکیک مشاور','مبلغ (تومان)','تعداد','سهم'],
  ...(ed.by_consultant||[]).map(x=>[x.consultant_name||'نامشخص',x.total_amount||0,x.expense_count||0,x.share_percent||0]),[],
  ['عملکرد مالی مشاوران','جلسات','درآمد ناخالص','سهم مرکز','قابل پرداخت','پرداخت‌شده','مانده'],
  ...(d.consultants||[]).map(x=>[x.consultant_name||x.consultant_id||'نامشخص',x.settled_appointments||0,x.gross_income||0,x.center_share||0,x.consultant_payable||0,x.consultant_paid||0,num(x.consultant_payable)-num(x.consultant_paid)])
 ];
 download(rows);
}
function init(){
 if(location.pathname!='/finance-reports.html'||window.__fullFinanceExportInstalled)return;
 window.__fullFinanceExportInstalled=true;
 window.exportCSV=exportFullFinanceCSV;
 const btn=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').includes('خروجی CSV'));
 if(btn)btn.onclick=exportFullFinanceCSV;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,800),{once:true});else setTimeout(init,800);
})();
