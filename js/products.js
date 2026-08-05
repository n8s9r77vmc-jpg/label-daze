// products CRUD using Firestore (module)
import { db } from './firebase-config.js';
import { collection, addDoc, doc, setDoc, deleteDoc, onSnapshot, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const PRODUCTS_COLLECTION = 'products';

export async function addProductForUser(uid, data){
  const colRef = collection(db, PRODUCTS_COLLECTION);
  const payload = Object.assign({}, data, { owner: uid, createdAt: new Date() });
  const ref = await addDoc(colRef, payload);
  return ref.id;
}

export async function updateProduct(id, data){
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  await setDoc(ref, Object.assign({}, data), { merge: true });
}

export async function deleteProduct(id){
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(ref);
}

export function subscribeToUserProducts(uid, onUpdate){
  const colRef = collection(db, PRODUCTS_COLLECTION);
  const q = query(colRef, where('owner','==',uid), orderBy('createdAt','desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(items);
  });
}
