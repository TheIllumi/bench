import { JotStore } from '../core/jot-store.js';
import { ToastService } from '../ui/toast.js';
import { SettingsStore } from '../core/settings-store.js';

/**
 * Jot View Module
 * Provides a distraction-free space for free-form notes and thinking.
 */
export function renderJotView(container) {
  container.innerHTML = '';

  const settings = SettingsStore.load();

  const containerWrapper = document.createElement('div');
  containerWrapper.className = 'jot-container';

  const textarea = document.createElement('textarea');
  textarea.className = 'jot-editor';
  textarea.placeholder = 'Write down your thoughts...';
  textarea.setAttribute('aria-label', 'Jot text editor');

  // Apply Font Family configuration
  textarea.style.fontFamily = settings.jotFontFamily || 'monospace';

  // Restore saved content
  textarea.value = JotStore.loadJot();

  // Auto-save on input (if enabled)
  textarea.addEventListener('input', () => {
    if (settings.jotAutoSave) {
      JotStore.saveJot(textarea.value);
    }
  });

  // Also save on blur to protect user data from view switching loss
  textarea.addEventListener('blur', () => {
    JotStore.saveJot(textarea.value);
  });

  // Support Ctrl+S / Cmd+S manual save confirmation and Tab insertion
  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      JotStore.saveJot(textarea.value);
      ToastService.show('Saved.', 'success');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      
      let tabChar = '\t';
      if (settings.jotTabSize === '2') {
        tabChar = '  ';
      } else if (settings.jotTabSize === '4') {
        tabChar = '    ';
      }

      textarea.value = val.substring(0, start) + tabChar + val.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + tabChar.length;
      
      // Dispatch input event to trigger auto-save (if enabled)
      textarea.dispatchEvent(new Event('input'));
    }
  });

  if (settings.jotShowLineNumbers) {
    const editorWrapper = document.createElement('div');
    editorWrapper.className = 'jot-editor-wrapper';

    const gutter = document.createElement('div');
    gutter.className = 'jot-gutter';
    gutter.setAttribute('aria-hidden', 'true');
    gutter.style.fontFamily = settings.jotFontFamily || 'monospace';

    const updateLineNumbers = () => {
      const lineCount = textarea.value.split('\n').length;
      const lines = [];
      for (let i = 1; i <= lineCount; i++) {
        lines.push(i);
      }
      gutter.textContent = lines.join('\n');
    };

    textarea.addEventListener('input', updateLineNumbers);
    textarea.addEventListener('scroll', () => {
      gutter.scrollTop = textarea.scrollTop;
    });

    // Populate initial lines
    updateLineNumbers();

    editorWrapper.appendChild(gutter);
    editorWrapper.appendChild(textarea);
    containerWrapper.appendChild(editorWrapper);
  } else {
    containerWrapper.appendChild(textarea);
  }

  container.appendChild(containerWrapper);

  // Focus the editor
  requestAnimationFrame(() => {
    textarea.focus();
  });
}
