import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { supabase } from './lib/supabase';
import './styles.css';

const money = (value) => `${new Intl.NumberFormat('fa-IR').format(Number(value || 0))} ریال`;
const dateTime = (value) => value ? new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

function AdminCashPayments() {
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true); setError(''); setMessage('');
    try {
      const { data: auth } = await supabase.auth.getSession();
      setSession(auth.session);
      if (!auth.session) throw new Error('برای ورود به پنل مدیریت ابتدا وارد حساب ادمین شوید.');
      const { data, error: queryError } = await supabase.from('payments').select('id,appointment_id,amount,currency,status,gateway,reference_number,paid_at,created_at,appointments!inner(id,status,gross_amount,client_id,slot_id,psychologist_id,appointment_slots:slot_id(starts_at,ends_at,duration_minutes),profiles:client_id(first_name,last_name,display_name),psychologists:psychologist_id(professional_title))').eq('gateway','cash').order('created_at',{ascending:false}).limit(100);
      if (queryError) throw queryError;
      setRows(data || []);
    } catch (err) { setError(err?.message || 'دریافت درخواست‌های نقدی انجام نشد.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const confirm = async (appointmentId) => {
    setBusyId(appointmentId); setError(''); setMessage('');
    try {
      const { error: rpcError } = await supabase.rpc('confirm_cash_payment', { p_appointment_id: appointmentId });
      if (rpcError) throw rpcError;
      setMessage('دریافت وجه تأیید شد و نوبت قطعی شد.');
      await load();
    } catch (err) { setError(err?.message || 'تأیید پرداخت نقدی انجام نشد.'); }
    finally { setBusyId(null); }
  };

  if (!session && !loading) return <main className="request-section"><div className="container"><div className="success-box"><ShieldCheck size={42}/><h1>پنل مدیریت</h1><p>این بخش فقط برای حساب‌های دارای نقش ADMIN قابل استفاده است.</p><a className="primary-button" href="/">بازگشت به سایت</a></div></div></main>;
  const pending = rows.filter((row) => row.status === 'PENDING' && ['PENDING_PAYMENT','HELD'].includes(row.appointments?.status));
  return <main className="request-section admin-page"><div className="container"><div className="section-heading"><span className="eyebrow">مدیریت</span><h1>درخواست‌های پرداخت نقدی</h1><p>فقط درخواست‌های نقدی قابل مشاهده است. تأیید نهایی از طریق تابع امن سمت سرور انجام می‌شود.</p></div>{message && <div className="success-box"><CheckCircle2 size={24}/><p>{message}</p></div>}{error && <div className="auth-error"><AlertCircle size={18}/> {error}</div>}<div className="account-toolbar"><strong>{pending.length} درخواست در انتظار تأیید</strong><button className="secondary-button" onClick={load} disabled={loading}><RefreshCw size={17}/> به‌روزرسانی</button></div>{loading ? <div className="success-box"><LoaderCircle className="spin" size={30}/><p>در حال دریافت درخواست‌ها...</p></div> : pending.length === 0 ? <div className="account-empty"><CheckCircle2 size={36}/><h2>درخواست نقدی در انتظار تأیید نیست</h2><p>پس از ثبت پرداخت نقدی توسط کاربر، درخواست اینجا نمایش داده می‌شود.</p></div> : <div className="account-list">{pending.map((row) => { const appointment=row.appointments; const client=appointment?.profiles; const psychologist=appointment?.psychologists; const slot=appointment?.appointment_slots; const clientName=client?.display_name || [client?.first_name,client?.last_name].filter(Boolean).join(' ') || 'کاربر'; return <article className="account-card" key={row.id}><div className="account-card-head"><div><span className="eyebrow">پرداخت نقدی</span><h2>{clientName}</h2></div><span className="status-badge status-pending">در انتظار تأیید</span></div><div className="account-details"><div><span>زمان</span><strong>{dateTime(slot?.starts_at)}</strong></div><div><span>مشاور</span><strong>{psychologist?.professional_title || 'روانشناس'}</strong></div><div><span>مبلغ</span><strong>{money(row.amount || appointment?.gross_amount)}</strong></div><div><span>ثبت درخواست</span><strong>{dateTime(row.created_at)}</strong></div></div><div className="account-id"><span>شناسه نوبت</span><code dir="ltr">{row.appointment_id}</code></div><button className="primary-button" onClick={() => confirm(row.appointment_id)} disabled={busyId === row.appointment_id}>{busyId === row.appointment_id ? <><LoaderCircle className="spin" size={18}/> در حال تأیید...</> : <><CheckCircle2 size={18}/> تأیید دریافت وجه</>}</button></article>; })}</div>}</div></main>;
}

createRoot(document.getElementById('root')).render(<AdminCashPayments />);
