import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://aserkyiwwyggtixckjsv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7THOazCrwgQGvRPGC8grgA_6J1E_9HX';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function startZarinPalPayment(button) {
  if (button.dataset.paymentBusy === '1') return;
  button.dataset.paymentBusy = '1';
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = 'در حال اتصال به درگاه…';

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('ابتدا وارد حساب کاربری شوید.');

    // The legacy bridge is retained for the current homepage flow, but it must
    // only select an order that still has pending appointments for this user.
    const { data: orders, error: orderError } = await supabase
      .from('booking_orders')
      .select('id,total_amount,payment_status,created_at')
      .eq('user_id', user.id)
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    if (orderError || !orders?.length) throw new Error('سفارش پرداختی پیدا نشد. ابتدا نوبت را ثبت کنید.');

    let order = null;
    for (const candidate of orders) {
      const { data: pendingAppointments, error: appointmentError } = await supabase
        .from('appointments')
        .select('id')
        .eq('booking_order_id', candidate.id)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .eq('payment_status', 'pending')
        .limit(1);
      if (!appointmentError && pendingAppointments?.length) {
        order = candidate;
        break;
      }
    }

    if (!order) throw new Error('سفارش قابل پرداختی پیدا نشد. لطفاً دوباره نوبت را ثبت کنید.');

    const { data, error } = await supabase.functions.invoke('zarinpal-request', {
      body: { order_id: order.id },
    });
    if (error) throw new Error(error.message || 'اتصال به درگاه ناموفق بود.');
    if (!data?.payment_url) throw new Error(data?.error || 'لینک پرداخت دریافت نشد.');

    window.location.assign(data.payment_url);
  } catch (err) {
    const box = document.getElementById('bookMsg');
    if (box) {
      box.className = 'msg err';
      box.textContent = err?.message || 'خطا در شروع پرداخت.';
    } else {
      alert(err?.message || 'خطا در شروع پرداخت.');
    }
    button.disabled = false;
    button.dataset.paymentBusy = '0';
    button.textContent = oldText;
  }
}

function installPaymentBridge() {
  const button = document.getElementById('onlinePay');
  if (!button || button.dataset.zarinpalBridge === '1') return;
  button.dataset.zarinpalBridge = '1';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    startZarinPalPayment(button);
  }, true);
}

function showPaymentResult() {
  const params = new URLSearchParams(window.location.search);
  const payment = params.get('payment');
  if (!payment) return;
  const box = document.getElementById('bookMsg');
  if (!box) return;
  const ref = params.get('ref_id');
  box.className = payment === 'success' ? 'msg ok' : 'msg err';
  box.textContent = payment === 'success'
    ? `پرداخت با موفقیت تأیید شد${ref ? ` — کد پیگیری: ${ref}` : ''}. صورتحساب و تراکنش مالی ثبت شد.`
    : payment === 'cancelled'
      ? 'پرداخت لغو شد و مبلغی ثبت نشده است.'
      : 'پرداخت تأیید نشد. در صورت کسر وجه، وضعیت تراکنش را بررسی می‌کنیم.';
  history.replaceState({}, document.title, `${location.pathname}${location.hash || '#booking'}`);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { installPaymentBridge(); showPaymentResult(); });
} else {
  installPaymentBridge();
  showPaymentResult();
}
