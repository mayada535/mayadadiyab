// web.js - restores interactive features: language switch, filters, modal, fade-ins, and form handling

// Check if accessing admin panel
const urlParams = new URLSearchParams(window.location.search);
const showAdmin = urlParams.get('admin') === 'true';

document.addEventListener('DOMContentLoaded', () => {
  const langBtn = document.getElementById('lang-switch');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalClose = modal.querySelector('.modal-close');
  
  // Show admin panel if ?admin=true
  if (showAdmin) {
    document.body.classList.add('admin-page');
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('dashboardContainer').style.display = 'none';
    // Hide main content
    document.querySelector('main').style.display = 'none';
    document.querySelector('nav').style.display = 'none';
  }

  // Utility: set language for all elements with data-en/data-ar
  function setLanguage(lang) {
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
      const en = el.getAttribute('data-en');
      const ar = el.getAttribute('data-ar');
      // choose between setting textContent or placeholder/title attributes
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = (lang === 'en') ? en : ar;
      } else if (el.hasAttribute('title')) {
        el.title = (lang === 'en') ? en : ar;
      } else {
        el.innerHTML = (lang === 'en') ? en : ar;
      }
    });

    // direction handling
    if (lang === 'ar') {
      document.documentElement.setAttribute('lang', 'ar');
      document.body.classList.add('rtl');
      document.body.setAttribute('dir', 'rtl');
      langBtn.textContent = 'EN';
      langBtn.setAttribute('data-lang', 'ar');
    } else {
      document.documentElement.setAttribute('lang', 'en');
      document.body.classList.remove('rtl');
      document.body.setAttribute('dir', 'ltr');
      langBtn.textContent = 'العربية';
      langBtn.setAttribute('data-lang', 'en');
    }
  }

  // Initialize language from button data attribute
  setLanguage(langBtn.getAttribute('data-lang') || 'en');

  langBtn.addEventListener('click', () => {
    const current = langBtn.getAttribute('data-lang') === 'ar' ? 'ar' : 'en';
    const next = current === 'en' ? 'ar' : 'en';
    setLanguage(next);
  });

  // Fade-in sections using IntersectionObserver
  const sections = document.querySelectorAll('.section');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, { threshold: 0.15 });
  sections.forEach(s => io.observe(s));

  // Portfolio filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    projectCards.forEach(card => {
      if (filter === 'all' || card.getAttribute('data-category') === filter) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }));

  // Modal: view more buttons
  document.querySelectorAll('.view-more-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      if (!card) return;
      const title = card.querySelector('h3')?.innerText || '';
      const desc = card.querySelector('p')?.innerText || '';
      modalTitle.textContent = title;
      modalDescription.textContent = desc;
      openModal();
    });
  });

  function openModal() {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    // trap focus simple: focus close button
    modalClose.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Nav link active state on click and highlight based on scroll
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.addEventListener('click', () => {
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  }));

  // Simple scroll spy to update nav active
  const sectionsMap = Array.from(document.querySelectorAll('main > section'));
  window.addEventListener('scroll', () => {
    const y = window.scrollY + window.innerHeight / 3;
    for (const s of sectionsMap) {
      if (s.offsetTop <= y && (s.offsetTop + s.offsetHeight) > y) {
        const id = s.getAttribute('id');
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === ('#' + id)));
      }
    }
  });

  // Contact form: basic validation + prevent default submission
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');
      const nameErr = document.getElementById('name-error');
      const emailErr = document.getElementById('email-error');
      const messageErr = document.getElementById('message-error');
      let valid = true;

      nameErr.textContent = '';
      emailErr.textContent = '';
      messageErr.textContent = '';

      if (!name.value.trim()) { nameErr.textContent = 'Please enter your name.'; valid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { emailErr.textContent = 'Please enter a valid email.'; valid = false; }
      if (!message.value.trim()) { messageErr.textContent = 'Please enter a message.'; valid = false; }

      if (!valid) return;

      // Send to backend
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/messages'
        : '/api/messages';
      
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.value,
          email: email.value,
          message: message.value
        })
      })
      .then(res => res.json())
      .then(data => {
        alert((document.documentElement.getAttribute('lang') === 'ar') ? 'تم الإرسال بنجاح! شكراً لك' : 'Message sent — thank you! You can view it in the admin dashboard.');
        form.reset();
      })
      .catch(e => {
        console.error('Error:', e);
        alert((document.documentElement.getAttribute('lang') === 'ar') ? 'حدث خطأ في الإرسال' : 'Error sending message');
      });
    });
  }

  // Close modal on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('active')) closeModal();
    }
  });

});

// ========== Admin Dashboard Functions ==========
const ADMIN_PASSWORD = 'admin123'; // Change this to a secure password!

function showLogin() {
  const loginContainer = document.getElementById('loginContainer');
  const dashboardContainer = document.getElementById('dashboardContainer');
  if (loginContainer) loginContainer.classList.add('show');
  if (dashboardContainer) dashboardContainer.classList.remove('show');
}

function showDashboard() {
  const loginContainer = document.getElementById('loginContainer');
  const dashboardContainer = document.getElementById('dashboardContainer');
  if (loginContainer) loginContainer.classList.remove('show');
  if (dashboardContainer) dashboardContainer.classList.add('show');
}

if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const pwd = document.getElementById('password').value;
    if (pwd === ADMIN_PASSWORD) {
      localStorage.setItem('adminLoggedIn', 'true');
      showDashboard();
      loadAllData();
    } else {
      alert('❌ Incorrect password!');
    }
  });
}

function logout() {
  localStorage.removeItem('adminLoggedIn');
  showLogin();
  const pwdInput = document.getElementById('password');
  if (pwdInput) pwdInput.value = '';
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('show'));
  if (event.target.closest('.tab-btn')) {
    event.target.closest('.tab-btn').classList.add('active');
  }
  const tabElem = document.getElementById(tab + 'Tab');
  if (tabElem) tabElem.classList.add('show');
}

async function loadAllData() {
  try {
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api/messages'
      : '/api/messages';
    
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    displayMessages(data.messages || []);
    displayOrders(data.orders || []);
  } catch (e) {
    console.error('Error loading data:', e);
    alert('Error loading messages. Make sure backend is running on http://localhost:5000');
  }
}

function displayMessages(messages) {
  const list = document.getElementById('messagesList');
  const msgCount = document.getElementById('msg-count');
  if (!list) return;
  
  if (msgCount) msgCount.textContent = `(${messages.length})`;
  
  if (!messages.length) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No messages yet</p></div>';
    return;
  }

  list.innerHTML = messages.map(msg => `
    <div class="message-card">
      <h3>
        ${msg.name}
        <span class="time">${new Date(msg.timestamp).toLocaleString()}</span>
      </h3>
      <p><strong>Email:</strong> ${msg.email}</p>
      <p><strong>Message:</strong> ${msg.message}</p>
      <button class="delete-btn" onclick="deleteMessage('${msg.id}')">🗑️ Delete</button>
    </div>
  `).join('');
}

function displayOrders(orders) {
  const list = document.getElementById('ordersList');
  const orderCount = document.getElementById('order-count');
  if (!list) return;
  
  if (orderCount) orderCount.textContent = `(${orders.length})`;
  
  if (!orders.length) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No orders yet</p></div>';
    return;
  }

  list.innerHTML = orders.map(order => `
    <div class="message-card">
      <h3>
        Order: ${order.type}
        <span class="time">${new Date(order.submittedAt).toLocaleString()}</span>
      </h3>
      <p><span class="label">Type</span> ${order.type}</p>
      <p><span class="label">Pages</span> ${order.pages}</p>
      <p><span class="label">Features</span> ${order.features}</p>
      <p><span class="label">Design</span> ${order.design}</p>
      <p><span class="label">Budget</span> $${order.budget}</p>
      <p><span class="label">Deadline</span> ${order.deadline}</p>
      <p><strong>Contact:</strong> ${order.contact}</p>
      ${order.images && order.images.length ? `<p><strong>Attachments:</strong> ${order.images.length} file(s)</p>` : ''}
      <button class="delete-btn" onclick="deleteOrder('${order.id}')">🗑️ Delete</button>
    </div>
  `).join('');
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  try {
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    loadAllData();
  } catch (e) {
    alert('Error deleting message');
  }
}

async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  try {
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    loadAllData();
  } catch (e) {
    alert('Error deleting order');
  }
}

// Check if logged in on admin page load
window.addEventListener('load', () => {
  if (document.getElementById('loginContainer')) {
    if (localStorage.getItem('adminLoggedIn')) {
      showDashboard();
      loadAllData();
    } else {
      showLogin();
    }
  }
});
