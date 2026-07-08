import { JotStore } from '../core/jot-store.js';

/**
 * Jot View Module
 * Provides a distraction-free space for free-form notes and thinking.
 */
export function renderJotView(container) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'jot-container';

  const textarea = document.createElement('textarea');
  textarea.className = 'jot-editor';
  textarea.placeholder = 'Write down your thoughts...';
  textarea.setAttribute('aria-label', 'Jot text editor');

  // Restore saved content
  textarea.value = JotStore.loadJot();

  // Auto-save on input
  textarea.addEventListener('input', () => {
    JotStore.saveJot(textarea.value);
  });

  wrapper.appendChild(textarea);
  container.appendChild(wrapper);

  // Focus the editor
  requestAnimationFrame(() => {
    textarea.focus();
  });
}
