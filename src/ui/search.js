/**
 * Create a reusable Search component for views.
 * @param {object} options
 * @param {string} options.value - Current search query value
 * @param {Function} options.onInput - Input callback (receives query value)
 * @returns {HTMLElement} The wrapper element
 */
export function createSearchInput({ value = '', onInput } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'view-search-wrapper';

  const label = document.createElement('span');
  label.className = 'view-search-label';
  label.textContent = 'search';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'module-search-input';
  input.className = 'view-search-input';
  input.placeholder = 'type to filter…';
  input.autocomplete = 'off';
  input.value = value;

  if (onInput) {
    input.addEventListener('input', (e) => onInput(e.target.value));
  }

  wrapper.appendChild(label);
  wrapper.appendChild(input);

  return wrapper;
}
