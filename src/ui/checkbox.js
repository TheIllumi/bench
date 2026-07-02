const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

/**
 * Reusable Checkbox Primitive
 * 
 * @param {object} options
 * @param {boolean} options.checked - Checked state
 * @param {function} options.onChange - Triggered when checked state toggles
 * @returns {HTMLButtonElement}
 */
export function createCheckbox({ checked, onChange }) {
  const btn = document.createElement('button');
  btn.className = `checkbox-btn ${checked ? 'checked' : ''}`;
  btn.setAttribute('role', 'checkbox');
  btn.setAttribute('aria-checked', checked ? 'true' : 'false');
  btn.setAttribute('aria-label', checked ? 'Mark active' : 'Mark complete');
  btn.innerHTML = CHECK_SVG;
  
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent card selection triggers
    if (onChange) onChange(!checked);
  });
  
  return btn;
}
