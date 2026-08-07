// js/brandkit.js
// Brand kit management (logo storage in localStorage)
const BRAND_KIT_KEY = 'label_daze_brand_kit';

export function getBrandKit() {
  const stored = localStorage.getItem(BRAND_KIT_KEY);
  return stored ? JSON.parse(stored) : { logoDataUrl: null };
}

export function saveBrandKit(kit) {
  localStorage.setItem(BRAND_KIT_KEY, JSON.stringify(kit));
}

export function setLogoFromFile(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const kit = getBrandKit();
    kit.logoDataUrl = dataUrl;
    saveBrandKit(kit);
    callback(dataUrl);
  };
  reader.readAsDataURL(file);
}

export function removeLogo() {
  const kit = getBrandKit();
  kit.logoDataUrl = null;
  saveBrandKit(kit);
}
