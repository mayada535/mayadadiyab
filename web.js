// =========================
// Helper
// =========================
const $ = id => document.getElementById(id);

// =========================
// URL Params
// =========================
const urlParams = new URLSearchParams(window.location.search);
const showAdmin = urlParams.get('admin') === 'true';

document.addEventListener('DOMContentLoaded', () => {

  // =========================
  // Admin Page
  // =========================
  if (showAdmin) {
    document.body.classList.add('admin-page');
    $('loginContainer') && ($('loginContainer').style.display = 'block');
    $('dashboardContainer') && ($('dashboardContainer').style.display = 'none');
    document.querySelector('main') && (document.querySelector('main').style.display = 'none');
    document.querySelector('nav') && (document.querySelector('nav').style.display = 'none');
  }

  // =========================
  // Language Switch
  // =========================
  const langBtn = $('lang-switch');

  function setLanguage(lang) {
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
      const text = lang === 'en' ? el.dataset.en : el.dataset.ar;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.innerHTML = text;
      }
    });

    document.documentElement.lang = lang;
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', lang === 'ar');

    if (langBtn) {
      langBtn.textContent = lang === 'ar' ? 'EN' : 'العربية';
      langBtn.dataset.lang = lang;
    }
  }

  if (langBtn) {
    setLanguage(langBtn.dataset.lang || 'en');
    langBtn.addEventListener('click', () => {
      setLanguage(langBtn.dataset.lang === 'en' ? 'ar' : 'en');
    });
  }

  // =========================
  // Fade In Sections
  // =========================
  document.querySelectorAll('.section').forEach(section => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add('fade-in'));
    }, { threshold: 0.15 });
    io.observe(section);
  });

  // =========================
  // Contact Form (Demo)
  // =========================
  const contactForm = $('contact-form');
  if (contactForm) {
    con
