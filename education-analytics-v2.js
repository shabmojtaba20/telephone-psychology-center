(function(){'use strict';
const U='https://aserkyiwwyggtixckjsv.supabase.co',K='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const money=n=>Number(n||0).toLocaleString('fa-IR')+' تومان';
const num=n=>Number(n||0).toLocaleString('fa-IR');
const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function boot(){
 if(!window.supabase||document.getElementById('eduAnalytics'))return;
 const db=window.supabase.createClient(U,K),wrap=document.querySelector('.wrap'); if(!wrap)return;
 const box=document.createElement('section'); box.id='eduAnalytics'; box.className='card'; box.style.marginTop='18px';
 box.innerHTML='<h2>📊 گزارش پیشرفته آموزش</h2><p class="muted">فروش، ثبت‌نام، حضور، گواهی و عملکرد هر محتوا/کارگاه به‌صورت واقعی از Supabase.</p><div class="actions"><label>از <input id="eaFrom" type="date"></label><label>تا <input id="eaTo" type="date"></label><button class="btn" id="eaRun">به‌روزرسانی گزارش</button></div><div id="eaKpi" class="stats"></div><div id="eaContentTable" style="overflow:auto;margin-top:18px"></div><div id="eaTable" style="overflow:auto;margin-top:18px"></div>';
 wrap.appendChild(box);
 const fromEl=document.getElementById('eaFrom'),toEl=document.getElementById('eaTo'),kpi=document.getElementById('eaKpi'),contentTable=document.getElementById('eaContentTable'),table=document.getElementById('eaTable');
 async function run(){
  const from=fromEl.value,to=toEl.value;if(from&&to&&from>to)return alert('بازه تاریخ نامعتبر است.');
  let cq=db.from('educational_purchases').select('content_id,amount,status,created_at').eq('status','paid');
  let rq=db.from('workshop_registrations').select('id,workshop_id,amount,payment_status,attendance_status,certificate_number,created_at').in('payment_status',['free','paid']);
  if(from){cq=cq.gte('created_at',from+'T00:00:00');rq=rq.gte('created_at',from+'T00:00:00');}
  if(to){cq=cq.lte('created_at',to+'T23:59:59');rq=rq.lte('created_at',to+'T23:59:59');}
  const [c,r,w]=await Promise.all([cq,rq,db.from('workshops').select('id,title,instructor_name')]);
  if(c.error||r.error||w.error){console.error(c.error||r.error||w.error);return alert('خطا در دریافت گزارش آموزش.');}
  const purchases=c.data||[],regs=r.data||[],workshops=Object.fromEntries((w.data||[]).map(x=>[x.id,x]));
  const contentIds=[...new Set(purchases.map(x=>x.content_id).filter(Boolean))];
  let contents=[];
  if(contentIds.length){const q=await db.from('educational_contents').select('id,title').in('id',contentIds);if(q.error)return alert('خطا در دریافت عناوین مطالب آموزشی.');contents=q.data||[];}
  const contentMap=Object.fromEntries(contents.map(x=>[x.id,x]));
  const contentRev=purchases.reduce((a,x)=>a+Number(x.amount||0),0),workshopRev=regs.filter(x=>x.payment_status==='paid').reduce((a,x)=>a+Number(x.amount||0),0);
  const paidRegs=regs.filter(x=>x.payment_status==='paid').length,attended=regs.filter(x=>x.attendance_status==='attended').length,certs=regs.filter(x=>x.certificate_number).length;
  const attendanceRate=regs.length?Math.round(attended/regs.length*100):0;
  kpi.innerHTML='<span class="stat">درآمد کل<strong>'+money(contentRev+workshopRev)+'</strong></span><span class="stat">فروش مطالب<strong>'+money(contentRev)+'</strong></span><span class="stat">درآمد کارگاه<strong>'+money(workshopRev)+'</strong></span><span class="stat">ثبت‌نام<strong>'+num(regs.length)+'</strong></span><span class="stat">پرداخت‌شده<strong>'+num(paidRegs)+'</strong></span><span class="stat">نرخ حضور<strong>'+num(attendanceRate)+'٪</strong></span><span class="stat">حاضر<strong>'+num(attended)+'</strong></span><span class="stat">گواهی صادرشده<strong>'+num(certs)+'</strong></span>';
  const cm={};purchases.forEach(x=>{cm[x.content_id]??={n:0,r:0};cm[x.content_id].n++;cm[x.content_id].r+=Number(x.amount||0);});
  contentTable.innerHTML='<h3>📚 فروش به تفکیک مطلب</h3><table style="width:100%;border-collapse:collapse"><tr><th style="text-align:right;padding:8px">مطلب</th><th>تعداد فروش</th><th>درآمد</th></tr>'+Object.entries(cm).sort((a,b)=>b[1].r-a[1].r).map(([id,x])=>'<tr><td style="padding:8px;border-bottom:1px solid #eee">'+esc(contentMap[id]?.title||id)+'</td><td>'+num(x.n)+'</td><td>'+money(x.r)+'</td></tr>').join('')+'</table>';
  const map={};regs.forEach(x=>{map[x.workshop_id]??={n:0,a:0,c:0,r:0};map[x.workshop_id].n++;if(x.attendance_status==='attended')map[x.workshop_id].a++;if(x.certificate_number)map[x.workshop_id].c++;if(x.payment_status==='paid')map[x.workshop_id].r+=Number(x.amount||0);});
  table.innerHTML='<h3>🎓 عملکرد کارگاه و مدرس</h3><table style="width:100%;border-collapse:collapse"><tr><th style="text-align:right;padding:8px">کارگاه</th><th>مدرس</th><th>ثبت‌نام</th><th>حضور</th><th>نرخ حضور</th><th>گواهی</th><th>درآمد</th></tr>'+Object.entries(map).sort((a,b)=>b[1].r-a[1].r).map(([id,x])=>{const rate=x.n?Math.round(x.a/x.n*100):0;return '<tr><td style="padding:8px;border-bottom:1px solid #eee">'+esc(workshops[id]?.title||id)+'</td><td>'+esc(workshops[id]?.instructor_name||'-')+'</td><td>'+num(x.n)+'</td><td>'+num(x.a)+'</td><td>'+num(rate)+'٪</td><td>'+num(x.c)+'</td><td>'+money(x.r)+'</td></tr>';}).join('')+'</table>';
 }
 document.getElementById('eaRun').onclick=run;run();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,400));else setTimeout(boot,400);
})();