import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || 'https://aserkyiwwyggtixckjsv.supabase.co';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const client = createClient(url, key);

const esc = (value = '') => String(value).replace(/[&<>\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char]));
const money = (value) => value == null || value === '' ? 'قیمت پس از تأیید' : `${new Intl.NumberFormat('fa-IR').format(Number(value))} ریال`;

function injectStyles() {
  if (document.getElementById('services-runtime-styles')) return;
  const style = document.createElement('style');
  style.id = 'services-runtime-styles';
  style.textContent = `
    #services .service-admin-box{margin-top:28px;padding:22px;border:1px solid #dbe7e4;border-radius:20px;background:#fff;box-shadow:0 12px 35px rgba(24,70,64,.08)}
    #services .service-admin-grid{display:grid;grid-template-columns:1.2fr 1.8fr .8fr .9fr auto;gap:10px;align-items:end}
    #services .service-admin-grid label{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700;color:#294b47}
    #services .service-admin-grid input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d7e3e0;border-radius:12px;background:#fbfdfc}
    #services .service-admin-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:14px}
    #services .service-admin-list{display:grid;gap:10px;margin-top:18px}
    #services .service-admin-row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:13px 15px;border:1px solid #e3ecea;border-radius:14px;background:#f9fcfb}
    #services .service-admin-row strong{display:block}.service-admin-row small{color:#647875}
    #services .service-public-card{cursor:pointer;transition:.18s ease}.service-public-card.selected{border-color:#4d8b80;box-shadow:0 10px 25px rgba(50,110,98,.14);transform:translateY(-2px)}
    #services .service-select-note{margin-top:18px;padding:13px 16px;border-radius:14px;background:#eef8f5;color:#285c53;display:none}
    #services .service-runtime-error{margin-top:14px;color:#a63c3c;font-size:14px}
    @media(max-width:900px){#services .service-admin-grid{grid-template-columns:1fr 1fr}#services .service-admin-grid label:first-child,#services .service-admin-grid label:nth-child(2){grid-column:span 2}}
    @media(max-width:600px){#services .service-admin-grid{grid-template-columns:1fr}#services .service-admin-grid label:first-child,#services .service-admin-grid label:nth-child(2){grid-column:auto}}
  `;
  document.head.appendChild(style);
}

async function loadServices() {
  const { data, error } = await client.from('services').select('id,name,description,duration_minutes,price,is_active,sort_order').eq('is_active', true).order('sort_order').order('created_at');
  if (error) throw error;
  return data || [];
}

function renderPublicServices(root, services) {
  const cards = services.length ? services.map((service) => `
    <article class="service-card service-public-card" data-service-id="${esc(service.id)}" tabindex="0" role="button" aria-label="انتخاب ${esc(service.name)}">
      <div class="service-icon"><span style="font-size:20px">✓</span></div>
      <h3>${esc(service.name)}</h3>
      <p>${esc(service.description || 'برای دریافت این خدمت، گزینه را انتخاب کنید.')}</p>
      <div style="display:flex;justify-content:space-between;gap:10px;margin-top:14px;font-size:13px"><span>${service.duration_minutes ? `${esc(service.duration_minutes)} دقیقه` : 'مدت پس از هماهنگی'}</span><strong>${money(service.price)}</strong></div>
    </article>`).join('') : '<div class="success-box"><h3>هنوز خدمتی ثبت نشده است</h3><p>مدیریت مرکز می‌تواند اولین خدمت را از بخش مدیریت خدمات اضافه کند.</p></div>';
  root.querySelector('[data-service-grid]')?.replaceChildren();
  root.querySelector('[data-service-grid]').innerHTML = cards;
  const note = root.querySelector('[data-service-note]');
  root.querySelectorAll('[data-service-id]').forEach((card) => {
    const select = () => {
      root.querySelectorAll('[data-service-id]').forEach((item) => item.classList.remove('selected'));
      card.classList.add('selected');
      const service = services.find((item) => item.id === card.dataset.serviceId);
      window.__selectedServiceId = service?.id || null;
      window.__selectedServiceName = service?.name || '';
      localStorage.setItem('selected_service_id', window.__selectedServiceId || '');
      localStorage.setItem('selected_service_name', window.__selectedServiceName || '');
      if (note) { note.style.display = 'block'; note.innerHTML = `خدمت انتخاب‌شده: <strong>${esc(window.__selectedServiceName)}</strong> — حالا می‌توانید نوبت مناسب را انتخاب کنید.`; }
      document.getElementById('slots')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    card.addEventListener('click', select);
    card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); } });
  });
}

async function renderAdmin(root) {
  const { data: sessionData } = await client.auth.getSession();
  const user = sessionData?.session?.user;
  if (user?.app_metadata?.role !== 'admin') return;
  const box = document.createElement('div');
  box.className = 'service-admin-box';
  box.innerHTML = `
    <div class="section-heading" style="margin-bottom:14px"><span class="eyebrow">مدیریت مرکز</span><h3>مدیریت خدمات</h3><p>خدمت جدید را ثبت کنید یا خدمات قبلی را غیرفعال کنید.</p></div>
    <form data-admin-form class="service-admin-grid">
      <label>نام خدمت<input name="name" required placeholder="مثلاً مشاوره فردی" /></label>
      <label>توضیح کوتاه<input name="description" placeholder="شرح خدمت" /></label>
      <label>مدت (دقیقه)<input name="duration" type="number" min="1" placeholder="45" /></label>
      <label>قیمت (ریال)<input name="price" type="number" min="0" step="1" placeholder="500000" /></label>
      <button class="primary-button" type="submit">افزودن خدمت</button>
    </form>
    <div data-admin-list class="service-admin-list"></div>
    <div data-admin-error class="service-runtime-error"></div>`;
  root.appendChild(box);

  const list = box.querySelector('[data-admin-list]');
  const errorBox = box.querySelector('[data-admin-error]');
  const refresh = async () => {
    const { data, error } = await client.from('services').select('id,name,description,duration_minutes,price,is_active,sort_order').order('sort_order').order('created_at');
    if (error) { errorBox.textContent = error.message; return; }
    list.innerHTML = (data || []).map((item) => `<div class="service-admin-row"><div><strong>${esc(item.name)}</strong><small>${esc(item.description || '')} ${item.duration_minutes ? `· ${esc(item.duration_minutes)} دقیقه` : ''} · ${money(item.price)}</small></div><button class="secondary-button" type="button" data-toggle="${esc(item.id)}">${item.is_active ? 'غیرفعال کردن' : 'فعال کردن'}</button></div>`).join('') || '<p>خدمتی ثبت نشده است.</p>';
    list.querySelectorAll('[data-toggle]').forEach((button) => button.addEventListener('click', async () => {
      const id = button.dataset.toggle;
      const item = (data || []).find((row) => row.id === id);
      if (!item) return;
      const { error: updateError } = await client.from('services').update({ is_active: !item.is_active, updated_at: new Date().toISOString() }).eq('id', id);
      if (updateError) errorBox.textContent = updateError.message; else { errorBox.textContent = ''; await refresh(); await refreshPublic(root); }
    }));
  };
  box.querySelector('[data-admin-form]').addEventListener('submit', async (event) => {
    event.preventDefault(); errorBox.textContent = '';
    const form = new FormData(event.currentTarget);
    const payload = { name: String(form.get('name') || '').trim(), description: String(form.get('description') || '').trim() || null, duration_minutes: Number(form.get('duration')) || null, price: form.get('price') === '' ? null : Number(form.get('price')), is_active: true };
    if (!payload.name) { errorBox.textContent = 'نام خدمت را وارد کنید.'; return; }
    const { error } = await client.from('services').insert(payload);
    if (error) { errorBox.textContent = error.message; return; }
    event.currentTarget.reset(); await refresh(); await refreshPublic(root);
  });
  await refresh();
}

async function refreshPublic(root) {
  const services = await loadServices();
  renderPublicServices(root, services);
}

async function mount() {
  const root = document.getElementById('services');
  if (!root) return;
  injectStyles();
  root.innerHTML = `<div class="container"><div class="section-heading"><span class="eyebrow">خدمات مرکز</span><h2>خدمت مورد نیاز خود را انتخاب کنید</h2><p>خدمات فعال مرکز را مشاهده کنید و گزینه مناسب خود را برای ادامه درخواست مشاوره انتخاب کنید.</p></div><div data-service-grid class="service-grid"></div><div data-service-note class="service-select-note"></div></div>`;
  try { await refreshPublic(root); } catch (error) { root.querySelector('[data-service-grid]').innerHTML = '<div class="auth-error">دریافت خدمات مرکز در حال حاضر ممکن نیست.</div>'; }
  await renderAdmin(root);
}

function boot() {
  if (document.getElementById('services')) mount();
  else new MutationObserver(() => { if (document.getElementById('services')) { mount(); } }).observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
