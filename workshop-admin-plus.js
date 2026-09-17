(function(){
  const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  let db;
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
  const fmt=v=>v?new Date(v).toLocaleString('fa-IR-u-ca-persian',{dateStyle:'medium',timeStyle:'short'}):'-';
  const money=n=>Number(n||0).toLocaleString('fa-IR')+' تومان';
  const statusLabel={registered:'ثبت‌نام‌شده',attended:'حاضر',absent:'غایب',cancelled:'لغوشده'};
  const paymentLabel={free:'رایگان',paid:'پرداخت‌شده',pending:'در انتظار پرداخت',failed:'ناموفق',cancelled:'لغوشده'};
  function getDb(){return db||(window.supabase&&(db=window.supabase.createClient(SB_URL,SB_KEY)));}
  function modal(html){
    document.querySelectorAll('.ws-plus-modal').forEach(x=>x.remove());
    const d=document.createElement('div');d.className='modalx ws-plus-modal';d.innerHTML='<div class="box">'+html+'</div>';document.body.appendChild(d);
    d.addEventListener('click',e=>{if(e.target===d)d.remove()});return d;
  }
  async function people(id){
    const d=getDb();if(!d)return;
    const [w,r]=await Promise.all([d.from('workshops').select('*').eq('id',id).maybeSingle(),d.from('workshop_registrations').select('*').eq('workshop_id',id).order('created_at',{ascending:false})]);
    if(w.error||r.error)return alert('خطا در دریافت شرکت‌کنندگان.');
    const rows=r.data||[];
    const paid=rows.filter(x=>['free','paid'].includes(x.payment_status));
    const attended=rows.filter(x=>x.attendance_status==='attended').length;
    const revenue=rows.filter(x=>x.payment_status==='paid').reduce((a,x)=>a+Number(x.amount||0),0);
    const m=modal('<h2>👥 شرکت‌کنندگان: '+esc(w.data?.title||'')+'</h2><div class="stats"><span class="stat">کل: <strong>'+rows.length.toLocaleString('fa-IR')+'</strong></span><span class="stat">معتبر: <strong>'+paid.length.toLocaleString('fa-IR')+'</strong></span><span class="stat">حاضر: <strong>'+attended.toLocaleString('fa-IR')+'</strong></span><span class="stat">درآمد: <strong>'+money(revenue)+'</strong></span></div><div id="wsPeopleBody"></div><button class="btn mini" onclick="this.closest(\'.ws-plus-modal\').remove()">بستن</button>');
    const body=m.querySelector('#wsPeopleBody');
    body.innerHTML=rows.length?'<div style="overflow:auto"><table><thead><tr><th>نام</th><th>موبایل</th><th>ایمیل</th><th>پرداخت</th><th>حضور</th><th>مدرک</th><th>عملیات</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+esc(x.full_name||'-')+'</td><td>'+esc(x.mobile||'-')+'</td><td>'+esc(x.email||'-')+'</td><td>'+esc(paymentLabel[x.payment_status]||x.payment_status||'-')+'<br>'+money(x.amount)+'</td><td><select data-att="'+x.id+'"><option value="registered" '+(x.attendance_status==='registered'?'selected':'')+'>ثبت‌نام‌شده</option><option value="attended" '+(x.attendance_status==='attended'?'selected':'')+'>حاضر</option><option value="absent" '+(x.attendance_status==='absent'?'selected':'')+'>غایب</option><option value="cancelled" '+(x.attendance_status==='cancelled'?'selected':'')+'>لغوشده</option></select></td><td>'+esc(x.certificate_number||'—')+'</td><td><button class="btn mini" data-save="'+x.id+'">ذخیره</button>'+(x.attendance_status==='attended'&&['free','paid'].includes(x.payment_status)&&!x.certificate_number?'<button class="btn green mini" data-cert="'+x.id+'">صدور گواهی</button>':'')+'</td></tr>').join('')+'</tbody></table></div>':'<div class="empty">هنوز شرکت‌کننده‌ای ثبت نشده است.</div>';
    body.querySelectorAll('[data-save]').forEach(b=>b.onclick=async()=>{const rid=b.dataset.save,sel=body.querySelector('[data-att="'+rid+'"]'),val=sel.value,upd={attendance_status:val,attended_at:val==='attended'?new Date().toISOString():null};const z=await d.from('workshop_registrations').update(upd).eq('id',rid);if(z.error)return alert(z.error.message);alert('وضعیت حضور ذخیره شد.');people(id);});
    body.querySelectorAll('[data-cert]').forEach(b=>b.onclick=async()=>{b.disabled=true;const z=await d.rpc('issue_workshop_certificate',{p_registration_id:b.dataset.cert});if(z.error){b.disabled=false;return alert(z.error.message)}alert('گواهی صادر شد: '+z.data);people(id);});
  }
  function boot(){
    if(!window.supabase)return;
    window.wsPeople=people;
    const st=document.createElement('style');st.textContent='.ws-plus-modal select{padding:6px;border:1px solid #ddd;border-radius:8px;background:#fff}.ws-plus-modal table{min-width:850px}.ws-plus-modal td,.ws-plus-modal th{vertical-align:middle}.ws-plus-modal .btn{margin:2px}';document.head.appendChild(st);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
