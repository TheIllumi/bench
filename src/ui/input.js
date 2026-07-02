/**
 * Reusable Input Primitive
 * 
 * @param {object} options
 * @param {string} [options.placeholder=''] - Input placeholder
 * @param {string} [options.value=''] - Initial value
 * @param {function} [options.onKeyDown] - Keydown event handler
 * @param {function} [options.onBlur] - Blur event handler
 * @param {string} [options.id] - Optional ID
 * @param {string} [options.className='task-input'] - CSS class name override
 * @returns {HTMLInputElement}
 */
export function createInput({ placeholder = '', value = '', onKeyDown, onBlur, id, className = 'task-input' }) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = className;
  input.placeholder = placeholder;
  input.value = value;
  input.autocomplete = 'off';
  
  if (id) input.id = id;
  if (onKeyDown) input.addEventListener('keydown', onKeyDown);
  if (onBlur) input.addEventListener('blur', onBlur);
  
  return input;
}
