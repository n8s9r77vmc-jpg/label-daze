// js/app.js
// Premium Label Daze - Main app wiring
import { signUp, signIn, signOut, onAuthChange } from './auth.js';
import { addProductForUser, updateProduct, deleteProduct, subscribeToUserProducts } from './products.js';
import { renderLabels } from './labels.js';
import { renderAllergens } from './allergens.js';
import { formatDateForDisplay, isoDateInputVal } from './dates.js';
import { getBrandKit, saveBrandKit, setLogoFromFile, removeLogo } from './brandkit.js';

let currentUser = null;
let unsubscribeProducts = null;
const selectedLabels = new Set();
const selectedAllergens = new Set();
let allProducts = [];
let filteredProducts = [];

// ===== DOM REFERENCES =====
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');

// Auth elements
const signUpForm = document.getElementById('sign-up-form');
const signInForm = document.getElementById('sign-in-form');
const authMessage = document.getElementById('auth-message');

// Header/User
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('welcome');
const signOutBtn = document.getElementById('sign-out');

// Navigation
const navTabs = document.querySelectorAll('.nav-tab');
const tabPanels = document.querySelectorAll('.tab-panel');

// Products tab
const productsTab = document.getElementById('products-tab');
const productList = document.getElementById('product-list');
const addProductBtn = document.getElementById('add-product-btn');
const productSearch = document.getElementById('product-search');
const categoryFilter = document.getElementById('category-filter');

// Product modal
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');
const modalCloseButtons = document.querySelectorAll('.modal-close');

// Form fields
const productName = document.getElementById('product-name');
const productCategory = document.getElementById('product-category');
const productIngredients = document.getElementById('product-ingredients');
const labelsList = document.getElementById('labels-list');
const allergensList = document.getElementById('allergens-list');
const bestBefore = document.getElementById('best-before');
const shelfLife = document.getElementById('shelf-life');
const productNotes = document.getElementById('product-notes');
const editingId = document.getElementById('editing-id');

// Batch print tab
const batchProductsContainer = document.getElementById('batch-products');
const printActions = document.getElementById('print-actions');
const printSelected = document.getElementById('print-selected');
const clearBatch = document.getElementById('clear-batch');

// Brand kit tab
const uploadLogoBtn = document.getElementById('upload-logo-btn');
const removeLogoBtn = document.getElementById('remove-logo-btn');
const logoUploadInput = document.getElementById('logo-upload');
const logoPreview = document.getElementById('logo-preview');
const logoPlaceholderText = document.getElementById('logo-placeholder-text');
const labelLogoArea = document.getElementById('label-logo-area');

// Settings tab
const settingsEmail = document.getElementById('settings-email');
const changePasswordBtn = document.getElementById('change-password-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');

// ===== AUTH FUNCTIONS =====
function showAuthMessage(msg, err = false) {
  authMessage.textContent = msg || '';
  if (err) {
    authMessage.classList.add('error');
  } else {
    authMessage.classList.remove('error');
  }
  if (msg) authMessage.classList.remove('hide'); else authMessage.classList.add('hide');
}

const signUpBtn = signUpForm.querySelector('button[type="submit"]');
const signInBtn = signInForm.querySelector('button[type="submit"]');

function setAuthLoading(loading, which) {
  const elems = [...signUpForm.querySelectorAll('input, button'), ...signInForm.querySelectorAll('input, button')];
  elems.forEach(el => el.disabled = loading);
  if (!loading) {
    signUpBtn.textContent = 'Sign Up';
    signInBtn.textContent = 'Sign In';
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

// ===== NAVIGATION =====
function switchTab(tabName) {
  navTabs.forEach(tab => tab.classList.remove('active'));
  tabPanels.forEach(panel => panel.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  document.getElementById(`${tabName}-tab`)?.classList.add('active');
}

navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.tab);
  });
});

// ===== PRODUCT MANAGEMENT =====
function resetProductForm() {
  productForm.reset();
  editingId.value = '';
  selectedLabels.clear();
  selectedAllergens.clear();
  renderLabels(labelsList, selectedLabels);
  renderAllergens(allergensList, selectedAllergens);
  modalTitle.textContent = 'Add Product';
}

function openProductModal() {
  resetProductForm();
  productModal.classList.remove('hide');
}

function closeProductModal() {
  productModal.classList.add('hide');
}

addProductBtn.addEventListener('click', openProductModal);

modalCloseButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (e.target.dataset.close === 'product-modal') {
      closeProductModal();
    }
  });
});

productModal.addEventListener('click', (e) => {
  if (e.target === productModal) {
    closeProductModal();
  }
});

renderLabels(labelsList, selectedLabels);
renderAllergens(allergensList, selectedAllergens);

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return showAuthMessage('Please sign in first', true);

  const name = productName.value.trim();
  const category = productCategory.value.trim();
  const ingredients = productIngredients.value.split(',').map(s => s.trim()).filter(Boolean);
  const notes = productNotes.value.trim();
  const bestBeforeVal = bestBefore.value || null;
  const shelfLifeVal = shelfLife.value ? parseInt(shelfLife.value, 10) : null;

  const payload = {
    name,
    category,
    ingredients,
    labels: Array.from(selectedLabels),
    allergens: Array.from(selectedAllergens),
    notes,
    bestBefore: bestBeforeVal,
    shelfLife: shelfLifeVal
  };

  const id = editingId.value;
  try {
    if (id) {
      await updateProduct(id, payload);
      showAuthMessage('Product updated');
    } else {
      await addProductForUser(currentUser.uid, payload);
      showAuthMessage('Product saved');
    }
    resetProductForm();
    closeProductModal();
  } catch (err) {
    showAuthMessage(err?.message || 'Failed to save product', true);
  }
});

function renderProductList(items) {
  allProducts = items;
  applyFiltersAndRender();
  updateCategoryFilter();
}

function applyFiltersAndRender() {
  const searchTerm = productSearch.value.toLowerCase();
  const categoryTerm = categoryFilter.value.toLowerCase();

  filteredProducts = allProducts.filter(p => {
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm) || 
                         (p.ingredients && p.ingredients.some(ing => ing.toLowerCase().includes(searchTerm)));
    const matchesCategory = !categoryTerm || (p.category && p.category.toLowerCase() === categoryTerm);
    return matchesSearch && matchesCategory;
  });

  productList.innerHTML = '';
  if (filteredProducts.length === 0) {
    productList.innerHTML = '<div class="empty-state"><p>No products found.</p></div>';
    return;
  }

  filteredProducts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const header = document.createElement('div');
    header.className = 'product-card-header';
    header.innerHTML = `
      <h3>${escapeHtml(p.name)}</h3>
      ${p.category ? `<span class="product-category">${escapeHtml(p.category)}</span>` : ''}
    `;
    card.appendChild(header);

    if (p.ingredients && p.ingredients.length > 0) {
      const meta = document.createElement('div');
      meta.className = 'product-meta';
      meta.textContent = `Ingredients: ${p.ingredients.join(', ')}`;
      card.appendChild(meta);
    }

    if ((p.allergens && p.allergens.length > 0) || (p.labels && p.labels.length > 0)) {
      const chipList = document.createElement('div');
      chipList.className = 'product-chip-list';
      
      if (p.allergens) {
        p.allergens.forEach(a => {
          const chip = document.createElement('span');
          chip.className = 'product-chip';
          chip.textContent = a;
          chipList.appendChild(chip);
        });
      }
      
      if (p.labels) {
        p.labels.forEach(l => {
          const chip = document.createElement('span');
          chip.className = 'product-chip';
          chip.textContent = l;
          chipList.appendChild(chip);
        });
      }
      
      card.appendChild(chipList);
    }

    if (p.bestBefore || p.shelfLife) {
      const bestBeforeMeta = document.createElement('div');
      bestBeforeMeta.className = 'product-meta';
      const parts = [];
      if (p.bestBefore) parts.push(`Best Before: ${formatDateForDisplay(p.bestBefore)}`);
      if (p.shelfLife) parts.push(`Shelf Life: ${p.shelfLife} days`);
      bestBeforeMeta.textContent = parts.join(' • ');
      card.appendChild(bestBeforeMeta);
    }

    if (p.notes) {
      const notesMeta = document.createElement('div');
      notesMeta.className = 'product-meta';
      notesMeta.textContent = `Notes: ${escapeHtml(p.notes)}`;
      card.appendChild(notesMeta);
    }

    const actions = document.createElement('div');
    actions.className = 'product-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      productName.value = p.name || '';
      productCategory.value = p.category || '';
      productIngredients.value = (p.ingredients || []).join(', ');
      productNotes.value = p.notes || '';
      bestBefore.value = p.bestBefore ? isoDateInputVal(p.bestBefore) : '';
      shelfLife.value = p.shelfLife || '';
      editingId.value = p.id;
      
      selectedLabels.clear();
      (p.labels || []).forEach(l => selectedLabels.add(l));
      selectedAllergens.clear();
      (p.allergens || []).forEach(a => selectedAllergens.add(a));
      
      renderLabels(labelsList, selectedLabels);
      renderAllergens(allergensList, selectedAllergens);
      
      modalTitle.textContent = 'Edit Product';
      openProductModal();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      if (!confirm('Delete this product?')) return;
      try {
        await deleteProduct(p.id);
        showAuthMessage('Product deleted');
      } catch (err) {
        showAuthMessage(err?.message || 'Failed to delete product', true);
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    card.appendChild(actions);

    productList.appendChild(card);
  });
}

productSearch.addEventListener('input', applyFiltersAndRender);
categoryFilter.addEventListener('change', applyFiltersAndRender);

function updateCategoryFilter() {
  const categories = new Set();
  allProducts.forEach(p => {
    if (p.category) categories.add(p.category);
  });
  
  const currentValue = categoryFilter.value;
  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  
  Array.from(categories).sort().forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  
  categoryFilter.value = currentValue;
}

// ===== BATCH PRINT =====
function renderBatchProducts() {
  batchProductsContainer.innerHTML = '';
  if (allProducts.length === 0) {
    batchProductsContainer.innerHTML = '<p class="info-text">No products to print.</p>';
    printActions.classList.add('hide');
    return;
  }

  let hasSelection = false;
  allProducts.forEach(p => {
    const item = document.createElement('div');
    item.className = 'batch-item';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = p.id;
    checkbox.addEventListener('change', () => {
      updatePrintActions();
    });

    const label = document.createElement('label');
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${p.name}${p.category ? ` (${p.category})` : ''}`));

    item.appendChild(checkbox);
    item.appendChild(label);
    batchProductsContainer.appendChild(item);
  });

  updatePrintActions();
}

function updatePrintActions() {
  const checkedBoxes = batchProductsContainer.querySelectorAll('input[type="checkbox"]:checked');
  if (checkedBoxes.length > 0) {
    printActions.classList.remove('hide');
  } else {
    printActions.classList.add('hide');
  }
}

printSelected.addEventListener('click', () => {
  window.print();
});

clearBatch.addEventListener('click', () => {
  batchProductsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  updatePrintActions();
});

// ===== BRAND KIT =====
function initBrandKit() {
  const kit = getBrandKit();
  if (kit.logoDataUrl) {
    const img = document.createElement('img');
    img.src = kit.logoDataUrl;
    logoPreview.innerHTML = '';
    logoPreview.appendChild(img);
    logoPlaceholderText.classList.add('hide');
    removeLogoBtn.classList.remove('hide');
    updateLabelPreview(kit.logoDataUrl);
  } else {
    logoPlaceholderText.classList.remove('hide');
    removeLogoBtn.classList.add('hide');
  }
}

function updateLabelPreview(logoDataUrl) {
  labelLogoArea.innerHTML = '';
  if (logoDataUrl) {
    const img = document.createElement('img');
    img.src = logoDataUrl;
    labelLogoArea.appendChild(img);
  }
}

logoPreview.addEventListener('click', () => {
  logoUploadInput.click();
});

uploadLogoBtn.addEventListener('click', () => {
  logoUploadInput.click();
});

logoUploadInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setLogoFromFile(file, (dataUrl) => {
      initBrandKit();
      showAuthMessage('Logo uploaded');
    });
  }
});

removeLogoBtn.addEventListener('click', () => {
  removeLogo();
  initBrandKit();
  showAuthMessage('Logo removed');
});

// ===== SETTINGS =====
function updateSettings() {
  if (currentUser) {
    settingsEmail.textContent = `Email: ${currentUser.email}`;
  }
}

changePasswordBtn.addEventListener('click', () => {
  alert('Password change is not yet implemented. Please use "Forgot password" on the sign-in screen.');
});

deleteAccountBtn.addEventListener('click', () => {
  alert('Account deletion is not yet implemented. Please contact support.');
});

// ===== AUTH STATE =====
onAuthChange(user => {
  currentUser = user;
  if (user) {
    // Hide auth forms
    document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hide'));
    userInfo.classList.remove('hide');
    appSection.classList.remove('hide');
    authSection.classList.add('hide');
    
    userEmail.textContent = `Signed in as ${user.email}`;
    showAuthMessage('');
    
    updateSettings();
    
    if (unsubscribeProducts) unsubscribeProducts();
    unsubscribeProducts = subscribeToUserProducts(user.uid, renderProductList);
    
    switchTab('products');
    initBrandKit();
  } else {
    // Show auth forms
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('hide'));
    userInfo.classList.add('hide');
    appSection.classList.add('hide');
    authSection.classList.remove('hide');
    
    userEmail.textContent = '';
    allProducts = [];
    filteredProducts = [];
    renderProductList([]);
    
    if (unsubscribeProducts) {
      unsubscribeProducts();
      unsubscribeProducts = null;
    }
  }
});

// ===== HELPERS =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Debug
if (location.hostname === 'localhost') {
  window._labelDaze = { 
    renderLabels, 
    renderAllergens,
    currentUser: () => currentUser,
    allProducts: () => allProducts
  };
}
