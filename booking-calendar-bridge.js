// Keep the visible legacy booking form as the single source of truth for calendar selection.
(() => {
  const byId = (id) => document.getElementById(id);
  let checking = false;
  function status(message, isError = false) {
    let node = byId('bookingCalendarBridgeStatus');
    if (!node) {
      node = document.createElement('div');
      node.id = 'bookingCalendarBridgeStatus';
      node.setAttribute('role', 'status');
      node.style.cssText = 'margin:10px 0;padding:10px 12px;border-radius:10px;background:#eef2ff;color:#3730a3;font-size:13px;line-height:1.8;white-space:pre-wrap;word-break:break-word';
      const calendar = byId('bookingCalendar');
      if (calendar?.parentNode) calendar.parentNode.insertBefore(node, calendar);
    }
    node.style.background = isError ? '#fee2e2' : '#eef2ff';
    node.style.color = isError ? '#991b1b' : '#3730a3';
    node.textContent = message;
  }
  function bind() {
    const select = byId('consultant');
    if (!select) return;
    if (select.dataset.calendarBridgeBound !== '4') {
      select.dataset.calendarBridgeBound = '4';
      select.addEventListener('change', async () => {
        if (checking) return;
        const id = select.value;
        if (!id) {
          status('برای مشاهده نوبت‌ها ابتدا مشاور را انتخاب کنید.');
          return;
        }
        checking = true;
        const section = byId('booking');
        if (section) {
          section.classList.remove('hidden');
          section.style.display = 'block';
        }
        status('مشاور انتخاب شد؛ در حال دریافت زمان‌های آزاد…');
        try {
          // Allow the original page change handler to finish its RPC and render.
          await new Promise(resolve => setTimeout(resolve, 1800));
          const calendar = byId('bookingCalendar');
          const content = calendar?.textContent?.trim() || '';
          if (calendar?.querySelector('.cal-day.available')) {
            status('تقویم بارگذاری شد؛ روزهای دارای نوبت مشخص شده‌اند.');
          } else if (content && !content.includes('ابتدا مشاور را انتخاب کنید')) {
            status('تقویم پاسخ داد، اما روز قابل انتخاب نمایش داده نشد. پیام تقویم: ' + content.slice(0, 240), true);
          } else {
            status('شناسه مشاور انتخاب شده است، اما بارگذاری تقویم اصلی انجام نشد. احتمالاً رویداد یا تابع اصلی بارگذاری متصل نیست.', true);
          }
        } catch (error) {
          status('خطا هنگام بررسی تقویم: ' + (error?.message || String(error)), true);
          console.error('[calendar bridge]', error);
        } finally { checking = false; }
      });
    }
  }
  // Card-based selection must also synchronize the legacy select, whose change handler loads slots.
  document.addEventListener('click', event => {
    const button = event.target?.closest?.('.consultant-book-btn');
    if (!button) return;
    const id = button.dataset.consultantId || button.getAttribute('data-consultant-id');
    if (!id) return;
    const select = byId('consultant');
    if (!select) return;
    const option = Array.from(select.options).find(item => item.value === id);
    if (!option) {
      status('مشاور انتخاب شد، اما گزینه متناظر در فهرست رزرو پیدا نشد. فهرست مشاوران را دوباره بارگذاری کنید.', true);
      return;
    }
    select.value = id;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    byId('booking')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  });
  bind();
  new MutationObserver(bind).observe(document.documentElement, { childList: true, subtree: true });
})();
