// =========================
// Assistant Logic (REAL)
// =========================
const assistantForm = document.getElementById('assistant-form');
const assistantInput = document.getElementById('assistant-input');
const assistantMessages = document.getElementById('assistant-messages');

function loadStoredMessages() {
  const data = JSON.parse(localStorage.getItem('assistantMessages') || '[]');
  data.forEach(m => addMessage(m.text, m.type));
}

function saveMessage(text, type) {
  const data = JSON.parse(localStorage.getItem('assistantMessages') || '[]');
  data.push({
    text,
    type,
    time: new Date().toLocaleString()
  });
  localStorage.setItem('assistantMessages', JSON.stringify(data));
}

function addMessage(text, type = 'user') {
  const li = document.createElement('li');
  li.className = `msg ${type}`;
  li.textContent = text;
  assistantMessages.appendChild(li);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

assistantForm?.addEventListener('submit', e => {
  e.preventDefault();
  const msg = assistantInput.value.trim();
  if (!msg) return;

  addMessage(msg, 'user');
  saveMessage(msg, 'user');

  assistantInput.value = '';

  setTimeout(() => {
    const reply = '✅ تم استلام طلبك، سأتواصل معك قريبًا.';
    addMessage(reply, 'bot');
    saveMessage(reply, 'bot');
  }, 700);
});

loadStoredMessages();

