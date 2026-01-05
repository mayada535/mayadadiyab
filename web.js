/* =======================
   Firebase Setup
======================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "PUT_YOUR_API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const messagesRef = collection(db, "messages");
const ordersRef = collection(db, "orders");

/* =======================
   Contact Form
======================= */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = contactForm.name.value;
    const email = contactForm.email.value;
    const message = contactForm.message.value;

    try {
      await addDoc(messagesRef, {
        name,
        email,
        message,
        createdAt: serverTimestamp()
      });

      alert("✅ Message sent successfully");
      contactForm.reset();
    } catch (err) {
      alert("❌ Error sending message");
    }
  });
}

/* =======================
   AI Assistant Logic
======================= */
const messagesUI = document.getElementById("assistant-messages");
let order = {};

function pushMessage(text, from = "bot") {
  const li = document.createElement("li");
  li.textContent = text;
  li.className = from;
  messagesUI.appendChild(li);
}

async function sendOrder() {
  try {
    await addDoc(ordersRef, {
      ...order,
      createdAt: serverTimestamp()
    });

    pushMessage("✅ Order sent successfully");
    order = {};
  } catch {
    pushMessage("❌ Failed to send order");
  }
}

/* =======================
   Admin Panel
======================= */
async
