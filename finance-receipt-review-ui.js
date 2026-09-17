(()=>{
'use strict';
const $=id=>document.getElementById(id);
const escLocal=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const faDate=v=>v?new Date(v).toLocaleString('fa-IR-u-ca-persian',{year:'numeric',month:'2-digit',day:'2-digit'}):'—';
function modal(){let m=$('receiptReviewModal');if(m)return m;m=document.createElement('div');m.id='receiptReviewModal';m.innerHTML=`<div class="rr-backdrop"></div><div class="rr-card"><button class="rr-close" type="button">×</button><h2>🧾 تأیید رسید پرداخت</h2><div id="rrMeta" class="rr-meta"></div><div id="rrFile" class="rr-file"></div><div id="rrActions"></div></div>`;document.body.appendChild(m);m.querySelector('.rr-close').onclick=()=>m.remove();m.querySelector('.rr-backdrop').onclick=()=>m.remove();return m}
function tempField(id,value){let old=$(id);if(old)old.remove();const el=document.createElement('input');el.type='hidden';el.id=id;el.value=value||'';document.body.appendChild(el);return el}
async function openReview(id,path,status){const m=modal();m.querySelector('#rrMeta').innerHTML='<div><b>وضعیت:</b> '+escLocal(status||'در انتظار')+'</div>';
 const box=m.querySelector('#rrFile');box.innerHTML='<div class="rr-loading">در حال بارگذاری رسید...</div>';
 if(path){const r=await db.storage.from('payment-receipts').createSignedUrl(path,300);if(r.error)box.innerHTML='<div class="rr-error">نمایش رسید ممکن نیست: '+escLocal(r.error.message)+'</div>';else{const u=r.data?.signedUrl||'';const lower=path.toLowerCase();box.innerHTML=lower.endsWith('.pdf')?`<iframe class="rr-pdf" src="${u}" title="رسید پرداخت"></iframe>`:`<img class="rr-img" src="${u}" alt="رسید پرداخت">`;}}
 else box.innerHTML='<div class="rr-error">برای این پرداخت فایل رسید ثبت نشده است.</div>';
 const actions=m.querySelector('#rrActions');actions.innerHTML='';if(status==='pending'){actions.innerHTML=`<div class="rr-review"><input id="rrNote" placeholder="یادداشت یا علت رد"><input id="rrTrack" placeholder="کد پیگیری نهایی"><button class="btn green" id="rrApprove">تأیید رسید</button><button class="btn red" id="rrReject">رد رسید</button></div>`;
  const submit=async decision=>{tempField('note_'+id,$('rrNote')?.value||'');tempField('track_'+id,$('rrTrack')?.value||'');try{await window.reviewReceipt(id,decision)}finally{const a=$('note_'+id),b=$('track_'+id);if(a)a.remove();if(b)b.remove();m.remove()}};
  $('rrApprove').onclick=()=>submit('approved');$('rrReject').onclick=()=>submit('rejected');
 }
}
async function loadReceiptsSimplified(){
 const f=$('receiptFilter')?.value||'pending';let q=db.from('payment_receipts').select('id,user_id,status,submitted_at,receipt_path').order('submitted_at',{ascending:false}).limit(100);if(f!=='all')q=q.eq('status',f);const r=await q;if(r.error){$('receiptsBody').innerHTML='<tr><td colspan="4">'+escLocal(r.error.message)+'</td></tr>';return}
 const rows=r.data||[];const ids=[...new Set(rows.map(x=>x.user_id).filter(Boolean))];let names={};if(ids.length){const p=await db.from('user_profiles').select('user_id,full_name').in('user_id',ids);(p.data||[]).forEach(x=>names[x.user_id]=x.full_name||'—')}
 $('receiptsBody').innerHTML=rows.length?rows.map(x=>{const name=names[x.user_id]||'کاربر';const pending=x.status==='pending';return `<tr class="${pending?'pending-row':''}"><td>${escLocal(name)}</td><td>${faDate(x.submitted_at)}</td><td><span class="badge">${escLocal(x.status)}</span></td><td>${x.receipt_path?`<button class="btn gray" onclick="window.__reviewReceipt('${escLocal(x.id)}','${escLocal(x.receipt_path)}','${escLocal(x.status)}')">${pending?'بررسی و مشاهده رسید':'مشاهده رسید'}</button>`:'—'}</td></tr>`}).join(''):'<tr><td colspan="4" class="empty">رسیدی یافت نشد.</td></tr>';
}
function install(){
 if(!window.db||!$('receiptsBody')||window.__receiptReviewInstalled)return;
 window.__receiptReviewInstalled=true;window.__reviewReceipt=openReview;
 const table=$('receiptsBody')?.closest('table');if(table){const hs=table.querySelectorAll('thead th');if(hs.length>=7){hs[0].textContent='کاربر';hs[1].textContent='تاریخ';hs[2].textContent='وضعیت';hs[3].textContent='رسید';for(let i=6;i>=4;i--)hs[i].remove();}}
 window.loadReceipts=loadReceiptsSimplified;loadReceiptsSimplified();
 const style=document.createElement('style');style.textContent=`.rr-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.58);z-index:10000}.rr-card{position:fixed;z-index:10001;top:4vh;left:50%;transform:translateX(-50%);width:min(760px,94vw);max-height:92vh;overflow:auto;background:#fff;border-radius:18px;padding:20px;box-shadow:0 25px 70px rgba(0,0,0,.25)}.rr-close{position:absolute;left:12px;top:10px;border:0;background:#f1f5f9;border-radius:50%;width:34px;height:34px;font-size:25px;cursor:pointer}.rr-meta{background:#f8fafc;border-radius:10px;padding:10px;margin:10px 0}.rr-file{text-align:center;min-height:80px}.rr-img{max-width:100%;max-height:58vh;object-fit:contain;border-radius:10px;border:1px solid #e5e7eb}.rr-pdf{width:100%;height:58vh;border:1px solid #e5e7eb;border-radius:10px}.rr-review{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.rr-review input{flex:1;min-width:170px;padding:10px;border:1px solid #d6dbe5;border-radius:9px}.rr-loading{padding:30px;color:#667085}.rr-error{padding:18px;background:#fff1f2;color:#9f1239;border-radius:10px}`;document.head.appendChild(style);
}
let tries=0;function boot(){if(window.loadReceipts&&window.db&&$('receiptsBody'))return install();if(++tries<80)setTimeout(boot,100)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();