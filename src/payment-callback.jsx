import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertCircle, CheckCircle2, LoaderCircle, ArrowLeft } from 'lucide-react';
import { supabase } from './lib/supabase';

const faTime = (value) => value ? new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '';
const faDate = (value) => value ? new Intl.DateTimeFormat('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value)) : '';

function PaymentCallback() {
  const [state, setState] = useState({ loading: true, appointment: null, payment: null, error: '' });
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const appointmentId = params.get('appointment_id');
  const gateway = window.location.pathname.split('/').filter(Boolean).pop() || '';
  const cancelledByGateway = ['cancel', 'cancelled', 'failed', 'failure'].includes((params.get('status') || params.get('Status') || '').toLowerCase());

  useEffect(() => {
    let active = true;
    let timer;
    let attempts = 0;
    const load = async () => {
      if (!appointmentId) {
        if (active) setState({ loading: false, appointment: null, payment: null, error: 'شناسه نوبت در نتیجه پرداخت وجود ندارد.' });
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('برای مشاهده نتیجه پرداخت باید وارد حساب کاربری باشید.');
        const [{ data: appointment, error: appointmentError }, { data: payment, error: paymentError }] = await Promise.all([
          supabase.from('appointments').select('id,status,slot_id,gross_amount,currency,confirmed_at,created_at').eq('id', appointmentId).eq('client_id', session.user.id).maybeSingle(),
          supabase.from('payments').select('id,status,gateway,reference_number,paid_at,amount,currency').eq('appointment_id', appointmentId).eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        ]);
        if (appointmentError) throw appointmentError;
        if (paymentError) throw paymentError;
        if (!appointment) throw new Error('نوبت موردنظر پیدا نشد یا به حساب شما تعلق ندارد.');
        if (!active) return;
        setState({ loading: false, appointment, payment, error: '' });
        const confirmed = appointment.status === 'CONFIRMED' && ['VERIFIED', 'PAID'].includes(payment?.status);
        const terminalFailure = cancelledByGateway || ['FAILED', 'CANCELLED', 'EXPIRED'].includes(appointment.status) || ['FAILED', 'CANCELLED', 'EXPIRED'].includes(payment?.status);
        if (!confirmed && !terminalFailure && attempts < 15) {
          attempts += 1;
          timer = window.setTimeout(load, 2000);
        }
      } catch (err) {
        if (!active) return;
        setState((current) => ({ ...current, loading: false, error: err?.message || 'بررسی نتیجه پرداخت انجام نشد.' }));
      }
    };
    load();
    return () => { active = false; if (timer) window.clearTimeout(timer); };
  }, [appointmentId, cancelledByGateway]);

  const confirmed = state.appointment?.status === 'CONFIRMED' && ['VERIFIED', 'PAID'].includes(state.payment?.status);
  const failed = cancelledByGateway || ['FAILED', 'CANCELLED', 'EXPIRED'].includes(state.appointment?.status) || ['FAILED', 'CANCELLED', 'EXPIRED'].includes(state.payment?.status);

  return <div dir="rtl" style={{ minHeight: '100vh', background: '#f6f8fb', padding: '32px 16px', fontFamily: 'inherit' }}>
    <style>{`body{margin:0} .callback-card{max-width:680px;margin:8vh auto 0;background:#fff;border:1px solid #e5e7eb;border-radius:24px;padding:32px;box-shadow:0 16px 45px rgba(15,23,42,.08);text-align:center}.callback-icon{margin:0 auto 18px;display:grid;place-items:center;width:72px;height:72px;border-radius:50%;background:#f1f5f9}.callback-card h1{margin:8px 0 12px;font-size:28px}.callback-card p{color:#64748b;line-height:1.9}.callback-details{margin:24px 0;text-align:right;border-top:1px solid #eef2f7}.callback-row{display:flex;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid #eef2f7}.callback-row span{color:#64748b}.callback-row strong{word-break:break-word}.callback-button{border:0;border-radius:12px;padding:13px 20px;background:#0f766e;color:#fff;font:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:8px}.callback-error{color:#b91c1c!important}`}</style>
    <div className="callback-card">
      <div className="callback-icon">{state.loading ? <LoaderCircle className="spin" size={34} /> : confirmed ? <CheckCircle2 size={42} /> : <AlertCircle size={42} />}</div>
      {state.loading ? <><h1>در حال بررسی پرداخت...</h1><p>نتیجه پرداخت و وضعیت نهایی نوبت در حال بررسی است.</p></> : state.error ? <><h1>نتیجه پرداخت</h1><p className="callback-error">{state.error}</p></> : confirmed ? <><h1>پرداخت موفق و نوبت قطعی شد</h1><p>پرداخت با موفقیت تأیید شده و نوبت شما در سامانه قطعی است.</p></> : failed ? <><h1>پرداخت ناموفق یا لغو شد</h1><p>پرداخت تأیید نشد و نوبت قطعی نشده است.</p></> : <><h1>در انتظار تأیید پرداخت</h1><p>پرداخت هنوز از سمت درگاه نهایی نشده است. لطفاً چند لحظه دیگر وضعیت را بررسی کنید.</p></>}
      {state.appointment && <div className="callback-details"><div className="callback-row"><span>شماره نوبت</span><strong>{state.appointment.id}</strong></div><div className="callback-row"><span>وضعیت نوبت</span><strong>{state.appointment.status}</strong></div>{state.payment?.reference_number && <div className="callback-row"><span>شماره پیگیری پرداخت</span><strong>{state.payment.reference_number}</strong></div>}{gateway && <div className="callback-row"><span>درگاه</span><strong>{gateway}</strong></div>} {state.appointment.created_at && <div className="callback-row"><span>تاریخ ثبت</span><strong>{faDate(state.appointment.created_at)} — {faTime(state.appointment.created_at)}</strong></div>}</div>}
      <button className="callback-button" onClick={() => { window.location.href = window.location.origin; }}><ArrowLeft size={18} /> بازگشت به سایت</button>
    </div>
  </div>;
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<PaymentCallback />);
