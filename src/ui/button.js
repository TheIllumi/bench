/**
 * Reusable Button Primitive
 * 
 * @param {object} options
 * @param {string} options.text - Button text label
 * @param {function} options.onClick - Click event handler
 * @param {'primary'|'secondary'|'danger'} [options.variant='secondary'] - Visual type
 * @param {string} [options.id] - Optional ID
 * @param {boolean} [options.disabled=false] - Disabled state
 * @returns {HTMLButtonElement}
 */
export function createButton({ text, onClick, variant = 'secondary', id, disabled = false }) {
  const btn = document.createElement('button');
  btn.className = `btn btn-${variant}`;
  btn.textContent = text;
  
  if (id) btn.id = id;
  if (disabled) btn.disabled = true;
  
  if (onClick) {
    btn.addEventListener('click', onClick);
  }
  
  return btn;
}
