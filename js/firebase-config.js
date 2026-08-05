// Firebase web config and initialization (modular SDK)
// Consolidated firebase-auth imports and re-exports to avoid multiple remote module fetches
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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

// Export auth, db, and the auth helper functions so other local modules import from this file only.
// This keeps the module graph simpler and improves compatibility with mobile Safari.
export {
  app,
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged
};
