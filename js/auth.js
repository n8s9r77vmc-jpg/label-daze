// auth helpers (module)
import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

export async function signUp(email, password){
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signIn(email, password){
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(){
  return fbSignOut(auth);
}

export function onAuthChange(cb){
  return onAuthStateChanged(auth, cb);
}
