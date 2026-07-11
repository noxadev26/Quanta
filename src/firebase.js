import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjDgzPe8tUNfYEZDsEIrrZlfc8hu9QlXI",
  authDomain: "quanta---ssi.firebaseapp.com",
  projectId: "quanta---ssi",
  storageBucket: "quanta---ssi.firebasestorage.app",
  messagingSenderId: "153029053903",
  appId: "1:153029053903:web:86cb0636f901fa6394d6ba"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);