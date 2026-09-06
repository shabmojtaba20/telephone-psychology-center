import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HeartHandshake, Phone, ShieldCheck, Clock3, UserRound, ArrowLeft, Menu, X, CalendarDays, CheckCircle2, LoaderCircle, AlertCircle, LogIn, LogOut, Mail } from 'lucide-react';
import { fetchApprovedPsychologists, fetchSpecialties, getCurrentSession, sendLoginLink, signOutUser, subscribeToAuth } from './lib/supabase';
import './styles.css';

const fallbackServices = [
  { icon: HeartHandshake, title: 'مشاوره فردی', text: 'گفت‌وگویی امن و محرمانه برای شناخت بهتر مسائل و پیدا کردن راهکارهای عملی.' },
  { icon: UserRound, title: 'مشاوره خانواده', text: 'کمک تخصصی برای بهبود ارتباط، مدیریت تعارض و تصمیم‌گیری آگاهانه در خانواده.' },
  { icon: ShieldCheck, title: 'حریم خصوصی', text: 'اطلاعات شما با رویکردی محرمانه و با حداقل داده موردنیاز مدیریت خواهد شد.' },
  { icon: Clock3, title: 'دسترسی آسان', text: 'درخواست مشاوره تلفنی را ساده و سریع ثبت کنید و مسیر دریافت خدمت را پیگیری کنید.' },
];

function AuthPanel({ session, onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('یک ایمیل معتبر وارد کنید.');
      return;
    }
    setSending(true);
    try {
      await sendLoginLink(email.trim());
      setMessage('لینک ورود به ایمیل شما ارسال شد. صندوق ورودی و پوشه Spam را بررسی کنید.');
    } catch (err) {
      setError(err?.message || 'ارسال لینک ورود انجام نشد.');
    } finally {
      setSending(false);
    }
  };

  if (session) {
    return <div className="auth-box logged-in"><div><span className="eyebrow">حساب کاربری</span><h3>وارد شده‌اید</h3><p>{session.user?.email}</p></div><button className="secondary-button" onClick={async () => { await signOutUser(); onAuthenticated(null); }}><LogOut size={18} /> خروج</button></div>;
  }

  return <form className="auth-box" onSubmit={submit} noValidate>
    <div className="form-heading"><div className="form-icon"><LogIn size={22} /></div><div><h3>ورود برای ثبت نوبت</h3><p>برای رزرو واقعی نوبت، ابتدا با ایمیل خود وارد حساب کاربری شوید.</p></div></div>
    <div className="auth-row"><label className="auth-email"><Mail size={18} /><input dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" aria-label="ایمیل" /></label><button className="primary-button" type="submit" disabled={sending}>{sending ? <><LoaderCircle className="spin" size={18} /> در حال ارسال...</> : <>ارسال لینک ورود <ArrowLeft size={18} /></>}</button></div>
    {message && <p className="auth-message">{message}</p>}
    {error && <p className="auth-error"><AlertCircle size={17} /> {error}</p>}
  </form>;
}

function RequestForm({ consultationTypes, onSubmitted }) {
  const [form, setForm] = useState({ name: '', phone: '', type: consultationTypes[0] || 'مشاوره فردی', date: '', time: '', note: '' });
  const [errors, setErrors] = useState({});
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'نام و نام خانوادگی را وارد کنید.';
    if (!/^09\d{9}$/.test(form.phone.replace(/\s/g, ''))) nextErrors.phone = 'شماره موبایل معتبر وارد کنید.';
    if (!form.date) nextErrors.date = 'تاریخ موردنظر را انتخاب کنید.';
    if (!form.time) nextErrors.time = 'زمان موردنظر را انتخاب کنید.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmitted(form);
  };
  return <form className="request-form" onSubmit={submit} noValidate>
    <div className="form-heading"><div className="form-icon"><CalendarDays size={22} /></div><div><h3>ثبت درخواست مشاوره</h3><p>اطلاعات اولیه را وارد کنید. اطلاعات واقعی مشاوران و خدمات از سامانه دریافت می‌شود.</p></div></div>
    <div className="form-grid">
      <label>نام و نام خانوادگی<input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="مثلاً مجتبی شبیهی" />{errors.name && <small>{errors.name}</small>}</label>
      <label>شماره موبایل<input dir="ltr" inputMode="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="09123456789" />{errors.phone && <small>{errors.phone}</small>}</label>
      <label>نوع مشاوره<select value={form.type} onChange={(e) => update('type', e.target.value)}>{consultationTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>تاریخ پیشنهادی<input type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(e) => update('date', e.target.value)} />{errors.date && <small>{errors.date}</small>}</label>
      <label>زمان پیشنهادی<select value={form.time} onChange={(e) => update('time', e.target.value)}><option value="">انتخاب زمان</option><option>۹ تا ۱۰</option><option>۱۰ تا ۱۲</option><option>۱۲ تا ۱۴</option><option>۱۶ تا ۱۸</option><option>۱۸ تا ۲۰</option></select>{errors.time && <small>{errors.time}</small>}</label>
      <label className="full">توضیح کوتاه (اختیاری)<textarea rows="3" value={form.note} onChange={(e) => update('note', e.target.value)} placeholder="اگر توضیحی برای هماهنگی دارید، اینجا بنویسید." /></label>
    </div>
    <div className="form-footer"><span><ShieldCheck size={17} /> اطلاعات شما محرمانه مدیریت می‌شود.</span><button className="primary-button" type="submit">ادامه درخواست <ArrowLeft size={18} /></button></div>
  </form>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const startRequest = () => { setSubmitted(false); document.getElementById(session ? 'request' : 'auth')?.scrollIntoView({ behavior: 'smooth' }); };

  useEffect(() => {
    let active = true;
    getCurrentSession().then((currentSession) => active && setSession(currentSession)).catch(() => {}).finally(() => active && setAuthLoading(false));
    const { data } = subscribeToAuth((nextSession) => { if (active) { setSession(nextSession); setAuthLoading(false); } });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([fetchSpecialties(), fetchApprovedPsychologists()])
      .then(([specialtyData, psychologistData]) => {
        if (!active) return;
        setSpecialties(specialtyData);
        setPsychologists(psychologistData);
      })
      .catch(() => {
        if (active) setDataError('دریافت اطلاعات سامانه در حال حاضر ممکن نیست. فرم اولیه همچنان قابل مشاهده است.');
      })
      .finally(() => active && setDataLoading(false));
    return () => { active = false; };
  }, []);

  const consultationTypes = specialties.length ? specialties.map((item) => item.name) : ['مشاوره فردی', 'مشاوره خانواده', 'مشاوره نوجوان', 'مشاوره زوجین'];

  return <div className="app">
    <header className="header"><div className="container nav"><a className="brand" href="#top" aria-label="مرکز مشاوره تلفنی روان"><span className="brand-mark"><HeartHandshake size={24} /></span><span>مرکز مشاوره تلفنی روان</span></a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="منو">{menuOpen ? <X /> : <Menu />}</button><nav className={menuOpen ? 'nav-links open' : 'nav-links'}><a href="#services" onClick={() => setMenuOpen(false)}>خدمات</a><a href="#psychologists" onClick={() => setMenuOpen(false)}>مشاوران</a><a href="#how" onClick={() => setMenuOpen(false)}>نحوه دریافت مشاوره</a><a href="#auth" onClick={() => setMenuOpen(false)}>{session ? 'حساب من' : 'ورود'}</a><button className="nav-cta" onClick={startRequest}>درخواست مشاوره</button></nav></div></header>
    <main id="top">
      <section className="hero"><div className="container hero-grid"><div className="hero-copy"><span className="eyebrow">همراه شما برای حال بهتر</span><h1>مشاوره روانشناختی،<br /><strong>ساده، امن و در دسترس</strong></h1><p>در مرکز مشاوره تلفنی روان، مسیر دریافت حمایت تخصصی را کوتاه‌تر کرده‌ایم تا بتوانید با آرامش، درخواست مشاوره خود را ثبت و پیگیری کنید.</p><div className="hero-actions"><button className="primary-button" onClick={startRequest}>شروع درخواست مشاوره <ArrowLeft size={19} /></button><a className="phone-link" href="tel:+980000000000"><Phone size={19} /> تماس تلفنی</a></div><div className="trust-row"><span><ShieldCheck size={18} /> محرمانه</span><span><Clock3 size={18} /> دسترسی آسان</span><span><HeartHandshake size={18} /> رویکرد انسانی</span></div></div><div className="hero-card"><div className="orb orb-one" /><div className="orb orb-two" /><div className="card-icon"><Phone size={30} /></div><span className="card-label">درخواست مشاوره</span><h2>یک قدم برای حال بهتر</h2><p>درخواست خود را ثبت کنید و زمان مناسب مشاوره را انتخاب کنید.</p><button className="card-button" onClick={startRequest}>ثبت درخواست <ArrowLeft size={18} /></button></div></div></section>
      <section id="services" className="section"><div className="container"><div className="section-heading"><span className="eyebrow">خدمات مرکز</span><h2>پشتیبانی متناسب با نیاز شما</h2><p>اطلاعات عمومی رابط کاربری آماده است و داده‌های فعال سامانه نیز در حال اتصال هستند.</p></div><div className="service-grid">{fallbackServices.map(({ icon: Icon, title, text }) => <article className="service-card" key={title}><div className="service-icon"><Icon size={22} /></div><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <section id="psychologists" className="section"><div className="container"><div className="section-heading"><span className="eyebrow">مشاوران سامانه</span><h2>مشاوران تأییدشده</h2>{dataLoading ? <p><LoaderCircle className="spin" size={18} /> در حال دریافت اطلاعات...</p> : dataError ? <p><AlertCircle size={18} /> {dataError}</p> : psychologists.length ? <p>{psychologists.length} مشاور فعال در سامانه پیدا شد.</p> : <p>در حال حاضر مشاور تأییدشده‌ای در سامانه ثبت نشده است.</p>}</div>{psychologists.length > 0 && <div className="service-grid">{psychologists.map((person) => <article className="service-card" key={person.id}><div className="service-icon"><UserRound size={22} /></div><h3>{person.professional_title || 'روانشناس'}</h3><p>{person.bio || 'اطلاعات معرفی این مشاور هنوز تکمیل نشده است.'}</p>{person.years_experience != null && <small>{person.years_experience} سال سابقه</small>}</article>)}</div>}</div></section>
      <section id="how" className="process-section"><div className="container process-grid"><div><span className="eyebrow">مسیر دریافت خدمت</span><h2>سه مرحله ساده تا شروع مشاوره</h2></div><div className="steps"><div className="step"><b>۱</b><div><h3>ورود به حساب</h3><p>با ایمیل خود وارد شوید تا نوبت به حساب کاربری شما متصل شود.</p></div></div><div className="step"><b>۲</b><div><h3>انتخاب مشاور و زمان</h3><p>زمان‌های واقعی سامانه در مرحله بعد از احراز هویت نمایش داده می‌شوند.</p></div></div><div className="step"><b>۳</b><div><h3>دریافت مشاوره</h3><p>پس از تأیید و پرداخت، مشاوره تلفنی انجام می‌شود.</p></div></div></div></div></section>
      <section id="auth" className="request-section"><div className="container">{authLoading ? <div className="success-box"><LoaderCircle className="spin" size={34} /><p>در حال بررسی وضعیت ورود...</p></div> : <AuthPanel session={session} onAuthenticated={setSession} />}</div></section>
      <section id="request" className="request-section"><div className="container">{!session ? <div className="success-box"><LogIn size={40} /><h2>ابتدا وارد حساب شوید</h2><p>برای ثبت نوبت واقعی، ابتدا ورود به حساب کاربری لازم است.</p><button className="primary-button" onClick={() => document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })}>ورود به حساب <ArrowLeft size={18} /></button></div> : submitted ? <div className="success-box"><CheckCircle2 size={42} /><h2>اطلاعات اولیه ثبت شد</h2><p>احراز هویت شما انجام شده است. در قدم بعد، زمان‌های واقعی نوبت را از سامانه نمایش می‌دهیم.</p><button className="primary-button" onClick={() => setSubmitted(false)}>ثبت درخواست جدید</button></div> : <RequestForm consultationTypes={consultationTypes} onSubmitted={() => setSubmitted(true)} />}</div></section>
    </main>
    <footer id="about" className="footer"><div className="container footer-inner"><div><strong>مرکز مشاوره تلفنی روان</strong><p>Frontend متصل به داده‌های عمومی Supabase — Backend دست‌نخورده باقی مانده است.</p></div><span>© ۲۰۲۶</span></div></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
