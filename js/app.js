// js/app.js
// app wiring
import { signUp, signIn, signOut, onAuthChange } from './auth.js';
import { addProductForUser, updateProduct, deleteProduct, subscribeToUserProducts } from './products.js';
import { renderLabels } from './labels.js';
import { renderAllergens } from './allergens.js';
import { formatDateForDisplay, isoDateInputVal } from './dates.js';

let currentUser = null;
let unsubscribeProducts = null;
const selectedLabels = new Set();
const selectedAllergens = new Set();

// DOM refs
const authSection = document.getElementById('auth-section');
const productSection = document.getElementById('product-section');
const signUpForm = document.getElementById('sign-up-form');
const signInForm = document.getElementById('sign-in-form');
const signOutBtn = document.getElementById('sign-out');
const welcomeEl = document.getElementById('welcome');
const authMessage = document.getElementById('auth-message');

const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const productClear = document.getElementById('product-clear');

const labelsList = document.getElementById('labels-list');
const allergensList = document.getElementById('allergens-list');

renderLabels(labelsList, selectedLabels);
renderAllergens(allergensList, selectedAllergens);

function showAuthMessage(msg, err = false) {
  authMessage.textContent = msg || '';
  authMessage.style.color = err ? 'var(--danger)' : 'inherit';
  // ensure it's visible (if you have CSS that hides empty messages)
  if (msg) authMessage.classList.remove('hide'); else authMessage.classList.add('hide');
}

// Auth button references for loading UI
const signUpBtn = signUpForm.querySelector('button[type="submit"]');
const signInBtn = signInForm.querySelector('button[type="submit"]');

function setAuthLoading(loading, which) {
  // disable/enable all inputs and buttons in auth forms
  const elems = [...signUpForm.querySelectorAll('input, button'), ...signInForm.querySelectorAll('input, button')];
  elems.forEach(el => el.disabled = loading);
  if (!loading) {
    signUpBtn.textContent = 'Sign up';
    signInBtn.textContent = 'Sign in';
  } else {
    if (which === 'signup') {
      signUpBtn.textContent = 'Creating…';
    } else if (which === 'signin') {
      signInBtn.textContent = 'Signing in…';
    } else {
      signUpBtn.textContent = 'Please wait…';
      signInBtn.textContent = 'Please wait…';
    }
  }
}

signUpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const pw = document.getElementById('signup-password').value;
  setAuthLoading(true, 'signup');
  showAuthMessage('Creating account…');
  try {
    await signUp(email, pw);
    showAuthMessage('Account created — signed in.');
  } catch (err) {
    // show Firebase error message clearly
    showAuthMessage(err?.message || 'Failed to create account', true);
  } finally {
    setAuthLoading(false);
  }
});

signInForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const pw = document.getElementById('signin-password').value;
  setAuthLoading(true, 'signin');
  showAuthMessage('Signing in…');
  try {
    await signIn(email, pw);
    showAuthMessage('Signed in.');
  } catch (err) {
    showAuthMessage(err?.message || 'Failed to sign in', true);
  } finally {
    setAuthLoading(false);
  }
});

signOutBtn.addEventListener('click', async () => {
  await signOut();
});

function resetProductForm() {
  productForm.reset();
  document.getElementById('editing-id').value = '';
  selectedLabels.clear();
  selectedAllergens.clear();
  renderLabels(labelsList, selectedLabels);
  renderAllergens(allergensList, selectedAllergens);
}

productClear.addEventListener('click', () => resetProductForm());

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return showAuthMessage('Please sign in first', true);
  const name = document.getElementById('product-name').value.trim();
  const ingredients = document.getElementById('product-ingredients').value.split(',').map(s => s.trim()).filter(Boolean);
  const notes = document.getElementById('product-notes').value.trim();
  const bestBefore = document.getElementById('best-before').value || null;
  const payload = { name, ingredients, labels: Array.from(selectedLabels), allergens: Array.from(selectedAllergens), notes, bestBefore };
  const editingId = document.getElementById('editing-id').value;
  try {
    if (editingId) {
      await updateProduct(editingId, payload);
      showAuthMessage('Product updated');
    } else {
      await addProductForUser(currentUser.uid, payload);
      showAuthMessage('Product saved');
    }
    resetProductForm();
  } catch (err) {
    showAuthMessage(err?.message || 'Failed to save product', true);
  }
});

function renderProductList(items) {
  productList.innerHTML = '';
  if (items.length === 0) {
    productList.innerHTML = '<li class="muted">No products saved yet.</li>';
    return;
  }
  items.forEach(p => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.innerHTML = `<strong>${p.name}</strong><div class="product-meta">${p.ingredients ? p.ingredients.join(', ') : ''} ${p.bestBefore ? ' · Best before: ' + formatDateForDisplay(p.bestBefore) : ''}</div>`;
    const actions = document.createElement('div');
    actions.className = 'product-actions';
    const edit = document.createElement('button');
    edit.className = 'btn'; edit.textContent = 'Edit';
    edit.addEventListener('click', () => {
      document.getElementById('product-name').value = p.name || '';
      document.getElementById('product-ingredients').value = (p.ingredients || []).join(', ');
      document.getElementById('product-notes').value = p.notes || '';
      document.getElementById('best-before').value = p.bestBefore ? isoDateInputVal(p.bestBefore) : '';
      document.getElementById('editing-id').value = p.id;
      selectedLabels.clear(); (p.labels || []).forEach(l => selectedLabels.add(l));
      selectedAllergens.clear(); (p.allergens || []).forEach(a => selectedAllergens.add(a));
      renderLabels(labelsList, selectedLabels);
      renderAllergens(allergensList, selectedAllergens);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const del = document.createElement('button');
    del.className = 'btn'; del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      if (!confirm('Delete this product?')) return;
      await deleteProduct(p.id);
    });

    actions.appendChild(edit);
    actions.appendChild(del);
    li.appendChild(left);
    li.appendChild(actions);
    productList.appendChild(li);
  });
}

onAuthChange(user => {
  currentUser = user;
  if (user) {
    // show product section
    authSection.querySelectorAll('.auth-form').forEach(f => f.classList.add('hide'));
    document.getElementById('user-info').classList.remove('hide');
    productSection.classList.remove('hide');
    welcomeEl.textContent = `Signed in as ${user.email}`;
    showAuthMessage('');
    if (unsubscribeProducts) unsubscribeProducts();
    unsubscribeProducts = subscribeToUserProducts(user.uid, renderProductList);
  } else {
    // show auth forms
    authSection.querySelectorAll('.auth-form').forEach(f => f.classList.remove('hide'));
    document.getElementById('user-info').classList.add('hide');
    productSection.classList.add('hide');
    welcomeEl.textContent = '';
    if (unsubscribeProducts) { unsubscribeProducts(); unsubscribeProducts = null; }
    renderProductList([]);
  }
});

// small safety: expose a debug object when running locally
if (location.hostname === 'localhost') window._labelDaze = { renderLabels, renderAllergens };
