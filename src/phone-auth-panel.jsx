import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Clock3, LoaderCircle, LogIn, LogOut, Phone, RefreshCw } from 'lucide-react';
import { sendPhoneOtp, verifyPhoneOtp, signOutUser } from './lib/supabase';

const normalizeIranPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('0098')) return `+${digits.slice(2)}`;
  if (digits.startsWith('98')) return `+${digits}`;
  if (digits.startsWith('0')) return `+98${digits.slice(1)}`;
  return `+${digits}`;
};

export default function PhoneAuthPanel({ session, onAuthenticated }) {
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState('phone');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const sendCode = async (event) => {
    event?.preventDefault();
    setMessage('');
    setError('');
    const normalized = normalizeIranPhone(phone);
    if (!/^\+98\d{10}$/.test(normalized)) {
      setError('شماره موبایل ایران را به صورت 09123456789 وارد کنید.');
      return;
    }
    setSending(true);
    try {
      await sendPhoneOtp(normalized);
      setPhone(normalized);
      setToken('');
      setStep('otp');
      setSeconds(60);
      setMessage(`کد تأیید به ${normalized} ارسال شد.`);
    } catch (err) {
      setError(err?.message || 'ارسال کد تأیید انجام نشد.');
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!/^\d{6}$/.test(token)) {
      setError('کد تأیید باید دقیقاً ۶ رقم باشد.');
      return;
    }
    setVerifying(true);
    try {
      const nextSession = await verifyPhoneOtp(phone, token);
      if (!nextSession) throw new Error('ورود انجام نشد. لطفاً دوباره تلاش کنید.');
      onAuthenticated(nextSession);
      setMessage('شماره موبایل با موفقیت تأیید شد.');
    } catch (err) {
      setError(err?.message || 'کد تأیید صحیح نیست یا منقضی شده است.');
    } finally {
      setVerifying(false);
    }
  };

  const logout = async () => {
    await signOutUser();
    onAuthenticated(null);
    setStep('phone');
    setToken('');
    setMessage('');
    setError('');
  };

  if (session) {
    return <div className="auth-box logged-in"><div><span className="eyebrow">حساب کاربری</span><h3>وارد شده‌اید</h3><p dir="ltr">{session.user?.phone || 'شماره موبایل تأییدشده'}</p></div><button className="secondary-button" onClick={logout}><LogOut size={18} /> خروج</button></div>;
  }

  if (step === 'otp') {
    return <form className="auth-box" onSubmit={verifyCode} noValidate><div className="form-heading"><div className="form-icon"><LogIn size={22} /></div><div><h3>کد تأیید را وارد کنید</h3><p>کد ۶ رقمی ارسال‌شده به شماره شما را وارد کنید.</p></div></div><label className="auth-email"><Phone size={18} /><input dir="ltr" inputMode="numeric" autoComplete="one-time-code" maxLength="6" value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" aria-label="کد تأیید" /></label><div className="auth-row"><button className="primary-button" type="submit" disabled={verifying}>{verifying ? <><LoaderCircle className="spin" size={18} /> در حال بررسی...</> : <>تأیید و ورود <ArrowLeft size={18} /></>}</button><button className="secondary-button" type="button" onClick={() => { setStep('phone'); setError(''); setMessage(''); }}><RefreshCw size={17} /> تغییر شماره</button></div><div className="auth-row"><button className="secondary-button" type="button" disabled={sending || seconds > 0} onClick={sendCode}>{seconds > 0 ? <><Clock3 size={17} /> ارسال مجدد تا {seconds} ثانیه</> : sending ? <><LoaderCircle className="spin" size={17} /> در حال ارسال...</> : <>ارسال مجدد کد</>}</button></div>{message && <p className="auth-message">{message}</p>}{error && <p className="auth-error"><AlertCircle size={17} /> {error}</p>}</form>;
  }

  return <form className="auth-box" onSubmit={sendCode} noValidate><div className="form-heading"><div className="form-icon"><Phone size={22} /></div><div><h3>ورود با شماره موبایل</h3><p>شماره موبایل خود را وارد کنید تا کد ۶ رقمی تأیید برایتان پیامک شود.</p></div></div><label className="auth-email"><Phone size={18} /><input dir="ltr" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" aria-label="شماره موبایل" /></label><button className="primary-button" type="submit" disabled={sending}>{sending ? <><LoaderCircle className="spin" size={18} /> در حال ارسال...</> : <>دریافت کد تأیید <ArrowLeft size={18} /></>}</button>{message && <p className="auth-message">{message}</p>}{error && <p className="auth-error"><AlertCircle size={17} /> {error}</p>}</form>;
}
