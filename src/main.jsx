import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HeartHandshake, Phone, ShieldCheck, Clock3, UserRound, ArrowLeft, Menu, X, CalendarDays, CheckCircle2, LoaderCircle, AlertCircle } from 'lucide-react';
import { fetchApprovedPsychologists, fetchSpecialties } from './lib/supabase';
import './styles.css';

const fallbackServices = [
  { icon: HeartHandshake, title: 'مشاوره فردی', text: 'گفت‌وگویی امن و محرمانه برای شناخت بهتر مسائل و پیدا کردن راهکارهای عملی.' },
  { icon: UserRound, title: 'مشاوره خانواده', text: 'کمک تخصصی برای بهبود ارتباط، مدیریت تعارض و تصمیم‌گیری آگاهانه در خانواده.' },
  { icon: ShieldCheck, title: 'حریم خصوصی', text: 'اطلاعات شما با رویکردی محرمانه و با حداقل داده موردنیاز مدیریت خواهد شد.' },
  { icon: Clock3, title: 'دسترسی آسان', text: 'درخواست مشاوره تلفنی را ساده و سریع ثبت کنید و مسیر دریافت خدمت را پیگیری کنید.' },
];

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
  const [specialties, setSpecialties] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const startRequest = () => { setSubmitted(false); document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' }); };

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
    <header className="header"><div className="container nav"><a className="brand" href="#top" aria-label="مرکز مشاوره تلفنی روان"><span className="brand-mark"><HeartHandshake size={24} /></span><span>مرکز مشاوره تلفنی روان</span></a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="منو">{menuOpen ? <X /> : <Menu />}</button><nav className={menuOpen ? 'nav-links open' : 'nav-links'}><a href="#services" onClick={() => setMenuOpen(false)}>خدمات</a><a href="#psychologists" onClick={() => setMenuOpen(false)}>مشاوران</a><a href="#how" onClick={() => setMenuOpen(false)}>نحوه دریافت مشاوره</a><a href="#about" onClick={() => setMenuOpen(false)}>درباره مرکز</a><button className="nav-cta" onClick={startRequest}>درخواست مشاوره</button></nav></div></header>
    <main id="top">
      <section className="hero"><div className="container hero-grid"><div className="hero-copy"><span className="eyebrow">همراه شما برای حال بهتر</span><h1>مشاوره روانشناختی،<br /><strong>ساده، امن و در دسترس</strong></h1><p>در مرکز مشاوره تلفنی روان، مسیر دریافت حمایت تخصصی را کوتاه‌تر کرده‌ایم تا بتوانید با آرامش، درخواست مشاوره خود را ثبت و پیگیری کنید.</p><div className="hero-actions"><button className="primary-button" onClick={startRequest}>شروع درخواست مشاوره <ArrowLeft size={19} /></button><a className="phone-link" href="tel:+980000000000"><Phone size={19} /> تماس تلفنی</a></div><div className="trust-row"><span><ShieldCheck size={18} /> محرمانه</span><span><Clock3 size={18} /> دسترسی آسان</span><span><HeartHandshake size={18} /> رویکرد انسانی</span></div></div><div className="hero-card"><div className="orb orb-one" /><div className="orb orb-two" /><div className="card-icon"><Phone size={30} /></div><span className="card-label">درخواست مشاوره</span><h2>یک قدم برای حال بهتر</h2><p>درخواست خود را ثبت کنید و زمان مناسب مشاوره را انتخاب کنید.</p><button className="card-button" onClick={startRequest}>ثبت درخواست <ArrowLeft size={18} /></button></div></div></section>
      <section id="services" className="section"><div className="container"><div className="section-heading"><span className="eyebrow">خدمات مرکز</span><h2>پشتیبانی متناسب با نیاز شما</h2><p>اطلاعات عمومی رابط کاربری آماده است و داده‌های فعال سامانه نیز در حال اتصال هستند.</p></div><div className="service-grid">{fallbackServices.map(({ icon: Icon, title, text }) => <article className="service-card" key={title}><div className="service-icon"><Icon size={22} /></div><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <section id="psychologists" className="section"><div className="container"><div className="section-heading"><span className="eyebrow">مشاوران سامانه</span><h2>مشاوران تأییدشده</h2>{dataLoading ? <p><LoaderCircle className="spin" size={18} /> در حال دریافت اطلاعات...</p> : dataError ? <p><AlertCircle size={18} /> {dataError}</p> : psychologists.length ? <p>{psychologists.length} مشاور فعال در سامانه پیدا شد.</p> : <p>در حال حاضر مشاور تأییدشده‌ای در سامانه ثبت نشده است.</p>}</div>{psychologists.length > 0 && <div className="service-grid">{psychologists.map((person) => <article className="service-card" key={person.id}><div className="service-icon"><UserRound size={22} /></div><h3>{person.professional_title || 'روانشناس'}</h3><p>{person.bio || 'اطلاعات معرفی این مشاور هنوز تکمیل نشده است.'}</p>{person.years_experience != null && <small>{person.years_experience} سال سابقه</small>}</article>)}</div>}</div></section>
      <section id="how" className="process-section"><div className="container process-grid"><div><span className="eyebrow">مسیر دریافت خدمت</span><h2>سه مرحله ساده تا شروع مشاوره</h2></div><div className="steps"><div className="step"><b>۱</b><div><h3>ثبت درخواست</h3><p>اطلاعات اولیه و زمان پیشنهادی خود را وارد کنید.</p></div></div><div className="step"><b>۲</b><div><h3>انتخاب مشاور و زمان</h3><p>زمان‌های واقعی سامانه پس از تکمیل اطلاعات نوبت نمایش داده می‌شوند.</p></div></div><div className="step"><b>۳</b><div><h3>دریافت مشاوره</h3><p>پس از تأیید و پرداخت، مشاوره تلفنی انجام می‌شود.</p></div></div></div></div></section>
      <section id="request" className="request-section"><div className="container">{submitted ? <div className="success-box"><CheckCircle2 size={42} /><h2>فرم با موفقیت بررسی شد</h2><p>اطلاعات واردشده معتبر است. ایجاد نوبت واقعی پس از تکمیل مرحله احراز هویت و اتصال امن به موتور رزرو انجام خواهد شد.</p><button className="primary-button" onClick={() => setSubmitted(false)}>ثبت درخواست جدید</button></div> : <RequestForm consultationTypes={consultationTypes} onSubmitted={() => setSubmitted(true)} />}</div></section>
    </main>
    <footer id="about" className="footer"><div className="container footer-inner"><div><strong>مرکز مشاوره تلفنی روان</strong><p>Frontend متصل به داده‌های عمومی Supabase — Backend دست‌نخورده باقی مانده است.</p></div><span>© ۲۰۲۶</span></div></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
