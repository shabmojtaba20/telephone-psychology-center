(() => {
  const SB_URL = 'https://aserkyiwwyggtixckjsv.supabase.co';
  const SB_KEY = 'sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
  let db;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const fmtDate = (v) => {
    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{
        year:'numeric',month:'long',day:'numeric',weekday:'long',
        hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tehran'
      }).format(new Date(v));
    } catch (_) { return String(v || ''); }
  };

  function ensureDb() {
    if (!db && window.supabase) db = window.supabase.createClient(SB_URL, SB_KEY);
    return db;
  }

  function extractInvokeError(error, data) {
    if (data?.error) return data.error + (data.detail ? ' — ' + data.detail : '');
    const ctx = error?.context;
    if (ctx?.body) {
      try {
        const body = typeof ctx.body === 'string' ? JSON.parse(ctx.body) : ctx.body;
        if (body?.error) return body.error + (body.detail ? ' — ' + body.detail : '');
        if (body?.message) return body.message;
      } catch (_) {}
    }
    return error?.message || 'تولید تحلیل هوش مصنوعی ناموفق بود.';
  }

  function fallbackRecommendations(topics) {
    const t = Array.isArray(topics) ? topics : [];
    return t.length ? [
      'در جلسه ابتدا زمان شروع، روند و شدت موضوع را با مراجعه‌کننده روشن کنید.',
      'موقعیت‌ها و عوامل مرتبط با تشدید یا کاهش موضوع را بررسی کنید.',
      'تأثیر موضوع بر خواب، کار، روابط و فعالیت‌های روزمره را ارزیابی کنید.',
      'هدف مراجعه‌کننده از جلسه و انتظار او از فرایند مشاوره را مشخص کنید.'
    ] : [];
  }

  function renderResult(box, data) {
    const topics = Array.isArray(data?.topics) ? data.topics : [];
    const recommendations = Array.isArray(data?.recommendations) && data.recommendations.length
      ? data.recommendations : fallbackRecommendations(topics);
    const items = topics.filter(Boolean).slice(0,6).map(t => '<li>' + esc(t) + '</li>').join('');
    const recs = recommendations.filter(Boolean).slice(0,6).map(t => '<li>' + esc(t) + '</li>').join('');
    box.innerHTML = '<div class="mini" style="margin-top:10px;background:#fafbff">' +
      '<div><strong>🧠 خلاصه تحلیل اولیه</strong></div>' +
      '<p style="white-space:pre-wrap;margin:8px 0 12px">' + esc(data?.summary || '') + '</p>' +
      (items ? '<div><strong>محورهای پیشنهادی بررسی</strong></div><ul style="margin:8px 0;padding-right:20px">' + items + '</ul>' : '') +
      (recs ? '<div style="margin-top:10px"><strong>💡 راهکارهای پیشنهادی اولیه</strong></div><ul style="margin:8px 0;padding-right:20px">' + recs + '</ul>' : '') +
      '<div class="muted" style="margin-top:8px">' +
      (data?.cached ? 'این تحلیل قبلاً ذخیره شده است.' : 'تحلیل برای این نوبت تولید و ذخیره شد.') +
      ' این خروجی غیرتشخیصی است و جایگزین قضاوت حرفه‌ای مشاور نیست.</div></div>';
  }

  async function generate(appointmentId, button, box) {
    button.disabled = true;
    button.textContent = 'در حال تحلیل...';
    box.innerHTML = '<div class="mini">در حال آماده‌سازی تحلیل اولیه...</div>';
    try {
      const client = ensureDb();
      if (!client) throw new Error('اتصال به Supabase برقرار نشد.');
      const { data, error } = await client.functions.invoke('appointment-ai-summary', {
        body: { appointment_id: appointmentId, regenerate: false }
      });
      if (error) throw new Error(extractInvokeError(error, data));
      if (data?.error) throw new Error(extractInvokeError(null, data));
      renderResult(box, data);
      button.textContent = '🧠 تحلیل هوش مصنوعی رایگان';
      button.classList.add('green');
    } catch (e) {
      box.innerHTML = '<div class="msg err">' + esc(e?.message || 'تولید تحلیل هوش مصنوعی ناموفق بود.') + '</div>';
      button.textContent = '🧠 تحلیل هوش مصنوعی رایگان';
    } finally {
      button.disabled = false;
    }
  }

  function enhanceCards() {
    const list = document.getElementById('appointmentList');
    if (!list) return false;
    list.querySelectorAll('.appointment').forEach(card => {
      if (card.querySelector('[data-ai-free]')) return;
      const idButton = card.querySelector('[data-a]');
      const appointmentId = idButton?.dataset?.a;
      if (!appointmentId) return;

      const paymentText = (card.textContent || '').toLowerCase();
      const paid = paymentText.includes('پرداخت: paid') || paymentText.includes('پرداخت: پرداخت‌شده');
      if (!paid) return;

      const reason = card.querySelector('.reason');
      if (!reason) return;

      const wrap = document.createElement('div');
      wrap.className = 'actions';
      wrap.style.marginTop = '9px';
      wrap.innerHTML =
        '<button type="button" class="btn green" data-ai-free="' + esc(appointmentId) + '">🧠 تحلیل هوش مصنوعی رایگان</button>' +
        '<div data-ai-result="' + esc(appointmentId) + '" style="width:100%"></div>';
      reason.insertAdjacentElement('afterend', wrap);
    });
    return true;
  }

  function bind() {
    const list = document.getElementById('appointmentList');
    if (!list || list.dataset.aiBound === '1') return;
    list.dataset.aiBound = '1';
    list.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-ai-free]');
      if (!button) return;
      const id = button.getAttribute('data-ai-free');
      const box = list.querySelector('[data-ai-result="' + CSS.escape(id) + '"]');
      if (box) await generate(id, button, box);
    });
  }

  function boot() {
    bind();
    enhanceCards();
    const list = document.getElementById('appointmentList');
    if (list && !list.dataset.aiObserver) {
      list.dataset.aiObserver = '1';
      new MutationObserver(() => enhanceCards()).observe(list, { childList:true, subtree:true });
    }
  }

  let tries = 0;
  const retry = () => {
    tries++;
    boot();
    if (tries < 60 && !document.getElementById('appointmentList')) setTimeout(retry, 500);
  };
  retry();
})();
