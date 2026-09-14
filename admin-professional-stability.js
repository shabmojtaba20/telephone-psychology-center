(()=>{
'use strict';
const SB_URL='https://aserkyiwwyggtixckjsv.supabase.co';
const SB_KEY='sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const $=id=>document.getElementById(id);
const note=(msg,bad=false)=>{const n=$('notice');if(n){n.textContent=msg;n.className='notice'+(bad?' err':'');n.style.display='block';setTimeout(()=>n.style.display='none',3500)}else console[bad?'error':'log'](msg)};
const val=id=>$(id)?.value??'';
const setVal=(id,v)=>{const e=$(id);if(e)e.value=v??''};
async function init(){
 if(location.pathname!=='/admin-professional.html'&&location.pathname!=='/admin-professional')return;
 if(!window.supabase)return;
 const db=window.supabase.createClient(SB_URL,SB_KEY);
 const {data:{session}}=await db.auth.getSession();
 if(!session)return;
 const admin=await db.rpc('is_admin');
 if(admin.error||admin.data!==true)return;
 window.__adminStableDb=db;
 bindGeneral(db); bindAppearance(db); bindContact(db); bindFinance(db);
 await loadPublic(db); await loadFinance(db);
}
function bindGeneral(db){
 const b=$('saveGeneral');if(!b||b.dataset.stable)return;b.dataset.stable='1';b.onclick=async()=>{try{const r=await db.from('center_public_settings').update({center_name:val('g_name').trim(),tagline:val('g_tagline').trim(),description:val('g_desc').trim(),updated_at:new Date().toISOString()}).eq('id',1);if(r.error)throw r.error;note('مشخصات مرکز با موفقیت ذخیره شد');}catch(e){note(e.message||'ذخیره مشخصات مرکز ناموفق بود',true)}};
}
function bindAppearance(db){
 const b=$('saveAppearance');if(!b||b.dataset.stable)return;b.dataset.stable='1';b.onclick=async()=>{try{const r=await db.from('center_public_settings').update({primary_color:val('g_color')||'#5b5bd6',secondary_color:val('g_color2')||'#eef2ff',font_family:val('g_font')||'Tahoma',background_color:val('g_bg')||'#f7f8fc',updated_at:new Date().toISOString()}).eq('id',1);if(r.error)throw r.error;document.documentElement.style.setProperty('--site-primary',val('g_color'));document.documentElement.style.setProperty('--site-secondary',val('g_color2'));document.documentElement.style.setProperty('--site-bg',val('g_bg')||'#f7f8fc');note('ظاهر و برند با موفقیت ذخیره شد');}catch(e){note(e.message||'ذخیره ظاهر ناموفق بود',true)}};
}
function bindContact(db){
 const b=$('saveContact');if(!b||b.dataset.stable)return;b.dataset.stable='1';b.onclick=async()=>{try{const r=await db.from('center_public_settings').update({phone:val('g_phone').trim(),mobile:val('g_mobile').trim(),email:val('g_email').trim(),address:val('g_address').trim(),whatsapp_url:val('g_whatsapp').trim(),telegram_url:val('g_telegram').trim(),instagram_url:val('g_instagram').trim(),working_hours:val('g_hours').trim(),updated_at:new Date().toISOString()}).eq('id',1);if(r.error)throw r.error;note('راه‌های ارتباطی با موفقیت ذخیره شد');}catch(e){note(e.message||'ذخیره راه‌های ارتباطی ناموفق بود',true)}};
}
function bindFinance(db){
 const b=$('saveBank');if(b&&!b.dataset.stable){b.dataset.stable='1';b.onclick=async()=>{try{const r=await db.from('center_financial_settings').update({bank_name:val('bank_name').trim(),card_holder:val('bank_holder').trim(),account_number:val('bank_account').trim(),card_number:val('bank_card').trim(),iban:val('bank_iban').trim(),payment_notes:val('bank_notes').trim(),updated_at:new Date().toISOString()}).eq('id',1);if(r.error)throw r.error;note('اطلاعات بانکی با موفقیت ذخیره شد');}catch(e){note(e.message||'ذخیره اطلاعات بانکی ناموفق بود',true)}}}
 const g=$('saveGateways');if(g&&!g.dataset.stable){g.dataset.stable='1';g.onclick=async()=>{try{const r=await db.from('center_financial_settings').update({zarinpal_enabled:!!$('zarin_enabled')?.checked,zarinpal_merchant_id:val('zarin_merchant').trim(),iran_dargah_enabled:!!$('iran_enabled')?.checked,iran_dargah_merchant_id:val('iran_merchant').trim(),parsian_enabled:!!$('parsian_enabled')?.checked,parsian_terminal_id:val('parsian_terminal').trim(),pasargad_enabled:!!$('pasargad_enabled')?.checked,pasargad_terminal_id:val('pasargad_terminal').trim(),updated_at:new Date().toISOString()}).eq('id',1);if(r.error)throw r.error;note('تنظیمات درگاه‌ها با موفقیت ذخیره شد');}catch(e){note(e.message||'ذخیره درگاه‌ها ناموفق بود',true)}}}
}
async function loadPublic(db){
 try{const {data,error}=await db.from('center_public_settings').select('*').eq('id',1).maybeSingle();if(error)throw error;if(!data)return;
  setVal('g_name',data.center_name);setVal('g_tagline',data.tagline);setVal('g_desc',data.description);setVal('g_phone',data.phone);setVal('g_mobile',data.mobile);setVal('g_email',data.email);setVal('g_address',data.address);setVal('g_whatsapp',data.whatsapp_url);setVal('g_telegram',data.telegram_url);setVal('g_instagram',data.instagram_url);setVal('g_hours',data.working_hours);setVal('g_font',data.font_family||'Tahoma');
  const c1=$('g_color'),c2=$('g_color2'),bg=$('g_bg');if(c1)c1.value=data.primary_color||'#5b5bd6';if(c2)c2.value=data.secondary_color||'#eef2ff';if(bg)bg.value=data.background_color||'#f7f8fc';
 }catch(e){console.warn('admin stability public settings',e)}
}
async function loadFinance(db){
 try{const {data,error}=await db.from('center_financial_settings').select('*').eq('id',1).maybeSingle();if(error)throw error;if(!data)return;
  setVal('bank_name',data.bank_name);setVal('bank_holder',data.card_holder);setVal('bank_account',data.account_number);setVal('bank_card',data.card_number);setVal('bank_iban',data.iban);setVal('bank_notes',data.payment_notes);
  const fields=[['zarin_enabled',data.zarinpal_enabled],['iran_enabled',data.iran_dargah_enabled],['parsian_enabled',data.parsian_enabled],['pasargad_enabled',data.pasargad_enabled]];fields.forEach(([id,v])=>{const e=$(id);if(e)e.checked=!!v});
  setVal('zarin_merchant',data.zarinpal_merchant_id);setVal('iran_merchant',data.iran_dargah_merchant_id);setVal('parsian_terminal',data.parsian_terminal_id);setVal('pasargad_terminal',data.pasargad_terminal_id);
 }catch(e){console.warn('admin stability finance settings',e)}
}
window.addEventListener('error',e=>{if(String(e.message||'').includes('Cannot set properties of null')){console.warn('Ignored legacy admin null-field error:',e.message);e.preventDefault();}},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
