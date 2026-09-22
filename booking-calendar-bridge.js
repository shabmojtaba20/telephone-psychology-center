// Keep the visible legacy booking form as the single source of truth for calendar selection.
(() => {
  const byId = (id) => document.getElementById(id);
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
    if (!select || select.dataset.calendarBridgeBound === '3') return;
    select.dataset.calendarBridgeBound = '3';
    select.addEventListener('change', async () => {
      const id = select.value;
      if (!id) {
        status('برای مشاهده نوبت‌ها ابتدا مشاور را انتخاب کنید.');
        return;
      }
      const section = byId('booking');
      if (section) {
        section.classList.remove('hidden');
        section.style.display = 'block';
      }
      status('مشاور انتخاب شد؛ در حال دریافت زمان‌های آزاد…');
      try {
        // The page's existing handler is responsible for loading the calendar.
        // Do not invoke booking V2 here: its contact-only branch can replace the visible booking experience.
        await new Promise(resolve => setTimeout(resolve, 900));
        const calendar = byId('bookingCalendar');
        const content = calendar?.textContent?.trim() || '';
        if (calendar && calendar.querySelector('.cal-day.available')) {
          status('تقویم بارگذاری شد؛ روزهای دارای نوبت مشخص شده‌اند.');
        } else if (content) {
          status('فرم تقویم اجرا شد اما روز آزاد پیدا نشد. پیام فعلی: ' + content.slice(0, 240), true);
        } else {
          status('تقویم هنوز محتوایی ندارد. بررسی کنید آیا درخواست دریافت نوبت‌ها پاسخ می‌دهد یا خطای شبکه/دسترسی دارد.', true);
        }
      } catch (error) {
        status('خطا هنگام بررسی تقویم: ' + (error?.message || String(error)), true);
        console.error('[calendar bridge]', error);
      }
    });
  }
  bind();
  new MutationObserver(bind).observe(document.documentElement, { childList: true, subtree: true });
})();
