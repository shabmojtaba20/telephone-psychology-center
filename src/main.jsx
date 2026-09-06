import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HeartHandshake, Phone, ShieldCheck, Clock3, UserRound, ArrowLeft, Menu, X } from 'lucide-react';
import './styles.css';

const services = [
  { icon: HeartHandshake, title: 'مشاوره فردی', text: 'گفت‌وگویی امن و محرمانه برای شناخت بهتر مسائل و پیدا کردن راهکارهای عملی.' },
  { icon: UserRound, title: 'مشاوره خانواده', text: 'کمک تخصصی برای بهبود ارتباط، مدیریت تعارض و تصمیم‌گیری آگاهانه در خانواده.' },
  { icon: ShieldCheck, title: 'حریم خصوصی', text: 'اطلاعات شما با رویکردی محرمانه و با حداقل داده موردنیاز مدیریت خواهد شد.' },
  { icon: Clock3, title: 'دسترسی آسان', text: 'درخواست مشاوره تلفنی را ساده و سریع ثبت کنید و مسیر دریافت خدمت را پیگیری کنید.' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const startRequest = () => {
    setNotice('فرم ثبت درخواست در مرحله بعد به سامانه مشاوره متصل می‌شود.');
    document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container nav">
          <a className="brand" href="#top" aria-label="مرکز مشاوره تلفنی روان">
            <span className="brand-mark"><HeartHandshake size={24} /></span>
            <span>مرکز مشاوره تلفنی روان</span>
          </a>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="منو">
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
            <a href="#services" onClick={() => setMenuOpen(false)}>خدمات</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>نحوه دریافت مشاوره</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>درباره مرکز</a>
            <button className="nav-cta" onClick={startRequest}>درخواست مشاوره</button>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">همراه شما برای حال بهتر</span>
              <h1>مشاوره روانشناختی،<br /><strong>ساده، امن و در دسترس</strong></h1>
              <p>در مرکز مشاوره تلفنی روان، مسیر دریافت حمایت تخصصی را کوتاه‌تر کرده‌ایم تا بتوانید با آرامش، درخواست مشاوره خود را ثبت و پیگیری کنید.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={startRequest}>شروع درخواست مشاوره <ArrowLeft size={19} /></button>
                <a className="phone-link" href="tel:+980000000000"><Phone size={19} /> تماس تلفنی</a>
              </div>
              <div className="trust-row">
                <span><ShieldCheck size={18} /> محرمانه</span>
                <span><Clock3 size={18} /> دسترسی آسان</span>
                <span><HeartHandshake size={18} /> رویکرد انسانی</span>
              </div>
            </div>
            <div className="hero-card" aria-label="کارت معرفی خدمات">
              <div className="orb orb-one" />
              <div className="orb orb-two" />
              <div className="card-icon"><Phone size={30} /></div>
              <span className="card-label">درخواست مشاوره</span>
              <h2>یک قدم برای حال بهتر</h2>
              <p>درخواست خود را ثبت کنید؛ جزئیات اتصال به سامانه در مرحله بعد تکمیل می‌شود.</p>
              <button className="card-button" onClick={startRequest}>ثبت درخواست <ArrowLeft size={18} /></button>
            </div>
          </div>
        </section>

        <section id="services" className="section">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">خدمات مرکز</span>
              <h2>پشتیبانی متناسب با نیاز شما</h2>
              <p>ساختار Frontend به‌گونه‌ای طراحی شده که در ادامه بدون تغییر در Backend موجود، به سرویس‌های واقعی متصل شود.</p>
            </div>
            <div className="service-grid">
              {services.map(({ icon: Icon, title, text }) => (
                <article className="service-card" key={title}>
                  <div className="service-icon"><Icon size={22} /></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="process-section">
          <div className="container process-grid">
            <div>
              <span className="eyebrow">مسیر دریافت خدمت</span>
              <h2>سه مرحله ساده تا شروع مشاوره</h2>
            </div>
            <div className="steps">
              <div className="step"><b>۱</b><div><h3>ثبت درخواست</h3><p>اطلاعات ضروری درخواست را در فرم وارد کنید.</p></div></div>
              <div className="step"><b>۲</b><div><h3>بررسی و هماهنگی</h3><p>درخواست شما در سامانه بررسی و برای ادامه مسیر آماده می‌شود.</p></div></div>
              <div className="step"><b>۳</b><div><h3>دریافت مشاوره</h3><p>پس از هماهنگی، مشاوره تلفنی طبق فرآیند مرکز انجام می‌شود.</p></div></div>
            </div>
          </div>
        </section>

        <section id="request" className="request-section">
          <div className="container request-box">
            <div>
              <span className="eyebrow">شروع کنید</span>
              <h2>آماده‌اید درخواست مشاوره را ثبت کنید؟</h2>
              <p>این بخش نقطه اتصال Frontend به Backend موجود خواهد بود.</p>
            </div>
            <button className="primary-button" onClick={() => setNotice('فرم ثبت درخواست در مرحله اتصال به Backend فعال خواهد شد.')}>ادامه ثبت درخواست <ArrowLeft size={19} /></button>
          </div>
          {notice && <div className="container notice" role="status">{notice}</div>}
        </section>
      </main>

      <footer id="about" className="footer">
        <div className="container footer-inner">
          <div><strong>مرکز مشاوره تلفنی روان</strong><p>نسخه اولیه رابط کاربری — Backend بدون تغییر باقی می‌ماند.</p></div>
          <span>© ۲۰۲۶</span>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
