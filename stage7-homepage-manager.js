const STAGE7_SUPABASE_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const STAGE7_SUPABASE_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
(async()=>{
 try{
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const sb=createClient(STAGE7_SUPABASE_URL,STAGE7_SUPABASE_KEY);
  const isAdmin=location.pathname.includes('admin-professional.html');
  if(isAdmin){
   const media=document.querySelector('#media');
   if(!media)return;
   const old=document.getElementById('stage7Homepage'); if(old)old.remove();
   const sec=document.createElement('section'); sec.id='stage7Homepage'; sec.className='section';
   sec.innerHTML=`<div class="card"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h2 style="margin:0">🏠 مدیریت حرفه‌ای صفحه اصلی</h2><p class="muted" style="margin:.35rem 0 0">نمایش/عدم نمایش بخش‌ها، عنوان‌ها و ترتیب آن‌ها را از همین‌جا کنترل کنید.</p></div><button class="btn green" id="stage7Save">💾 ذخیره تغییرات صفحه اصلی</button></div><div id="stage7List" style="margin-top:18px;display:grid;gap:10px"></div><div id="stage7Msg" style="margin-top:10px"></div></div>`;
   media.parentNode.insertBefore(sec,media);
   const list=sec.querySelector('#stage7List'),msg=sec.querySelector('#stage7Msg');
   const labels={hero:'معرفی اصلی',services:'خدمات مرکز',education:'آموزش و مطالب',gallery:'گالری تصاویر',consultants:'مشاوران',payment:'سوابق پرداخت',about:'درباره مرکز'};
   let rows=[];
   async function load(){
    const {data,error}=await sb.from('homepage_sections').select('*').order('sort_order');
    if(error){msg.className='msg err';msg.textContent='خطا در دریافت تنظیمات صفحه اصلی: '+error.message;return;}
    rows=data||[];
    list.innerHTML=rows.map((r,i)=>`<div class="panel" data-key="${r.section_key}" style="display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center"><label style="display:flex;align-items:center;gap:7px;white-space:nowrap"><input type="checkbox" class="s7-visible" ${r.is_visible?'checked':''}> نمایش</label><div><b>${labels[r.section_key]||r.section_key}</b><input class="s7-title" value="${esc(r.title||'')}" placeholder="عنوان"><input class="s7-sub" value="${esc(r.subtitle||'')}" placeholder="زیرعنوان"></div><div style="display:flex;gap:6px"><button class="close s7-up" ${i===0?'disabled':''}>⬆️</button><button class="close s7-down" ${i===rows.length-1?'disabled':''}>⬇️</button></div></div>`).join('');
    list.querySelectorAll('.s7-up').forEach(b=>b.onclick=()=>move(b.closest('[data-key]').dataset.key,-1));
    list.querySelectorAll('.s7-down').forEach(b=>b.onclick=()=>move(b.closest('[data-key]').dataset.key,1));
   }
   function esc(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
   function move(key,dir){const i=rows.findIndex(x=>x.section_key===key),j=i+dir;if(i<0||j<0||j>=rows.length)return;[rows[i],rows[j]]=[rows[j],rows[i]];rows.forEach((r,k)=>r.sort_order=(k+1)*10);renderLocal();}
   function renderLocal(){list.querySelectorAll('[data-key]').forEach((el,i)=>{const r=rows[i];el.dataset.key=r.section_key;el.querySelector('.s7-visible').checked=r.is_visible;el.querySelector('.s7-title').value=r.title||'';el.querySelector('.s7-sub').value=r.subtitle||'';el.querySelector('.s7-up').disabled=i===0;el.querySelector('.s7-down').disabled=i===rows.length-1});}
   sec.querySelector('#stage7Save').onclick=async()=>{
    msg.textContent='در حال ذخیره...';
    for(const el of list.querySelectorAll('[data-key]')){
      const key=el.dataset.key,r=rows.find(x=>x.section_key===key);
      r.is_visible=el.querySelector('.s7-visible').checked;r.title=el.querySelector('.s7-title').value.trim()||labels[key];r.subtitle=el.querySelector('.s7-sub').value.trim();
      const {error}=await sb.from('homepage_sections').update({title:r.title,subtitle:r.subtitle,is_visible:r.is_visible,sort_order:r.sort_order,updated_at:new Date().toISOString()}).eq('id',r.id);
      if(error){msg.className='msg err';msg.textContent='ذخیره نشد: '+error.message;return;}
    }
    msg.className='msg ok';msg.textContent='تنظیمات صفحه اصلی با موفقیت ذخیره شد.';
   };
   load();
  }
 }catch(e){console.error('Stage7 homepage manager',e)}
})();
