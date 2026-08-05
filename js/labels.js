// labels helper
export const defaultLabels = [
  'FRIDGE', 'FREEZER', 'PANTRY', 'OPENED', 'SEALED', 'HOMEMADE'
];

export function renderLabels(container, selected = new Set()){
  container.innerHTML = '';
  defaultLabels.forEach(l =>{
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (selected.has(l) ? ' selected':'');
    btn.textContent = l;
    btn.addEventListener('click', ()=>{
      if(selected.has(l)) selected.delete(l); else selected.add(l);
      btn.classList.toggle('selected');
    });
    container.appendChild(btn);
  });
}
