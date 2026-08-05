// Firebase web config and initialization (modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLCBMLEYNe72hBxIH2B1Jqk-Tn7p5-Bng",
  authDomain: "label-daze.firebaseapp.com",
  projectId: "label-daze",
  storageBucket: "label-daze.firebasestorage.app",
  messagingSenderId: "237868144289",
  appId: "1:237868144289:web:100cd4479c433c09c202e0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
