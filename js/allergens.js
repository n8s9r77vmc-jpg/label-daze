// allergens helper
export const defaultAllergens = [
  'Gluten','Peanuts','Tree nuts','Milk','Eggs','Soy','Fish','Shellfish','Sesame'
];

export function renderAllergens(container, selected = new Set()){
  container.innerHTML = '';
  defaultAllergens.forEach(a =>{
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (selected.has(a) ? ' selected':'');
    btn.textContent = a;
    btn.addEventListener('click', ()=>{
      if(selected.has(a)) selected.delete(a); else selected.add(a);
      btn.classList.toggle('selected');
    });
    container.appendChild(btn);
  });
}
