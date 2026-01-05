// =========================
// Safe Helper
// =========================
const $ = (id) => document.getElementById(id);

// =========================
// URL Params
// =========================
const urlParams = new URLSearchParams(window.location.search);
const showAdmin = urlParams.get('admin') === 'true';

document.addEventListener('DOMContentLoaded', () => {

  // =========================
  // Admin Page Handling
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
  const sections = document.querySelectorAll('.section');
  if (sections.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add('fade-in'));
    }, { threshold: 0.15 });

    sections.forEach(s => io.observe(s));
  }

  // =========================
  // Portfolio Filters
  // =========================
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.project-card').forEach(card => {
        card.style.display =
          filter === 'all' || card.dataset.category === filter ? '' : 'none';
      });
    });
  });

  // =========================
  // Modal
  // =========================
  const modal = $('modal');
  const modalClose = modal?.querySelector('.modal-close');

  function closeModal() {
    modal?.classList.remove('active');
  }

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => e.target === modal && closeModal());

  document.querySelectorAll('.view-more-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.project-card');
      if (!card || !modal) return;
      $('modal-title').textContent = card.querySelector('h3')?.innerText || '';
      $('modal-description').textContent = card.querySelector('p')?.innerText || '';
      modal.classList.add('active');
    });
  });

  // =========================
  // Contact Form (Local Only)
  // =========================
  const form = $('contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      alert('✔️ تم استلام الرسالة (وضع العرض فقط)');
      form.reset();
    });
  }

  // =========================
  // Assistant (Safe)
  // =========================
  const assistantToggle = $('assistant-toggle');
  const assistant = $('assistant');
  const assistantClose = $('assistant-close');

  function openAssistant() {
    assistant?.setAttribute('aria-hidden', 'false');
    assistantToggle && (assistantToggle.style.display = 'none');
  }

  function closeAssistant() {
    assistant?.setAttribute('aria-hidden', 'true');
    assistantToggle && (assistantToggle.style.display = '');
  }

  assistantToggle?.addEventListener('click', openAssistant);
  assistantClose?.addEventListener('click', closeAssistant);

});

// =========================
// Admin Login (Optional)
// =========================
const ADMIN_PASSWORD = 'admin123';

window.addEventListener('load', () => {
  if ($('loginContainer')) {
    localStorage.getItem('adminLoggedIn')
      ? $('dashboardContainer')?.classList.add('show')
      : $('loginContainer')?.classList.add('show');
  }
});
