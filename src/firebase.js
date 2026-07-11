// Import yang dibutuhin
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Kunci Firebase kamu
const firebaseConfig = {
  apiKey: "AIzaSyAjDgzPe8tUNfYEZDsEIrrZlfc8hu9QlXI",
  authDomain: "quanta---ssi.firebaseapp.com",
  projectId: "quanta---ssi",
  storageBucket: "quanta---ssi.firebasestorage.app",
  messagingSenderId: "153029053903",
  appId: "1:153029053903:web:86cb0636f901fa6394d6ba"
};

// Nyalain Firebase
const app = initializeApp(firebaseConfig);

// Biar bisa dipake di App.jsx
export const auth = getAuth(app);
export const db = getFirestore(app);