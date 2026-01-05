// =========================
// Helpers
// =========================
const $ = (id) => document.getElementById(id);
const getStore = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// =========================
// Contact Form (Save Locally)
// =========================
document.addEventListener('DOMContentLoaded', () => {
  const form = $('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = {
        id: Date.now(),
        name: $('name').value,
        email: $('email').value,
        message: $('message').value,
        timestamp: new Date().toISOString()
      };
      const msgs = getStore('messages');
      msgs.push(msg);
      setStore('messages', msgs);
      alert('✔️ تم إرسال الرسالة');
      form.reset();
    });
  }
});

// =========================
// AI Assistant (Local Orders)
// =========================
const order = {};
function saveOrder() {
  const orders = getStore('orders');
  order.id = Date.now();
  order.submittedAt = new Date().toISOString();
  orders.push(order);
  setStore('orders', orders);
  alert('✔️ تم إرسال الطلب');
}

// =========================
// Admin Dashboard
// =========================
function loadAllData() {
  displayMessages(getStore('messages'));
  displayOrders(getStore('orders'));
}

function displayMessages(messages) {
  const list = $('messagesList');
  $('msg-count').textContent = `(${messages.length})`;
  list.innerHTML = messages.length
    ? messages.map(m => `
      <div class="message-card">
        <h3>${m.name}<span>${new Date(m.timestamp).toLocaleString()}</span></h3>
        <p>${m.email}</p>
        <p>${m.message}</p>
        <button onclick="deleteMessage(${m.id})">🗑️</button>
      </div>`).join('')
    : '<p>لا توجد رسائل</p>';
}

function displayOrders(orders) {
  const list = $('ordersList');
  $('order-count').textContent = `(${orders.length})`;
  list.innerHTML = orders.length
    ? orders.map(o => `
      <div class="message-card">
        <h3>${o.type}</h3>
        <p>Pages: ${o.pages}</p>
        <p>Features: ${o.features}</p>
        <p>Design: ${o.design}</p>
        <p>Budget: ${o.budget}</p>
        <p>Deadline: ${o.deadline}</p>
        <p>Contact: ${o.contact}</p>
        <button onclick="deleteOrder(${o.id})">🗑️</button>
      </div>`).join('')
    : '<p>لا توجد طلبات</p>';
}

function deleteMessage(id) {
  setStore('messages', getStore('messages').filter(m => m.id !== id));
  loadAllData();
}

function deleteOrder(id) {
  setStore('orders', getStore('orders').filter(o => o.id !== id));
  loadAllData();
}

// =========================
// Admin Login
// =========================
const ADMIN_PASSWORD = 'admin123';

document.addEventListener('DOMContentLoaded', () => {
  if ($('loginForm')) {
    $('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if ($('password').value === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        $('loginContainer').style.display = 'none';
        $('dashboardContainer').style.display = 'block';
        loadAllData();
      } else alert('❌ كلمة المرور خاطئة');
    });
  }
});

