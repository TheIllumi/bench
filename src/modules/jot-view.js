import { JotStore } from '../core/jot-store.js';
import { ToastService } from '../ui/toast.js';

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

  // Support Ctrl+S / Cmd+S manual save confirmation and Tab insertion
  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      ToastService.show('Saved.', 'success');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      
      textarea.value = val.substring(0, start) + '\t' + val.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      
      // Dispatch input event to trigger auto-save
      textarea.dispatchEvent(new Event('input'));
    }
  });

  wrapper.appendChild(textarea);
  container.appendChild(wrapper);

  // Focus the editor
  requestAnimationFrame(() => {
    textarea.focus();
  });
}
