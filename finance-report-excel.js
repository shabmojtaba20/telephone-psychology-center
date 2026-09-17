(function(){
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const XLSX_CDN='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
const db=window.supabase?.createClient?.(SB_URL,SB_KEY); if(!db)return;
const num=v=>Number(v||0);
const money=v=>num(v);
function loadXLSX(){return new Promise((resolve,reject)=>{if(window.XLSX)return resolve(window.XLSX);const s=document.createElement('script');s.src=XLSX_CDN;s.onload=()=>resolve(window.XLSX);s.onerror=reject;document.head.appendChild(s);});}
function aoaSheet(rows){return XLSX.utils.aoa_to_sheet(rows);}
function styleSheet(ws){const range=XLSX.utils.decode_range(ws['!ref']||'A1');ws['!cols']=[];for(let c=range.s.c;c<=range.e.c;c++)ws['!cols'][c]={wch:22};for(let r=range.s.r;r<=range.e.r;r++){const cell=ws[XLSX.utils.encode_cell({r,c:0})];if(cell&&typeof cell.v==='string'&&(r===0||/^(خلاصه|تفکیک|دسته‌بندی|هزینه تسویه|عملکرد مالی|سود و زیان)/.test(cell.v))){for(let c=range.s.c;c<=range.e.c;c++){const x=ws[XLSX.utils.encode_cell({r,c})];if(x)x.s={font:{bold:true}};}}}}
async function exportExcel(){
 const session=(await db.auth.getSession()).data.session;
 if(!session){location.replace('/admin-login.html?redirect=/finance-reports.html');return}
 const permission=await db.rpc('has_admin_permission',{p_permission:'finance.view'});
 if(permission.error||permission.data!==true){alert('این حساب دسترسی گزارش مالی ندارد.');return}
 const p={p_from:document.getElementById('from')?.value||null,p_to:document.getElementById('to')?.value||null};
 const [r,b,e]=await Promise.all([db.rpc('get_finance_advanced_report',p),db.rpc('get_finance_income_breakdown',p),db.rpc('get_finance_expense_breakdown',p)]);
 if(r.error||b.error||e.error){alert('دریافت اطلاعات کامل گزارش مالی ناموفق بود.');return}
 const d=r.data||{},pl=d.profit_loss||{},bd=b.data||{},ed=e.data||{};
 const XLSX=await loadXLSX();
 const wb=XLSX.utils.book_new();
 const summary=[['گزارش مالی پیشرفته مرکز مشاوره تلفنی روان'],['از تاریخ',p.p_from||'همه دوره'],['تا تاریخ',p.p_to||'همه دوره'],[],['شاخص','مبلغ (تومان)'],['درآمد تأییدشده',money(pl.total_income)],['هزینه کل',money(pl.total_expense)],['سود/زیان خالص',money(pl.net_profit)],['سهم مرکز از تسویه‌ها',money(pl.consultant_center_share)],['مطالبات مشاوران',money(pl.consultant_payable)],['ناخالص تسویه‌های در انتظار',money(pl.pending_settlement_gross)]];
 const incomeRows=[['خدمت','تعداد','درآمد (تومان)','سهم (%)'],...(bd.by_service||[]).map(x=>[x.service_name||'نامشخص',x.paid_appointments||0,money(x.income),pl.total_income?num(x.income)/num(pl.total_income)*100:0])];
 const gatewayRows=[['درگاه','تعداد','درآمد (تومان)','سهم (%)'],...(bd.by_gateway||[]).map(x=>[x.gateway||'نامشخص',x.paid_appointments||0,money(x.income),pl.total_income?num(x.income)/num(pl.total_income)*100:0])];
 const methodRows=[['روش پرداخت','تعداد','درآمد (تومان)','سهم (%)'],...(bd.by_payment_method||[]).map(x=>[x.payment_method||'نامشخص',x.paid_appointments||0,money(x.income),pl.total_income?num(x.income)/num(pl.total_income)*100:0])];
 const expenseRows=[['نوع هزینه','مبلغ (تومان)','تعداد','سهم (%)'],['هزینه‌های دستی',money(ed.manual_expenses_total),ed.manual_expenses_count||0,pl.total_expense?num(ed.manual_expenses_total)/num(pl.total_expense)*100:0],['هزینه تسویه مشاوران',money(ed.consultant_settlement_expenses_total),ed.consultant_settlement_expenses_count||0,pl.total_expense?num(ed.consultant_settlement_expenses_total)/num(pl.total_expense)*100:0],['مجموع هزینه‌ها',money(ed.total_expenses||pl.total_expense),ed.total_expense_count||0,100]];
 const categoryRows=[['دسته‌بندی هزینه‌های دستی','مبلغ (تومان)','تعداد','سهم (%)'],...(ed.by_category||[]).map(x=>[x.category_name||x.category||'نامشخص',money(x.total_amount),x.expense_count||0,x.share_percent||0])];
 const settlementExpenseRows=[['مشاور','مبلغ (تومان)','تعداد','سهم (%)'],...(ed.by_consultant||[]).map(x=>[x.consultant_name||'نامشخص',money(x.total_amount),x.expense_count||0,x.share_percent||0])];
 const consultantRows=[['مشاور','جلسات','درآمد ناخالص','سهم مرکز','قابل پرداخت','پرداخت‌شده','مانده'],...(d.consultants||[]).map(x=>[x.consultant_name||x.consultant_id||'نامشخص',x.settled_appointments||0,money(x.gross_income),money(x.center_share),money(x.consultant_payable),money(x.consultant_paid),money(num(x.consultant_payable)-num(x.consultant_paid))])];
 [['خلاصه مالی',summary],['درآمدها',incomeRows],['درگاه‌ها',gatewayRows],['روش‌های پرداخت',methodRows],['هزینه‌ها',expenseRows],['دسته‌بندی هزینه‌ها',categoryRows],['تسویه مشاوران',settlementExpenseRows],['عملکرد مشاوران',consultantRows]].forEach(([name,rows])=>{const ws=aoaSheet(rows);styleSheet(ws);XLSX.utils.book_append_sheet(wb,ws,name.slice(0,31));});
 const from=p.p_from||'all',to=p.p_to||'all';XLSX.writeFile(wb,'finance-report-'+from+'-'+to+'.xlsx');
}
function init(){if(location.pathname!='/finance-reports.html'||window.__financeExcelInstalled)return;window.__financeExcelInstalled=true;const host=document.querySelector('.head .btn.green');if(!host)return;const btn=document.createElement('button');btn.className='btn';btn.textContent='📊 خروجی Excel';btn.onclick=exportExcel;host.parentNode.insertBefore(btn,host.nextSibling);window.exportExcel=exportExcel;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,900),{once:true});else setTimeout(init,900);
})();
