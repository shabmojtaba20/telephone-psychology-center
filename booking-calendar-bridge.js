// Connect the visible legacy consultant dropdown to the current V2 calendar.
const connectLegacyConsultant = () => {
  const legacy = document.getElementById('consultant');
  if (!legacy || legacy.dataset.calendarBridgeBound === '1') return;
  legacy.dataset.calendarBridgeBound = '1';
  legacy.addEventListener('change', async () => {
    const consultantId = legacy.value;
    if (!consultantId) return;
    const booking = document.getElementById('booking');
    if (booking) {
      booking.classList.remove('hidden');
      booking.style.display = 'block';
    }
    const status = document.getElementById('scheduledAtFa');
    if (status) status.textContent = 'در حال بارگذاری تقویم و زمان‌های آزاد مشاور…';
    if (typeof window.selectConsultantForBooking === 'function') {
      await window.selectConsultantForBooking(consultantId);
      const root = document.getElementById('bookingV2Root');
      if (root) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (status) {
      status.textContent = 'فرم تقویم هنوز آماده نشده است؛ صفحه را یک‌بار تازه‌سازی کنید.';
    }
  });
};
connectLegacyConsultant();
new MutationObserver(connectLegacyConsultant).observe(document.documentElement, { childList: true, subtree: true });
