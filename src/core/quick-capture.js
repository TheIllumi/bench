import { Repository } from './repository.js';
import { ToastService } from '../ui/toast.js';
import { SettingsStore } from './settings-store.js';

let isOpen = false;
let modalEl = null;

/**
 * QuickCapture controller.
 * Spawns a TUI command prompt modal to capture thoughts instantly
 * from anywhere in the application.
 */
export const QuickCapture = {
  open(defaultAreaId = undefined) {
    if (isOpen) return;
    isOpen = true;

    const portal = document.getElementById('overlay-portal');
    if (!portal) return;

    modalEl = document.createElement('div');
    modalEl.className = 'modal-backdrop';

    const frame = document.createElement('div');
    frame.className = 'capture-modal-frame';
    frame.innerHTML = `
      <div class="capture-prompt-label">capture idea:</div>
      <div class="capture-input-line">
        <span class="capture-cursor-symbol">></span>
        <input type="text" id="capture-input-field" class="capture-input-field" placeholder="..." autocomplete="off" />
      </div>
    `;

    modalEl.appendChild(frame);
    portal.appendChild(modalEl);

    const input = frame.querySelector('#capture-input-field');
    
    // Smooth transition
    requestAnimationFrame(() => {
      modalEl.classList.add('fade-in');
      input.focus();
    });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const value = input.value.trim();
        if (value) {
          const settings = SettingsStore.load();
          const fallbackAreaId = settings.defaultArea && settings.defaultArea !== 'none' ? settings.defaultArea : '';
          Repository.save({
            title: value,
            status: 'active',
            module: 'capture',
            areaId: defaultAreaId !== undefined ? defaultAreaId : fallbackAreaId
          });
          ToastService.show('Captured.', 'success');
        }
        this.close();
      }
    };

    input.addEventListener('keydown', handleKeyDown);

    // Close on backdrop click
    modalEl.addEventListener('mousedown', (e) => {
      if (e.target === modalEl) {
        this.close();
      }
    });
  },

  close() {
    if (!isOpen || !modalEl) return;
    isOpen = false;

    modalEl.classList.remove('fade-in');
    const el = modalEl;
    modalEl = null;

    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 150);
  }
};
