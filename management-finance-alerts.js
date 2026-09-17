(function(){'use strict';
if(location.pathname!=='/admin-v5.html')return;
const SB=window.supabaseClient||window.supabase;if(!SB)return;
const $=id=>document.getElementById(id);const money=n=>Number(n||0).toLocaleString('fa-IR')+' تومان';
async function load(){
 const box=$('mfFinanceAlerts');if(!box)return;
 try{
  const [r,s]=await Promise.all([
   SB.rpc('get_finance_reconciliation',{p_from:null,p_to:null,p_consultant_id:null,p_service_id:null,p_gateway:null}),
   SB.from('consultant_settlements').select('id,status,net_amount,consultants(name)').in('status',['pending','approved']).order('created_at',{ascending:false}).limit(100)
  ]);
  const d=r.error?{}:(r.data||{}), settlements=s.error?[]:(s.data||[]);
  const pending=settlements.filter(x=>x.status==='pending'),approved=settlements.filter(x=>x.status==='approved');
  const warnings=[];
  if(Number(d.approved_without_transaction||0)>0)warnings.push(['رسید بدون تراکنش',money(d.approved_without_transaction),'رسید تأییدشده‌ای وجود دارد که هنوز تراکنش مالی متناظر ندارد.','danger']);
  if(Number(d.receipt_transaction_amount_mismatch||0)>0)warnings.push(['اختلاف مبلغ رسید و تراکنش',money(d.receipt_transaction_amount_mismatch),'مبلغ رسید و تراکنش متناظر یکسان نیست.','danger']);
  if(pending.length)warnings.push(['تسویه در انتظار تأیید',pending.length.toLocaleString('fa-IR')+' مورد','تسویه‌های مشاوران هنوز تأیید مالی نشده‌اند.','warning']);
  if(approved.length)warnings.push(['تسویه تأییدشده و پرداخت‌نشده',approved.length.toLocaleString('fa-IR')+' مورد', 'تسویه تأیید شده اما هنوز پرداخت نشده است.','warning']);
  box.innerHTML=warnings.length?warnings.map(w=>`<div style="border:1px solid ${w[3]==='danger'?'#fecaca':'#fde68a'};background:${w[3]==='danger'?'#fff1f2':'#fffbeb'};border-radius:12px;padding:12px;margin:7px 0;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><b>${w[0]}</b><div style="font-size:12px;margin-top:4px">${w[2]}</div></div><strong>${w[1]}</strong></div>`).join(''):'<div style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:12px;padding:13px;color:#166534">✅ مورد مالی نیازمند اقدام فوری شناسایی نشد.</div>';
 }catch(e){console.error('finance alerts',e);box.innerHTML='<div style="padding:10px;color:#92400e">⚠️ بررسی هشدارهای مالی در حال حاضر انجام نشد.</div>'}
}
function init(){if($('mfFinanceAlerts'))return;const anchor=$('managementFinal');if(!anchor)return;const s=document.createElement('section');s.id='mfFinanceAlerts';s.className='admin-card';s.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">🚨 هشدارهای مالی و موارد نیازمند اقدام</h3><button class="btn" id="mfAlertRefresh">🔄 بررسی مجدد</button></div><div style="margin-top:10px">در حال بررسی...</div>';anchor.insertAdjacentElement('afterend',s);$('mfAlertRefresh').onclick=load;load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1200),{once:true});else setTimeout(init,1200);
})();
