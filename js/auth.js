// js/auth.js
// auth helpers (module) — now import firebase functions from local firebase-config.js
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged
} from './firebase-config.js';

export async function signUp(email, password) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    return userCred;
  } catch (err) {
    // rethrow with clearer message if needed
    throw err;
  }
}

export async function signIn(email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return userCred;
  } catch (err) {
    throw err;
  }
}

export async function signOut() {
  return fbSignOut(auth);
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}
