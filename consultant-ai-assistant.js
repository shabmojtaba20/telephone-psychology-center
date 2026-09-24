(() => {
  const SB_URL = 'https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY = 'sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  let db, rows = [], selectedId = '';

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtDate = (v) => {
    try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'long',day:'numeric',weekday:'long',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tehran'}).format(new Date(v)); }
    catch (_) { return String(v || ''); }
  };

  function ensureDb() {
    if (!db && window.supabase) db = window.supabase.createClient(SB_URL, SB_KEY);
    return db;
  }

  function mount() {
    if (document.getElementById('aiConsultantAssistant')) return true;
    const list = document.getElementById('appointmentList');
    if (!list) return false;
    const section = document.createElement('section');
    section.id = 'aiConsultantAssistant';
    section.className = 'card section';
    section.innerHTML = `
      <h2>🧠 دستیار هوش مصنوعی مشاور</h2>
      <p class="muted">تحلیل اولیه فقط از «علت مراجعه» همین نوبت ساخته می‌شود؛ تشخیص پزشکی یا روان‌شناختی نیست و جایگزین قضاوت مشاور نمی‌شود.</p>
      <div class="formgrid">
        <label class="field full">نوبت
          <select id="aiAppointmentSelect"><option value="">در حال دریافت نوبت‌ها...</option></select>
        </label>
      </div>
      <div id="aiSource" class="reason" style="display:none"></div>
      <div class="actions" style="margin-top:10px">
        <button id="aiGenerateBtn" class="btn" type="button">تولید تحلیل اولیه</button>
        <button id="aiRegenerateBtn" class="btn orange" type="button" style="display:none">بازسازی تحلیل</button>
      </div>
      <div id="aiResult" style="margin-top:12px"></div>
    `;
    list.parentNode.insertBefore(section, list);
    document.getElementById('aiAppointmentSelect').addEventListener('change', () => select(document.getElementById('aiAppointmentSelect').value));
    document.getElementById('aiGenerateBtn').addEventListener('click', () => generate(false));
    document.getElementById('aiRegenerateBtn').addEventListener('click', () => generate(true));
    return true;
  }

  async function load() {
    if (!mount()) return false;
    const client = ensureDb();
    if (!client) return false;
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData?.session) return false;
    const { data, error } = await client.rpc('get_my_consultant_appointments');
    if (error) {
      showError('دریافت نوبت‌های مشاور برای دستیار هوش مصنوعی ناموفق بود.');
      return true;
    }
    rows = Array.isArray(data) ? data.filter(x => x && x.payment_status === 'paid' && x.status !== 'cancelled') : [];
    const select = document.getElementById('aiAppointmentSelect');
    if (!select) return true;
    if (!rows.length) {
      select.innerHTML = '<option value="">نوبت پرداخت‌شده‌ای برای تحلیل وجود ندارد</option>';
      showError('');
      return true;
    }
    select.innerHTML = '<option value="">انتخاب نوبت...</option>' + rows.map(x =>
      '<option value="' + esc(x.id) + '">' + esc(fmtDate(x.scheduled_at)) + (x.client_reason ? ' — دارای علت مراجعه' : ' — بدون علت مراجعه') + '</option>'
    ).join('');
    if (!selectedId || !rows.some(x => x.id === selectedId)) selectedId = rows[0].id;
    select.value = selectedId;
    select.dispatchEvent(new Event('change'));
    return true;
  }

  function showError(text) {
    const box = document.getElementById('aiResult');
    if (!box) return;
    box.innerHTML = text ? '<div class="msg err">' + esc(text) + '</div>' : '';
  }

  function select(id) {
    selectedId = id || '';
    const row = rows.find(x => x.id === selectedId);
    const source = document.getElementById('aiSource');
    const result = document.getElementById('aiResult');
    const gen = document.getElementById('aiGenerateBtn');
    const regen = document.getElementById('aiRegenerateBtn');
    if (!row) {
      source.style.display = 'none';
      result.innerHTML = '';
      gen.style.display = 'none';
      regen.style.display = 'none';
      return;
    }
    const reason = String(row.client_reason || '').trim();
    source.style.display = 'block';
    source.innerHTML = '<strong>علت مراجعه:</strong><br>' + (reason ? esc(reason) : '<span class="muted">برای این نوبت علت مراجعه ثبت نشده است.</span>');
    gen.style.display = reason ? 'inline-block' : 'none';
    regen.style.display = row.ai_summary ? 'inline-block' : 'none';
    if (row.ai_summary) {
      renderResult(row.ai_summary, Array.isArray(row.ai_topics) ? row.ai_topics : [], row.ai_generated_at, true);
    } else {
      result.innerHTML = reason ? '<div class="mini">هنوز تحلیلی برای این نوبت ذخیره نشده است. برای تولید تحلیل اولیه، دکمه بالا را بزنید.</div>' : '<div class="mini">بدون «علت مراجعه»، تحلیلی برای تولید وجود ندارد.</div>';
    }
  }

  function renderResult(summary, topics, generatedAt, cached) {
    const box = document.getElementById('aiResult');
    if (!box) return;
    const items = (topics || []).filter(Boolean).slice(0,6).map(t => '<li>' + esc(t) + '</li>').join('');
    box.innerHTML = `
      <div class="mini">
        <div><strong>خلاصه اولیه</strong></div>
        <p style="white-space:pre-wrap;margin:8px 0 12px">${esc(summary)}</p>
        <div><strong>محورهای پیشنهادی برای بررسی</strong></div>
        ${items ? '<ul style="margin:8px 0;padding-right:20px">' + items + '</ul>' : '<p class="muted">محور مشخصی تولید نشده است.</p>'}
        <div class="muted">${generatedAt ? 'آخرین تولید: ' + esc(fmtDate(generatedAt)) : ''}${cached ? ' · ذخیره‌شده در پرونده نوبت' : ''}</div>
      </div>`;
  }

  function extractInvokeError(error, data) {\n    if (data?.error) return data.error + (data.detail ? ' — ' + data.detail : '');\n    const ctx = error?.context;\n    if (ctx?.body) {\n      try { const body = typeof ctx.body === 'string' ? JSON.parse(ctx.body) : ctx.body; if (body?.error) return body.error + (body.detail ? ' — ' + body.detail : ''); if (body?.message) return body.message; } catch (_) {}\n    }\n    return error?.message || 'تولید تحلیل هوش مصنوعی ناموفق بود.';\n  }\n\n  async function generate(regenerate) {
    const id = selectedId;
    if (!id) return;
    const row = rows.find(x => x.id === id);
    if (!row?.client_reason?.trim()) return;
    const gen = document.getElementById('aiGenerateBtn');
    const regen = document.getElementById('aiRegenerateBtn');
    const result = document.getElementById('aiResult');
    gen.disabled = true; regen.disabled = true;
    gen.textContent = 'در حال تحلیل...';
    result.innerHTML = '<div class="mini">در حال آماده‌سازی تحلیل اولیه...</div>';
    try {
      const client = ensureDb();
      const { data, error } = await client.functions.invoke('appointment-ai-summary', {
        body: { appointment_id: id, regenerate: !!regenerate }
      });
      if (error) throw new Error(extractInvokeError(error, data));
      if (data?.error) throw new Error(extractInvokeError(null, data));
      row.ai_summary = data.summary || '';
      row.ai_topics = Array.isArray(data.topics) ? data.topics : [];
      row.ai_generated_at = data.generated_at || new Date().toISOString();
      renderResult(row.ai_summary, row.ai_topics, row.ai_generated_at, !!data.cached);
      regen.style.display = 'inline-block';
    } catch (e) {
      result.innerHTML = '<div class="msg err">' + esc(e?.message || 'تولید تحلیل هوش مصنوعی ناموفق بود.') + '</div>';
    } finally {
      gen.disabled = false; regen.disabled = false; gen.textContent = 'تولید تحلیل اولیه';
    }
  }

  let tries = 0;
  const boot = async () => {
    tries++;
    try {
      const ok = await load();
      if (ok || tries > 40) return;
    } catch (_) {}
    setTimeout(boot, 500);
  };
  boot();
})();
