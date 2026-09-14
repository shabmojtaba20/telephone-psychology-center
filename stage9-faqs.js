const STAGE9_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const STAGE9_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
(async()=>{
 try{
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const db=createClient(STAGE9_URL,STAGE9_KEY);
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const isAdmin=location.pathname.includes('admin-professional.html');
  if(isAdmin){
   const nav=document.querySelector('.nav');
   const contentGroup=[...document.querySelectorAll('.group')].find(g=>g.querySelector('[data-page="content"]'));
   const sub=contentGroup?.querySelector('.sub');
   if(sub&&!sub.querySelector('[data-page="faqs"]')){const b=document.createElement('button');b.dataset.page='faqs';b.textContent='❓ پرسش‌های متداول';sub.appendChild(b)}
   let section=document.getElementById('faqs');
   if(!section){section=document.createElement('section');section.id='faqs';section.className='section';const main=document.querySelector('.main');section.innerHTML='<div class="card"><h2>❓ مدیریت پرسش‌های متداول</h2><p class="muted">پرسش و پاسخ‌های واقعی سایت را ایجاد، ویرایش و منتشر کنید.</p><button class="btn" id="f9new">➕ پرسش جدید</button><div id="f9form"></div><div id="f9list"></div></div>';main.appendChild(section)}
   const form=section.querySelector('#f9form'),list=section.querySelector('#f9list');let rows=[];
   const show=()=>{document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));section.classList.add('active');const title=document.getElementById('title');if(title)title.textContent='پرسش‌های متداول';document.querySelectorAll('.nav button[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page==='faqs'))};
   section.querySelector('#f9new').onclick=()=>{show();edit()};
   const edit=r=>{form.innerHTML='<div class="item"><label>پرسش<input id="f9q" maxlength="300"></label><label>پاسخ<textarea id="f9a" maxlength="5000"></textarea></label><div class="fields"><label>دسته‌بندی<input id="f9c" value="عمومی" maxlength="80"></label><label>اولویت<input id="f9p" type="number" value="0"></label></div><button class="btn green" id="f9save">💾 ذخیره</button> <button class="btn gray" id="f9cancel">انصراف</button></div>';if(r){form.querySelector('#f9q').value=r.question;form.querySelector('#f9a').value=r.answer;form.querySelector('#f9c').value=r.category||'عمومی';form.querySelector('#f9p').value=r.priority||0}form.style.display='block';form.querySelector('#f9cancel').onclick=()=>form.style.display='none';form.querySelector('#f9save').onclick=async()=>{const p={question:form.querySelector('#f9q').value.trim(),answer:form.querySelector('#f9a').value.trim(),category:form.querySelector('#f9c').value.trim()||'عمومی',priority:Number(form.querySelector('#f9p').value||0),updated_at:new Date().toISOString()};if(!p.question||!p.answer){alert('پرسش و پاسخ الزامی است');return}const q=r?db.from('site_faqs').update(p).eq('id',r.id):db.from('site_faqs').insert(p);const z=await q;if(z.error){alert(z.error.message);return}form.style.display='none';load()}};
   async function load(){const z=await db.from('site_faqs').select('*').order('priority',{ascending:false}).order('created_at',{ascending:false});if(z.error){list.textContent=z.error.message;return}rows=z.data||[];list.innerHTML=rows.map(r=>'<div class="item"><b>'+esc(r.question)+'</b><p class="muted">'+esc(r.answer)+'</p><small>'+esc(r.category||'عمومی')+' · '+(r.is_published?'🟢 منتشر':'⚪ پیش‌نویس')+'</small><div class="actions"><button class="btn" data-p="'+r.id+'">'+(r.is_published?'لغو انتشار':'انتشار')+'</button><button class="btn secondary" data-e="'+r.id+'">ویرایش</button><button class="btn red" data-d="'+r.id+'">حذف</button></div></div>').join('')||'<div class="empty">پرسشی ثبت نشده است.</div>';list.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{show();edit(rows.find(x=>x.id===b.dataset.e))});list.querySelectorAll('[data-p]').forEach(b=>b.onclick=async()=>{const r=rows.find(x=>x.id===b.dataset.p);const z=await db.from('site_faqs').update({is_published:!r.is_published,updated_at:new Date().toISOString()}).eq('id',r.id);if(z.error)alert(z.error.message);else load()});list.querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{if(!confirm('این پرسش حذف شود؟'))return;const z=await db.from('site_faqs').delete().eq('id',b.dataset.d);if(z.error)alert(z.error.message);else load()})}
   document.querySelector('[data-page="faqs"]')?.addEventListener('click',()=>{show();load()});load();
  }
  if(location.pathname==='/'||location.pathname.endsWith('/index.html')){
   const z=await db.from('site_faqs').select('id,question,answer,category,priority').eq('is_published',true).order('priority',{ascending:false}).order('created_at',{ascending:false}).limit(20);
   if(z.error||!z.data?.length)return;
   let sec=document.querySelector('#faq');
   if(!sec){sec=document.createElement('section');sec.id='faq';sec.className='section';const main=document.querySelector('main');const booking=document.querySelector('#booking');(main||document.body).insertBefore(sec,booking||null)}
   sec.innerHTML='<div class="c"><div class="head"><h2>پرسش‌های متداول</h2><p class="muted">پاسخ پرسش‌های رایج مراجعان مرکز</p></div><div data-faq-list></div></div>';
   const wrap=sec.querySelector('[data-faq-list]');
   z.data.forEach(r=>{const d=document.createElement('details');d.style.cssText='background:#fff;border:1px solid #e5e7eb;border-radius:14px;margin:10px 0;padding:0 14px';const s=document.createElement('summary');s.textContent=r.question;s.style.cssText='cursor:pointer;font-weight:700;padding:16px 4px';const p=document.createElement('div');p.textContent=r.answer;p.style.cssText='padding:0 4px 16px;line-height:1.9;color:#4b5563;white-space:pre-line';d.append(s,p);wrap.appendChild(d)});
  }
 }catch(e){console.error('Stage9 FAQs',e)}
})();
