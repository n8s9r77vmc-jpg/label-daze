// date helpers
export function formatDateForDisplay(d){
  if(!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  return dt.toLocaleDateString();
}

export function isoDateInputVal(d){
  if(!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth()+1).padStart(2,'0');
  const dd = String(dt.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}
